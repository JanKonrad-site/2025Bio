// assets/js/features/gallery.js
// Podpora:
//  A) Legacy markup:
//     - <img id="img-x" ...>
//     - <button data-gallery-prev="img-x"> ... </button>
//     - <button data-gallery-next="img-x"> ... </button>
//     - <div data-gallery-src="img-x" data-images='[...]'></div>
//
//  B) Modern markup (volitelné, můžeš migrovat postupně):
//     <div class="jk-gallery" data-images='[...]'>
//       <div class="jk-frame is-16x9"><img ...></div>
//       <div class="jk-gallerybar">...</div>
//     </div>

const SELECTOR_HOLDER = "[data-gallery-src][data-images], .jk-gallery[data-images]";
const SELECTOR_LEGACY_PREV = "[data-gallery-prev]";
const SELECTOR_LEGACY_NEXT = "[data-gallery-next]";

function safeJsonParse(str, fallback = []) {
  try {
    const v = JSON.parse(str || "[]");
    return Array.isArray(v) ? v : fallback;
  } catch {
    return fallback;
  }
}

function fileName(url) {
  try { return new URL(url, location.href).pathname.split("/").pop() || ""; }
  catch { return String(url).split("/").pop() || ""; }
}

function getLegacyListByImgId(imgId) {
  const holder = document.querySelector(`[data-gallery-src="${CSS.escape(imgId)}"]`);
  if (!holder) return [];
  return safeJsonParse(holder.getAttribute("data-images"), []);
}

function setImgSrc(img, src) {
  if (!img || !src) return;
  img.src = src;
  img.loading = img.loading || "lazy";
  img.decoding = img.decoding || "async";
}

function getIndexByCurrentSrc(img, list) {
  if (!img || !list?.length) return 0;
  const current = fileName(img.currentSrc || img.src || "");
  let idx = list.findIndex((x) => fileName(x) === current);
  if (idx < 0) idx = 0;
  return idx;
}

function ensureZoomable(img) {
  if (!img) return;
  img.classList.add("jk-zoomable");
}

function enhanceLegacyBar(imgId, list) {
  const img = document.getElementById(imgId);
  if (!img) return;

  // Najdi nejbližší bar (v tvém HTML je to d-flex ...), pokud existuje -> doplníme tečky + counter
  const bar = img.closest(".accordion-body")?.querySelector(`[data-gallery-prev="${CSS.escape(imgId)}"]`)?.closest("div");
  if (!bar) return;

  // už doplněno
  if (bar.querySelector(".jk-gmeta")) return;

  const meta = document.createElement("div");
  meta.className = "jk-gmeta";
  meta.setAttribute("data-gallery-meta", imgId);
  meta.textContent = list.length ? `1 / ${list.length}` : "";

  const dots = document.createElement("div");
  dots.className = "jk-dots";
  dots.setAttribute("data-gallery-dots", imgId);

  for (let i = 0; i < list.length; i++) {
    const dot = document.createElement("span");
    dot.className = "jk-dot" + (i === 0 ? " is-active" : "");
    dot.setAttribute("data-gallery-jump", imgId);
    dot.setAttribute("data-index", String(i));
    dots.appendChild(dot);
  }

  // vložíme doprostřed bar (mezi tlačítka / text)
  bar.style.gap = bar.style.gap || "10px";
  bar.appendChild(meta);
  bar.appendChild(dots);
}

function updateLegacyUI(imgId, idx, total) {
  const meta = document.querySelector(`[data-gallery-meta="${CSS.escape(imgId)}"]`);
  if (meta) meta.textContent = `${idx + 1} / ${total}`;

  const dotsWrap = document.querySelector(`[data-gallery-dots="${CSS.escape(imgId)}"]`);
  if (dotsWrap) {
    [...dotsWrap.querySelectorAll(".jk-dot")].forEach((d, i) => {
      d.classList.toggle("is-active", i === idx);
    });
  }
}

function moveLegacy(imgId, dir) {
  const img = document.getElementById(imgId);
  if (!img) return;

  const list = getLegacyListByImgId(imgId);
  if (!list.length) return;

  ensureZoomable(img);
  enhanceLegacyBar(imgId, list);

  const idx = getIndexByCurrentSrc(img, list);
  const next = (idx + dir + list.length) % list.length;

  setImgSrc(img, list[next]);
  updateLegacyUI(imgId, next, list.length);
  preloadNeighbors(list, next);
}

/* ===== Fullscreen viewer ========================================= */

let viewerEl = null;
let viewerState = { list: [], idx: 0, title: "" };

function buildViewer() {
  const root = document.createElement("div");
  root.className = "jk-viewer";
  root.innerHTML = `
    <div class="jk-viewer-backdrop" data-v-backdrop></div>
    <div class="jk-viewer-panel" role="dialog" aria-modal="true" aria-label="Prohlížeč obrázků">
      <div class="jk-viewer-top">
        <div class="jk-viewer-title" data-v-title></div>
        <button class="jk-viewer-close" type="button" data-v-close aria-label="Zavřít">✕</button>
      </div>

      <div class="jk-viewer-stage" data-v-stage>
        <img data-v-img alt="">
      </div>

      <div class="jk-viewer-nav">
        <button class="jk-gbtn" type="button" data-v-prev>◀ Předchozí</button>
        <button class="jk-gbtn" type="button" data-v-next>Další ▶</button>
      </div>
    </div>
  `;
  document.body.appendChild(root);
  return root;
}

