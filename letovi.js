/* =====================================================================
   Putuj jeftino — pretraga najjeftinijih termina letova
   ---------------------------------------------------------------------
   Pokreće se automatski na GitHub-u svakog dana (vidi
   .github/workflows/deploy.yml). Ovaj fajl ne moraš da menjaš.

   Šta radi:
     1. Za svaku destinaciju iz ponude.js koja ima "iata" kod u
        destinacije.js traži povratne letove iz Beograda (Wizz Air i
        Air Serbia) sa polaskom u narednih 45 dana, samo DIREKTNE letove
        (bez presedanja, u oba pravca), sa onoliko noćenja koliko piše
        u ponudi ± 1 noć (zbog jeftinijih i brojnijih termina).
     2. Bira 5 najjeftinijih termina za svaku destinaciju.
     3. Upisuje ih u _letovi/termini.json (build.js ih prikazuje na
        stranicama destinacija, BEZ cena) i pravi _letovi/izvestaj.html
        (mejl sa cenama).

   Cene dolaze iz Travelpayouts (Aviasales) API-ja. To su cene iz
   skorašnjih pretraga, pa su okvirne — proveri ih pre rezervacije.

   Potrebno: GitHub secret TRAVELPAYOUTS_TOKEN.
   Lokalno:  TRAVELPAYOUTS_TOKEN=... node letovi.js
   ===================================================================== */

'use strict';

var fs = require('fs');
var path = require('path');
var vm = require('vm');

var KOREN = __dirname;
var IZLAZ = path.join(KOREN, '_letovi');
var POLAZISTE = 'BEG';
var DANA_UNAPRED = 45;
var BROJ_TERMINA = 5;
var ODSTUPANJE_NOCI = 1; // traže se i termini sa jednim noćenjem manje ili više
var MIN_NOCI = 2;        // ali nikad kraće od 2 noćenja
// Wizz Air (W6, i njegove podružnice W4 i W9) i Air Serbia (JU)
var AVIOKOMPANIJE = { W6: 'Wizz Air', W4: 'Wizz Air', W9: 'Wizz Air', JU: 'Air Serbia' };
var API = 'https://api.travelpayouts.com/aviasales/v3/prices_for_dates';

/* ---------- Učitavanje podataka ---------- */
function ucitaj(fajl) {
  var okruzenje = { window: {} };
  vm.runInNewContext(fs.readFileSync(path.join(KOREN, fajl), 'utf8'), okruzenje, { filename: fajl });
  return okruzenje.window;
}

var PONUDE = ucitaj('ponude.js').PONUDE || [];
var DESTINACIJE = ucitaj('destinacije.js').DESTINACIJE || {};

