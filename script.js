/* ==========================================================================
   Bluebird Wellness: page script

   1. TREATMENT CONTENT   ← edit text, images and the featured sequence here
   2. STAGE TIMING        ← fine-tune the scroll film here
   3. Rendering
   4. Iron: 3D red blood cell (Three.js)
   4b. Hair & Scalp: scroll-driven hair sway (Three.js shader)
   5. Motion (Lenis smooth scroll + GSAP ScrollTrigger)
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
     imageFit     Optional. "cover" for a full photo (not a cut-out): it fills
                  the card's image well instead of floating inside it.
     alt          Short description of the image for screen readers.
     placeholder  Shown when there is no image:
                    shape:  "drop" | "circle" | "pill" | "blob" | "arch"
                    colour: any soft, muted colour
     badge        Optional small label, e.g. { text: "…", variant: "sky" | "sage" }
     showcase     Optional. Adds the treatment to the pinned scroll "stage":
                    order:       position in the sequence (1 = first)
                    description: 1–2 sentences shown beside the visual
                    scene:       "runner" | "orange" | "cell" | "wipe" | "plant"
                                 (anything else gets a simple fade in and out)
                    tint:        the stage's background colour for this treatment
                    layers:      ("orange" and "plant" only) the layer images, all
                                 on the same canvas size as `image`
                    swayMask:    ("wipe" only, optional) a greyscale mask the size
                                 of `image`: white parts sway with the scroll,
                                 black parts never move

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
      scene: 'cell',
      tint: '#F9EFEE',
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
      scene: 'orange',
      tint: '#FAF1E8',
      layers: {
        juice: 'images/orange-juice.webp',
        left: 'images/orange-half-left.webp',
        right: 'images/orange-half-right.webp',
        whole: 'images/orange-whole.webp',
      },
    },
  },
  {
    id: 'recovery',
    name: 'Recovery (Hangover)',
    summary: 'Fluids with electrolytes and B vitamins, in a calm, unhurried setting.',
    bookUrl: '#',
    image: 'images/recovery.webp',
    imageSize: [426, 800],
    alt: 'A tall glass of sparkling water',
  },
  {
    id: 'detox',
    name: 'Detox',
    summary: 'Glutathione and vitamin C in a saline drip.',
    bookUrl: '#',
    image: 'images/detox.webp',
    imageSize: [719, 800],
    alt: 'Cucumber slices and mint leaves with water droplets',
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
      scene: 'wipe',
      tint: '#F6F0EA',
      swayMask: 'images/hair-mask.webp',
    },
  },
  {
    id: 'skin',
    name: 'Skin & Beauty',
    summary: 'Glutathione, vitamin C and biotin in a saline drip.',
    bookUrl: '#',
    image: 'images/skin.webp',
    imageSize: [800, 800],
    imageFit: 'cover',
    alt: 'A single water droplet resting on skin',
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
      scene: 'runner',
      tint: '#F7F4EF',
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
      scene: 'plant',
      tint: '#F1F4EC',
      layers: {
        stem: 'images/plant-stem.webp',
        bud: 'images/plant-bud.webp',
        leafLeft: 'images/plant-leaf-left.webp',
        leafRight: 'images/plant-leaf-right.webp',
      },
    },
  },
  {
    id: 'nad',
    name: 'NAD+',
    summary: 'NAD+ given as a slow infusion over a longer, relaxed session.',
    bookUrl: '#',
    image: 'images/nad.webp',
    imageSize: [800, 730],
    alt: 'A glass model of a molecule, with clear spheres joined by rods',
  },
  {
    id: 'muscle-recovery',
    name: 'Muscle Recovery',
    summary: 'Magnesium, amino acids and fluids in a saline drip.',
    bookUrl: '#',
    image: 'images/muscle-recovery.webp',
    imageSize: [800, 687],
    alt: 'An athlete holding a deep lunge stretch',
  },
];

/* ==========================================================================
   2. STAGE TIMING

   The stage is one master timeline. Each treatment owns a "segment" of it
   (entrance → rest → exit). The next treatment's segment begins as soon as
   the current one reaches its rest point, so every exit overlaps the next
   entrance. The rest points are the timeline labels, and the places the
   page gently settles on when scrolling stops.
   ========================================================================== */

const STAGE = {
  pinPerTreatment: { desktop: 150, mobile: 110 }, // % of the viewport height
  segment: 1.4,         // timeline length of one treatment's segment
  endHold: 0.35,        // how long the last treatment holds before the stage unpins
  // Text handovers, as fractions of a segment after the outgoing treatment's rest point.
  textOut: [0.03, 0.19],
  textIn: [0.14, 0.31],
  // Desktop only: the Energy text waits until the runner has crossed the text column.
  firstTextIn: [0.58, 0.7],
  finalTint: '#FBFAF7', // Porcelain, to match the "All treatments" band below
  snap: {
    idle: 150,          // ms of stillness before gliding to the nearest rest point
    duration: [0.6, 0.9],
  },
};

/* ==========================================================================
   3. Rendering
   ========================================================================== */

const esc = (value) =>
  String(value).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

const pad = (n) => String(n).padStart(2, '0');

function badgeHTML(badge) {
  if (!badge) return '';
  const cls = badge.variant === 'sage' ? 'badge badge--sage' : 'badge';
  return `<span class="${cls}">${esc(badge.text)}</span>`;
}

const layerImg = (src, [w, h], attrs = '') =>
  `<img class="layer" src="${esc(src)}" alt="" width="${w}" height="${h}" decoding="async" draggable="false"${attrs}>`;

function objHTML(t, type, inner, ratio = t.imageSize) {
  return `
    <div class="obj obj--${type}" style="--ratio: ${ratio[0]} / ${ratio[1]}" role="img" aria-label="${esc(t.alt || t.name)}">
      <span class="obj__shadow" aria-hidden="true"></span>
      ${inner}
    </div>`;
}

function textHTML(t, titleId) {
  return `
    <p class="eyebrow">IV therapy</p>
    <h2 class="treatment-title" id="${titleId}">${esc(t.name)}</h2>
    <p class="treatment-desc">${esc(t.showcase.description)}</p>
    ${badgeHTML(t.badge)}
    <a class="btn btn--primary" href="${esc(t.bookUrl)}">Book<span class="visually-hidden"> ${esc(t.name)}</span></a>`;
}

