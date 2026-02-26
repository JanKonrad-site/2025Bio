(() => {
  "use strict";

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const sections = $$(".pageSection");

  // HUB / tiles
  const hub = $("#hub");
  const hubGrid = $(".hubGrid", hub);
  const hubTiles = $$("[data-open]", hubGrid);

  // Inline open containers
  const hubOpen = $("#hubOpen");
  const hubOpenHeader = $("#hubOpenHeader");
  const hubOpenScroller = $("#hubOpenScroller");
  // Content sources (we reuse the existing panel contents already in HTML)
  const sources = {
    about: $("#panel-about .panel__inner"),
    teaching: $("#panel-teaching .panel__inner"),
    projects: $("#panel-projects .panel__inner"),
  };

  // Contact sheet (stays as-is)
  const sheet = $("#contactSheet");
  const sheetScrim = $("#sheetScrim");
  // Gallery modal (fullscreen)
  const galleryModal = $("#galleryModal");
  // Project modal (fullscreen)
  const projectModal = $("#projectModal");


  let activeKey = null;
  let activeTile = null;
  let activePlaceholder = null;

  let sheetOpen = false;
  let galleryOpen = false;
  let projectOpen = false;

  // ---------------------------
  // Soft lock (prevents paging spam)
  // + Swallow window scroll inertia after close (prevents jump to hero)
  // ---------------------------
  let lockUntil = 0;
  let swallowUntil = 0;

  const BASE_LOCK_MS = prefersReduced ? 0 : 700;
  const SWALLOW_MS   = prefersReduced ? 0 : 900;

  function lock(ms = BASE_LOCK_MS) { lockUntil = Date.now() + ms; }
  function locked() { return Date.now() < lockUntil; }

  function swallow(ms = SWALLOW_MS) { swallowUntil = Date.now() + ms; }
  function swallowing() { return Date.now() < swallowUntil; }

  function scrollToSection(index, behavior = "smooth") {
    const el = sections[index];
    if (!el) return;
    el.scrollIntoView({ behavior: prefersReduced ? "auto" : behavior, block: "start" });
  }

  function currentSectionIndex() {
    const vh = window.innerHeight || 1;
    let best = 0;
    let bestDist = Infinity;

    sections.forEach((sec, i) => {
      const r = sec.getBoundingClientRect();
      const center = r.top + r.height / 2;
      const dist = Math.abs(center - vh / 2);
      if (dist < bestDist) {
        bestDist = dist;
        best = i;
      }
    });

    return best;
  }

  // ---------------------------
  // Robust scrollY getter (works even if body is fixed)
  // ---------------------------
  function getScrollY() {
    const top = document.body.style.top;
    if (document.body.style.position === "fixed" && top) {
      const n = parseInt(top, 10);
      if (!Number.isNaN(n)) return Math.abs(n);
    }
    return window.scrollY || window.pageYOffset || document.documentElement.scrollTop || 0;
  }

  // ---------------------------
  // Scroll-lock without jump (body fixed) for contact sheet only
  // ---------------------------
  let scrollLockCount = 0;
  let lockedScrollY = 0;

  function lockPageScroll() {
    scrollLockCount += 1;
    if (scrollLockCount !== 1) return;

    lockedScrollY = getScrollY();

    document.body.style.position = "fixed";
    document.body.style.top = `-${lockedScrollY}px`;
    document.body.style.left = "0";
    document.body.style.right = "0";
    document.body.style.width = "100%";
  }

  function unlockPageScroll() {
    if (scrollLockCount === 0) return;
    scrollLockCount -= 1;
    if (scrollLockCount !== 0) return;

    document.body.style.position = "";
    document.body.style.top = "";
    document.body.style.left = "";
    document.body.style.right = "";
    document.body.style.width = "";

    window.scrollTo({ top: lockedScrollY, left: 0, behavior: "auto" });
  }

  // ---------------------------
  // Force stay on section (prevents hero flash after closing sheet)
  // ---------------------------
  let restoreIndex = 0;

  function forceStayOnSection(index) {
    restoreIndex = Math.max(0, Math.min(sections.length - 1, index));

    const prevSB = document.documentElement.style.scrollBehavior;
    document.documentElement.style.scrollBehavior = "auto";

    const prevSnap = document.body.style.scrollSnapType;
    document.body.style.scrollSnapType = "none";

    sections[restoreIndex]?.scrollIntoView({ behavior: "auto", block: "start" });

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        document.documentElement.style.scrollBehavior = prevSB;
        document.body.style.scrollSnapType = prevSnap;
      });
    });

    swallow();
    lock(600);
  }

  // ---------------------------
  // Swallow wheel/touch inertia AFTER closing sheet / inline close
  // ---------------------------
  window.addEventListener(
    "wheel",
    (e) => {
      if (activeKey || sheetOpen || galleryOpen || projectOpen) return; // allow scrolling inside inline scroller/sheet
      if (!swallowing()) return;
      e.preventDefault();
      e.stopPropagation();
    },
    { passive: false, capture: true }
  );

  window.addEventListener(
    "touchmove",
    (e) => {
      if (activeKey || sheetOpen || galleryOpen || projectOpen) return;
      if (!swallowing()) return;
      e.preventDefault();
      e.stopPropagation();
    },
    { passive: false, capture: true }
  );

  // ---------------------------
  // Inline open (FLIP move tile into header)
  // ---------------------------
  function flipMove(tile, firstRect, lastRect) {
    const dx = firstRect.left - lastRect.left;
    const dy = firstRect.top - lastRect.top;
    const sx = firstRect.width / lastRect.width;
    const sy = firstRect.height / lastRect.height;

    tile.style.transition = "transform 0ms";
    tile.style.transformOrigin = "top left";
    tile.style.transform = `translate(${dx}px, ${dy}px) scale(${sx}, ${sy})`;
    tile.getBoundingClientRect(); // force reflow

    tile.style.transition = `transform var(--t-slow) var(--ease)`;
    tile.style.transform = "translate(0px, 0px) scale(1, 1)";

    const clean = () => {
      tile.style.transition = "";
      tile.style.transform = "";
      tile.style.transformOrigin = "";
      tile.removeEventListener("transitionend", clean);
    };
    tile.addEventListener("transitionend", clean);
  }

  function openInline(key, tile) {
    if (!hub || !hubOpen || !hubOpenHeader || !hubOpenScroller) return;
    if (activeKey) return; // only one at a time
    if (!sources[key]) return;

    // close sheet if open
    closeSheet(false);

    activeKey = key;
    activeTile = tile;

    // remember section index to keep paging stable
    restoreIndex = currentSectionIndex();

    // build scroller content from existing panel inner
    hubOpenScroller.innerHTML = "";
    hubOpenScroller.appendChild(Object.assign(document.createElement("div"), {
      className: "panel__inner",
      innerHTML: sources[key].innerHTML
    }));
    hubOpenScroller.scrollTop = 0;

    // mark hub state for CSS
    hub.classList.add("is-open");
    hub.dataset.openKey = key;

    // move tile into header with FLIP
    const first = tile.getBoundingClientRect();

    activePlaceholder = document.createElement("div");
    activePlaceholder.className = "tilePlaceholder";
    activePlaceholder.style.height = `${first.height}px`;
    tile.parentNode.insertBefore(activePlaceholder, tile);

    hubOpenHeader.innerHTML = "";
    hubOpenHeader.appendChild(tile);
    tile.classList.add("tile--inHeader");

    const last = tile.getBoundingClientRect();
    flipMove(tile, first, last);

    // show inline area
    hubOpen.setAttribute("aria-hidden", "false");

    // keep hub aligned
    hub.scrollIntoView({ behavior: prefersReduced ? "auto" : "smooth", block: "start" });

    lock(450);
  }

  function closeInline() {
    if (projectOpen) closeProjectModal(false);
    if (galleryOpen) closeGalleryModal(false);
    if (!activeKey || !activeTile) return;

    const tile = activeTile;

    // FLIP back to placeholder position
    const first = tile.getBoundingClientRect();

    if (activePlaceholder && activePlaceholder.parentNode) {
      activePlaceholder.parentNode.insertBefore(tile, activePlaceholder);
      activePlaceholder.remove();
    }

    const last = tile.getBoundingClientRect();
    flipMove(tile, first, last);

    tile.classList.remove("tile--inHeader");

    // reset state
    activeKey = null;
    activeTile = null;
    activePlaceholder = null;

    hub.classList.remove("is-open");
    delete hub.dataset.openKey;

    hubOpen.setAttribute("aria-hidden", "true");
    hubOpenHeader.innerHTML = "";
    hubOpenScroller.innerHTML = "";

    // swallow inertia so we don't page to hero by accident
    forceStayOnSection(restoreIndex);
  }

  // tile handlers (toggle)
