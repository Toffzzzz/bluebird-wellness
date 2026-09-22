/* ==========================================================================
   Bluebird Wellness: page script

   1. TREATMENT CONTENT   ← edit text, images and animations here
   2. Rendering           (builds the showcases and the treatment cards)
   3. Motion              (Lenis smooth scroll + GSAP ScrollTrigger)
   ========================================================================== */

/* ==========================================================================
   1. TREATMENT CONTENT

   Each treatment appears as a card in "All treatments", in the order below.
   Fields:
     id           Unique, lowercase, no spaces. Also used as the page anchor.
     name         Display name.
     summary      One line for the card.
     bookUrl      Booking link (placeholder "#" for now).
     image        Path to a transparent cut-out, e.g. "images/iron.webp".
                  Leave as null to show the soft placeholder shape instead.
     imageSize    [width, height] of the image in pixels (keeps the layout steady).
     alt          Short description of the image for screen readers.
     placeholder  Shown when there is no image:
                    shape:  "drop" | "circle" | "pill" | "blob" | "arch"
                    colour: any soft, muted colour
     badge        Optional small label, e.g. { text: "…", variant: "sky" | "sage" }
     showcase     Optional. Adds a full-screen scroll section for this treatment:
                    order:       position in the scroll sequence (1 = first)
                    description: 1–2 sentences shown beside the image
                    animation:   "run" | "split" | "spin" | "wipe" | "grow"
                                 (anything else just fades the image in)
                    side:        "left" | "right", which side the image sits on
                    cut:         ("split" only) where the cut between the two
                                 halves meets the top and bottom edges, as % from left

   Copy rule: describe what's in each drip and the experience only. No claims
   that a treatment cures, treats, prevents, detoxes, boosts immunity,
   reverses ageing or grows hair (UK ASA/CAP).
   ========================================================================== */

const TREATMENTS = [
  {
    id: 'iron',
    name: 'Iron',
    summary: 'For diagnosed iron deficiency. A blood test and clinical assessment are needed first.',
    bookUrl: '#',
    image: 'images/iron.webp',
    imageSize: [760, 707],
    alt: 'A single red blood cell',
    badge: { text: 'Blood test required first', variant: 'sky' },
    showcase: {
      order: 3,
      description: 'An iron infusion for adults with diagnosed iron deficiency. A blood test and clinical assessment are required before treatment.',
      animation: 'spin',
      side: 'right',
    },
  },
  {
    id: 'immunity',
    name: 'Immunity',
    summary: 'Vitamin C, zinc and B vitamins in a saline drip.',
    bookUrl: '#',
    image: 'images/immunity.webp',
    imageSize: [1040, 919],
    alt: 'Two halves of an orange with droplets of juice',
    showcase: {
      order: 2,
      description: 'Vitamin C, zinc and B vitamins in a gentle saline drip. Sit back and relax while it runs, in clinic or at home.',
      animation: 'split',
      side: 'left',
      cut: [66.5, 32.5],
    },
  },
  {
    id: 'recovery',
    name: 'Recovery (Hangover)',
    summary: 'Fluids with electrolytes and B vitamins, in a calm, unhurried setting.',
    bookUrl: '#',
    image: null,
    placeholder: { shape: 'drop', colour: '#D6E0F2' },
  },
  {
    id: 'detox',
    name: 'Detox',
    summary: 'Glutathione and vitamin C in a saline drip.',
    bookUrl: '#',
    image: null,
    placeholder: { shape: 'circle', colour: '#D8E0D7' },
  },
  {
    id: 'hair',
    name: 'Hair & Scalp',
    summary: 'Biotin, zinc and B vitamins in a saline drip.',
    bookUrl: '#',
    image: 'images/hair.webp',
    imageSize: [1083, 1024],
    alt: 'Long, glossy brown hair seen from behind',
    showcase: {
      order: 4,
      description: 'Biotin, zinc, B vitamins and amino acids in a saline base. Quiet time to sit back, in our clinic or wherever suits you.',
      animation: 'wipe',
      side: 'left',
    },
  },
  {
    id: 'skin',
    name: 'Skin & Beauty',
    summary: 'Glutathione, vitamin C and biotin in a saline drip.',
    bookUrl: '#',
    image: null,
    placeholder: { shape: 'blob', colour: '#ECDCD8' },
  },
  {
    id: 'energy',
    name: 'Energy',
    summary: 'B vitamins and vitamin C in a saline drip.',
    bookUrl: '#',
    image: 'images/energy.webp',
    imageSize: [772, 955],
    alt: 'A runner mid-stride',
    showcase: {
      order: 1,
      description: 'A blend of B vitamins and vitamin C in a saline drip. Take a seat and unwind while it runs, in clinic or at home.',
      animation: 'run',
      side: 'right',
    },
  },
  {
    id: 'longevity',
    name: 'Longevity',
    summary: 'Vitamin C, magnesium and amino acids in a saline drip.',
    bookUrl: '#',
    image: 'images/longevity.webp',
    imageSize: [860, 911],
    alt: 'A young green shoot with water droplets',
    showcase: {
      order: 5,
      description: 'Vitamin C, magnesium, B vitamins and amino acids in a saline drip. A calm, unhurried session, in clinic or at home.',
      animation: 'grow',
      side: 'right',
    },
  },
  {
    id: 'nad',
    name: 'NAD+',
    summary: 'NAD+ given as a slow infusion over a longer, relaxed session.',
    bookUrl: '#',
    image: null,
    placeholder: { shape: 'pill', colour: '#DEDAEA' },
  },
  {
    id: 'muscle-recovery',
    name: 'Muscle Recovery',
    summary: 'Magnesium, amino acids and fluids in a saline drip.',
    bookUrl: '#',
    image: null,
    placeholder: { shape: 'arch', colour: '#E7DCCD' },
  },
];

