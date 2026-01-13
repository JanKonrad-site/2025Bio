/* js/core/loader.js
   Načítání sekcí z /sections/<id>.html
   - tolerantní k chybějícím souborům (vloží placeholder)
   - podporuje více basePaths (fallback)
*/
import { emit } from "./dom.js";

export function createLoader({
  mount,
  basePath = null,
  basePaths = null,          // ["./sections","../sections","/sections"]
  extension = ".html",
  wrapperClass = "section-wrapper",
  placeholderOnError = true,
} = {}) {
  const host = mount || document.body;
  const loaded = new Set();
  const cache = new Map(); // id -> html string

  const paths = (basePaths && Array.isArray(basePaths) && basePaths.length)
    ? basePaths
    : [basePath || "./sections"];

  const normBase = (p) => String(p || "").replace(/\/$/, "");

  const urlCandidatesFor = (id) => {
    const safe = encodeURIComponent(id);
    return paths.map((p) => `${normBase(p)}/${safe}${extension}`);
  };

  function has(id) {
    return loaded.has(id) || !!document.getElementById(id);
  }

  function makePlaceholder(id, urlTried, errText) {
    const safeErr = String(errText || "").slice(0, 500);
    return `
<section id="${id}" class="${wrapperClass}">
  <div class="missing-section">
    <h2>${id}</h2>
    <p><strong>Chybí soubor kapitoly</strong> nebo nejde načíst.</p>
    <p>Zkusené cesty:</p>
    <ul>
      ${urlTried.map(u => `<li><code>${u}</code></li>`).join("")}
    </ul>
    <p class="muted">Detail: ${safeErr}</p>
  </div>
</section>`;
  }

  async function fetchHtml(id) {
    if (cache.has(id)) return cache.get(id);

    const urls = urlCandidatesFor(id);
    let lastErr = null;

    for (const url of urls) {
      try {
        const res = await fetch(url, { credentials: "same-origin" });
        if (!res.ok) {
          lastErr = new Error(`HTTP ${res.status} for ${url}`);
          continue;
        }
        const html = await res.text();
        cache.set(id, html);
        return html;
      } catch (e) {
        lastErr = e;
      }
    }

    // vše selhalo
    if (placeholderOnError) {
      const html = makePlaceholder(id, urls, lastErr?.message || lastErr);
      cache.set(id, html);
      console.warn(`[LOADER] missing section: ${id}`, urls, lastErr);
      return html;
    }

    throw lastErr || new Error(`Failed to fetch section ${id}`);
  }

  function insert(id, html) {
    if (document.getElementById(id)) {
      loaded.add(id);
      return;
    }

    const tpl = document.createElement("template");
    tpl.innerHTML = (html || "").trim();
    const frag = tpl.content;

    const existing = frag.querySelector(`#${CSS.escape(id)}`);
    if (existing) {
      existing.classList.add(wrapperClass);
      host.appendChild(frag);
      loaded.add(id);
      return;
    }

    const wrap = document.createElement("section");
    wrap.id = id;
    wrap.className = wrapperClass;
    wrap.appendChild(frag);
    host.appendChild(wrap);
    loaded.add(id);
  }

  async function ensure(id) {
    if (!id || has(id)) return true;
    const html = await fetchHtml(id);
    insert(id, html);
    emit("content:updated", { ids: [id] });
    return true;
  }

  async function loadAll(ids = []) {
    const list = Array.from(ids || []).filter(Boolean);

    for (const id of list) {
      if (has(id)) {
        loaded.add(id);
        continue;
      }
      const html = await fetchHtml(id); // tolerantní: vrátí placeholder místo throw
      insert(id, html);
    }

    emit("content:updated", { ids: list });
    return true;
  }

  return { has, ensure, loadAll };
}