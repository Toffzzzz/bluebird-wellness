/* ==========================================================================
   Bluebird Wellness: page script

   1. TREATMENT VISUALS   ← the stage order, images, scenes and tints
   2. STAGE TIMING        ← fine-tune the scroll film here
   3. Rendering (the stage, the "All treatments" cards, the standalone section)
   4. Scenes (one per kind of featured visual)
   5. Live effects: shower water, frame sequences, hair sway (Three.js
      shader) and the NAD+ glass molecule (Three.js)
   6. Motion (Lenis smooth scroll + GSAP ScrollTrigger)
   ========================================================================== */

/* ==========================================================================
   1. TREATMENT VISUALS

   Names, prices and every word of treatment copy come from the clinic's
   menu, data/drips.json, through data/menu.js (window.MENU). That file is
   written by scripts/build-menu.mjs, which also builds a page per drip
   (treatments/<slug>/) and holds the booking link (window.BOOK_URL). Edit
   the menu there and run the script; nothing here repeats it.

   TREATMENTS only holds the pinned stage's visuals, scenes and tints, and
   the menuSlug that links each one to its drip in the menu. Its order is the
   order of the stage, its side list and the reduced-motion list. The
   generator reads the image, alt, tint and badge of each entry for the
   treatment pages and the "All treatments" cards, so run it after changing
   them.
   Fields:
     id           Unique, lowercase, no spaces. Also the stage's page anchor
                  (e.g. #iron).
     menuSlug     The drip's slug in data/drips.json: its name and price are
                  shown here, and "Learn more" opens treatments/<slug>/.
     standalone   Instead of a menuSlug, for an item in the menu's
                  standalone section: { row, entry }. The name and price come
                  from that row of its price table; "Learn more" goes to its
                  entry in the standalone section, which takes this id as
                  its anchor.
     short        Short label for the stage's side list.
     image        Path to the image, e.g. "images/iron.webp". Leave as null to
                  show the soft placeholder shape instead.
     imageSize    [width, height] of the image in pixels (keeps the layout steady).
     imageFit     Optional. "cover" for a full photo (not a cut-out).
     alt          Plain description of the image for screen readers (no claims).
     placeholder  Shown when there is no image: { shape, colour }
                  shape: "drop" | "circle" | "pill" | "blob" | "arch"
     badge        Optional small label, e.g. { text: "…", variant: "sky" | "sage" }
     showcase     The treatment's part of the pinned scroll stage:
                    scene:       which animation (see section 4):
                                 "runner" | "orange" | "float" | "coconut" |
                                 "cucumber" | "molecule" | "plant" | "wipe" |
                                 "droplet" | "shower" | "frames" | "bone"
                                 (anything else fades in/out)
                    tint:        the stage's background colour for this treatment
                                 (also the soft background of its page)
                    layers:      ("orange", "plant", "cucumber", "shower",
                                 "droplet", "bone") layer images on the image's
                                 canvas; ("coconut") layers on their own
                                 1000 × 1056 canvas
                    swayMask:    ("wipe") greyscale mask: white hair sways, black never moves
                    frames:      ("frames", "droplet") { path, count, size } image sequence
                    model:       ("molecule") V2000 SDF file for the 3D glass molecule
   ========================================================================== */