/* ==========================================================================
   2. Rendering
   ========================================================================== */

const esc = (value) =>
  String(value).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

function badgeHTML(badge, extraAttrs = '') {
  if (!badge) return '';
  const cls = badge.variant === 'sage' ? 'badge badge--sage' : 'badge';
  return `<span class="${cls}"${extraAttrs}>${esc(badge.text)}</span>`;
}

function showcaseMediaHTML(t) {
  const { animation, cut } = t.showcase;
  const [w, h] = t.imageSize;
  const src = esc(t.image);
  const alt = esc(t.alt || '');

  if (animation === 'split') {
    const [top, bottom] = cut || [50, 50];
    return `
      <div class="showcase__stage" style="--ratio: ${w} / ${h}; --cut-top: ${top}%; --cut-bottom: ${bottom}%">
        <img class="split-half split-half--a" src="${src}" alt="${alt}" width="${w}" height="${h}" decoding="async">
        <img class="split-half split-half--b" src="${src}" alt="" width="${w}" height="${h}" decoding="async">
      </div>`;
  }

  if (animation === 'wipe') {
    return `
      <div class="showcase__stage" style="--ratio: ${w} / ${h}">
        <div class="wipe-mask">
          <img src="${src}" alt="${alt}" width="${w}" height="${h}" decoding="async">
        </div>
      </div>`;
  }

  return `
    <div class="showcase__stage" style="--ratio: ${w} / ${h}">
      <img src="${src}" alt="${alt}" width="${w}" height="${h}" decoding="async">
    </div>`;
}

function showcaseHTML(t) {
  const { side, animation, description } = t.showcase;
  return `
    <section class="showcase showcase--image-${side === 'left' ? 'left' : 'right'} showcase--${esc(animation)}"
             id="${esc(t.id)}" data-animation="${esc(animation)}" aria-labelledby="${esc(t.id)}-title">
      <div class="container showcase__inner">
        <div class="showcase__media">${showcaseMediaHTML(t)}</div>
        <div class="showcase__text">
          <p class="eyebrow" data-reveal>IV therapy</p>
          <h2 class="showcase__title" id="${esc(t.id)}-title" data-reveal>${esc(t.name)}</h2>
          <p class="showcase__desc" data-reveal>${esc(description)}</p>
          ${badgeHTML(t.badge, ' data-reveal')}
          <a class="btn btn--primary" href="${esc(t.bookUrl)}" data-reveal>Book<span class="visually-hidden"> ${esc(t.name)}</span></a>
        </div>
      </div>
    </section>`;
}

function cardHTML(t) {
  const media = t.image
    ? `<img src="${esc(t.image)}" alt="" width="${t.imageSize[0]}" height="${t.imageSize[1]}" loading="lazy" decoding="async">`
    : `<span class="placeholder placeholder--${esc(t.placeholder?.shape || 'circle')}" style="--ph: ${esc(t.placeholder?.colour || '#E8EFFB')}"></span>`;

  return `
    <article class="card" data-card>
      <div class="card__media" aria-hidden="true">${media}</div>
      <h3 class="card__title">${esc(t.name)}</h3>
      <p class="card__desc">${esc(t.summary)}</p>
      ${badgeHTML(t.badge)}
      <div class="card__action">
        <a class="btn btn--primary btn--compact" href="${esc(t.bookUrl)}">Book<span class="visually-hidden"> ${esc(t.name)}</span></a>
      </div>
    </article>`;
}