function openViewer(list, idx, title = "") {
  if (!list?.length) return;

  if (!viewerEl) viewerEl = buildViewer();
  viewerState = { list, idx: Math.max(0, Math.min(idx, list.length - 1)), title };

  viewerEl.classList.add("is-open");
  document.documentElement.style.overflow = "hidden";

  renderViewer();
}

function closeViewer() {
  if (!viewerEl) return;
  viewerEl.classList.remove("is-open");
  document.documentElement.style.overflow = "";
}

function renderViewer() {
  if (!viewerEl) return;
  const titleEl = viewerEl.querySelector("[data-v-title]");
  const imgEl = viewerEl.querySelector("[data-v-img]");
  if (!imgEl) return;

  const { list, idx, title } = viewerState;
  const src = list[idx];

  titleEl.textContent = title ? `${title} — ${idx + 1} / ${list.length}` : `${idx + 1} / ${list.length}`;
  imgEl.alt = title || "Obrázek";
  imgEl.src = src;

  preloadNeighbors(list, idx);
}

function stepViewer(dir) {
  const { list, idx } = viewerState;
  if (!list.length) return;
  viewerState.idx = (idx + dir + list.length) % list.length;
  renderViewer();
}

function preloadNeighbors(list, idx) {
  const preload = (i) => {
    const src = list[i];
    if (!src) return;
    const im = new Image();
    im.decoding = "async";
    im.src = src;
  };
  if (list.length > 1) {
    preload((idx + 1) % list.length);
    preload((idx - 1 + list.length) % list.length);
  }
}

/* ===== Init + delegation ========================================= */

function enhanceAllLegacyIn(root = document) {
  // pokud existují holders, zkusíme doplnit zoom a meta UI
  root.querySelectorAll("[data-gallery-src][data-images]").forEach((holder) => {
    const imgId = holder.getAttribute("data-gallery-src");
    if (!imgId) return;

    const img = document.getElementById(imgId);
    if (!img) return;

    ensureZoomable(img);

    const list = safeJsonParse(holder.getAttribute("data-images"), []);
    enhanceLegacyBar(imgId, list);
    const idx = getIndexByCurrentSrc(img, list);
    updateLegacyUI(imgId, idx, list.length);
  });
}

function attachObserver() {
  // reaguj na nové kapitoly přidané loaderem
  const mount = document.getElementById("content") || document.body;
  const mo = new MutationObserver((mutations) => {
    for (const m of mutations) {
      for (const n of m.addedNodes) {
        if (!(n instanceof Element)) continue;
        if (n.matches?.(SELECTOR_HOLDER) || n.querySelector?.(SELECTOR_HOLDER)) {
          enhanceAllLegacyIn(n);
        }
      }
    }
  });
  mo.observe(mount, { childList: true, subtree: true });
}

export function initGallery() {
  // initial pass (pokud je první kapitola už v DOM)
  enhanceAllLegacyIn(document);
  attachObserver();

  document.addEventListener("click", (e) => {
    const prev = e.target.closest?.(SELECTOR_LEGACY_PREV);
    if (prev) {
      e.preventDefault();
      const imgId = prev.getAttribute("data-gallery-prev");
      if (imgId) moveLegacy(imgId, -1);
      return;
    }

    const next = e.target.closest?.(SELECTOR_LEGACY_NEXT);
    if (next) {
      e.preventDefault();
      const imgId = next.getAttribute("data-gallery-next");
      if (imgId) moveLegacy(imgId, +1);
      return;
    }

    const dot = e.target.closest?.("[data-gallery-jump][data-index]");
    if (dot) {
      e.preventDefault();
      const imgId = dot.getAttribute("data-gallery-jump");
      const idx = parseInt(dot.getAttribute("data-index") || "0", 10);
      const img = document.getElementById(imgId);
      const list = getLegacyListByImgId(imgId);
      if (img && list.length) {
        setImgSrc(img, list[idx]);
        updateLegacyUI(imgId, idx, list.length);
        preloadNeighbors(list, idx);
      }
      return;
    }

    // klik na obrázek => fullscreen
    const img = e.target.closest?.("img");
    if (img && img.id) {
      const list = getLegacyListByImgId(img.id);
      if (list.length) {
        e.preventDefault();
        const idx = getIndexByCurrentSrc(img, list);
        const title = img.alt || "";
        openViewer(list, idx, title);
      }
    }

    // viewer kliky
    if (viewerEl?.classList.contains("is-open")) {
      if (e.target.closest?.("[data-v-close]") || e.target.closest?.("[data-v-backdrop]")) {
        e.preventDefault();
        closeViewer();
        return;
      }
      if (e.target.closest?.("[data-v-prev]")) { e.preventDefault(); stepViewer(-1); return; }
      if (e.target.closest?.("[data-v-next]")) { e.preventDefault(); stepViewer(+1); return; }
    }
  }, { passive: false });

  document.addEventListener("keydown", (e) => {
    if (!viewerEl?.classList.contains("is-open")) return;
    if (e.key === "Escape") closeViewer();
    if (e.key === "ArrowLeft") stepViewer(-1);
    if (e.key === "ArrowRight") stepViewer(+1);
  });
}
