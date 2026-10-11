#!/usr/bin/env node
/* Bluebird Wellness: the watercolour washes behind the line drawings.

   Once a drawing has finished drawing itself, a splash of its own colours
   (the orange's orange, the leaves' green…) spreads out behind the lines,
   like watercolour: loose, a little past the outlines, darker where the
   paint pooled at its edges, with the grain of the paper and a few drops.

   This script paints those washes. For each drawing (data/line-art.js) it
   takes the patches of colour below, in the drawing's own 400 x 400 box,
   turns them into watercolour (rippled edges, soft, darker rims, paper
   grain) and saves the result as images/washes/<drawing>.webp, covering
   the box plus 40 on every side (-40 to 440). It also paints
   images/washes/splat.webp: the ragged splash shape the colour is revealed
   through as it spreads (site.js).

   Run it after changing a wash (from the repo's folder):
     npm install --no-save playwright && npx playwright install chromium
     node scripts/line-art/paint-washes.mjs
   then python3 scripts/line-art/make-line-art.py (it adds each wash to
   data/line-art.js) and node scripts/build-menu.mjs. */

import { writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const OUT = path.join(ROOT, 'images', 'washes');
const SIZE = 720; // px: the image covers the 480 x 480 box (-40 to 440)

// The colours: [shape (SVG, in the 400 x 400 box), colour, strength], then
// drops [x, y, radius, colour]. Shapes are loose on purpose.
const SKIN = '#f1c3a1';
const LEAF = '#5f9449';
const WASHES = {
  hydration: {
    patches: [
      ['<ellipse cx="193" cy="262" rx="112" ry="88"/>', '#9a6a3c', 0.55],             // the coconut's shell
      ['<ellipse cx="170" cy="285" rx="70" ry="50"/>', '#7d532c', 0.25],              // shade on the shell
      ['<ellipse cx="198" cy="160" rx="72" ry="17"/>', '#f3e6c8', 0.9],               // its white flesh
      ['<path d="M66 128 Q110 60 170 60 Q200 70 188 92 Q150 110 92 132 Z"/>', '#e2574c', 0.6], // the umbrella
      ['<path d="M120 70 Q150 62 178 70 L150 100 Z"/>', '#f2c14e', 0.55],              // its stripe
      ['<circle cx="200" cy="114" r="20"/>', '#5fb6d9', 0.6],                         // the drop
      ['<path d="M232 165 L300 52 L318 58 L250 170 Z"/>', '#f08a9a', 0.45],           // the straw
      ['<ellipse cx="50" cy="268" rx="40" ry="26" transform="rotate(30 50 268)"/>', LEAF, 0.6], // the leaf
      ['<circle cx="115" cy="300" r="42"/>', '#f6d6dc', 0.7],                         // the flower
      ['<circle cx="117" cy="303" r="14"/>', '#f2c14e', 0.6],                         // its centre
    ],
    drops: [[40, 200, 4, '#5fb6d9'], [318, 330, 3, '#9a6a3c'], [285, 110, 3, '#5fb6d9'], [60, 340, 2.5, LEAF], [330, 250, 2, '#9a6a3c']],
  },
  energy: {
    patches: [
      ['<ellipse cx="150" cy="50" rx="40" ry="24" transform="rotate(-15 150 50)"/>', '#8a5a3b', 0.55],   // her hair
      ['<ellipse cx="205" cy="52" rx="22" ry="28"/>', SKIN, 0.55],                    // her face
      ['<path d="M168 82 L226 86 L236 150 L214 186 L170 176 L160 122 Z"/>', '#e9806e', 0.55], // her top
      ['<ellipse cx="140" cy="140" rx="28" ry="46"/>', SKIN, 0.45],                  // her arms
      ['<ellipse cx="255" cy="130" rx="30" ry="20" transform="rotate(-40 255 130)"/>', SKIN, 0.45],
      ['<path d="M170 176 L240 186 L286 214 L266 236 L186 232 Z"/>', '#3d8fa0', 0.55], // her shorts
      ['<ellipse cx="118" cy="280" rx="72" ry="28" transform="rotate(-42 118 280)"/>', SKIN, 0.4], // her legs
      ['<ellipse cx="256" cy="262" rx="24" ry="44" transform="rotate(15 256 262)"/>', SKIN, 0.4],
      ['<ellipse cx="232" cy="328" rx="32" ry="14" transform="rotate(30 232 328)"/>', '#e9806e', 0.5], // her shoes
      ['<ellipse cx="46" cy="352" rx="18" ry="26"/>', '#e9806e', 0.5],
      ['<ellipse cx="110" cy="386" rx="100" ry="7"/>', '#b9c7a8', 0.4],              // the ground
    ],
    drops: [[300, 70, 3, '#e9806e'], [95, 120, 2.5, '#3d8fa0'], [320, 300, 3, '#3d8fa0'], [30, 260, 2.5, '#e9806e']],
  },
  myers: {
    patches: [
      ['<ellipse cx="120" cy="95" rx="48" ry="22" transform="rotate(50 120 95)"/>', '#e8a33a', 0.55], // the bottles
      ['<ellipse cx="280" cy="95" rx="48" ry="22" transform="rotate(-50 280 95)"/>', '#f2c14e', 0.55],
      ['<circle cx="200" cy="62" r="14"/>', '#f2c14e', 0.6],                          // the drop
      ['<circle cx="200" cy="285" r="66"/>', '#cfe3ee', 0.35],                        // the flask's glass
      ['<rect x="186" y="182" width="28" height="46"/>', '#cfe3ee', 0.35],
      ['<ellipse cx="200" cy="300" rx="60" ry="42"/>', '#f5b942', 0.55],              // the cocktail
      ['<ellipse cx="200" cy="272" rx="52" ry="10"/>', '#f8d77a', 0.45],
    ],
    drops: [[150, 150, 3, '#e8a33a'], [252, 150, 3, '#f2c14e'], [292, 330, 2.5, '#f5b942'], [110, 300, 2.5, '#f5b942']],
  },
  iron: {
    patches: [
      ['<path d="M132 124 Q170 116 200 122 Q235 128 268 120 L268 280 Q268 300 240 310 L210 318 L190 318 L160 310 Q132 300 132 280 Z"/>', '#a83a32', 0.55], // the iron-rich drip
      ['<path d="M140 200 Q200 190 262 200 L262 290 Q240 312 200 316 Q160 312 140 290 Z"/>', '#8c2a25', 0.3], // deeper at the bottom
      ['<rect x="185" y="318" width="30" height="22"/>', '#a83a32', 0.35],            // the port
      ['<circle cx="200" cy="40" r="14"/>', '#b8c3cf', 0.45],                         // the hook
    ],
    drops: [[110, 260, 4, '#a83a32'], [292, 200, 3, '#a83a32'], [280, 330, 2.5, '#8c2a25'], [118, 150, 2, '#a83a32']],
  },
  'muscle-recovery': {
    patches: [
      ['<circle cx="75" cy="275" r="52"/>', '#d2493f', 0.5],                           // the plates
      ['<circle cx="255" cy="270" r="55"/>', '#d2493f', 0.5],
      ['<rect x="20" y="266" width="235" height="12"/>', '#9aa5b1', 0.35],             // the bar
      ['<ellipse cx="200" cy="92" rx="26" ry="28"/>', SKIN, 0.55],                    // his head
      ['<path d="M140 124 L205 116 L216 182 L176 202 L130 190 Z"/>', '#3f7fbf', 0.5],  // his vest
      ['<ellipse cx="208" cy="205" rx="18" ry="55"/>', SKIN, 0.45],                  // his arms
      ['<ellipse cx="112" cy="198" rx="42" ry="30"/>', '#4b5563', 0.4],              // his shorts
      ['<ellipse cx="160" cy="255" rx="26" ry="42"/>', SKIN, 0.4],                   // his legs
      ['<ellipse cx="190" cy="318" rx="150" ry="7"/>', '#b9c7a8', 0.35],             // the floor
    ],
    drops: [[22, 220, 3, '#d2493f'], [330, 230, 3, '#d2493f'], [300, 330, 2.5, '#3f7fbf'], [90, 120, 2.5, '#3f7fbf']],
  },
  nad: {
    patches: [
      ['<ellipse cx="200" cy="210" rx="110" ry="150"/>', '#b39ddb', 0.18],            // a soft glow
      ['<circle cx="200" cy="62" r="17"/>', '#e57373', 0.55],                          // the atoms
      ['<circle cx="200" cy="142" r="24"/>', '#5c6bc0', 0.5],
      ['<circle cx="128" cy="184" r="17"/>', '#4db6ac', 0.55],
      ['<circle cx="272" cy="184" r="17"/>', '#4db6ac', 0.55],
      ['<circle cx="128" cy="262" r="17"/>', '#ffb74d', 0.55],
      ['<circle cx="272" cy="262" r="17"/>', '#ffb74d', 0.55],
      ['<circle cx="200" cy="302" r="24"/>', '#5c6bc0', 0.5],
      ['<circle cx="200" cy="356" r="13"/>', '#e57373', 0.55],
    ],
    drops: [[90, 110, 3, '#5c6bc0'], [310, 120, 2.5, '#e57373'], [310, 330, 3, '#4db6ac'], [80, 320, 2.5, '#ffb74d']],
  },
  detox: {
    patches: [
      ['<path d="M127 100 L273 100 L265 355 L135 355 Z"/>', '#9fd3df', 0.4],           // the water
      ['<circle cx="282" cy="72" r="40"/>', '#f4d03f', 0.6],                          // the lemon
      ['<circle cx="282" cy="72" r="26"/>', '#f9e37a', 0.4],
      ['<ellipse cx="165" cy="155" rx="36" ry="20" transform="rotate(30 165 155)"/>', '#4caf50', 0.55], // the mint
      ['<ellipse cx="218" cy="162" rx="40" ry="17" transform="rotate(-20 218 162)"/>', '#4caf50', 0.55],
      ['<ellipse cx="205" cy="132" rx="15" ry="28"/>', '#5cbf60', 0.5],
      ['<path d="M196 205 L262 222 L245 268 L190 258 Z"/>', '#dbeefa', 0.55],         // the ice
      ['<path d="M146 276 L204 258 L215 300 L172 322 L150 316 Z"/>', '#dbeefa', 0.55],
    ],
    drops: [[330, 130, 3, '#f4d03f'], [100, 200, 2.5, '#9fd3df'], [300, 300, 3, '#9fd3df'], [240, 20, 2.5, '#f4d03f']],
  },
  immunity: {
    patches: [
      ['<circle cx="152" cy="232" r="84"/>', '#f08a24', 0.6],                         // the whole orange
      ['<circle cx="140" cy="215" r="50"/>', '#f6a94a', 0.35],                        // its light side
      ['<ellipse cx="293" cy="242" rx="92" ry="80"/>', '#f39a2e', 0.5],               // the half: its peel
      ['<ellipse cx="293" cy="240" rx="72" ry="64"/>', '#fbc15a', 0.55],              // and its flesh
      ['<ellipse cx="130" cy="88" rx="52" ry="22" transform="rotate(28 130 88)"/>', LEAF, 0.6], // the leaves
      ['<ellipse cx="255" cy="105" rx="52" ry="18" transform="rotate(-22 255 105)"/>', '#6aa152', 0.55],
      ['<rect x="186" y="85" width="12" height="50" transform="rotate(18 192 110)"/>', '#7d532c', 0.5], // the stem
    ],
    drops: [[60, 330, 3, '#f08a24'], [375, 300, 4, '#f39a2e'], [355, 150, 2.5, '#f08a24'], [90, 140, 2.5, LEAF], [230, 345, 2, '#f08a24']],
  },
  recovery: {
    patches: [
      ['<ellipse cx="200" cy="215" rx="150" ry="70"/>', '#f8c291', 0.3],              // the warm sky
      ['<path d="M140 259 A60 60 0 0 1 260 259 Z"/>', '#f6b93b', 0.6],                 // the sun
      ['<ellipse cx="72" cy="163" rx="46" ry="22"/>', '#cfe0ef', 0.55],               // the cloud
      ['<ellipse cx="200" cy="272" rx="175" ry="13"/>', '#9cc59a', 0.35],             // the ground
    ],
    drops: [[300, 120, 2.5, '#f6b93b'], [110, 230, 2.5, '#f6b93b'], [345, 280, 3, '#9cc59a']],
  },
  'vitamin-d': {
    patches: [
      ['<ellipse cx="200" cy="200" rx="72" ry="155"/>', '#f7d774', 0.3],              // a sunny glow
      ['<rect x="182" y="92" width="36" height="216"/>', '#efe3c4', 0.8],             // the bone
      ['<circle cx="182" cy="77" r="22"/>', '#efe3c4', 0.8],
      ['<circle cx="218" cy="77" r="22"/>', '#efe3c4', 0.8],
      ['<circle cx="182" cy="323" r="22"/>', '#efe3c4', 0.8],
      ['<circle cx="218" cy="323" r="22"/>', '#efe3c4', 0.8],
    ],
    drops: [[120, 130, 3, '#f7d774'], [285, 260, 3, '#f7d774'], [270, 90, 2, '#f7d774']],
  },
  longevity: {
    patches: [
      ['<ellipse cx="240" cy="130" rx="46" ry="18" transform="rotate(-27 240 130)"/>', '#6aa84f', 0.6], // the leaves
      ['<ellipse cx="160" cy="178" rx="46" ry="18" transform="rotate(22 160 178)"/>', '#6aa84f', 0.6],
      ['<ellipse cx="200" cy="90" rx="7" ry="20"/>', '#9ccc65', 0.6],                 // the bud
      ['<rect x="196" y="100" width="8" height="185"/>', '#6aa84f', 0.4],             // the stem
      ['<path d="M118 304 Q200 266 282 304 Z"/>', '#8d6e4f', 0.55],                    // the soil
    ],
    drops: [[300, 180, 3, '#6aa84f'], [110, 250, 2.5, '#8d6e4f'], [290, 290, 2.5, '#8d6e4f']],
  },
  skin: {
    patches: [
      ['<path d="M200 15 L245 65 Q255 95 290 115 L295 160 L310 210 Q300 225 260 230 L195 228 Q180 160 185 60 Z"/>', SKIN, 0.5], // her face
      ['<circle cx="255" cy="172" r="22"/>', '#f19c9c', 0.35],                         // a blush
      ['<ellipse cx="284" cy="164" rx="11" ry="6"/>', '#e07a7a', 0.55],                // her lips
      ['<path d="M225 230 L266 232 L240 300 L222 385 L200 390 L206 300 Z"/>', SKIN, 0.4], // her neck
    ],
    drops: [[330, 120, 2.5, '#f19c9c'], [160, 260, 3, SKIN], [300, 300, 2.5, '#f19c9c']],
  },
  hair: {
    patches: [
      ['<path d="M150 70 Q90 90 72 160 Q30 230 22 280 Q50 330 110 345 Q142 300 132 240 Q120 170 160 120 Z"/>', '#8b5a3c', 0.5], // her hair
      ['<path d="M215 66 Q236 92 232 122 Q240 170 262 192 Q302 232 300 302 Q280 320 260 300 Q240 252 212 242 Q240 220 246 180 Z"/>', '#8b5a3c', 0.5],
      ['<ellipse cx="175" cy="72" rx="52" ry="24"/>', '#8b5a3c', 0.5],
      ['<ellipse cx="202" cy="140" rx="30" ry="42"/>', SKIN, 0.45],                  // her face
      ['<path d="M184 184 L238 184 L242 240 L186 240 Z"/>', SKIN, 0.35],             // her neck
      ['<ellipse cx="214" cy="159" rx="8" ry="5"/>', '#e07a7a', 0.5],                 // her lips
    ],
    drops: [[40, 200, 3, '#8b5a3c'], [320, 250, 2.5, '#8b5a3c'], [150, 360, 2.5, '#8b5a3c']],
  },
  signature: {
    patches: [
      ['<path d="M188 40 L212 40 L212 66 L200 96 L188 66 Z"/>', '#c9a227', 0.6],     // the nib
      ['<ellipse cx="172" cy="185" rx="62" ry="78" transform="rotate(-20 172 185)"/>', '#5b9bd5', 0.45], // the bluebird's wings
      ['<ellipse cx="228" cy="245" rx="55" ry="36" transform="rotate(-35 228 245)"/>', '#5b9bd5', 0.45], // its body
      ['<ellipse cx="232" cy="238" rx="26" ry="18" transform="rotate(-35 232 238)"/>', '#f0a35e', 0.4], // its breast
      ['<ellipse cx="200" cy="356" rx="72" ry="5"/>', '#1f3a5f', 0.2],                // the signature line
    ],
    drops: [[120, 110, 2.5, '#5b9bd5'], [300, 200, 3, '#5b9bd5'], [260, 320, 2.5, '#c9a227']],
  },
};

// Watercolour, as an SVG filter: the patches' edges rippled, softened,
// darker where the paint pooled at the rim, with the grain of the paper.
const FILTER = (seed) => `
<filter id="wc" x="-20%" y="-20%" width="140%" height="140%" color-interpolation-filters="sRGB">
  <feTurbulence type="fractalNoise" baseFrequency="0.022" numOctaves="3" seed="${seed}" result="warp"/>
  <feDisplacementMap in="SourceGraphic" in2="warp" scale="30" xChannelSelector="R" yChannelSelector="G" result="shape"/>
  <feGaussianBlur in="shape" stdDeviation="2.4" result="soft"/>
  <feMorphology in="soft" operator="erode" radius="3.2" result="inner"/>
  <feComposite in="soft" in2="inner" operator="out" result="rim"/>
  <feGaussianBlur in="rim" stdDeviation="1.3" result="rimSoft"/>
  <feTurbulence type="fractalNoise" baseFrequency="0.32" numOctaves="3" seed="${seed + 5}" result="grain"/>
  <feColorMatrix in="grain" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -0.55 1.08" result="grainA"/>
  <feComposite in="soft" in2="grainA" operator="in" result="grained"/>
  <feMerge><feMergeNode in="grained"/><feMergeNode in="rimSoft"/><feMergeNode in="rimSoft"/></feMerge>
</filter>`;

const washSVG = (w, seed) => {
  const patches = w.patches.map(([shape, colour, strength]) => `<g fill="${colour}" fill-opacity="${strength}" style="mix-blend-mode:multiply">${shape}</g>`).join('');
  const drops = w.drops.map(([x, y, r, colour]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${colour}" fill-opacity="0.6"/>`).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-40 -40 480 480" width="${SIZE}" height="${SIZE}"><defs>${FILTER(seed)}</defs><g filter="url(#wc)" style="isolation:isolate">${patches}${drops}</g></svg>`;
};

// The splash the colour spreads through: white, its edge ragged and soft.
const SPLAT = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-40 -40 480 480" width="${SIZE}" height="${SIZE}"><defs>
<filter id="rag" x="-30%" y="-30%" width="160%" height="160%">
  <feTurbulence type="fractalNoise" baseFrequency="0.028" numOctaves="3" seed="11" result="n"/>
  <feDisplacementMap in="SourceGraphic" in2="n" scale="46" xChannelSelector="R" yChannelSelector="G"/>
  <feGaussianBlur stdDeviation="3"/>
</filter></defs><g filter="url(#rag)"><circle cx="200" cy="200" r="170" fill="#fff"/>
<circle cx="345" cy="120" r="12" fill="#fff"/><circle cx="60" cy="300" r="10" fill="#fff"/><circle cx="300" cy="350" r="8" fill="#fff"/></g></svg>`;

let pw;
try { pw = createRequire(path.join(ROOT, 'package.json'))('playwright'); } catch {
  console.error('This needs Playwright: npm install --no-save playwright && npx playwright install chromium');
  process.exit(1);
}
await mkdir(OUT, { recursive: true });
const browser = await pw.chromium.launch();
const page = await browser.newPage();
await page.setContent('<!doctype html><html><body></body></html>');
// Draws an SVG onto a canvas and returns it as WebP (with transparency).
const toWebP = (svg) => page.evaluate(async ({ svg, size }) => {
  const img = new Image();
  img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  await img.decode();
  const canvas = document.createElement('canvas');
  canvas.width = size; canvas.height = size;
  canvas.getContext('2d').drawImage(img, 0, 0, size, size);
  const blob = await new Promise((r) => canvas.toBlob(r, 'image/webp', 0.8));
  return [...new Uint8Array(await blob.arrayBuffer())];
}, { svg, size: SIZE });

let seed = 7;
for (const [id, w] of Object.entries(WASHES)) {
  const bytes = await toWebP(washSVG(w, seed++));
  await writeFile(path.join(OUT, `${id}.webp`), Buffer.from(bytes));
  console.log(`images/washes/${id}.webp`, `${Math.round(bytes.length / 1024)} KB`);
}
const splat = await toWebP(SPLAT);
await writeFile(path.join(OUT, 'splat.webp'), Buffer.from(splat));
console.log('images/washes/splat.webp', `${Math.round(splat.length / 1024)} KB`);
await browser.close();
