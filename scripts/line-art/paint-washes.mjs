#!/usr/bin/env node
/* Bluebird Wellness: the watercolour washes behind the line drawings.

   Once a drawing has been drawn, a splash of its own colours (the orange's
   orange, the leaves' green…) spreads out behind the lines, like
   watercolour: filling the drawing's own shapes, loosely and a little past
   their outlines, darker where the paint pooled at the edges, with uneven
   pigment and the grain of the paper.

   This script paints those washes. For each drawing (data/line-art.js) it
   colours the parts listed below, in the drawing's own 400 x 400 box:
     - at: [x, y]  the closed shape of the drawing around that point (found
                   by filling outwards from it, up to the drawing's lines),
                   spread a little under the lines;
     - shape:      a loose shape of its own (SVG), for parts the lines don't
                   close (a face, hair, the sky);
     - art: n      the drawing's own filled shape number n (the logo);
     - within / without: a shape to keep the colour inside, or out of;
     - drop: [x, y, r]  a small drop of paint beside the drawing.
   Then it turns them into watercolour (rippled, soft edges, a darker rim,
   uneven pigment, paper grain) and saves images/washes/<drawing>.webp,
   covering the box plus 40 on every side (-40 to 440). It also paints
   images/washes/splat.webp: the ragged splash the colour is revealed
   through as it spreads (site.js).

   Run it after changing a wash (from the repo's folder):
     npm install --no-save playwright && npx playwright install chromium
     node scripts/line-art/paint-washes.mjs
   then python3 scripts/line-art/make-line-art.py (it adds each wash to
   data/line-art.js) and node scripts/build-menu.mjs. */

