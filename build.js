/* =====================================================================
   Putuj jeftino — priprema sajta za objavu
   ---------------------------------------------------------------------
   Pokreće se automatski na GitHub-u pri svakoj objavi (vidi
   .github/workflows/deploy.yml). Ovaj fajl ne moraš da menjaš.

   Šta radi:
     1. Kopira sajt u folder _site.
     2. Za svaku destinaciju pravi posebnu stranicu (npr. /rim), sa
        cenama i datumima iz ponude.js i tekstovima iz destinacije.js.
     3. Pravi sitemap.xml sa svim stranicama.

   Lokalno: node build.js            (napravi _site)
            node build.js --index    (osveži listu destinacija u index.html)
   ===================================================================== */

'use strict';

var fs = require('fs');
var path = require('path');
var vm = require('vm');

var KOREN = __dirname;
var IZLAZ = path.join(KOREN, '_site');
var SAJT = 'https://putujjeftino.rs';

/* ---------- Učitavanje podataka ---------- */
function ucitaj(fajl) {
  var okruzenje = { window: {} };
  vm.runInNewContext(fs.readFileSync(path.join(KOREN, fajl), 'utf8'), okruzenje, { filename: fajl });
  return okruzenje.window;
}

var PODESAVANJA = ucitaj('podesavanja.js').PODESAVANJA || {};
var podaciPonuda = ucitaj('ponude.js');
var PONUDE = podaciPonuda.PONUDE || [];
var KATEGORIJE = podaciPonuda.KATEGORIJE || {};
var DESTINACIJE = ucitaj('destinacije.js').DESTINACIJE || {};

