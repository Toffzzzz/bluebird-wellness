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
     - the current year in the footer.
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

  // Booking links are "#" until the booking system exists: don't jump to the top.
  document.addEventListener('click', (event) => {
    const link = event.target.closest('a[href="#"]');
    if (link) event.preventDefault();
  });

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
    const filter = () => {
      const query = fold(input.value);
      entries.forEach(({ el, name }) => { el.hidden = !!query && !name.includes(query); });
      categories.forEach((section) => { section.hidden = !section.querySelector('[data-glossary-item]:not([hidden])'); });
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

  const year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();
})();
