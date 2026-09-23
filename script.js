/* ==========================================================================
   Bluebird Wellness: page script

   1. TREATMENT CONTENT   ← edit text, prices, images and the stage order here
   2. STAGE TIMING        ← fine-tune the scroll film here
   3. Rendering
   4. Scenes (one per kind of featured visual)
   5. Live effects: bubbles, frame sequence, hair sway (Three.js shader),
      NAD+ glass molecule (Three.js)
   6. Motion (Lenis smooth scroll + GSAP ScrollTrigger)
   ========================================================================== */

/* ==========================================================================
   1. TREATMENT CONTENT

   The order of this list is the order of the pinned stage AND of the
   "All treatments" grid.
   Fields:
     id           Unique, lowercase, no spaces. Also used as the page anchor.
     name         Display name.
     summary      One line for the card.
     priceFrom    "From £X" price in pounds.
                  PROVISIONAL: every price below still needs confirming.
     bookUrl      Booking link (placeholder "#" for now).
     image        Path to the image, e.g. "images/iron.webp". Leave as null to
                  show the soft placeholder shape instead.
     imageSize    [width, height] of the image in pixels (keeps the layout steady).
     imageFit     Optional. "cover" for a full photo (not a cut-out).
     alt          Short description of the image for screen readers.
     placeholder  Shown when there is no image: { shape, colour }
                  shape: "drop" | "circle" | "pill" | "blob" | "arch"
     badge        Optional small label, e.g. { text: "…", variant: "sky" | "sage" }
     showcase     The treatment's part of the pinned scroll stage:
                    description: 1–2 sentences shown beside the visual
                    scene:       which animation (see section 4):
                                 "runner" | "orange" | "float" | "coconut" |
                                 "fizz" | "molecule" | "spin" | "plant" |
                                 "wipe" | "droplet" | "glass" | "frames"
                                 (anything else fades in/out)
                    tint:        the stage's background colour for this treatment
                    layers:      ("orange", "plant") layer images on the image's canvas;
                                 ("coconut") layers on their own 1000 × 1056 canvas;
                                 ("droplet") the skin without the droplet, and the droplet alone
                    swayMask:    ("wipe") greyscale mask: white hair sways, black never moves
                    frames:      ("frames") { path, count, size } image sequence
                    model:       ("molecule") V2000 SDF file for the 3D glass molecule

   Copy rule: describe what's in each drip and the experience only. No claims
   that a treatment cures, treats, prevents, detoxes, boosts immunity,
   reverses ageing or grows hair (UK ASA/CAP).
   ========================================================================== */

// Ingredients to be confirmed by prescriber and compliance review before launch.
const TREATMENTS = [
  {
    id: 'energy',
    name: 'Energy',
    summary: 'A vitamin drip in a calm, unhurried session.',
    priceFrom: 149, // PROVISIONAL
    bookUrl: '#',
    image: 'images/energy.webp',
    imageSize: [772, 955],
    alt: 'A runner mid-stride',
    showcase: {
      description: 'A vitamin drip, prepared for you after your consultation. Take a seat and unwind while it runs, in clinic or at home.',
      scene: 'runner',
      tint: '#F7F4EF',
    },
  },
  {
    id: 'immunity',
    name: 'Immunity',
    summary: 'A vitamin and mineral drip, prepared after your consultation.',
    priceFrom: 149, // PROVISIONAL
    bookUrl: '#',
    image: 'images/immunity.webp',
    imageSize: [1040, 919],
    alt: 'Two halves of an orange with droplets of juice',
    showcase: {
      description: 'A vitamin and mineral drip, prepared for you after your consultation. Sit back and relax while it runs, in clinic or at home.',
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
    id: 'iron',
    name: 'Iron',
    summary: 'For diagnosed iron deficiency. A blood test and clinical assessment are needed first.',
    priceFrom: 295, // PROVISIONAL
    bookUrl: '#',
    image: 'images/iron.webp',
    imageSize: [760, 707],
    alt: 'A single red blood cell',
    badge: { text: 'Blood test required first', variant: 'sky' },
    showcase: {
      description: 'An iron infusion for adults with diagnosed iron deficiency. A blood test and clinical assessment are required before treatment.',
      scene: 'float',
      tint: '#F9EFEE',
    },
  },
  {
    id: 'hydration',
    name: 'Hydration',
    summary: 'Fluids and electrolytes in a saline drip.',
    priceFrom: 129, // PROVISIONAL
    bookUrl: '#',
    image: 'images/hydration.webp',
    imageSize: [760, 803],
    alt: 'A green coconut split open, with water splashing from it',
    showcase: {
      description: 'Fluids and electrolytes in a saline drip, given at an unhurried pace. Rest while it runs, in clinic or at home.',
      scene: 'coconut',
      tint: '#EEF3F8',
      layers: {
        whole: 'images/coconut-whole.webp',
        bottom: 'images/coconut-bottom.webp',
        top: 'images/coconut-top.webp',
        splash: 'images/coconut-splash.webp',
      },
    },
  },
  {
    id: 'detox',
    name: 'Detox',
    summary: 'A slow, calm drip with time to rest.',
    priceFrom: 169, // PROVISIONAL
    bookUrl: '#',
    image: 'images/detox.webp',
    imageSize: [719, 800],
    alt: 'Cucumber slices and mint leaves with water droplets',
    showcase: {
      description: 'A drip prepared for you after your consultation. A calm, unhurried session in our clinic or wherever suits you.',
      scene: 'fizz',
      tint: '#F0F4EC',
    },
  },
  {
    id: 'nad',
    name: 'NAD+',
    summary: 'NAD+ given as a slow infusion over a longer, relaxed session.',
    priceFrom: 395, // PROVISIONAL
    bookUrl: '#',
    image: 'images/nad.webp',
    imageSize: [800, 730],
    alt: 'A glass model of a molecule, with clear spheres joined by rods',
    showcase: {
      description: 'NAD+ given as a slow infusion over a longer session. Settle in and rest while it runs, in clinic or at home.',
      scene: 'molecule',
      tint: '#F2F2F7',
      model: 'models/nad.sdf',
    },
  },
  {
    id: 'longevity',
    name: 'Longevity',
    summary: 'A vitamin, mineral and amino acid drip.',
    priceFrom: 249, // PROVISIONAL
    bookUrl: '#',
    image: 'images/longevity.webp',
    imageSize: [860, 911],
    alt: 'A young green shoot with water droplets',
    showcase: {
      description: 'A vitamin, mineral and amino acid drip, prepared after your consultation. A calm, unhurried session, in clinic or at home.',
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
    id: 'hair',
    name: 'Hair & Scalp',
    summary: 'A vitamin and mineral drip, with quiet time to sit back.',
    priceFrom: 179, // PROVISIONAL
    bookUrl: '#',
    image: 'images/hair.webp',
    imageSize: [634, 1024],
    alt: 'Long, glossy brown hair seen from behind',
    showcase: {
      description: 'A vitamin and mineral drip, prepared after your consultation. Quiet time to sit back, in our clinic or wherever suits you.',
      scene: 'wipe',
      tint: '#F6F0EA',
      swayMask: 'images/hair-mask.webp',
    },
  },
  {
    id: 'skin',
    name: 'Skin & Beauty',
    summary: 'A vitamin drip with time to sit back and rest.',
    priceFrom: 179, // PROVISIONAL
    bookUrl: '#',
    image: 'images/skin.webp',
    imageSize: [800, 800],
    imageFit: 'cover',
    alt: 'A single water droplet resting on skin',
    showcase: {
      description: 'A vitamin drip, prepared after your consultation. Time to sit back and rest, in our clinic or at home.',
      scene: 'droplet',
      tint: '#F8EFEA',
      layers: {
        base: 'images/skin-base.webp',
        drop: 'images/skin-drop.webp',
      },
    },
  },
  {
    id: 'recovery',
    name: 'Recovery (Hangover)',
    summary: 'Fluids with electrolytes and vitamins, in a calm, unhurried setting.',
    priceFrom: 149, // PROVISIONAL
    bookUrl: '#',
    image: 'images/recovery.webp',
    imageSize: [432, 800],
    alt: 'A tall glass of sparkling water',
    showcase: {
      description: 'Fluids with electrolytes and vitamins in a saline drip. A quiet, unhurried setting, in clinic or at home.',
      scene: 'glass',
      tint: '#EFF4F5',
    },
  },
  {
    id: 'muscle-recovery',
    name: 'Muscle Recovery',
    summary: 'Fluids, minerals and amino acids in a saline drip.',
    priceFrom: 169, // PROVISIONAL
    bookUrl: '#',
    image: 'images/deadlift/deadlift-30.webp', // the finished pose: cards and reduced motion
    imageSize: [792, 1310],
    alt: 'An athlete standing tall at the top of a deadlift',
    showcase: {
      description: 'Fluids, minerals and amino acids in a saline drip. Put your feet up while it runs, in clinic or at home.',
      scene: 'frames',
      tint: '#F3F0EC',
      frames: { path: 'images/deadlift/deadlift-{n}.webp', count: 30, size: [792, 1310] },
    },
  },
];

/* ==========================================================================
   2. STAGE TIMING

   The stage is one master timeline. Each treatment owns a segment of it:
     0    – 0.2   entrance (overlapping the previous treatment's exit)
     0.2  – 0.82  rest: text fully visible; signature animations play mostly
                  in the first half, then the finished picture holds
     0.82 – 1     exit (overlapping the next treatment's entrance)
   The next segment therefore starts at 0.82 of the current one. Each
   treatment's label (where scrolling gently settles) sits in its rest.
   ========================================================================== */

const STAGE = {
  pinPerTreatment: { desktop: 120, mobile: 100 }, // % of the viewport height
  segment: 1,           // timeline length of one treatment's segment
  enterEnd: 0.2,        // end of the entrance
  exitStart: 0.82,      // start of the exit (= start of the next segment)
  label: 0.6,           // default rest label (scenes may override)
  textIn: [0.03, 0.18], // text fades up during the entrance…
  textOut: [0.82, 0.92],// …and away at the start of the exit
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

function priceHTML(t) {
  if (t.priceFrom == null) return '';
  return `<p class="price"><span class="price__from">From</span> <span class="price__value">£${esc(t.priceFrom)}</span></p>`;
}

function bookHTML(t, compact = false) {
  return `<a class="btn btn--primary${compact ? ' btn--compact' : ''}" href="${esc(t.bookUrl)}">Book<span class="visually-hidden"> ${esc(t.name)}</span></a>`;
}

const layerImg = (src, [w, h], attrs = '') =>
  `<img class="layer" src="${esc(src)}" alt="" width="${w}" height="${h}" decoding="async" draggable="false"${attrs}>`;

const placeholderHTML = (t, extra = '') =>
  `<span class="placeholder placeholder--${esc(t.placeholder?.shape || 'circle')}${extra}" style="--ph: ${esc(t.placeholder?.colour || '#E8EFFB')}" aria-hidden="true"></span>`;

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
    <div class="treatment-actions">${bookHTML(t)}${priceHTML(t)}</div>`;
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
    <li><button type="button" class="stage__step" data-goto="${esc(t.id)}" aria-label="${i + 1}: ${esc(t.name)}"><span>${pad(i + 1)}</span></button></li>`).join('');

  const names = featured.map((t, i) =>
    `<span class="stage__name"><span class="stage__name-num">${pad(i + 1)}</span> ${esc(t.name)}</span>`).join('');

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
    let media;
    if (!t.image) media = `<div class="treatment-block__shape">${placeholderHTML(t)}</div>`;
    else if (t.imageFit === 'cover') media = `<img class="treatment-block__photo" src="${esc(t.image)}" alt="${esc(t.alt || '')}" width="${w}" height="${h}" loading="lazy" decoding="async">`;
    else media = `<img src="${esc(t.image)}" alt="${esc(t.alt || '')}" width="${w}" height="${h}" loading="lazy" decoding="async">`;
    return `
      <section class="treatment-block treatment-block--image-${i % 2 ? 'left' : 'right'}" id="${esc(t.id)}" aria-labelledby="${esc(t.id)}-title">
        <div class="container treatment-block__inner">
          <div class="treatment-block__media">${media}</div>
          <div class="treatment-block__text">${textHTML(t, `${esc(t.id)}-title`)}</div>
        </div>
      </section>`;
  }).join('');
  return `<div class="treatment-list">${blocks}</div>`;
}

