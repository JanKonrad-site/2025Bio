/* /assets/js/core/nav.js */
import { debounce } from "./dom.js";

export function initNav({
  navRoot,
  tree,
  searchInput,
  clearBtn,
  onNavigateRequest,
  onMobileCloseRequest,
} = {}) {
  const root = navRoot || document.getElementById("docNav");
  if (!root) return { setActive: () => {}, filter: () => {} };

  function createLink(title, href, depth = 0) {
    const a = document.createElement("a");
    a.className = `navLink depth-${depth}`;
    a.href = href;
    a.dataset.search = (title || "").toLowerCase();
    a.innerHTML = title || "";

    a.addEventListener("click", (e) => {
      const url = a.getAttribute("href") || "";
      if (!url.startsWith("#")) return;
      e.preventDefault();

      const id = url.slice(1);
      onNavigateRequest?.(id);
      onMobileCloseRequest?.();
    });

    return a;
  }

  function createGroup(node, depth = 0) {
    const details = document.createElement("details");
    details.className = "navGroup";
    details.dataset.search = (node.title || "").toLowerCase();

    const summary = document.createElement("summary");
    summary.className = "navGroupHeader";

    const left = document.createElement("div");
    left.className = "gLeft";

    const chev = document.createElement("span");
    chev.className = "chev";
    chev.textContent = "›";

    const title = document.createElement("span");
    title.className = "gTitle";
    title.textContent = node.title || "";

    left.appendChild(chev);
    left.appendChild(title);

    const meta = document.createElement("div");
    meta.className = "gMeta";

    const jump = document.createElement("a");
    jump.className = "jump";
    jump.href = node.href || "#";
    jump.title = "Přejít na kapitolu";
    jump.setAttribute("aria-label", `Přejít: ${node.title || ""}`);
    jump.textContent = "↗";

    jump.addEventListener("click", (e) => {
      const url = jump.getAttribute("href") || "";
      if (!url.startsWith("#")) return;
      e.preventDefault();
      onNavigateRequest?.(url.slice(1));
      onMobileCloseRequest?.();
    });

    meta.appendChild(jump);
    summary.appendChild(left);
    summary.appendChild(meta);

    const body = document.createElement("div");
    body.className = "navBody";

    for (const ch of node.children || []) {
      if (ch.children?.length) body.appendChild(createGroup(ch, depth + 1));
      else body.appendChild(createLink(ch.title, ch.href, depth + 1));
    }

    details.appendChild(summary);
    details.appendChild(body);

    return details;
  }

  function render() {
    root.innerHTML = "";
    (tree || []).forEach((g) => root.appendChild(createGroup(g, 0)));
  }

  function setHidden(el, hidden) {
    el.classList.toggle("is-hidden", !!hidden);
  }

  function filterGroup(detailsEl, q) {
    const groupMatch = (detailsEl.dataset.search || "").includes(q);

    const body = detailsEl.querySelector(":scope > .navBody");
    const children = Array.from(body?.children || []);

    let anyVisible = false;

    if (!q) {
      children.forEach((ch) => setHidden(ch, false));
      return true;
    }

    if (groupMatch) {
      children.forEach((ch) => setHidden(ch, false));
      detailsEl.open = true;
      return true;
    }

    for (const ch of children) {
      if (ch.tagName === "DETAILS") {
        const ok = filterGroup(ch, q);
        setHidden(ch, !ok);
        anyVisible ||= ok;
      } else {
        const m = (ch.dataset.search || "").includes(q);
        setHidden(ch, !m);
        anyVisible ||= m;
      }
    }

    if (anyVisible) detailsEl.open = true;
    return anyVisible;
  }

  function filter(query) {
    const q = (query || "").trim().toLowerCase();
    const groups = Array.from(root.querySelectorAll(":scope > details.navGroup"));
    groups.forEach((g) => {
      const ok = filterGroup(g, q);
      setHidden(g, !ok);
    });
    clearBtn?.classList.toggle("is-hidden", !q);
  }

  const filterDebounced = debounce(() => filter(searchInput?.value || ""), 80);

  searchInput?.addEventListener("input", filterDebounced);
  clearBtn?.addEventListener("click", () => {
    if (!searchInput) return;
    searchInput.value = "";
    filter("");
    searchInput.focus();
  });

  function openParents(a) {
    let p = a.parentElement;
    while (p) {
      if (p.tagName === "DETAILS") p.open = true;
      p = p.parentElement;
    }
  }

  function setActive(id) {
    const href = "#" + id;
    root.querySelectorAll(".navLink.is-active").forEach((a) => {
      a.classList.remove("is-active");
      a.removeAttribute("aria-current");
    });

    const a = root.querySelector(`a.navLink[href="${CSS.escape(href)}"]`);
    if (!a) return;
    a.classList.add("is-active");
    a.setAttribute("aria-current", "true");
    openParents(a);
  }

  render();
  filter("");

  return { render, filter, setActive };
}