function stageHTML(featured) {
  // Earlier scenes stack above later ones, so an outgoing object passes in
  // front of the one arriving behind it.
  const scenes = featured.map((t, i) => {
    const def = SCENES[t.showcase.scene] || SCENES.fade;
    return `<div class="scene scene--${esc(t.showcase.scene)}" data-scene="${esc(t.id)}" style="z-index: ${featured.length - i}">${def.html(t)}</div>`;
  }).join('');

  const copies = featured.map((t) =>
    `<article class="stage__copy" data-copy="${esc(t.id)}">${textHTML(t, `stage-${esc(t.id)}-title`)}</article>`).join('');

  const steps = featured.map((t, i) => `
    <li><button type="button" class="stage__step" data-goto="${esc(t.id)}" aria-label="${i + 1}: ${esc(t.name)}">${pad(i + 1)}</button></li>`).join('');

  const names = featured.map((t) => `<span class="stage__name">${esc(t.name)}</span>`).join('');

  return `
    <section class="stage" id="stage" aria-label="Featured treatments">
      <div class="stage__bg" aria-hidden="true"></div>
      <div class="container stage__inner">
        <div class="stage__visual">${scenes}</div>
        <div class="stage__text">${copies}</div>
      </div>
      <nav class="stage__progress" aria-label="Featured treatments">
        <ol class="stage__steps">${steps}</ol>
        <p class="stage__names" aria-hidden="true">${names}</p>
      </nav>
    </section>`;
}

// Calm stacked blocks with the finished images: used for reduced motion,
// and whenever the scroll animation can't run.
function staticListHTML(featured) {
  const blocks = featured.map((t, i) => {
    const [w, h] = t.imageSize;
    return `
      <section class="treatment-block treatment-block--image-${i % 2 ? 'left' : 'right'}" id="${esc(t.id)}" aria-labelledby="${esc(t.id)}-title">
        <div class="container treatment-block__inner">
          <div class="treatment-block__media">
            <img src="${esc(t.image)}" alt="${esc(t.alt || '')}" width="${w}" height="${h}" loading="lazy" decoding="async">
          </div>
          <div class="treatment-block__text">${textHTML(t, `${esc(t.id)}-title`)}</div>
        </div>
      </section>`;
  }).join('');
  return `<div class="treatment-list">${blocks}</div>`;
}

// Share of the card's image well that a cut-out may fill (12% padding on each side).
const CARD_FILL = 0.76;

function cardMediaHTML(t) {
  if (!t.image) {
    return `<div class="card__media" aria-hidden="true"><span class="placeholder placeholder--${esc(t.placeholder?.shape || 'circle')}" style="--ph: ${esc(t.placeholder?.colour || '#E8EFFB')}"></span></div>`;
  }
  const [w, h] = t.imageSize;
  const img = `<img src="${esc(t.image)}" alt="${esc(t.alt || '')}" width="${w}" height="${h}" loading="lazy" decoding="async">`;

  // A full photo fills the well; it scales inside its rounded frame on hover.
  if (t.imageFit === 'cover') return `<div class="card__media card__media--photo">${img}</div>`;

  // A cut-out is contained in the padded area, with a soft ellipse shadow just
  // below where the image actually ends (tall, wide and square images differ).
  const shownW = CARD_FILL * Math.min(1, w / h);
  const shownH = CARD_FILL * Math.min(1, h / w);
  const bottom = ((1 - shownH) / 2) * 100;
  const shadow = `--shadow-w: ${(shownW * 70).toFixed(1)}%; --shadow-bottom: ${(bottom - 3).toFixed(1)}%`;
  return `<div class="card__media"><span class="card__shadow" style="${shadow}" aria-hidden="true"></span>${img}</div>`;
}

function cardHTML(t) {
  return `
    <article class="card" data-card>
      ${cardMediaHTML(t)}
      <h3 class="card__title">${esc(t.name)}</h3>
      <p class="card__desc">${esc(t.summary)}</p>
      ${badgeHTML(t.badge)}
      <div class="card__action">
        <a class="btn btn--primary btn--compact" href="${esc(t.bookUrl)}">Book<span class="visually-hidden"> ${esc(t.name)}</span></a>
      </div>
    </article>`;
}

const FEATURED = TREATMENTS
  .filter((t) => t.showcase && t.image)
  .sort((a, b) => a.showcase.order - b.showcase.order);

function render() {
  const stageRoot = document.getElementById('stage-root');
  const gridRoot = document.getElementById('treatment-grid');
  if (stageRoot) stageRoot.innerHTML = stageHTML(FEATURED) + staticListHTML(FEATURED);
  if (gridRoot) gridRoot.innerHTML = TREATMENTS.map(cardHTML).join('');
}

/* ==========================================================================
   Scenes: the markup and the animation for each kind of featured visual.

   animate(c) receives:
     c.tl       the master timeline
     c.scene    the scene element
     c.ft()     adds a fromTo tween between two fractions of this treatment's
                segment (0 = entrance begins, 1 = exit completes)
     c.isFirst, c.isLast, c.isDesktop
   Every animation reaches its natural, finished picture at `rest`.
   Only transform, opacity and clip-path are animated.
   ========================================================================== */

// Left edge of an element relative to the viewport, ignoring transforms.
function layoutLeft(el) {
  let left = 0;
  for (let node = el; node; node = node.offsetParent) left += node.offsetLeft;
  return left - window.scrollX;
}

