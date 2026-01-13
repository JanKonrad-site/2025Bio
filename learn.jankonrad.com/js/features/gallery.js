/* assets/js/features/gallery.js
   Dependency-free gallery:
   - prev/next via [data-gallery-prev]/[data-gallery-next]
   - image lists via <div data-gallery-src="imgId" data-images='[...]'></div>
   - click image to open fullscreen lightbox (mobile fills screen)
*/
(function(){
  "use strict";

  const stateByImg = new WeakMap(); // imgEl -> {list, idx, id, metaEl}

  function safeParseJSON(str){
    try{ return JSON.parse(str || "[]"); }catch(e){ return []; }
  }

  function fileName(url){
    try{
      const u = new URL(url, window.location.href);
      return u.pathname.split("/").pop() || "";
    }catch(_){
      return (url || "").split("/").pop() || "";
    }
  }

  function getListForId(imgId, root){
    const holder = (root || document).querySelector('[data-gallery-src="'+CSS.escape(imgId)+'"]');
    if(!holder) return [];
    return safeParseJSON(holder.getAttribute("data-images"));
  }

  function ensureMetaEl(imgEl){
    const fig = imgEl.closest(".gcard");
    if(!fig) return null;
    const meta = fig.querySelector(".gmeta");
    return meta || null;
  }

  function setImage(imgEl, list, idx){
    if(!imgEl || !list || !list.length) return;
    const safeIdx = (idx + list.length) % list.length;
    imgEl.src = list[safeIdx];
    imgEl.dataset.gIndex = String(safeIdx);

    const meta = ensureMetaEl(imgEl);
    if(meta){
      meta.textContent = list.length > 1 ? `Obrázek ${safeIdx + 1} / ${list.length}` : "Obrázek";
    }
    // Preload neighbor(s)
    if(list.length > 1){
      const next = new Image();
      next.src = list[(safeIdx + 1) % list.length];
      const prev = new Image();
      prev.src = list[(safeIdx - 1 + list.length) % list.length];
    }
  }

  function moveById(imgId, dir, root){
    const imgEl = document.getElementById(imgId);
    if(!imgEl) return;

    const list = getListForId(imgId, root);
    if(!list.length) return;

    // Determine current index by dataset, then by filename match
    let idx = Number(imgEl.dataset.gIndex);
    if(!Number.isFinite(idx)){
      const current = fileName(imgEl.currentSrc || imgEl.src);
      idx = list.findIndex(u => fileName(u) === current);
      if(idx < 0) idx = 0;
    }
    const nextIdx = (idx + dir + list.length) % list.length;
    setImage(imgEl, list, nextIdx);

    stateByImg.set(imgEl, { list, idx: nextIdx, id: imgId });
  }

  // ------- Lightbox -------
  let lightboxEl = null;
  let lbImg = null;
  let lbTitle = null;
  let lbCounter = null;
  let lbPrev = null;
  let lbNext = null;
  let lbClose = null;

  let active = { list: [], idx: 0, sourceImg: null };

  function buildLightbox(){
    if(lightboxEl) return;

    const wrap = document.createElement("div");
    wrap.className = "img-viewer"; // uses CSS in site.css
    wrap.innerHTML = `
      <div class="img-viewer__panel" role="dialog" aria-modal="true" aria-label="Prohlížeč obrázků">
        <div class="img-viewer__top">
          <div class="img-viewer__title"></div>
          <button class="img-viewer__close" type="button" aria-label="Zavřít">✕</button>
        </div>
        <div class="img-viewer__stage">
          <button class="img-viewer__navBtn prev" type="button" aria-label="Předchozí">‹</button>
          <img class="img-viewer__img" alt="">
          <button class="img-viewer__navBtn next" type="button" aria-label="Další">›</button>
        </div>
        <div class="img-viewer__bottom">
          <span class="img-viewer__counter"></span>
          <span class="img-viewer__hint">Esc zavře · ←/→ listuje</span>
        </div>
      </div>
    `.trim();

    document.body.appendChild(wrap);

    lightboxEl = wrap;
    lbImg = wrap.querySelector(".img-viewer__img");
    lbTitle = wrap.querySelector(".img-viewer__title");
    lbCounter = wrap.querySelector(".img-viewer__counter");
    lbPrev = wrap.querySelector(".img-viewer__navBtn.prev");
    lbNext = wrap.querySelector(".img-viewer__navBtn.next");
    lbClose = wrap.querySelector(".img-viewer__close");

    // Close on overlay click (but not panel click)
    wrap.addEventListener("click", (e) => {
      if(e.target === wrap) closeLightbox();
    });

    lbClose.addEventListener("click", closeLightbox);
    lbPrev.addEventListener("click", () => step(-1));
    lbNext.addEventListener("click", () => step(1));

    // Touch swipe
    let startX = 0, startY = 0, activeTouch = false;
    wrap.addEventListener("touchstart", (e) => {
      if(!e.touches || e.touches.length !== 1) return;
      activeTouch = true;
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
    }, {passive:true});

    wrap.addEventListener("touchend", (e) => {
      if(!activeTouch) return;
      activeTouch = false;
      const t = (e.changedTouches && e.changedTouches[0]) ? e.changedTouches[0] : null;
      if(!t) return;
      const dx = t.clientX - startX;
      const dy = t.clientY - startY;
      if(Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)){
        step(dx > 0 ? -1 : 1);
      }
    }, {passive:true});
  }

  function renderLightbox(){
    const { list, idx } = active;
    if(!list.length) return;

    const url = list[idx];
    lbImg.src = url;
    lbImg.alt = `Obrázek ${idx + 1}`;
    lbTitle.textContent = fileName(url);
    lbCounter.textContent = list.length > 1 ? `Obrázek ${idx + 1} / ${list.length}` : "Obrázek";

    const many = list.length > 1;
    lbPrev.style.display = many ? "" : "none";
    lbNext.style.display = many ? "" : "none";
  }

  function openLightboxFromImg(imgEl){
    if(!imgEl) return;

    const id = imgEl.id || "";
    const list = id ? getListForId(id, document) : [];
    const effectiveList = list.length ? list : [imgEl.currentSrc || imgEl.src].filter(Boolean);

    let idx = 0;
    const curName = fileName(imgEl.currentSrc || imgEl.src);
    const found = effectiveList.findIndex(u => fileName(u) === curName);
    if(found >= 0) idx = found;

    buildLightbox();
    active = { list: effectiveList, idx, sourceImg: imgEl };

    document.documentElement.style.overflow = "hidden";
    lightboxEl.classList.add("is-open");
    renderLightbox();

    // Focus for keyboard
    lbClose.focus({preventScroll:true});
  }

  function closeLightbox(){
    if(!lightboxEl) return;
    lightboxEl.classList.remove("is-open");
    document.documentElement.style.overflow = "";
  }

  function step(dir){
    const { list } = active;
    if(!list.length) return;
    active.idx = (active.idx + dir + list.length) % list.length;
    renderLightbox();
  }

  function onKeyDown(e){
    if(!lightboxEl || !lightboxEl.classList.contains("is-open")) return;

    if(e.key === "Escape"){ e.preventDefault(); closeLightbox(); return; }
    if(e.key === "ArrowLeft"){ e.preventDefault(); step(-1); return; }
    if(e.key === "ArrowRight"){ e.preventDefault(); step(1); return; }
  }

  // ------- Init -------
  function initGallery(root){
    const scope = root || document;

    // Init meta counters (if .gmeta exists)
    scope.querySelectorAll("[data-gallery-src]").forEach(holder => {
      const imgId = holder.getAttribute("data-gallery-src");
      if(!imgId) return;

      const imgEl = document.getElementById(imgId);
      if(!imgEl) return;

      const list = safeParseJSON(holder.getAttribute("data-images"));
      if(!list.length) return;

      // Determine current index from src
      const current = fileName(imgEl.currentSrc || imgEl.src);
      let idx = list.findIndex(u => fileName(u) === current);
      if(idx < 0) idx = 0;

      setImage(imgEl, list, idx);

      // Ensure state
      stateByImg.set(imgEl, { list, idx, id: imgId });
    });

    // Event delegation for prev/next
    document.addEventListener("click", (e) => {
      const prevBtn = e.target.closest("[data-gallery-prev]");
      if(prevBtn){
        e.preventDefault();
        moveById(prevBtn.getAttribute("data-gallery-prev"), -1, scope);
        return;
      }
      const nextBtn = e.target.closest("[data-gallery-next]");
      if(nextBtn){
        e.preventDefault();
        moveById(nextBtn.getAttribute("data-gallery-next"), 1, scope);
        return;
      }

      // Click on image -> lightbox
      const img = e.target.closest("img.jk-media");
      if(img){
        e.preventDefault();
        openLightboxFromImg(img);
      }
    }, { passive: false });

    document.addEventListener("keydown", onKeyDown, { passive: false });
  }

  // Expose + auto-run
  window.initGallery = initGallery;
  if(document.readyState === "loading"){
    document.addEventListener("DOMContentLoaded", () => initGallery(document));
  }else{
    initGallery(document);
  }
})();
