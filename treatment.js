/* ==========================================================================
   Bluebird Wellness: treatment page and glossary script
   (treatments/<slug>/, ingredients/)

   The pages are complete without it: every word is in the HTML and every
   accordion works on its own. This only adds
     - the header's bottom border once the page has scrolled,
     - the gentle fade-up of each block as it scrolls into view (not with
       reduced motion),
     - the "Expand all" button of the ingredients list and the glossary,
     - the glossary's search box (it filters the entries by name),
     - opening a glossary entry arrived at by its link (#vitamin-b1-thiamine),
     - on phones: the Book bar at the bottom of a treatment page (once its
       price has scrolled away, until the booking panel is on screen), and
       the glossary's "Back to top" button,
     - the current year in the footer.
   The phones' menu is in site.js, shared with the home page.
   ========================================================================== */

(() => {
  const root = document.documentElement;

  // Header border, as on the home page.
  const header = document.getElementById('site-header');
  if (header) {
    const update = () => header.classList.toggle('is-scrolled', window.scrollY > 8);
    update();
    window.addEventListener('scroll', update, { passive: true });
  }


  // Fade up as each block scrolls into view. Blocks already on screen show
  // straight away; nothing is hidden without this script or with reduced motion.
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const blocks = [...document.querySelectorAll('[data-fade]')];
  if (!reduceMotion && 'IntersectionObserver' in window && blocks.length) {
    const below = blocks.filter((el) => el.getBoundingClientRect().top > window.innerHeight * 0.9);
    below.forEach((el) => el.classList.add('is-waiting'));
    root.classList.add('has-reveal');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.remove('is-waiting');
        observer.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -12% 0px' });
    below.forEach((el) => observer.observe(el));
  }

  // "Expand all" / "Collapse all" for the ingredients list and the glossary.
  document.querySelectorAll('[data-expand-all]').forEach((button) => {
    const list = document.getElementById(button.getAttribute('aria-controls'));
    if (!list) return;
    const items = [...list.querySelectorAll('details')];
    const sync = () => {
      const allOpen = items.every((d) => d.open);
      button.textContent = allOpen ? 'Collapse all' : 'Expand all';
      button.setAttribute('aria-expanded', String(allOpen));
    };
    button.addEventListener('click', () => {
      const open = !items.every((d) => d.open);
      items.forEach((d) => { d.open = open; });
      sync();
    });
    items.forEach((d) => d.addEventListener('toggle', sync));
    sync();
    button.hidden = false;
  });

  // The glossary's search: shows only the entries whose name contains what
  // is typed (ignoring case and accents), and only the categories with one.
  const search = document.querySelector('[data-glossary-search]');
  const input = search && search.querySelector('input');
  if (input) {
    const fold = (text) => text.toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, ' ').trim();
    const entries = [...document.querySelectorAll('[data-glossary-item]')].map((el) => ({ el, name: fold(el.dataset.name || '') }));
    const categories = [...document.querySelectorAll('[data-glossary-category]')];
    const empty = document.querySelector('[data-glossary-empty]');
    const filter = () => {
      const query = fold(input.value);
      entries.forEach(({ el, name }) => { el.hidden = !!query && !name.includes(query); });
      categories.forEach((section) => { section.hidden = !section.querySelector('[data-glossary-item]:not([hidden])'); });
      if (empty) empty.hidden = categories.some((section) => !section.hidden);
    };
    input.addEventListener('input', filter);
    filter(); // a value the browser restored
    search.hidden = false;
  }

  // A link to a closed entry (a <details> with that id) opens it, showing it
  // again first if the search had hidden it.
  const openTarget = (event) => {
    const id = decodeURIComponent(location.hash.slice(1));
    const target = id && document.getElementById(id);
    if (!target || target.tagName !== 'DETAILS') return;
    if (input && (target.hidden || target.closest('[hidden]'))) {
      input.value = '';
      input.dispatchEvent(new Event('input'));
    }
    target.open = true;
    // Arriving on the page, jump straight there; following a link on it, glide.
    target.scrollIntoView({ behavior: event && !reduceMotion ? 'smooth' : 'instant' });
  };
  window.addEventListener('hashchange', openTarget);
  if (location.hash) openTarget();

  // Phones: the Book bar, shown while the page's price is above the screen
  // and its booking panel still below it.
  const bar = document.querySelector('[data-book-bar]');
  const price = document.querySelector('[data-main-price]');
  const booking = document.querySelector('[data-book-section]');
  if (bar && price && booking && 'IntersectionObserver' in window) {
    let priceAbove = false, bookingBelow = true;
    const barLink = bar.querySelector('a');
    const sync = () => {
      const show = priceAbove && bookingBelow;
      bar.classList.toggle('is-shown', show);
      bar.setAttribute('aria-hidden', String(!show));
      if (barLink) barLink.tabIndex = show ? 0 : -1;
    };
    new IntersectionObserver(([entry]) => {
      priceAbove = !entry.isIntersecting && entry.boundingClientRect.top < 0;
      sync();
    }, { rootMargin: '-64px 0px 0px 0px' }).observe(price);
    new IntersectionObserver(([entry]) => {
      bookingBelow = !entry.isIntersecting && entry.boundingClientRect.top > 0;
      sync();
    }).observe(booking);
  }

  // Phones: "Back to top" on the glossary, after a screenful of scrolling;
  // anchors there land below the sticky search.
  const toTop = document.querySelector('[data-to-top]');
  if (toTop) {
    const update = () => toTop.classList.toggle('is-shown', window.scrollY > window.innerHeight);
    update();
    window.addEventListener('scroll', update, { passive: true });
    toTop.addEventListener('click', (event) => {
      event.preventDefault();
      window.scrollTo({ top: 0, behavior: reduceMotion ? 'instant' : 'smooth' });
      document.getElementById('main')?.focus({ preventScroll: true });
    });
  }
  const glossaryBar = document.querySelector('[data-glossary-bar]');
  if (glossaryBar && 'ResizeObserver' in window) {
    new ResizeObserver(() => root.style.setProperty('--glossary-bar-h', `${glossaryBar.offsetHeight}px`)).observe(glossaryBar);
  }

  const year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();
})();
