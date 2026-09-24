/* ==========================================================================
   Bluebird Wellness: treatment page script (treatments/<slug>/)

   The pages are complete without it: every word is in the HTML and every
   accordion works on its own. This only adds
     - the header's bottom border once the page has scrolled,
     - the gentle fade-up of each block as it scrolls into view (not with
       reduced motion),
     - the "Expand all" button of the ingredient guide,
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

  // "Expand all" / "Collapse all" for the ingredient guide.
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

  const year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();
})();