const SCENES = {
  // ENERGY: runs in from the left edge of the screen to the right of the visual
  // area, then keeps running off the right edge during the handover.
  runner: {
    rest: 0.7,
    html: (t) => objHTML(t, 'runner', layerImg(t.image, t.imageSize)),
    animate({ scene, ft, isFirst, isLast }) {
      const obj = scene.querySelector('.obj');
      const xStart = () => -(layoutLeft(obj) + obj.offsetWidth * 0.75);
      const xRest = () => obj.offsetWidth * 0.1;
      const xExit = () => window.innerWidth - layoutLeft(obj) + 40;

      gsap.set(obj, { x: xStart });
      if (!isFirst) {
        gsap.set(obj, { autoAlpha: 0 });
        ft(obj, { autoAlpha: 0 }, { autoAlpha: 1 }, 0, 0.15, 'power1.out');
      }
      ft(obj, { x: xStart }, { x: xRest }, 0, 0.7);
      if (!isLast) ft(obj, { x: xRest }, { x: xExit }, 0.7, 1);
    },
  },

  // IMMUNITY: the whole orange rises in, then splits into two halves and a
  // burst of juice. The layers share one canvas; the halves meet at 49.8% 49.5%.
  orange: {
    rest: 0.7,
    html: (t) => objHTML(t, 'orange', [
      layerImg(t.showcase.layers.juice, t.imageSize, ' data-layer="juice"'),
      layerImg(t.showcase.layers.left, t.imageSize, ' data-layer="left"'),
      layerImg(t.showcase.layers.right, t.imageSize, ' data-layer="right"'),
      layerImg(t.showcase.layers.whole, t.imageSize, ' data-layer="whole"'),
    ].join('')),
    animate({ scene, ft, isLast }) {
      const q = (name) => scene.querySelector(`[data-layer="${name}"]`);
      const juice = q('juice'), left = q('left'), right = q('right'), whole = q('whole');
      const shadow = scene.querySelector('.obj__shadow');
      const MEET = '49.8% 49.5%';
      const leftTogether = { xPercent: 8.4, yPercent: 3.0, rotation: -6 };
      const rightTogether = { xPercent: -7.8, yPercent: -4.3, rotation: 6 };
      const apart = { xPercent: 0, yPercent: 0, rotation: 0 };

      gsap.set([juice, left, right, whole], { transformOrigin: MEET });
      gsap.set([left, right, juice], { autoAlpha: 0 });
      gsap.set(left, leftTogether);
      gsap.set(right, rightTogether);
      gsap.set(juice, { scale: 0.4 });
      gsap.set(whole, { autoAlpha: 0, yPercent: 8, scale: 0.9, rotation: -5 });
      gsap.set(shadow, { autoAlpha: 0, scale: 0.8 });

      // Entrance: only the whole orange, rising gently into place.
      ft(whole, { autoAlpha: 0 }, { autoAlpha: 1 }, 0, 0.22, 'power1.out');
      ft(whole, { yPercent: 8, scale: 0.9, rotation: -5 }, { yPercent: 0, scale: 1, rotation: 0 }, 0, 0.35, 'power2.out');
      ft(shadow, { autoAlpha: 0, scale: 0.8 }, { autoAlpha: 1, scale: 1 }, 0, 0.35, 'power2.out');

      // The split: a quick crossfade from the whole orange to the pushed-together halves.
      ft(whole, { autoAlpha: 1, scale: 1 }, { autoAlpha: 0, scale: 1.03 }, 0.35, 0.45, 'power1.inOut');
      ft([left, right], { autoAlpha: 0 }, { autoAlpha: 1 }, 0.35, 0.45, 'power1.inOut');

      // The halves settle apart while the juice bursts outward from the split.
      ft(left, leftTogether, apart, 0.4, 0.7, 'power2.out');
      ft(right, rightTogether, apart, 0.4, 0.7, 'power2.out');
      ft(juice, { autoAlpha: 0, scale: 0.4 }, { autoAlpha: 1, scale: 1 }, 0.4, 0.7, 'power2.out');

      if (isLast) return;
      // Exit: everything keeps drifting apart (opening a space in the centre
      // for the next object) and fades.
      ft(left, apart, { xPercent: -11, yPercent: -3.5, rotation: -6 }, 0.7, 1, 'power1.inOut');
      ft(right, apart, { xPercent: 11, yPercent: 4.5, rotation: 6 }, 0.7, 1, 'power1.inOut');
      ft(juice, { scale: 1 }, { scale: 1.15 }, 0.7, 1, 'power1.out');
      ft([left, right, juice], { autoAlpha: 1 }, { autoAlpha: 0 }, 0.72, 0.95, 'power1.inOut');
      ft(shadow, { autoAlpha: 1 }, { autoAlpha: 0 }, 0.72, 0.95, 'power1.inOut');
    },
  },

  // IRON: a real 3D red blood cell (see section 4), with the photo as a fallback.
  cell: {
    rest: 0.7,
    html: (t) => objHTML(t, 'cell', `
      <div class="layer cell-host"></div>
      <img class="layer cell-fallback" src="${esc(t.image)}" alt="" width="${t.imageSize[0]}" height="${t.imageSize[1]}" decoding="async" draggable="false" hidden>`,
    [1, 1]),
    animate({ scene, ft, tl, start, L, isLast }) {
      const obj = scene.querySelector('.obj');
      const fallback = scene.querySelector('.cell-fallback');
      gsap.set(obj, { autoAlpha: 0, scale: 0.35 });

      // Scales up from small in the centre, already rotating.
      ft(obj, { autoAlpha: 0, scale: 0.35 }, { autoAlpha: 1, scale: 1 }, 0.08, 0.32, 'power2.out');
      if (!isLast) ft(obj, { autoAlpha: 1, scale: 1 }, { autoAlpha: 0, scale: 0.85 }, 0.7, 1, 'power1.inOut');

      // The spin and tilt follow the scroll through the whole segment.
      const proxy = { p: 0 };
      const update = () => {
        if (ironCell) ironCell.setProgress(proxy.p);
        else gsap.set(fallback, { rotation: -30 + 60 * proxy.p });
      };
      tl.fromTo(proxy, { p: 0 }, { p: 1, duration: L, ease: 'none', immediateRender: false, onUpdate: update }, start);
      ironWindow = [start - 0.02, start + L + 0.02];
    },
  },

  // HAIR & SCALP: a soft-edged wipe from bottom to top while easing out from 1.1× scale.
  // With a swayMask, the hair also sways with the scroll (see section 4b); the
  // plain image stays underneath as the fallback.
  wipe: {
    rest: 0.7,
    html: (t) => objHTML(t, 'wipe', `
      <div class="wipe-frame"><div class="wipe-mask"><div class="layer wipe-content">
        <img class="wipe-img" src="${esc(t.image)}" alt="" width="${t.imageSize[0]}" height="${t.imageSize[1]}" decoding="async" draggable="false">
      </div></div></div>`),
    animate({ t, scene, ft, start, L, isLast }) {
      const obj = scene.querySelector('.obj');
      const mask = scene.querySelector('.wipe-mask');
      const content = mask.querySelector('.wipe-content');
      const shadow = scene.querySelector('.obj__shadow');

      // The mask layer is 1.25× the image height; its top edge is a soft fade.
      // Moving it up while counter-moving the content reveals it from the bottom.
      gsap.set(mask, { yPercent: 100 });
      gsap.set(content, { yPercent: -125, scale: 1.1 });
      gsap.set(shadow, { autoAlpha: 0 });

      ft(mask, { yPercent: 100 }, { yPercent: 0 }, 0, 0.7, 'power1.inOut');
      ft(content, { yPercent: -125, scale: 1.1 }, { yPercent: 0, scale: 1 }, 0, 0.7, 'power1.inOut');
      ft(shadow, { autoAlpha: 0 }, { autoAlpha: 1 }, 0.3, 0.7, 'power1.inOut');

      if (!isLast) ft(obj, { autoAlpha: 1, y: 0 }, { autoAlpha: 0, y: -30 }, 0.7, 1, 'power1.inOut');

      if (!t.showcase.swayMask) return;
      // One and a half slow oscillations across the segment: 0 → +1 → −1 → +0.6 → 0.
      const sway = { v: 0 };
      const push = () => { if (hairSway) hairSway.setSway(sway.v); };
      [[0, 1, 0, 0.25], [1, -1, 0.25, 0.5], [-1, 0.6, 0.5, 0.75], [0.6, 0, 0.75, 1]].forEach(([from, to, f0, f1]) => {
        ft(sway, { v: from }, { v: to, onUpdate: push }, f0, f1, 'sine.inOut');
      });
      hairWindow = [start - 0.02, start + L + 0.02];
    },
  },

  // LONGEVITY: the stem grows, then the bud emerges and the leaves unfurl.
  // Layers share one canvas; origins are percentages of that canvas.
  plant: {
    rest: 0.85,
    html: (t) => objHTML(t, 'plant', [
      layerImg(t.showcase.layers.stem, t.imageSize, ' data-layer="stem"'),
      layerImg(t.showcase.layers.bud, t.imageSize, ' data-layer="bud"'),
      layerImg(t.showcase.layers.leafLeft, t.imageSize, ' data-layer="leaf-left"'),
      layerImg(t.showcase.layers.leafRight, t.imageSize, ' data-layer="leaf-right"'),
    ].join('')),
    animate({ scene, ft, isLast }) {
      const q = (name) => scene.querySelector(`[data-layer="${name}"]`);
      const stem = q('stem'), bud = q('bud'), leafL = q('leaf-left'), leafR = q('leaf-right');
      const obj = scene.querySelector('.obj');
      const shadow = scene.querySelector('.obj__shadow');

      gsap.set(stem, { clipPath: 'inset(97% 0% 0% 0%)' });
      gsap.set(bud, { scale: 0, autoAlpha: 0, transformOrigin: '54.2% 59.8%' });
      gsap.set(leafL, { scale: 0, rotation: 35, transformOrigin: '52.9% 59.3%' });
      gsap.set(leafR, { scale: 0, rotation: -35, transformOrigin: '56.4% 59.3%' });
      gsap.set(shadow, { autoAlpha: 0, scaleX: 0.3 });

      ft(stem, { clipPath: 'inset(97% 0% 0% 0%)' }, { clipPath: 'inset(59% 0% 0% 0%)' }, 0, 0.35, 'power1.out');
      ft(shadow, { autoAlpha: 0, scaleX: 0.3 }, { autoAlpha: 1, scaleX: 1 }, 0, 0.5, 'power1.out');
      ft(bud, { scale: 0, autoAlpha: 0 }, { scale: 1, autoAlpha: 1 }, 0.28, 0.5, 'power2.out');
      ft(leafL, { scale: 0, rotation: 35 }, { scale: 1, rotation: 0 }, 0.38, 0.75, 'power2.out');
      ft(leafR, { scale: 0, rotation: -35 }, { scale: 1, rotation: 0 }, 0.46, 0.82, 'power2.out');

      if (!isLast) ft(obj, { autoAlpha: 1, y: 0 }, { autoAlpha: 0, y: -30 }, 0.85, 1, 'power1.inOut');
    },
  },

  // Fallback for new treatments without a dedicated scene.
  fade: {
    rest: 0.7,
    html: (t) => objHTML(t, 'fade', layerImg(t.image, t.imageSize)),
    animate({ scene, ft, isLast }) {
      const obj = scene.querySelector('.obj');
      gsap.set(obj, { autoAlpha: 0, y: 40 });
      ft(obj, { autoAlpha: 0, y: 40 }, { autoAlpha: 1, y: 0 }, 0, 0.35, 'power2.out');
      if (!isLast) ft(obj, { autoAlpha: 1, y: 0 }, { autoAlpha: 0, y: -30 }, 0.7, 1, 'power1.inOut');
    },
  },
};

