/* /assets/js/core/ui-modal.js */
import { on } from "./dom.js";

export function initModalRuntime() {
  let backdropEl = null;

  function ensureBackdrop() {
    if (backdropEl) return backdropEl;
    backdropEl = document.createElement("div");
    backdropEl.className = "modal-backdrop";
    backdropEl.addEventListener("click", () => {
      const openModal = document.querySelector(".modal.show");
      if (openModal) hideModal(openModal);
    });
    return backdropEl;
  }

  function showModal(modal) {
    if (!modal) return;

    document.body.appendChild(ensureBackdrop());
    modal.classList.add("show");
    modal.removeAttribute("aria-hidden");
    modal.setAttribute("aria-modal", "true");

    document.body.classList.add("modal-open");

    // kompatibilita pro staré listenery
    modal.dispatchEvent(new Event("shown.bs.modal"));
    modal.dispatchEvent(new CustomEvent("modal:shown"));

    // focus
    const af = modal.querySelector("[data-autofocus], input, button, select, textarea, a[href]");
    af?.focus?.({ preventScroll: true });
  }

  function hideModal(modal) {
    if (!modal) return;

    modal.classList.remove("show");
    modal.setAttribute("aria-hidden", "true");
    modal.removeAttribute("aria-modal");

    // zavřít backdrop, pokud už žádný modal není otevřen
    const anyOpen = document.querySelector(".modal.show");
    if (!anyOpen && backdropEl?.isConnected) backdropEl.remove();
    if (!document.querySelector(".modal.show")) document.body.classList.remove("modal-open");

    modal.dispatchEvent(new Event("hidden.bs.modal"));
    modal.dispatchEvent(new CustomEvent("modal:hidden"));
  }

  // data-bs-toggle="modal"
  on(document, "click", '[data-bs-toggle="modal"]', (e, btn) => {
    e.preventDefault();
    const target = btn.getAttribute("data-bs-target") || btn.getAttribute("href");
    if (!target) return;
    const modal = document.querySelector(target);
    showModal(modal);
  });

  // data-bs-dismiss="modal"
  on(document, "click", '[data-bs-dismiss="modal"]', (e, btn) => {
    e.preventDefault();
    const modal = btn.closest(".modal");
    hideModal(modal);
  });

  window.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    const openModal = document.querySelector(".modal.show");
    if (openModal) hideModal(openModal);
  });

  // export pro případné ruční použití
  window.showModal = showModal;
  window.hideModal = hideModal;
}