hubTiles.forEach((t) => {
  t.addEventListener("click", (e) => {
    const key = t.getAttribute("data-open");
    if (!key) return;

    // if the tile is currently in the header, treat click as "back/close"
    if (activeKey && activeTile === t) {
      e.preventDefault();
      closeInline();
      return;
    }

    openInline(key, t);
  });
});

// ---------------------------
  // Contact sheet
  // ---------------------------
  function openSheet() {
    if (sheetOpen) return;
    if (!sheet) return;
    if (activeKey) return; // don't open while inline is active

    restoreIndex = currentSectionIndex();

    sheetOpen = true;
    document.documentElement.classList.add("is-sheet-open");
    sheet.setAttribute("aria-hidden", "false");

    lockPageScroll();
    lock();

    const scroller = $(".contactSheet__scroller", sheet);
    scroller?.focus({ preventScroll: true });
  }

  function closeSheet(restore = true) {
    if (!sheetOpen) return;

    sheetOpen = false;
    document.documentElement.classList.remove("is-sheet-open");
    sheet?.setAttribute("aria-hidden", "true");

    unlockPageScroll();

    if (restore) forceStayOnSection(restoreIndex);
  }

  // contact tile click
  const contactTile = $("[data-sheet='contact']", hubGrid);
  contactTile?.addEventListener("click", (e) => {
    e.preventDefault();
    openSheet();
  });

  // close buttons / scrim
  $$("[data-sheet-close]").forEach((b) => {
    b.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      closeSheet(true);
    });
  });

  sheetScrim?.addEventListener("click", (e) => {
    e.preventDefault();
    closeSheet(true);
  });

  // sheet: wheel up closes when scroller is at top
  window.addEventListener(
    "wheel",
    (e) => {
      if (!sheetOpen) return;
      if (locked()) return;

      const scroller = sheet ? $(".contactSheet__scroller", sheet) : null;
      if (!scroller) return;

      if (e.deltaY < 0 && scroller.scrollTop <= 0) {
        e.preventDefault();
        closeSheet(true);
      }
    },
    { passive: false }
  );

  // ---------------------------
  // Keyboard
  // ---------------------------
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      if (projectOpen) closeProjectModal(true);
      else if (galleryOpen) closeGalleryModal(true);
      else if (activeKey) closeInline();
      else if (sheetOpen) closeSheet(true);
    }
  });

  // ---------------------------
  // Auto paging (wheel/touch)
  // - disabled while inline open or sheet open
  // ---------------------------
  window.addEventListener(
    "wheel",
    (e) => {
      if (activeKey || sheetOpen || galleryOpen || projectOpen) return;

      if (swallowing()) {
        e.preventDefault();
        return;
      }

      if (locked()) return;

      if (Math.abs(e.deltaY) < Math.abs(e.deltaX)) return;
      if (Math.abs(e.deltaY) < 12) return;

      const i = currentSectionIndex();
      const dir = e.deltaY > 0 ? 1 : -1;

      // hero -> hub
      if (i === 0 && dir > 0) {
        e.preventDefault();
        scrollToSection(1, "smooth");
        lock();
        return;
      }

      // hub -> hero
      if (i === 1 && dir < 0) {
        e.preventDefault();
        scrollToSection(0, "smooth");
        lock();
        return;
      }

      // hub down => open contact sheet
      if (i === 1 && dir > 0) {
        e.preventDefault();
        openSheet();
        return;
      }
    },
    { passive: false }
  );

  // touch paging
  let startY = null;

  window.addEventListener(
    "touchstart",
    (e) => {
      if (activeKey || sheetOpen || galleryOpen || projectOpen) return;
      startY = e.touches?.[0]?.clientY ?? null;
    },
    { passive: true }
  );

  window.addEventListener(
    "touchend",
    (e) => {
      if (activeKey || sheetOpen || galleryOpen || projectOpen) return;
      if (locked()) return;
      if (startY == null) return;

      const endY = e.changedTouches?.[0]?.clientY ?? startY;
      const dy = startY - endY;
      startY = null;

      if (Math.abs(dy) < 50) return;

      const i = currentSectionIndex();
      const dir = dy > 0 ? 1 : -1;

      if (i === 0 && dir > 0) {
        scrollToSection(1, "smooth");
        lock();
        return;
      }
      if (i === 1 && dir < 0) {
        scrollToSection(0, "smooth");
        lock();
        return;
      }
      if (i === 1 && dir > 0) {
        openSheet();
        return;
      }
    },
    { passive: true }
  );

  // ---------------------------
  // Jump buttons (data-jump) (kept)
  // ---------------------------
  $$("[data-jump]").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const t = btn.getAttribute("data-jump");
      if (!t) return;
      e.preventDefault();
      const el = $(t);
      el?.scrollIntoView({ behavior: prefersReduced ? "auto" : "smooth", block: "start" });
      lock();
    });
  });



  
