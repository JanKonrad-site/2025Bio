/* /assets/js/core/manifest.js */
/**
 * Jediný zdroj pravdy o obsahu (navigace + pořadí sekcí).
 * NAV_TREE je převzatý z původního main.js.
 */
export const NAV_TREE = [
        {
          title: "1. Základy práce s počítačem",
          href: "#section1",
          children: [
            { title: "1.1 Úvod do práce s počítačem", href: "#section1-1" },
            { title: "1.2 Co je počítač a jak funguje (základní principy výpočetní techniky)", href: "#section1-2" },
            { title: "1.3 Typy počítačů a zařízení (notebook, PC, tablet, mobil, periferie)", href: "#section1-3" },
            { title: "1.4 Firmware počítače (BIOS a UEFI)", href: "#section1-4" },
            { title: "1.5 Struktura a funkce systému Windows", href: "#section1-5" },
            { title: "1.6 Práce se soubory a složkami", href: "#section1-6" },
            { title: "1.7 Příkazový řádek (CMD) – základy práce s textovým rozhraním", href: "#section1-7" },
            { title: "1.8 Základy bezpečnosti a údržby systému", href: "#section1-8" },
          ]
        },
        {
          title: "2. Kancelářské informační systémy",
          href: "#section2",
          children: [
            {
              title: "2.1 Textové editory – Word, LibreOffice Writer, Google Dokumenty",
              href: "#section2-1",
              children: [
                
                { title: "2.1.1 Úvod do textových editorů", href: "#section2-1-1a" },
                { title: "2.1.1 Základy práce s textem", href: "#section2-1-1" },
                { title: "2.1.2 Formátování písma a odstavců", href: "#section2-1-2" },
                { title: "2.1.3 Styly a šablony dokumentů", href: "#section2-1-3" },
                { title: "2.1.4 Vkládání a úprava obrázků a tabulek", href: "#section2-1-4" },
                { title: "2.1.5 Seznamy, odkazy a obsah dokumentu", href: "#section2-1-5" },
                { title: "2.1.6 Kontrola pravopisu a spolupráce v dokumentech", href: "#section2-1-6" },
                { title: "2.1.7 Praktický projekt – profesionální vizitka v Canvě / Designeru", href: "#section2-1-7" },
                { title: "2.1.8 Cvičení – tvorba dokumentu a sdílení", href: "#section2-1-8" },
                { title: "2.1.9 Shrnutí a mini test", href: "#section2-1-9" },
                { title: "2.1.10 Dodatek: export do PDF / nastavení tisku", href: "#section2-1-10" },
                { title: "2.1.11 Dodatek: rychlé klávesy", href: "#section2-1-11" },
                { title: "2.1.12 Dodatek: šablony / normy", href: "#section2-1-12" },
              ]
            },
            {
              title: "2.2 Tabulkové procesory – Excel, LibreOffice Calc, Google Sheets",
              href: "#section2-2-1",
              children: [
                { title: "2.2.1 Úvod do tabulek a práce s buňkami", href: "#section2-2-1" },
                { title: "2.2.2 Formátování tabulek a základní vzorce", href: "#section2-2-2" },
                { title: "2.2.3 Funkce (SUMA, PRŮMĚR, MIN, MAX…)", href: "#section2-2-3" },
                { title: "2.2.4 Grafy a vizualizace dat", href: "#section2-2-4" },
                { title: "2.2.5 Praktický projekt – rozpočet / evidence", href: "#section2-2-5" },
              ]
            }
          ]
        },
        {
          title: "3. Webové technologie",
          href: "#section3",
          children: [
            {
              title: "3.1 Základy HTML",
              href: "#section3-1-1",
              children: [
                { title: "3.1.1 VS Code a nadpisová hierarchie", href: "#section3-1-1" },
                { title: "3.1.2 Odstavce a void prvky: p, br, hr", href: "#section3-1-2" },
                { title: "3.1.3 Seznamy v HTML + vnořování a odsazování", href: "#section3-1-3" },
                { title: "3.1.4 Odkazy (a) a obrázky (img)", href: "#section3-1-4" },
                { title: "3.1.5 GitHub & GitHub Pages - nasazení projektů", href: "#section3-1-5" },
              ]
            },
            {
              title: "3.2 Základy CSS",
              href: "#section3-2-1",
              children: [
                { title: "3.2.1 Úvod do CSS", href: "#section3-2-1" },
                { title: "3.2.2 Vlastnosti a selektory", href: "#section3-2-2" },
                { title: "3.2.3 Stylování textu a barev", href: "#section3-2-3" },
                { title: "3.2.4 Stylování prvků a layout", href: "#section3-2-4" },
                { title: "3.2.5 Praktický projekt – vytvoření jednoduché stránky", href: "#section3-2-5" },
              ]
            },
            {
            title: "3.3 Základy JavaScriptu",
              href: "#section3-3-1",
              children: [
                { title: "3.3.1 Základy programování v JavaScriptu – úvod", href: "#section3-3-1" },
                { title: "3.3.2 Proměnné a datové typy", href: "#section3-3-2" },
                { title: "3.3.3 Podmínky", href: "#section3-3-3" },
                { title: "3.3.4 Vstup/Output", href: "#section3-3-4" },
                { title: "3.3.5 Operátory", href: "#section3-3-5" },
                { title: "3.3.6 Řetězce", href: "#section3-3-6" },
                { title: "3.3.7 Kolekce", href: "#section3-3-7" },
                { title: "3.3.8 Funkce", href: "#section3-3-8" },
                { title: "3.3.9 Test / Kalkulačka", href: "#section3-3-9" },
              ]
            }
          ]
        },
        
        
        {
          title: "4. Programování v Pythonu",
          href: "#section4",
          children: [
            {
              title: "4.1 Základy Pythonu",
              href: "#section4-1-základy-pythonu",
              children: [
                { title: "4.1.0 Úvod", href: "#section4-1-základy-pythonu" },
                { title: "4.1.1 Proměnné a datové typy", href: "#section4-1-1" },
                { title: "4.1.2 Podmínky", href: "#section4-1-2" },
                { title: "4.1.3 Vstup/Output", href: "#section4-1-3" },
                { title: "4.1.4 Operátory", href: "#section4-1-4" },
                { title: "4.1.5 Řetězce", href: "#section4-1-5" },
                { title: "4.1.6 Kolekce", href: "#section4-1-6" },
                { title: "4.1.7 Funkce", href: "#section4-1-7final" },
                { title: "4.1.8 Test / Kalkulačka", href: "#section4-1-8test" },
              ]
            },
            {
              title: "4.2 Projekty",
              href: "#section4-2-1",
              children: [
                { title: "4.2.1 Projekt 1", href: "#section4-2-1" },
                { title: "4.2.2 Projekt 2", href: "#section4-2-2" },
                { title: "4.2.3 Projekt 3", href: "#section4-2-3final" },
              ]
            },
            {
              title: "4.3 Cykly",
              href: "#section4-3-1for",
              children: [
                { title: "4.3.1 for", href: "#section4-3-1for" },
                { title: "4.3.2 while", href: "#section4-3-2while" },
                { title: "4.3.3 Cvičení", href: "#section4-3-3" },
              ]
            },
            {
              title: "4.4 Funkce a projekty",
              href: "#section4-4-1",
              children: [
                { title: "4.4.1", href: "#section4-4-1" },
                { title: "4.4.2", href: "#section4-4-2" },
                { title: "4.4.3", href: "#section4-4-3" },
              ]
            }
          ]
        },
        {
          title: "5. Databáze",
          href: "#section5",
          children: [
            { title: "5.1 Úvod do databází", href: "#section5" }
          ]
        },
        {
          title: "7. Sítě a bezpečnost",
          href: "#section7-1-1",
          children: [
            { title: "7.1.1", href: "#section7-1-1" },
            { title: "7.1.2", href: "#section7-1-2" },
            { title: "7.1.3", href: "#section7-1-3" },
            { title: "7.1.4", href: "#section7-1-4" },
            { title: "7.1.5", href: "#section7-1-5" },
            { title: "7.1.6", href: "#section7-1-6" },
            { title: "7.1.7", href: "#section7-1-7" },
            { title: "7.1.8", href: "#section7-1-8" },
          ]
        },
        {
          title: "8. 3D grafika – Blender",
          href: "#section8-1-1",
          children: [
            { title: "8.1.1 Blender – Kapitola 1: Co znamená modelovat", href: "#section8-1-1" },
          ]
        }
      ];

export function normalizeSectionId(raw) {
  if (!raw) return "";
  let id = String(raw).trim();
  if (id.startsWith("#")) id = id.slice(1);
  // kompatibilita: pokud by někdo použil jen "4-1-1", uděláme z toho "section4-1-1"
  if (!id.startsWith("section") && /^\d/.test(id)) id = "section" + id;
  return id;
}

export function flattenNav(tree = NAV_TREE) {
  const out = [];
  const seen = new Set();

  const walk = (nodes) => {
    for (const n of nodes || []) {
      const href = n?.href || "";
      if (href.startsWith("#")) {
        const id = normalizeSectionId(href.slice(1));
        if (id && !seen.has(id)) {
          seen.add(id);
          out.push(id);
        }
      }
      if (n?.children?.length) walk(n.children);
    }
  };

  walk(tree);
  return out;
}
