/* =====================================================================
   TEKSTOVI ZA STRANICE DESTINACIJA — Putuj jeftino
   ---------------------------------------------------------------------
   Za svaku destinaciju iz ponude.js pravi se posebna stranica
   (npr. putujjeftino.rs/rim). Cena, datum, trajanje i šta je uključeno
   uvek se uzimaju iz ponude.js — ovde su samo duži opisi destinacije.

   Ključ (npr. "rim") je naziv destinacije malim slovima, bez č/ć/š/ž/đ
   i sa crticom umesto razmaka. Ako za neku destinaciju iz ponude.js ne
   postoji tekst ovde, stranica se svejedno napravi, samo bez ovih delova.

   POLJA:
     naziv, drzava, slika – koriste se samo ako trenutno nema ponude za
                   ovu destinaciju (tada stranica i dalje postoji, sa
                   porukom da je ponuda trenutno rasprodata)
     u           – "u Rim", "na Maltu" (kuda se putuje)
     lokativ     – "u Rimu", "na Malti" (gde se boravi)
     uvod        – lista pasusa na početku stranice
     znamenitosti – lista { naziv, opis } za odeljak "Šta posetiti"
     transfer    – lista pasusa za odeljak o putu od aerodroma do hotela
     saveti      – lista kratkih praktičnih saveta
   ===================================================================== */

