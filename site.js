/* ==========================================================================
   Bluebird Wellness: shared by every page (the home page, the treatment
   pages and the glossary)

   - The header's drop-down menus (Treatments, Studies) on laptops.
   - The phones' menu: the header's Menu button opens a full-screen menu
     (below 820px; wider screens have the header's own links).
   - window.SiteDialog.open(el, options): a modal (the menu, the home page's
     list of treatments) that keeps focus inside it, closes with Escape or
     its [data-close] buttons, and locks the page's scroll while open.
   - window.SiteDraw.watch(root): every line drawing marked data-draw in it
     (the treatment cards, a treatment page's picture) draws itself, from
     the top down, once it comes into view. Ones already on the page are
     watched straight away. With reduced motion they're simply shown.
     Coming back to a page with Back or Forward (the browser showing it as
     it was), they start afresh and draw themselves again as they come
     into view.
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

  // Line drawings that draw themselves once they come into view.
  const DRAW = { duration: 1.5, stroke: 0.7 }; // seconds in all, and for each stroke
  const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window);
  const drawIn = (svg) => {
    const box = svg.getBoundingClientRect();
    const parts = [...svg.querySelectorAll('path')].map((el) => {
      const r = el.getBoundingClientRect();
      const fill = el.getAttribute('clip-path');
      return {
        el,
        clip: fill ? svg.querySelector(`${fill.slice(4, -1)} rect`) : null,
        len: fill ? 0 : el.getTotalLength(),
        // Higher strokes start sooner, so it draws from the top down.
        delay: box.height ? Math.max(0, (r.top - box.top) / box.height) * (DRAW.duration - DRAW.stroke) : 0,
      };
    });
    const set = (p, v) => {
      if (p.clip) { p.clip.setAttribute('height', String(Number(p.clip.dataset.h) * v)); return; }
      p.el.style.strokeDasharray = `${p.len} ${p.len + 2}`;
      p.el.style.strokeDashoffset = String(p.len * (1 - v));
      p.el.style.visibility = v > 0.001 ? 'visible' : 'hidden';
    };
    return { parts, set };
  };
  const seen = still ? null : new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      seen.unobserve(entry.target);
      const { parts, set } = entry.target.__draw;
      const start = performance.now();
      const run = entry.target.__run = (entry.target.__run || 0) + 1;
      const ease = (u) => (u < 0.5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2);
      const frame = (now) => {
        if (entry.target.__run !== run) return; // started afresh since
        const t = (now - start) / 1000;
        let more = false;
        for (const p of parts) {
          const u = Math.min(1, Math.max(0, (t - p.delay) / DRAW.stroke));
          set(p, ease(u));
          if (u < 1) more = true;
        }
        if (more) requestAnimationFrame(frame);
        else entry.target.classList.add('is-drawn');
      };
      requestAnimationFrame(frame);
    }
  }, { threshold: 0.35 });
  const watch = (root) => {
    if (!root) return;
    for (const svg of root.querySelectorAll('svg[data-draw]')) {
      if (svg.__draw || still) { svg.classList.add('is-drawn'); continue; }
      svg.__draw = drawIn(svg);
      svg.__draw.parts.forEach((p) => svg.__draw.set(p, 0));
      seen.observe(svg);
    }
  };
  window.SiteDraw = { watch };
  watch(document);
  // Leaving the page, and back on it from the browser's memory (Back or
  // Forward): every drawing starts afresh, drawing itself again as it comes
  // into view.
  const afresh = () => {
    if (still) return;
    for (const svg of document.querySelectorAll('svg[data-draw]')) {
      if (!svg.__draw) continue;
      svg.__run = (svg.__run || 0) + 1;
      svg.classList.remove('is-drawn');
      svg.__draw.parts.forEach((p) => svg.__draw.set(p, 0));
      seen.unobserve(svg);
      seen.observe(svg);
    }
  };
  window.addEventListener('pagehide', afresh);
  window.addEventListener('pageshow', (event) => { if (event.persisted) afresh(); });

  // The header's drop-down menus (Treatments, Studies), on laptops: the
  // button opens its panel (a mouse can also just hover); Escape, a click
  // elsewhere, tabbing out or following a link closes it.
  const drops = [...document.querySelectorAll('[data-drop]')].map((drop) => ({
    drop,
    button: drop.querySelector('.nav-drop__button'),
    panel: drop.querySelector('.nav-drop__panel'),
    timer: 0,
  }));
  const setOpen = (d, open) => {
    clearTimeout(d.timer);
    d.button.setAttribute('aria-expanded', String(open));
    d.panel.hidden = !open;
  };
  const closeAll = (except) => drops.forEach((d) => { if (d !== except) setOpen(d, false); });
  const hoverable = window.matchMedia('(hover: hover) and (pointer: fine)');
  drops.forEach((d) => {
    if (!d.button || !d.panel) return;
    d.button.addEventListener('click', () => {
      // A click straight after hovering it open keeps it open.
      const justHovered = Date.now() - (d.hovered || 0) < 600;
      const open = d.button.getAttribute('aria-expanded') !== 'true' || justHovered;
      d.hovered = 0;
      closeAll(d);
      setOpen(d, open);
    });
    d.drop.addEventListener('mouseenter', () => {
      if (!hoverable.matches) return;
      if (d.panel.hidden) d.hovered = Date.now();
      closeAll(d);
      setOpen(d, true);
    });
    d.drop.addEventListener('mouseleave', () => {
      if (!hoverable.matches) return;
      clearTimeout(d.timer);
      d.timer = setTimeout(() => setOpen(d, false), 180);
    });
    d.drop.addEventListener('focusout', (event) => {
      if (!d.drop.contains(event.relatedTarget)) setOpen(d, false);
    });
    d.drop.addEventListener('keydown', (event) => {
      if (event.key !== 'Escape' || d.panel.hidden) return;
      event.stopPropagation();
      setOpen(d, false);
      d.button.focus();
    });
    d.panel.addEventListener('click', (event) => { if (event.target.closest('a[href]')) setOpen(d, false); });
  });
  document.addEventListener('click', (event) => {
    if (!event.target.closest('[data-drop]')) closeAll();
  });

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
