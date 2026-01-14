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
  /* =========================
   MODAL ENGINE (bez Bootstrapu)
   - open:  [data-modal-open="modalId"]
   - close: [data-modal-close]
   - ESC zavírá
   - klik na backdrop zavírá
   - trap-focus (Tab zůstává v modalu)
   - vrací fokus na původní tlačítko
   ========================= */

(() => {
  const FOCUSABLE = [
    'a[href]',
    'area[href]',
    'input:not([disabled]):not([type="hidden"])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    'button:not([disabled])',
    'iframe',
    'object',
    'embed',
    '[contenteditable]',
    '[tabindex]:not([tabindex="-1"])'
  ].join(',');

  let activeModal = null;
  let lastActiveEl = null;

  const isVisible = (el) => !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length);

  const getFocusables = (root) =>
    Array.from(root.querySelectorAll(FOCUSABLE)).filter(isVisible);

  const lockScroll = () => {
    const scrollbar = window.innerWidth - document.documentElement.clientWidth;
    document.body.classList.add('modal-open');
    if (scrollbar > 0) document.body.style.paddingRight = `${scrollbar}px`;
  };

  const unlockScroll = () => {
    document.body.classList.remove('modal-open');
    document.body.style.paddingRight = '';
  };

  const openModal = (modal, trigger) => {
    if (!modal) return;

    // Zavři předchozí modal (pokud je jiný)
    if (activeModal && activeModal !== modal) closeModal(activeModal, { restoreFocus: false });

    lastActiveEl = trigger || document.activeElement;

    modal.hidden = false;
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');

    lockScroll();

    // Fokus do modalu
    const focusables = getFocusables(modal);
    const target = focusables[0] || modal;
    target.focus({ preventScroll: true });

    activeModal = modal;
  };

  const closeModal = (modal, { restoreFocus = true } = {}) => {
    if (!modal) return;

    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    modal.hidden = true;

    activeModal = null;
    unlockScroll();

    if (restoreFocus && lastActiveEl && typeof lastActiveEl.focus === 'function') {
      lastActiveEl.focus({ preventScroll: true });
    }
    lastActiveEl = null;
  };

  // Delegované klikání (funguje i na dynamický obsah)
  document.addEventListener('click', (e) => {
    const openBtn = e.target.closest('[data-modal-open]');
    if (openBtn) {
      const id = openBtn.getAttribute('data-modal-open');
      const modal = document.getElementById(id);

      // Debug pro typické chyby: špatné id nebo duplicitní id
      if (!modal) {
        console.warn(`[MODAL] Nenalezen modal s id="${id}". Zkontroluj data-modal-open a id modalu.`);
        return;
      }

      e.preventDefault();
      openModal(modal, openBtn);
      return;
    }

    const closeBtn = e.target.closest('[data-modal-close]');
    if (closeBtn) {
      const modal = closeBtn.closest('.modal');
      if (modal) {
        e.preventDefault();
        closeModal(modal);
      }
      return;
    }

    // Klik na backdrop (jen pokud klikneš přímo na .modal, ne na obsah)
    if (activeModal && e.target === activeModal) {
      closeModal(activeModal);
    }
  });

  // ESC + trap-focus
  document.addEventListener('keydown', (e) => {
    if (!activeModal) return;

    if (e.key === 'Escape') {
      e.preventDefault();
      closeModal(activeModal);
      return;
    }

    if (e.key !== 'Tab') return;

    const focusables = getFocusables(activeModal);
    if (focusables.length === 0) {
      e.preventDefault();
      activeModal.focus();
      return;
    }

    const first = focusables[0];
    const last = focusables[focusables.length - 1];

    if (e.shiftKey) {
      if (document.activeElement === first || document.activeElement === activeModal) {
        e.preventDefault();
        last.focus();
      }
    } else {
      if (document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  });

  // Volitelné: API pro ruční otevření v konzoli / z kódu
  window.ModalEngine = {
    open: (id) => openModal(document.getElementById(id), null),
    close: () => activeModal && closeModal(activeModal)
  };
})();