/* ==========================================================================
   4. Iron: 3D red blood cell (Three.js, loaded as an ES module through the
   import map in index.html)
   ========================================================================== */

let ironCell = null;        // the running 3D cell, or null (then the photo is used)
let ironCellPromise = null;
let ironWindow = [-1, -1];  // timeline span in which the cell is on screen
let ironVisible = false;

async function createIronCell(host, pixelRatioCap) {
  const probe = document.createElement('canvas');
  if (!(probe.getContext('webgl2') || probe.getContext('webgl'))) return null;

  const THREE = await import('three');
  const { RoomEnvironment } = await import('three/addons/environments/RoomEnvironment.js');

  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'high-performance' });
  renderer.setClearColor(0x000000, 0);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, pixelRatioCap));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.8;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.domElement.className = 'cell-canvas';
  host.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = 0.35; // soft reflections only; the lights do the shaping
  pmrem.dispose();

  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
  camera.position.set(0, 0, 18);

  // Evans–Fung red blood cell profile: half-thickness at normalised radius r.
  const R = 3.91, C0 = 0.81, C2 = 7.83, C4 = -4.39;
  const half = (r) => 0.5 * Math.sqrt(Math.max(0, 1 - r * r)) * (C0 + C2 * r * r + C4 * r ** 4);
  const N = 72;       // points per surface (145 in the closed profile)
  const SEGMENTS = 128;
  const rAt = (i) => Math.sin((i / N) * Math.PI / 2); // denser towards the rounded rim
  const profile = [];
  // One surface from the centre out to the rim, then the mirrored surface back
  // to the centre: a closed biconcave disc. (This winding keeps normals facing out.)
  for (let i = 0; i <= N; i++) profile.push(new THREE.Vector2(rAt(i) * R, -half(rAt(i))));
  for (let i = N - 1; i >= 0; i--) profile.push(new THREE.Vector2(rAt(i) * R, half(rAt(i))));

  const geometry = new THREE.LatheGeometry(profile, SEGMENTS);
  geometry.computeVertexNormals();
  // Smooth the lathe seam and the two centre points, which computeVertexNormals leaves creased.
  const normals = geometry.attributes.normal;
  const P = profile.length;
  const a = new THREE.Vector3(), b = new THREE.Vector3();
  for (let j = 0; j < P; j++) {
    const first = j, last = SEGMENTS * P + j;
    a.fromBufferAttribute(normals, first).add(b.fromBufferAttribute(normals, last)).normalize();
    normals.setXYZ(first, a.x, a.y, a.z);
    normals.setXYZ(last, a.x, a.y, a.z);
  }
  for (let i = 0; i <= SEGMENTS; i++) {
    normals.setXYZ(i * P, 0, -1, 0);
    normals.setXYZ(i * P + P - 1, 0, 1, 0);
  }
  normals.needsUpdate = true;

  // A very fine, soft surface grain so the cell reads as organic rather than plastic.
  const grain = document.createElement('canvas');
  grain.width = grain.height = 256;
  const g = grain.getContext('2d');
  g.fillStyle = '#808080';
  g.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 2600; i++) {
    const shade = 90 + Math.random() * 80;
    g.fillStyle = `rgba(${shade}, ${shade}, ${shade}, 0.35)`;
    g.beginPath();
    g.arc(Math.random() * 256, Math.random() * 256, 1 + Math.random() * 3, 0, Math.PI * 2);
    g.fill();
  }
  const bumpMap = new THREE.CanvasTexture(grain);
  bumpMap.wrapS = bumpMap.wrapT = THREE.RepeatWrapping;
  bumpMap.repeat.set(10, 3);

  const material = new THREE.MeshPhysicalMaterial({
    color: 0xb3121b,
    roughness: 0.35,
    metalness: 0,
    clearcoat: 0.6,
    clearcoatRoughness: 0.35,
    sheen: 0.25,
    sheenRoughness: 0.6,
    sheenColor: new THREE.Color(0xd8483e),
    bumpMap,
    bumpScale: 2,
  });

  const mesh = new THREE.Mesh(geometry, material);
  const tilt = new THREE.Group();   // tilts the disc towards / away from the viewer
  const roll = new THREE.Group();   // a gentle diagonal, like the photograph
  const spin = new THREE.Group();   // turns around the vertical axis
  const float = new THREE.Group();  // slow idle drift
  tilt.add(mesh);
  roll.add(tilt);
  roll.rotation.z = -0.45;
  spin.add(roll);
  float.add(spin);
  scene.add(float);

  scene.add(new THREE.HemisphereLight(0xfff4ea, 0x3a0e0e, 0.4));
  const key = new THREE.DirectionalLight(0xfff0e0, 1.7);
  key.position.set(-6, 7, 8);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0xffe2d8, 1.3);
  rim.position.set(5, 3, -8);
  scene.add(rim);

  let progress = 0;
  const REST = SCENES.cell.rest;
  const DEG = Math.PI / 180;

  const resize = () => {
    const w = host.clientWidth, h = host.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  };
  new ResizeObserver(resize).observe(host);
  resize();

  const cell = {
    setProgress(p) { progress = p; },
    setPixelRatioCap(cap) {
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, cap));
      resize();
    },
    render(time) {
      // A full turn across the segment, facing the viewer at the rest point.
      // The tilt eases from 60° (face-on, showing the dip) to 20° (the rim)
      // and back to 60° by the rest point, so the cell settles showing its dip.
      spin.rotation.y = (progress - REST) * Math.PI * 2;
      const tiltDeg = progress < REST ? 40 + 20 * Math.cos((2 * Math.PI * progress) / REST) : 60;
      tilt.rotation.x = tiltDeg * DEG;
      float.position.y = Math.sin(time * 1.1) * 0.14;
      float.rotation.z = Math.sin(time * 0.6) * 0.03;
      renderer.render(scene, camera);
    },
  };
  cell.render(0); // compile shaders now, not mid-scroll
  return cell;
}

