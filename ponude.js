/* =====================================================================
   PONUDE PUTOVANJA — Putuj jeftino
   ---------------------------------------------------------------------
   Svaka ponuda je jedan blok između vitičastih zagrada { ... }.
   Blokovi su odvojeni zarezom.

   KAKO DA DODAŠ NOVU PONUDU:
     1. Kopiraj ceo jedan blok { ... }, (zajedno sa zarezom posle njega).
     2. Nalepi ga ispod poslednjeg bloka.
     3. Promeni tekst između navodnika.
     4. Sliku ubaci u folder "images" i upiši njeno ime u polje "slika".

   POLJA:
     id          – kratko ime bez razmaka i slova č/ć/š/ž/đ (npr. "rim-novembar")
     destinacija – naziv destinacije (npr. "Rim")
     drzava      – država (npr. "Italija")
     kategorija  – "more" ili "grad" (koristi se za filtere)
     slika       – putanja do slike (npr. "images/rim.webp")
     datum       – datum putovanja kao tekst (npr. "29. nov – 2. dec 2026.")
     trajanje    – npr. "4 noćenja"
     cena        – samo broj, u evrima (npr. 259)
     staraCena   – (nije obavezno) prethodna cena. Ako je bar 20 € veća od
                   nove cene, ponuda se prikazuje kao sniženje (precrtana
                   stara cena i oznaka "Sniženo"). Kada sniženje prođe,
                   samo obriši ovaj red.
     opis        – kratak opis za karticu (1–2 rečenice)
     detalji     – duži opis koji se vidi na "Saznaj više"
     ukljuceno   – lista stavki, svaka u navodnicima, odvojene zarezom
     primer      – true = ponuda je PRIMER (prikazuje oznaku "Primer ponude")
                   false = stvarna, aktivna ponuda
     dorucak     – true = na kartici se ističe oznaka "Doručak uključen"
     izdvojeno   – true = ponuda se prikazuje u "Izdvojene ponude" na vrhu
                   naslovne strane (najviše 3; ako nijedna nije označena,
                   prikazuju se prve tri ponude)

   KADA UBACIŠ PRAVE PONUDE: obriši primere ili im stavi primer: false
   i promeni sve podatke. Ako nijedna ponuda nije primer, obaveštenje o
   primerima iznad kartica automatski nestaje.
   ===================================================================== */

window.KATEGORIJE = {
  grad: "Gradska putovanja",
  more: "Mediteran"
};