const TREATMENTS = [
  {
    id: 'hydration',
    menuSlug: 'hydration-infusion',
    short: 'Hydration',
    image: 'images/hydration.webp',
    imageSize: [760, 803],
    alt: 'A green coconut split open, with water splashing from it',
    showcase: {
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
    id: 'energy',
    menuSlug: 'energy-infusion',
    short: 'Energy',
    image: 'images/energy.webp',
    imageSize: [772, 955],
    alt: 'A runner mid-stride',
    showcase: {
      scene: 'runner',
      tint: '#F7F4EF',
    },
  },
  {
    id: 'iron',
    menuSlug: 'iron-infusion',
    short: 'Iron',
    image: 'images/iron.webp',
    imageSize: [760, 707],
    alt: 'A single red blood cell',
    badge: { text: 'Blood test required first', variant: 'sky' },
    showcase: {
      scene: 'float',
      tint: '#F9EFEE',
    },
  },
  {
    id: 'muscle-recovery',
    menuSlug: 'muscle-and-fitness-infusion',
    short: 'Muscle',
    image: 'images/deadlift/deadlift-30.webp', // the finished pose: cards and reduced motion
    imageSize: [792, 1310],
    alt: 'An athlete standing tall at the top of a deadlift',
    showcase: {
      scene: 'frames',
      tint: '#F3F0EC',
      frames: { path: 'images/deadlift/deadlift-{n}.webp', count: 30, size: [792, 1310] },
    },
  },
  {
    id: 'nad',
    menuSlug: 'nad-plus-infusion',
    short: 'NAD+',
    image: 'images/nad.webp',
    imageSize: [800, 730],
    alt: 'A glass model of a molecule, with clear spheres joined by rods',
    showcase: {
      scene: 'molecule',
      tint: '#F2F2F7',
      model: 'models/nad.sdf',
    },
  },
  {
    id: 'detox',
    menuSlug: 'detox-infusion',
    short: 'Detox',
    image: 'images/detox-card.webp',
    imageSize: [570, 1015],
    alt: 'A cucumber slice splashing into a tall glass of water',
    showcase: {
      scene: 'cucumber',
      tint: '#F0F4EC',
      layers: {
        glass: 'images/detox-glass.webp',
        glassFront: 'images/detox-glass-front.webp',
        splashBody: 'images/detox-splash-body.webp',
        splashTop: 'images/detox-splash-top.webp',
        sliceFall: 'images/detox-slice-fall.webp',
      },
    },
  },
  {
    id: 'immunity',
    menuSlug: 'immunity-infusion',
    short: 'Immunity',
    image: 'images/immunity.webp',
    imageSize: [1040, 919],
    alt: 'Two halves of an orange with droplets of juice',
    showcase: {
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
    menuSlug: 'recovery-infusion',
    short: 'Recovery',
    image: 'images/shower-wet.webp',
    imageSize: [829, 941],
    alt: 'A woman with her eyes closed, tipping her head back under a rain shower',
    showcase: {
      scene: 'shower',
      tint: '#EFF4F5',
      layers: {
        dry: 'images/shower-dry.webp',
        wet: 'images/shower-wet.webp',
      },
    },
  },
  {
    id: 'vitamin-d',
    menuSlug: null, // not a drip: the menu's standalone Vitamin D injection
    standalone: { row: 'Vitamin D injection', entry: 'Vitamin D (injection)' },
    short: 'Vitamin D',
    image: 'images/bone-whole.webp',
    imageSize: [1405, 320],
    alt: 'A human thigh bone',
    showcase: {
      scene: 'bone',
      tint: '#EEF2F6',
      layers: {
        left: 'images/bone-left.webp',
        right: 'images/bone-right.webp',
        leftClean: 'images/bone-left-clean.webp',
        rightClean: 'images/bone-right-clean.webp',
        whole: 'images/bone-whole.webp',
      },
    },
  },
  {
    id: 'longevity',
    menuSlug: 'longevity-infusion',
    short: 'Longevity',
    image: 'images/longevity.webp',
    imageSize: [860, 911],
    alt: 'A young green shoot with water droplets',
    showcase: {
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
    id: 'skin',
    menuSlug: 'beauty-and-glow-infusion',
    short: 'Beauty',
    image: 'images/skin.webp',
    imageSize: [800, 800],
    imageFit: 'cover',
    alt: 'A single water droplet resting on skin',
    showcase: {
      scene: 'droplet',
      tint: '#F8EFEA',
      layers: {
        base: 'images/skin-base.webp',
        fallHigh: 'images/skin/drop-fall-high.webp',
        fallLow: 'images/skin/drop-fall-low.webp',
      },
      frames: { path: 'images/skin/skin-drop-{n}.webp', count: 14, size: [800, 800] },
    },
  },
  {
    id: 'hair',
    menuSlug: 'hair-and-scalp-infusion',
    short: 'Hair',
    image: 'images/hair.webp',
    imageSize: [720, 1024],
    alt: 'Long, glossy brown hair seen from behind',
    showcase: {
      scene: 'wipe',
      tint: '#F6F0EA',
      swayMask: 'images/hair-mask.webp',
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
   The first treatment's entrance plays while the stage scrolls into view
   (its top moving from `approach` of the viewport height to the top), so
   the pinned stage opens on its entered picture, text and tint.
   ========================================================================== */

const STAGE = {
  pinPerTreatment: { desktop: 120, mobile: 100 }, // % of the viewport height
  segment: 1,           // timeline length of one treatment's segment
  enterEnd: 0.2,        // end of the entrance
  exitStart: 0.82,      // start of the exit (= start of the next segment)
  label: 0.6,           // default rest label (scenes may override)
  textIn: [0.08, 0.2],  // text fades up during the entrance…
  textOut: [0.82, 0.9], // …and away at the start of the exit (gone before the next arrives)
  approach: 0.6,        // share of the viewport height the first entrance plays over
  finalTint: '#FBFAF7', // Porcelain, to match the "All treatments" band below
  snap: {
    idle: 150,          // ms of stillness before gliding to the nearest rest point
    duration: [0.6, 0.9],
  },
};

/* ==========================================================================
   3. Rendering

   Every name, price and line of treatment copy comes from window.MENU
   (data/menu.js) and is escaped as text. Elements that show a menu string
   carry data-verbatim with its path in data/drips.json, so the generator's
   check (scripts/build-menu.mjs) can compare them word for word.
   ========================================================================== */

const MENU = window.MENU || null;
// Picture, tint and badge per drip, resolved by the generator from TREATMENTS.
const MENU_VISUALS = window.MENU_VISUALS || {};
// Where every Book button goes. Set once, in scripts/build-menu.mjs.
const BOOK_URL = window.BOOK_URL || '#';

const esc = (value) =>
  String(value).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

const pad = (n) => String(n).padStart(2, '0');

// "\n\n" in a menu string is a paragraph break.
const parasHTML = (text) => String(text).split('\n\n').map((p) => `<p>${esc(p)}</p>`).join('\n');

const dripBySlug = (slug) => (MENU ? MENU.drips.find((d) => d.slug === slug) : null) || null;

// What a stage treatment shows: its drip on the menu, or its row of the
// standalone price table. Null if the menu doesn't have it.
function menuItem(t) {
  if (t.menuSlug) {
    const drip = dripBySlug(t.menuSlug);
    if (!drip) return null;
    const at = `drips.${drip.slug}`;
    return { name: drip.name, price: drip.priceLabel, href: `treatments/${drip.slug}/`, namePath: `${at}.name`, pricePath: `${at}.priceLabel` };
  }
  if (t.standalone && MENU) {
    const i = MENU.standalone.priceTable.rows.findIndex((row) => row[0] === t.standalone.row);
    if (i < 0) return null;
    const [name, price] = MENU.standalone.priceTable.rows[i];
    const at = `standalone.priceTable.rows.${i}`;
    return { name, price, href: `#${t.id}`, namePath: `${at}.0`, pricePath: `${at}.1` };
  }
  return null;
}

function badgeHTML(badge) {
  if (!badge) return '';
  const cls = badge.variant === 'sage' ? 'badge badge--sage' : 'badge';
  return `<span class="${cls}">${esc(badge.text)}</span>`;
}

// The menu's price label, exactly as written ("£119", "from £179").
const priceHTML = (label, path) => `<p class="price" data-verbatim="${esc(path)}">${esc(label)}</p>`;

const bookHTML = (name) =>
  `<a class="btn btn--primary" href="${esc(BOOK_URL)}">Book<span class="visually-hidden"> ${esc(name)}</span></a>`;

const learnMoreHTML = (m) =>
  `<a class="btn btn--secondary" href="${esc(m.href)}">Learn more<span class="visually-hidden"> about ${esc(m.name)}</span></a>`;

const layerImg = (src, [w, h], attrs = '') =>
  `<img class="layer" src="${esc(src)}" alt="" width="${w}" height="${h}" decoding="async" draggable="false"${attrs}>`;

const placeholderHTML = (t, extra = '') =>
  `<span class="placeholder placeholder--${esc(t.placeholder?.shape || 'circle')}${extra}" style="--ph: ${esc(t.placeholder?.colour || '#E8EFFB')}" aria-hidden="true"></span>`;

function objHTML(t, type, inner, ratio = t.imageSize) {
  return `
    <div class="obj obj--${type}" style="--ratio: ${ratio[0]} / ${ratio[1]}" role="img" aria-label="${esc(t.alt || '')}">
      <span class="obj__shadow" aria-hidden="true"></span>
      ${inner}
    </div>`;
}

// Names this long get a slightly smaller stage title, so they wrap onto two
// lines rather than three.
const LONG_TITLE = 20;

function textHTML(t, titleId) {
  const m = menuItem(t);
  const long = m.name.length > LONG_TITLE ? ' treatment-title--long' : '';
  return `
    <p class="eyebrow">IV therapy</p>
    <h2 class="treatment-title${long}" id="${titleId}" data-verbatim="${esc(m.namePath)}">${esc(m.name)}</h2>
    ${badgeHTML(t.badge)}
    <div class="treatment-actions">${bookHTML(m.name)}${learnMoreHTML(m)}${priceHTML(m.price, m.pricePath)}</div>`;
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

  const steps = featured.map((t) => `
    <li><button type="button" class="stage__step" data-goto="${esc(t.id)}" aria-label="Go to ${esc(menuItem(t).name)}"><span>${esc(t.short)}</span></button></li>`).join('');

  return `
    <section class="stage" id="stage" aria-label="Featured treatments">
      <div class="stage__bg" aria-hidden="true"></div>
      <div class="container stage__inner">
        <div class="stage__visual">${scenes}</div>
        <div class="stage__text">${copies}</div>
      </div>
      <nav class="stage__progress" aria-label="Featured treatments">
        <ol class="stage__steps">${steps}</ol>
      </nav>
    </section>`;
}

// Calm stacked blocks with the finished images: used for reduced motion,
// and whenever the scroll animation can't run. A standalone item's anchor
// belongs to its entry in the standalone section.
function staticListHTML(featured) {
  const blocks = featured.map((t, i) => {
    const [w, h] = t.imageSize;
    let media;
    if (!t.image) media = `<div class="treatment-block__shape">${placeholderHTML(t)}</div>`;
    else if (t.imageFit === 'cover') media = `<img class="treatment-block__photo" src="${esc(t.image)}" alt="${esc(t.alt || '')}" width="${w}" height="${h}" loading="lazy" decoding="async">`;
    else media = `<img src="${esc(t.image)}" alt="${esc(t.alt || '')}" width="${w}" height="${h}" loading="lazy" decoding="async">`;
    const anchor = t.standalone ? '' : ` id="${esc(t.id)}"`;
    return `
      <section class="treatment-block treatment-block--image-${i % 2 ? 'left' : 'right'}"${anchor} aria-labelledby="${esc(t.id)}-title">
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

// The card is one link that already carries the drip's name, so its picture is decorative.
function cardMediaHTML(v) {
  if (!v.image) return `<div class="card__media" aria-hidden="true">${placeholderHTML(v)}</div>`;
  const [w, h] = v.imageSize;
  const img = `<img src="${esc(v.image)}" alt="" width="${w}" height="${h}" loading="lazy" decoding="async">`;

  // A full photo fills the well; it scales inside its rounded frame on hover.
  if (v.imageFit === 'cover') return `<div class="card__media card__media--photo">${img}</div>`;

  // A cut-out is contained in the padded area, with a soft ellipse shadow just
  // below where the image actually ends (tall, wide and square images differ).
  const shownW = CARD_FILL * Math.min(1, w / h);
  const shownH = CARD_FILL * Math.min(1, h / w);
  const bottom = ((1 - shownH) / 2) * 100;
  const shadow = `--shadow-w: ${(shownW * 70).toFixed(1)}%; --shadow-bottom: ${(bottom - 3).toFixed(1)}%`;
  return `<div class="card__media"><span class="card__shadow" style="${shadow}" aria-hidden="true"></span>${img}</div>`;
}

// One card per drip, in menu order; the whole card links to the drip's page.
function cardHTML(drip) {
  const v = MENU_VISUALS[drip.slug] || {};
  const at = `drips.${drip.slug}`;
  return `
    <a class="card" href="treatments/${esc(drip.slug)}/" data-card>
      ${cardMediaHTML(v)}
      <h3 class="card__title" data-verbatim="${esc(at)}.name">${esc(drip.name)}</h3>
      ${badgeHTML(v.badge)}
      <div class="card__action">
        ${priceHTML(drip.priceLabel, `${at}.priceLabel`)}
        <span class="btn btn--secondary btn--compact card__more">Learn more</span>
      </div>
    </a>`;
}

// The menu's standalone infusions and injections: heading, intro, price table
// and one accordion entry per ingredient. An entry a stage treatment points
// to (e.g. Vitamin D) takes that treatment's id as its anchor.
function standaloneHTML(s) {
  const anchors = Object.fromEntries(TREATMENTS.filter((t) => t.standalone).map((t) => [t.standalone.entry, t.id]));
  const at = 'standalone';
  const head = s.priceTable.columns.map((c, i) =>
    `<th scope="col" data-verbatim="${at}.priceTable.columns.${i}">${esc(c)}</th>`).join('');
  const rows = s.priceTable.rows.map((row, i) => `
    <tr>${row.map((cell, j) => {
      const tag = j === 0 ? 'th scope="row"' : 'td';
      return `<${tag} data-verbatim="${at}.priceTable.rows.${i}.${j}">${esc(cell)}</${tag.split(' ')[0]}>`;
    }).join('')}</tr>`).join('');
  const items = s.ingredientDescriptions.map((d, i) => {
    const id = anchors[d.name] ? ` id="${esc(anchors[d.name])}"` : '';
    return `
      <details class="accordion__item"${id}>
        <summary class="accordion__summary"><span data-verbatim="${at}.ingredientDescriptions.${i}.name">${esc(d.name)}</span></summary>
        <div class="accordion__body" data-verbatim="${at}.ingredientDescriptions.${i}.text">${parasHTML(d.text)}</div>
      </details>`;
  }).join('');
  return `
    <section class="section section--porcelain standalone" id="standalone" aria-labelledby="standalone-title">
      <div class="container">
        <header class="section-head" data-fade>
          <h2 class="section-title" id="standalone-title" data-verbatim="${at}.heading">${esc(s.heading)}</h2>
          <p class="section-lead" data-verbatim="${at}.intro">${esc(s.intro)}</p>
        </header>
        <div class="standalone__grid">
          <div class="price-table-wrap" data-fade>
            <table class="price-table" aria-labelledby="standalone-title">
              <thead><tr>${head}</tr></thead>
              <tbody>${rows}</tbody>
            </table>
          </div>
          <div class="accordion" data-fade>${items}</div>
        </div>
      </div>
    </section>`;
}

// Stage treatments the menu has (all of them, unless data/menu.js is missing).
const FEATURED = TREATMENTS.filter((t) => t.showcase && menuItem(t));

function render() {
  if (!MENU) return;
  const stageRoot = document.getElementById('stage-root');
  const gridRoot = document.getElementById('treatment-grid');
  const standaloneRoot = document.getElementById('standalone-root');
  if (stageRoot && FEATURED.length) stageRoot.innerHTML = stageHTML(FEATURED) + staticListHTML(FEATURED);
  if (gridRoot) gridRoot.innerHTML = MENU.drips.map(cardHTML).join('');
  if (standaloneRoot && MENU.standalone) standaloneRoot.innerHTML = standaloneHTML(MENU.standalone);
}

/* ==========================================================================
   4. Scenes: the markup and the animation for each kind of featured visual.

   coconut  Hydration: the coconut cracks, the lid lifts, water splashes
   runner   Energy: the runner moves in beside the text, then runs off
   float    Iron: the photo floats in and turns gently in-plane
   frames   Muscle Recovery: the deadlift image sequence
   molecule NAD+: the 3D glass molecule turns like a turntable
            (falls back to the photo turning in-plane)
   cucumber Detox: a slice drops into a glass of water and splashes
   orange   Immunity: the orange splits into halves and juice
   shower   Recovery: water from the shower soaks the hair
   bone     Vitamin D: two halves of a bone come together as one
   plant    Longevity: the stem grows, the bud and leaves unfold
   droplet  Skin & Beauty: a droplet falls onto the skin and settles
   wipe     Hair & Scalp: soft wipe, then the hair sways
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
     c.tl, c.start, c.L, c.label, c.isLast, c.isDesktop
   The first treatment's entrance plays while the stage scrolls into view,
   so the stage opens on its entered picture; the last one has no exit
   (fadeOut skips it) and stays until the stage scrolls away.
   A scene may also have preload(t, scene, isDesktop), awaited before the
   stage starts, and its own rest label.
   Every scene shows its natural, finished picture during its rest.
   Only transform, opacity, clip-path, masks and custom properties are animated.
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

// Default entrance and exit. The fades are sequential (the outgoing object
// has fully faded at 0.90 of its segment, exactly when the incoming one starts
// to appear at 0.08 of its own) while their movements overlap, so a handover
// never shows two pictures at once.
const FADE_IN = [0.08, 0.2];
const FADE_OUT = [0.82, 0.9];
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
// Visibility only, for scenes whose entrance is a reveal (a growing stem, a wipe).
const gateIn = ({ obj, ft }) => {
  gsap.set(obj, { autoAlpha: 0 });
  ft(obj, { autoAlpha: 0 }, { autoAlpha: 1 }, ...FADE_IN, 'power1.out');
};

// The 3D scenes draw into .three-host; until their first frame (or if 3D
// can't run) the photo in .three-fallback shows, with its own animation.
const threeHTML = (fallback) => `
  <div class="layer three-fallback">${fallback}</div>
  <div class="layer three-host" aria-hidden="true"></div>`;

// The NAD+ fallback: the photo turns in-plane across the segment (upright at
// rest), with a very slow idle turn. `tilt` receives a subtle 3D wobble.
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

// A 3D view is created once, the first time its treatment approaches, and
// kept on its scene element (so it survives the stage being rebuilt).
function ensure3D(scene, create, pixelRatioCap) {
  const state = scene.view3d || (scene.view3d = { view: null, promise: null });
  if (!state.promise) {
    state.promise = create()
      .catch(() => null)
      .then((view) => { state.view = view; return view; });
  } else if (state.view) {
    state.view.setPixelRatioCap(pixelRatioCap);
  }
  return state.promise;
}

// A turntable across the whole segment: one full turn, facing front at the
// rest label, handed to the scene's 3D view on every frame.
function turntable3D(c, create) {
  const { scene, ft, live, start, L, label, isDesktop } = c;
  const motion = { turn: -2 * Math.PI * label };
  ft(motion, { turn: -2 * Math.PI * label }, { turn: 2 * Math.PI * (1 - label) }, 0, 1);
  const cap = isDesktop ? 2 : 1.5;
  live({
    initFrom: start - 0.5 * L, // set up while the previous treatment is on screen
    init: () => ensure3D(scene, () => create(cap), cap).then((view) => view && view.render(motion)),
    frame: (time, dt) => { if (scene.view3d?.view) scene.view3d.view.render(motion, dt); },
  });
}

// Loads and decodes an image sequence, then draws it on the scene's
// .fx--frames canvas (awaited before the stage starts).
function preloadFrames(t, scene, isDesktop, options) {
  const { path, count } = t.showcase.frames;
  const srcs = Array.from({ length: count }, (_, i) => path.replace('{n}', pad(i + 1)));
  return Promise.all(srcs.map(loadImage)).then((images) => {
    scene.frameSequence = createFrameSequence(scene.querySelector('.fx--frames'), images, isDesktop, options);
    return scene.frameSequence;
  });
}

// Drives a frame sequence from the segment: map(f) turns the segment
// fraction into a position between 0 and 1 along the sequence.
function scrubFrames({ scene, tl, start, L, live }, map) {
  const proxy = { p: 0 };
  tl.fromTo(proxy, { p: 0 }, {
    p: 1, duration: L, ease: 'none', immediateRender: false,
    onUpdate: () => {
      const seq = scene.frameSequence;
      if (seq) seq.setPosition(map(proxy.p) * (seq.count - 1));
    },
  }, start);
  live({ frame: () => scene.frameSequence && scene.frameSequence.draw() });
}

const SCENES = {
  // ENERGY: fades in beside the text with a gentle move in from the left,
  // bobs very slightly at rest, then runs off the right edge, fading as he goes.
  runner: {
    html: (t) => objHTML(t, 'runner', layerImg(t.image, t.imageSize, ' data-layer="runner"')),
    animate(c) {
      const { obj, scene, ft, idle, isLast } = c;
      const root = document.getElementById('stage');
      const xExit = () => window.innerWidth - offsetWithin(obj, root).left + 40;

      fadeIn(c, { x: -60 });
      if (!isLast) {
        // The distance is measured as it plays, so it always fits the current layout.
        const run = { p: 0 };
        ft(run, { p: 0 }, { p: 1, onUpdate: () => gsap.set(obj, { x: run.p * xExit() }) }, 0.82, 1, 'power1.in');
        ft(obj, { autoAlpha: 1 }, { autoAlpha: 0 }, ...FADE_OUT, 'power1.inOut');
      }
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

  // DETOX: a cucumber slice drops into a tall glass of water, passing behind
  // the rim and the water line (glassFront) into the water, and the water
  // splashes up out of the glass. The picture holds on that splash. All
  // layers share the 570 × 1015 canvas; origins and offsets are % of it.
  cucumber: {
    label: 0.5,
    html: (t) => {
      const ly = t.showcase.layers;
      return objHTML(t, 'cucumber', [
        layerImg(ly.glass, t.imageSize, ' data-layer="glass"'),
        layerImg(ly.sliceFall, t.imageSize, ' data-layer="slice-fall"'),
        layerImg(ly.glassFront, t.imageSize, ' data-layer="glass-front"'),
        layerImg(ly.splashBody, t.imageSize, ' data-layer="splash-body"'),
        layerImg(ly.splashTop, t.imageSize, ' data-layer="splash-top"'),
      ].join(''));
    },
    animate(c) {
      const { scene, ft } = c;
      const q = (name) => scene.querySelector(`[data-layer="${name}"]`);
      const fall = q('slice-fall'), body = q('splash-body'), top = q('splash-top');
      const falling = { yPercent: -62, rotation: -38.2, scale: 0.85 };
      const landed = { yPercent: 0, rotation: 21.8, scale: 1 };

      fadeIn(c, { y: 40 });
      gsap.set(fall, { transformOrigin: '52.28% 49.68%', autoAlpha: 0, ...falling });
      gsap.set(top, { transformOrigin: '49.74% 22.66%', autoAlpha: 0, scaleX: 0.6, scaleY: 0.2 }); // the rim
      gsap.set(body, { autoAlpha: 0 });

      // The drop: the slice accelerates down and turns, then disappears into the splash.
      ft(fall, { autoAlpha: 0 }, { autoAlpha: 1 }, 0.08, 0.12);
      ft(fall, falling, landed, 0.08, 0.3, 'power2.in');
      ft(fall, { autoAlpha: 1 }, { autoAlpha: 0 }, 0.3, 0.315);

      // The splash bursts up from the rim and holds.
      ft([body, top], { autoAlpha: 0 }, { autoAlpha: 1 }, 0.29, 0.31);
      ft(top, { scaleX: 0.6, scaleY: 0.2 }, { scaleX: 1, scaleY: 1 }, 0.29, 0.42, 'power2.out');
      fadeOut(c, { y: -30 });
    },
  },

  // NAD+: the real 3D structure (section 5) in clear glass, turning like a
  // turntable once across its segment (facing front at rest), with a very
  // slow extra idle turn. nad.webp shows until the first 3D frame is drawn;
  // without WebGL (or if loading fails) the photo turns in-plane instead.
  molecule: {
    html: (t) => objHTML(t, 'molecule', threeHTML(spinHTML(t))),
    animate(c) {
      const { t, obj, scene } = c;
      fadeIn(c, { scale: 0.9 });
      spinImage(c, scene.querySelector('.three-fallback'));
      fadeOut(c, { scale: 0.85 });
      turntable3D(c, (cap) => createMolecule(obj, t.showcase.model, cap));
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
      gateIn(c);
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
      gateIn(c);
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

  // SKIN & BEAUTY: a real-looking water droplet falls onto the skin (two
  // pictures of the falling drop, crossfaded as it speeds up), then the impact
  // plays as a 14-frame sequence, from touching the skin to resting. Everything
  // zooms together in one layer. No frame: skin-base.webp already fades into
  // the Skin tint at its edges. The droplet lands at 52.6% 59.5%.
  droplet: {
    label: 0.64,
    html: (t) => objHTML(t, 'droplet', `
      <div class="layer zoomer">
        ${layerImg(t.showcase.layers.base, t.imageSize, ' data-layer="base"')}
        ${layerImg(t.showcase.layers.fallHigh, t.imageSize, ' data-layer="fall-high"')}
        ${layerImg(t.showcase.layers.fallLow, t.imageSize, ' data-layer="fall-low"')}
        <canvas class="layer fx--frames" aria-hidden="true"></canvas>
      </div>`, t.showcase.frames.size),
    // The impact frames are soft, semi-transparent water, so neighbouring
    // frames are blended as a true cross-dissolve.
    preload: (t, scene, isDesktop) => preloadFrames(t, scene, isDesktop, { dissolve: true }),
    animate(c) {
      const { scene, ft } = c;
      const zoomer = scene.querySelector('.zoomer');
      const high = scene.querySelector('[data-layer="fall-high"]');
      const low = scene.querySelector('[data-layer="fall-low"]');
      const impact = scene.querySelector('.fx--frames');

      fadeIn(c, { scale: 0.94 });
      gsap.set(zoomer, { transformOrigin: '52.6% 59.5%' });
      ft(zoomer, { scale: 1.08 }, { scale: 1 }, 0, 0.7, 'power1.out');

      // The fall, accelerating like gravity. The nearer, faster picture fades
      // in over the first before it goes, so the drop never looks see-through.
      gsap.set([high, low], { autoAlpha: 0, yPercent: -55 });
      ft([high, low], { yPercent: -55 }, { yPercent: 0 }, 0.1, 0.32, 'power2.in');
      ft(high, { autoAlpha: 0 }, { autoAlpha: 1 }, 0.1, 0.14);
      ft(low, { autoAlpha: 0 }, { autoAlpha: 1 }, 0.24, 0.29);
      ft(high, { autoAlpha: 1 }, { autoAlpha: 0 }, 0.29, 0.3);
      ft(low, { autoAlpha: 1 }, { autoAlpha: 0 }, 0.32, 0.33);

      // The impact: a quick splash, then a slower settle (ease-out over 0.32 → 0.50).
      gsap.set(impact, { autoAlpha: 0 });
      ft(impact, { autoAlpha: 0 }, { autoAlpha: 1 }, 0.32, 0.325);
      scrubFrames(c, (p) => 1 - (1 - gsap.utils.clamp(0, 1, (p - 0.32) / 0.18)) ** 1.6);

      fadeOut(c, { x: -60 });
    },
  },

  // RECOVERY: water pours from the shower head and soaks her hair and face,
  // as a soft wipe from the top down driven by --reveal (a % from the top;
  // see styles.css). The dry picture only fades where the wet one is already
  // fully shown, so nothing is ever see-through. Once the water has reached
  // her head, fine streaks keep falling from the shower (section 5).
  shower: {
    label: 0.72,
    html: (t) => objHTML(t, 'shower', `
      ${layerImg(t.showcase.layers.dry, t.imageSize, ' data-layer="dry"')}
      ${layerImg(t.showcase.layers.wet, t.imageSize, ' data-layer="wet"')}
      <canvas class="layer fx--shower" aria-hidden="true"></canvas>`),
    animate(c) {
      const { obj, ft, live, isDesktop } = c;
      const water = obj.querySelector('.fx--shower');
      fadeIn(c, { y: 40 });
      gsap.set(obj, { '--reveal': '-8%' });
      ft(obj, { '--reveal': '-8%' }, { '--reveal': '108%' }, 0.2, 0.62, 'power1.in');
      gsap.set(water, { autoAlpha: 0 });
      ft(water, { autoAlpha: 0 }, { autoAlpha: 1 }, 0.55, 0.65);
      fadeOut(c, { y: -30 });
      live(createShowerWater(water, isDesktop));
    },
  },

  // MUSCLE RECOVERY: a 30-frame deadlift drawn on a canvas, crossfading
  // between neighbouring frames. Frame 01 holds before, frame 30 after.
  frames: {
    label: 0.74,
    html: (t) => objHTML(t, 'frames', `<canvas class="layer fx--frames" aria-hidden="true"></canvas>`, t.showcase.frames.size),
    preload: (t, scene, isDesktop) => preloadFrames(t, scene, isDesktop),
    animate(c) {
      fadeIn(c, { x: 40 });
      const FROM = 0.12, TO = 0.7;
      scrubFrames(c, (p) => gsap.utils.clamp(0, 1, (p - FROM) / (TO - FROM)));
      fadeOut(c, { y: -30 });
    },
  },

  // VITAMIN D: two halves of a broken bone slide together from either side,
  // pivoting at the join (50.64% 54.22% of the 1405 × 320 canvas). As they
  // approach, each broken half crossfades to its clean piece (the whole bone
  // cut in two), so the crumbly ends fade; a soft glow blooms at the join and
  // the whole bone takes over, invisibly, once the halves are exactly closed.
  bone: {
    label: 0.7,
    html: (t) => {
      const ly = t.showcase.layers;
      return objHTML(t, 'bone', `
        <div class="layer bone-half bone-half--left">
          ${layerImg(ly.left, t.imageSize, ' data-layer="left"')}
          ${layerImg(ly.leftClean, t.imageSize, ' data-layer="left-clean"')}
        </div>
        <div class="layer bone-half bone-half--right">
          ${layerImg(ly.right, t.imageSize, ' data-layer="right"')}
          ${layerImg(ly.rightClean, t.imageSize, ' data-layer="right-clean"')}
        </div>
        ${layerImg(ly.whole, t.imageSize, ' data-layer="whole"')}
        <span class="bone-glow" aria-hidden="true"></span>`);
    },
    animate(c) {
      const { scene, ft } = c;
      const q = (name) => scene.querySelector(`[data-layer="${name}"]`);
      const halfL = scene.querySelector('.bone-half--left'), halfR = scene.querySelector('.bone-half--right');
      const brokenL = q('left'), brokenR = q('right'), cleanL = q('left-clean'), cleanR = q('right-clean');
      const whole = q('whole'), glow = scene.querySelector('.bone-glow');
      const apartL = { xPercent: -6, rotation: -4 }, apartR = { xPercent: 6, rotation: 4 };
      const closed = { xPercent: 0, rotation: 0 };

      fadeIn(c, { y: 30 });
      gsap.set([halfL, halfR], { transformOrigin: '50.64% 54.22%' });
      gsap.set(halfL, apartL);
      gsap.set(halfR, apartR);
      gsap.set([cleanL, cleanR, whole], { autoAlpha: 0 });
      gsap.set(glow, { x: 0, y: 0, xPercent: -50, yPercent: -50, scale: 0.3, autoAlpha: 0 });

      // The halves slide together, closing exactly.
      ft(halfL, apartL, closed, 0.1, 0.5, 'power2.inOut');
      ft(halfR, apartR, closed, 0.1, 0.5, 'power2.inOut');

      // The broken ends fade as they approach. The clean piece (on top) comes
      // in faster than the broken half goes, so the bone never looks see-through.
      ft([cleanL, cleanR], { autoAlpha: 0 }, { autoAlpha: 1 }, 0.34, 0.46, 'power2.out');
      ft([brokenL, brokenR], { autoAlpha: 1 }, { autoAlpha: 0 }, 0.34, 0.46, 'power2.in');

      // A soft glow blooms at the join, then spreads and fades.
      ft(glow, { scale: 0.3, autoAlpha: 0 }, { scale: 1, autoAlpha: 1 }, 0.44, 0.52, 'power1.out');
      ft(glow, { scale: 1, autoAlpha: 1 }, { scale: 1.4, autoAlpha: 0 }, 0.52, 0.66, 'power1.in');

      // Handover, once the halves are exactly closed: the clean pieces match
      // the whole bone's shape, but as separately compressed images their
      // colours differ very slightly, and while both are shown their soft
      // edges add up. So the whole bone fades in on top (blending the pieces'
      // texture and the cut into its own), then the halves fade out beneath
      // it (its outline eases back), with no step anywhere.
      ft(whole, { autoAlpha: 0 }, { autoAlpha: 1 }, 0.5, 0.54, 'sine.inOut');
      ft([halfL, halfR], { autoAlpha: 1 }, { autoAlpha: 0 }, 0.54, 0.58, 'sine.inOut');
      fadeOut(c, { y: -30 });
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

// A canvas whose opacity is animated to 0 is hidden: skip drawing it.
const shown = (canvas) => canvas.style.visibility !== 'hidden';

// RECOVERY: thin, bright streaks of water fall from just under the shower
// head, accelerating, and fade out where they reach her head (lower towards
// the right, where her face tips back). 40 at a time (20 on small screens).
function createShowerWater(canvas, isDesktop) {
  const ctx = canvas.getContext('2d');
  const cap = isDesktop ? 2 : 1.5;
  const max = isDesktop ? 40 : 20;
  const rate = max * 2; // streaks per second (each lives about half a second)
  const START = 0.155;  // just under the shower head, as a share of the height
  let w = 0, h = 0, parts = [], carry = 0, observer = null, blank = true;

  // Where a streak meets her head, by how far across it falls.
  const stopAt = (x) => (x < 0.5 ? 0.36 : x < 0.65 ? rand(0.4, 0.45) : x < 0.71 ? rand(0.45, 0.55) : x < 0.76 ? rand(0.55, 0.62) : 0.64);
  const resize = () => { ({ w, h } = fitCanvas(canvas, ctx, cap)); };
  const spawn = () => {
    const x = rand(0.53, 0.86);
    return {
      x: x * w, y: START * h, stop: stopAt(x) * h,
      len: rand(6, 14), width: rand(1, 2),  // px
      vy: rand(0.25, 0.4) * h, accel: rand(1.2, 1.8) * h, age: 0,
    };
  };

  return {
    start() {
      if (!observer) { observer = new ResizeObserver(resize); observer.observe(canvas); }
      resize();
    },
    stop() { parts = []; carry = 0; ctx.clearRect(0, 0, w, h); blank = true; },
    frame(time, dt) {
      carry += rate * dt;
      while (carry >= 1) { carry -= 1; if (parts.length < max) parts.push(spawn()); }
      parts = parts.filter((p) => {
        p.age += dt;
        p.vy += p.accel * dt;
        p.y += p.vy * dt;
        return p.y < p.stop;
      });
      if (!shown(canvas)) {
        if (!blank) { ctx.clearRect(0, 0, w, h); blank = true; }
        return;
      }
      blank = false;
      ctx.clearRect(0, 0, w, h);
      ctx.lineCap = 'round';
      for (const p of parts) {
        const top = Math.max(START * h, p.y - p.len);
        // Fade in as it leaves the shower head, and out as it reaches her head.
        ctx.globalAlpha = Math.min(1, p.age / 0.05) * gsap.utils.clamp(0, 1, (p.stop - p.y) / (0.04 * h));
        ctx.beginPath();
        ctx.moveTo(p.x, top);
        ctx.lineTo(p.x, p.y);
        ctx.lineWidth = p.width + 1.2; // a faint darker edge, so it reads on the pale background
        ctx.strokeStyle = 'rgba(60, 85, 100, 0.18)';
        ctx.stroke();
        ctx.lineWidth = p.width;
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
    },
  };
}

// Image sequences (Skin & Beauty, Muscle Recovery): every frame is drawn at
// the same position and size (they are pre-aligned). Between two frames:
//  - by default, frame floor(p) and then frame ceil(p) on top with the
//    fractional part as opacity (the deadlift);
//  - with { dissolve: true }, a true cross-dissolve (1 − f)·A + f·B, which
//    suits soft, semi-transparent frames such as the water droplet.
// Only redraws when the position changes.
function createFrameSequence(canvas, images, isDesktop, { dissolve = false } = {}) {
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
    const blend = i1 !== i0 && f > 0.001;
    ctx.clearRect(0, 0, w, h);
    ctx.globalAlpha = blend && dissolve ? 1 - f : 1;
    ctx.drawImage(images[i0], 0, 0, w, h);
    if (blend) {
      ctx.globalAlpha = f;
      if (dissolve) ctx.globalCompositeOperation = 'lighter'; // adds the premultiplied colours
      ctx.drawImage(images[i1], 0, 0, w, h);
      ctx.globalCompositeOperation = 'source-over';
    }
    ctx.globalAlpha = 1;
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

/* ---------- 3D scene (NAD+): shared setup ----------
   Each 3D scene draws with Three.js into a transparent canvas that fills its
   object's .three-host (so the layout keeps the photo's proportions), lit by
   a studio reflection map (RoomEnvironment through PMREM). The model sits on
   a turntable: a fixed forward tilt, with the model turning inside it. */

const hasWebGL = () => {
  const probe = document.createElement('canvas');
  return !!(probe.getContext('webgl2') || probe.getContext('webgl'));
};

async function createStudio(obj, pixelRatioCap, { tilt, idleSpeed, exposure = 1 }) {
  const [THREE, { RoomEnvironment }] = await Promise.all([
    import('three'),
    import('three/addons/environments/RoomEnvironment.js'),
  ]);
  const host = obj.querySelector('.three-host');
  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, premultipliedAlpha: true });
  renderer.setClearColor(0x000000, 0);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, pixelRatioCap));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.NeutralToneMapping;
  renderer.toneMappingExposure = exposure;
  renderer.domElement.className = 'three-canvas';

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  pmrem.dispose();

  const spinner = new THREE.Group();
  const tilted = new THREE.Group();
  tilted.rotation.x = tilt;
  tilted.add(spinner);
  scene.add(tilted);

  // Frame the model so it fits, with a little margin, at every angle of the
  // turn: its points are projected at 72 angles and the camera distance is
  // found by bisection.
  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 1000);
  let samples = [];
  const fit = () => {
    const tanV = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    const limit = 0.94; // share of the half-width/height the model may reach
    const fits = (d) => samples.every(([v, r]) => {
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

  let idleAngle = 0;
  const view = {
    setPixelRatioCap(cap) {
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, cap));
      resize();
    },
    // motion.turn: the scroll-driven turn; a very slow extra turn is added while the page is still.
    render(motion, dt = 0) {
      idleAngle += idleSpeed * dt * (1 - scrollBoost());
      spinner.rotation.y = motion.turn + idleAngle;
      renderer.render(scene, camera);
    },
  };

  return {
    THREE, scene, spinner,
    // points: [position, radius] pairs in the model's own frame.
    frameAround(points) {
      samples = [];
      const turn = new THREE.Matrix4(), tiltM = new THREE.Matrix4().makeRotationX(tilt), spin = new THREE.Matrix4();
      for (let k = 0; k < 72; k++) {
        turn.multiplyMatrices(tiltM, spin.makeRotationY((k / 72) * Math.PI * 2));
        points.forEach(([p, r]) => samples.push([p.clone().applyMatrix4(turn), r]));
      }
      resize();
    },
    // Draw the first frame, then crossfade from the photo to the canvas.
    show() {
      host.appendChild(renderer.domElement);
      view.render({ turn: 0 });
      obj.classList.add('is-3d');
      return view;
    },
  };
}

/* ---------- NAD+: a clear glass molecule on a turntable ----------
   The real 3D structure, read from a V2000 SDF file, drawn as glass spheres
   (atoms) and rods (bonds). Three instanced meshes keep it to three draw
   calls, so it stays light on phones. */

const MOLECULE = {
  heavyRadius: 0.38,
  hydrogenRadius: 0.22,
  bondRadius: 0.09,
  tilt: 0.3,          // fixed forward tilt (radians), so the turn reads as 3D
  idleSpeed: 0.03,    // extra idle turn while the page is still (radians per second)
  opacity: 0.8,
  bondOpacity: 0.85,
  hydrogenOpacity: 0.6,
  colour: 0xD9E3F0,   // a light, cool glass
  edge: 0x6F84A3,     // the darker, bluer edge at grazing angles
  tints: { O: 0xE2EBFF, N: 0xE9E4FF, P: 0xFFEFD9 }, // hints only: it reads as clear glass
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

async function createMolecule(obj, src, pixelRatioCap) {
  if (!hasWebGL()) return null;

  // 3D structure: PubChem CID 5892 (NCBI)
  const text = await fetch(src).then((r) => { if (!r.ok) throw new Error(`Could not load ${src}`); return r.text(); });
  const { atoms, bonds } = parseSDF(text);
  const studio = await createStudio(obj, pixelRatioCap, MOLECULE);
  const { THREE, scene, spinner } = studio;
  const pts = orientMolecule(THREE, atoms);

  const light = new THREE.DirectionalLight(0xffffff, 1.6);
  light.position.set(-3, 5, 6);
  scene.add(light);

  // Glass without transmission (over a transparent canvas it renders dark and
  // muddy): a light cool tint, crisp reflections, and a fresnel rim that
  // darkens towards a deeper blue at grazing angles, so every sphere and rod
  // has a clear outline, like glass photographed on white. At this opacity
  // the glass writes depth, so parts behind a sphere never show through it
  // in the wrong order.
  const edge = new THREE.Color(MOLECULE.edge); // linear, like the shader's colours
  const glass = (opacity) => {
    const material = new THREE.MeshPhysicalMaterial({
      color: MOLECULE.colour,
      metalness: 0,
      roughness: 0.05,
      clearcoat: 1,
      clearcoatRoughness: 0.05,
      ior: 1.5,
      envMapIntensity: 1.5,
      transparent: true,
      opacity,
    });
    material.onBeforeCompile = (shader) => {
      shader.fragmentShader = shader.fragmentShader.replace('#include <opaque_fragment>', `
        float rim = pow(1.0 - abs(dot(normalize(vViewPosition), normal)), 1.8);
        outgoingLight = mix(outgoingLight, vec3(${edge.r.toFixed(4)}, ${edge.g.toFixed(4)}, ${edge.b.toFixed(4)}), 0.85 * rim);
        diffuseColor.a = min(1.0, diffuseColor.a + 0.4 * rim);
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
  const bondMesh = new THREE.InstancedMesh(rod, glass(MOLECULE.bondOpacity), bonds.length);

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

  // The atoms draw first, then the rods between them.
  heavyMesh.renderOrder = 0;
  hydrogenMesh.renderOrder = 1;
  bondMesh.renderOrder = 2;
  spinner.add(heavyMesh, hydrogenMesh, bondMesh);

  const radius = (i) => (atoms[i].el === 'H' ? MOLECULE.hydrogenRadius : MOLECULE.heavyRadius);
  studio.frameAround(pts.map((p, i) => [p, radius(i)]));
  return studio.show();
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

// Driven by gsap.ticker; each effect is capped at 60fps, and nothing runs
// once the stage has scrolled out of view.
let stageOnScreen = true;
function tickLives(time) {
  if (!stageOnScreen) return;
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
let stage = null; // { st, pin, tl, ids, anchors, labelScroll } once the stage is live

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
  const y = stage.labelScroll(id);
  const distance = Math.abs(y - window.scrollY) / window.innerHeight;
  glideTo(y, gsap.utils.clamp(0.9, 2, 0.8 + distance * 0.2));
}

// An anchor on a closed <details> (e.g. #vitamin-d in the standalone
// section) opens it. Returns whether the target is one.
function openTarget(target) {
  if (!target || target.tagName !== 'DETAILS') return false;
  target.open = true;
  return true;
}

// Where to scroll so an accordion entry sits just below the fixed header,
// measured without the fade-up transform its list may still be running.
function entryScroll(target) {
  const header = document.getElementById('site-header');
  return offsetWithin(target, null).top - (header ? header.offsetHeight : 0) - 24;
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
    if (stage && stage.anchors.includes(id)) {
      event.preventDefault();
      scrollToTreatment(id);
      history.pushState(null, '', hash);
      return;
    }
    const target = document.getElementById(id);
    const isEntry = openTarget(target);
    if (target && lenis) {
      event.preventDefault();
      // Lenis honours the CSS scroll-padding-top, which clears the fixed header.
      lenis.scrollTo(isEntry ? entryScroll(target) : target);
      history.pushState(null, '', hash);
    }
  });
  // Arriving at, or going back to, an anchor on a closed <details> opens it
  // (with or without Lenis).
  const openHash = () => openTarget(document.getElementById(decodeURIComponent(location.hash.slice(1))));
  window.addEventListener('hashchange', openHash);
  openHash();
}

// After the stage exists, honour a #hash in the address (e.g. #iron or #book).
function jumpToHash() {
  const id = decodeURIComponent(location.hash.slice(1));
  if (!id || id === 'top' || !lenis) return;
  if (stage && stage.anchors.includes(id)) {
    lenis.scrollTo(stage.labelScroll(id), { immediate: true, force: true });
  } else {
    const target = document.getElementById(id);
    if (target) lenis.scrollTo(openTarget(target) ? entryScroll(target) : target, { immediate: true, force: true });
  }
}

/* ---------- Gentle snapping, done through Lenis ----------
   When scrolling has stopped inside the pinned stage, glide to the nearest
   rest point. The very start and end of the pin count as rest points too, so
   the page never pulls you back while you're entering or leaving it. */

let snapTimer = 0;
let touching = false;

function maybeSnap() {
  if (!stage || !lenis || autoScrolling || touching) return;
  const { pin, ids, labelScroll } = stage;
  const y = lenis.scroll;
  if (y <= pin.start + 1 || y >= pin.end - 1) return;
  const targets = [pin.start, ...ids.map(labelScroll), pin.end];
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
  };

  // Safety net: only the treatments whose segment contains the playhead (the
  // current one, plus the one it is handing over to) may show. Every other
  // scene (with its shadow, canvases and 3D) and text block is hidden, and
  // live effects only run inside their own segment. Within a segment the
  // tweens decide; re-entering a segment always crosses one of its tweens.
  const windows = starts.map((s, i) => [s, i === n - 1 ? Infinity : s + L]);
  const isHidden = (el) => el.style.visibility === 'hidden' && el.style.opacity === '0';
  const sync = (time) => {
    windows.forEach(([a, b], i) => {
      const on = time >= a && time <= b;
      if (on) {
        if (isHidden(scenes[i])) gsap.set(scenes[i], { autoAlpha: 1 });
        return;
      }
      if (!isHidden(scenes[i])) gsap.set(scenes[i], { autoAlpha: 0 });
      if (!isHidden(copies[i])) gsap.set(copies[i], { autoAlpha: 0 });
    });
  };

  lives = [];
  const preloads = [];
  const onUpdate = () => {
    const time = tl.time();
    let index = 0;
    switches.forEach((at, i) => { if (time >= at) index = i; });
    sync(time);
    setActive(index);
    updateLives(time);
  };

  const tl = gsap.timeline({ paused: true, defaults: { ease: 'none' }, onUpdate });

  // Visuals
  FEATURED.forEach((t, i) => {
    const start = starts[i];
    const scene = scenes[i];
    const isLast = i === n - 1;
    // Live effects run while the treatment can be seen (after its fade in starts, until its fade out ends).
    const from = start + FADE_IN[0] * L, to = isLast ? end + 1 : start + FADE_OUT[1] * L;
    const ft = (target, a, b, f0, f1, ease = 'none') =>
      tl.fromTo(target, a, { ...b, duration: (f1 - f0) * L, ease, immediateRender: false }, start + f0 * L);
    const live = (effect) => lives.push({ from, to, initFrom: from, visible: false, inited: false, last: 0, ...effect });
    const idle = (target, vars) => {
      const tween = gsap.to(target, { repeat: -1, yoyo: true, ease: 'sine.inOut', ...vars, paused: true });
      live({ start: () => tween.play(), stop: () => tween.pause() });
    };

    const obj = scene.querySelector('.obj');
    const shadow = scene.querySelector('.obj__shadow');
    defs[i].animate({ t, tl, scene, obj, shadow, ft, idle, live, start, L, label: labelAt[i], isLast, isDesktop });
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
  sync(0);
  setActive(0);
  updateLives(0);
  // After a refresh (resize, fonts) the playhead may not move, so re-apply.
  const resync = () => { const time = tl.time(); sync(time); updateLives(time); };
  return { tl, labels, end, preloads, resync };
}

// Every stage image (layers, 3D fallbacks) is loaded and decoded, and every
// image sequence (the scenes' preload) is decoded and drawn, before the stage
// starts, so nothing pops in while scrolling.
async function preloadStage(root, preloads) {
  const images = [...root.querySelectorAll('img')];
  await Promise.all([
    ...images.map((img) => img.decode().catch(() => {})),
    ...preloads,
  ]);
}

function initStage(context, isDesktop) {
  const root = document.getElementById('stage');
  if (!root) return () => {};

  document.documentElement.classList.add('has-stage');
  const { tl, end, preloads, resync } = buildStage(root, isDesktop);
  gsap.ticker.add(tickLives);
  const onScreen = new IntersectionObserver(([entry]) => { stageOnScreen = entry.isIntersecting; });
  onScreen.observe(root);

  let alive = true;
  (async () => {
    // Every image and frame is decoded, Three.js is fetched and the fonts are
    // in before the ScrollTrigger exists, so nothing loads mid-scroll.
    const fonts = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
    const needs = (test) => FEATURED.some((t) => test(t.showcase));
    const addon = (path) => import(`three/addons/${path}`).catch(() => null);
    const three = needs((s) => s.swayMask || s.model) ? import('three').catch(() => null) : null;
    const room = needs((s) => s.model) ? addon('environments/RoomEnvironment.js') : null;
    await Promise.all([preloadStage(root, preloads), fonts, three, room]);
    if (!alive) return;

    context.add(() => {
      const per = isDesktop ? STAGE.pinPerTreatment.desktop : STAGE.pinPerTreatment.mobile;
      // One scrubbed driver covers the approach and the pin. Its first part
      // (the stage scrolling into view) plays the first entrance, up to
      // `intro`; the pinned part plays the rest of the timeline.
      const intro = STAGE.enterEnd * STAGE.segment;
      let k = 0; // share of the driver's scroll taken by the approach
      const toTime = (p) => (p <= k ? (p / k) * intro : intro + ((p - k) / (1 - k)) * (end - intro));
      const toProgress = (time) => (time <= intro ? (time / intro) * k : k + ((time - intro) / (end - intro)) * (1 - k));
      const proxy = { p: 0 };
      const driver = gsap.to(proxy, { p: 1, duration: 1, ease: 'none', paused: true, onUpdate: () => tl.time(toTime(proxy.p)) });

      const pin = ScrollTrigger.create({
        trigger: root,
        start: 'top top',
        end: () => `+=${per * FEATURED.length}%`,
        pin: true,
        anticipatePin: 1,
        refreshPriority: 2,
      });
      const st = ScrollTrigger.create({
        trigger: root,
        start: `top ${STAGE.approach * 100}%`,
        end: () => pin.end,
        scrub: 1,
        animation: driver,
        refreshPriority: 1,
        onRefresh: (self) => {
          k = (pin.start - self.start) / Math.max(1, self.end - self.start);
          resync();
        },
      });
      const labelScroll = (id) => st.start + toProgress(tl.labels[id]) * (st.end - st.start);
      // ids: every rest point; anchors: the ids that are this stage's own page
      // anchors (a standalone item's anchor is its entry further down).
      const ids = FEATURED.map((t) => t.id);
      const anchors = FEATURED.filter((t) => !t.standalone).map((t) => t.id);
      stage = { st, pin, tl, ids, anchors, labelScroll };
    });
    ScrollTrigger.refresh();
    // The pin just made the page taller; let Lenis re-measure before any jump.
    if (lenis) lenis.resize();
    jumpToHash();
  })();

  return () => {
    alive = false;
    stage = null;
    onScreen.disconnect();
    stageOnScreen = true;
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