function ensureIronCell(root, isDesktop) {
  const host = root.querySelector('.cell-host');
  if (!host) return Promise.resolve(null);
  const cap = isDesktop ? 2 : 1.5;
  if (!ironCellPromise) {
    ironCellPromise = createIronCell(host, cap)
      .catch(() => null)
      .then((cell) => {
        ironCell = cell;
        if (!cell) root.querySelector('.cell-fallback')?.removeAttribute('hidden');
        return cell;
      });
  } else if (ironCell) {
    ironCell.setPixelRatioCap(cap);
  }
  return ironCellPromise;
}

/* ==========================================================================
   4b. Hair & Scalp: the hair sways with the scroll

   hair.webp is drawn on a Three.js plane with a small shader that shifts the
   texture lookup sideways. The shift grows from the top of the head (still)
   to the ends of the hair (most movement) and is multiplied by
   hair-mask.webp, so skin, ear, neck, shoulder and background never move.
   ========================================================================== */

const HAIR_SWAY = {
  amplitude: 0.02,   // main sway at the ends, as a share of image width; with the
                     // secondary wave the ends move at most about 2.5%
  idle: 0.1,         // idle sway strength, relative to a full scroll swing
  idlePeriod: 6,     // seconds per idle cycle
  neckBand: 0.08,    // width (share of image width) over which the sway fades out
                     // towards the neck and back
};

let hairSway = null;        // the running shader, or null (then the plain image is used)
let hairSwayPromise = null;
let hairWindow = [-1, -1];  // timeline span in which the hair is on screen
let hairVisible = false;

const loadImage = (src) => new Promise((resolve, reject) => {
  const img = new Image();
  img.onload = () => img.decode().then(() => resolve(img), () => resolve(img));
  img.onerror = reject;
  img.src = src;
});