import { readFileSync } from 'node:fs';
import { writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import vm from 'node:vm';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const OUT = path.join(ROOT, 'images', 'washes');
const SIZE = 720; // px: the picture covers the 480 x 480 box (-40 to 440)

const SKIN = '#f1c3a1';
const LEAF = '#5d8a4a';
const ORANGE = '#e98b2e';
const WASHES = {
  hydration: [
    { at: [207, 269], colour: '#a7743f', a: 0.58 },    // the coconut's shell
    { at: [194, 192], colour: '#efe1bd', a: 0.7 },     // its white rim
    { at: [194, 163], colour: '#e9dcb8', a: 0.55 },    // inside
    { at: [113, 98], colour: '#d9604f', a: 0.6 },      // the umbrella
    { at: [140, 86], colour: '#e8bd55', a: 0.6 },
    { at: [160, 74], colour: '#d9604f', a: 0.6 },
    { at: [86, 110], colour: '#e8bd55', a: 0.55 },
    { at: [200, 113], colour: '#6aaed0', a: 0.65 },    // the drop
    { at: [260, 105], colour: '#e2909b', a: 0.55 },    // the straw
    { at: [53, 262], colour: LEAF, a: 0.6 },           // the leaf
    { at: [118, 276], colour: '#f5c3cf', a: 0.65 },    // the flower's petals
    { at: [148, 297], colour: '#f5c3cf', a: 0.65 },
    { at: [86, 298], colour: '#f5c3cf', a: 0.65 },
    { at: [136, 333], colour: '#f5c3cf', a: 0.65 },
    { at: [94, 331], colour: '#f5c3cf', a: 0.65 },
    { shape: '<circle cx="117" cy="303" r="9"/>', colour: '#e8bd55', a: 0.6 }, // its centre
    { drop: [40, 205, 3.5], colour: '#6aaed0' }, { drop: [318, 330, 3], colour: '#a7743f' }, { drop: [292, 165, 2.5], colour: '#e2909b' },
  ],
  energy: [
    { at: [202, 50], colour: SKIN, a: 0.45 },          // her face
    { at: [202, 50], within: '<ellipse cx="192" cy="30" rx="26" ry="16"/>', colour: '#8a5a3b', a: 0.5 }, // her hair
    { at: [156, 44], colour: '#8a5a3b', a: 0.55 },     // her ponytail
    { at: [144, 114], colour: SKIN, a: 0.45 },         // her arms
    { at: [253, 137], colour: SKIN, a: 0.45 },
    { at: [202, 140], colour: '#de8573', a: 0.55 },    // her top
    { at: [181, 235], without: '<path d="M163 176 L232 181 L252 194 L292 211 L286 234 L205 234 L174 231 L158 205 Z"/>', colour: SKIN, a: 0.42 }, // her legs
    { at: [181, 235], within: '<path d="M163 176 L232 181 L252 194 L292 211 L286 234 L205 234 L174 231 L158 205 Z"/>', colour: '#4a8a98', a: 0.55 }, // her shorts
    { at: [235, 320], colour: '#de8573', a: 0.55 },    // her shoes
    { at: [48, 350], colour: '#de8573', a: 0.55 },
    { shape: '<ellipse cx="110" cy="386" rx="98" ry="6"/>', colour: '#b9c7a8', a: 0.35 }, // the ground
    { drop: [300, 75, 3], colour: '#de8573' }, { drop: [320, 300, 2.5], colour: '#4a8a98' },
  ],
  myers: [
    { at: [121, 95], colour: '#e8a33a', a: 0.55 },     // the bottles
    { at: [279, 95], colour: '#e8bd55', a: 0.55 },
    { at: [200, 64], colour: '#e8bd55', a: 0.6 },      // the drop
    { at: [200, 236], colour: '#d7e8f0', a: 0.4 },     // the flask's glass
    { at: [200, 301], colour: '#f5b942', a: 0.6 },     // the cocktail
    { drop: [150, 150, 2.5], colour: '#e8a33a' }, { drop: [292, 330, 2.5], colour: '#f5b942' },
  ],
  iron: [
    { at: [197, 219], colour: '#d4a03c', a: 0.58 },    // the iron infusion: amber yellow
    { at: [219, 211], colour: '#d4a03c', a: 0.58 },
    { at: [201, 102], colour: '#dfe6ee', a: 0.35 },    // the bag above it
    { at: [200, 75], colour: '#c9d2dc', a: 0.4 },      // its cap
    { at: [200, 42], colour: '#b8c3cf', a: 0.45 },     // the hook
    { drop: [110, 262, 3.5], colour: '#d4a03c' }, { drop: [292, 200, 2.5], colour: '#c8913a' },
  ],
  'muscle-recovery': [
    { at: [194, 84], colour: '#8a5a3b', a: 0.55 },     // his hair
    { at: [201, 114], colour: SKIN, a: 0.45 },         // his face
    { at: [159, 182], colour: SKIN, a: 0.45 },         // his arm
    { at: [188, 164], colour: '#4f7fae', a: 0.5 },     // his vest
    { at: [202, 213], colour: '#4f7fae', a: 0.5 },
    { at: [112, 183], colour: '#6b7480', a: 0.42 },    // his shorts
    { at: [132, 227], colour: SKIN, a: 0.4 },          // his legs
    { at: [181, 234], colour: SKIN, a: 0.4 },
    { at: [197, 254], colour: SKIN, a: 0.4 },
    { at: [153, 294], colour: SKIN, a: 0.35 },
    { at: [209, 294], colour: SKIN, a: 0.35 },
    { at: [72, 278], colour: '#c45a4a', a: 0.55 },     // the plates
    { at: [106, 276], colour: '#a84a3e', a: 0.5 },
    { at: [99, 267], colour: '#a84a3e', a: 0.5 },
    { at: [258, 271], colour: '#c45a4a', a: 0.55 },
    { at: [288, 271], colour: '#a84a3e', a: 0.5 },
    { at: [39, 277], colour: '#9aa5b1', a: 0.45 },     // the bar
    { at: [133, 309], colour: '#cfd5dc', a: 0.5 },     // his shoes
    { at: [184, 304], colour: '#cfd5dc', a: 0.5 },
    { shape: '<ellipse cx="190" cy="318" rx="150" ry="6"/>', colour: '#b9c7a8', a: 0.3 }, // the floor
    { drop: [22, 225, 3], colour: '#c45a4a' }, { drop: [330, 235, 2.5], colour: '#c45a4a' },
  ],
  nad: [
    { at: [201, 222], colour: '#b39ddb', a: 0.18 },    // inside the ring
    { at: [200, 62], colour: '#d88078', a: 0.55 },     // the atoms
    { at: [200, 356], colour: '#d88078', a: 0.55 },
    { at: [200, 142], colour: '#6874b0', a: 0.5 },
    { at: [200, 302], colour: '#6874b0', a: 0.5 },
    { at: [128, 184], colour: '#5fa8a0', a: 0.55 },
    { at: [272, 184], colour: '#5fa8a0', a: 0.55 },
    { at: [128, 262], colour: '#efb35c', a: 0.55 },
    { at: [272, 262], colour: '#efb35c', a: 0.55 },
    { drop: [100, 110, 2.5], colour: '#6874b0' }, { drop: [305, 330, 2.5], colour: '#5fa8a0' },
  ],
  detox: [
    { at: [192, 236], colour: '#9fd3df', a: 0.45 },    // the water
    { at: [201, 105], colour: '#9fd3df', a: 0.45 },
    { at: [201, 371], colour: '#bfe2ea', a: 0.4 },
    { at: [256, 37], colour: '#f4d03f', a: 0.6 },      // the lemon
    { at: [293, 61], colour: '#f4d03f', a: 0.6 },
    { at: [295, 85], colour: '#f4d03f', a: 0.6 },
    { at: [305, 44], colour: '#e9b824', a: 0.55 },     // its peel
    { at: [204, 132], colour: '#5e9e5a', a: 0.55 },    // the mint
    { at: [162, 155], colour: '#5e9e5a', a: 0.55 },
    { at: [220, 175], colour: '#5e9e5a', a: 0.55 },
    { at: [219, 239], colour: '#e6f4fb', a: 0.7 },     // the ice
    { at: [236, 213], colour: '#e6f4fb', a: 0.7 },
    { at: [249, 242], colour: '#e6f4fb', a: 0.7 },
    { at: [188, 293], colour: '#e6f4fb', a: 0.7 },
    { at: [170, 269], colour: '#e6f4fb', a: 0.7 },
    { at: [158, 300], colour: '#e6f4fb', a: 0.7 },
    { drop: [330, 130, 2.5], colour: '#f4d03f' }, { drop: [100, 210, 2.5], colour: '#9fd3df' },
  ],
  immunity: [
    { at: [152, 224], colour: ORANGE, a: 0.6 },        // the whole orange
    { at: [275, 310], colour: ORANGE, a: 0.55 },       // the half: its peel
    { at: [297, 202], colour: '#fde3b0', a: 0.55 },    // its pith
    { at: [297, 240], colour: '#fde3b0', a: 0.5 },
    { at: [277, 201], colour: '#f4ae46', a: 0.6 },     // its segments
    { at: [315, 205], colour: '#f4ae46', a: 0.6 },
    { at: [245, 217], colour: '#f4ae46', a: 0.6 },
    { at: [345, 227], colour: '#f4ae46', a: 0.6 },
    { at: [243, 250], colour: '#f4ae46', a: 0.6 },
    { at: [349, 260], colour: '#f4ae46', a: 0.6 },
    { at: [276, 275], colour: '#f4ae46', a: 0.6 },
    { at: [318, 279], colour: '#f4ae46', a: 0.6 },
    { at: [143, 79], colour: '#86a86b', a: 0.55 },     // the leaves
    { at: [129, 97], colour: LEAF, a: 0.6 },
    { at: [256, 107], colour: LEAF, a: 0.6 },
    { at: [194, 112], colour: '#7d532c', a: 0.55 },    // the stem
    { drop: [60, 330, 3], colour: ORANGE }, { drop: [378, 300, 3.5], colour: ORANGE }, { drop: [90, 140, 2.5], colour: LEAF },
  ],
  recovery: [
    { shape: '<ellipse cx="200" cy="215" rx="150" ry="68"/>', within: '<rect x="0" y="0" width="400" height="258"/>', colour: '#f8c291', a: 0.22 }, // the warm sky
    { at: [200, 234], colour: '#eeb246', a: 0.6 },     // the sun
    { at: [73, 165], colour: '#cfe0ef', a: 0.55 },     // the cloud
    { shape: '<ellipse cx="200" cy="270" rx="175" ry="11"/>', within: '<rect x="0" y="261" width="400" height="60"/>', colour: '#9cc59a', a: 0.3 }, // the ground
    { drop: [300, 120, 2.5], colour: '#eeb246' }, { drop: [345, 285, 2.5], colour: '#9cc59a' },
  ],
  'vitamin-d': [
    { shape: '<ellipse cx="200" cy="200" rx="70" ry="152"/>', colour: '#f7d774', a: 0.22 }, // a sunny glow
    { at: [200, 200], colour: '#efe3c4', a: 0.8 },     // the bone
    { drop: [120, 130, 2.5], colour: '#f7d774' }, { drop: [285, 260, 2.5], colour: '#f7d774' },
  ],
  longevity: [
    { at: [242, 124], colour: '#86a86b', a: 0.55 },    // the leaves
    { at: [246, 138], colour: LEAF, a: 0.6 },
    { at: [158, 172], colour: '#86a86b', a: 0.55 },
    { at: [154, 185], colour: LEAF, a: 0.6 },
    { shape: '<ellipse cx="200" cy="88" rx="5" ry="16"/>', colour: '#9ccc65', a: 0.6 }, // the bud
    { at: [200, 296], colour: '#8d6e4f', a: 0.55 },    // the soil
    { drop: [300, 185, 2.5], colour: LEAF }, { drop: [115, 255, 2.5], colour: '#8d6e4f' },
  ],
  skin: [
    { shape: '<path d="M196 18 L240 60 Q246 80 252 95 Q270 105 290 115 L293 128 L286 142 L294 152 L290 168 L299 180 L310 200 L306 216 L288 226 L255 229 L215 230 L193 224 Q182 150 188 70 Z"/>', colour: SKIN, a: 0.48 }, // her face
    { shape: '<circle cx="252" cy="178" r="17"/>', colour: '#f19c9c', a: 0.3 },  // a blush
    { shape: '<ellipse cx="283" cy="164" rx="10" ry="6"/>', colour: '#e07a7a', a: 0.5 }, // her lips
    { shape: '<path d="M228 232 L268 231 L252 262 L240 292 L226 290 Z"/>', colour: SKIN, a: 0.3 }, // her neck
    { drop: [325, 125, 2.5], colour: '#f19c9c' },
  ],
  hair: [
    { at: [139, 113], colour: '#8b5a3c', a: 0.5 },     // her hair
    { at: [230, 128], colour: '#8b5a3c', a: 0.5 },
    { at: [131, 180], colour: '#8b5a3c', a: 0.5 },
    { at: [189, 58], colour: '#8b5a3c', a: 0.5 },
    { at: [207, 72], colour: '#8b5a3c', a: 0.5 },
    { at: [241, 219], without: '<path d="M178 170 L234 178 L240 248 L196 252 L176 214 Z"/>', colour: '#8b5a3c', a: 0.5 },
    { shape: '<path d="M150 52 Q100 70 85 130 Q55 165 45 210 Q20 258 30 290 Q55 320 95 336 Q124 312 116 272 Q103 236 124 206 Q140 172 160 132 Q176 100 186 70 Z"/>', colour: '#8b5a3c', a: 0.45 },
    { shape: '<ellipse cx="203" cy="140" rx="27" ry="40"/>', colour: SKIN, a: 0.42 }, // her face
    { shape: '<path d="M182 176 L232 182 L236 240 L198 246 L182 214 Z"/>', colour: SKIN, a: 0.32 }, // her neck
    { shape: '<ellipse cx="214" cy="159" rx="7" ry="4.5"/>', colour: '#e07a7a', a: 0.5 }, // her lips
    { drop: [40, 200, 2.5], colour: '#8b5a3c' }, { drop: [320, 255, 2.5], colour: '#8b5a3c' },
  ],
  signature: [
    { at: [200, 56], colour: '#c9a227', a: 0.6 },      // the nib
    { art: 3, grow: 9, colour: '#6a9cc9', a: 0.45 },   // the bluebird
    { art: 3, grow: 9, within: '<ellipse cx="238" cy="232" rx="22" ry="15" transform="rotate(-35 238 232)"/>', colour: '#f0a35e', a: 0.4 }, // its breast
    { drop: [125, 115, 2.5], colour: '#6a9cc9' }, { drop: [292, 205, 2.5], colour: '#6a9cc9' },
  ],
};

// Watercolour, as an SVG filter: the edges rippled and softened, a darker
// rim where the paint pooled, uneven pigment, and the grain of the paper.
// (Sizes in the drawing's units; k: pixels per unit where it's applied.)
const FILTER = (seed, k) => `
<filter id="wc" x="-15%" y="-15%" width="130%" height="130%" color-interpolation-filters="sRGB">
  <feTurbulence type="fractalNoise" baseFrequency="${0.03 / k}" numOctaves="3" seed="${seed}" result="warp"/>
  <feDisplacementMap in="SourceGraphic" in2="warp" scale="${18 * k}" xChannelSelector="R" yChannelSelector="G" result="shape"/>
  <feGaussianBlur in="shape" stdDeviation="${1.5 * k}" result="soft"/>
  <feMorphology in="soft" operator="erode" radius="${2 * k}" result="inner"/>
  <feComposite in="soft" in2="inner" operator="out" result="rim"/>
  <feGaussianBlur in="rim" stdDeviation="${0.9 * k}" result="rimSoft"/>
  <feTurbulence type="fractalNoise" baseFrequency="${0.014 / k}" numOctaves="2" seed="${seed + 3}" result="pigment"/>
  <feColorMatrix in="pigment" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.9 0.3" result="pigmentA"/>
  <feComposite in="soft" in2="pigmentA" operator="in" result="uneven"/>
  <feTurbulence type="fractalNoise" baseFrequency="${0.45 / k}" numOctaves="2" seed="${seed + 5}" result="grain"/>
  <feColorMatrix in="grain" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -0.35 1.05" result="grainA"/>
  <feComposite in="uneven" in2="grainA" operator="in" result="grained"/>
  <feMerge><feMergeNode in="grained"/><feMergeNode in="rimSoft"/></feMerge>
</filter>`;

// The splash the colour spreads through: white, its edge ragged and soft.
const SPLAT = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-40 -40 480 480" width="${SIZE}" height="${SIZE}"><defs>
<filter id="rag" x="-30%" y="-30%" width="160%" height="160%">
  <feTurbulence type="fractalNoise" baseFrequency="0.028" numOctaves="3" seed="11" result="n"/>
  <feDisplacementMap in="SourceGraphic" in2="n" scale="46" xChannelSelector="R" yChannelSelector="G"/>
  <feGaussianBlur stdDeviation="3"/>
</filter></defs><g filter="url(#rag)"><circle cx="200" cy="200" r="170" fill="#fff"/>
<circle cx="345" cy="120" r="12" fill="#fff"/><circle cx="60" cy="300" r="10" fill="#fff"/><circle cx="300" cy="350" r="8" fill="#fff"/></g></svg>`;

const context = { window: {} };
vm.runInNewContext(readFileSync(path.join(ROOT, 'data', 'line-art.js'), 'utf8'), context);
const ART = context.window.LINE_ART;

let pw;
try { pw = createRequire(path.join(ROOT, 'package.json'))('playwright'); } catch {
  console.error('This needs Playwright: npm install --no-save playwright && npx playwright install chromium');
  process.exit(1);
}
await mkdir(OUT, { recursive: true });
const browser = await pw.chromium.launch();
const page = await browser.newPage();
await page.setContent('<!doctype html><html><body></body></html>');

// Paints one drawing's wash in the browser and returns it as WebP bytes.
const paint = (art, parts, seed, filter) => page.evaluate(async ({ art, parts, seed, filter, SIZE }) => {
  const S = 2, M = 40, W = 480 * S; // work at 2px per unit
  const canvas = () => { const c = document.createElement('canvas'); c.width = c.height = W; return c; };
  const toUnits = (g) => g.setTransform(S, 0, 0, S, M * S, M * S);
  const matrix = (t) => { const el = document.createElementNS('http://www.w3.org/2000/svg', 'g'); el.setAttribute('transform', t); return el.transform.baseVal.consolidate().matrix; };
  // The drawing's lines, a little thicker, as the walls that shapes are filled up to.
  const walls = canvas(); const wg = walls.getContext('2d'); toUnits(wg);
  wg.lineCap = 'round'; wg.lineJoin = 'round'; wg.strokeStyle = '#000'; wg.fillStyle = '#000';
  for (const p of art.paths) {
    const o = typeof p === 'string' ? { d: p } : p;
    wg.save();
    let width = 5;
    if (o.transform) { const m = matrix(o.transform); wg.transform(m.a, m.b, m.c, m.d, m.e, m.f); width /= Math.hypot(m.a, m.b); }
    wg.lineWidth = width;
    if (o.fill) wg.fill(new Path2D(o.d)); else wg.stroke(new Path2D(o.d));
    wg.restore();
  }
  const wall = wg.getImageData(0, 0, W, W).data;
  // A shape (SVG) drawn white on a canvas.
  const drawSVG = async (svg) => {
    const img = new Image();
    img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="-40 -40 480 480" width="${W}" height="${W}"><g fill="#fff">${svg}</g></svg>`)}`;
    await img.decode();
    const c = canvas(); c.getContext('2d').drawImage(img, 0, 0); return c;
  };
  const artShape = (n) => { const o = art.paths[n]; return `<path d="${o.d}"${o.transform ? ` transform="${o.transform}"` : ''}/>`; };
  // The closed shape around a point: filled outwards up to the walls.
  const region = (x, y) => {
    // (the nearest point off the lines, if it's right on one)
    let start = -1;
    for (let r = 0; r <= 4 && start < 0; r++) {
      for (let dy = -r; dy <= r && start < 0; dy++) for (let dx = -r; dx <= r && start < 0; dx++) {
        const i = Math.round((y + M) * S + dy) * W + Math.round((x + M) * S + dx);
        if (wall[i * 4 + 3] <= 40) start = i;
      }
    }
    if (start < 0) throw new Error(`(${x}, ${y}) is on a line`);
    const seen = new Uint8Array(W * W); const stack = [start]; seen[start] = 1; let n = 0;
    while (stack.length) {
      const i = stack.pop(); n++;
      const px = i % W;
      if (px === 0 || px === W - 1 || i < W || i >= W * (W - 1)) throw new Error(`(${x}, ${y}) isn't inside a closed shape`);
      for (const j of [i - 1, i + 1, i - W, i + W]) if (!seen[j] && wall[j * 4 + 3] <= 40) { seen[j] = 1; stack.push(j); }
    }
    const c = canvas(); const g = c.getContext('2d'); const im = g.createImageData(W, W);
    for (let i = 0; i < W * W; i++) if (seen[i]) im.data.set([255, 255, 255, 255], i * 4);
    g.putImageData(im, 0, 0); return c;
  };
  // Spread a shape out by r units (so the colour runs a little under the lines).
  const grow = (c, r) => {
    const out = canvas(); const g = out.getContext('2d');
    g.filter = `blur(${r * S * 0.6}px)`; g.drawImage(c, 0, 0); g.filter = 'none';
    const im = g.getImageData(0, 0, W, W);
    for (let i = 3; i < im.data.length; i += 4) im.data[i] = im.data[i] > 20 ? 255 : 0;
    g.putImageData(im, 0, 0); return out;
  };
  const layers = [];
  for (const part of parts) {
    let c;
    if (part.drop) {
      c = await drawSVG(`<circle cx="${part.drop[0]}" cy="${part.drop[1]}" r="${part.drop[2]}"/>`);
      part.a = 0.6;
    } else {
      if (part.at) c = grow(region(...part.at), part.grow ?? 3.5);
      else if (part.art !== undefined) c = grow(await drawSVG(artShape(part.art)), part.grow ?? 3);
      else c = await drawSVG(part.shape);
      if (part.at && part.shape) { const g = c.getContext('2d'); g.globalCompositeOperation = 'destination-in'; g.drawImage(await drawSVG(part.shape), 0, 0); }
      if (part.within) { const g = c.getContext('2d'); g.globalCompositeOperation = 'destination-in'; g.drawImage(await drawSVG(part.within), 0, 0); }
      if (part.without) { const g = c.getContext('2d'); g.globalCompositeOperation = 'destination-out'; g.drawImage(await drawSVG(part.without), 0, 0); }
    }
    // Coloured in, as a painter would: lighter and thinner where the light
    // falls (from the top left), the colour itself in the middle, and
    // deeper, warmer shade on the far side, so each shape has some form.
    const g = c.getContext('2d');
    g.globalCompositeOperation = 'source-in';
    if (part.drop || part.flat) {
      g.fillStyle = part.colour; g.globalAlpha = part.a; g.fillRect(0, 0, W, W);
    } else {
      const im = g.getImageData(0, 0, W, W).data;
      let x0 = W, y0 = W, x1 = 0, y1 = 0;
      for (let i = 3; i < im.length; i += 4) if (im[i]) { const p = (i - 3) / 4, x = p % W, y = (p / W) | 0; if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
      const w = Math.max(1, x1 - x0), h = Math.max(1, y1 - y0);
      const rgb = (hex) => [1, 3, 5].map((k) => parseInt(hex.slice(k, k + 2), 16));
      const mix = (a, b, t) => a.map((v, k) => Math.round(v + (b[k] - v) * t));
      const base = rgb(part.colour);
      const light = mix(base, [255, 252, 245], 0.42);
      const shade = mix(base, [62, 40, 32], 0.3);
      const rgba = (c, al) => `rgba(${c.join(',')},${Math.min(0.95, al).toFixed(3)})`;
      const gr = g.createRadialGradient(x0 + w * 0.3, y0 + h * 0.26, 0, x0 + w * 0.3, y0 + h * 0.26, Math.hypot(w, h) * 0.85);
      gr.addColorStop(0, rgba(light, part.a * 0.7));
      gr.addColorStop(0.42, rgba(base, part.a));
      gr.addColorStop(1, rgba(shade, part.a * 1.12));
      g.fillStyle = gr; g.fillRect(0, 0, W, W);
    }
    layers.push(c.toDataURL('image/png'));
  }
  // The colours, overlapping like glazes, made watercolour.
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 ${W} ${W}" width="${SIZE}" height="${SIZE}"><defs>${filter}</defs><g filter="url(#wc)" style="isolation:isolate">${layers.map((u) => `<image href="${u}" width="${W}" height="${W}" style="mix-blend-mode:multiply"/>`).join('')}</g></svg>`;
  const img = new Image();
  img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  await img.decode();
  const out = document.createElement('canvas'); out.width = out.height = SIZE;
  out.getContext('2d').drawImage(img, 0, 0, SIZE, SIZE);
  const blob = await new Promise((r) => out.toBlob(r, 'image/webp', 0.8));
  return [...new Uint8Array(await blob.arrayBuffer())];
}, { art, parts, seed, filter, SIZE });

const only = process.argv.slice(2);
let seed = 7;
for (const [id, parts] of Object.entries(WASHES)) {
  seed++;
  if (only.length && !only.includes(id)) continue;
  const bytes = await paint(ART[id], parts, seed, FILTER(seed, 2));
  await writeFile(path.join(OUT, `${id}.webp`), Buffer.from(bytes));
  console.log(`images/washes/${id}.webp`, `${Math.round(bytes.length / 1024)} KB`);
}
if (!only.length || only.includes('splat')) {
  const splat = await page.evaluate(async ({ svg, size }) => {
    const img = new Image();
    img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
    await img.decode();
    const c = document.createElement('canvas'); c.width = c.height = size;
    c.getContext('2d').drawImage(img, 0, 0, size, size);
    const blob = await new Promise((r) => c.toBlob(r, 'image/webp', 0.8));
    return [...new Uint8Array(await blob.arrayBuffer())];
  }, { svg: SPLAT, size: SIZE });
  await writeFile(path.join(OUT, 'splat.webp'), Buffer.from(splat));
  console.log('images/washes/splat.webp', `${Math.round(splat.length / 1024)} KB`);
}
await browser.close();
