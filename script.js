/* =====================================================================
   Putuj jeftino — funkcionalnost sajta
   Ponude se menjaju u fajlu ponude.js, a kontakt podaci u podesavanja.js.
   Ovaj fajl ne moraš da menjaš.
   ===================================================================== */

(function () {
  'use strict';

  var CFG = window.PODESAVANJA || {};
  var PONUDE = window.PONUDE || [];
  var KATEGORIJE = window.KATEGORIJE || {};

  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };

  function esc(str) {
    return String(str == null ? '' : str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function formatCena(cena) {
    return String(cena).replace(/\B(?=(\d{3})+(?!\d))/g, '.') + ' €';
  }

  function whatsappUrl(poruka) {
    var broj = String(CFG.whatsappBroj || '').replace(/\D/g, '');
    var url = 'https://wa.me/' + broj;
    if (poruka) url += '?text=' + encodeURIComponent(poruka);
    return url;
  }

  // "Barselona" -> "barselona": adresa stranice destinacije (isto kao u build.js)
  function slug(tekst) {
    var mapa = { 'č': 'c', 'ć': 'c', 'š': 's', 'ž': 'z', 'đ': 'dj' };
    return String(tekst).toLowerCase()
      .replace(/[čćšžđ]/g, function (z) { return mapa[z]; })
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  }

  // Sniženje se prikazuje ako je stara cena bar 20 € veća od nove (isto kao u build.js)
  function popust(p) {
    var razlika = (Number(p.staraCena) || 0) - p.cena;
    return razlika >= 20 ? razlika : 0;
  }

  function cenaHtml(p, labela) {
    var pop = popust(p);
    return '<div class="offer-price' + (pop ? ' is-sale' : '') + '"><span>' + labela +
      (pop ? ' <s>' + esc(formatCena(p.staraCena)) + '</s>' : '') + '</span><strong>' + esc(formatCena(p.cena)) + '</strong><small>po osobi</small></div>';
  }

  function popustBadge(p) {
    var pop = popust(p);
    return pop ? '<span class="offer-badge offer-badge--popust">Sniženo −' + esc(formatCena(pop)) + '</span>' : '';
  }

  function nadjiPonudu(id) {
    for (var i = 0; i < PONUDE.length; i++) if (PONUDE[i].id === id) return PONUDE[i];
    return null;
  }

  /* ---------- Kontakt podaci iz podesavanja.js ---------- */
  function primeniPodesavanja() {
    if (CFG.instagram) {
      $$('[data-instagram-link]').forEach(function (a) { a.href = CFG.instagram; });
    }
    if (CFG.telefonZaPoziv) {
      $$('[data-phone-link]').forEach(function (a) { a.href = 'tel:' + CFG.telefonZaPoziv.replace(/\s/g, ''); });
    }
    if (CFG.telefonPrikaz) {
      $$('[data-phone-text]').forEach(function (el) { el.textContent = CFG.telefonPrikaz; });
    }
    if (CFG.whatsappBroj) {
      $$('[data-whatsapp-link]').forEach(function (a) { a.href = whatsappUrl(CFG.whatsappPoruka); });
    }
    var god = $('#godina');
    if (god) god.textContent = new Date().getFullYear();
  }

  /* ---------- Zaglavlje i meni ---------- */
  var header = $('#zaglavlje');
  var nav = $('#glavni-meni');
  var toggle = $('.menu-toggle');

  function azurirajZaglavlje() {
    header.classList.toggle('is-scrolled', window.scrollY > 24);
    document.body.classList.toggle('show-fab', window.scrollY > window.innerHeight * 0.6);
  }

  function postaviMeni(otvoren, tastatura) {
    toggle.setAttribute('aria-expanded', String(otvoren));
    toggle.setAttribute('aria-label', otvoren ? 'Zatvori meni' : 'Otvori meni');
    nav.classList.toggle('is-open', otvoren);
    document.body.classList.toggle('menu-open', otvoren);
    // Fokus na prvi link samo kada je meni otvoren tastaturom (pristupačnost)
    if (otvoren && tastatura) {
      var prvi = $('a', nav);
      if (prvi) setTimeout(function () { prvi.focus({ preventScroll: true }); }, 50);
    }
  }

  function inicijalizujMeni() {
    toggle.addEventListener('click', function (e) {
      postaviMeni(toggle.getAttribute('aria-expanded') !== 'true', e.detail === 0);
    });
    $$('a', nav).forEach(function (a) {
      a.addEventListener('click', function () { postaviMeni(false); });
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('is-open')) {
        postaviMeni(false);
        toggle.focus();
      }
    });
    var mqDesktop = window.matchMedia('(min-width: 900px)');
    var naPromenu = function (e) { if (e.matches) postaviMeni(false); };
    if (mqDesktop.addEventListener) mqDesktop.addEventListener('change', naPromenu);
    else if (mqDesktop.addListener) mqDesktop.addListener(naPromenu);
    window.addEventListener('scroll', azurirajZaglavlje, { passive: true });
    azurirajZaglavlje();
  }

  /* Označava aktivnu stavku menija dok se stranica pomera */
  function inicijalizujAktivniMeni() {
    if (!('IntersectionObserver' in window)) return;
    var linkovi = $$('[data-nav]');
    var mapa = {};
    linkovi.forEach(function (a) { mapa[a.getAttribute('href').slice(1)] = a; });

    var io = new IntersectionObserver(function (unosi) {
      unosi.forEach(function (u) {
        if (!u.isIntersecting) return;
        var id = u.target.id === 'kako' ? 'pocetna' : u.target.id;
        linkovi.forEach(function (a) { a.classList.remove('is-active'); a.removeAttribute('aria-current'); });
        if (mapa[id]) { mapa[id].classList.add('is-active'); mapa[id].setAttribute('aria-current', 'true'); }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });

    ['pocetna', 'kako', 'ponude', 'o-nama', 'kontakt'].forEach(function (id) {
      var s = document.getElementById(id);
      if (s) io.observe(s);
    });
  }

  /* ---------- Ponude ---------- */
  function karticaHtml(p) {
    var kat = KATEGORIJE[p.kategorija] || '';
    return '' +
      '<article class="offer-card reveal" data-kategorija="' + esc(p.kategorija) + '">' +
        '<div class="offer-media">' +
          '<img src="' + esc(p.slika) + '" alt="' + esc(p.destinacija + ', ' + p.drzava + ' — jeftino putovanje') + '" width="900" height="600" loading="lazy" decoding="async">' +
          (p.primer ? '<span class="offer-badge">Primer ponude</span>' : '') +
          (p.dorucak ? '<span class="offer-badge offer-badge--dorucak"><svg aria-hidden="true"><use href="#i-cup"/></svg>Doručak uključen</span>' : '') +
          popustBadge(p) +
          (kat ? '<span class="offer-cat">' + esc(kat) + '</span>' : '') +
        '</div>' +
        '<div class="offer-body">' +
          '<p class="offer-country">' + esc(p.drzava) + '</p>' +
          '<h3><a href="/' + slug(p.destinacija) + '">' + esc(p.destinacija) + '</a></h3>' +
          '<ul class="offer-meta">' +
            '<li><svg aria-hidden="true"><use href="#i-calendar"/></svg><span class="visually-hidden">Datum: </span>' + esc(p.datum) + '</li>' +
            (p.trajanje ? '<li><svg aria-hidden="true"><use href="#i-moon"/></svg>' + esc(p.trajanje) + '</li>' : '') +
            (p.dorucak ? '<li class="meta-dorucak"><svg aria-hidden="true"><use href="#i-cup"/></svg>sa doručkom</li>' : '') +
          '</ul>' +
          '<p class="offer-desc">' + esc(p.opis) + '</p>' +
          '<div class="offer-foot">' +
            cenaHtml(p, 'već od') +
            '<div class="offer-actions">' +
              '<a class="btn btn-ghost btn-sm" href="/' + slug(p.destinacija) + '" aria-label="Saznaj više o ponudi ' + esc(p.destinacija) + '">Saznaj više</a>' +
              '<button class="btn btn-primary btn-sm" type="button" data-upit="' + esc(p.id) + '" aria-label="Pošalji upit za ' + esc(p.destinacija) + '">Pošalji upit</button>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</article>';
  }

  function prikaziPonude() {
    var lista = $('#lista-ponuda');
    if (!lista) return;

    if (!PONUDE.length) {
      lista.innerHTML = '<p class="offers-empty">Trenutno nema objavljenih ponuda. Prati nas na Instagramu ili nam pošalji upit za željenu destinaciju.</p>';
    } else {
      lista.innerHTML = PONUDE.map(karticaHtml).join('');
    }

    // Obaveštenje o primerima se prikazuje samo ako postoji bar jedna ponuda-primer
    var imaPrimera = PONUDE.some(function (p) { return p.primer; });
    var obav = $('#demo-obavestenje');
    if (obav) obav.hidden = !imaPrimera;

    // Predlozi destinacija u kontakt formi
    var dl = $('#destinacije-lista');
    if (dl) {
      dl.innerHTML = PONUDE.map(function (p) { return '<option value="' + esc(p.destinacija) + '">'; }).join('');
    }

    napraviFiltere();
    prikaziIzdvojene();
  }

  /* Ponude sa "izdvojeno: true" (ili prve tri) prikazuju se u uvodnoj sekciji (na većim ekranima) */
  function prikaziIzdvojene() {
    var panel = $('.hero-panel');
    var lista = $('#hero-ponude');
    if (!panel || !lista || !PONUDE.length) return;
    var izdvojene = PONUDE.filter(function (p) { return p.izdvojeno; });
    if (!izdvojene.length) izdvojene = PONUDE;
    izdvojene = izdvojene.slice(0, 3);
    lista.innerHTML = izdvojene.map(function (p, i) {
      return '<li><a class="hero-deal" href="/' + slug(p.destinacija) + '" style="--i:' + i + '" aria-label="' + esc(p.destinacija + (p.dorucak ? ' (sa doručkom)' : '') + ', ' + p.datum + ', od ' + formatCena(p.cena) + (popust(p) ? ', sniženo sa ' + formatCena(p.staraCena) : '')) + '">' +
        '<img src="' + esc(p.slika) + '" alt="" width="76" height="76" decoding="async">' +
        '<span class="hero-deal-info"><strong>' + esc(p.destinacija) + (p.dorucak ? '<em class="hero-deal-dorucak"><svg aria-hidden="true"><use href="#i-cup"/></svg>+ doručak</em>' : '') + '</strong><small>' + esc(p.datum) + (p.trajanje ? ' · ' + esc(p.trajanje) : '') + '</small></span>' +
        '<span class="hero-deal-price' + (popust(p) ? ' is-sale' : '') + '"><small>' + (popust(p) ? '<s>' + esc(formatCena(p.staraCena)) + '</s> ' : '') + 'od</small><b>' + esc(formatCena(p.cena)) + '</b></span>' +
      '</a></li>';
    }).join('');
    var tag = $('#hero-panel-tag');
    if (tag) tag.hidden = !izdvojene.some(function (p) { return p.primer; });
    panel.hidden = false;
  }

  function napraviFiltere() {
    var wrap = $('#filteri');
    if (!wrap) return;
    var brojevi = {};
    PONUDE.forEach(function (p) { brojevi[p.kategorija] = (brojevi[p.kategorija] || 0) + 1; });
    var kljucevi = Object.keys(KATEGORIJE).filter(function (k) { return brojevi[k]; });

    if (kljucevi.length < 2) { wrap.hidden = true; return; }

    var html = '<button class="filter-btn" type="button" data-filter="sve" aria-pressed="true">Sve ponude<span class="count">' + PONUDE.length + '</span></button>';
    kljucevi.forEach(function (k) {
      html += '<button class="filter-btn" type="button" data-filter="' + esc(k) + '" aria-pressed="false">' + esc(KATEGORIJE[k]) + '<span class="count">' + brojevi[k] + '</span></button>';
    });
    wrap.innerHTML = html;

    wrap.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-filter]');
      if (!btn) return;
      var f = btn.getAttribute('data-filter');
      $$('[data-filter]', wrap).forEach(function (b) { b.setAttribute('aria-pressed', String(b === btn)); });
      $$('.offer-card').forEach(function (kartica) {
        var vidljiva = f === 'sve' || kartica.getAttribute('data-kategorija') === f;
        kartica.classList.toggle('is-hidden', !vidljiva);
        kartica.classList.remove('pop');
        if (vidljiva) {
          kartica.classList.add('is-visible');
          void kartica.offsetWidth; // ponovo pokreće animaciju
          kartica.classList.add('pop');
        }
      });
    });
  }

  /* ---------- Detalji ponude (iskačući prozor) ---------- */
  var dialog = $('#detalji-ponude');
  var poslednjiFokus = null;

  function otvoriDetalje(p, okidac) {
    if (!dialog) return;
    poslednjiFokus = okidac || document.activeElement;
    var kat = KATEGORIJE[p.kategorija] || '';
    var ukljuceno = (p.ukljuceno || []).map(function (s) {
      return '<li><svg aria-hidden="true"><use href="#i-check"/></svg><span>' + esc(s) + '</span></li>';
    }).join('');
    var waPoruka = 'Zdravo! Zanima me ponuda: ' + p.destinacija + ' (' + p.datum + '). Možete li mi poslati više informacija?\n\nBroj osoba: ';

    $('#dialog-sadrzaj').innerHTML = '' +
      '<div class="dialog-media">' +
        '<img src="' + esc(p.slika) + '" alt="' + esc(p.destinacija + ', ' + p.drzava + ' — jeftino putovanje') + '" width="900" height="600">' +
        (p.primer ? '<span class="offer-badge">Primer ponude</span>' : '') +
        (p.dorucak ? '<span class="offer-badge offer-badge--dorucak"><svg aria-hidden="true"><use href="#i-cup"/></svg>Doručak uključen</span>' : '') +
        popustBadge(p) +
        (kat ? '<span class="offer-cat">' + esc(kat) + '</span>' : '') +
        '<button class="dialog-close" type="button" data-zatvori aria-label="Zatvori"><svg aria-hidden="true"><use href="#i-close"/></svg></button>' +
      '</div>' +
      '<div class="dialog-body">' +
        '<p class="offer-country">' + esc(p.drzava) + '</p>' +
        '<h2 id="dialog-naslov">' + esc(p.destinacija) + '</h2>' +
        '<ul class="offer-meta">' +
          '<li><svg aria-hidden="true"><use href="#i-calendar"/></svg>' + esc(p.datum) + '</li>' +
          (p.trajanje ? '<li><svg aria-hidden="true"><use href="#i-moon"/></svg>' + esc(p.trajanje) + '</li>' : '') +
        '</ul>' +
        '<p class="dialog-text">' + esc(p.detalji || p.opis) + '</p>' +
        '<p class="dialog-page-link"><a href="/' + slug(p.destinacija) + '">Sve o putovanju, šta posetiti i transfer do hotela <svg aria-hidden="true"><use href="#i-arrow"/></svg></a></p>' +
        (ukljuceno ? '<h3>Ponuda uključuje</h3><ul class="dialog-list">' + ukljuceno + '</ul>' : '') +
        (p.primer ? '<p class="dialog-note"><strong>Napomena:</strong> ovo je primer ponude za prikaz izgleda sajta, a ne aktivna ponuda. Pošalji upit i proverićemo trenutne mogućnosti za ovu destinaciju.</p>' : '') +
        '<div class="dialog-foot">' +
          cenaHtml(p, 'već od') +
          '<div class="offer-actions">' +
            '<a class="btn btn-wa btn-sm" href="' + esc(whatsappUrl(waPoruka)) + '" target="_blank" rel="noopener"><svg aria-hidden="true"><use href="#i-whatsapp"/></svg> WhatsApp</a>' +
            '<button class="btn btn-primary btn-sm" type="button" data-upit="' + esc(p.id) + '">Pošalji upit</button>' +
          '</div>' +
        '</div>' +
      '</div>';

    if (typeof dialog.showModal === 'function') dialog.showModal();
    else dialog.setAttribute('open', '');
    document.body.style.overflow = 'hidden';
    var zatvori = $('[data-zatvori]', dialog);
    if (zatvori) zatvori.focus();
    $('.dialog-inner', dialog).scrollTop = 0;
  }

  function zatvoriDetalje() {
    if (!dialog || !dialog.hasAttribute('open')) return;
    if (typeof dialog.close === 'function') dialog.close();
    else dialog.removeAttribute('open');
  }

  function inicijalizujDialog() {
    if (!dialog) return;
    dialog.addEventListener('close', function () {
      document.body.style.overflow = '';
      if (poslednjiFokus && document.body.contains(poslednjiFokus)) poslednjiFokus.focus({ preventScroll: true });
    });
    dialog.addEventListener('click', function (e) {
      if (e.target === dialog || e.target.closest('[data-zatvori]')) zatvoriDetalje();
    });
  }

  /* ---------- Upit za ponudu -> popunjava kontakt formu ---------- */
  function popuniUpit(p) {
    var dest = $('#destinacija');
    var poruka = $('#poruka');
    if (dest) dest.value = p.destinacija + ' — ' + p.datum;
    if (poruka && !poruka.value.trim()) {
      poruka.value = 'Zdravo, zanima me ponuda „' + p.destinacija + '“ (' + p.datum + '). Molim vas za više informacija o ceni i dostupnosti.';
    }
    zatvoriDetalje();
    var kontakt = document.getElementById('kontakt');
    kontakt.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
    var ime = $('#ime');
    if (ime) setTimeout(function () { ime.focus({ preventScroll: true }); }, 700);
  }

  function inicijalizujDugmadPonuda() {
    document.addEventListener('click', function (e) {
      var det = e.target.closest('[data-detalji]');
      if (det) {
        var p = nadjiPonudu(det.getAttribute('data-detalji'));
        if (p) otvoriDetalje(p, det);
        return;
      }
      var upit = e.target.closest('[data-upit]');
      if (upit) {
        var p2 = nadjiPonudu(upit.getAttribute('data-upit'));
        if (p2) popuniUpit(p2);
      }
    });
  }

  /* ---------- Kontakt forma ---------- */
  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  function postaviGresku(polje, poruka) {
    var field = polje.closest('.field');
    var greska = document.getElementById(polje.id + '-greska');
    field.classList.toggle('has-error', !!poruka);
    polje.setAttribute('aria-invalid', poruka ? 'true' : 'false');
    if (greska) {
      greska.textContent = poruka || '';
      if (poruka) polje.setAttribute('aria-describedby', greska.id);
      else polje.removeAttribute('aria-describedby');
    }
  }

  function proveriFormu(forma) {
    var ime = forma.ime, email = forma.email, osobe = forma.osobe, poruka = forma.poruka;
    var prvaGreska = null;

    if (!ime.value.trim()) { postaviGresku(ime, 'Upiši svoje ime.'); prvaGreska = prvaGreska || ime; }
    else postaviGresku(ime, '');

    if (!email.value.trim()) { postaviGresku(email, 'Upiši e-mail adresu.'); prvaGreska = prvaGreska || email; }
    else if (!EMAIL_RE.test(email.value.trim())) { postaviGresku(email, 'E-mail adresa nije ispravna (npr. ime@primer.com).'); prvaGreska = prvaGreska || email; }
    else postaviGresku(email, '');

    var broj = osobe.value.trim();
    if (!broj) { postaviGresku(osobe, 'Upiši koliko osoba putuje.'); prvaGreska = prvaGreska || osobe; }
    else if (!/^\d+$/.test(broj) || +broj < 1 || +broj > 50) { postaviGresku(osobe, 'Upiši broj osoba (npr. 2).'); prvaGreska = prvaGreska || osobe; }
    else postaviGresku(osobe, '');

    if (!poruka.value.trim()) { postaviGresku(poruka, 'Napiši kratku poruku.'); prvaGreska = prvaGreska || poruka; }
    else postaviGresku(poruka, '');

    if (prvaGreska) prvaGreska.focus();
    return !prvaGreska;
  }

  function status(el, tekst, tip) {
    el.className = 'form-status' + (tip ? ' is-' + tip : '');
    el.textContent = tekst;
  }

  function inicijalizujFormu() {
    var forma = $('#kontakt-forma');
    if (!forma) return;
    var statusEl = $('#forma-status');
    var dugme = $('button[type="submit"]', forma);
    var labela = $('.btn-label', dugme);

    // Uklanja grešku čim korisnik počne da kuca
    $$('input, textarea', forma).forEach(function (polje) {
      polje.addEventListener('input', function () {
        if (polje.closest('.field') && polje.closest('.field').classList.contains('has-error')) postaviGresku(polje, '');
      });
    });

    forma.addEventListener('submit', function (e) {
      e.preventDefault();
      status(statusEl, '', '');
      if (!proveriFormu(forma)) return;
      if (forma._gotcha && forma._gotcha.value) return; // zaštita od spam robota

      var podaci = {
        ime: forma.ime.value.trim(),
        email: forma.email.value.trim(),
        osobe: forma.osobe.value.trim(),
        destinacija: forma.destinacija.value.trim(),
        poruka: forma.poruka.value.trim()
      };

      // 1) Forma povezana sa Formspree servisom -> poruka stiže na tvoj e-mail
      if (CFG.formspreeAdresa) {
        dugme.disabled = true;
        labela.textContent = 'Šaljem…';
        fetch(CFG.formspreeAdresa, {
          method: 'POST',
          body: new FormData(forma),
          headers: { 'Accept': 'application/json' }
        }).then(function (odg) {
          if (!odg.ok) throw new Error('HTTP ' + odg.status);
          forma.reset();
          status(statusEl, 'Hvala, ' + podaci.ime + '! Tvoj upit je uspešno poslat. Javićemo ti se uskoro.', 'success');
        }).catch(function () {
          status(statusEl, 'Slanje nije uspelo. Pokušaj ponovo ili nam piši direktno na WhatsApp ili Instagram.', 'error');
        }).then(function () {
          dugme.disabled = false;
          labela.textContent = 'Pošalji upit';
        });
        return;
      }

      // 2) Forma još nije povezana -> upit se otvara kao gotova WhatsApp poruka
      var tekst = 'Novi upit sa sajta Putuj jeftino\n\n' +
        'Ime: ' + podaci.ime + '\n' +
        'E-mail: ' + podaci.email + '\n' +
        'Broj osoba: ' + podaci.osobe + '\n' +
        (podaci.destinacija ? 'Destinacija: ' + podaci.destinacija + '\n' : '') +
        '\nPoruka:\n' + podaci.poruka;
      var prozor = window.open(whatsappUrl(tekst), '_blank');
      if (prozor) prozor.opener = null;
      else window.location.href = whatsappUrl(tekst);
      status(statusEl, 'Tvoj upit je pripremljen u WhatsApp-u — pritisni „Pošalji“ u WhatsApp-u da nam stigne.', 'success');
    });
  }

  /* ---------- Animacije pri pomeranju ---------- */
  function inicijalizujAnimacije() {
    var elementi = $$('.reveal');
    if (!('IntersectionObserver' in window)) {
      elementi.forEach(function (el) { el.classList.add('is-visible'); });
      return;
    }
    var io = new IntersectionObserver(function (unosi) {
      unosi.forEach(function (u) {
        if (u.isIntersecting) {
          u.target.classList.add('is-visible');
          io.unobserve(u.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

    var brojKartica = 0;
    elementi.forEach(function (el) {
      // Kartice u istom redu se pojavljuju jedna za drugom
      if (el.classList.contains('offer-card')) el.style.transitionDelay = (brojKartica++ % 3) * 90 + 'ms';
      // Posle animacije vraćamo elementu njegove obične prelaze (npr. hover na kartici)
      el.addEventListener('transitionend', function kraj(e) {
        if (e.target !== el || e.propertyName !== 'opacity') return;
        el.classList.remove('reveal');
        el.style.transitionDelay = '';
        el.removeEventListener('transitionend', kraj);
      });
      io.observe(el);
    });
  }

  /* ---------- Naslov: svaka reč dobija svoju animaciju ---------- */
  function podeliNaslov() {
    var h1 = $('#hero-naslov');
    if (!h1) return;
    var i = 0;
    Array.prototype.slice.call(h1.childNodes).forEach(function (cvor) {
      if (cvor.nodeType === 3) {
        var frag = document.createDocumentFragment();
        cvor.textContent.split(/(\s+)/).forEach(function (deo) {
          if (!deo) return;
          if (/^\s+$/.test(deo)) { frag.appendChild(document.createTextNode(deo)); return; }
          var s = document.createElement('span');
          s.className = 'w';
          s.style.setProperty('--i', i++);
          s.textContent = deo;
          frag.appendChild(s);
        });
        h1.replaceChild(frag, cvor);
      } else {
        var omot = document.createElement('span');
        omot.className = 'w';
        omot.style.setProperty('--i', i++);
        h1.replaceChild(omot, cvor);
        omot.appendChild(cvor);
      }
    });
  }

  /* ---------- Traka napretka i parallax fotografije ---------- */
  function inicijalizujEfekte() {
    var traka = $('.scroll-progress');
    var foto = $('.hero-media');
    var mirno = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var ceka = false;

    function osvezi() {
      ceka = false;
      var y = window.scrollY;
      var max = document.documentElement.scrollHeight - window.innerHeight;
      if (traka) traka.style.transform = 'scaleX(' + (max > 0 ? Math.min(y / max, 1) : 0) + ')';
      if (foto && !mirno && y < window.innerHeight * 1.2) foto.style.transform = 'translate3d(0,' + (y * 0.3).toFixed(1) + 'px,0)';
    }

    window.addEventListener('scroll', function () {
      if (!ceka) { ceka = true; window.requestAnimationFrame(osvezi); }
    }, { passive: true });
    osvezi();
  }

  /* ---------- Pokretanje ---------- */
  podeliNaslov();
  inicijalizujEfekte();
  primeniPodesavanja();
  prikaziPonude();
  inicijalizujMeni();
  inicijalizujAktivniMeni();
  inicijalizujDialog();
  inicijalizujDugmadPonuda();
  inicijalizujFormu();
  inicijalizujAnimacije();
})();