async function createHairSway(content, img, maskSrc, pixelRatioCap) {
  const probe = document.createElement('canvas');
  if (!(probe.getContext('webgl2') || probe.getContext('webgl'))) return null;

  const THREE = await import('three');
  const maskImg = await loadImage(maskSrc);
  if (!img.complete || !img.naturalWidth) await img.decode();

  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false, premultipliedAlpha: true });
  renderer.setClearColor(0x000000, 0);
  // Sizes are handed to Three.js in whole device pixels (see resize), so the
  // drawing buffer, viewport and textures always agree exactly.
  renderer.setPixelRatio(1);
  let pixelRatio = Math.min(window.devicePixelRatio || 1, pixelRatioCap);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.NoToneMapping;
  const canvas = renderer.domElement;
  canvas.className = 'wipe-canvas';
  canvas.setAttribute('aria-hidden', 'true');

  // Both textures are resampled by the browser to the canvas's exact pixel
  // size, so at rest every canvas pixel maps onto one texel and the hair looks
  // identical to the <img> (GPU mipmapping would soften the fine strands).
  const scaled = (source, w, h) => {
    const c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    // A CPU-backed canvas: its high-quality downscale is sharper than the GPU path.
    const g = c.getContext('2d', { willReadFrequently: true });
    g.imageSmoothingQuality = 'high';
    g.drawImage(source, 0, 0, w, h);
    return c;
  };
  // The mask's white area also covers a strip of neck and background beside
  // the hair. Fade the mask to black across the last part of each row on the
  // neck/back (right) side, so hair lying against the skin moves less and
  // that strip stays still. Rows use the nearest boundary within ±6 rows, so
  // the fade has no steps.
  const taperNeckSide = (c) => {
    const g = c.getContext('2d', { willReadFrequently: true });
    const { width: w, height: h } = c;
    const image = g.getImageData(0, 0, w, h);
    const d = image.data;
    const band = Math.max(2, Math.round(w * HAIR_SWAY.neckBand));
    const edge = new Int32Array(h).fill(-1);
    for (let y = 0; y < h; y++) {
      for (let x = w - 1; x >= 0; x--) {
        if (d[(y * w + x) * 4] > 127) { edge[y] = x; break; }
      }
    }
    for (let y = 0; y < h; y++) {
      let r = w;
      for (let k = Math.max(0, y - 6); k <= Math.min(h - 1, y + 6); k++) if (edge[k] >= 0) r = Math.min(r, edge[k]);
      if (r === w) continue;
      for (let x = Math.max(0, r - band); x < w; x++) {
        const t = Math.min(1, Math.max(0, (r - x) / band));
        const i = (y * w + x) * 4;
        d[i] = d[i + 1] = d[i + 2] = Math.round(d[i] * t * t * (3 - 2 * t));
      }
    }
    g.putImageData(image, 0, 0);
    return c;
  };
  const texture = (colorSpace, premultiply) => {
    const tex = new THREE.Texture();
    tex.colorSpace = colorSpace;
    tex.premultiplyAlpha = premultiply;
    tex.minFilter = tex.magFilter = THREE.LinearFilter;
    tex.generateMipmaps = false;
    tex.wrapS = tex.wrapT = THREE.ClampToEdgeWrapping;
    return tex;
  };
  // Colour: sRGB, premultiplied on upload so soft edges blend without fringes.
  const map = texture(THREE.SRGBColorSpace, true);
  // Mask: plain data, no colour conversion.
  const mask = texture(THREE.NoColorSpace, false);

  const uniforms = {
    uMap: { value: map },
    uMask: { value: mask },
    uSway: { value: 0 },
    uTime: { value: 0 },
    uAmplitude: { value: HAIR_SWAY.amplitude },
  };

  const material = new THREE.ShaderMaterial({
    uniforms,
    transparent: true,
    premultipliedAlpha: true,
    depthTest: false,
    depthWrite: false,
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = vec4(position.xy, 0.0, 1.0);
      }`,
    fragmentShader: /* glsl */ `
      uniform sampler2D uMap;
      uniform sampler2D uMask;
      uniform float uSway;
      uniform float uTime;
      uniform float uAmplitude;
      varying vec2 vUv;

      void main() {
        // vUv.y is 1 at the top of the image: the scalp barely moves, the ends move most.
        float weight = smoothstep(0.1, 0.95, 1.0 - vUv.y);
        float offset = uAmplitude * (uSway * weight + 0.25 * uSway * weight * sin(vUv.y * 6.0 + uTime * 0.8));

        // How much this pixel may move (the mask value):
        //  - hair moves by the mask (white = hair, black = never moves);
        //  - clear background may receive hair swinging in from beside it;
        //  - skin (opaque and black in the mask) never moves, and hair never
        //    pulls skin in, so the ear, neck and shoulder stay perfectly still.
        // Clear background is only pulled in from the outer (left) side of the
        // hair; on the neck and back side that would open holes beside the skin.
        // (Near-black mask values and near-opaque pixels count as fully still.)
        vec2 from = vec2(vUv.x - offset, vUv.y);
        float maskHere = smoothstep(0.02, 1.0, texture2D(uMask, vUv).r);
        float maskFrom = smoothstep(0.02, 1.0, texture2D(uMask, from).r);
        float clearHere = 1.0 - smoothstep(0.02, 0.6, texture2D(uMap, vUv).a);
        float clearFrom = (1.0 - smoothstep(0.02, 0.6, texture2D(uMap, from).a)) * step(0.0, offset);
        float mask = max(maskHere, clearHere * maskFrom) * max(maskFrom, clearFrom);

        vec2 uv = vec2(vUv.x - offset * mask, vUv.y);
        vec4 color = texture2D(uMap, uv); // premultiplied
        if (uv.x < 0.0 || uv.x > 1.0) color = vec4(0.0);
        gl_FragColor = color;
        #include <colorspace_fragment>
      }`,
  });

  const scene = new THREE.Scene();
  scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material));
  const camera = new THREE.Camera();

  // The canvas fills the same box as the image (the image's aspect ratio);
  // CSS sizes it, and its drawing buffer matches that box in device pixels.
  let textureSize = '';
  const resize = () => {
    const w = content.clientWidth, h = content.clientHeight;
    if (!w || !h) return;
    const pw = Math.max(1, Math.round(w * pixelRatio));
    const ph = Math.max(1, Math.round(h * pixelRatio));
    renderer.setSize(pw, ph, false);
    const key = `${pw}x${ph}`;
    if (key === textureSize) return;
    textureSize = key;
    // A new size needs new GPU storage; dispose so the textures are re-allocated.
    map.dispose();
    mask.dispose();
    map.image = scaled(img, pw, ph);
    mask.image = taperNeckSide(scaled(maskImg, pw, ph));
    map.needsUpdate = mask.needsUpdate = true;
  };
  new ResizeObserver(resize).observe(content);
  resize();

  let scrollSway = 0;
  let idle = HAIR_SWAY.idle;
  const sway = {
    canvas,
    setSway(v) { scrollSway = v; },
    setIdle(v) { idle = v; },
    setPixelRatioCap(cap) {
      pixelRatio = Math.min(window.devicePixelRatio || 1, cap);
      resize();
    },
    render(time) {
      uniforms.uTime.value = time;
      uniforms.uSway.value = scrollSway + idle * Math.sin((time / HAIR_SWAY.idlePeriod) * Math.PI * 2);
      renderer.render(scene, camera);
    },
  };

  // Draw the first frame before swapping, so the canvas replaces the image invisibly.
  content.appendChild(canvas);
  sway.render(0);
  img.style.visibility = 'hidden';
  return sway;
}

function ensureHairSway(root, isDesktop) {
  const t = FEATURED.find((f) => f.showcase.swayMask);
  const content = t && root.querySelector(`.scene[data-scene="${t.id}"] .wipe-content`);
  if (!content) return Promise.resolve(null);
  const cap = isDesktop ? 2 : 1.5;
  if (!hairSwayPromise) {
    hairSwayPromise = createHairSway(content, content.querySelector('.wipe-img'), t.showcase.swayMask, cap)
      .catch(() => null)
      .then((sway) => { hairSway = sway; return sway; });
  } else if (hairSway) {
    hairSway.setPixelRatioCap(cap);
  }
  return hairSwayPromise;
}

// Each 3D element only renders while its treatment is on screen.
const renderScenes = (time) => {
  if (ironCell && ironVisible) ironCell.render(time);
  if (hairSway && hairVisible) hairSway.render(time);
};

/* ==========================================================================
   5. Motion
   ========================================================================== */

let lenis = null;
let stage = null; // { st, tl, ids } once the stage is live

// Header gains its divider once the page has scrolled.
function initHeader() {
  const header = document.getElementById('site-header');
  if (!header) return;
  const update = () => header.classList.toggle('is-scrolled', window.scrollY > 8);
  update();
  window.addEventListener('scroll', update, { passive: true });
}

/* ---------- Programmatic scrolling (links, progress indicator, snapping) ---------- */

let autoScrolling = false;
const easeInOutSine = (t) => -(Math.cos(Math.PI * t) - 1) / 2;
const easeInOutCubic = (t) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);

function glideTo(y, duration, easing = easeInOutCubic) {
  if (!lenis) {
    window.scrollTo({ top: y, behavior: 'smooth' });
    return;
  }
  autoScrolling = true;
  lenis.scrollTo(y, { duration, easing, onComplete: () => { autoScrolling = false; } });
}

function scrollToTreatment(id) {
  if (!stage) return;
  const y = stage.st.labelToScroll(id);
  const distance = Math.abs(y - window.scrollY) / window.innerHeight;
  glideTo(y, gsap.utils.clamp(0.9, 1.8, 0.8 + distance * 0.25));
}

// In-page links scroll smoothly through Lenis. Links to a featured treatment
// go to its rest point on the stage. Bare "#" links are booking placeholders.
function initAnchors() {
  document.addEventListener('click', (event) => {
    const link = event.target.closest('a[href^="#"], [data-goto]');
    if (!link) return;

    if (link.dataset.goto) {
      scrollToTreatment(link.dataset.goto);
      return;
    }

    const hash = link.getAttribute('href');
    if (hash === '#') {
      event.preventDefault();
      return;
    }
    const id = decodeURIComponent(hash.slice(1));
    if (stage && stage.ids.includes(id)) {
      event.preventDefault();
      scrollToTreatment(id);
      history.pushState(null, '', hash);
      return;
    }
    const target = document.getElementById(id);
    if (target && lenis) {
      event.preventDefault();
      // Lenis honours the CSS scroll-padding-top, which clears the fixed header.
      lenis.scrollTo(target);
      history.pushState(null, '', hash);
    }
  });
}

// After the stage exists, honour a #hash in the address (e.g. #iron or #book).
function jumpToHash() {
  const id = decodeURIComponent(location.hash.slice(1));
  if (!id || id === 'top' || !lenis) return;
  if (stage && stage.ids.includes(id)) {
    lenis.scrollTo(stage.st.labelToScroll(id), { immediate: true, force: true });
  } else {
    const target = document.getElementById(id);
    if (target) lenis.scrollTo(target, { immediate: true, force: true });
  }
}

/* ---------- Gentle snapping, done through Lenis ----------
   When scrolling has stopped inside the stage, glide to the nearest rest
   point. The very start and end of the stage count as rest points too, so
   the page never pulls you back while you're entering or leaving it. */

let snapTimer = 0;
let touching = false;

function maybeSnap() {
  if (!stage || !lenis || autoScrolling || touching) return;
  const { st, ids } = stage;
  const y = lenis.scroll;
  if (y <= st.start + 1 || y >= st.end - 1) return;
  const targets = [st.start, ...ids.map((id) => st.labelToScroll(id)), st.end];
  const nearest = targets.reduce((best, t) => (Math.abs(t - y) < Math.abs(best - y) ? t : best));
  const distance = Math.abs(nearest - y);
  if (distance < 2) return;
  const [min, max] = STAGE.snap.duration;
  glideTo(nearest, min + (max - min) * Math.min(1, distance / (window.innerHeight * 0.75)), easeInOutSine);
}

// Called on every Lenis scroll event: snapping waits until scrolling has been still for a moment.
function scheduleSnap() {
  clearTimeout(snapTimer);
  if (!autoScrolling && !touching) snapTimer = setTimeout(maybeSnap, STAGE.snap.idle);
}

// Any direct input takes over from an automatic glide and postpones snapping.
function initSnapInputs() {
  const userInput = () => {
    autoScrolling = false;
    clearTimeout(snapTimer);
  };
  window.addEventListener('wheel', userInput, { passive: true });
  window.addEventListener('keydown', userInput);
  window.addEventListener('touchstart', () => { touching = true; userInput(); }, { passive: true });
  const release = () => { touching = false; scheduleSnap(); };
  window.addEventListener('touchend', release, { passive: true });
  window.addEventListener('touchcancel', release, { passive: true });
}

/* ---------- The stage ---------- */

function buildStageTimeline(root, isDesktop) {
  const L = STAGE.segment;
  const scenes = FEATURED.map((t) => root.querySelector(`.scene[data-scene="${t.id}"]`));
  const copies = FEATURED.map((t) => root.querySelector(`.stage__copy[data-copy="${t.id}"]`));
  const steps = [...root.querySelectorAll('.stage__step')];
  const names = [...root.querySelectorAll('.stage__name')];
  const bg = root.querySelector('.stage__bg');
  const defs = FEATURED.map((t) => SCENES[t.showcase.scene] || SCENES.fade);

  // Segment starts and rest points (labels). The next segment begins at the current rest point.
  const starts = [];
  const rests = [];
  let s = 0;
  defs.forEach((def) => {
    starts.push(s);
    rests.push(s + def.rest * L);
    s = rests[rests.length - 1];
  });
  const end = rests[rests.length - 1] + STAGE.endHold;

  // The active treatment changes halfway through each text handover.
  const textMid = ((STAGE.textOut[0] + STAGE.textOut[1]) / 2 + (STAGE.textIn[0] + STAGE.textIn[1]) / 2) / 2;
  const switches = rests.map((r, i) => (i === 0 ? -Infinity : rests[i - 1] + textMid * L));

  let active = -1;
  const setActive = (index) => {
    if (index === active) return;
    active = index;
    copies.forEach((el, i) => {
      el.classList.toggle('is-active', i === index);
      el.inert = i !== index;
    });
    steps.forEach((el, i) => {
      el.classList.toggle('is-active', i === index);
      if (i === index) el.setAttribute('aria-current', 'step');
      else el.removeAttribute('aria-current');
    });
    names.forEach((el, i) => el.classList.toggle('is-active', i === index));
  };

  const onUpdate = () => {
    const time = tl.time();
    let index = 0;
    switches.forEach((at, i) => { if (time >= at) index = i; });
    setActive(index);
    ironVisible = time >= ironWindow[0] && time <= ironWindow[1];
    hairVisible = time >= hairWindow[0] && time <= hairWindow[1];
  };

  const tl = gsap.timeline({ paused: true, defaults: { ease: 'none' }, onUpdate });

  // Visuals
  FEATURED.forEach((t, i) => {
    const start = starts[i];
    const ft = (target, from, to, f0, f1, ease = 'none') =>
      tl.fromTo(target, from, { ...to, duration: (f1 - f0) * L, ease, immediateRender: false }, start + f0 * L);
    const isFirst = i === 0;
    const isLast = i === FEATURED.length - 1;

    if (!isFirst) {
      gsap.set(scenes[i], { autoAlpha: 0 });
      tl.set(scenes[i], { autoAlpha: 1 }, start);
    }
    if (!isLast) tl.set(scenes[i], { autoAlpha: 0 }, start + L);

    defs[i].animate({ t, tl, scene: scenes[i], ft, start, L, isFirst, isLast, isDesktop });
    tl.addLabel(t.id, rests[i]);
  });

  // Text: each block hands over to the next, overlapping slightly.
  gsap.set(copies, { autoAlpha: 0, y: 30 });
  const [fi0, fi1] = STAGE.firstTextIn;
  if (isDesktop && FEATURED[0].showcase.scene === 'runner') {
    tl.fromTo(copies[0], { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, duration: (fi1 - fi0) * L, ease: 'power2.out', immediateRender: false }, fi0 * L);
  } else {
    gsap.set(copies[0], { autoAlpha: 1, y: 0 });
  }
  const [o0, o1] = STAGE.textOut;
  const [i0, i1] = STAGE.textIn;
  for (let i = 0; i < FEATURED.length - 1; i++) {
    const h = rests[i];
    tl.fromTo(copies[i], { autoAlpha: 1, y: 0 }, { autoAlpha: 0, y: -30, duration: (o1 - o0) * L, ease: 'power1.inOut', immediateRender: false }, h + o0 * L);
    tl.fromTo(copies[i + 1], { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, duration: (i1 - i0) * L, ease: 'power2.out', immediateRender: false }, h + i0 * L);
  }

  // Background: a gentle cross-fade between tints during each handover,
  // then to Porcelain so the stage releases seamlessly into the grid.
  const tints = FEATURED.map((t) => t.showcase.tint || '#F7F4EF');
  gsap.set(bg, { backgroundColor: tints[0] });
  for (let i = 0; i < FEATURED.length - 1; i++) {
    tl.fromTo(bg, { backgroundColor: tints[i] }, { backgroundColor: tints[i + 1], duration: (1 - defs[i].rest) * L, ease: 'power1.inOut', immediateRender: false }, rests[i]);
  }
  const fadeOut = STAGE.endHold * 0.8;
  tl.fromTo(bg, { backgroundColor: tints[tints.length - 1] }, { backgroundColor: STAGE.finalTint, duration: fadeOut, ease: 'power1.inOut', immediateRender: false }, end - fadeOut);

  tl.set({}, {}, end); // the timeline runs to the very end of the pin
  setActive(0);
  return { tl, rests, end };
}

async function preloadImages(root) {
  const images = [...root.querySelectorAll('.stage img')];
  await Promise.all(images.map((img) => img.decode().catch(() => {})));
}

function initStage(context, isDesktop) {
  const root = document.getElementById('stage');
  if (!root) return () => {};

  document.documentElement.classList.add('has-stage');
  const { tl } = buildStageTimeline(root, isDesktop);
  gsap.ticker.add(renderScenes);

  let alive = true;
  (async () => {
    // Everything is decoded and the 3D scenes are ready before the ScrollTrigger exists.
    await Promise.all([preloadImages(root), ensureIronCell(root, isDesktop), ensureHairSway(root, isDesktop)]);
    if (!alive) return;

    context.add(() => {
      const per = isDesktop ? STAGE.pinPerTreatment.desktop : STAGE.pinPerTreatment.mobile;
      const st = ScrollTrigger.create({
        trigger: root,
        start: 'top top',
        end: () => `+=${per * FEATURED.length}%`,
        pin: true,
        scrub: 1,
        animation: tl,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        refreshPriority: 1,
      });
      stage = { st, tl, ids: FEATURED.map((t) => t.id) };
    });
    ScrollTrigger.refresh();
    // The pin just made the page taller; let Lenis re-measure before any jump.
    if (lenis) lenis.resize();
    jumpToHash();
  })();

  return () => {
    alive = false;
    stage = null;
    ironVisible = false;
    hairVisible = false;
    gsap.ticker.remove(renderScenes);
    document.documentElement.classList.remove('has-stage');
  };
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
  // The iPhone address bar showing/hiding must never re-measure the pinned stage.
  ScrollTrigger.config({ ignoreMobileResize: true });

  const mm = gsap.matchMedia();

  // Smooth scrolling and snapping only when the user hasn't asked for reduced motion.
  mm.add('(prefers-reduced-motion: no-preference)', () => {
    lenis = startLenis();
    if (lenis) lenis.on('scroll', scheduleSnap);
    return () => {
      if (!lenis) return;
      lenis.stopTicker();
      lenis.destroy();
      lenis = null;
      gsap.ticker.lagSmoothing(500, 33);
    };
  });

  // Scroll animations. Under reduced motion nothing is registered: the
  // featured treatments show as calm stacked blocks with no pinning.
  mm.add({
    isDesktop: '(min-width: 768px)',
    isMobile: '(max-width: 767.98px)',
    reduceMotion: '(prefers-reduced-motion: reduce)',
  }, (context) => {
    const { reduceMotion, isDesktop } = context.conditions;
    if (reduceMotion) return;

    initHeroIntro();
    const cleanupStage = initStage(context, isDesktop);
    initSectionReveals(isDesktop);
    return cleanupStage;
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
initSnapInputs();
initMotion();

const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();
