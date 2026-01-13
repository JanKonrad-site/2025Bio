/* /assets/js/core/router.js */
export function createRouter({
  normalize = (id) => id,
  ensureLoaded = async () => true,
  setActiveUI = () => {},
} = {}) {
  let activeId = "";

  function scrollToId(id, behavior = "smooth") {
    const el = document.getElementById(id);
    if (!el) return false;
    el.scrollIntoView({ behavior, block: "start" });
    return true;
  }

  function replaceHash(id) {
    const hash = "#" + id;
    if (location.hash === hash) return;
    history.replaceState(null, "", hash);
  }

  function pushHash(id) {
    const hash = "#" + id;
    if (location.hash === hash) return;
    history.pushState(null, "", hash);
  }

  async function go(rawId, { behavior = "smooth", push = true } = {}) {
    const id = normalize(rawId);
    if (!id) return;

    await ensureLoaded(id);

    // nastavení UI stavu (nav)
    activeId = id;
    setActiveUI(id);

    // změna URL
    if (push) pushHash(id);
    else replaceHash(id);

    // scroll
    scrollToId(id, behavior);
  }

  function setActiveFromScroll(rawId) {
    const id = normalize(rawId);
    if (!id || id === activeId) return;
    activeId = id;
    setActiveUI(id);
    replaceHash(id); // replace (bez hashchange loopu)
  }

  async function handleHash(behavior = "auto") {
    const raw = (location.hash || "").slice(1);
    const id = normalize(raw);
    if (!id) return;
    await go(id, { behavior, push: false });
  }

  function start() {
    // initial hash
    handleHash("auto").catch(console.error);

    // user hash navigation
    window.addEventListener("hashchange", () => {
      handleHash("smooth").catch(console.error);
    });
  }

  return { go, start, setActiveFromScroll };
}