// Share of the card's image well that a cut-out may fill (12% padding on each side).
const CARD_FILL = 0.76;

function cardMediaHTML(t) {
  if (!t.image) return `<div class="card__media" aria-hidden="true">${placeholderHTML(t)}</div>`;
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
      <div class="card__action">${bookHTML(t, true)}${priceHTML(t)}</div>
    </article>`;
}

const FEATURED = TREATMENTS.filter((t) => t.showcase);

function render() {
  const stageRoot = document.getElementById('stage-root');
  const gridRoot = document.getElementById('treatment-grid');
  if (stageRoot) stageRoot.innerHTML = stageHTML(FEATURED) + staticListHTML(FEATURED);
  if (gridRoot) gridRoot.innerHTML = TREATMENTS.map(cardHTML).join('');
}

/* ==========================================================================
   4. Scenes: the markup and the animation for each kind of featured visual.

   runner   Energy: the runner settles beside the text, then runs off
   orange   Immunity: the orange splits into halves and juice
   float    Iron: the blood cell floats and turns
   coconut  Hydration: the coconut cracks, the lid lifts, water splashes
   fizz     Detox: cucumber and mint with bubbles
   molecule NAD+: the 3D glass molecule turns like a turntable
   spin     the turning image (NAD+ fallback when 3D can't run)
   plant    Longevity: the stem grows, the bud and leaves unfold
   wipe     Hair & Scalp: soft wipe, then the hair sways
   droplet  Skin & Beauty: a droplet falls onto the skin
   glass    Recovery: bubbles in the glass
   frames   Muscle Recovery: the deadlift image sequence
   fade     fallback for anything else

   animate(c) receives:
     c.t, c.scene, c.obj, c.shadow
     c.ft(target, from, to, f0, f1, ease)
                adds a scrubbed tween between two fractions of this
                treatment's segment (0 = entrance begins, 1 = exit completes)
     c.idle(target, vars)
                a gentle time-based loop that only runs while on screen
     c.live(effect)
                a canvas/WebGL effect that only runs while on screen
     c.tl, c.start, c.L, c.isFirst, c.isLast, c.isDesktop
   Every scene shows its natural, finished picture during its rest.
   Only transform, opacity, clip-path and mask position are animated.
   ========================================================================== */

// Offset of an element inside an ancestor, ignoring transforms.
function offsetWithin(el, ancestor) {
  let left = 0, top = 0;
  for (let node = el; node && node !== ancestor; node = node.offsetParent) {
    left += node.offsetLeft;
    top += node.offsetTop;
  }
  return { left, top };
}

// Default entrance and exit. The fades are staggered (the outgoing object
// fades mostly before the incoming one appears) while their movements overlap,
// so a handover never shows two half-faded pictures on top of each other.
const FADE_IN = [0.04, 0.18];
const FADE_OUT = [0.82, 0.95];
const fadeIn = ({ obj, ft }, from = { y: 40 }) => {
  gsap.set(obj, { autoAlpha: 0, ...from });
  ft(obj, { autoAlpha: 0 }, { autoAlpha: 1 }, ...FADE_IN, 'power1.out');
  const to = Object.fromEntries(Object.keys(from).map((k) => [k, k === 'scale' ? 1 : 0]));
  ft(obj, from, to, 0, 0.22, 'power2.out');
};
const fadeOut = ({ obj, ft, isLast }, to = { y: -30 }) => {
  if (isLast) return;
  const from = Object.fromEntries(Object.keys(to).map((k) => [k, k === 'scale' ? 1 : 0]));
  ft(obj, from, to, 0.82, 1, 'power1.inOut');
  ft(obj, { autoAlpha: 1 }, { autoAlpha: 0 }, ...FADE_OUT, 'power1.inOut');
};

// The turning image ("spin", and the NAD+ fallback). `tilt` receives the 3D wobble.
const spinHTML = (t) => `<div class="layer turn"><div class="layer idle-turn">${layerImg(t.image, t.imageSize)}</div></div>`;
function spinImage({ scene, ft, idle, label }, tilt) {
  const turn = scene.querySelector('.turn');
  gsap.set(tilt, { transformPerspective: 1200 });
  ft(turn, { rotation: -360 * label }, { rotation: 360 * (1 - label) }, 0, 1);
  ft(tilt, { rotationX: 8, rotationY: -8 }, { rotationX: -8, rotationY: 8 }, 0, 0.35, 'sine.inOut');
  ft(tilt, { rotationX: -8, rotationY: 8 }, { rotationX: 0, rotationY: 0 }, 0.35, label, 'sine.inOut');
  ft(tilt, { rotationX: 0, rotationY: 0 }, { rotationX: 5, rotationY: -5 }, label, 1, 'sine.inOut');
  idle(scene.querySelector('.idle-turn'), { rotation: 360, duration: 240, ease: 'none', yoyo: false });
}

const SCENES = {
  // ENERGY: starts large and centred with no text, settles beside the text
  // during the entrance, bobs very slightly at rest, then runs off the edge.
  runner: {
    html: (t) => objHTML(t, 'runner', layerImg(t.image, t.imageSize, ' data-layer="runner"')),
    animate(c) {
      const { obj, scene, ft, idle, isFirst, isLast } = c;
      const root = document.getElementById('stage');
      const header = 64;
      const centreX = () => root.clientWidth / 2 - (offsetWithin(obj, root).left + obj.offsetWidth / 2);
      const centreY = () => (root.clientHeight + header) / 2 - (offsetWithin(obj, root).top + obj.offsetHeight / 2);
      const bigScale = () => gsap.utils.clamp(1.1, 1.8, ((root.clientHeight - header) * 0.84) / obj.offsetHeight);
      const xExit = () => window.innerWidth - offsetWithin(obj, root).left + 40;

      gsap.set(obj, { x: centreX, y: centreY, scale: bigScale });
      if (!isFirst) {
        gsap.set(obj, { autoAlpha: 0 });
        ft(obj, { autoAlpha: 0 }, { autoAlpha: 1 }, ...FADE_IN, 'power1.out');
      }
      ft(obj, { x: centreX, y: centreY, scale: bigScale }, { x: 0, y: 0, scale: 1 }, 0, 0.2, 'power2.inOut');
      if (!isLast) ft(obj, { x: 0 }, { x: xExit }, 0.82, 1, 'power1.in');
      // A very subtle forward bob while he waits.
      idle(scene.querySelector('[data-layer="runner"]'), { y: -2.5, x: 1.5, duration: 0.42 });
    },
  },

  // IMMUNITY: the whole orange rises in, then splits into two halves and a
  // burst of juice (unchanged, retimed). The halves meet at 49.8% 49.5%.
  orange: {
    html: (t) => objHTML(t, 'orange', [
      layerImg(t.showcase.layers.juice, t.imageSize, ' data-layer="juice"'),
      layerImg(t.showcase.layers.left, t.imageSize, ' data-layer="left"'),
      layerImg(t.showcase.layers.right, t.imageSize, ' data-layer="right"'),
      layerImg(t.showcase.layers.whole, t.imageSize, ' data-layer="whole"'),
    ].join('')),
    animate({ scene, shadow, ft, isLast }) {
      const q = (name) => scene.querySelector(`[data-layer="${name}"]`);
      const juice = q('juice'), left = q('left'), right = q('right'), whole = q('whole');
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
      ft(whole, { autoAlpha: 0 }, { autoAlpha: 1 }, ...FADE_IN, 'power1.out');
      ft(whole, { yPercent: 8, scale: 0.9, rotation: -5 }, { yPercent: 0, scale: 1, rotation: 0 }, 0, 0.2, 'power2.out');
      ft(shadow, { autoAlpha: 0, scale: 0.8 }, { autoAlpha: 1, scale: 1 }, 0, 0.2, 'power2.out');

      // The split: a quick crossfade from the whole orange to the pushed-together halves.
      ft(whole, { autoAlpha: 1, scale: 1 }, { autoAlpha: 0, scale: 1.03 }, 0.2, 0.28, 'power1.inOut');
      ft([left, right], { autoAlpha: 0 }, { autoAlpha: 1 }, 0.2, 0.28, 'power1.inOut');

      // The halves settle apart while the juice bursts outward from the split.
      ft(left, leftTogether, apart, 0.24, 0.5, 'power2.out');
      ft(right, rightTogether, apart, 0.24, 0.5, 'power2.out');
      ft(juice, { autoAlpha: 0, scale: 0.4 }, { autoAlpha: 1, scale: 1 }, 0.24, 0.5, 'power2.out');

      if (isLast) return;
      // Exit: everything keeps drifting apart (opening a space in the centre) and fades.
      ft(left, apart, { xPercent: -11, yPercent: -3.5, rotation: -6 }, 0.82, 1, 'power1.inOut');
      ft(right, apart, { xPercent: 11, yPercent: 4.5, rotation: 6 }, 0.82, 1, 'power1.inOut');
      ft(juice, { scale: 1 }, { scale: 1.15 }, 0.82, 1, 'power1.out');
      ft([left, right, juice], { autoAlpha: 1 }, { autoAlpha: 0 }, ...FADE_OUT, 'power1.inOut');
      ft(shadow, { autoAlpha: 1 }, { autoAlpha: 0 }, ...FADE_OUT, 'power1.inOut');
    },
  },

  // IRON: the original photograph floats in and turns gently in-plane, with a
  // subtle 3D tilt (never beyond ±12°) and a slow idle float at rest.
  float: {
    html: (t) => objHTML(t, 'float', `<div class="layer tilt"><div class="layer bob">${layerImg(t.image, t.imageSize)}</div></div>`),
    animate(c) {
      const { obj, scene, ft, idle } = c;
      const tilt = scene.querySelector('.tilt');
      fadeIn(c, { scale: 0.85, y: 30 });
      gsap.set(tilt, { rotation: -20, rotationY: -12, transformPerspective: 1200 });
      ft(tilt, { rotation: -20, rotationY: -12 }, { rotation: 15, rotationY: 8 }, 0, 1, 'sine.inOut');
      idle(scene.querySelector('.bob'), { y: -5, duration: 3.2 });
      fadeOut(c, { y: -30, scale: 0.94 });
      return obj;
    },
  },

  // HYDRATION: the whole coconut rises in, cracks, and its lid lifts open with
  // a splash of water. The four layers share one 1000 × 1056 canvas.
  coconut: {
    html: (t) => {
      const size = [1000, 1056];
      return objHTML(t, 'coconut', [
        layerImg(t.showcase.layers.bottom, size, ' data-layer="bottom"'),
        layerImg(t.showcase.layers.splash, size, ' data-layer="splash"'),
        layerImg(t.showcase.layers.top, size, ' data-layer="top"'),
        layerImg(t.showcase.layers.whole, size, ' data-layer="whole"'),
      ].join(''), size);
    },
    animate({ scene, shadow, ft, isLast }) {
      const q = (name) => scene.querySelector(`[data-layer="${name}"]`);
      const bottom = q('bottom'), splash = q('splash'), top = q('top'), whole = q('whole');
      // Measured so the closed lid and the bottom make exactly the whole coconut's outline.
      const closed = { xPercent: -4.0, yPercent: 30.1, rotation: -17.8, scale: 1.077 };
      const open = { xPercent: 0, yPercent: 0, rotation: 0, scale: 1 };

      gsap.set(whole, { transformOrigin: '50% 80%', autoAlpha: 0, yPercent: 8, scale: 0.9, rotation: -5 });
      gsap.set([bottom, top], { autoAlpha: 0 });
      gsap.set(top, { transformOrigin: '53% 36%', ...closed });
      gsap.set(splash, { transformOrigin: '48.7% 55.1%', autoAlpha: 0, scale: 0.3 }); // the shell's opening
      gsap.set(shadow, { autoAlpha: 0, scale: 0.8 });

      // Entrance: only the whole coconut, rising gently into place.
      ft(whole, { autoAlpha: 0 }, { autoAlpha: 1 }, ...FADE_IN, 'power1.out');
      ft(whole, { yPercent: 8, scale: 0.9, rotation: -5 }, { yPercent: 0, scale: 1, rotation: 0 }, 0, 0.2, 'power2.out');
      ft(shadow, { autoAlpha: 0, scale: 0.8 }, { autoAlpha: 1, scale: 1 }, 0, 0.2, 'power2.out');

      // The crack: the split pieces are fully opaque underneath before the
      // whole coconut fades, so nothing ever looks see-through.
      ft([bottom, top], { autoAlpha: 0 }, { autoAlpha: 1 }, 0.2, 0.21);
      ft(whole, { autoAlpha: 1 }, { autoAlpha: 0 }, 0.2, 0.26, 'power1.inOut');

      // The lid lifts open while the water splashes up from the opening.
      ft(top, closed, open, 0.22, 0.52, 'power2.out');
      ft(splash, { autoAlpha: 0, scale: 0.3 }, { autoAlpha: 1, scale: 1 }, 0.26, 0.5, 'power2.out');

      if (isLast) return;
      // Exit: the lid keeps lifting, the bottom sinks a little, the splash spreads, all fade.
      ft(top, { yPercent: 0, rotation: 0 }, { yPercent: -5, rotation: 5 }, 0.82, 1, 'power1.inOut');
      ft(bottom, { yPercent: 0 }, { yPercent: 3 }, 0.82, 1, 'power1.inOut');
      ft(splash, { scale: 1 }, { scale: 1.12 }, 0.82, 1, 'power1.inOut');
      ft([bottom, splash, top], { autoAlpha: 1 }, { autoAlpha: 0 }, ...FADE_OUT, 'power1.inOut');
      ft(shadow, { autoAlpha: 1 }, { autoAlpha: 0 }, ...FADE_OUT, 'power1.inOut');
    },
  },

  // DETOX: the cucumber and mint float gently while bubbles fizz around them,
  // on one canvas behind the image and one in front for depth.
  fizz: {
    html: (t) => objHTML(t, 'fizz', `
      <canvas class="fx fx--back" aria-hidden="true"></canvas>
      <div class="layer drift">${layerImg(t.image, t.imageSize)}</div>
      <canvas class="fx fx--front" aria-hidden="true"></canvas>`),
    animate(c) {
      const { obj, scene, ft, live, isDesktop } = c;
      const drift = scene.querySelector('.drift');
      fadeIn(c, { y: 60 });
      ft(drift, { rotation: -2, x: -6 }, { rotation: 2, x: 6 }, 0, 0.55, 'sine.inOut');
      ft(drift, { rotation: 2, x: 6 }, { rotation: -1, x: 0 }, 0.55, 1, 'sine.inOut');
      fadeOut(c, { x: -60 });
      live(createDetoxBubbles(obj, isDesktop));
    },
  },

  // NAD+: the real 3D structure (section 5) in clear glass, turning like a
  // turntable once across its segment (facing front at rest), with a very
  // slow extra idle turn. nad.webp shows until the first 3D frame is drawn;
  // without WebGL (or if loading fails) the image keeps the "spin" animation.
  molecule: {
    html: (t) => objHTML(t, 'molecule', `
      <div class="layer mol-fallback">${spinHTML(t)}</div>
      <div class="layer mol-3d" aria-hidden="true"></div>`),
    animate(c) {
      const { t, obj, scene, ft, live, start, L, label, isDesktop } = c;
      fadeIn(c, { scale: 0.9 });
      spinImage(c, scene.querySelector('.mol-fallback'));
      fadeOut(c, { scale: 0.85 });

      // One full turn across the segment: -2π × label → 2π × (1 − label).
      const turn = { y: -2 * Math.PI * label };
      ft(turn, { y: -2 * Math.PI * label }, { y: 2 * Math.PI * (1 - label) }, 0, 1);
      live({
        initFrom: start - 0.5 * L, // set up while the previous treatment is on screen
        init: () => ensureMolecule(obj, t, isDesktop).then((m) => m && m.render(turn.y)),
        frame: (time, dt) => { if (nadMolecule) nadMolecule.render(turn.y, dt); },
      });
    },
  },

  // The image version of the molecule: a full in-plane turn across the
  // segment (upright at rest), a very slow idle turn and a subtle 3D wobble.
  // Used by NAD+ as its fallback, and for any treatment with scene "spin".
  spin: {
    html: (t) => objHTML(t, 'spin', spinHTML(t)),
    animate(c) {
      fadeIn(c, { scale: 0.9 });
      spinImage(c, c.obj);
      fadeOut(c, { scale: 0.85 });
    },
  },

  // LONGEVITY: the stem grows upward behind a soft (feathered) mask edge, then
  // the bud emerges and the leaves unfurl. Origins are % of the 860 × 911 canvas.
  plant: {
    label: 0.74,
    html: (t) => objHTML(t, 'plant', [
      layerImg(t.showcase.layers.stem, t.imageSize, ' data-layer="stem"'),
      layerImg(t.showcase.layers.bud, t.imageSize, ' data-layer="bud"'),
      layerImg(t.showcase.layers.leafLeft, t.imageSize, ' data-layer="leaf-left"'),
      layerImg(t.showcase.layers.leafRight, t.imageSize, ' data-layer="leaf-right"'),
    ].join('')),
    animate(c) {
      const { scene, shadow, ft } = c;
      const q = (name) => scene.querySelector(`[data-layer="${name}"]`);
      const stem = q('stem'), bud = q('bud'), leafL = q('leaf-left'), leafR = q('leaf-right');

      // --reveal is how far up (from the bottom) the stem is fully visible; the
      // mask fades out over the next 5%. −2.3% hides it all (base at 97.3%
      // from the top); 58% shows everything above 42%.
      gsap.set(stem, { '--reveal': '-2.3%' });
      gsap.set(bud, { scale: 0, autoAlpha: 0, transformOrigin: '54.3% 49.0%' });
      gsap.set(leafL, { scale: 0, rotation: 35, transformOrigin: '48.7% 48.0%' });
      gsap.set(leafR, { scale: 0, rotation: -35, transformOrigin: '58.3% 47.6%' });
      gsap.set(shadow, { autoAlpha: 0, scaleX: 0.3 });

      // power1.out: the stem passes the stalk tops (~49% from the top) by 0.24,
      // before the bud and leaves begin.
      ft(stem, { '--reveal': '-2.3%' }, { '--reveal': '58%' }, 0, 0.32, 'power1.out');
      ft(shadow, { autoAlpha: 0, scaleX: 0.3 }, { autoAlpha: 1, scaleX: 1 }, 0, 0.4, 'power1.out');
      ft(bud, { scale: 0, autoAlpha: 0 }, { scale: 1, autoAlpha: 1 }, 0.24, 0.44, 'power2.out');
      ft(leafL, { scale: 0, rotation: 35 }, { scale: 1, rotation: 0 }, 0.3, 0.64, 'power2.out');
      ft(leafR, { scale: 0, rotation: -35 }, { scale: 1, rotation: 0 }, 0.37, 0.7, 'power2.out');
      fadeOut(c, { y: 24 });
    },
  },

  // HAIR & SCALP: a soft-edged wipe from bottom to top while easing out from
  // 1.1× scale; the hair then sways with the scroll (section 5).
  wipe: {
    html: (t) => objHTML(t, 'wipe', `
      <div class="wipe-frame"><div class="wipe-mask"><div class="layer wipe-content">
        <img class="wipe-img" src="${esc(t.image)}" alt="" width="${t.imageSize[0]}" height="${t.imageSize[1]}" decoding="async" draggable="false">
      </div></div></div>`),
    animate(c) {
      const { t, scene, shadow, ft, live, start, L, isDesktop } = c;
      const mask = scene.querySelector('.wipe-mask');
      const content = mask.querySelector('.wipe-content');

      // The mask layer is 1.25× the image height; its top edge is a soft fade.
      // Moving it up while counter-moving the content reveals it from the bottom.
      gsap.set(mask, { yPercent: 100 });
      gsap.set(content, { yPercent: -125, scale: 1.1 });
      gsap.set(shadow, { autoAlpha: 0 });
      ft(mask, { yPercent: 100 }, { yPercent: 0 }, 0, 0.3, 'power1.inOut');
      ft(content, { yPercent: -125 }, { yPercent: 0 }, 0, 0.3, 'power1.inOut');
      ft(content, { scale: 1.1 }, { scale: 1 }, 0, 0.4, 'power1.out');
      ft(shadow, { autoAlpha: 0 }, { autoAlpha: 1 }, 0.1, 0.3, 'power1.inOut');
      fadeOut(c, { y: -30 });

      if (!t.showcase.swayMask) return;
      // One and a half slow oscillations across the segment: 0 → +1 → −1 → +0.6 → 0.
      const sway = { v: 0 };
      const push = () => { if (hairSway) hairSway.setSway(sway.v); };
      [[0, 1, 0, 0.25], [1, -1, 0.25, 0.5], [-1, 0.6, 0.5, 0.75], [0.6, 0, 0.75, 1]].forEach(([from, to, f0, f1]) => {
        ft(sway, { v: from }, { v: to, onUpdate: push }, f0, f1, 'sine.inOut');
      });
      live({
        initFrom: start - 0.5 * L, // set up while the previous treatment is on screen
        init: () => ensureHairSway(content, t, isDesktop),
        frame: (time) => { if (hairSway) hairSway.render(time); },
      });
    },
  },

  // SKIN & BEAUTY: a clear water droplet falls onto the skin, squashes, and
  // settles into the resting droplet with ripples and a few tiny splashes.
  // Everything sits in one zooming layer inside the rounded frame, so it
  // stays aligned. The droplet touches the skin at 52.6% 59.5% of the photo.
  droplet: {
    html: (t) => {
      const ring = '<ellipse cx="52.6" cy="59.5" rx="11" ry="3.2" fill="none" stroke="rgba(255,255,255,0.85)" stroke-width="1.5" vector-effect="non-scaling-stroke"/>';
      const dots = Array.from({ length: 6 }, () => '<span class="splash-dot"></span>').join('');
      return objHTML(t, 'droplet', `
        <div class="layer frame"><div class="layer zoomer">
          ${layerImg(t.showcase.layers.base, t.imageSize, ' data-layer="base"')}
          <svg class="layer ripple" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
            <g transform="rotate(-16 52.6 59.5)">${ring}${ring}</g>
          </svg>
          ${layerImg(t.showcase.layers.drop, t.imageSize, ' data-layer="drop"')}
          <svg class="drop-fall" viewBox="0 0 70 105" aria-hidden="true">
            <defs>
              <radialGradient id="drop-fall-body" cx="50%" cy="66%" r="50%">
                <stop offset="0" stop-color="rgba(255,255,255,0.55)"/>
                <stop offset="1" stop-color="rgba(190,150,120,0.28)"/>
              </radialGradient>
            </defs>
            <path d="M35 2 C44 22 68 44 68 70 A33 33 0 0 1 2 70 C2 44 26 22 35 2 Z" fill="url(#drop-fall-body)" stroke="rgba(80,60,45,0.35)" stroke-width="1" vector-effect="non-scaling-stroke"/>
            <ellipse cx="22" cy="58" rx="5" ry="8.5" transform="rotate(25 22 58)" fill="rgba(255,255,255,0.85)"/>
          </svg>
          <div class="layer splash-dots" aria-hidden="true">${dots}</div>
        </div></div>`);
    },
    animate(c) {
      const { scene, ft } = c;
      const frame = scene.querySelector('.frame');
      const zoomer = scene.querySelector('.zoomer');
      const drop = scene.querySelector('[data-layer="drop"]');
      const fall = scene.querySelector('.drop-fall');
      const ripple = scene.querySelector('.ripple');
      const [ring1, ring2] = ripple.querySelectorAll('ellipse');
      const splash = scene.querySelector('.splash-dots');
      const dots = [...splash.children];
      const CONTACT = '52.6% 59.5%';

      fadeIn(c, { scale: 0.94 });
      gsap.set(zoomer, { transformOrigin: CONTACT });
      ft(zoomer, { scale: 1.08 }, { scale: 1 }, 0, 0.7, 'power1.out');

      // The fall: from above the frame, accelerating and stretching slightly.
      gsap.set(fall, { transformOrigin: '50% 100%', yPercent: -560 });
      ft(fall, { yPercent: -560 }, { yPercent: 0 }, 0.1, 0.32, 'power2.in');
      ft(fall, { scaleY: 1 }, { scaleY: 1.12 }, 0.1, 0.32, 'power1.in');
      // Impact: it squashes flat and disappears into the resting droplet.
      ft(fall, { scaleX: 1, scaleY: 1.12, autoAlpha: 1 }, { scaleX: 1.8, scaleY: 0.3, autoAlpha: 0 }, 0.32, 0.35, 'power1.out');

      // The resting droplet appears quickly and settles with a small wobble.
      gsap.set(drop, { transformOrigin: CONTACT, autoAlpha: 0, scale: 0.35 });
      ft(drop, { autoAlpha: 0 }, { autoAlpha: 1 }, 0.32, 0.35);
      ft(drop, { scale: 0.35 }, { scale: 1 }, 0.32, 0.46, 'back.out(1.7)');

      // Ripples spread along the skin. Their layer only shows from the impact on,
      // so scrolling back never reveals a ring at its starting size.
      gsap.set(ripple, { autoAlpha: 0 });
      ft(ripple, { autoAlpha: 0 }, { autoAlpha: 1 }, 0.318, 0.32);
      gsap.set([ring1, ring2], { transformOrigin: '50% 50%', scale: 0.3, opacity: 0 });
      ft(ring1, { scale: 0.3, opacity: 0.9 }, { scale: 1.8, opacity: 0 }, 0.32, 0.56, 'power2.out');
      ft(ring2, { scale: 0.3, opacity: 0.9 }, { scale: 1.8, opacity: 0 }, 0.36, 0.62, 'power2.out');

      // Splash dots fly out in low arcs along the skin (which rises 16° to the
      // right), left and right, then fade.
      gsap.set(splash, { autoAlpha: 0 });
      ft(splash, { autoAlpha: 0 }, { autoAlpha: 1 }, 0.318, 0.32);
      const slope = Math.tan((16 * Math.PI) / 180);
      const spread = [-0.058, -0.036, -0.021, 0.024, 0.041, 0.06]; // share of the frame's width
      dots.forEach((dot, i) => {
        const dx = spread[i];
        const lift = 0.012 + 0.012 * ((i * 7) % 3) / 2; // peak height, 1.2–2.4% of the frame
        const x = () => dx * frame.offsetWidth;
        const yLand = () => -dx * slope * frame.offsetHeight;
        const yPeak = () => (-dx * slope * 0.5 - lift) * frame.offsetHeight;
        gsap.set(dot, { x: 0, y: 0, autoAlpha: 1 });
        ft(dot, { x: 0 }, { x }, 0.32, 0.44, 'power1.out');
        ft(dot, { y: 0 }, { y: yPeak }, 0.32, 0.37, 'power2.out');
        ft(dot, { y: yPeak }, { y: yLand }, 0.37, 0.44, 'power2.in');
        ft(dot, { autoAlpha: 1 }, { autoAlpha: 0 }, 0.39, 0.44, 'power1.in');
      });

      fadeOut(c, { x: -60 });
    },
  },

  // RECOVERY: bubbles fizz inside the glass, clipped to the water. The glass
  // itself only moves on its entrance and exit.
  glass: {
    html: (t) => objHTML(t, 'glass', `${layerImg(t.image, t.imageSize)}<canvas class="fx fx--water" aria-hidden="true"></canvas>`),
    animate(c) {
      const { obj, live, isDesktop } = c;
      fadeIn(c, { y: 40 });
      fadeOut(c, { y: -30 });
      live(createGlassBubbles(obj, isDesktop));
    },
  },

  // MUSCLE RECOVERY: a 30-frame deadlift drawn on a canvas, crossfading
  // between neighbouring frames. Frame 01 holds before, frame 30 after.
  frames: {
    label: 0.74,
    html: (t) => objHTML(t, 'frames', `<canvas class="layer fx--frames" aria-hidden="true"></canvas>`, t.showcase.frames.size),
    preload: (t, scene, isDesktop) => {
      const { path, count } = t.showcase.frames;
      const srcs = Array.from({ length: count }, (_, i) => path.replace('{n}', pad(i + 1)));
      return Promise.all(srcs.map(loadImage)).then((images) => {
        const seq = createFrameSequence(scene.querySelector('.fx--frames'), images, isDesktop);
        scene.frameSequence = seq;
        return seq;
      });
    },
    animate(c) {
      const { scene, tl, start, L, live } = c;
      fadeIn(c, { x: 40 });
      const proxy = { p: 0 };
      const FROM = 0.12, TO = 0.7;
      tl.fromTo(proxy, { p: 0 }, {
        p: 1, duration: L, ease: 'none', immediateRender: false,
        onUpdate: () => {
          const seq = scene.frameSequence;
          if (seq) seq.setPosition(gsap.utils.clamp(0, 1, (proxy.p - FROM) / (TO - FROM)) * (seq.count - 1));
        },
      }, start);
      live({ frame: () => scene.frameSequence && scene.frameSequence.draw() });
    },
  },

  // Fallback for new treatments without a dedicated scene.
  fade: {
    html: (t) => objHTML(t, 'fade', t.image ? layerImg(t.image, t.imageSize) : placeholderHTML(t, ' placeholder--stage'), t.image ? t.imageSize : [1, 1]),
    animate(c) {
      fadeIn(c, { y: 40 });
      fadeOut(c, { y: -30 });
    },
  },
};

/* ==========================================================================
   5. Live effects. Each is { start?, stop?, frame?(time, dt), init? } and
   only runs while its treatment (including the handovers) is on screen,
   at most 60 times a second.
   ========================================================================== */

const loadImage = (src) => new Promise((resolve, reject) => {
  const img = new Image();
  img.onload = () => img.decode().then(() => resolve(img), () => resolve(img));
  img.onerror = () => reject(new Error(`Could not load ${src}`));
  img.src = src;
});

// Size a canvas's drawing buffer to its CSS box (device pixels, capped).
function fitCanvas(canvas, ctx, cap) {
  const w = canvas.clientWidth, h = canvas.clientHeight;
  const ratio = Math.min(window.devicePixelRatio || 1, cap);
  canvas.width = Math.max(1, Math.round(w * ratio));
  canvas.height = Math.max(1, Math.round(h * ratio));
  ctx.setTransform(canvas.width / Math.max(1, w), 0, 0, canvas.height / Math.max(1, h), 0, 0);
  return { w, h };
}

// 0 (still) to 1 (scrolling briskly), from Lenis's current velocity.
const scrollBoost = () => Math.min(1, Math.abs(lenis ? lenis.velocity : 0) / 30);
const rand = (a, b) => a + Math.random() * (b - a);
const smooth = (e0, e1, x) => { const t = gsap.utils.clamp(0, 1, (x - e0) / (e1 - e0)); return t * t * (3 - 2 * t); };

// A small clear bubble: transparent centre, soft white rim, a faint darker
// outline so it reads on cream, and a small highlight (like the photo's droplets).
function bubbleSprite() {
  const size = 64, r = size / 2;
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const g = c.getContext('2d');
  const body = g.createRadialGradient(r, r, 0, r, r, r);
  body.addColorStop(0, 'rgba(255,255,255,0.05)');
  body.addColorStop(0.62, 'rgba(255,255,255,0.1)');
  body.addColorStop(0.85, 'rgba(255,255,255,0.6)');
  body.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = body;
  g.beginPath(); g.arc(r, r, r, 0, Math.PI * 2); g.fill();
  g.strokeStyle = 'rgba(70, 90, 80, 0.22)';
  g.lineWidth = 2;
  g.beginPath(); g.arc(r, r, r * 0.9, 0, Math.PI * 2); g.stroke();
  g.fillStyle = 'rgba(255,255,255,0.9)';
  g.beginPath(); g.arc(r * 0.64, r * 0.6, r * 0.17, 0, Math.PI * 2); g.fill();
  return c;
}

// DETOX: 50–80 bubbles (about half on small screens) rise from the lower part
// of the image and around the slices, wobbling, then fade near the top.
function createDetoxBubbles(obj, isDesktop) {
  const back = obj.querySelector('.fx--back');
  const front = obj.querySelector('.fx--front');
  const bctx = back.getContext('2d');
  const fctx = front.getContext('2d');
  const cap = isDesktop ? 2 : 1.5;
  const max = isDesktop ? 72 : 36;
  const rate = isDesktop ? 15 : 8; // bubbles per second when still
  let sprite = null, w = 0, h = 0, parts = [], carry = 0, observer = null;

  const resize = () => { ({ w, h } = fitCanvas(back, bctx, cap)); fitCanvas(front, fctx, cap); };
  const spawn = () => {
    const x = rand(0.24, 0.78) * w;
    return {
      x0: x, x, y: rand(0.55, 0.9) * h,
      r: rand(1, 5),                       // 2–10px across
      vy: rand(0.07, 0.15) * h,            // px per second
      amp: rand(1.5, 5), freq: rand(1.5, 3.5), phase: rand(0, Math.PI * 2),
      age: 0, front: Math.random() < 0.55,
    };
  };

  return {
    start() {
      sprite = sprite || bubbleSprite();
      if (!observer) { observer = new ResizeObserver(resize); observer.observe(back); }
      resize();
    },
    stop() {
      parts = []; carry = 0;
      bctx.clearRect(0, 0, w, h); fctx.clearRect(0, 0, w, h);
    },
    frame(time, dt) {
      const boost = scrollBoost();
      carry += rate * (1 + 3 * boost) * dt;
      while (carry >= 1) { carry -= 1; if (parts.length < max) parts.push(spawn()); }
      const speed = 1 + 1.5 * boost;
      bctx.clearRect(0, 0, w, h); fctx.clearRect(0, 0, w, h);
      parts = parts.filter((p) => {
        p.age += dt;
        p.y -= p.vy * speed * dt;
        p.x = p.x0 + Math.sin(p.age * p.freq + p.phase) * p.amp;
        const alpha = Math.min(1, p.age / 0.35) * smooth(0.06 * h, 0.3 * h, p.y);
        if (p.y < 0.04 * h) return false;
        const ctx = p.front ? fctx : bctx;
        ctx.globalAlpha = alpha * (p.front ? 0.95 : 0.65);
        ctx.drawImage(sprite, p.x - p.r, p.y - p.r, p.r * 2, p.r * 2);
        return true;
      });
      bctx.globalAlpha = fctx.globalAlpha = 1;
    },
  };
}

// RECOVERY: 40–80 tiny bubbles (half on small screens) rise inside the water,
// mostly in a central stream, accelerate a little, and pop with a sparkle at
// the surface. The canvas is clipped to the water with CSS.
function createGlassBubbles(obj, isDesktop) {
  const canvas = obj.querySelector('.fx--water');
  const ctx = canvas.getContext('2d');
  const cap = isDesktop ? 2 : 1.5;
  const max = isDesktop ? 80 : 40;
  const rate = isDesktop ? 20 : 10;
  const SURFACE = 0.16, BASE = 0.85;
  let w = 0, h = 0, parts = [], sparks = [], carry = 0, observer = null;

  const resize = () => { ({ w, h } = fitCanvas(canvas, ctx, cap)); };
  const spawn = () => {
    const stream = Math.random() < 0.72;
    return {
      x0: (stream ? rand(0.38, 0.62) : rand(0.2, 0.8)) * w,
      y: (BASE - rand(0, 0.02)) * h,
      r: rand(0.5, 2),                    // 1–4px across
      vy: rand(0.04, 0.07) * h, accel: rand(0.04, 0.07) * h,
      amp: rand(0.3, 1.2), freq: rand(3, 6), phase: rand(0, Math.PI * 2), age: 0,
    };
  };

  return {
    start() {
      if (!observer) { observer = new ResizeObserver(resize); observer.observe(canvas); }
      resize();
    },
    stop() { parts = []; sparks = []; carry = 0; ctx.clearRect(0, 0, w, h); },
    frame(time, dt) {
      const boost = scrollBoost();
      carry += rate * (1 + 3 * boost) * dt;
      while (carry >= 1) { carry -= 1; if (parts.length < max) parts.push(spawn()); }
      const speed = 1 + 1.2 * boost;
      ctx.clearRect(0, 0, w, h);
      ctx.lineWidth = 0.7;
      parts = parts.filter((p) => {
        p.age += dt;
        p.vy += p.accel * dt;
        p.y -= p.vy * speed * dt;
        const x = p.x0 + Math.sin(p.age * p.freq + p.phase) * p.amp;
        if (p.y - p.r <= SURFACE * h) { sparks.push({ x, y: SURFACE * h + 1, age: 0 }); return false; }
        ctx.globalAlpha = Math.min(1, p.age / 0.25);
        ctx.beginPath();
        ctx.arc(x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255,255,255,0.18)';
        ctx.fill();
        ctx.strokeStyle = 'rgba(255,255,255,0.9)';
        ctx.stroke();
        ctx.strokeStyle = 'rgba(90,110,120,0.25)';
        ctx.beginPath(); ctx.arc(x, p.y, p.r + 0.6, 0, Math.PI * 2); ctx.stroke();
        return true;
      });
      // Tiny sparkles where bubbles pop.
      sparks = sparks.filter((s) => {
        s.age += dt;
        const life = s.age / 0.3;
        if (life >= 1) return false;
        const len = 1.5 + 3 * life;
        ctx.globalAlpha = 1 - life;
        ctx.strokeStyle = 'rgba(255,255,255,0.95)';
        ctx.beginPath();
        ctx.moveTo(s.x - len, s.y); ctx.lineTo(s.x + len, s.y);
        ctx.moveTo(s.x, s.y - len); ctx.lineTo(s.x, s.y + len);
        ctx.stroke();
        return true;
      });
      ctx.globalAlpha = 1;
    },
  };
}

// MUSCLE RECOVERY: draw frame floor(p), then frame ceil(p) on top with the
// fractional part as opacity. Every frame is drawn at the same position and
// size (the feet are pre-aligned). Only redraws when the position changes.
function createFrameSequence(canvas, images, isDesktop) {
  const ctx = canvas.getContext('2d');
  const cap = isDesktop ? 2 : 1.5;
  let w = 0, h = 0, position = 0, drawn = -1;
  const resize = () => {
    ({ w, h } = fitCanvas(canvas, ctx, cap));
    // Resizing resets the context, so ask again for the sharpest scaling.
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    drawn = -1;
    draw();
  };
  const draw = () => {
    if (drawn === position || !w) return;
    const i0 = Math.floor(position), i1 = Math.min(images.length - 1, Math.ceil(position));
    const f = position - i0;
    ctx.clearRect(0, 0, w, h);
    ctx.globalAlpha = 1;
    ctx.drawImage(images[i0], 0, 0, w, h);
    if (i1 !== i0 && f > 0.001) {
      ctx.globalAlpha = f;
      ctx.drawImage(images[i1], 0, 0, w, h);
      ctx.globalAlpha = 1;
    }
    drawn = position;
  };
  new ResizeObserver(resize).observe(canvas);
  resize();
  return {
    count: images.length,
    setPosition(p) { position = Math.round(p * 1000) / 1000; },
    draw,
  };
}

/* ---------- Hair & Scalp: the hair sways with the scroll ----------
   hair.webp is drawn on a Three.js plane with a small shader that shifts the
   texture lookup sideways. The shift grows from the top of the head (still)
   to the ends of the hair (most movement) and is multiplied by
   hair-mask.webp, so the face, ear and background never move. */

const HAIR_SWAY = {
  amplitude: 0.02,   // main sway at the ends, as a share of image width; with the
                     // secondary wave the ends move at most about 2.5%
  idle: 0.1,         // idle sway strength, relative to a full scroll swing
  idlePeriod: 6,     // seconds per idle cycle
};

let hairSway = null;        // the running shader, or null (then the plain image is used)
let hairSwayPromise = null;

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
        //    pulls skin in, so the face and ear stay perfectly still.
        // (Near-black mask values and near-opaque pixels count as fully still.)
        vec2 from = vec2(vUv.x - offset, vUv.y);
        float maskHere = smoothstep(0.02, 1.0, texture2D(uMask, vUv).r);
        float maskFrom = smoothstep(0.02, 1.0, texture2D(uMask, from).r);
        float clearHere = 1.0 - smoothstep(0.02, 0.6, texture2D(uMap, vUv).a);
        float clearFrom = 1.0 - smoothstep(0.02, 0.6, texture2D(uMap, from).a);
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
    mask.image = scaled(maskImg, pw, ph);
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

function ensureHairSway(content, t, isDesktop) {
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

/* ---------- NAD+: a clear glass molecule on a turntable ----------
   The real 3D structure, read from a V2000 SDF file, drawn with Three.js as
   glass spheres (atoms) and rods (bonds). Three instanced meshes keep it to
   three draw calls, so it stays light on phones. The canvas is transparent
   and fills the object's box, which keeps nad.webp's proportions. */

const MOLECULE = {
  heavyRadius: 0.38,
  hydrogenRadius: 0.22,
  bondRadius: 0.09,
  tilt: 0.3,          // fixed forward tilt (radians), so the turn reads as 3D
  idleSpeed: 0.03,    // extra idle turn while the page is still (radians per second)
  opacity: 0.4,
  hydrogenOpacity: 0.26,
  tints: { O: 0xEEF4FF, N: 0xF4F0FF, P: 0xFFF5E6 }, // hints only: it reads as clear glass
};

// A tiny V2000 reader: the counts line gives the number of atoms and bonds,
// then one line per atom (x, y, z, element) and per bond (two atom numbers).
function parseSDF(text) {
  const lines = text.split(/\r?\n/);
  const counts = lines[3] || '';
  if (!counts.includes('V2000')) throw new Error('Not a V2000 molfile');
  const atomCount = parseInt(counts.slice(0, 3), 10);
  const bondCount = parseInt(counts.slice(3, 6), 10);
  const atoms = lines.slice(4, 4 + atomCount).map((l) => ({
    x: parseFloat(l.slice(0, 10)),
    y: parseFloat(l.slice(10, 20)),
    z: parseFloat(l.slice(20, 30)),
    el: l.slice(31, 34).trim(),
  }));
  const bonds = lines.slice(4 + atomCount, 4 + atomCount + bondCount).map((l) => [
    parseInt(l.slice(0, 3), 10) - 1,
    parseInt(l.slice(3, 6), 10) - 1,
  ]);
  if (!atoms.length || atoms.some((a) => !Number.isFinite(a.x + a.y + a.z))) throw new Error('Bad atom block');
  return { atoms, bonds };
}

// Centre the molecule on its centroid and turn it so its longest axis lies
// across the screen and its flattest axis points at the viewer (the widest
// view, like nad.webp, faces front at rest). Principal axes by power iteration.
function orientMolecule(THREE, atoms) {
  const n = atoms.length;
  const c = atoms.reduce((s, a) => s.add(new THREE.Vector3(a.x, a.y, a.z)), new THREE.Vector3()).divideScalar(n);
  const pts = atoms.map((a) => new THREE.Vector3(a.x, a.y, a.z).sub(c));
  const cov = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];
  pts.forEach((p) => {
    const v = [p.x, p.y, p.z];
    for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) cov[i][j] += v[i] * v[j];
  });
  const mul = (m, v) => new THREE.Vector3(
    m[0][0] * v.x + m[0][1] * v.y + m[0][2] * v.z,
    m[1][0] * v.x + m[1][1] * v.y + m[1][2] * v.z,
    m[2][0] * v.x + m[2][1] * v.y + m[2][2] * v.z);
  const principal = (m, start) => {
    let v = start.clone().normalize();
    for (let k = 0; k < 64; k++) v = mul(m, v).normalize();
    return v;
  };
  const e1 = principal(cov, new THREE.Vector3(1, 0.3, 0.1));
  const l1 = mul(cov, e1).dot(e1);
  const deflated = cov.map((row, i) => row.map((x, j) => x - l1 * e1.getComponent(i) * e1.getComponent(j)));
  let e2 = principal(deflated, new THREE.Vector3(0.1, 1, 0.3));
  e2.sub(e1.clone().multiplyScalar(e2.dot(e1))).normalize();
  const e3 = new THREE.Vector3().crossVectors(e1, e2);
  const basis = new THREE.Matrix4().makeBasis(e1, e2, e3).transpose(); // world → (e1, e2, e3)
  return pts.map((p) => p.applyMatrix4(basis));
}

let nadMolecule = null;        // the running 3D molecule, or null (then the image is used)
let nadMoleculePromise = null;

async function createMolecule(obj, src, pixelRatioCap) {
  const probe = document.createElement('canvas');
  if (!(probe.getContext('webgl2') || probe.getContext('webgl'))) return null;

  // 3D structure: PubChem CID 5892 (NCBI)
  const [THREE, { RoomEnvironment }, text] = await Promise.all([
    import('three'),
    import('three/addons/environments/RoomEnvironment.js'),
    fetch(src).then((r) => { if (!r.ok) throw new Error(`Could not load ${src}`); return r.text(); }),
  ]);
  const { atoms, bonds } = parseSDF(text);
  const pts = orientMolecule(THREE, atoms);
  const host = obj.querySelector('.mol-3d');

  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, premultipliedAlpha: true });
  renderer.setClearColor(0x000000, 0);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, pixelRatioCap));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.NeutralToneMapping;
  const canvas = renderer.domElement;
  canvas.className = 'mol-canvas';

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  pmrem.dispose();
  const light = new THREE.DirectionalLight(0xffffff, 1.6);
  light.position.set(-3, 5, 6);
  scene.add(light);

  // Clear glass: no transmission (over a transparent canvas it renders dark and
  // muddy). Instead a soft fresnel rim gives each sphere and rod a cool,
  // denser edge, which is how clear glass reads against a light background;
  // the reflections supply the bright highlights.
  const glass = (opacity) => {
    const material = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      metalness: 0,
      roughness: 0.06,
      clearcoat: 1,
      clearcoatRoughness: 0.05,
      ior: 1.5,
      envMapIntensity: 1.3,
      transparent: true,
      opacity,
      depthWrite: false,
    });
    material.onBeforeCompile = (shader) => {
      shader.fragmentShader = shader.fragmentShader.replace('#include <opaque_fragment>', `
        float rim = pow(1.0 - abs(dot(normalize(vViewPosition), normal)), 1.6);
        outgoingLight = mix(outgoingLight, vec3(0.33, 0.43, 0.58), 0.8 * rim);
        diffuseColor.a = min(1.0, diffuseColor.a + 0.55 * rim);
        #include <opaque_fragment>`);
    };
    return material;
  };

  const heavy = [], hydrogens = [];
  atoms.forEach((a, i) => (a.el === 'H' ? hydrogens : heavy).push(i));
  const sphere = new THREE.SphereGeometry(1, 32, 20);
  const rod = new THREE.CylinderGeometry(1, 1, 1, 16, 1, true);
  const heavyMesh = new THREE.InstancedMesh(sphere, glass(MOLECULE.opacity), heavy.length);
  const hydrogenMesh = new THREE.InstancedMesh(sphere, glass(MOLECULE.hydrogenOpacity), hydrogens.length);
  const bondMesh = new THREE.InstancedMesh(rod, glass(MOLECULE.opacity), bonds.length);

  const m = new THREE.Matrix4(), q = new THREE.Quaternion(), s = new THREE.Vector3();
  const colour = new THREE.Color();
  const up = new THREE.Vector3(0, 1, 0);
  const placeAtoms = (mesh, indices, radius) => indices.forEach((atomIndex, k) => {
    mesh.setMatrixAt(k, m.compose(pts[atomIndex], q.identity(), s.setScalar(radius)));
    mesh.setColorAt(k, colour.set(MOLECULE.tints[atoms[atomIndex].el] ?? 0xffffff));
  });
  placeAtoms(heavyMesh, heavy, MOLECULE.heavyRadius);
  placeAtoms(hydrogenMesh, hydrogens, MOLECULE.hydrogenRadius);
  bonds.forEach(([a, b], k) => {
    const dir = pts[b].clone().sub(pts[a]);
    const mid = pts[a].clone().add(pts[b]).multiplyScalar(0.5);
    q.setFromUnitVectors(up, dir.clone().normalize());
    bondMesh.setMatrixAt(k, m.compose(mid, q, s.set(MOLECULE.bondRadius, dir.length(), MOLECULE.bondRadius)));
  });

  // The rods draw first, then the atoms over them; the tilt is fixed and the
  // turntable turns inside it, around the molecule's own vertical axis.
  bondMesh.renderOrder = 0;
  heavyMesh.renderOrder = 1;
  hydrogenMesh.renderOrder = 2;
  const spinner = new THREE.Group();
  spinner.add(bondMesh, heavyMesh, hydrogenMesh);
  const tilt = new THREE.Group();
  tilt.rotation.x = MOLECULE.tilt;
  tilt.add(spinner);
  scene.add(tilt);

  // Frame it so the whole molecule fits, with a little margin, at every angle
  // of the turn: every atom is projected at 72 angles and the camera distance
  // is found by bisection.
  const radius = (i) => (atoms[i].el === 'H' ? MOLECULE.hydrogenRadius : MOLECULE.heavyRadius);
  const turned = [];
  for (let k = 0; k < 72; k++) {
    tilt.rotation.x = MOLECULE.tilt;
    spinner.rotation.y = (k / 72) * Math.PI * 2;
    tilt.updateMatrixWorld(true);
    pts.forEach((p, i) => turned.push([p.clone().applyMatrix4(spinner.matrixWorld), radius(i)]));
  }
  spinner.rotation.y = 0;
  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 1000);
  const fit = () => {
    const tanV = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    const limit = 0.94; // share of the half-width/height the molecule may reach
    const fits = (d) => turned.every(([v, r]) => {
      const depth = d - v.z - r;
      return depth > 0
        && (Math.abs(v.x) + r) / (depth * tanV * camera.aspect) <= limit
        && (Math.abs(v.y) + r) / (depth * tanV) <= limit;
    });
    let lo = 0, hi = 500;
    for (let k = 0; k < 40; k++) { const mid = (lo + hi) / 2; if (fits(mid)) hi = mid; else lo = mid; }
    camera.position.set(0, 0, hi);
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();
  };

  const resize = () => {
    const w = host.clientWidth, h = host.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    fit();
  };
  new ResizeObserver(resize).observe(host);
  resize();

  let idleAngle = 0;
  const molecule = {
    setPixelRatioCap(cap) {
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, cap));
      resize();
    },
    render(angle, dt = 0) {
      idleAngle += MOLECULE.idleSpeed * dt * (1 - scrollBoost());
      spinner.rotation.y = angle + idleAngle;
      renderer.render(scene, camera);
    },
  };

  // Draw the first frame, then crossfade from the image to the canvas.
  host.appendChild(canvas);
  molecule.render(0);
  obj.classList.add('is-3d');
  return molecule;
}

