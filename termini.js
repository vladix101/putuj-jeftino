/*
 * Čita notes "najjeftiniji letovi.txt" sa Google Drive-a i od njega pravi:
 *   _letovi/notes.sha256             (otisak notesa, da bi se primetila izmena;
 *                                     sam notes se ne čuva u repou jer ima cene)
 *   _letovi/termini.json             (samo datumi, koriste se na sajtu)
 *   _letovi/izvestaj.html            (datumi + cene, šalju se mejlom)
 *
 * Pokretanje:  node termini.js            (preuzme notes sa Drive-a)
 *              node termini.js fajl.txt   (koristi lokalni fajl)
 */
var fs = require('fs');
var path = require('path');
var https = require('https');

var KOREN = __dirname;
var FOLDER = path.join(KOREN, '_letovi');
var DRIVE_ID = '1_tQC9yRSKx8RuaNBaBOhz2DxvkecB3fx';
var DRIVE_URL = 'https://drive.google.com/uc?export=download&id=' + DRIVE_ID;
var BROJ_TERMINA = 5;

global.window = {};
require(path.join(KOREN, 'ponude.js'));
var PONUDE = window.PONUDE;

function slug(s) {
  return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'dj').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function preuzmi(url, preusmerenja) {
  return new Promise(function (resolve, reject) {
    https.get(url, { headers: { 'User-Agent': 'putuj-jeftino-termini' } }, function (res) {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        res.resume();
        if ((preusmerenja || 0) > 5) return reject(new Error('Previše preusmerenja'));
        return resolve(preuzmi(new URL(res.headers.location, url).toString(), (preusmerenja || 0) + 1));
      }
      if (res.statusCode !== 200) { res.resume(); return reject(new Error('Drive je vratio status ' + res.statusCode)); }
      var delovi = [];
      res.on('data', function (d) { delovi.push(d); });
      res.on('end', function () { resolve(Buffer.concat(delovi).toString('utf8')); });
    }).on('error', reject);
  });
}

// "04.12.2026" -> "2026-12-04"
function iso(d) { var a = d.split('.'); return a[2] + '-' + a[1] + '-' + a[0]; }

function parsiraj(tekst) {
  tekst = tekst.replace(/^\uFEFF/, '').replace(/\r/g, '').replace(/\\([>=\-])/g, '$1');
  var poNazivu = {};
  PONUDE.forEach(function (p) { poNazivu[p.destinacija.toUpperCase()] = slug(p.destinacija); });

  var rezultat = { generisano: null, period: null, destinacije: {}, upozorenja: [] };
  var m = tekst.match(/Generisano:\s*([0-9.]+\s+[0-9:]+)/);
  if (m) rezultat.generisano = m[1];
  m = tekst.match(/Period polaska:\s*([^\n]+?)\s*$/m);
  if (m) rezultat.period = m[1].trim();

  var trenutna = null, uUpozorenjima = false;
  tekst.split('\n').forEach(function (red) {
    red = red.trim();
    if (!red) return;
    if (/^Upozorenja:/.test(red)) { uUpozorenjima = true; trenutna = null; return; }
    if (uUpozorenjima) { if (/^-\s+/.test(red)) rezultat.upozorenja.push(red.replace(/^-\s+/, '')); return; }
    if (/^UKUPNO TOP/.test(red)) { trenutna = null; return; }

    var naslov = red.match(/^([A-ZČĆŽŠĐ ]+?)\s+—/);
    if (naslov && poNazivu[naslov[1].trim()]) {
      trenutna = poNazivu[naslov[1].trim()];
      rezultat.destinacije[trenutna] = rezultat.destinacije[trenutna] || { naziv: naslov[1].trim(), letovi: [] };
      return;
    }
    if (!trenutna) return;
    var l = red.match(/^\d+\.\s*([\d.,]+)\s*EUR\s*\|\s*(\d+)\s*noć\.[^|]*\|\s*([^|]+?)\s*\|\s*([A-Z]{3}-[A-Z]{3})\s*\|\s*\S+\s+(\d\d\.\d\d\.\d{4})\s+(\d\d:\d\d)\s*->\s*\S+\s+(\d\d\.\d\d\.\d{4})\s+(\d\d:\d\d)\s*(?:\|\s*(.+))?$/);
    if (!l) return;
    rezultat.destinacije[trenutna].letovi.push({
      cena: parseFloat(l[1].replace(',', '.')),
      noci: parseInt(l[2], 10),
      aviokompanija: l[3],
      ruta: l[4],
      polazak: iso(l[5]), vremePolaska: l[6],
      povratak: iso(l[7]), vremePovratka: l[8],
      napomena: (l[9] || '').trim()
    });
  });
  return rezultat;
}

