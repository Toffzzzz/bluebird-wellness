/* ==========================================================================
   Bluebird Wellness: page script

   1. TREATMENT VISUALS   ← the featured treatments' order, pictures and tints
   2. Rendering (the featured treatments, the "All treatments" cards, the
      standalone section)
   3. The featured treatments: Apple-style sections, each with a short video
      that follows the scroll on laptops and plays by itself on phones
   4. In-page links, the header and the gentle reveals
   The page scrolls natively everywhere: no scroll library, no snapping, and
   no animation libraries.
   ========================================================================== */

/* ==========================================================================
   1. TREATMENT VISUALS

   Names, prices and every word of treatment copy come from the clinic's
   menu, data/drips.json, through data/menu.js (window.MENU). That file is
   written by scripts/build-menu.mjs, which also builds a page per drip
   (treatments/<slug>/). Edit the menu there and run the script; nothing
   here repeats it. The booking link comes from site-config.js.

   TREATMENTS holds the featured treatments' pictures and tints, and the
   menuSlug that links each one to its drip in the menu. Its order is the
   order of the featured sections and their bar of names. Each one's video
   is images/treatment-videos/<id>-*.mp4 (see section 3). The generator reads
   the image, alt, tint and badge of each entry for the treatment pages and
   the "All treatments" cards, so run it after changing them.
   The scene fields (showcase.scene, layers, frames, …, length,
   mobileSeconds) describe the scroll animations the videos were rendered
   from: scripts/render-videos/ re-renders them from the commit tagged
   stage-animations. The site itself only reads showcase.tint.
   Fields:
     id           Unique, lowercase, no spaces. Also its section's page anchor
                  (e.g. #iron) and its videos' file names.
     menuSlug     The drip's slug in data/drips.json: its name and price are
                  shown here, and "Learn more" opens treatments/<slug>/.
     standalone   Instead of a menuSlug, for an item in the menu's
                  standalone section: { row, entry }. The name and price come
                  from that row of its price table; "Learn more" goes to its
                  entry in the standalone section, which takes this id as
                  its anchor.
     short        Short label for the bar of names above the featured sections.
     image        Path to the image, e.g. "images/iron.webp". Leave as null to
                  show the soft placeholder shape instead.
     imageSize    [width, height] of the image in pixels (keeps the layout steady).
     imageFit     Optional. "cover" for a full photo (not a cut-out).
     alt          Plain description of the image for screen readers (no claims).
     placeholder  Shown when there is no image: { shape, colour }
                  shape: "drop" | "circle" | "pill" | "blob" | "arch"
     badge        Optional small label, e.g. { text: "…", variant: "sky" | "sage" }
     length       Optional. How long its part of the stage is, relative to the
                  others (default 1): 1.5 gives it half as much scroll again.
                  Its entrance and exit keep the normal length, so every
                  handover matches; only the part in between is stretched.
     mobileSeconds Optional. On phones, how many seconds its scene takes to
                  play on to its rest once its section has come to rest
                  (default REELS.seconds).
     showcase     The treatment's part of the pinned scroll stage:
                    scene:       which animation (see section 4):
                                 "runner" | "orange" | "float" | "coconut" |
                                 "cucumber" | "molecule" | "plant" | "wipe" |
                                 "pearl" | "sunrise" | "frames" | "bone" |
                                 "blend" | "signature"
                                 (anything else fades in/out)
                    tint:        its section's background colour (the videos are
                                 rendered on it; re-render them if it changes)
                                 (also the soft background of its page)
                    layers:      ("orange", "plant", "cucumber", "pearl",
                                 "sunrise", "bone", "blend") layer images on the
                                 image's canvas (the sparkles have their own);
                                 ("coconut") layers on their own 1000 × 1056
                                 canvas; ("signature") the card (on the frames'
                                 canvas), the pen and its shadow
                    swayMask:    ("wipe") greyscale mask: white hair sways, black never moves
                    frames:      ("frames", "signature") { path, count, size } image sequence
                                 (phoneStep: on phones, only every nth frame)
                    model:       ("molecule") V2000 SDF file for the 3D glass molecule
                    box:         ("molecule") [width, height] of the 3D view on the stage
                                 (the finished picture itself is square)
                    spin:        ("molecule") on phones, the molecule's turn pre-rendered
                                 as a looping image sequence (scripts/render-assets.mjs)
                    swayFrames:  ("wipe") on phones, the hair's sway pre-rendered from
                                 −1 to +1 (the same script)
                    penPath:     ("signature") JSON with the nib's position on every frame
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
    id: 'myers',
    menuSlug: 'myers-cocktail-infusion',
    short: 'Myers',
    length: 1.5, // more scroll, so the pour is unhurried
    mobileSeconds: 2.6,
    image: 'images/treatments/myers-cocktail-infusion.webp',
    imageSize: [1200, 920],
    alt: 'Two small glass bottles above a round glass flask filled with golden liquid',
    showcase: {
      scene: 'blend',
      tint: '#F3F1EE',
      // [before, after] of each part: bottles full → empty, flask empty → full
      layers: {
        flask: ['images/myers/myers-flask-a.webp', 'images/myers/myers-flask-b.webp'],
        left: ['images/myers/myers-left-a.webp', 'images/myers/myers-left-b.webp'],
        right: ['images/myers/myers-right-a.webp', 'images/myers/myers-right-b.webp'],
      },
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
    image: 'images/treatments/nad-plus-infusion.webp', // rendered from the stage's 3D scene
    imageSize: [1200, 1200],
    alt: 'A glass model of a molecule, with clear spheres joined by rods',
    showcase: {
      scene: 'molecule',
      tint: '#F2F2F7',
      box: [800, 730], // the 3D view's proportions on the stage
      model: 'models/nad.sdf',
      spin: { path: 'images/nad-spin/nad-{n}.webp', count: 36, size: [720, 720] },
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
    image: 'images/treatments/recovery-infusion.webp',
    imageSize: [1000, 1000],
    alt: 'A glowing sun',
    showcase: {
      scene: 'sunrise',
      tint: '#F7F2EC',
      layers: {
        night: 'images/recovery/ball-night.webp',
        gold: 'images/recovery/ball-gold.webp',
        sun: 'images/recovery/sun.webp',
        sparkleCool: 'images/recovery/sparkle-cool.webp', // 256 × 256
        sparkleWarm: 'images/recovery/sparkle-warm.webp', // 256 × 256
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
    image: 'images/treatments/beauty-and-glow-infusion.webp',
    imageSize: [900, 800],
    imageFit: 'cover',
    alt: 'A pearl resting in an open seashell',
    showcase: {
      scene: 'pearl',
      tint: '#F8EFEA',
      layers: {
        closedBase: 'images/skin/shell-closed-base.webp',
        openBase: 'images/skin/shell-open-base.webp',
        closedLid: 'images/skin/shell-closed-lid.webp',
        openLid: 'images/skin/shell-open-lid.webp',
        pearl: 'images/skin/shell-pearl.webp',
        sparkle: 'images/skin/sparkle-pearl.webp', // 256 × 256
      },
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
      swayFrames: { path: 'images/hair-sway/hair-{n}.webp', count: 17, size: [720, 1024] },
    },
  },
  {
    id: 'signature',
    menuSlug: 'signature-infusion',
    short: 'Signature',
    mobileSeconds: 2.6,
    image: 'images/treatments/signature-infusion.webp',
    imageSize: [1556, 795],
    alt: 'A fountain pen beside a card with the Bluebird Wellness bird drawn in blue ink',
    showcase: {
      scene: 'signature',
      tint: '#F7F2EA',
      layers: {
        card: 'images/signature/signature-card.webp',
        pen: 'images/signature/signature-pen.webp',
        penShadow: 'images/signature/signature-pen-shadow.webp',
      },
      frames: { path: 'images/signature/signature-{n}.webp', count: 72, size: [1336, 800], phoneStep: 2 },
      penPath: 'images/signature/signature-path.json',
    },
  },
];

/* ==========================================================================
   2. Rendering

   Every name, price and line of treatment copy comes from window.MENU
   (data/menu.js) and is escaped as text. Elements that show a menu string
   carry data-verbatim with its path in data/drips.json, so the generator's
   check (scripts/build-menu.mjs) can compare them word for word.
   ========================================================================== */

