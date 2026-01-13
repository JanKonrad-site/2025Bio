(() => {
  const html = document.documentElement;

  // ========= Sticky výšky (CSS vars) =========
  const siteNavbar = document.getElementById('siteNavbar');
  const docToolbar = document.getElementById('docToolbar');
  const scrollContainer = document.getElementById('scrollspyContent');

  function updateHeights() {
    const navH = siteNavbar?.offsetHeight || 56;
    const toolH = docToolbar?.offsetHeight || 52;
    html.style.setProperty('--site-nav-h', navH + 'px');
    html.style.setProperty('--doc-toolbar-h', toolH + 'px');
  }
  window.addEventListener('resize', updateHeights, { passive: true });
  window.addEventListener('load', updateHeights);
  updateHeights();

  // ========= Theme: auto / dark / light =========
  const THEME_KEY = 'preferredTheme';
  const themeToggleBtn = document.getElementById('themeToggleBtn');
  const mqlDark = window.matchMedia('(prefers-color-scheme: dark)');

  function iconFor(mode) {
    if (mode === 'auto') return '🌗';
    if (mode === 'dark') return '🌙';
    return '☀️';
  }
  function getSavedTheme() {
    return localStorage.getItem(THEME_KEY) || 'auto';
  }
  function effectiveTheme(mode) {
    return (mode === 'auto') ? (mqlDark.matches ? 'dark' : 'light') : mode;
  }
  function applyTheme(mode) {
    localStorage.setItem(THEME_KEY, mode);
    if (themeToggleBtn) themeToggleBtn.textContent = iconFor(mode);
    html.setAttribute('data-theme', effectiveTheme(mode));
    html.setAttribute('data-theme-mode', mode); // volitelné (debug)
  }
  mqlDark.addEventListener?.('change', () => {
    if (getSavedTheme() === 'auto') applyTheme('auto');
  });
  applyTheme(getSavedTheme());

  themeToggleBtn?.addEventListener('click', () => {
    const current = getSavedTheme();
    const next = (current === 'auto') ? 'dark' : (current === 'dark') ? 'light' : 'auto';
    applyTheme(next);
  });

  // ========= Collapse (náhrada bootstrap collapse) =========
  function getCollapseTarget(btn) {
    const sel = btn.getAttribute('data-bs-target') || btn.getAttribute('data-target');
    if (!sel) return null;
    try { return document.querySelector(sel); } catch { return null; }
  }
  function setExpanded(btn, expanded) {
    btn.setAttribute('aria-expanded', expanded ? 'true' : 'false');
  }
  function showCollapse(el) {
    el.classList.add('show');
  }
  function hideCollapse(el) {
    el.classList.remove('show');
  }
  function toggleCollapse(btn) {
    const target = getCollapseTarget(btn);
    if (!target) return;
    const isOpen = target.classList.contains('show');
    if (isOpen) hideCollapse(target);
    else showCollapse(target);
    setExpanded(btn, !isOpen);
  }

  // Delegace kliků na collapse togglery
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-bs-toggle="collapse"]');
    if (!btn) return;
    e.preventDefault();
    toggleCollapse(btn);
  });

  // Speciálně: doc navigace se na desktopu automaticky drží otevřená
  const docNavCollapseEl = document.getElementById('docNavCollapse');
  const docNavToggleBtn = document.getElementById('docNavToggleBtn');
  const desktopMql = window.matchMedia('(min-width: 768px)');

  function syncDocNavToViewport() {
    if (!docNavCollapseEl) return;
    if (desktopMql.matches) {
      showCollapse(docNavCollapseEl);
      if (docNavToggleBtn) setExpanded(docNavToggleBtn, true);
    } else {
      hideCollapse(docNavCollapseEl);
      if (docNavToggleBtn) setExpanded(docNavToggleBtn, false);
    }
  }
  desktopMql.addEventListener?.('change', syncDocNavToViewport);
  syncDocNavToViewport();

  // ========= Vyhledávání v menu =========
  const searchInput = document.getElementById('navSearch');
  const clearSearchBtn = document.getElementById('clearSearchBtn');
  const navLinks = Array.from(document.querySelectorAll('#docNav a.nav-link'));

  function levelOf(link) {
    if (link.classList.contains('ms-2')) return 2;
    if (link.classList.contains('ms-1')) return 1;
    return 0;
  }

  function filterNav(query) {
    const q = (query || '').trim().toLowerCase();
    if (clearSearchBtn) clearSearchBtn.disabled = !q;

    if (!q) {
      navLinks.forEach(a => a.style.display = '');
      return;
    }

    const levels = navLinks.map(levelOf);
    const matches = navLinks.map(a => (a.textContent || '').toLowerCase().includes(q));

    // Kontext: když matchne dítě, ukaž i rodiče
    const visible = new Array(navLinks.length).fill(false);
    const lastAtLevel = [];

    for (let i = 0; i < navLinks.length; i++) {
      const lvl = levels[i];
      lastAtLevel[lvl] = i;

      if (matches[i]) {
        visible[i] = true;
        for (let up = lvl - 1; up >= 0; up--) {
          const idx = lastAtLevel[up];
          if (typeof idx === 'number') visible[idx] = true;
        }
      }
    }

    navLinks.forEach((a, i) => {
      a.style.display = visible[i] ? '' : 'none';
    });

    // Na mobilu při hledání menu automaticky otevři
    if (!desktopMql.matches && docNavCollapseEl) showCollapse(docNavCollapseEl);
  }

  searchInput?.addEventListener('input', () => filterNav(searchInput.value));

  clearSearchBtn?.addEventListener('click', () => {
    if (searchInput) searchInput.value = '';
    filterNav('');
    if (!desktopMql.matches && docNavCollapseEl) hideCollapse(docNavCollapseEl);
    scrollContainer?.scrollTo({ top: 0, behavior: 'smooth' });
  });

  if (clearSearchBtn) clearSearchBtn.disabled = true;

  // ========= Router: načti sekce podle nav (sjednoceno z router.js) =========
  const contentEl = document.getElementById('content');
  const loadedSections = new Set();
  let observer = null;

  function uniqInOrder(list) {
    const out = [];
    const seen = new Set();
    for (const x of list) {
      if (!x || seen.has(x)) continue;
      seen.add(x);
      out.push(x);
    }
    return out;
  }

  function getSectionsFromNav() {
    const links = Array.from(document.querySelectorAll('#docNav a[data-section]'));
    return uniqInOrder(links.map(a => a.getAttribute('data-section')));
  }

  function updateActiveNav(id) {
    const links = document.querySelectorAll('#docNav a[data-section]');
    links.forEach(link => {
      link.classList.toggle('active', link.getAttribute('data-section') === id);
    });
  }

  async function loadSection(name, append = false) {
    if (!contentEl) return;
    if (append && loadedSections.has(name)) return;

    const res = await fetch(`sections/${name}.html`);
    if (!res.ok) throw new Error(`Sekce nenalezena: ${name}`);

    const htmlText = await res.text();

    const sectionContainer = document.createElement('section');
    sectionContainer.id = name;
    sectionContainer.classList.add('section-wrapper');
    sectionContainer.innerHTML = htmlText;

    if (append) contentEl.appendChild(sectionContainer);
    else {
      contentEl.innerHTML = '';
      contentEl.appendChild(sectionContainer);
    }

    loadedSections.add(name);
  }

  function setupIntersectionObserver() {
    if (observer) observer.disconnect();

    const sections = document.querySelectorAll('.section-wrapper');
    if (!sections.length) return;

    observer = new IntersectionObserver((entries) => {
      // vezmeme nejvíc viditelný z těch, co jsou vidět
      const visible = entries
        .filter(e => e.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

      if (!visible.length) return;

      const id = visible[0].target.id;
      history.replaceState(null, '', `#${id}`);
      updateActiveNav(id);
    }, {
      root: scrollContainer || null,
      threshold: [0.15, 0.25, 0.4, 0.6]
    });

    sections.forEach(s => observer.observe(s));
  }

  async function loadAllSectionsInOrder() {
    if (!contentEl) return;

    contentEl.innerHTML = '';
    loadedSections.clear();

    if (observer) observer.disconnect();

    const sections = getSectionsFromNav();
    for (const sec of sections) {
      try {
        await loadSection(sec, true);
      } catch (err) {
        console.error(err);
        // necháme pokračovat, ať jedna chyba nesrazí vše
      }
    }

    // hash skok
    const hash = window.location.hash.replace('#', '');
    if (hash) {
      const target = document.getElementById(hash);
      if (target) {
        target.scrollIntoView();
        updateActiveNav(hash);
      }
    }

    setupIntersectionObserver();
    document.dispatchEvent(new Event('content:updated'));
  }

  window.addEventListener('DOMContentLoaded', () => {
    loadAllSectionsInOrder();
  });

  // Klik na položku menu: smooth scroll + na mobilu zavři
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href') || '';
      if (!href.startsWith('#')) return;

      e.preventDefault();
      const id = href.slice(1);
      const target = document.getElementById(id);
      if (target) {
        history.pushState(null, '', `#${id}`);
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        updateActiveNav(id);
      }

      if (!desktopMql.matches && docNavCollapseEl) hideCollapse(docNavCollapseEl);
    });
  });

  // ========= Modal compat (náhrada bootstrap modalu + bs eventy) =========
  // Podporuje:
  // - [data-bs-toggle="modal"][data-bs-target="#id"]
  // - zavírání přes [data-bs-dismiss="modal"] a klik na pozadí
  // - ESC
  // - dispatch: shown.bs.modal / hide.bs.modal / hidden.bs.modal
  let lastActiveElement = null;

  function openModal(modalEl) {
    if (!modalEl) return;
    lastActiveElement = document.activeElement;

    modalEl.classList.add('is-open');
    modalEl.setAttribute('aria-hidden', 'false');

    // event kompatibilita
    queueMicrotask(() => modalEl.dispatchEvent(new Event('shown.bs.modal')));

    // fokus
    const focusable = modalEl.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    (focusable || modalEl).focus?.();
  }

  function closeModal(modalEl) {
    if (!modalEl) return;

    modalEl.dispatchEvent(new Event('hide.bs.modal'));

    modalEl.classList.remove('is-open');
    modalEl.setAttribute('aria-hidden', 'true');

    queueMicrotask(() => modalEl.dispatchEvent(new Event('hidden.bs.modal')));

    // návrat fokusu
    if (lastActiveElement && typeof lastActiveElement.focus === 'function') {
      lastActiveElement.focus();
    }
    lastActiveElement = null;
  }

  function findModalFromTrigger(btn) {
    const sel = btn.getAttribute('data-bs-target');
    if (!sel) return null;
    try { return document.querySelector(sel); } catch { return null; }
  }

  document.addEventListener('click', (e) => {
    const openBtn = e.target.closest('[data-bs-toggle="modal"]');
    if (openBtn) {
      e.preventDefault();
      const modal = findModalFromTrigger(openBtn);
      openModal(modal);
      return;
    }

    const dismissBtn = e.target.closest('[data-bs-dismiss="modal"]');
    if (dismissBtn) {
      const modal = dismissBtn.closest('.modal');
      if (modal) {
        e.preventDefault();
        closeModal(modal);
      }
      return;
    }

    // klik na pozadí modalu (na samotný overlay)
    const modalOverlay = e.target.classList?.contains('modal') ? e.target : null;
    if (modalOverlay && modalOverlay.classList.contains('is-open')) {
      closeModal(modalOverlay);
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    const open = document.querySelector('.modal.is-open');
    if (open) closeModal(open);
  });

})();
