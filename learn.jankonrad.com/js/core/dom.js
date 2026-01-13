/* /assets/js/core/dom.js */
export const $ = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

export function emit(name, detail) {
  document.dispatchEvent(new CustomEvent(name, { detail }));
}

export function debounce(fn, wait = 120) {
  let t = null;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), wait);
  };
}

export function throttle(fn, wait = 120) {
  let last = 0;
  let trailing = null;
  return (...args) => {
    const now = Date.now();
    const remaining = wait - (now - last);
    if (remaining <= 0) {
      last = now;
      fn(...args);
    } else {
      clearTimeout(trailing);
      trailing = setTimeout(() => {
        last = Date.now();
        fn(...args);
      }, remaining);
    }
  };
}

/** Delegovaný listener: on(document,'click','button.x', (e, el)=>{}) */
export function on(root, eventName, selector, handler, options) {
  root.addEventListener(
    eventName,
    (e) => {
      const el = e.target?.closest?.(selector);
      if (!el || !root.contains(el)) return;
      handler(e, el);
    },
    options
  );
}
