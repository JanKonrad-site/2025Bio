// core/theme.js
// Režimy: dark / light / auto (podle systému)

const STORAGE_KEY = "jk-theme"; // localStorage key

const LABELS = {
  auto: "Auto",
  dark: "Tmavý",
  light: "Světlý",
};

function normalizeTheme(v) {
  const x = String(v || "").toLowerCase();
  if (x === "dark" || x === "light" || x === "auto") return x;
  return "auto";
}

export function getStoredTheme() {
  try {
    return normalizeTheme(localStorage.getItem(STORAGE_KEY));
  } catch {
    return "auto";
  }
}

export function setStoredTheme(theme) {
  const t = normalizeTheme(theme);
  try {
    localStorage.setItem(STORAGE_KEY, t);
  } catch {}
  return t;
}

export function applyTheme(theme) {
  const t = normalizeTheme(theme);
  document.documentElement.dataset.theme = t;
  return t;
}

export function initThemeSwitcher({
  buttonId = "themeBtn",
  menuId = "themeMenu",
  labelSelector = ".themeLabel",
} = {}) {
  const btn = document.getElementById(buttonId);
  const menu = document.getElementById(menuId);

  if (!btn || !menu) {
    // i bez UI aplikujeme uložený/auto režim
    applyTheme(getStoredTheme() || "auto");
    return;
  }

  const labelEl = btn.querySelector(labelSelector);
  const items = Array.from(menu.querySelectorAll("[data-theme]"));

  function setUi(theme) {
    const t = normalizeTheme(theme);
    labelEl && (labelEl.textContent = LABELS[t] || "Auto");
    items.forEach((it) => {
      const isOn = normalizeTheme(it.getAttribute("data-theme")) === t;
      it.setAttribute("aria-checked", isOn ? "true" : "false");
    });
  }

  function openMenu(open) {
    const isOpen = open ?? menu.hasAttribute("hidden");
    if (isOpen) menu.removeAttribute("hidden");
    else menu.setAttribute("hidden", "");
    btn.setAttribute("aria-expanded", isOpen ? "true" : "false");
  }

  function closeMenu() {
    menu.setAttribute("hidden", "");
    btn.setAttribute("aria-expanded", "false");
  }

  // init
  const initial = applyTheme(getStoredTheme() || "auto");
  setUi(initial);
  closeMenu();

  btn.addEventListener("click", (e) => {
    e.preventDefault();
    const willOpen = menu.hasAttribute("hidden");
    openMenu(willOpen);
  });

  items.forEach((it) => {
    it.addEventListener("click", (e) => {
      e.preventDefault();
      const t = normalizeTheme(it.getAttribute("data-theme"));
      const stored = setStoredTheme(t);
      applyTheme(stored);
      setUi(stored);
      closeMenu();
    });
  });

  // close on outside click / esc
  document.addEventListener("click", (e) => {
    if (menu.hasAttribute("hidden")) return;
    const target = e.target;
    if (btn.contains(target) || menu.contains(target)) return;
    closeMenu();
  });
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeMenu();
  });
}
