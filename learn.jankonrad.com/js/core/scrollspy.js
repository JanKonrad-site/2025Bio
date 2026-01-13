/* /assets/js/core/scrollspy.js */
import { throttle } from "./dom.js";

export function initScrollSpy({
  container,
  getSectionIds,
  onActiveFromScroll,
} = {}) {
  const root = container || document.getElementById("scrollspyContent") || document;

  let observer = null;
  let observed = [];
  let lastActive = "";

  function pickBest(entries) {
    // vyber entry s největším intersectionRatio, a při shodě tu, co je výš
    const visible = entries.filter((e) => e.isIntersecting);
    if (!visible.length) return null;
    visible.sort((a, b) => {
      if (b.intersectionRatio !== a.intersectionRatio) return b.intersectionRatio - a.intersectionRatio;
      return a.boundingClientRect.top - b.boundingClientRect.top;
    });
    return visible[0];
  }

  function useIntersectionObserver() {
    const ids = (getSectionIds?.() || []).filter(Boolean);
    const els = ids.map((id) => document.getElementById(id)).filter(Boolean);

    if (!els.length) return;

    // root = null pro viewport, nebo skutečný scroll container
    const ioRoot =
      root === document || root === document.body || root === document.documentElement
        ? null
        : root;

    observer = new IntersectionObserver(
      (entries) => {
        const best = pickBest(entries);
        if (!best?.target?.id) return;
        const id = best.target.id;
        if (id === lastActive) return;
        lastActive = id;
        onActiveFromScroll?.(id);
      },
      {
        root: ioRoot,
        rootMargin: "0px 0px -60% 0px", // aktivuj trochu dřív (lepší UX)
        threshold: [0.1, 0.2, 0.35, 0.5, 0.7],
      }
    );

    els.forEach((el) => observer.observe(el));
    observed = els;
  }

  // fallback: ruční výpočet při scrollu
  const manualUpdate = throttle(() => {
    const ids = (getSectionIds?.() || []).filter(Boolean);
    const els = ids.map((id) => document.getElementById(id)).filter(Boolean);
    if (!els.length) return;

    const baseTop =
      root === document ? 0 : root.getBoundingClientRect().top;

    let bestId = "";
    let bestDist = Infinity;

    for (const el of els) {
      const r = el.getBoundingClientRect();
      const dist = Math.abs((r.top - baseTop) - 120); // 120px "aktivní pás"
      if (dist < bestDist) {
        bestDist = dist;
        bestId = el.id;
      }
    }

    if (bestId && bestId !== lastActive) {
      lastActive = bestId;
      onActiveFromScroll?.(bestId);
    }
  }, 120);

  function bindManual() {
    const target = root === document ? window : root;
    target.addEventListener("scroll", manualUpdate, { passive: true });
    manualUpdate();
  }

  function refresh() {
    // cleanup
    if (observer) {
      observed.forEach((el) => observer.unobserve(el));
      observer.disconnect();
      observer = null;
      observed = [];
    }

    if ("IntersectionObserver" in window) {
      useIntersectionObserver();
      if (!observer) bindManual();
    } else {
      bindManual();
    }
  }

  refresh();

  return { refresh };
}