var DANI = ['ned', 'pon', 'uto', 'sre', 'čet', 'pet', 'sub'];
function lepDatum(d, vreme) {
  var a = d.split('-');
  var dan = DANI[new Date(Date.UTC(+a[0], +a[1] - 1, +a[2])).getUTCDay()];
  return dan + ' ' + a[2] + '.' + a[1] + '.' + a[0] + '.' + (vreme ? ' ' + vreme : '');
}
function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }

function izvestaj(r) {
  var th = 'style="text-align:left;padding:6px 10px;border-bottom:2px solid #ddd;font-size:13px"';
  var td = 'style="padding:6px 10px;border-bottom:1px solid #eee;font-size:13px"';
  var html = '<div style="font-family:Arial,sans-serif;color:#222;max-width:760px">' +
    '<h2 style="margin:0 0 4px">Najjeftiniji termini letova</h2>' +
    '<p style="margin:0 0 16px;color:#666;font-size:13px">' +
    (r.generisano ? 'Notes generisan: ' + esc(r.generisano) + '. ' : '') +
    (r.period ? 'Period polaska: ' + esc(r.period) + '. ' : '') +
    'Cene su za 1 odraslu osobu, povratno. Na sajtu se prikazuju samo datumi.</p>';

  PONUDE.forEach(function (p) {
    var s = slug(p.destinacija), d = r.destinacije[s];
    if (!d) return;
    html += '<h3 style="margin:20px 0 6px">' + esc(p.destinacija) + ' <span style="font-weight:normal;color:#888;font-size:13px">(na sajtu: ' + esc(p.datum) + ', ' + esc(p.trajanje) + ')</span></h3>';
    if (!d.letovi.length) { html += '<p style="font-size:13px;color:#888">Nema letova u notesu.</p>'; return; }
    html += '<table style="border-collapse:collapse;width:100%"><tr>' +
      '<th ' + th + '>Polazak</th><th ' + th + '>Povratak</th><th ' + th + '>Noćenja</th><th ' + th + '>Cena (povratna karta)</th><th ' + th + '>Aviokompanija</th></tr>' +
      d.letovi.map(function (x) {
        return '<tr><td ' + td + '>' + esc(lepDatum(x.polazak, x.vremePolaska)) + '</td><td ' + td + '>' + esc(lepDatum(x.povratak, x.vremePovratka)) +
          '</td><td ' + td + '>' + x.noci + '</td><td ' + td + '><b>' + x.cena.toFixed(2) + ' €</b></td><td ' + td + '>' + esc(x.aviokompanija) + ' (' + esc(x.ruta) + ')</td></tr>';
      }).join('') + '</table>';
  });
  if (r.upozorenja.length) {
    html += '<p style="margin-top:20px;font-size:13px;color:#b45309"><b>Upozorenja iz notesa:</b><br>' + r.upozorenja.map(esc).join('<br>') + '</p>';
  }
  return html + '</div>';
}

function terminiZaSajt(r) {
  var out = {};
  Object.keys(r.destinacije).forEach(function (s) {
    var vidjeno = {};
    out[s] = r.destinacije[s].letovi.filter(function (x) {
      var k = x.polazak + '|' + x.povratak;
      if (vidjeno[k]) return false;
      return (vidjeno[k] = true);
    }).slice(0, BROJ_TERMINA)
      .sort(function (a, b) { return a.polazak < b.polazak ? -1 : a.polazak > b.polazak ? 1 : 0; })
      .map(function (x) { return { polazak: x.polazak, povratak: x.povratak, noci: x.noci }; });
  });
  return out;
}

async function main() {
  var lokalni = process.argv[2];
  var tekst = lokalni ? fs.readFileSync(lokalni, 'utf8') : await preuzmi(DRIVE_URL);
  if (!/NAJJEFTINIJI LETOVI/.test(tekst)) throw new Error('Preuzeti fajl ne liči na notes sa letovima (možda više nije javno podeljen?)');

  var r = parsiraj(tekst);
  var ukupno = Object.keys(r.destinacije).reduce(function (n, s) { return n + r.destinacije[s].letovi.length; }, 0);
  if (!Object.keys(r.destinacije).length) throw new Error('U notesu nije pronađena nijedna destinacija');

  fs.mkdirSync(FOLDER, { recursive: true });
  fs.writeFileSync(path.join(FOLDER, 'notes.sha256'), require('crypto').createHash('sha256').update(tekst).digest('hex') + '\n');
  fs.writeFileSync(path.join(FOLDER, 'termini.json'), JSON.stringify({ generisano: r.generisano, period: r.period, destinacije: terminiZaSajt(r) }, null, 2) + '\n');
  fs.writeFileSync(path.join(FOLDER, 'izvestaj.html'), izvestaj(r));
  console.log('Notes obrađen: ' + Object.keys(r.destinacije).length + ' destinacija, ' + ukupno + ' letova.');
}

main().catch(function (e) { console.error(e.message); process.exit(1); });