// ---------------------------
// TOUCH flip cards: first tap flips, second tap opens the link
// ---------------------------
const isCoarsePointer = window.matchMedia("(hover:none) and (pointer:coarse)").matches;

document.addEventListener("click", (e) => {
  if (!isCoarsePointer) return;

  const card = e.target.closest(".flipCard");
  if (card) {
    const isProject = card.hasAttribute("data-project-open");

    if (!card.classList.contains("is-flipped")) {
      e.preventDefault();
      $$(".flipCard.is-flipped").forEach((c) => c.classList.remove("is-flipped"));
      card.classList.add("is-flipped");
      return;
    }

    // second tap:
    if (isProject) {
      e.preventDefault();
      e.stopPropagation();
      openProjectModalFromCard(card);
      return;
    }

    return; // already flipped -> allow navigation
  }

  // tap outside -> unflip
  $$(".flipCard.is-flipped").forEach((c) => c.classList.remove("is-flipped"));
});

// ---------------------------
  // Gallery + Carousel (delegated; works even for inline-copied HTML)
  // ---------------------------
  let galleryReturnFocus = null;
  let galleryCloseTimer = 0;

  function openGalleryModal(key = "about") {
    if (!galleryModal || galleryOpen) return;

    galleryOpen = true;
    galleryReturnFocus = document.activeElement;
    if (galleryCloseTimer) { clearTimeout(galleryCloseTimer); galleryCloseTimer = 0; }

    // ensure sheet is closed
    if (sheetOpen) closeSheet(false);

    galleryModal.hidden = false;
    galleryModal.setAttribute("aria-hidden", "false");
    requestAnimationFrame(() => galleryModal.classList.add("is-open"));

    lockPageScroll();
    lock(450);

    const car = $("[data-carousel]", galleryModal);
    ensureCarouselInit(car);

    // reset to the first slide on open
    const parts = car ? getCarouselParts(car) : null;
    if (parts && parts.vp && parts.slides && parts.slides.length) {
      scrollToSlide(parts.vp, parts.slides, 0, "auto");
    }

    const vp = $("[data-carousel-viewport]", galleryModal);
    vp && vp.focus && vp.focus({ preventScroll: true });
  }

  function closeGalleryModal(restoreFocus = true) {
    if (!galleryModal || !galleryOpen) return;

    galleryOpen = false;
    galleryModal.classList.remove("is-open");
    galleryModal.setAttribute("aria-hidden", "true");

    const finish = () => {
      if (galleryOpen) return; // reopened in the meantime
      galleryModal.hidden = true;
      galleryModal.removeEventListener("transitionend", finish);
    };

    galleryModal.addEventListener("transitionend", finish);
    galleryCloseTimer = window.setTimeout(finish, prefersReduced ? 0 : 650);

    unlockPageScroll();

    if (restoreFocus && galleryReturnFocus && typeof galleryReturnFocus.focus === "function") {
      try { galleryReturnFocus.focus({ preventScroll: true }); } catch (err) {}
    }
    galleryReturnFocus = null;
  }


  // ---------------------------
  // Project modal (fullscreen carousel + link)
  // ---------------------------
  let projectReturnFocus = null;
  let projectCloseTimer = 0;

  function parseCsvList(s){
    return String(s || "")
      .split(",")
      .map((x) => x.trim())
      .filter(Boolean);
  }
  function refreshCarouselUI(carouselEl, { resetTo = null } = {}){
    if (!carouselEl) return;

    const { vp, slides, dotsWrap, range } = getCarouselParts(carouselEl);
    if (!vp) return;

    // Dots (rebuild if count changed)
    if (dotsWrap){
      if (dotsWrap.children.length !== slides.length){
        dotsWrap.innerHTML = "";
        slides.forEach((_, i) => {
          const b = document.createElement("button");
          b.type = "button";
          b.className = "carouselDot";
          b.setAttribute("aria-label", `Snímek ${i + 1}`);
          b.dataset.carouselDot = String(i);
          dotsWrap.appendChild(b);
        });
      }
    }

    // Range
    if (range){
      range.max = String(Math.max(0, slides.length - 1));
      if (resetTo !== null){
        range.value = String(Math.max(0, Math.min(slides.length - 1, resetTo)));
      } else {
        const v = Number(range.value || 0);
        range.value = String(Math.max(0, Math.min(slides.length - 1, v)));
      }
    }

    // Current index indicator
    if (slides.length){
      const idx =
        resetTo !== null
          ? Math.max(0, Math.min(slides.length - 1, resetTo))
          : getClosestSlideIndex(vp, slides);

      if (range) range.value = String(idx);
      if (dotsWrap){
        $$(".carouselDot", dotsWrap).forEach((d, i) => d.setAttribute("aria-current", i === idx ? "true" : "false"));
      }
    }
  }

  function hydrateProjectModalFromCard(card){
    if (!projectModal || !card) return;

    const titleEl = $("#projectModalTitle", projectModal);
    const descEl  = $("#projectModalDesc", projectModal);
    const tagsEl  = $("#projectModalTags", projectModal);
    const metaEl  = $("#projectModalMeta", projectModal);

    const track = $("#projectModalTrack", projectModal);
    const action = $("[data-project-action]", projectModal);
    const carousel = $("[data-project-carousel]", projectModal) || $("[data-carousel]", projectModal);

    const title =
      card.getAttribute("data-project-title") ||
      card.querySelector(".flipCard__title")?.textContent?.trim() ||
      "Projekt";

    const url = card.getAttribute("href") || card.getAttribute("data-project-url") || "#";

    const desc =
      card.getAttribute("data-project-desc") ||
      card.getAttribute("data-project-description") ||
      card.querySelector(".projDesc")?.textContent?.trim() ||
      "";

    const images = (() => {
      const fromAttr = parseCsvList(card.getAttribute("data-project-images"));
      if (fromAttr.length) return fromAttr;

      const img = card.querySelector("img")?.getAttribute("src");
      return img ? [img] : [];
    })();

    if (titleEl) titleEl.textContent = title;

    if (descEl){
      descEl.textContent = desc;
      descEl.toggleAttribute("hidden", !desc);
    }

    if (tagsEl){
      tagsEl.innerHTML = "";
      const tags = $$(".projTags .tag", card).map((t) => t.textContent.trim()).filter(Boolean);
      tags.forEach((t) => {
        const span = document.createElement("span");
        span.className = "tag";
        span.textContent = t;
        tagsEl.appendChild(span);
      });
      tagsEl.toggleAttribute("hidden", tags.length === 0);
    }

    if (metaEl){
      metaEl.innerHTML = "";
      const rows = $$(".projMeta__row", card).map((row) => ({
        k: row.querySelector(".projMeta__k")?.textContent?.trim() || "",
        v: row.querySelector(".projMeta__v")?.textContent?.trim() || "",
      })).filter((r) => r.k || r.v);

      rows.forEach(({ k, v }) => {
        const div = document.createElement("div");
        div.className = "pmMeta__row";

        const sk = document.createElement("span");
        sk.className = "pmMeta__k";
        sk.textContent = k;

        const sv = document.createElement("span");
        sv.className = "pmMeta__v";
        sv.textContent = v;

        div.appendChild(sk);
        div.appendChild(sv);
        metaEl.appendChild(div);
      });

      metaEl.toggleAttribute("hidden", rows.length === 0);
    }

    if (action){
      action.href = url || "#";
      action.target = card.getAttribute("target") || "_blank";
      action.rel = card.getAttribute("rel") || "noopener";

      const disabled = !url || url === "#";
      action.toggleAttribute("aria-disabled", disabled);
      action.classList.toggle("is-disabled", disabled);
      action.tabIndex = disabled ? -1 : 0;
    }

    if (track){
      const safeAlt = `${title} – ukázka`;
      track.innerHTML = (images.length ? images : [""]).map((src, i) => {
        const s = src ? String(src) : "";
        const alt = images.length ? `${safeAlt} ${i + 1}` : safeAlt;
        return `<figure class="carousel__slide">${s ? `<img src="${s}" alt="${alt}" loading="lazy" />` : ""}</figure>`;
      }).join("");
    }

    ensureCarouselInit(carousel);
    refreshCarouselUI(carousel, { resetTo: 0 });

    const parts = carousel ? getCarouselParts(carousel) : null;
    if (parts && parts.vp && parts.slides && parts.slides.length){
      scrollToSlide(parts.vp, parts.slides, 0, "auto");
    }

    // reset vertical scroll inside modal body (when reopening another project)
    const body = $(".galleryModal__body", projectModal);
    if (body) body.scrollTop = 0;
  }

  function openProjectModalFromCard(card){
    if (!projectModal || projectOpen) return;
    if (!card) return;

    projectOpen = true;
    projectReturnFocus = document.activeElement;
    if (projectCloseTimer) { clearTimeout(projectCloseTimer); projectCloseTimer = 0; }

    // close other overlays
    if (galleryOpen) closeGalleryModal(false);
    if (sheetOpen) closeSheet(false);

    hydrateProjectModalFromCard(card);

    projectModal.hidden = false;
    projectModal.setAttribute("aria-hidden", "false");
    requestAnimationFrame(() => projectModal.classList.add("is-open"));

    lockPageScroll();
    lock(450);

    const vp = $("[data-carousel-viewport]", projectModal);
    vp && vp.focus && vp.focus({ preventScroll: true });
  }

  function closeProjectModal(restoreFocus = true){
    if (!projectModal || !projectOpen) return;

    projectOpen = false;
    projectModal.classList.remove("is-open");
    projectModal.setAttribute("aria-hidden", "true");

    const finish = () => {
      if (projectOpen) return;
      projectModal.hidden = true;
      projectModal.removeEventListener("transitionend", finish);
    };

    projectModal.addEventListener("transitionend", finish);
    projectCloseTimer = window.setTimeout(finish, prefersReduced ? 0 : 650);

    unlockPageScroll();

    if (restoreFocus && projectReturnFocus && typeof projectReturnFocus.focus === "function") {
      try { projectReturnFocus.focus({ preventScroll: true }); } catch (err) {}
    }
    projectReturnFocus = null;
  }

  function getCarouselParts(carouselEl){
  const vp = $("[data-carousel-viewport]", carouselEl);
  const slides = $$(".carousel__slide", carouselEl);
  const dotsWrap = $("[data-carousel-dots]", carouselEl);
  const range = $("[data-carousel-range]", carouselEl);
  return { vp, slides, dotsWrap, range };
}