const MENU = window.MENU || null;
// Picture, tint and badge per drip, resolved by the generator from TREATMENTS.
const MENU_VISUALS = window.MENU_VISUALS || {};
// The booking link (site-config.js); until there is one, Book goes to the
// booking and contact section.
const BOOK_URL = (window.SITE && window.SITE.bookingUrl) || '#book';

const esc = (value) =>
  String(value).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

// "\n\n" in a menu string is a paragraph break.
const parasHTML = (text) => String(text).split('\n\n').map((p) => `<p>${esc(p)}</p>`).join('\n');

const dripBySlug = (slug) => (MENU ? MENU.drips.find((d) => d.slug === slug) : null) || null;

// What a featured treatment shows: its drip on the menu, or its row of the
// standalone price table. Null if the menu doesn't have it.
function menuItem(t) {
  if (t.menuSlug) {
    const drip = dripBySlug(t.menuSlug);
    if (!drip) return null;
    const at = `drips.${drip.slug}`;
    return { drip, name: drip.name, price: drip.priceLabel, href: `treatments/${drip.slug}/`, namePath: `${at}.name`, pricePath: `${at}.priceLabel` };
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
  `<a class="btn btn--primary" href="${esc(BOOK_URL)}" data-book data-book-item="${esc(name)}">Book<span class="visually-hidden"> ${esc(name)}</span></a>`;

const learnMoreHTML = (m) =>
  `<a class="btn btn--secondary" href="${esc(m.href)}">Learn more<span class="visually-hidden"> about ${esc(m.name)}</span></a>`;

// A drip's Pro version, if it has one.
const proOf = (drip) => (drip && drip.proVariantSlug ? dripBySlug(drip.proVariantSlug) : null);

// "PRO" beside a Pro drip's name. The name already says Pro, so screen readers skip it.
const PRO_BADGE = '<span class="pro-badge" aria-hidden="true">Pro</span>';

// "Upgrade to Pro" beside a standard drip's price, linking to its Pro version.
const UPGRADE_ARROW = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3.5 8h9M8.5 4l4 4-4 4"/></svg>';
const proChipHTML = (pro, extra = '') => (pro
  ? `<a class="pro-chip${extra}" href="treatments/${esc(pro.slug)}/" aria-label="Upgrade to Pro: ${esc(pro.name)}, ${esc(pro.priceLabel)}">Upgrade to Pro${UPGRADE_ARROW}</a>`
  : '');

// The price, with "Upgrade to Pro" beside it when the drip has a Pro version.
function priceRowHTML(drip, label, path) {
  const chip = proChipHTML(proOf(drip));
  return chip ? `<div class="price-row">${priceHTML(label, path)}${chip}</div>` : priceHTML(label, path);
}

const placeholderHTML = (t, extra = '') =>
  `<span class="placeholder placeholder--${esc(t.placeholder?.shape || 'circle')}${extra}" style="--ph: ${esc(t.placeholder?.colour || '#E8EFFB')}" aria-hidden="true"></span>`;

// Names this long get a slightly smaller title, so they wrap onto two
// lines rather than three.
const LONG_TITLE = 20;

function textHTML(t, titleId) {
  const m = menuItem(t);
  const long = m.name.length > LONG_TITLE ? ' treatment-title--long' : '';
  return `
    <p class="eyebrow">IV therapy</p>
    <h2 class="treatment-title${long}" id="${titleId}" data-verbatim="${esc(m.namePath)}">${esc(m.name)}</h2>
    ${badgeHTML(t.badge)}
    <div class="treatment-actions">${bookHTML(m.name)}${learnMoreHTML(m)}${priceRowHTML(m.drip, m.price, m.pricePath)}</div>`;
}

// Share of the card's image well that a cut-out may fill (12% padding on each side).
const CARD_FILL = 0.76;

// The card is one link that already carries the drip's name, so its picture
// is decorative. A Pro drip's picture says "PRO" in its corner.
function cardMediaHTML(v, isPro, slug) {
  const pro = isPro ? '<span class="card__pro" aria-hidden="true">Pro</span>' : '';
  const cls = isPro ? ' card__media--pro' : '';
  // The line drawing (a Pro drip shows its standard version's), drawn as the card comes into view.
  const art = LINES && v.art && window.LINE_ART[v.art];
  if (art) return `<div class="card__media card__media--art${cls}" aria-hidden="true">${lineArtSVG(art, `card-clip-${esc(slug)}`, ' class="line-art" data-draw focusable="false"')}${pro}</div>`;
  if (!v.image) return `<div class="card__media${cls}" aria-hidden="true">${placeholderHTML(v)}${pro}</div>`;
  const [w, h] = v.imageSize;
  const img = `<img src="${esc(v.image)}" alt="" width="${w}" height="${h}" loading="lazy" decoding="async">`;

  // A full photo fills the well; it scales inside its rounded frame on hover.
  if (v.imageFit === 'cover') return `<div class="card__media card__media--photo${cls}">${img}${pro}</div>`;

  // A cut-out is contained in the padded area, with a soft ellipse shadow just
  // below where the image actually ends (tall, wide and square images differ).
  const shownW = CARD_FILL * Math.min(1, w / h);
  const shownH = CARD_FILL * Math.min(1, h / w);
  const bottom = ((1 - shownH) / 2) * 100;
  const shadow = `--shadow-w: ${(shownW * 70).toFixed(1)}%; --shadow-bottom: ${(bottom - 3).toFixed(1)}%`;
  return `<div class="card__media${cls}"><span class="card__shadow" style="${shadow}" aria-hidden="true"></span>${img}${pro}</div>`;
}

// One card per drip, in menu order (each Pro card straight after its
// standard version). The whole card links to the drip's page: its title's
// link covers the card, and the "Upgrade to Pro" link sits above that. A
// Pro card also says "PRO" on its picture, so it never looks like its
// standard version.
function cardHTML(drip) {
  const v = MENU_VISUALS[drip.slug] || {};
  const at = `drips.${drip.slug}`;
  const isPro = !!drip.baseVariantSlug;
  return `
    <article class="card${isPro ? ' card--pro' : ''}" data-card>
      ${cardMediaHTML(v, isPro, drip.slug)}
      <h3 class="card__title"><a class="card__link" href="treatments/${esc(drip.slug)}/"><span data-verbatim="${esc(at)}.name">${esc(drip.name)}</span></a>${isPro ? ` ${PRO_BADGE}` : ''}</h3>
      ${badgeHTML(v.badge)}
      ${proChipHTML(proOf(drip), ' card__upgrade')}
      <div class="card__action">
        ${priceHTML(drip.priceLabel, `${at}.priceLabel`)}
        <span class="btn btn--secondary btn--compact card__more" aria-hidden="true">Learn more</span>
      </div>
    </article>`;
}

// The menu's standalone infusions and injections: heading, intro, price table
// and one accordion entry per ingredient. An entry a featured treatment points
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
          <div class="standalone__entries" data-fade>
            <div class="accordion">${items}</div>
            <p class="standalone__glossary"><a class="link" href="ingredients/">Ingredient glossary</a></p>
          </div>
        </div>
      </div>
    </section>`;
}

// Featured treatments the menu has (all of them, unless data/menu.js is missing).
const FEATURED = TREATMENTS.filter((t) => t.showcase && menuItem(t));

function render() {
  if (!MENU) return;
  const stageRoot = document.getElementById('stage-root');
  const gridRoot = document.getElementById('treatment-grid');
  const standaloneRoot = document.getElementById('standalone-root');
  // The featured treatments: the bar of names and a section each.
  if (stageRoot && FEATURED.length) stageRoot.innerHTML = treatmentsHTML(FEATURED);
  if (gridRoot) {
    gridRoot.innerHTML = MENU.drips.map(cardHTML).join('');
    // The cards' line drawings draw themselves as they come into view (site.js).
    if (window.SiteDraw) window.SiteDraw.watch(gridRoot);
  }
  if (standaloneRoot && MENU.standalone) standaloneRoot.innerHTML = standaloneHTML(MENU.standalone);
}

/* ==========================================================================
   3. The featured treatments: Apple-style sections, each with a short video

   The treatments are ordinary sections in the page, one after another,
   scrolled natively (no smooth-scroll library, no snapping: the page never
   moves by itself). Each section's picture is a short pre-rendered video of
   its animation (images/treatment-videos/, made by scripts/render-videos/).

   Laptops and desktops (a mouse or trackpad, 820px and wider): scrolling
   drives the animation, while the page keeps scrolling continuously (nothing
   is pinned). It starts once the treatment's section fills most of the
   screen (its top within SCRUB.start of the space below the bar) and is at
   its end by the time the section's top has gone SCRUB.end above the bar;
   in between, the scroll sets how far it has got. The video itself plays
   towards that point (playing is smoother than jumping frame to frame),
   faster the further behind it is, gliding to a stop when it gets there
   (SCRUB.ease), and never faster than SCRUB.maxRate times its natural
   speed: scroll quickly and it catches up quickly but smoothly; stop
   part-way and it settles where the scroll put it. It only
   ever moves forwards: scrolling back up leaves it where it got to; once
   finished, or once its section has left the screen after it started, it
   stays finished. Arriving by a jump (the bar, Next, a link), it plays on
   by itself from where it is instead. The video (<id>-scrub.mp4: 30 fps, a
   keyframe every 4 frames) is only moved while its section is on screen.

   Phones and tablets (touch): each video plays by itself, from the start,
   once half of it is in view, and then stays on its last frame for good
   (coming back to it shows the finished picture). The round button in its
   corner pauses, plays or replays it (<id>-1080.mp4, or <id>-720.mp4 where
   that's already sharp).

   Everywhere:
   - videos load as their section comes within a screen of the viewport;
   - each video's background is its section's own tint, and the videos are
     tagged with the sRGB colour curve, so every browser draws the two the
     same; a soft frame of the tint over the picture's outer edge (styles.css)
     hides any last shade of difference, so no edge or box ever shows;
   - if a video can't play by itself (e.g. an iPhone in Low Power Mode), the
     section shows the finished picture and the button plays it; with
     reduced motion every section shows its finished picture (nothing moves
     with the scroll) and the button plays it on request;
   - a slim bar of the treatments' short names sticks under the header (like
     Apple's local nav): it shows where you are, jumps to any treatment, and
     its Next button goes on to the next one (after the last, to All
     treatments).
   ========================================================================== */

// The site's pictures (site-config.js: pictures): 'lines', the line drawings
// (data/line-art.js) everywhere: the featured treatments are one blue line
// drawn down the middle of the page as you scroll, and the cards (and the
// treatment pages) show the same drawings; or 'photos': the featured
// treatments' pre-rendered animations (images/treatment-videos/) and the
// photographic pictures.
const TX_STYLE = window.SITE && window.SITE.pictures === 'photos' ? 'videos' : 'lines';
const LINES = TX_STYLE === 'lines' && !!window.LINE_ART;

// A treatment's line drawing as an inline SVG. A filled shape (the logo) is
// revealed from the top down through a clip, whose id starts with idPrefix.
function lineArtSVG(art, idPrefix, attrs = '') {
  const clips = [];
  const paths = art.paths.map((p, k) => {
    const o = typeof p === 'string' ? { d: p } : p;
    const move = o.transform ? ` transform="${esc(o.transform)}"` : '';
    if (!o.fill) return `<path d="${esc(o.d)}"${move}/>`;
    const [x, y, w, h] = o.box;
    const id = `${idPrefix}-${k}`;
    clips.push(`<clipPath id="${id}"><rect x="${x}" y="${y}" width="${w}" height="${h}" data-h="${h}"/></clipPath>`);
    return `<path class="tx-art__fill" d="${esc(o.d)}"${move} clip-path="url(#${id})"/>`;
  }).join('');
  return `<svg viewBox="0 0 400 400"${attrs}><defs>${clips.join('')}</defs><g class="tx-art" data-top="${art.top}" data-bottom="${art.bottom}">${paths}</g></svg>`;
}

const TREATMENT_VIDEO = {
  dir: 'images/treatment-videos/',
  play: 0.5,      // phones: share of a video in view before it plays by itself
  sharp720: 760,  // phones: the 720 video where the picture needs at most this many device pixels
};

// Laptops and desktops: the animation follows the scroll.
const SCRUB = {
  query: '(min-width: 820px) and (hover: hover) and (pointer: fine)',
  start: 0.3,    // it starts when the section's top is this share of the visible space below the bar
  end: 0.2,      // and is at its end when the section's top has gone this share above the bar
  maxRate: 2,    // the fastest it ever plays: 2 = twice its natural speed
  ease: 0.25,    // how closely it follows the scroll: it catches up over about this many seconds
  minRate: 0.25, // the slowest it plays while catching up (so it glides to a stop)
};

const TX_ICON = {
  pause: '<svg viewBox="0 0 16 16" aria-hidden="true"><rect x="4" y="3" width="2.6" height="10" rx="1"/><rect x="9.4" y="3" width="2.6" height="10" rx="1"/></svg>',
  play: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M5 3.2v9.6a.6.6 0 0 0 .9.5l7.6-4.8a.6.6 0 0 0 0-1L5.9 2.7a.6.6 0 0 0-.9.5z"/></svg>',
  replay: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3.2 8a4.8 4.8 0 1 0 1.5-3.5"/><path d="M3 2.6v2.6h2.6"/></svg>',
  next: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 6l4 4 4-4"/></svg>',
};

// A featured treatment's anchor: its id (e.g. #iron), except for a
// standalone item, whose id belongs to its entry in the standalone section.
const txAnchor = (t) => (t.standalone ? `tx-${t.id}` : t.id);

// The bar of names, then one section per treatment: the video (or, without
// a video, the treatment's own picture) and the text.
function treatmentsHTML(featured) {
  const items = featured.map((t, i) => `
        <li><a class="tx-nav__item" href="#${esc(txAnchor(t))}" data-tx-go="${i}">${esc(t.short)}</a></li>`).join('');
  const nav = `
    <nav class="tx-nav" aria-label="Featured treatments">
      <div class="tx-nav__inner">
        <ol class="tx-nav__list">${items}
          <li><a class="tx-nav__item tx-nav__item--all" href="#treatments">All treatments</a></li>
        </ol>
        <a class="tx-nav__next" href="#${esc(txAnchor(featured[0]))}" data-tx-next aria-label="Next treatment">${TX_ICON.next}<span>Next</span></a>
      </div>
    </nav>`;

  const sections = featured.map((t, i) => {
    if (LINES && window.LINE_ART[t.id]) return lineSectionHTML(t, i);
    const base = `${TREATMENT_VIDEO.dir}${esc(t.id)}`;
    const name = esc(menuItem(t).name);
    return `
      <section class="tx" id="${esc(txAnchor(t))}" data-tx="${i}" style="--tint: ${esc(t.showcase.tint || '#F7F4EF')}" aria-labelledby="${esc(t.id)}-title">
        <div class="container tx__inner">
          <div class="tx__media">
            <div class="tx-media">
              <img class="tx-still" src="${base}-end.webp" alt="${esc(t.alt || '')}" width="1080" height="1080" loading="lazy" decoding="async">
              <video class="tx-video" data-base="${base}" muted playsinline webkit-playsinline preload="none" disablepictureinpicture disableremoteplayback role="img" aria-label="${esc(t.alt || '')}" tabindex="-1"></video>
              <button type="button" class="tx-control" data-name="${name}" hidden></button>
            </div>
          </div>
          <div class="tx__text">${textHTML(t, `${esc(t.id)}-title`)}</div>
        </div>
      </section>`;
  }).join('');

  return `${nav}
    <div class="tx-list">${sections}
    </div>`;
}

// The line drawings: a treatment's section is a column down the middle of
// the page: the line coming in from above, the drawing, then the line going
// on down. On laptops the text sits beside the drawing (left and right in
// turn); on phones it's a card under it, with the line running into the card
// and out of the bottom.
function lineSectionHTML(t, i) {
  const art = window.LINE_ART[t.id];
  return `
      <section class="tx tx--line tx--text-${i % 2 ? 'right' : 'left'}" id="${esc(txAnchor(t))}" data-tx="${i}" aria-labelledby="${esc(t.id)}-title">
        <div class="tx-line">
          <svg class="tx-line__svg" aria-hidden="true" focusable="false"><path data-seg="in"/><path data-seg="out"/><path data-seg="after"/></svg>
          <div class="tx-line__art" role="img" aria-label="${esc(art.alt)}">
            ${lineArtSVG(art, `tx-clip-${esc(t.id)}`, ' aria-hidden="true" focusable="false"')}
          </div>
          <div class="tx__text">${textHTML(t, `${esc(t.id)}-title`)}</div>
        </div>
      </section>`;
}

// The line drawings, drawn by the scroll. The "pen" is a little below the
// middle of the screen (LINE.pen): everything in a section above it is drawn, and as the page moves
// up the line comes down the middle, draws the treatment's picture from the
// top down, and carries on to the next. It only ever draws forwards: once
// drawn, a picture stays drawn when you scroll back up. Arriving by a jump
// (the bar, Next, a link), the picture draws itself. With reduced motion
// everything is shown already drawn.
const LINE = {
  pen: 0.66,      // where the pen is, as a share of the screen's height from the top (lower: drawings finish lower down, so they stay in view longer)
  follow: 0.1,    // seconds: how closely the drawing follows the scroll (a little smoothing)
  minRange: 28,   // px of scrolling over which even a level stroke (a base line) is drawn
  jump: 1.6,      // seconds a picture takes to draw itself after a jump
  width: 2.5,     // px: the line's thickness, the same everywhere
};

function initLines(items, animated) {
  const html = document.documentElement;
  html.classList.add('tx-lines');
  html.dataset.linePen = String(LINE.pen);
  const clamp = (v) => Math.min(1, Math.max(0, v));
  const ease = (u) => (u < 0.5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2);

  const secs = items.map((it) => {
    const section = it.section;
    const overlay = section.querySelector('.tx-line__svg');
    const art = section.querySelector('.tx-line__art');
    const g = art.querySelector('.tx-art');
    const strokes = [...g.querySelectorAll('path')].map((el) => ({
      el,
      clip: el.classList.contains('tx-art__fill') ? section.querySelector(`${el.getAttribute('clip-path').slice(4, -1)} rect`) : null,
      len: 0, y0: 0, y1: 0, reached: 0, shown: -1,
    }));
    const segs = [...overlay.querySelectorAll('[data-seg]')].map((el) => ({ el, seg: true, len: 0, y0: 0, y1: 0, reached: 0, shown: -1 }));
    return { it, section, overlay, art, g, text: section.querySelector('.tx__text'), top: Number(g.dataset.top), bottom: Number(g.dataset.bottom), parts: [...segs, ...strokes], auto: null, done: false };
  });

  // Where everything is, in each section's own coordinates (redone on resize).
  const layout = () => {
    for (const sec of secs) {
      const box = sec.section.getBoundingClientRect();
      const a = sec.art.getBoundingClientRect();
      const scale = a.width / 400;
      const cx = a.left - box.left + a.width / 2;
      const artTop = a.top - box.top;
      sec.overlay.setAttribute('viewBox', `0 0 ${box.width} ${box.height}`);
      sec.g.style.strokeWidth = String(LINE.width / scale);
      // Phones: the text is a card in the column; the line stops at it and starts again under it.
      // (Measured without the text's rise-in movement.)
      const card = getComputedStyle(sec.text).position !== 'absolute';
      const textTop = offsetWithin(sec.text, null).top - offsetWithin(sec.section, null).top;
      const lines = {
        in: [0, artTop + sec.top * scale],
        out: [artTop + sec.bottom * scale, card ? textTop : box.height],
        after: card ? [textTop + sec.text.offsetHeight, box.height] : null,
      };
      for (const p of sec.parts) {
        if (p.seg) {
          const span = lines[p.el.dataset.seg];
          p.el.setAttribute('d', span ? `M${cx.toFixed(1)} ${span[0].toFixed(1)} V${span[1].toFixed(1)}` : '');
          p.len = span ? Math.max(0, span[1] - span[0]) : 0;
          p.y0 = span ? span[0] : 0;
          p.y1 = span ? span[1] : 0;
        } else {
          const r = p.el.getBoundingClientRect();
          p.y0 = r.top - box.top;
          p.y1 = r.bottom - box.top;
          if (!p.clip) p.len = p.el.getTotalLength();
        }
        if (p.y1 - p.y0 < LINE.minRange) p.y1 = p.y0 + LINE.minRange;
        p.shown = -1; // draw it afresh at its new size
      }
    }
  };

  // Shows how much of a part is drawn (0 to 1).
  const draw = (p, v) => {
    if (p.shown === v) return;
    p.shown = v;
    if (p.clip) { p.clip.setAttribute('height', String(Number(p.clip.dataset.h) * v)); return; }
    if (!p.len) return;
    p.el.style.strokeDasharray = `${p.len} ${p.len + 2}`;
    p.el.style.strokeDashoffset = String(p.len * (1 - v));
    p.el.style.visibility = v > 0.001 ? 'visible' : 'hidden';
  };

  if (!animated) {
    layout();
    secs.forEach((sec) => sec.parts.forEach((p) => { p.reached = 1; draw(p, 1); }));
    const redo = () => { layout(); secs.forEach((sec) => sec.parts.forEach((p) => draw(p, 1))); };
    window.addEventListener('resize', redo, { passive: true });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(redo);
    return;
  }

  // A jump to a treatment: its picture draws itself.
  document.addEventListener('tx:arrive', (event) => {
    const sec = secs.find((x) => x.section === event.detail);
    if (sec && !sec.done) sec.auto = { start: performance.now(), from: null };
  });

  let ticking = false;
  let last = 0;
  const tick = (now) => {
    ticking = false;
    const dt = last ? Math.min(now - last, 50) / 1000 : 1 / 60;
    last = now;
    const k = 1 - Math.exp(-dt / LINE.follow);
    const pen = window.innerHeight * LINE.pen;
    let moving = false;
    for (const sec of secs) {
      if (sec.done) continue;
      const box = sec.section.getBoundingClientRect();
      // Below the screen: nothing yet.
      if (box.top > window.innerHeight) continue;
      // Gone by above the screen (e.g. after a jump past it): drawn.
      if (box.bottom < 0) {
        sec.parts.forEach((p) => { p.reached = 1; draw(p, 1); });
        sec.done = true;
        continue;
      }
      let at = pen - box.top;
      if (sec.auto) {
        if (sec.auto.from === null) sec.auto.from = at;
        const u = Math.min(1, (now - sec.auto.start) / (LINE.jump * 1000));
        at = Math.max(at, sec.auto.from + (box.height - sec.auto.from) * ease(u));
        if (u < 1) moving = true; else sec.auto = null;
      }
      let all = true;
      for (const p of sec.parts) {
        p.reached = Math.max(p.reached, clamp((at - p.y0) / (p.y1 - p.y0)));
        const from = Math.max(p.shown, 0);
        const v = p.reached - from < 0.002 ? p.reached : from + (p.reached - from) * k;
        draw(p, v);
        if (v < p.reached) moving = true;
        if (v < 1) all = false;
      }
      if (all) sec.done = true;
    }
    if (moving) wake();
  };
  function wake() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(tick);
  }

  layout();
  secs.forEach((sec) => sec.parts.forEach((p) => draw(p, 0)));
  wake();
  window.addEventListener('scroll', wake, { passive: true });
  const relayout = () => {
    layout();
    secs.forEach((sec) => sec.parts.forEach((p) => draw(p, Math.max(0, p.reached === 1 ? 1 : p.reached))));
    wake();
  };
  window.addEventListener('resize', relayout, { passive: true });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(relayout);
  window.addEventListener('load', relayout);
}

function initTreatments(animated) {
  const root = document.getElementById('stage-root');
  const sections = root ? [...root.querySelectorAll('.tx')] : [];
  if (!sections.length) return;
  const html = document.documentElement;
  const nav = root.querySelector('.tx-nav');
  const navItems = [...nav.querySelectorAll('[data-tx-go]')];
  const next = nav.querySelector('[data-tx-next]');
  const row = nav.querySelector('.tx-nav__list');
  const items = sections.map((section, i) => ({
    i,
    t: FEATURED[i],
    section,
    media: section.querySelector('.tx-media'),
    video: section.querySelector('.tx-video'),
    still: section.querySelector('.tx-still'),
    button: section.querySelector('.tx-control'),
    src: '',         // the video file it has been given
    armed: true,     // phones: it plays by itself when it is first half in view (once)
    done: false,     // it has reached its finished picture, and stays there
    reached: 0,      // laptops: how far through the animation the scroll has taken it (it never goes back)
    inView: false,
    held: false,     // phones: paused with the button, so no playing by itself until it has left the screen
    failed: false,   // the video can't be shown at all: the finished picture stays
    shown: 0,        // laptops: the time the video is being moved to (smoothed)
  }));

  if (LINES) initLines(items, animated);
  else {
    const scrubQuery = window.matchMedia(SCRUB.query);
    // Laptops with motion: the animation follows the scroll. Decided afresh if
    // the window crosses the breakpoint (e.g. a laptop window made narrow).
    let scrub = false;

    // Showing the finished picture instead of the video (reduced motion, a
    // video that can't play by itself, or one that can't load).
    const showStill = (it, still) => it.section.classList.toggle('is-still', still);

    const setButton = (it, state) => {
      if (!state) { it.button.hidden = true; it.button.removeAttribute('data-state'); return; }
      const verb = { pause: 'Pause', play: 'Play', replay: 'Replay' }[state];
      it.button.hidden = false;
      it.button.dataset.state = state;
      it.button.innerHTML = TX_ICON[state];
      it.button.setAttribute('aria-label', `${verb} the ${it.button.dataset.name} animation`);
    };

    // The file for the current behaviour: laptops scrub <id>-scrub.mp4;
    // phones play the 720 video where that's already sharp, else the 1080 one.
    const sourceFor = (it) => {
      const base = it.video.dataset.base;
      if (scrub) return `${base}-scrub.mp4`;
      const needed = it.media.getBoundingClientRect().width * (window.devicePixelRatio || 1);
      return `${base}-${needed > 0 && needed <= TREATMENT_VIDEO.sharp720 ? 720 : 1080}.mp4`;
    };

    items.forEach((it) => {
      const v = it.video;
      v.muted = true;
      v.defaultMuted = true;
      v.playsInline = true;
      v.addEventListener('loadeddata', () => { if (scrub) wake(); });
      v.addEventListener('playing', () => { showStill(it, false); if (!scrub) setButton(it, 'pause'); });
      // Paused part-way: the button plays it on; stopped as it left the screen
      // (showing its finished picture): the button replays it.
      v.addEventListener('pause', () => {
        if (scrub || v.ended) return;
        setButton(it, it.done && it.section.classList.contains('is-still') ? 'replay' : 'play');
      });
      v.addEventListener('ended', () => {
        it.done = true;
        if (scrub) { it.autoplaying = false; it.reached = 1; it.shown = v.currentTime; return; }
        setButton(it, 'replay');
      });
      // No video (e.g. a new treatment that hasn't been rendered yet): its
      // finished picture, or failing that the treatment's own picture.
      v.addEventListener('error', () => {
        if (!v.getAttribute('src')) return;
        it.failed = true;
        showStill(it, true);
        setButton(it, null);
        it.still.addEventListener('error', () => {
          if (it.t.image && !it.still.src.endsWith(it.t.image)) it.still.src = it.t.image;
        }, { once: true });
      });
    });

    const load = (it) => {
      if (it.failed) return;
      const src = sourceFor(it);
      if (it.src === src) return;
      it.src = src;
      const v = it.video;
      v.poster = `${v.dataset.base}-start.webp`;
      v.preload = 'auto';
      v.src = src;
      v.load();
    };

    const play = (it, fromStart) => {
      if (it.failed) return;
      load(it);
      const v = it.video;
      if (fromStart) {
        try { v.currentTime = 0; } catch (e) { /* not loaded yet: it starts at 0 anyway */ }
      }
      const attempt = v.play();
      if (attempt && attempt.catch) {
        attempt.catch(() => {
          // Not allowed to play by itself: the finished picture, with the button to play it.
          if (v.paused) { showStill(it, true); setButton(it, 'play'); }
        });
      }
    };

    items.forEach((it) => it.button.addEventListener('click', () => {
      const v = it.video;
      if (it.button.dataset.state === 'pause') {
        it.held = true;
        v.pause();
        return;
      }
      it.held = false;
      it.armed = false;
      showStill(it, false);
      play(it, v.ended || it.button.dataset.state === 'replay' || v.currentTime === 0);
    }));

    /* Laptops: the video follows the scroll. */
    let below = 0; // the bottom of the header and the bar: the screen's visible space starts here
    const header = document.getElementById('site-header');
    const measure = () => { below = (header ? header.offsetHeight : 0) + nav.offsetHeight; };
    // 0 until the section fills most of the screen, 1 once it has moved on a little past the bar.
    const progress = (it) => {
      const top = it.section.getBoundingClientRect().top;
      const space = window.innerHeight - below;
      const from = below + space * SCRUB.start;
      const to = below - space * SCRUB.end;
      return Math.min(1, Math.max(0, (from - top) / (from - to)));
    };
    // A jump (the bar, Next, a link) to a treatment that hasn't finished: it
    // plays on by itself from where it is, rather than leaping to where the
    // scroll would put it.
    document.addEventListener('tx:arrive', (event) => {
      const it = items.find((x) => x.section === event.detail);
      if (it && scrub && !it.done) it.jumped = true;
    });
    let ticking = false;
    let lastTick = 0;
    const tick = (now) => {
      ticking = false;
      if (!scrub) return;
      const elapsed = lastTick ? Math.min(now - lastTick, 50) : 16.7;
      lastTick = now;
      let moving = false;
      for (const it of items) {
        if (!it.inView || it.failed) continue;
        const v = it.video;
        if (v.readyState < 1 || !v.duration) continue;
        const end = Math.max(0, v.duration - 0.001);
        // Arrived by a jump: play on from where it is, at its natural speed (once it ends, it's done).
        if (it.jumped) {
          it.jumped = false;
          it.autoplaying = true;
          v.playbackRate = 1;
          const attempt = v.play();
          if (attempt && attempt.catch) attempt.catch(() => { it.autoplaying = false; it.reached = 1; it.done = true; });
          continue;
        }
        if (it.autoplaying) continue;
        // Only forwards: scrolling back up leaves it where it got to.
        it.reached = Math.max(it.reached, progress(it));
        const target = it.reached * end;
        // Come into view already past its end (e.g. scrolling up into it): its finished picture.
        if (it.snap) {
          it.snap = false;
          if (it.reached >= 1 && v.currentTime < end) { v.pause(); v.currentTime = end; it.shown = end; it.done = true; continue; }
        }
        const at = v.currentTime;
        it.shown = at;
        if (at >= end) { it.done = true; if (!v.paused) v.pause(); continue; }
        const gap = target - at;
        // Faster the further behind it is, slower as it arrives, within its limits.
        const rate = Math.min(SCRUB.maxRate, Math.max(SCRUB.minRate, gap / SCRUB.ease));
        if (!it.seekOnly) {
          // Playing towards the scroll: start once it's a frame or so behind, stop once it's there.
          if (gap > (v.paused ? 0.04 : 0.008)) {
            if (Math.abs(v.playbackRate - rate) > rate * 0.08) v.playbackRate = rate;
            if (v.paused) {
              const attempt = v.play();
              // Not allowed to play: it moves frame by frame instead.
              if (attempt && attempt.catch) attempt.catch(() => { it.seekOnly = true; wake(); });
            }
            moving = true;
          } else if (!v.paused) v.pause();
          continue;
        }
        // Frame by frame (only if playing isn't allowed): the same pace, one seek at a time.
        if (gap <= 0.008) continue;
        moving = true;
        if (v.seeking) continue;
        v.currentTime = Math.min(target, at + Math.max(rate * (elapsed / 1000), 0.012));
      }
      if (moving) wake();
    };
    function wake() {
      if (ticking || !scrub) return;
      ticking = true;
      requestAnimationFrame(tick);
    }
    window.addEventListener('scroll', () => { if (scrub) wake(); }, { passive: true });
    window.addEventListener('resize', () => { if (scrub) { measure(); wake(); } }, { passive: true });

    /* Loading ahead (a screen below the viewport). */
    const near = new IntersectionObserver((entries) => {
      for (const e of entries) {
        const it = items[Number(e.target.dataset.txIndex)];
        it.near = e.isIntersecting;
        if (e.isIntersecting && animated) load(it);
      }
    }, { rootMargin: '100% 0px 100% 0px' });

    /* On screen: laptops follow the scroll; phones play once half in view. */
    const seen = new IntersectionObserver((entries) => {
      for (const e of entries) {
        const it = items[Number(e.target.dataset.txIndex)];
        if (!e.isIntersecting) {
          it.inView = false;
          // Phones: one that leaves the screen while it's still playing stops,
          // and its finished picture (the -end image) takes its place, so
          // nothing is decoded off screen and it's finished when you come back.
          // Laptops: likewise one that had started (by the scroll or a jump).
          const v = it.video;
          if (scrub && !it.done && (it.shown > 0 || it.autoplaying)) {
            if (!v.paused) v.pause();
            it.autoplaying = false;
            it.done = true;
            it.reached = 1;
            showStill(it, true);
            continue;
          }
          if (!scrub && !v.paused && !it.held) {
            v.pause();
            it.done = true;
            showStill(it, true);
            setButton(it, 'replay');
          }
          continue;
        }
        if (!it.inView) it.snap = true;
        it.inView = true;
        if (scrub) { wake(); continue; }
        if (animated && it.armed && !it.held && e.intersectionRatio >= TREATMENT_VIDEO.play) {
          it.armed = false;
          play(it, true);
        }
      }
    }, { threshold: [0, TREATMENT_VIDEO.play, 1] });

    items.forEach((it) => {
      it.media.dataset.txIndex = it.i;
      seen.observe(it.media);
      near.observe(it.media);
    });

    // Choosing the behaviour (and again if the window crosses the breakpoint).
    const setMode = () => {
      scrub = animated && scrubQuery.matches;
      html.classList.toggle('tx-scrub', scrub);
      for (const it of items) {
        const v = it.video;
        it.held = false;
        it.jumped = false;
        it.autoplaying = false;
        it.seekOnly = false;
        if (!v.paused) v.pause();
        v.playbackRate = 1;
        if (!animated) { showStill(it, true); setButton(it, 'play'); continue; }
        if (it.failed) continue;
        // A finished one stays finished: on a laptop the scroll can't take it
        // back; on a phone its finished picture shows, with the replay button.
        it.armed = !it.done;
        it.reached = it.done ? 1 : 0;
        it.shown = 0;
        showStill(it, it.done);
        setButton(it, scrub ? null : (it.done ? 'replay' : (it.src ? 'play' : null)));
        if (it.src) { it.src = ''; if (it.near) load(it); }
      }
      if (scrub) { measure(); wake(); }
    };
    setMode();
    if (scrubQuery.addEventListener) scrubQuery.addEventListener('change', setMode);

  }

  /* Which treatment is current: the one across the middle of the screen. */
  let current = -1;
  const showCurrent = (i) => {
    if (i === current) return;
    current = i;
    navItems.forEach((a, k) => {
      a.classList.toggle('is-active', k === i);
      if (k === i) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');
    });
    // Next: the treatment after this one; after the last, All treatments.
    const after = items[i + 1];
    next.setAttribute('href', after ? `#${txAnchor(after.t)}` : '#treatments');
    next.setAttribute('aria-label', after ? `Next treatment: ${menuItem(after.t).name}` : 'All treatments');
    // Keep the current name in view in the bar (only the bar scrolls).
    const a = navItems[i];
    if (a && row.scrollWidth > row.clientWidth) {
      const left = a.offsetLeft - (row.clientWidth - a.offsetWidth) / 2;
      row.scrollTo({ left, behavior: animated ? 'smooth' : 'auto' });
    }
  };
  const middle = new IntersectionObserver((entries) => {
    for (const e of entries) if (e.isIntersecting) showCurrent(Number(e.target.dataset.tx));
  }, { rootMargin: '-50% 0px -50% 0px' });
  items.forEach((it) => middle.observe(it.section));
  showCurrent(0);

  /* The text rises gently into place as each section arrives. */
  if (animated) {
    const rise = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        e.target.classList.add('is-in');
        rise.unobserve(e.target);
      }
    }, { rootMargin: '0px 0px -12% 0px' });
    items.forEach((it) => {
      const text = it.section.querySelector('.tx__text');
      text.classList.add('tx-rise');
      rise.observe(text);
    });
  }

  html.classList.add('has-tx');
}