window.PONUDE = [
  {
    id: "larnaka-novembar",
    destinacija: "Larnaka",
    drzava: "Kipar",
    kategorija: "more",
    slika: "images/larnaka.jpg",
    datum: "4–7. dec 2026.",
    trajanje: "3 noćenja",
    cena: 230,
    staraCena: 255,
    opis: "Grad na obali Kipra, sa šetalištem uz more i starim delom grada nadomak plaže.",
    detalji: "Tri noćenja u Larnaki na Kipru. U cenu su uključeni povratni let, smeštaj i doručak. Pošalji upit i javićemo ti sve detalje o letu i smeštaju.",
    ukljuceno: ["Povratna avio karta", "Smeštaj 3 noćenja", "Doručak"],
    dorucak: true,
    primer: false
  },
  {
    id: "alikante-novembar",
    destinacija: "Alikante",
    drzava: "Španija",
    kategorija: "more",
    slika: "images/alikante.jpg",
    datum: "24–28. nov 2026.",
    trajanje: "4 noćenja",
    cena: 245,
    staraCena: 280,
    opis: "Španska obala, gradska plaža i tvrđava Santa Barbara koja se uzdiže iznad grada.",
    detalji: "Četiri noćenja u Alikanteu. U cenu su uključeni povratni let i smeštaj. Pošalji upit i javićemo ti sve detalje o letu i smeštaju.",
    ukljuceno: ["Povratna avio karta", "Smeštaj 4 noćenja"],
    primer: false
  },
  {
    id: "rim-novembar",
    destinacija: "Rim",
    drzava: "Italija",
    kategorija: "grad",
    slika: "images/rim.webp",
    datum: "6–9. dec 2026.",
    trajanje: "3 noćenja",
    cena: 270,
    opis: "Koloseum, Fontana di Trevi i Vatikan — večni grad, idealan za produženi vikend.",
    detalji: "Tri noćenja u Rimu. U cenu su uključeni povratni let i smeštaj. Pošalji upit i javićemo ti sve detalje o letu i smeštaju.",
    ukljuceno: ["Povratna avio karta", "Smeštaj 3 noćenja"],
    izdvojeno: true,
    primer: false
  },
  {
    id: "milano-novembar",
    destinacija: "Milano",
    drzava: "Italija",
    kategorija: "grad",
    slika: "images/milano.webp",
    datum: "30. nov – 3. dec 2026.",
    trajanje: "3 noćenja",
    cena: 285,
    opis: "Katedrala Duomo, galerija Vitorio Emanuele i šoping — sa uključenim doručkom.",
    detalji: "Tri noćenja u Milanu. U cenu su uključeni povratni let, smeštaj i doručak. Pošalji upit i javićemo ti sve detalje o letu i smeštaju.",
    ukljuceno: ["Povratna avio karta", "Smeštaj 3 noćenja", "Doručak"],
    dorucak: true,
    izdvojeno: true,
    primer: false
  },
  {
    id: "malta-decembar",
    destinacija: "Malta",
    drzava: "Malta",
    kategorija: "more",
    slika: "images/malta.jpg",
    datum: "24–28. nov 2026.",
    trajanje: "4 noćenja",
    cena: 255,
    opis: "Kamena Valeta, luke i zalivi Mediterana — ostrvo sa uključenim doručkom.",
    detalji: "Četiri noćenja na Malti. U cenu su uključeni povratni let, smeštaj i doručak. Pošalji upit i javićemo ti sve detalje o letu i smeštaju.",
    ukljuceno: ["Povratna avio karta", "Smeštaj 4 noćenja", "Doručak"],
    dorucak: true,
    izdvojeno: true,
    primer: false
  },
  {
    id: "madrid-decembar",
    destinacija: "Madrid",
    drzava: "Španija",
    kategorija: "grad",
    slika: "images/madrid.webp",
    datum: "9–11. dec 2026.",
    trajanje: "2 noćenja",
    cena: 230,
    staraCena: 290,
    opis: "Gran Via, muzej Prado i park Retiro — španska prestonica puna života.",
    detalji: "Dva noćenja u Madridu. U cenu su uključeni povratni let i smeštaj. Pošalji upit i javićemo ti sve detalje o letu i smeštaju.",
    ukljuceno: ["Povratna avio karta", "Smeštaj 2 noćenja"],
    primer: false
  },
  {
    id: "pariz-decembar",
    destinacija: "Pariz",
    drzava: "Francuska",
    kategorija: "grad",
    slika: "images/pariz.webp",
    datum: "7–9. dec 2026.",
    trajanje: "2 noćenja",
    cena: 245,
    staraCena: 300,
    opis: "Ajfelova kula, Luvr i šetnja Senom — Pariz u decembru.",
    detalji: "Dva noćenja u Parizu. U cenu su uključeni povratni let i smeštaj. Pošalji upit i javićemo ti sve detalje o letu i smeštaju.",
    ukljuceno: ["Povratna avio karta", "Smeštaj 2 noćenja"],
    primer: false
  },
  {
    id: "nica-decembar",
    destinacija: "Nica",
    drzava: "Francuska",
    kategorija: "more",
    slika: "images/nica.webp",
    datum: "5–10. dec 2026.",
    trajanje: "5 noćenja",
    cena: 250,
    staraCena: 270,
    opis: "Azurna obala, Promenada Engleza i stari grad — francuska rivijera.",
    detalji: "Pet noćenja u Nici. U cenu su uključeni povratni let i smeštaj. Pošalji upit i javićemo ti sve detalje o letu i smeštaju.",
    ukljuceno: ["Povratna avio karta", "Smeštaj 5 noćenja"],
    primer: false
  },
  {
    id: "barselona-decembar",
    destinacija: "Barselona",
    drzava: "Španija",
    kategorija: "grad",
    slika: "images/barselona.webp",
    datum: "12–14. dec 2026.",
    trajanje: "2 noćenja",
    cena: 225,
    staraCena: 255,
    opis: "Gaudijeva Sagrada Familija, La Rambla i gotička četvrt — grad na moru.",
    detalji: "Dva noćenja u Barseloni. U cenu su uključeni povratni let i smeštaj. Pošalji upit i javićemo ti sve detalje o letu i smeštaju.",
    ukljuceno: ["Povratna avio karta", "Smeštaj 2 noćenja"],
    primer: false
  }
];