function getClosestSlideIndex(vp, slides){
  if (!vp || !slides.length) return 0;
  const center = vp.scrollLeft + (vp.clientWidth / 2);
  let best = 0;
  let bestDist = Infinity;
  slides.forEach((s, i) => {
    const sCenter = s.offsetLeft + (s.clientWidth / 2);
    const d = Math.abs(sCenter - center);
    if (d < bestDist) { bestDist = d; best = i; }
  });
  return best;
}

function scrollToSlide(vp, slides, index, behavior){
  if (!vp || !slides.length) return;
  const i = Math.max(0, Math.min(slides.length - 1, index));
  const s = slides[i];
  const target = s.offsetLeft - Math.max(0, (vp.clientWidth - s.clientWidth) / 2);
  vp.scrollTo({ left: target, top: 0, behavior: prefersReduced ? "auto" : (behavior || "smooth") });
}

function ensureCarouselInit(carouselEl){
  if (!carouselEl || carouselEl.dataset.carouselInit === "1") return;
  carouselEl.dataset.carouselInit = "1";

  const vp = $("[data-carousel-viewport]", carouselEl);
  const range = $("[data-carousel-range]", carouselEl);

  let raf = 0;
  const sync = () => {
    raf = 0;
    refreshCarouselUI(carouselEl);
  };

  if (vp){
    vp.addEventListener("scroll", () => {
      if (raf) return;
      raf = requestAnimationFrame(sync);
    }, { passive: true });
  }

  // dot click (delegated to carousel container)
  carouselEl.addEventListener("click", (e) => {
    const dot = e.target.closest("[data-carousel-dot]");
    if (!dot) return;
    e.preventDefault();

    const i = Number(dot.dataset.carouselDot || 0);
    const parts = getCarouselParts(carouselEl);
    if (!parts.vp || !parts.slides.length) return;
    scrollToSlide(parts.vp, parts.slides, i, "smooth");
  });

  if (range){
    range.addEventListener("input", () => {
      const parts = getCarouselParts(carouselEl);
      const i = Number(range.value || 0);
      scrollToSlide(parts.vp, parts.slides, i, "auto");
    });

    range.addEventListener("change", () => {
      const parts = getCarouselParts(carouselEl);
      const i = Number(range.value || 0);
      scrollToSlide(parts.vp, parts.slides, i, "smooth");
    });
  }

  // initial UI build
  refreshCarouselUI(carouselEl);
  sync();
}