function ensureMolecule(obj, t, isDesktop) {
  const cap = isDesktop ? 2 : 1.5;
  if (!nadMoleculePromise) {
    nadMoleculePromise = createMolecule(obj, t.showcase.model, cap)
      .catch(() => null)
      .then((molecule) => { nadMolecule = molecule; return molecule; });
  } else if (nadMolecule) {
    nadMolecule.setPixelRatioCap(cap);
  }
  return nadMoleculePromise;
}

/* ---------- Running the live effects ---------- */

let lives = [];

function updateLives(time) {
  for (const l of lives) {
    if (l.init && !l.inited && time >= l.initFrom && time <= l.to) {
      l.inited = true;
      l.init();
    }
    const visible = time >= l.from && time <= l.to;
    if (visible === l.visible) continue;
    l.visible = visible;
    l.last = 0;
    if (visible) l.start?.();
    else l.stop?.();
  }
}

// Driven by gsap.ticker; each effect is capped at 60fps.
function tickLives(time) {
  for (const l of lives) {
    if (!l.visible || !l.frame) continue;
    if (l.last && time - l.last < 1 / 60 - 0.002) continue;
    const dt = l.last ? Math.min(0.1, time - l.last) : 1 / 60;
    l.last = time;
    l.frame(time, dt);
  }
}

