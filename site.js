/* ==========================================================================
   Bluebird Wellness: shared by every page (the home page, the treatment
   pages and the glossary)

   - The phones' menu: the header's Menu button opens a full-screen menu
     (below 820px; wider screens have the header's own links).
   - window.SiteDialog.open(el, options): a modal (the menu, the home page's
     list of treatments) that keeps focus inside it, closes with Escape or
     its [data-close] buttons, and locks the page's scroll while open.
   ========================================================================== */

(() => {
  const root = document.documentElement;
  const FOCUSABLE = 'a[href]:not([hidden]), button:not([disabled]):not([hidden]), input:not([disabled]), [tabindex]:not([tabindex="-1"])';

  let current = null; // { el, close }

  // Opens el (hidden until now) as a modal. options.onClose runs after it
  // closes; options.returnFocus gets focus back (by default what had it).
  function open(el, { onClose, returnFocus = document.activeElement, initialFocus } = {}) {
    if (current) current.close({ restore: false });
    const scrollY = window.scrollY;
    el.hidden = false;
    root.classList.add('is-locked');
    // The page behind can't be read or reached while the modal is open.
    const outside = [...document.body.children].filter((child) => child !== el && !child.contains(el) && child.tagName !== 'SCRIPT');
    outside.forEach((child) => { child.inert = true; });
    // Shown on the next frame, so the entrance can transition.
    requestAnimationFrame(() => el.classList.add('is-open'));

    const onKey = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        close();
        return;
      }
      if (event.key !== 'Tab') return;
      const items = [...el.querySelectorAll(FOCUSABLE)].filter((item) => item.offsetParent !== null);
      if (!items.length) return;
      const first = items[0], last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    const onClick = (event) => {
      // A [data-close] button, or a tap on the backdrop itself.
      if (event.target.closest('[data-close]') || event.target === el) close();
    };
    document.addEventListener('keydown', onKey);
    el.addEventListener('click', onClick);

    function close({ restore = true } = {}) {
      if (!current || current.el !== el) return;
      current = null;
      document.removeEventListener('keydown', onKey);
      el.removeEventListener('click', onClick);
      el.classList.remove('is-open');
      el.hidden = true;
      outside.forEach((child) => { child.inert = false; });
      root.classList.remove('is-locked');
      // Locking the scroll must never move the page.
      if (Math.abs(window.scrollY - scrollY) > 1) window.scrollTo(0, scrollY);
      if (restore && returnFocus && returnFocus.focus) returnFocus.focus({ preventScroll: true });
      if (onClose) onClose();
    }
    current = { el, close };
    (initialFocus || el.querySelector(FOCUSABLE))?.focus({ preventScroll: true });
    return close;
  }

  window.SiteDialog = { open, close: () => current && current.close() };

  // The phones' menu. A link in it closes it first, then goes where it goes
  // (on the home page, straight to that section).
  const button = document.querySelector('.site-header .menu-button');
  const menu = document.getElementById('site-menu');
  if (button && menu) {
    button.addEventListener('click', () => {
      button.setAttribute('aria-expanded', 'true');
      open(menu, { returnFocus: button, onClose: () => button.setAttribute('aria-expanded', 'false') });
    });
    menu.addEventListener('click', (event) => {
      if (event.target.closest('a[href]')) current?.close({ restore: false });
    });
    // Wider screens have no menu: close it if the screen grows.
    window.matchMedia('(min-width: 820px)').addEventListener('change', (event) => {
      if (event.matches && current && current.el === menu) current.close({ restore: false });
    });
  }
})();