function stepCarousel(carouselEl, dir){
  if (!carouselEl) return;
  ensureCarouselInit(carouselEl);

  const { vp, slides } = getCarouselParts(carouselEl);
  if (!vp || !slides.length) return;

  const idx = getClosestSlideIndex(vp, slides);
  let next = idx + dir;

  // wrap-around (end -> start, start -> end)
  if (next < 0) next = slides.length - 1;
  if (next >= slides.length) next = 0;

  scrollToSlide(vp, slides, next, "smooth");
}


  document.addEventListener("click", (e) => {
    const projectBtn = e.target.closest("[data-project-open]");
    if (projectBtn) {
      e.preventDefault();
      openProjectModalFromCard(projectBtn);
      return;
    }

    const projectClose = e.target.closest("[data-project-close]");
    if (projectClose) {
      e.preventDefault();
      closeProjectModal(true);
      return;
    }

    const openBtn = e.target.closest("[data-gallery-open]");
    if (openBtn) {
      e.preventDefault();
      openGalleryModal(openBtn.getAttribute("data-gallery-open") || "about");
      return;
    }

    const closeBtn = e.target.closest("[data-gallery-close]");
    if (closeBtn) {
      e.preventDefault();
      closeGalleryModal(true);
      return;
    }


    const prevBtn = e.target.closest("[data-carousel-prev]");
    if (prevBtn) {
      e.preventDefault();
      const car = prevBtn.closest("[data-carousel]");
      stepCarousel(car, -1);
      return;
    }

    const nextBtn = e.target.closest("[data-carousel-next]");
    if (nextBtn) {
      e.preventDefault();
      const car = nextBtn.closest("[data-carousel]");
      stepCarousel(car, 1);
      return;
    }
  });

  document.addEventListener("keydown", (e) => {
    const vp = e.target?.closest?.("[data-carousel-viewport]");
    if (!vp) return;

    if (e.key === "ArrowLeft") {
      e.preventDefault();
      const car = vp.closest("[data-carousel]");
      stepCarousel(car, -1);
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      const car = vp.closest("[data-carousel]");
      stepCarousel(car, 1);
    }
  });

})();
