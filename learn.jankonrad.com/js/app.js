/* js/app.js (SAFE)
   Pokud ti "nejede nic" (ani router ani theme), je to typicky tím,
   že JEDEN z importů neexistuje -> modulový loader shodí celou aplikaci.

   Tato verze:
   - importuje pouze CORE (nutné soubory)
   - features načítá DYNAMIC importem (chyba feature nezastaví app)
*/
import { NAV_TREE, flattenNav, normalizeSectionId } from "./core/manifest.js";
import { createLoader } from "./core/loader.js";
import { createRouter } from "./core/router.js";
import { initNav } from "./core/nav.js";
import { initScrollSpy } from "./core/scrollspy.js";
import { initModalRuntime } from "./core/ui-modal.js";
import { initCollapseRuntime } from "./core/ui-collapse.js";
import { initThemeSwitcher } from "./core/theme.js";

console.info("[APP] starting…", import.meta.url);

function byId(id) { return document.getElementById(id); }

function safeInit(fn, name) {
  try { fn?.(); console.info(`[APP] init ok: ${name}`); }
  catch (e) { console.error(`[APP] init failed: ${name}`, e); }
}

async function safeImport(path, exportName) {
  try {
    const mod = await import(path);
    const fn = mod?.[exportName];
    if (typeof fn === "function") {
      fn();
      console.info(`[APP] feature ok: ${exportName} from ${path}`);
    } else {
      console.warn(`[APP] feature missing export ${exportName} in ${path}`);
    }
  } catch (e) {
    console.warn(`[APP] feature import failed: ${path}`, e);
  }
}

(() => {
  const html = document.documentElement;

  const siteNavbar = byId("siteNavbar");
  const docToolbar = byId("docToolbar");
  const docMenuBtn = byId("docMenuBtn");
  const overlay = byId("overlay");

  const navRoot = byId("docNav");
  const searchInput = byId("navSearch");
  const clearBtn = byId("clearSearchBtn"); // může být null

  const scrollContainer = byId("scrollspyContent") || document.body;
  const contentMount = byId("content") || scrollContainer;

  // sticky heights
  function updateHeights() {
    html.style.setProperty("--site-nav-h", (siteNavbar?.offsetHeight || 64) + "px");
    html.style.setProperty("--doc-toolbar-h", (docToolbar?.offsetHeight || 56) + "px");
  }
  window.addEventListener("resize", updateHeights, { passive: true });
  window.addEventListener("load", updateHeights, { passive: true });
  updateHeights();

  // mobile nav toggle
  function setNavOpen(open) {
    document.body.classList.toggle("nav-open", !!open);
    docMenuBtn?.setAttribute("aria-expanded", open ? "true" : "false");
    overlay?.setAttribute("aria-hidden", open ? "false" : "true");
  }
  docMenuBtn?.addEventListener("click", () => setNavOpen(!document.body.classList.contains("nav-open")));
  overlay?.addEventListener("click", () => setNavOpen(false));
  window.addEventListener("keydown", (e) => { if (e.key === "Escape") setNavOpen(false); });

  // core runtimes
  safeInit(() => initThemeSwitcher({
    buttonId: "themeBtn",
    menuId: "themeMenu",
    labelSelector: ".themeLabel",
    storageKey: "jk-theme",
  }), "theme");

  safeInit(initModalRuntime, "modalRuntime");
  safeInit(initCollapseRuntime, "collapseRuntime");

  // nav
  const navApi = initNav({
    navRoot,
    tree: NAV_TREE,
    searchInput,
    clearBtn,
    onNavigateRequest: (rawId) => router.go(rawId, { behavior: "smooth" }),
    onMobileCloseRequest: () => {
      if (window.matchMedia("(max-width: 980px)").matches) setNavOpen(false);
    },
  });

  // loader — TADY je pro tebe klíčová cesta:
  // kapitoly existují na: /learn.jankonrad.com/sections/section1-1.html
  const loader = createLoader({
    mount: contentMount,
    basePaths: ["/learn.jankonrad.com/sections"],
    extension: ".html",
    wrapperClass: "section-wrapper",
    placeholderOnError: true,
  });

  const router = createRouter({
    normalize: normalizeSectionId,
    ensureLoaded: (id) => loader.ensure(id),
    setActiveUI: (id) => navApi.setActive(id),
  });

  const spy = initScrollSpy({
    container: scrollContainer,
    getSectionIds: () => flattenNav(NAV_TREE).map(normalizeSectionId),
    onActiveFromScroll: (id) => router.setActiveFromScroll(id),
  });

  // lazy bootstrap (načte jen hash nebo první kapitolu)
  (async () => {
    const ids = flattenNav(NAV_TREE).map(normalizeSectionId);
    const hashId = normalizeSectionId((location.hash || "").slice(1));
    const firstId = ids[0];

    if (hashId) await router.go(hashId, { behavior: "auto", push: false });
    else if (firstId) await router.go(firstId, { behavior: "auto", push: false });

    router.start();
    spy.refresh();

    console.info("[APP] ready.");
  })().catch((e) => console.error("[APP] bootstrap failed:", e));

  // OPTIONAL features (neblokují app, pokud soubory chybí)
  // Přizpůsob si cesty/názvy podle toho, jak se ti jmenují soubory na disku.
  safeImport("./features/copy.js", "initCopy");
  safeImport("./features/quiz.js", "initQuiz");
  safeImport("./features/gallery.js", "initGallery");
  safeImport("./features/simulations.js", "initSimulations"); // pozor: simulations.js (plural)
  safeImport("./features/quadratic.js", "initQuadratic");
  safeImport("./features/img-viewer.js", "initImgViewers");
  safeImport("./features/jc-runner.js", "initJcRunner");
})();