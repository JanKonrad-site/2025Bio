/* /assets/js/core/ui-collapse.js */
import { on } from "./dom.js";

export function initCollapseRuntime() {
  function toggleCollapse(target) {
    if (!target) return;
    const isOpen = target.classList.contains("show");
    target.classList.toggle("show", !isOpen);
  }

  on(document, "click", '[data-bs-toggle="collapse"]', (e, btn) => {
    e.preventDefault();
    const selector = btn.getAttribute("data-bs-target") || btn.getAttribute("href");
    if (!selector) return;

    const target = document.querySelector(selector);
    if (!target) return;

    toggleCollapse(target);

    // aria-expanded
    const expanded = target.classList.contains("show");
    btn.setAttribute("aria-expanded", expanded ? "true" : "false");
  });
}