// "Barselona" -> "barselona" (isto kao u build.js)
function slug(tekst) {
  var mapa = { 'č': 'c', 'ć': 'c', 'š': 's', 'ž': 'z', 'đ': 'dj' };
  return String(tekst).toLowerCase()
    .replace(/[čćšžđ]/g, function (z) { return mapa[z]; })
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

/* ---------- Datumi ---------- */
function isoDatum(d) { return d.toISOString().slice(0, 10); }
function dodajDane(iso, n) { var d = new Date(iso + 'T00:00:00Z'); d.setUTCDate(d.getUTCDate() + n); return isoDatum(d); }
function razlikaDana(a, b) { return Math.round((new Date(b + 'T00:00:00Z') - new Date(a + 'T00:00:00Z')) / 86400000); }
function mesec(iso) { return iso.slice(0, 7); }

/* ---------- Spisak destinacija za pretragu ---------- */
function destinacijeZaPretragu() {
  var vidjeno = {};
  var lista = [];
  PONUDE.forEach(function (p) {
    var k = slug(p.destinacija);
    var tekst = DESTINACIJE[k] || {};
    // Preskaču se autobuske i novogodišnje ponude (one imaju fiksne datume)
    if (vidjeno[k] || p.prevoz === 'autobus' || p.kategorija === 'novagodina' || !tekst.iata) return;
    var noci = parseInt(p.trajanje, 10);
    if (!noci) return;
    vidjeno[k] = true;
    lista.push({ slug: k, naziv: p.destinacija, iata: tekst.iata, noci: noci });
  });
  return lista;
}

/* ---------- Pretraga ---------- */
// Jedan upit ka Travelpayouts-u: povratne karte (povratak zadat) ili jednosmerne (bez povratka)
function preuzmi(od, ka, mesecPolaska, mesecPovratka, token) {
  var parametri = {
    origin: od,
    destination: ka,
    departure_at: mesecPolaska,
    one_way: mesecPovratka ? 'false' : 'true',
    direct: 'true',
    currency: 'eur',
    sorting: 'price',
    unique: 'false',
    limit: '1000'
  };
  if (mesecPovratka) parametri.return_at = mesecPovratka;
  return fetch(API + '?' + new URLSearchParams(parametri), { headers: { 'X-Access-Token': token, 'Accept-Encoding': 'gzip' } })
    .then(function (odg) {
      if (!odg.ok) throw new Error('HTTP ' + odg.status);
      return odg.json();
    })
    .then(function (podaci) {
      if (!podaci.success) throw new Error(podaci.error || 'neuspešan odgovor');
      return podaci.data || [];
    });
}

function uzastopno(zadaci) {
  return zadaci.reduce(function (lanac, zadatak) {
    return lanac.then(function (sve) { return zadatak().then(function (r) { return sve.concat(r); }); });
  }, Promise.resolve([]));
}

function link(r) { return r.link ? 'https://www.aviasales.com' + r.link : ''; }

// Najjeftiniji direktan jednosmerni let za svaki datum, posebno za svaku aviokompaniju
// (dani["2026-12-09"]["Wizz Air"] = { cena, link, ruta })
function poDanima(redovi) {
  var dani = {};
  redovi.forEach(function (r) {
    var kompanija = AVIOKOMPANIJE[r.airline];
    if (!kompanija || !r.departure_at || r.transfers) return;
    var dan = r.departure_at.slice(0, 10);
    dani[dan] = dani[dan] || {};
    if (!dani[dan][kompanija] || r.price < dani[dan][kompanija].cena) {
      dani[dan][kompanija] = { cena: r.price, aviokompanija: kompanija, link: link(r), ruta: (r.origin_airport || r.origin) + '→' + (r.destination_airport || r.destination) };
    }
  });
  return dani;
}

function terminiZaDestinaciju(d, token, danas) {
  var prviPolazak = dodajDane(danas, 1);
  var poslednjiPolazak = dodajDane(danas, DANA_UNAPRED);
  var minNoci = Math.max(MIN_NOCI, d.noci - ODSTUPANJE_NOCI);
  var maxNoci = d.noci + ODSTUPANJE_NOCI;

  // Meseci koji pokrivaju polaske i povratke u periodu
  var meseciPolaska = {}, meseciPovratka = {}, kombinacije = {};
  for (var i = 1; i <= DANA_UNAPRED; i++) {
    var pol = dodajDane(danas, i);
    meseciPolaska[mesec(pol)] = true;
    for (var n = minNoci; n <= maxNoci; n++) {
      meseciPovratka[mesec(dodajDane(pol, n))] = true;
      kombinacije[mesec(pol) + '|' + mesec(dodajDane(pol, n))] = true;
    }
  }

  // 1) Jednosmerne karte u oba smera (Wizz Air prodaje odlazak i povratak odvojeno) i 2) povratne karte
  var odlasci = uzastopno(Object.keys(meseciPolaska).map(function (m) { return function () { return preuzmi(POLAZISTE, d.iata, m, null, token); }; }));
  var povratci = function () { return uzastopno(Object.keys(meseciPovratka).map(function (m) { return function () { return preuzmi(d.iata, POLAZISTE, m, null, token); }; })); };
  var povratne = function () { return uzastopno(Object.keys(kombinacije).map(function (k) { var x = k.split('|'); return function () { return preuzmi(POLAZISTE, d.iata, x[0], x[1], token); }; })); };

  var tamo, nazad;
  return odlasci
    .then(function (r) { tamo = poDanima(r); return povratci(); })
    .then(function (r) { nazad = poDanima(r); return povratne(); })
    .then(function (redovi) {
      var najbolji = {};
      function predlozi(t) {
        if (t.polazak < prviPolazak || t.polazak > poslednjiPolazak) return;
        if (t.noci < minNoci || t.noci > maxNoci) return;
        // Po jedan (najjeftiniji) termin za svaki datum polaska; pri istoj ceni prednost ima tačan broj noćenja
        var stari = najbolji[t.polazak];
        if (!stari || t.cena < stari.cena || (t.cena === stari.cena && t.noci === d.noci)) najbolji[t.polazak] = t;
      }

      // Odlazak + povratak kao dve jednosmerne karte, uvek sa ISTOM aviokompanijom
      Object.keys(tamo).forEach(function (polazak) {
        for (var n = minNoci; n <= maxNoci; n++) {
          var povratak = dodajDane(polazak, n);
          Object.keys(tamo[polazak]).forEach(function (kompanija) {
          var a = tamo[polazak][kompanija], b = (nazad[povratak] || {})[kompanija];
          if (!b) return;
          predlozi({
            polazak: polazak, povratak: povratak, noci: n, cena: a.cena + b.cena,
            aviokompanija: kompanija,
            detalji: 'odlazak ' + a.aviokompanija + ' ' + a.ruta + ' ' + a.cena + ' €, povratak ' + b.aviokompanija + ' ' + b.ruta + ' ' + b.cena + ' €',
            link: a.link, linkPovratak: b.link
          });
          });
        }
      });

      // Povratne karte (ponekad jeftinije, npr. kod Air Serbia)
      redovi.forEach(function (r) {
        if (!AVIOKOMPANIJE[r.airline] || !r.departure_at || !r.return_at) return;
        if (r.transfers || r.return_transfers) return; // samo direktni letovi, u oba pravca
        var polazak = r.departure_at.slice(0, 10), povratak = r.return_at.slice(0, 10);
        predlozi({
          polazak: polazak, povratak: povratak, noci: razlikaDana(polazak, povratak), cena: r.price,
          aviokompanija: AVIOKOMPANIJE[r.airline], detalji: 'povratna karta ' + (r.origin_airport || r.origin) + '⇄' + (r.destination_airport || r.destination), link: link(r)
        });
      });

      return Object.keys(najbolji).map(function (k) { return najbolji[k]; })
        .sort(function (a, b) { return a.cena - b.cena; })
        .slice(0, BROJ_TERMINA)
        .sort(function (a, b) { return a.polazak < b.polazak ? -1 : 1; });
    });
}

/* ---------- Izveštaj za mejl ---------- */
var MESECI = ['jan', 'feb', 'mar', 'apr', 'maj', 'jun', 'jul', 'avg', 'sep', 'okt', 'nov', 'dec'];
function lepDatum(iso) { var d = iso.split('-'); return +d[2] + '. ' + MESECI[+d[1] - 1] + ' ' + d[0] + '.'; }
function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }

function izvestaj(rezultati, danas) {
  var redovi = rezultati.map(function (r) {
    var naslov = '<h2 style="margin:28px 0 8px;font:600 18px Georgia,serif;color:#0A1F3C">' + esc(r.naziv) +
      ' <span style="font:400 13px Arial,sans-serif;color:#5D6E86">(' + r.noci + ' ± 1 noćenja, ' + esc(r.iata) + ')</span></h2>';
    if (r.greska) return naslov + '<p style="color:#C0392B;font:14px Arial,sans-serif">Greška pri pretrazi: ' + esc(r.greska) + '</p>';
    if (!r.termini.length) return naslov + '<p style="color:#5D6E86;font:14px Arial,sans-serif">Nema pronađenih direktnih letova Wizz Air / Air Serbia za ovaj broj noćenja (± 1) u narednih ' + DANA_UNAPRED + ' dana.</p>';
    return naslov + '<table cellpadding="6" style="border-collapse:collapse;font:14px Arial,sans-serif;color:#33445C">' +
      '<tr style="background:#F4F8FB;text-align:left"><th>Polazak</th><th>Povratak</th><th>Noćenja</th><th>Cena (odlazak + povratak)</th><th>Aviokompanija</th><th></th></tr>' +
      r.termini.map(function (t) {
        return '<tr style="border-top:1px solid #E2E8F0"><td>' + lepDatum(t.polazak) + '</td><td>' + lepDatum(t.povratak) + '</td><td>' + t.noci + '</td>' +
          '<td><b>' + t.cena + ' €</b>' + (t.detalji ? '<br><small style="color:#5D6E86">' + esc(t.detalji) + '</small>' : '') + '</td><td>' + esc(t.aviokompanija) + '</td>' +
          '<td>' + (t.link ? '<a href="' + esc(t.link) + '">' + (t.linkPovratak ? 'odlazak' : 'pogledaj') + '</a>' : '') + (t.linkPovratak ? ' · <a href="' + esc(t.linkPovratak) + '">povratak</a>' : '') + '</td></tr>';
      }).join('') + '</table>';
  }).join('');
  return '<!doctype html><html><body style="margin:0;padding:24px;background:#fff">' +
    '<h1 style="margin:0 0 6px;font:600 22px Georgia,serif;color:#0A1F3C">Najjeftiniji termini letova — ' + lepDatum(danas) + '</h1>' +
    '<p style="margin:0;font:14px Arial,sans-serif;color:#5D6E86">Direktni povratni letovi iz Beograda (Wizz Air i Air Serbia), bez presedanja, polazak u narednih ' + DANA_UNAPRED +
    ' dana. Cena je zbir odlaska i povratka (ili povratna karta, ako je jeftinija), po osobi, iz skorašnjih pretraga, pa su okvirne — proveri ih pre rezervacije. Na sajtu su prikazani samo datumi.</p>' +
    redovi + '</body></html>';
}