/* ==========================================================================
   4. In-page links, the header and the gentle reveals
   ========================================================================== */

// Header gains its divider once the page has scrolled.
function initHeader() {
  const header = document.getElementById('site-header');
  if (!header) return;
  let scrolled = null;
  const update = () => {
    const now = window.scrollY > 8;
    if (now === scrolled) return;
    scrolled = now;
    header.classList.toggle('is-scrolled', now);
  };
  update();
  window.addEventListener('scroll', update, { passive: true });
}

// Offset of an element inside an ancestor, ignoring transforms.
function offsetWithin(el, ancestor) {
  let left = 0, top = 0;
  for (let node = el; node && node !== ancestor; node = node.offsetParent) {
    left += node.offsetLeft;
    top += node.offsetTop;
  }
  return { left, top };
}

// An anchor on a closed <details> (e.g. #vitamin-d in the standalone
// section) opens it. Returns whether the target is one.
function openTarget(target) {
  if (!target || target.tagName !== 'DETAILS') return false;
  target.open = true;
  return true;
}

// Where to scroll so an accordion entry sits just below the fixed header.
function entryScroll(target) {
  const header = document.getElementById('site-header');
  return offsetWithin(target, null).top - (header ? header.offsetHeight : 0) - 24;
}

const reduceMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Going to an in-page target. A nearby one (within about a screen and a
// half) glides there with the browser's own smooth scrolling; anything
// further away is a straight jump, so the page never streams through every
// treatment on the way (as Apple's pages do). The target's scroll-margin
// and the page's scroll-padding keep it clear of the header and the bar.
function goTo(target, { instant = false } = {}) {
  const isEntry = openTarget(target);
  // A featured treatment: on laptops its animation plays on by itself (see section 3).
  if (target.classList && target.classList.contains('tx')) document.dispatchEvent(new CustomEvent('tx:arrive', { detail: target }));
  const distance = Math.abs(isEntry ? entryScroll(target) - window.scrollY : target.getBoundingClientRect().top);
  const behavior = instant || reduceMotion() || distance > window.innerHeight * 1.5 ? 'auto' : 'smooth';
  if (isEntry) window.scrollTo({ top: entryScroll(target), behavior });
  else target.scrollIntoView({ block: 'start', behavior });
}

// Every in-page link on the home page ("Treatments", "Book now", the bar
// of names, Next…) goes through goTo. Bare "#" links are booking placeholders.
function initAnchors() {
  document.documentElement.classList.add('js-jumps');
  document.addEventListener('click', (event) => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const link = event.target.closest('a[href^="#"]');
    // The skip link keeps the browser's own behaviour (it moves the focus too).
    if (!link || link.classList.contains('skip-link')) return;
    const hash = link.getAttribute('href');
    event.preventDefault();
    if (hash === '#') return;
    const id = decodeURIComponent(hash.slice(1));
    const target = id === 'top' ? document.getElementById('top') || document.body : document.getElementById(id);
    if (!target) return;
    if (id === 'top') window.scrollTo({ top: 0, behavior: reduceMotion() || window.scrollY > window.innerHeight * 1.5 ? 'auto' : 'smooth' });
    else goTo(target);
    // The address stays the plain home page (no #section), so opening or
    // reloading it always starts at the top.
  });
  initStart();
}