/* ---------- Pomoćne funkcije ---------- */
function esc(str) {
  return String(str == null ? '' : str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// "Barselona" -> "barselona", "Nova Godina" -> "nova-godina" (isto kao u script.js)
function slug(tekst) {
  var mapa = { 'č': 'c', 'ć': 'c', 'š': 's', 'ž': 'z', 'đ': 'dj' };
  return String(tekst).toLowerCase()
    .replace(/[čćšžđ]/g, function (z) { return mapa[z]; })
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

// Sniženje se prikazuje ako je stara cena bar 20 € veća od nove (isto kao u script.js)
function popust(p) {
  var razlika = (Number(p.staraCena) || 0) - p.cena;
  return razlika >= 20 ? razlika : 0;
}

function formatCena(cena) {
  return String(cena).replace(/\B(?=(\d{3})+(?!\d))/g, '.') + ' €';
}

function whatsappUrl(poruka) {
  var broj = String(PODESAVANJA.whatsappBroj || '').replace(/\D/g, '');
  return 'https://wa.me/' + broj + (poruka ? '?text=' + encodeURIComponent(poruka) : '');
}

function malo(tekst) { return tekst.charAt(0).toLowerCase() + tekst.slice(1); }

// ["Povratna avio karta", "Smeštaj 3 noćenja", "Doručak"] -> "povratna avio karta iz Beograda, smeštaj za 3 noćenja i doručak"
function spisakUkljuceno(lista) {
  var delovi = (lista || []).map(function (s) {
    var t = malo(s);
    if (/avio karta/.test(t) && !/beograd/i.test(t)) t += ' iz Beograda';
    return t.replace(/^smeštaj (\d)/, 'smeštaj za $1');
  });
  if (delovi.length < 2) return delovi.join('');
  return delovi.slice(0, -1).join(', ') + ' i ' + delovi[delovi.length - 1];
}

function sredi(html) { return html.replace(/\n\s*\n/g, '\n'); }

/* ---------- Spisak destinacija ---------- */
function napraviDestinacije() {
  var mapa = {};
  var redosled = [];
  PONUDE.forEach(function (p) {
    var k = slug(p.destinacija);
    if (!mapa[k]) { mapa[k] = { slug: k, naziv: p.destinacija, drzava: p.drzava, slika: p.slika, kategorija: p.kategorija, ponude: [] }; redosled.push(k); }
    mapa[k].ponude.push(p);
  });
  // Destinacije bez trenutne ponude i dalje dobijaju stranicu (da link ne bi prestao da radi)
  Object.keys(DESTINACIJE).forEach(function (k) {
    var d = DESTINACIJE[k];
    if (!mapa[k] && d.naziv && d.slika) {
      mapa[k] = { slug: k, naziv: d.naziv, drzava: d.drzava || '', slika: d.slika, kategorija: '', ponude: [] };
      redosled.push(k);
    }
  });
  return redosled.map(function (k) {
    var d = mapa[k];
    d.tekst = DESTINACIJE[k] || {};
    d.u = d.tekst.u || '';
    d.lokativ = d.tekst.lokativ || '';
    var najjeftinija = d.ponude.slice().sort(function (a, b) { return a.cena - b.cena; })[0];
    d.najniza = najjeftinija ? najjeftinija.cena : null;
    d.popust = najjeftinija ? popust(najjeftinija) : 0;
    d.staraCena = d.popust ? najjeftinija.staraCena : null;
    return d;
  });
}

/* ---------- Delovi preuzeti iz index.html ---------- */
var INDEX = fs.readFileSync(path.join(KOREN, 'index.html'), 'utf8');

function izvuci(regex, ime) {
  var m = INDEX.match(regex);
  if (!m) throw new Error('U index.html nije pronađen deo: ' + ime);
  return m[0];
}

function zaPodstranicu(html) {
  return html
    .replace(/href="#pocetna"(\s+aria-label="Putuj jeftino — početna")/g, 'href="/"$1')
    .replace(/class="btn btn-outline-light btn-sm to-top" href="#pocetna"/, 'class="btn btn-outline-light btn-sm to-top" href="#vrh"')
    .replace(/(<a\b[^>]*?\shref=")#(?!vrh")/g, '$1/#');
}

var IKONICE = izvuci(/<svg width="0" height="0"[\s\S]*?<\/svg>/, 'ikonice');
var ZAGLAVLJE = zaPodstranicu(izvuci(/<header class="site-header"[\s\S]*?<\/header>/, 'zaglavlje'));
var PODNOZJE = zaPodstranicu(izvuci(/<footer class="site-footer">[\s\S]*?<\/footer>/, 'podnožje'));
var WA_DUGME = izvuci(/<a class="wa-fab"[\s\S]*?<\/a>/, 'WhatsApp dugme');
var FONTOVI = izvuci(/<link href="https:\/\/fonts\.googleapis\.com\/css2[^>]*>/, 'fontovi');

/* ---------- Lista destinacija u podnožju ---------- */
function listaDestinacija(dest) {
  return dest.map(function (d) {
    return '          <li><a href="/' + d.slug + '">' + esc(d.naziv) + '</a></li>';
  }).join('\n');
}

function ubaciListu(html, dest) {
  var re = /<!-- destinacije -->[\s\S]*?<!-- \/destinacije -->/;
  if (!re.test(html)) throw new Error('U index.html nedostaje oznaka <!-- destinacije -->');
  return html.replace(re, function () {
    return '<!-- destinacije -->\n' + listaDestinacija(dest) + '\n        <!-- /destinacije -->';
  });
}

/* ---------- Stranica destinacije ---------- */
function stranica(d, sveDest) {
  var t = d.tekst;
  var url = SAJT + '/' + d.slug;
  var slikaUrl = SAJT + '/' + d.slika;
  var imaPonudu = d.ponude.length > 0;
  var prva = d.ponude[0];
  var lok = d.lokativ || 'na destinaciji';
  var kat = KATEGORIJE[d.kategorija] || '';
  var imaDorucak = d.ponude.some(function (p) { return p.dorucak; });
  var jeNovo = d.ponude.some(function (p) { return p.novo; });
  var avio = imaPonudu ? (prva.avioKompanija || '') : '';

  var h1 = d.u
    ? 'Jeftina putovanja <em>' + esc(d.u) + '</em> iz Beograda'
    : esc(d.naziv) + ' — <em>jeftino putovanje</em> iz Beograda';
  var h1Tekst = h1.replace(/<[^>]+>/g, '');

  var naslov = (d.u ? 'Jeftina putovanja ' + d.u + ' iz Beograda' : d.naziv + ' — jeftino putovanje iz Beograda') +
    (imaPonudu ? ' – od ' + formatCena(d.najniza) : '') + ' | Putuj jeftino';

  var opis = imaPonudu
    ? 'Jeftino putovanje ' + (d.u || 'za ' + d.naziv) + ': povratni let ' + (avio ? avio + ' ' : '') + 'iz Beograda i smeštaj za ' + prva.trajanje +
      (imaDorucak ? ' sa doručkom' : '') + ', od ' + formatCena(d.najniza) + ' po osobi' + (d.popust ? ' (sniženo sa ' + formatCena(d.staraCena) + ')' : '') + ' za dve ili više osoba. Uz ponudu dobijaš PDF vodič i uputstvo za transfer.'
    : 'Jeftina putovanja ' + (d.u || 'za ' + d.naziv) + ' iz Beograda: let i smeštaj po povoljnoj ceni, uz PDF vodič šta posetiti i uputstvo za transfer do hotela.';

  var waPoruka = imaPonudu
    ? 'Zdravo! Zanima me ponuda: ' + d.naziv + ' (' + prva.datum + '). Možete li mi poslati više informacija?\n\nBroj osoba: '
    : 'Zdravo! Zanima me putovanje: ' + d.naziv + '. Imate li neku ponudu?\n\nBroj osoba: ';

  /* --- Kutija sa ponudom --- */
  var kutije = imaPonudu ? d.ponude.map(function (p) {
    var stavke = (p.ukljuceno || []).map(function (s) {
      if (/avio karta/i.test(s) && !/beograd/i.test(s)) s += ' iz Beograda';
      return '<li><svg aria-hidden="true"><use href="#i-check"/></svg><span>' + esc(s) + '</span></li>';
    }).join('');
    stavke += '<li><svg aria-hidden="true"><use href="#i-check"/></svg><span>PDF vodič: šta posetiti i transfer do hotela</span></li>';
    return '' +
      '<div class="dest-offer">' +
        '<p class="offer-country">Ponuda' + (p.primer ? ' · primer' : '') + (p.novo ? ' <span class="dest-new">Novo</span>' : '') + '</p>' +
        '<h2 class="dest-offer-title">' + esc(d.naziv) + (p.trajanje ? ', ' + esc(p.trajanje) : '') + '</h2>' +
        '<ul class="offer-meta">' +
          '<li><svg aria-hidden="true"><use href="#i-calendar"/></svg><span class="visually-hidden">Datum: </span>' + esc(p.datum) + '</li>' +
          (p.trajanje ? '<li><svg aria-hidden="true"><use href="#i-moon"/></svg>' + esc(p.trajanje) + '</li>' : '') +
          (p.dorucak ? '<li class="meta-dorucak"><svg aria-hidden="true"><use href="#i-cup"/></svg>sa doručkom</li>' : '') +
        '</ul>' +
        '<ul class="dialog-list">' + stavke + '</ul>' +
        '<div class="offer-price' + (popust(p) ? ' is-sale' : '') + '"><span>već od' + (popust(p) ? ' <s>' + esc(formatCena(p.staraCena)) + '</s>' : '') + '</span><strong>' + esc(formatCena(p.cena)) + '</strong><small>po osobi*</small></div>' +
        (popust(p) ? '<p class="dest-sale-note">Sniženo za ' + esc(formatCena(popust(p))) + '</p>' : '') +
        '<p class="dest-note">* Cena važi kada putuju dve ili više osoba.</p>' +
        (p.primer ? '<p class="dest-note">Ovo je primer ponude za prikaz izgleda sajta, a ne aktivna ponuda.</p>' : '') +
      '</div>';
  }).join('') : '' +
    '<div class="dest-offer">' +
      '<p class="offer-country">Ponuda</p>' +
      '<h2 class="dest-offer-title">' + esc(d.naziv) + '</h2>' +
      '<p class="dest-offer-empty">Trenutno nemamo aktivnu ponudu za ovu destinaciju. Pošalji upit i javićemo ti čim pronađemo povoljan let i smeštaj.</p>' +
    '</div>';

  var akcije = '' +
    '<div class="dest-offer-actions">' +
      '<a class="btn btn-wa btn-block" href="' + esc(whatsappUrl(waPoruka)) + '" target="_blank" rel="noopener"><svg aria-hidden="true"><use href="#i-whatsapp"/></svg> Pošalji upit na WhatsApp</a>' +
      '<a class="btn btn-ghost btn-block" href="/#kontakt">Pošalji upit preko forme</a>' +
    '</div>' +
    '<p class="dest-offer-phone">ili pozovi <a href="tel:' + esc(String(PODESAVANJA.telefonZaPoziv || '').replace(/\s/g, '')) + '">' + esc(PODESAVANJA.telefonPrikaz || '') + '</a></p>';

  /* --- Sadržaj --- */
  var uvod = (t.uvod && t.uvod.length)
    ? t.uvod.map(function (pas, i) { return '<p' + (i === 0 ? ' class="lead"' : '') + '>' + esc(pas) + '</p>'; }).join('')
    : '<p class="lead">' + esc(imaPonudu ? (prva.detalji || prva.opis) : 'Pošalji upit i pronaći ćemo ti povoljan let iz Beograda i smeštaj.') + '</p>';

  var prednosti = '' +
    '<ul class="dest-features">' +
      '<li><h3><svg aria-hidden="true"><use href="#i-plane"/></svg>Let iz Beograda</h3><p>Polazak je sa beogradskog aerodroma „Nikola Tesla“' + (avio ? ', let je sa ' + esc(avio) : '') + ', a povratna avio karta je uključena u cenu.</p></li>' +
      '<li><h3><svg aria-hidden="true"><use href="#i-moon"/></svg>Smeštaj' + (imaPonudu && prva.trajanje ? ' ' + esc(prva.trajanje) : '') + '</h3><p>Smeštaj za ceo boravak ' + esc(lok) + ' je uključen u cenu' + (imaDorucak ? ', zajedno sa doručkom' : '') + '.</p></li>' +
      '<li><h3><svg aria-hidden="true"><use href="#i-info"/></svg>PDF vodič</h3><p>Dobijaš PDF fajl sa preporukama šta da posetiš, gde da prošetaš i šta da probaš ' + esc(lok) + '.</p></li>' +
      '<li><h3><svg aria-hidden="true"><use href="#i-arrow"/></svg>Uputstvo za transfer</h3><p>U istom PDF-u je i uputstvo kako da stigneš od aerodroma do hotela i nazad, korak po korak.</p></li>' +
    '</ul>';

  var cenaTekst = imaPonudu
    ? '<p>Cena ovog putovanja je od <strong>' + esc(formatCena(d.najniza)) + ' po osobi</strong>' + (d.popust ? ' — sniženo sa ' + esc(formatCena(d.staraCena)) : '') + '. U cenu je uključeno: ' + esc(spisakUkljuceno(prva.ukljuceno)) + '.' +
        (d.ponude.length > 1 ? ' Termini i cene svih ponuda su navedeni u pregledu ponude.' : ' Termin putovanja je ' + esc(prva.datum) + '.') + '</p>' +
      '<p><strong>Ova cena važi kada putuju dve ili više osoba</strong> — na primer par, prijatelji ili porodica. Ako putuješ sam ili sama, javi nam se i proverićemo cenu za jednu osobu.</p>' +
      '<p>Cene letova i smeštaja se menjaju, pa se konačna cena i uslovi uvek potvrđuju pri upitu, pre rezervacije.</p>'
    : '<p>Trenutno nemamo aktivnu ponudu za ovu destinaciju, ali se cene letova i smeštaja stalno menjaju. Pošalji nam upit sa okvirnim terminom i proverićemo šta trenutno može da se nađe. Cene koje objavljujemo važe kada putuju dve ili više osoba.</p>';

  var znamenitosti = (t.znamenitosti && t.znamenitosti.length) ? '' +
    '<section aria-labelledby="sta-posetiti">' +
      '<h2 id="sta-posetiti">Šta posetiti ' + esc(lok) + '</h2>' +
      '<p>Ovo su mesta koja ne bi trebalo da propustiš. Detaljnije preporuke, sa savetima kako da najbolje rasporediš dane, dobijaš u PDF vodiču uz ponudu.</p>' +
      '<ol class="dest-sights">' + t.znamenitosti.map(function (z) {
        return '<li><h3>' + esc(z.naziv) + '</h3><p>' + esc(z.opis) + '</p></li>';
      }).join('') + '</ol>' +
    '</section>' : '';

  var transfer = (t.transfer && t.transfer.length) ? '' +
    '<section aria-labelledby="transfer">' +
      '<h2 id="transfer">Kako do hotela sa aerodroma</h2>' +
      t.transfer.map(function (pas) { return '<p>' + esc(pas) + '</p>'; }).join('') +
    '</section>' : '';

  var saveti = (t.saveti && t.saveti.length) ? '' +
    '<section aria-labelledby="saveti">' +
      '<h2 id="saveti">Korisni saveti za putovanje ' + esc(d.u || '') + '</h2>' +
      '<ul class="dialog-list dest-tips">' + t.saveti.map(function (s) {
        return '<li><svg aria-hidden="true"><use href="#i-check"/></svg><span>' + esc(s) + '</span></li>';
      }).join('') + '</ul>' +
    '</section>' : '';

  var pitanja = [
    ['Da li je let iz Beograda?', 'Da. Let polazi sa beogradskog aerodroma „Nikola Tesla“' + (avio ? ' i leti se sa ' + avio : '') + ', a povratna avio karta je uključena u cenu.'],
    ['Da li cena važi i ako putujem sam ili sama?', 'Objavljena cena važi kada putuju dve ili više osoba. Ako putuješ sam ili sama, pošalji nam upit i javićemo ti tačnu cenu za jednu osobu.'],
    ['Šta dobijam u PDF vodiču?', 'Uz ponudu dobijaš PDF fajl sa preporukama šta da posetiš ' + lok + ' i uputstvom kako da stigneš od aerodroma do hotela i nazad.'],
    ['Da li je prtljag uključen?', 'Uslovi za prtljag zavise od avio-kompanije i karte. Pre rezervacije ti tačno kažemo šta je uključeno, a šta može da se doplati.'],
    ['Da li ste turistička agencija?', 'Ne. Putuj jeftino nije turistička agencija — mi tražimo najpovoljnije ponude za let i smeštaj i rezervišemo ih umesto tebe.'],
    ['Kako da rezervišem?', 'Pošalji nam upit preko WhatsApp-a, Instagrama ili kontakt forme. Javljamo ti tačnu cenu i detalje, a kada potvrdiš, rezervišemo let i smeštaj umesto tebe.']
  ];

  var faq = '' +
    '<section aria-labelledby="pitanja">' +
      '<h2 id="pitanja">Česta pitanja</h2>' +
      '<div class="dest-faq">' + pitanja.map(function (q, i) {
        return '<details' + (i === 0 ? ' open' : '') + '><summary>' + esc(q[0]) + '</summary><p>' + esc(q[1]) + '</p></details>';
      }).join('') + '</div>' +
    '</section>';

  var ostale = sveDest.filter(function (x) { return x.slug !== d.slug; });
  var jos = ostale.length ? '' +
    '<section class="section dest-more" aria-labelledby="jos-destinacija">' +
      '<div class="container">' +
        '<div class="section-head">' +
          '<p class="hand-note">možda te zanima i</p>' +
          '<h2 id="jos-destinacija">Još jeftinih putovanja iz Beograda</h2>' +
        '</div>' +
        '<ul class="dest-cards">' + ostale.map(function (x) {
          return '<li class="dest-card"><a href="/' + x.slug + '">' +
            '<img src="/' + esc(x.slika) + '" alt="' + esc(x.naziv + ', ' + x.drzava + ' — jeftino putovanje') + '" width="900" height="600" loading="lazy" decoding="async">' +
            '<span class="dest-card-body"><span><strong>' + esc(x.naziv) + (x.ponude.some(function (p) { return p.novo; }) ? ' <span class="dest-new">Novo</span>' : '') + '</strong><small>' + esc(x.drzava) + '</small></span>' +
            (x.najniza != null ? '<span class="dest-card-price' + (x.popust ? ' is-sale' : '') + '">' + (x.popust ? '<s>' + esc(formatCena(x.staraCena)) + '</s>' : '') + '<small>od</small>' + esc(formatCena(x.najniza)) + '</span>' : '') +
            '</span></a></li>';
        }).join('') + '</ul>' +
      '</div>' +
    '</section>' : '';

  /* --- Strukturirani podaci za Google --- */
  var ld = {
    '@context': 'https://schema.org',
    '@graph': [
      { '@type': 'Organization', '@id': SAJT + '/#organizacija', name: 'Putuj jeftino', url: SAJT + '/' },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Početna', item: SAJT + '/' },
          { '@type': 'ListItem', position: 2, name: 'Ponude', item: SAJT + '/#ponude' },
          { '@type': 'ListItem', position: 3, name: d.naziv, item: url }
        ]
      },
      {
        '@type': 'TouristTrip',
        name: h1Tekst,
        description: opis,
        url: url,
        image: slikaUrl,
        itinerary: { '@type': 'City', name: d.naziv, address: { '@type': 'PostalAddress', addressCountry: d.drzava } },
        provider: { '@id': SAJT + '/#organizacija' },
        offers: d.ponude.filter(function (p) { return !p.primer; }).map(function (p) {
          return {
            '@type': 'Offer', price: String(p.cena), priceCurrency: 'EUR',
            availability: 'https://schema.org/InStock', url: url,
            description: p.datum + (p.trajanje ? ', ' + p.trajanje : '') + '. Cena po osobi kada putuju dve ili više osoba.'
          };
        })
      },
      {
        '@type': 'FAQPage',
        mainEntity: pitanja.map(function (q) {
          return { '@type': 'Question', name: q[0], acceptedAnswer: { '@type': 'Answer', text: q[1] } };
        })
      }
    ]
  };
  if (!ld['@graph'][2].offers.length) delete ld['@graph'][2].offers;

  var cipovi = '' +
    (jeNovo ? '<li class="dest-chip-new">Novo</li>' : '') +
    (imaPonudu ? '<li><svg aria-hidden="true"><use href="#i-calendar"/></svg>' + esc(prva.datum) + '</li>' : '') +
    (imaPonudu && prva.trajanje ? '<li><svg aria-hidden="true"><use href="#i-moon"/></svg>' + esc(prva.trajanje) + '</li>' : '') +
    '<li><svg aria-hidden="true"><use href="#i-plane"/></svg>Let iz Beograda' + (avio ? ' · ' + esc(avio) : '') + '</li>' +
    (imaDorucak ? '<li><svg aria-hidden="true"><use href="#i-cup"/></svg>Doručak uključen</li>' : '') +
    (d.popust ? '<li class="dest-chip-sale">Sniženo −' + esc(formatCena(d.popust)) + '</li>' : '') +
    (imaPonudu ? '<li class="dest-chip-price">' + (d.popust ? '<s>' + esc(formatCena(d.staraCena)) + '</s> ' : '') + 'od ' + esc(formatCena(d.najniza)) + ' po osobi</li>' : '');

  return sredi('<!doctype html>\n' +
'<html lang="sr-Latn">\n' +
'<head>\n' +
'  <meta charset="utf-8">\n' +
'  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n' +
'  <title>' + esc(naslov) + '</title>\n' +
'  <meta name="description" content="' + esc(opis) + '">\n' +
'  <meta name="robots" content="index, follow, max-image-preview:large">\n' +
'  <meta name="theme-color" content="#0A1F3C">\n' +
'  <meta name="format-detection" content="telephone=no">\n' +
'  <link rel="canonical" href="' + url + '">\n' +
'  <meta property="og:type" content="website">\n' +
'  <meta property="og:locale" content="sr_RS">\n' +
'  <meta property="og:site_name" content="Putuj jeftino">\n' +
'  <meta property="og:title" content="' + esc(h1Tekst + (imaPonudu ? ' – od ' + formatCena(d.najniza) : '')) + '">\n' +
'  <meta property="og:description" content="' + esc(opis) + '">\n' +
'  <meta property="og:url" content="' + url + '">\n' +
'  <meta property="og:image" content="' + slikaUrl + '">\n' +
'  <meta property="og:image:alt" content="' + esc(d.naziv + ', ' + d.drzava) + '">\n' +
'  <meta name="twitter:card" content="summary_large_image">\n' +
'  <link rel="icon" href="/favicon.svg" type="image/svg+xml">\n' +
'  <link rel="apple-touch-icon" href="/apple-touch-icon.png">\n' +
'  <link rel="preconnect" href="https://fonts.googleapis.com">\n' +
'  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n' +
'  ' + FONTOVI + '\n' +
'  <link rel="preload" as="image" href="/' + esc(d.slika) + '">\n' +
'  <link rel="stylesheet" href="/styles.css">\n' +
'  <script>document.documentElement.classList.add(\'js\');</script>\n' +
'  <script type="application/ld+json">' + JSON.stringify(ld).replace(/</g, '\\u003c') + '</script>\n' +
'</head>\n' +
'<body class="dest-page">\n' +
'  ' + IKONICE + '\n' +
'  <a class="skip-link" href="#sadrzaj">Preskoči na sadržaj</a>\n' +
'  <div class="scroll-progress" aria-hidden="true"></div>\n' +
'  ' + ZAGLAVLJE + '\n' +
'  <main id="sadrzaj">\n' +
'    <section class="dest-hero" id="vrh" aria-labelledby="dest-naslov">\n' +
'      <img class="dest-hero-img" src="/' + esc(d.slika) + '" alt="' + esc(d.naziv + ', ' + d.drzava + ' — jeftino putovanje iz Beograda') + '" width="900" height="600" fetchpriority="high">\n' +
'      <div class="dest-hero-overlay" aria-hidden="true"></div>\n' +
'      <div class="container dest-hero-content">\n' +
'        <nav class="breadcrumbs" aria-label="Putanja"><ol><li><a href="/">Početna</a></li><li><a href="/#ponude">Ponude</a></li><li aria-current="page">' + esc(d.naziv) + '</li></ol></nav>\n' +
'        <p class="eyebrow eyebrow-light"><span class="dot" aria-hidden="true"></span> ' + esc(d.drzava) + (kat ? ' · ' + esc(kat) : '') + '</p>\n' +
'        <h1 id="dest-naslov">' + h1 + '</h1>\n' +
'        <p class="dest-hero-lead">' + esc(imaPonudu ? prva.opis : 'Povoljan let iz Beograda i smeštaj, uz PDF vodič šta posetiti i kako stići do hotela.') + '</p>\n' +
'        <ul class="dest-chips">' + cipovi + '</ul>\n' +
'      </div>\n' +
'    </section>\n' +
'    <div class="container dest-layout">\n' +
'      <aside class="dest-aside" aria-label="Pregled ponude">' + kutije + akcije + '</aside>\n' +
'      <article class="dest-article">\n' +
'        <section aria-labelledby="o-putovanju"><h2 id="o-putovanju">Putovanje ' + esc(d.u || 'na ovu destinaciju') + ' po povoljnoj ceni</h2>' + uvod + '</section>\n' +
'        <section aria-labelledby="sta-dobijas"><h2 id="sta-dobijas">Šta dobijaš uz ovo jeftino putovanje</h2>' + prednosti + '</section>\n' +
'        <section aria-labelledby="cena"><h2 id="cena">Koliko košta putovanje ' + esc(d.u || 'na ovu destinaciju') + '?</h2>' + cenaTekst + '</section>\n' +
'        ' + znamenitosti + '\n' +
'        ' + transfer + '\n' +
'        ' + saveti + '\n' +
'        <section aria-labelledby="rezervacija"><h2 id="rezervacija">Kako da rezervišeš</h2>' +
          '<ol class="dest-steps">' +
            '<li><h3>Pošalji upit</h3><p>Javi nam se preko WhatsApp-a, Instagrama ili kontakt forme i reci koliko vas putuje.</p></li>' +
            '<li><h3>Dobiješ sve detalje</h3><p>Javljamo ti tačnu cenu, detalje leta i smeštaja, pa ti odlučuješ — bez ikakve obaveze.</p></li>' +
            '<li><h3>Mi rezervišemo umesto tebe</h3><p>Kada potvrdiš, rezervišemo let i smeštaj, a ti dobijaš i PDF vodič za putovanje.</p></li>' +
          '</ol>' +
          '<p class="dest-agency">Putuj jeftino nije turistička agencija. Mi tražimo najpovoljnije ponude za let i smeštaj i rezervišemo ih umesto tebe.</p>' +
        '</section>\n' +
'        ' + faq + '\n' +
'      </article>\n' +
'    </div>\n' +
'    ' + jos + '\n' +
'  </main>\n' +
'  ' + PODNOZJE + '\n' +
'  ' + WA_DUGME + '\n' +
'  <script src="/podesavanja.js"></script>\n' +
'  <script src="/script.js"></script>\n' +
'</body>\n' +
'</html>\n');
}

/* ---------- Sitemap ---------- */
function sitemap(dest) {
  var danas = new Date().toISOString().slice(0, 10);
  var adrese = [SAJT + '/'].concat(dest.map(function (d) { return SAJT + '/' + d.slug; }));
  return '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    adrese.map(function (a) { return '  <url>\n    <loc>' + a + '</loc>\n    <lastmod>' + danas + '</lastmod>\n  </url>'; }).join('\n') +
    '\n</urlset>\n';
}

/* ---------- Kopiranje fajlova ---------- */
var NE_OBJAVLJUJ = ['build.js', 'destinacije.js'];
var EKSTENZIJE = ['.html', '.css', '.js', '.txt', '.svg', '.png', '.ico', '.webmanifest'];

function kopirajFolder(izvor, cilj) {
  fs.mkdirSync(cilj, { recursive: true });
  fs.readdirSync(izvor, { withFileTypes: true }).forEach(function (f) {
    var a = path.join(izvor, f.name), b = path.join(cilj, f.name);
    if (f.isDirectory()) kopirajFolder(a, b); else fs.copyFileSync(a, b);
  });
}

function napraviSajt() {
  var dest = napraviDestinacije();
  fs.rmSync(IZLAZ, { recursive: true, force: true });
  fs.mkdirSync(IZLAZ);

  fs.readdirSync(KOREN, { withFileTypes: true }).forEach(function (f) {
    if (!f.isFile() || NE_OBJAVLJUJ.indexOf(f.name) !== -1) return;
    if (f.name === '_headers' || EKSTENZIJE.indexOf(path.extname(f.name)) !== -1) {
      fs.copyFileSync(path.join(KOREN, f.name), path.join(IZLAZ, f.name));
    }
  });
  kopirajFolder(path.join(KOREN, 'images'), path.join(IZLAZ, 'images'));

  fs.writeFileSync(path.join(IZLAZ, 'index.html'), ubaciListu(INDEX, dest));
  dest.forEach(function (d) {
    if (fs.existsSync(path.join(KOREN, d.slug + '.html'))) throw new Error('Fajl ' + d.slug + '.html već postoji u repou');
    fs.writeFileSync(path.join(IZLAZ, d.slug + '.html'), stranica(d, dest));
  });
  fs.writeFileSync(path.join(IZLAZ, 'sitemap.xml'), sitemap(dest));

  console.log('Napravljeno ' + dest.length + ' stranica destinacija: ' + dest.map(function (d) { return '/' + d.slug; }).join(', '));
}

if (process.argv.indexOf('--index') !== -1) {
  fs.writeFileSync(path.join(KOREN, 'index.html'), ubaciListu(INDEX, napraviDestinacije()));
  console.log('Lista destinacija u index.html je osvežena.');
} else {
  napraviSajt();
}