/* ==========================================================================
   6. Motion
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
  glideTo(y, gsap.utils.clamp(0.9, 2, 0.8 + distance * 0.2));
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

function buildStage(root, isDesktop) {
  const L = STAGE.segment;
  const n = FEATURED.length;
  const scenes = FEATURED.map((t) => root.querySelector(`.scene[data-scene="${t.id}"]`));
  const copies = FEATURED.map((t) => root.querySelector(`.stage__copy[data-copy="${t.id}"]`));
  const steps = [...root.querySelectorAll('.stage__step')];
  const names = [...root.querySelectorAll('.stage__name')];
  const bg = root.querySelector('.stage__bg');
  const defs = FEATURED.map((t) => SCENES[t.showcase.scene] || SCENES.fade);

  // Segment starts and rest labels. The next segment begins where this one's exit starts.
  const starts = FEATURED.map((_, i) => i * STAGE.exitStart * L);
  const labelAt = defs.map((d) => d.label ?? STAGE.label);
  const labels = starts.map((s, i) => s + labelAt[i] * L);
  const end = starts[n - 1] + L;

  // The active treatment changes in the middle of each text handover.
  const textMid = ((STAGE.textOut[0] + STAGE.textOut[1]) / 2 + STAGE.exitStart + (STAGE.textIn[0] + STAGE.textIn[1]) / 2) / 2;
  const switches = starts.map((s, i) => (i === 0 ? -Infinity : starts[i - 1] + textMid * L));

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

  lives = [];
  const preloads = [];
  const onUpdate = () => {
    const time = tl.time();
    let index = 0;
    switches.forEach((at, i) => { if (time >= at) index = i; });
    setActive(index);
    updateLives(time);
  };

  const tl = gsap.timeline({ paused: true, defaults: { ease: 'none' }, onUpdate });

  // Visuals
  FEATURED.forEach((t, i) => {
    const start = starts[i];
    const scene = scenes[i];
    const isFirst = i === 0;
    const isLast = i === n - 1;
    const from = start, to = isLast ? end + 1 : start + L;
    const ft = (target, a, b, f0, f1, ease = 'none') =>
      tl.fromTo(target, a, { ...b, duration: (f1 - f0) * L, ease, immediateRender: false }, start + f0 * L);
    const live = (effect) => lives.push({ from, to, initFrom: from, visible: false, inited: false, last: 0, ...effect });
    const idle = (target, vars) => {
      const tween = gsap.to(target, { repeat: -1, yoyo: true, ease: 'sine.inOut', ...vars, paused: true });
      live({ start: () => tween.play(), stop: () => tween.pause() });
    };

    if (!isFirst) {
      gsap.set(scene, { autoAlpha: 0 });
      tl.set(scene, { autoAlpha: 1 }, start);
    }
    if (!isLast) tl.set(scene, { autoAlpha: 0 }, start + L);

    const obj = scene.querySelector('.obj');
    const shadow = scene.querySelector('.obj__shadow');
    defs[i].animate({ t, tl, scene, obj, shadow, ft, idle, live, start, L, label: labelAt[i], isFirst, isLast, isDesktop });
    if (defs[i].preload) preloads.push(defs[i].preload(t, scene, isDesktop).catch(() => null));
    tl.addLabel(t.id, labels[i]);
  });

  // Text: in during each entrance, fully visible through the rest, out at the exit.
  gsap.set(copies, { autoAlpha: 0, y: 30 });
  const [in0, in1] = STAGE.textIn;
  const [out0, out1] = STAGE.textOut;
  copies.forEach((copy, i) => {
    tl.fromTo(copy, { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, duration: (in1 - in0) * L, ease: 'power2.out', immediateRender: false }, starts[i] + in0 * L);
    if (i < n - 1) {
      tl.fromTo(copy, { autoAlpha: 1, y: 0 }, { autoAlpha: 0, y: -30, duration: (out1 - out0) * L, ease: 'power1.inOut', immediateRender: false }, starts[i] + out0 * L);
    }
  });

  // Background: a gentle cross-fade between tints during each handover,
  // then to Porcelain so the stage releases seamlessly into the grid.
  const tints = FEATURED.map((t) => t.showcase.tint || '#F7F4EF');
  gsap.set(bg, { backgroundColor: tints[0] });
  for (let i = 0; i < n - 1; i++) {
    tl.fromTo(bg, { backgroundColor: tints[i] }, { backgroundColor: tints[i + 1], duration: (1 - STAGE.exitStart) * L, ease: 'power1.inOut', immediateRender: false }, starts[i + 1]);
  }
  const lastFade = 0.14 * L;
  tl.fromTo(bg, { backgroundColor: tints[n - 1] }, { backgroundColor: STAGE.finalTint, duration: lastFade, ease: 'power1.inOut', immediateRender: false }, end - lastFade);

  tl.set({}, {}, end); // the timeline runs to the very end of the pin
  setActive(0);
  updateLives(0);
  return { tl, labels, end, preloads };
}

async function preloadStage(root) {
  const images = [...root.querySelectorAll('.stage img')];
  await Promise.all(images.map((img) => img.decode().catch(() => {})));
}

function initStage(context, isDesktop) {
  const root = document.getElementById('stage');
  if (!root) return () => {};

  document.documentElement.classList.add('has-stage');
  const { tl, preloads } = buildStage(root, isDesktop);
  gsap.ticker.add(tickLives);

  let alive = true;
  (async () => {
    // Every image and frame is decoded, Three.js is fetched and the fonts are
    // in before the ScrollTrigger exists, so nothing loads mid-scroll.
    const fonts = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
    const three = FEATURED.some((t) => t.showcase.swayMask || t.showcase.model) ? import('three').catch(() => null) : null;
    const room = FEATURED.some((t) => t.showcase.model) ? import('three/addons/environments/RoomEnvironment.js').catch(() => null) : null;
    await Promise.all([preloadStage(root), fonts, three, room, ...preloads]);
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
    lives.forEach((l) => { if (l.visible) l.stop?.(); l.visible = false; });
    lives = [];
    gsap.ticker.remove(tickLives);
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