// Where the home page starts. Opening the site (from a link, a bookmark or
// by typing it) or reloading it always starts at the top, never where the
// browser last was or at a #section left in the address. Two exceptions:
// arriving from one of the site's own pages by a link to a section (e.g. a
// treatment page's "Back to all treatments") goes to that section, and
// going Back or Forward to the home page returns to where you were on it.
// Either way the address is then left as the plain home page.
function initStart() {
  if (!history.replaceState || !window.scrollTo) return;
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  const perf = window.performance;
  const entry = perf && perf.getEntriesByType ? perf.getEntriesByType('navigation')[0] : null;
  const type = entry ? entry.type : 'navigate';
  let fromHere = false;
  try { fromHere = !!document.referrer && new URL(document.referrer).origin === location.origin; } catch (e) { /* no referrer */ }
  const saved = history.state && typeof history.state.y === 'number' ? history.state.y : null;
  const target = location.hash ? document.getElementById(decodeURIComponent(location.hash.slice(1))) : null;
  if (location.hash) history.replaceState(history.state, '', location.pathname + location.search);

  // Remember where you are in this history entry (for Back and Forward), not on the device.
  let timer = 0;
  window.addEventListener('scroll', () => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      try { history.replaceState({ ...(history.state || {}), y: Math.round(window.scrollY) }, ''); } catch (e) { /* the browser limits how often; the next pause tries again */ }
    }, 400);
  }, { passive: true });

  let go;
  if (type === 'back_forward' && saved !== null) go = () => window.scrollTo(0, saved);
  else if (target && type === 'navigate' && fromHere) go = () => goTo(target, { instant: true });
  else go = () => window.scrollTo(0, 0);
  go();
  // The fonts and pictures can move things a little: settle again once they've loaded.
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => go());
  window.addEventListener('load', () => go(), { once: true });
  // Once the visitor scrolls themselves, they're in charge.
  const stop = () => { go = () => {}; };
  ['wheel', 'touchstart', 'keydown', 'mousedown'].forEach((e) => window.addEventListener(e, stop, { once: true, passive: true }));
}