window.DESTINACIJE = {

  larnaka: {
    naziv: "Larnaka",
    drzava: "Kipar",
    slika: "images/larnaka.jpg",
    u: "u Larnaku",
    lokativ: "u Larnaki",
    uvod: [
      "Larnaka je opušten primorski grad na južnoj obali Kipra, idealan za kratak odmor kada u Srbiji već zahladi. Gradska plaža i šetalište sa palmama su na samo par koraka od starog dela grada, pa sve stižeš peške — bez iznajmljivanja automobila i bez žurbe.",
      "Kipar je jedna od retkih destinacija gde i u kasnu jesen možeš da šetaš uz more u laganoj garderobi. Ako tražiš jeftina putovanja na toplije mesto, a ne želiš dug let i komplikovana presedanja, Larnaka je odličan izbor."
    ],
    znamenitosti: [
      { naziv: "Šetalište Finikudes", opis: "Glavno šetalište uz gradsku plažu, sa drvoredom palmi, kafićima i restoranima. Najlepše je pred zalazak sunca." },
      { naziv: "Crkva Svetog Lazara", opis: "Kamena crkva iz 9. veka, posvećena Lazaru koji je, prema predanju, posle vaskrsenja živeo i služio kao episkop u ovom gradu. Jedno od najvažnijih mesta u Larnaki." },
      { naziv: "Slano jezero i džamija Hala Sultan Teke", opis: "Jezero tik uz grad, gde se u hladnijim mesecima često mogu videti flamingosi. Na njegovoj obali je džamija Hala Sultan Teke, jedno od najznačajnijih islamskih svetilišta na Kipru." },
      { naziv: "Akvadukt Kamares", opis: "Kameni akvadukt iz 18. veka sa nizom lukova, nadomak grada. Lepo mesto za kratku šetnju i fotografije." },
      { naziv: "Tvrđava Larnaka", opis: "Mala srednjovekovna tvrđava na kraju šetališta Finikudes, sa pogledom na more i luku." },
      { naziv: "Plaža Mekenzi", opis: "Popularna plaža južno od centra, sa barovima i restoranima uz samo more." }
    ],
    transfer: [
      "Aerodrom Larnaka je svega nekoliko kilometara od centra grada, pa je put do hotela kratak. Do centra voze gradski autobusi, a taksi je najbrža opcija ako stižeš kasno ili imaš više prtljaga.",
      "U PDF vodiču dobijaš tačno uputstvo za tvoj hotel: kojim autobusom ili prevozom da ideš, gde je stanica i kako da se vratiš na aerodrom na dan polaska."
    ],
    saveti: [
      "Na Kipru se vozi levom stranom, a utičnice su britanskog tipa — ponesi adapter.",
      "Valuta je evro, pa ne moraš da menjaš novac.",
      "Centar, šetalište i stari deo grada lako se obilaze peške."
    ]
  },

  alikante: {
    naziv: "Alikante",
    drzava: "Španija",
    slika: "images/alikante.jpg",
    u: "u Alikante",
    lokativ: "u Alikanteu",
    uvod: [
      "Alikante je sunčan grad na španskoj obali Kosta Blanka, sa gradskom plažom u samom centru i tvrđavom koja se uzdiže iznad krovova. Spoj mora, šetališta i živih uskih ulica čini ga savršenim za nekoliko dana odmora.",
      "Grad je dovoljno mali da ga obiđeš peške, a dovoljno živ da ti ne bude dosadno. Za sve koji traže jeftina putovanja u Španiju, Alikante je odlična prilika da uhvate još malo sunca van sezone."
    ],
    znamenitosti: [
      { naziv: "Tvrđava Santa Barbara", opis: "Tvrđava na brdu Benakantil, sa jednim od najlepših pogleda na grad i more. Do vrha može peške ili liftom koji kreće iz blizine plaže Postigvet." },
      { naziv: "Šetalište Esplanada de Espanja", opis: "Čuveno šetalište uz luku, popločano milionima pločica u obliku talasa i oivičeno palmama." },
      { naziv: "Plaža Postigvet", opis: "Gradska plaža u samom centru, odmah ispod tvrđave." },
      { naziv: "Stari kvart El Barrio", opis: "Uske ulice, beli zidovi i saksije sa cvećem na podnožju brda — najlepši deo grada za lutanje i večernji izlazak." },
      { naziv: "Bazilika Santa Marija", opis: "Najstarija crkva u gradu, u starom kvartu, sa bogato ukrašenim ulazom." },
      { naziv: "Centralna pijaca", opis: "Pijaca sa svežom ribom, voćem, šunkom i lokalnim specijalitetima — dobro mesto za brz i jeftin ručak." }
    ],
    transfer: [
      "Aerodrom Alikante–Elče nalazi se nedaleko od grada. Do centra vozi aerodromski autobus, a dostupan je i taksi.",
      "U PDF vodiču dobijaš uputstvo za tvoj hotel: koji prevoz da uzmeš, gde da siđeš i kako da se vratiš na aerodrom na dan polaska."
    ],
    saveti: [
      "U Španiji se ruča i večera kasnije nego kod nas — mnogi restorani počinju sa večerom tek oko 20–21 čas.",
      "Pojedine manje radnje zatvaraju se na nekoliko sati sredinom dana.",
      "Ako imaš slobodan dan, brodom možeš do malog ostrva Tabarka."
    ]
  },

  rim: {
    naziv: "Rim",
    drzava: "Italija",
    slika: "images/rim.webp",
    u: "u Rim",
    lokativ: "u Rimu",
    uvod: [
      "Rim je grad u kome na svakom ćošku nailaziš na istoriju — od Koloseuma i Rimskog foruma do baroknih fontana i Vatikana. Tri ili četiri dana su sasvim dovoljna da vidiš najpoznatija mesta i da uživaš u pravoj italijanskoj kafi, pici i đelatu.",
      "Zbog kratkog leta i mnogo toga što može da se obiđe peške, Rim je jedan od najboljih izbora za jeftina putovanja i produženi vikend iz Beograda."
    ],
    znamenitosti: [
      { naziv: "Koloseum, Rimski forum i Palatin", opis: "Najpoznatiji simbol Rima i ostaci centra antičkog grada. Karte se obično kupuju zajedno, a preporučljivo je rezervisati ih unapred." },
      { naziv: "Vatikan", opis: "Bazilika Svetog Petra, Trg Svetog Petra i Vatikanski muzeji sa Sikstinskom kapelom. Za muzeje svakako kupi kartu unapred." },
      { naziv: "Fontana di Trevi", opis: "Najpoznatija fontana na svetu. Po običaju se baca novčić preko ramena — kažu da se tako sigurno vraćaš u Rim." },
      { naziv: "Panteon", opis: "Antički hram sa čuvenom kupolom i otvorom na vrhu, jedna od najbolje očuvanih građevina starog Rima." },
      { naziv: "Španski trg", opis: "Čuvene Španske stepenice i elegantne ulice za šetnju i razgledanje izloga oko njih." },
      { naziv: "Trastevere", opis: "Šarmantni kvart preko Tibra, sa uskim ulicama i trattorijama — najbolji izbor za večeru." }
    ],
    transfer: [
      "Rim ima dva aerodroma. Sa aerodroma Fjumičino do glavne železničke stanice Termini vozi direktan voz Leonardo ekspres, a postoje i autobusi. Sa aerodroma Ćampino do centra voze autobusi.",
      "U PDF vodiču dobijaš uputstvo za tvoj hotel i aerodrom na koji sleće tvoj let: koji prevoz da uzmeš, gde da presedneš i kako da se vratiš na aerodrom."
    ],
    saveti: [
      "Za ulazak u crkve i Vatikan ramena i kolena treba da budu pokriveni.",
      "Po gradu postoje česme sa pijaćom vodom — ponesi flašicu i dopunjavaj je.",
      "Najpoznatije znamenitosti su blizu jedna drugoj, pa se veliki deo grada obilazi peške."
    ]
  },

  milano: {
    naziv: "Milano",
    drzava: "Italija",
    slika: "images/milano.webp",
    u: "u Milano",
    lokativ: "u Milanu",
    uvod: [
      "Milano je italijanska prestonica mode i dizajna, ali i grad sa jednom od najlepših katedrala na svetu. Spoj umetnosti, šopinga i čuvenog italijanskog aperitiva čini ga savršenim za nekoliko dana gradskog odmora.",
      "Ako tražiš jeftina putovanja u Italiju sa doručkom, kratkim letom i mnogo toga da se vidi, Milano je odličan izbor — a odavde je lako i do jezera Komo na jednodnevni izlet."
    ],
    znamenitosti: [
      { naziv: "Katedrala Duomo", opis: "Simbol Milana, gotička katedrala sa stotinama skulptura. Obavezno se popni na krov — šetnja između tornjeva i pogled na grad su nezaboravni." },
      { naziv: "Galerija Vitorio Emanuele II", opis: "Raskošna natkrivena galerija sa staklenom kupolom, odmah pored Duoma, puna kafića i radnji." },
      { naziv: "Teatro alla Skala", opis: "Jedna od najpoznatijih opera na svetu, na kraju galerije." },
      { naziv: "Dvorac Sforca", opis: "Veliki dvorac sa muzejima i parkom Sempione iza njega, idealan za odmor od gradske gužve." },
      { naziv: "Poslednja večera", opis: "Leonardova čuvena freska u crkvi Santa Marija dele Gracije. Broj posetilaca je ograničen, pa se karte rezervišu dosta unapred." },
      { naziv: "Navilji i Brera", opis: "Kanali Navilji su najbolje mesto za večernji aperitiv, a Brera je umetnički kvart sa galerijama i kafićima." }
    ],
    transfer: [
      "Milano ima više aerodroma. Sa aerodroma Malpensa do centra vozi voz Malpensa ekspres, sa aerodroma Bergamo do glavne stanice Centrale voze autobusi, a aerodrom Linate povezan je sa gradom linijom metroa M4.",
      "U PDF vodiču dobijaš uputstvo za tvoj hotel i aerodrom na koji sleće tvoj let: koji prevoz da uzmeš i kako da se vratiš na aerodrom na dan polaska."
    ],
    saveti: [
      "Aperitiv je milanska tradicija: uz piće u mnogim barovima dobijaš i nešto za grickanje.",
      "Karte za krov Duoma i Poslednju večeru kupi unapred.",
      "Jezero Komo je udaljeno oko sat vremena vozom — odličan jednodnevni izlet."
    ]
  },

  malta: {
    naziv: "Malta",
    drzava: "Malta",
    slika: "images/malta.jpg",
    u: "na Maltu",
    lokativ: "na Malti",
    uvod: [
      "Malta je malo ostrvo u srcu Mediterana, sa kamenim gradovima, skrivenim zalivima i hiljadama godina istorije. Prestonica Valeta je pod zaštitom UNESKO-a, a do skoro svakog dela ostrva stiže se za manje od sat vremena.",
      "Blaga klima, engleski kao službeni jezik i evro kao valuta čine Maltu jednom od najjednostavnijih destinacija za jeftina putovanja na more — i van letnje sezone."
    ],
    znamenitosti: [
      { naziv: "Valeta", opis: "Kamena prestonica sa pravim ulicama, balkonima u boji i pogledom na Veliku luku. Ceo grad se obilazi peške." },
      { naziv: "Gornji Barakka vrtovi", opis: "Vrtovi sa najlepšim pogledom na Veliku luku. Ispod njih je baterija iz koje svakog dana u podne puca top." },
      { naziv: "Katedrala Svetog Jovana", opis: "Skromna spolja, a raskošna iznutra. U njoj se nalazi Karavađova slika „Odsecanje glave Svetog Jovana Krstitelja“." },
      { naziv: "Mdina", opis: "„Tihi grad“ na brdu u unutrašnjosti, sa uskim kamenim ulicama i zidinama — kao da si se vratio u srednji vek." },
      { naziv: "Marsašlok", opis: "Ribarsko selo Marsašlok poznato je po šarenim čamcima i pijaci koja se održava nedeljom." },
      { naziv: "Plava grota", opis: "Morske pećine sa neverovatno plavom vodom, do kojih se ide malim čamcem kada je more mirno." }
    ],
    transfer: [
      "Aerodrom na Malti je u unutrašnjosti ostrva, nedaleko od Valete. Do Valete i većine turističkih mesta voze javni autobusi, a dostupan je i taksi.",
      "U PDF vodiču dobijaš uputstvo za tvoj hotel: koji autobus da uzmeš, gde da siđeš i kako da se vratiš na aerodrom na dan polaska."
    ],
    saveti: [
      "Na Malti se vozi levom stranom, a utičnice su britanskog tipa — ponesi adapter.",
      "Engleski je službeni jezik, pa se lako sporazumeš.",
      "Brodovi do ostrva Komino i Plave lagune voze najviše u toplijem delu godine."
    ]
  },

  madrid: {
    naziv: "Madrid",
    drzava: "Španija",
    slika: "images/madrid.webp",
    u: "u Madrid",
    lokativ: "u Madridu",
    uvod: [
      "Madrid je španska prestonica puna energije — sa svetski poznatim muzejima, velikim parkovima, širokim bulevarima i ulicama koje ne spavaju. Ovde se dan završava kasno, a večera počinje kada se kod nas već sprema za spavanje.",
      "Za ljubitelje umetnosti, dobre hrane i gradskog života, Madrid je jedno od najboljih jeftinih putovanja u Evropi."
    ],
    znamenitosti: [
      { naziv: "Muzej Prado", opis: "Jedan od najvažnijih muzeja na svetu, sa delima Velaskeza, Goje i El Greka. U određenim večernjim terminima ulaz je besplatan — proveri na sajtu muzeja." },
      { naziv: "Muzej Reina Sofija", opis: "Muzej moderne umetnosti u kome se nalazi Pikasova „Gernika“." },
      { naziv: "Kraljevska palata", opis: "Ogromna palata španske kraljevske porodice, sa raskošnim salama i vrtovima." },
      { naziv: "Plaza Major i Puerta del Sol", opis: "Dva najpoznatija trga u centru. Na Puerta del Sol nalazi se ploča „kilometar nula“ od koje se mere svi putevi u Španiji." },
      { naziv: "Park Retiro", opis: "Veliki park sa jezerom i čamcima i staklenom Kristalnom palatom." },
      { naziv: "Pijaca San Migel", opis: "Natkrivena pijaca sa tapasima i lokalnim specijalitetima, odmah pored trga Plaza Major." }
    ],
    transfer: [
      "Aerodrom Barahas povezan je sa centrom linijom metroa 8, aerodromskim autobusom i prigradskim vozom. Taksi je takođe dostupan.",
      "U PDF vodiču dobijaš uputstvo za tvoj hotel: koju liniju da uzmeš, gde da presedneš i kako da se vratiš na aerodrom na dan polaska."
    ],
    saveti: [
      "Probaj čuroze sa toplom čokoladom — madridski klasik.",
      "Večera u Španiji počinje kasno, uglavnom posle 21 čas.",
      "Metro je brz i jednostavan za snalaženje po celom gradu."
    ]
  },

  pariz: {
    naziv: "Pariz",
    drzava: "Francuska",
    slika: "images/pariz.webp",
    u: "u Pariz",
    lokativ: "u Parizu",
    uvod: [
      "Pariz je grad koji svako bar jednom treba da vidi — Ajfelova kula, Luvr, šetnja uz Senu i kafići na svakom ćošku. U decembru je posebno lep, sa prazničnom rasvetom na bulevarima i u izlozima.",
      "Iako važi za skup grad, uz dobro pronađenu ponudu za let i smeštaj Pariz može da bude i jedno od jeftinih putovanja — a mnoge najlepše stvari, poput šetnje Monmartrom ili obalama Sene, ne koštaju ništa."
    ],
    znamenitosti: [
      { naziv: "Ajfelova kula", opis: "Simbol Pariza. Karte za penjanje najbolje je kupiti unapred, a pogled na kulu kada se uveče osvetli besplatan je sa trga Trokadero." },
      { naziv: "Luvr", opis: "Najposećeniji muzej na svetu, dom Mona Lize. Rezerviši termin unapred da izbegneš redove." },
      { naziv: "Katedrala Notr Dam", opis: "Gotička katedrala na ostrvu Site, ponovo otvorena za posetioce krajem 2024. godine posle velike obnove." },
      { naziv: "Monmartr i Sakre-Ker", opis: "Umetnički kvart na brdu sa belom bazilikom Sakre-Ker i jednim od najlepših pogleda na grad." },
      { naziv: "Jelisejska polja i Trijumfalna kapija", opis: "Najpoznatiji pariski bulevar, posebno lep u decembru sa prazničnom rasvetom." },
      { naziv: "Krstarenje Senom", opis: "Brodić po Seni je najopušteniji način da za sat vremena vidiš veliki deo grada." }
    ],
    transfer: [
      "Pariz ima više aerodroma. Sa aerodroma Šarl de Gol do centra vozi voz RER B, a ima i autobusa. Aerodrom Orli povezan je sa gradom linijom metroa 14, a sa aerodroma Bove do Pariza vozi poseban šatl autobus.",
      "U PDF vodiču dobijaš uputstvo za tvoj hotel i aerodrom na koji sleće tvoj let: koji prevoz da uzmeš, gde da presedneš i kako da se vratiš na aerodrom."
    ],
    saveti: [
      "Metro je najbrži način za kretanje po gradu.",
      "Za Ajfelovu kulu i Luvr kupi karte unapred.",
      "Pogled na osvetljenu Ajfelovu kulu sa Trokadera je besplatan i najlepši posle mraka."
    ]
  },

  nica: {
    naziv: "Nica",
    drzava: "Francuska",
    slika: "images/nica.webp",
    u: "u Nicu",
    lokativ: "u Nici",
    uvod: [
      "Nica je biser Azurne obale, sa tirkiznim morem, čuvenim šetalištem i šarenim starim gradom. Blaga klima čini je prijatnom i van leta, a šetnja uz more u decembru ovde je sasvim uobičajena stvar.",
      "Nica je i odlična baza za izlete — vozom za kratko stižeš do Monaka, Antiba ili Kana. Za sve koji žele jeftina putovanja na francusku rivijeru, ovo je prava prilika."
    ],
    znamenitosti: [
      { naziv: "Promenada Engleza", opis: "Čuveno šetalište duž cele gradske obale, sa plavim stolicama okrenutim ka moru." },
      { naziv: "Stari grad", opis: "Uske ulice u toplim bojama, male prodavnice, pekare i restorani — srce Nice." },
      { naziv: "Pijaca Kur Saleja", opis: "Pijaca cveća, voća i lokalnih proizvoda u starom gradu." },
      { naziv: "Brdo Zamka", opis: "Park na brdu iznad starog grada sa najlepšim pogledom na zaliv. Gore se stiže stepenicama ili liftom." },
      { naziv: "Muzeji Matisa i Šagala", opis: "Dva muzeja posvećena slavnim umetnicima koji su živeli i stvarali na Azurnoj obali." },
      { naziv: "Izleti u Monako, Antib i Kan", opis: "Lokalni vozovi duž obale za kratko te voze do Monaka i drugih poznatih mesta na rivijeri." }
    ],
    transfer: [
      "Aerodrom Nica nalazi se uz samo more, blizu grada. Do centra vozi tramvaj linije 2, a dostupan je i taksi.",
      "U PDF vodiču dobijaš uputstvo za tvoj hotel: gde da uđeš u tramvaj, gde da siđeš i kako da se vratiš na aerodrom na dan polaska."
    ],
    saveti: [
      "Plaže u Nici su šljunkovite, ne peščane.",
      "Probaj soku — tanku palačinku od leblebija, lokalni specijalitet.",
      "Vozovi duž obale su jednostavan i jeftin način za izlete."
    ]
  },

  barselona: {
    naziv: "Barselona",
    drzava: "Španija",
    slika: "images/barselona.webp",
    u: "u Barselonu",
    lokativ: "u Barseloni",
    uvod: [
      "Barselona je grad na moru sa Gaudijevim građevinama, gotičkom četvrti, plažom u samom centru i ulicama koje su žive do kasno u noć. Malo koji grad u Evropi spaja toliko toga na jednom mestu.",
      "Zbog toga je Barselona među najtraženijim gradovima kod svih koji traže jeftina putovanja — a tri do četiri dana su sasvim dovoljna da vidiš najvažnije."
    ],
    znamenitosti: [
      { naziv: "Sagrada Familija", opis: "Gaudijevo životno delo i simbol Barselone. Karte se obavezno kupuju unapred, jer se brzo rasprodaju." },
      { naziv: "Park Guelj", opis: "Šareni Gaudijev park sa mozaicima i pogledom na grad. Za glavni deo parka potrebna je karta sa terminom." },
      { naziv: "Kasa Batljo i La Pedrera", opis: "Dve Gaudijeve kuće na bulevaru Pasej de Grasija, svaka posebna na svoj način." },
      { naziv: "Gotska četvrt", opis: "Najstariji deo grada, sa katedralom, uskim ulicama i skrivenim trgovima." },
      { naziv: "La Rambla i pijaca Bokerija", opis: "Najpoznatija barselonska ulica i pijaca puna voća, sokova i tapasa." },
      { naziv: "Barseloneta i Monžuik", opis: "Barseloneta je gradska plaža sa šetalištem, a brdo Monžuik nudi tvrđavu, parkove i pogled na luku." }
    ],
    transfer: [
      "Sa aerodroma El Prat do centra vozi Aerobus do Trga Katalonije, a postoje i voz i linija metroa. Taksi je takođe dostupan.",
      "U PDF vodiču dobijaš uputstvo za tvoj hotel i aerodrom na koji sleće tvoj let: koji prevoz da uzmeš i kako da se vratiš na aerodrom na dan polaska."
    ],
    saveti: [
      "Na Rambli i u metrou pazi na novčanik i telefon — džeparoši su česti.",
      "Za Sagradu Familiju i Park Guelj kupi karte unapred.",
      "Karta za više vožnji isplatljivija je od pojedinačnih karata za metro."
    ]
  }
};