function render() {
  const showcaseRoot = document.getElementById('showcases');
  const gridRoot = document.getElementById('treatment-grid');

  const featured = TREATMENTS
    .filter((t) => t.showcase && t.image)
    .sort((a, b) => a.showcase.order - b.showcase.order);

  if (showcaseRoot) showcaseRoot.innerHTML = featured.map(showcaseHTML).join('');
  if (gridRoot) gridRoot.innerHTML = TREATMENTS.map(cardHTML).join('');
}

/* ==========================================================================
   3. Motion
   ========================================================================== */

let lenis = null;

// Header gains its divider once the page has scrolled.
function initHeader() {
  const header = document.getElementById('site-header');
  if (!header) return;
  const update = () => header.classList.toggle('is-scrolled', window.scrollY > 8);
  update();
  window.addEventListener('scroll', update, { passive: true });
}

// In-page links scroll smoothly through Lenis when it is running.
// Bare "#" links are booking placeholders, so they do nothing for now.
function initAnchors() {
  document.addEventListener('click', (event) => {
    const link = event.target.closest('a[href^="#"]');
    if (!link) return;
    const hash = link.getAttribute('href');
    if (hash === '#') {
      event.preventDefault();
      return;
    }
    const target = document.querySelector(hash);
    if (!target) return;
    if (lenis) {
      event.preventDefault();
      // Lenis honours the CSS scroll-padding-top, which clears the fixed header.
      lenis.scrollTo(target);
      history.pushState(null, '', hash);
    }
  });
}

// Left edge of an element relative to the viewport, ignoring transforms.
function layoutLeft(el) {
  let left = 0;
  for (let node = el; node; node = node.offsetParent) left += node.offsetLeft;
  return left - window.scrollX;
}

/* One scroll-scrubbed animation per showcase. Each builder adds tweens to a
   timeline whose length is 1; ScrollTrigger maps it onto the pinned scroll.
   Every animation ends in the image's natural, static pose. */
const SHOWCASE_ANIMATIONS = {
  // The runner crosses the page from the left edge to its place on the right.
  run(tl, section, { isDesktop }) {
    const stage = section.querySelector('.showcase__stage');
    const img = stage.querySelector('img');
    tl.fromTo(img,
      { x: () => -(layoutLeft(stage) + stage.offsetWidth * (isDesktop ? 0.25 : 0.5)) },
      { x: 0, duration: 1 });
  },

  // The halves scale and rotate into place, then drift gently apart.
  split(tl, section, { isDesktop }) {
    const stage = section.querySelector('.showcase__stage');
    const [a, b] = stage.querySelectorAll('.split-half');
    const drift = isDesktop ? 5 : 3;
    tl.fromTo(stage, { scale: isDesktop ? 0.6 : 0.75, rotation: -16 }, { scale: 1, rotation: 0, duration: 0.6 }, 0)
      .fromTo(a, { xPercent: 0, yPercent: 0, rotation: 0 }, { xPercent: -drift, yPercent: -drift / 2, rotation: -4, duration: 0.5 }, 0.5)
      .fromTo(b, { xPercent: 0, yPercent: 0, rotation: 0 }, { xPercent: drift, yPercent: drift / 2, rotation: 4, duration: 0.5 }, 0.5);
  },

  // The blood cell spins and tilts in 3D, settling into its natural pose.
  spin(tl, section, { isDesktop }) {
    const img = section.querySelector('.showcase__stage img');
    const k = isDesktop ? 1 : 0.6;
    tl.fromTo(img,
      { rotation: -75 * k, rotationX: 40 * k, rotationY: -35 * k, transformPerspective: 1000 },
      { rotation: 0, rotationX: 0, rotationY: 0, transformPerspective: 1000, duration: 1 });
  },

  // A soft wipe from bottom to top while the image eases out from slightly enlarged.
  wipe(tl, section, { isDesktop }) {
    const mask = section.querySelector('.wipe-mask');
    const img = mask.querySelector('img');
    tl.fromTo(mask, { yPercent: 100 }, { yPercent: 0, duration: 1 }, 0)
      // counter-move the image so it stays put while the mask travels (mask is 1.25× the image height)
      .fromTo(img, { yPercent: -125, scale: isDesktop ? 1.15 : 1.08 }, { yPercent: 0, scale: 1, duration: 1 }, 0);
  },

  // The plant is revealed from the base of the stem upwards, with a slight scale-up.
  grow(tl, section) {
    const img = section.querySelector('.showcase__stage img');
    tl.fromTo(img,
      { clipPath: 'inset(100% 0% 0% 0%)', scale: 0.86 },
      { clipPath: 'inset(0% 0% 0% 0%)', scale: 1, duration: 1 });
  },

  // Fallback for new treatments without a dedicated animation.
  fade(tl, section) {
    const stage = section.querySelector('.showcase__stage');
    tl.fromTo(stage, { autoAlpha: 0, y: 40 }, { autoAlpha: 1, y: 0, duration: 1 });
  },
};

