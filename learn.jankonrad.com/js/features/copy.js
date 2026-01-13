/* /assets/js/features/copy.js */
import { on } from "../core/dom.js";

export function initCopy() {
  on(document, "click", "[data-copy-target]", async (e, btn) => {
    e.preventDefault();

    const targetSel = btn.getAttribute("data-copy-target");
    const msgSel = btn.getAttribute("data-copy-msg");

    const target = targetSel ? document.querySelector(targetSel) : null;
    const msgEl = msgSel ? document.querySelector(msgSel) : null;

    const text = target?.textContent ?? target?.value ?? "";
    if (!text) return;

    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // fallback
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.left = "-9999px";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
    }

    if (msgEl) {
      msgEl.style.display = "block";
      setTimeout(() => (msgEl.style.display = "none"), 1200);
    }
  });

  // kompatibilita se starým API: copyToClipboard('idText','idMsg')
  window.copyToClipboard = async (textElementId, msgElementId) => {
    const target = document.getElementById(textElementId);
    const msgEl = document.getElementById(msgElementId);
    const text = target?.textContent ?? target?.value ?? "";
    if (!text) return;

    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.left = "-9999px";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
    }

    if (msgEl) {
      msgEl.style.display = "block";
      setTimeout(() => (msgEl.style.display = "none"), 1200);
    }
  };
}