// Each block below the hero (headings, cards, tiles) rises gently as it
// scrolls into view, once: CSS transitions started by an
// IntersectionObserver (the hero's own entrance is pure CSS). On phones the
// rise is shorter and the cards are simply there, ready to scan.
function initReveals() {
  if (reduceMotion() || !('IntersectionObserver' in window)) return;
  const phone = window.matchMedia('(max-width: 819.98px)').matches;
  const targets = [...document.querySelectorAll(phone ? '[data-fade]' : '[data-fade], [data-card]')];
  const stagger = phone ? 30 : 70;
  const io = new IntersectionObserver((entries) => {
    let k = 0;
    for (const e of entries) {
      if (!e.isIntersecting) continue;
      const el = e.target;
      el.style.transitionDelay = `${Math.min(k++, 6) * stagger}ms`;
      el.classList.add('is-in');
      io.unobserve(el);
      // Once it has risen, hovering (a card's lift) responds straight away.
      el.addEventListener('transitionend', () => { el.style.transitionDelay = ''; }, { once: true });
    }
  }, { rootMargin: '0px 0px -12% 0px' });
  targets.forEach((el) => { el.classList.add('reveal'); io.observe(el); });
}

/* ---------- Start ---------- */

render();
initHeader();
initTreatments(!reduceMotion());
initAnchors();
initReveals();

const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();