function initShowcase(section, conditions) {
  const { isDesktop } = conditions;
  const type = section.dataset.animation;
  const build = SHOWCASE_ANIMATIONS[type] || SHOWCASE_ANIMATIONS.fade;

  // Text fades up beside the image once the section is pinned (for the runner,
  // once it has run past the text column), and fades out again on the way back.
  const textAt = type === 'run' && isDesktop ? 0.4 : 0.02;
  const text = section.querySelectorAll('[data-reveal]');
  gsap.set(text, { y: 24, autoAlpha: 0 });
  let textShown = false;
  const syncText = (progress) => {
    if (progress > textAt && !textShown) {
      textShown = true;
      gsap.to(text, { y: 0, autoAlpha: 1, duration: 0.8, ease: 'power2.out', stagger: 0.08, overwrite: true });
    } else if (progress <= textAt && textShown) {
      textShown = false;
      gsap.to(text, { y: 24, autoAlpha: 0, duration: 0.4, ease: 'power2.in', stagger: -0.04, overwrite: true });
    }
  };

  const tl = gsap.timeline({
    defaults: { ease: 'none' },
    scrollTrigger: {
      trigger: section,
      start: 'top top',
      end: isDesktop ? '+=180%' : '+=110%',
      pin: true,
      scrub: isDesktop ? true : 0.6,
      anticipatePin: 1,
      invalidateOnRefresh: true,
      onUpdate: (self) => syncText(self.progress),
      onRefresh: (self) => syncText(self.progress),
    },
  });

  build(tl, section, conditions);
  // Hold the finished pose for a moment before the section unpins.
  tl.to({}, { duration: 0.25 });
}

function initHeroIntro() {
  gsap.from('[data-hero]', {
    y: 24, autoAlpha: 0, duration: 0.8, ease: 'power2.out', stagger: 0.08, delay: 0.1,
  });
}

function initSectionReveals(isDesktop) {
  const targets = gsap.utils.toArray('[data-fade], [data-card]');
  gsap.set(targets, { y: 24, autoAlpha: 0 });
  ScrollTrigger.batch(targets, {
    start: 'top 88%',
    once: true,
    onEnter: (batch) => gsap.to(batch, {
      y: 0, autoAlpha: 1, duration: 0.8, ease: 'power2.out', stagger: isDesktop ? 0.08 : 0.05, overwrite: true,
    }),
  });
}

function startLenis() {
  if (typeof window.Lenis !== 'function') return null;
  const instance = new window.Lenis({ lerp: 0.09 });
  instance.on('scroll', ScrollTrigger.update);
  const raf = (time) => instance.raf(time * 1000);
  gsap.ticker.add(raf);
  gsap.ticker.lagSmoothing(0);
  instance.stopTicker = () => gsap.ticker.remove(raf);
  return instance;
}

function initMotion() {
  // Without GSAP (e.g. the CDN is unreachable) the page simply stays static.
  if (!window.gsap || !window.ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);

  const mm = gsap.matchMedia();

  // Smooth scrolling only when the user hasn't asked for reduced motion.
  mm.add('(prefers-reduced-motion: no-preference)', () => {
    lenis = startLenis();
    return () => {
      if (!lenis) return;
      lenis.stopTicker();
      lenis.destroy();
      lenis = null;
      gsap.ticker.lagSmoothing(500, 33);
    };
  });

  // Scroll animations. Under reduced motion nothing is registered, so every
  // section shows in its finished, static state with no pinning.
  mm.add({
    isDesktop: '(min-width: 768px)',
    isMobile: '(max-width: 767.98px)',
    reduceMotion: '(prefers-reduced-motion: reduce)',
  }, (context) => {
    const { reduceMotion, isDesktop } = context.conditions;
    if (reduceMotion) return;

    initHeroIntro();
    document.querySelectorAll('.showcase').forEach((section) => initShowcase(section, context.conditions));
    initSectionReveals(isDesktop);
  });

  // Web fonts can change text heights; re-measure once they have loaded.
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => ScrollTrigger.refresh());
  }
}

/* ---------- Start ---------- */

render();
initHeader();
initAnchors();
initMotion();

const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();