/* ---------- Pokretanje ---------- */
function main() {
  var token = process.env.TRAVELPAYOUTS_TOKEN;
  if (!token) { console.error('Nedostaje TRAVELPAYOUTS_TOKEN.'); process.exit(1); }
  var danas = isoDatum(new Date());
  var lista = destinacijeZaPretragu();

  return lista.reduce(function (lanac, d) {
    return lanac.then(function (rezultati) {
      return terminiZaDestinaciju(d, token, danas)
        .then(function (termini) { console.log(d.naziv + ': ' + termini.length + ' termina'); return { termini: termini }; })
        .catch(function (e) { console.log(d.naziv + ': greška — ' + e.message); return { termini: [], greska: e.message }; })
        .then(function (r) { return rezultati.concat([Object.assign({}, d, r)]); });
    });
  }, Promise.resolve([])).then(function (rezultati) {
    fs.mkdirSync(IZLAZ, { recursive: true });
    var termini = { generisano: danas, destinacije: {} };
    rezultati.forEach(function (r) { if (r.termini.length) termini.destinacije[r.slug] = r.termini; });
    fs.writeFileSync(path.join(IZLAZ, 'termini.json'), JSON.stringify(termini, null, 1));
    fs.writeFileSync(path.join(IZLAZ, 'izvestaj.html'), izvestaj(rezultati, danas));
    if (rezultati.every(function (r) { return r.greska; })) { console.error('Pretraga nije uspela ni za jednu destinaciju.'); process.exit(1); }
  });
}

if (require.main === module) {
  main().catch(function (e) { console.error(e); process.exit(1); });
}

module.exports = { terminiZaDestinaciju: terminiZaDestinaciju, izvestaj: izvestaj, destinacijeZaPretragu: destinacijeZaPretragu };
