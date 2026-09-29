#!/usr/bin/env node
/* ==========================================================================
   Renders the pictures drawn from the site's own code, plus smaller copies:

   - images/treatments/nad-plus-infusion.webp: the NAD+ finished picture
     (the grid card, the drip page, the reduced-motion list and the stage's
     picture before its 3D view is ready): the glass molecule of the stage's
     Three.js scene, facing front as it does at rest (its widest, most
     readable view), cropped to the molecule with a small margin and centred
     on a transparent 1200 × 1200 square.

   The phones' stage runs no live WebGL, so it uses:

   - images/nad-spin/nad-NN.webp: the NAD+ glass molecule turning once
     (36 frames, frame 01 facing front), drawn by the site's own Three.js
     scene (createMolecule in script.js) with the same look, lighting and
     tilt. 720 × 720: the 3D view's 800 × 730 box, centred, as it sits on the
     stage (the square's top and bottom stay clear).
   - images/hair-sway/hair-NN.webp: the hair swayed from −1 (frame 01)
     through 0 (frame 09, the picture itself) to +1 (frame 17) by the
     site's own shader (createHairSway), 720 × 1024 like hair.webp.
   - Each also as <name>-half.webp (half the size).
   - <name>-sm.webp: an 800px-wide copy of every stage picture listed in
     PHONE_COPIES in script.js (phones choose it through srcset).

   It serves this folder on a local port and draws everything in a headless
   Chromium through Playwright, which isn't part of the site:
     npm install --no-save playwright && npx playwright install chromium
     node scripts/render-assets.mjs                 everything
     node scripts/render-assets.mjs picture copies  only those parts
   (parts: picture, spin, sway, copies). Three.js loads from jsDelivr, as on
   the site. Run it again after changing the molecule (MOLECULE,
   models/nad.sdf), the hair shader or its mask, or one of the listed
   pictures (copies).
   ========================================================================== */

import { createServer } from 'node:http';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const QUALITY = 0.8;      // the frames
const COPY_QUALITY = 0.9; // the 800px copies, which must look the same as the originals
const NAD = { dir: 'images/nad-spin', name: 'nad', count: 36, size: 720, box: [800, 730] };
const HAIR = { dir: 'images/hair-sway', name: 'hair', count: 17, size: [720, 1024] };
const PICTURE = { file: 'images/treatments/nad-plus-infusion.webp', size: 1200, box: [800, 730], margin: 0.05, quality: 0.9 };
const PARTS = ['picture', 'spin', 'sway', 'copies'];
const asked = process.argv.slice(2);
if (asked.some((part) => !PARTS.includes(part))) {
  console.error(`Parts: ${PARTS.join(', ')}`);
  process.exit(1);
}
const wants = (part) => !asked.length || asked.includes(part);

let chromium;
try {
  ({ chromium } = await import('playwright'));
} catch {
  console.error('This script needs Playwright: npm install --no-save playwright && npx playwright install chromium');
  process.exit(1);
}

// The page the pictures are drawn on: the site's script (which does nothing
// else on an empty page) and Three.js from the same import map.
const RENDER_PAGE = `<!DOCTYPE html>
<html><head><meta charset="UTF-8">
<script type="importmap">{ "imports": {
  "three": "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js",
  "three/addons/": "https://cdn.jsdelivr.net/npm/three@0.180.0/examples/jsm/"
} }</script>
</head><body style="margin: 0"><script src="/script.js"></script></body></html>`;

const TYPES = { '.js': 'text/javascript', '.webp': 'image/webp', '.json': 'application/json', '.sdf': 'text/plain' };
const server = createServer(async (req, res) => {
  const url = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  if (url === '/__render.html') {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(RENDER_PAGE);
    return;
  }
  const file = path.join(ROOT, url);
  if (!file.startsWith(ROOT)) { res.writeHead(403); res.end(); return; }
  try {
    const body = await readFile(file);
    res.writeHead(200, { 'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream' });
    res.end(body);
  } catch {
    res.writeHead(404);
    res.end();
  }
});
await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
const origin = `http://127.0.0.1:${server.address().port}`;

const browser = await chromium.launch({ args: ['--enable-gpu', '--ignore-gpu-blocklist'] });
// Device pixel ratio 2: the molecule is drawn at twice the size, then scaled down.
const page = await browser.newPage({ viewport: { width: 1600, height: 1200 }, deviceScaleFactor: 2 });
page.on('pageerror', (error) => console.error('page error:', error.message));
await page.goto(`${origin}/__render.html`, { waitUntil: 'load' });

// In the page: canvas → WebP (and its half-size copy), as base64.
await page.evaluate(() => {
  window.encode = async (source, width, height, quality, half) => {
    const out = [];
    for (const scale of half ? [1, 0.5] : [1]) {
      const c = document.createElement('canvas');
      c.width = Math.round(width * scale);
      c.height = Math.round(height * scale);
      const g = c.getContext('2d');
      g.imageSmoothingEnabled = true;
      g.imageSmoothingQuality = 'high';
      g.drawImage(source, 0, 0, c.width, c.height);
      const blob = await new Promise((resolve) => c.toBlob(resolve, 'image/webp', quality));
      const bytes = new Uint8Array(await blob.arrayBuffer());
      let text = '';
      for (let i = 0; i < bytes.length; i += 0x8000) text += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
      out.push(btoa(text));
    }
    return out;
  };
});

const save = async (dir, name, n, [full, half]) => {
  await mkdir(path.join(ROOT, dir), { recursive: true });
  const base = `${name}-${String(n).padStart(2, '0')}`;
  await writeFile(path.join(ROOT, dir, `${base}.webp`), Buffer.from(full, 'base64'));
  if (half) await writeFile(path.join(ROOT, dir, `${base}-half.webp`), Buffer.from(half, 'base64'));
};

// NAD+'s finished picture: the rest pose (facing front), drawn at twice the
// size, cropped to what it covers and scaled down into the square.
if (wants('picture')) {
  const [data] = await page.evaluate(async ({ size, box, margin, quality }) => {
    const obj = document.createElement('div');
    const boxH = (size * box[1]) / box[0];
    obj.innerHTML = `<div class="three-host" style="width: ${size}px; height: ${boxH}px"></div>`;
    document.body.append(obj);
    const view = await createMolecule(obj, '/models/nad.sdf', 2);
    if (!view) throw new Error('No WebGL');
    view.render({ turn: 2 * Math.PI }); // facing front (one full turn, so it redraws)
    const gl = obj.querySelector('canvas');
    const drawn = document.createElement('canvas');
    drawn.width = gl.width;
    drawn.height = gl.height;
    const g = drawn.getContext('2d', { willReadFrequently: true });
    g.drawImage(gl, 0, 0);
    // The molecule's bounds: every pixel that isn't (nearly) transparent.
    const { data: px } = g.getImageData(0, 0, drawn.width, drawn.height);
    let x0 = drawn.width, y0 = drawn.height, x1 = 0, y1 = 0;
    for (let y = 0; y < drawn.height; y++) {
      for (let x = 0; x < drawn.width; x++) {
        if (px[(y * drawn.width + x) * 4 + 3] > 2) { x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); }
      }
    }
    const w = x1 - x0 + 1, h = y1 - y0 + 1;
    const square = document.createElement('canvas');
    square.width = square.height = 2 * size;
    const scale = (2 * size * (1 - 2 * margin)) / Math.max(w, h);
    const sq = square.getContext('2d');
    sq.imageSmoothingQuality = 'high';
    sq.drawImage(drawn, x0, y0, w, h, size - (w * scale) / 2, size - (h * scale) / 2, w * scale, h * scale);
    const out = await encode(square, size, size, quality, false);
    view.dispose();
    obj.remove();
    return out;
  }, PICTURE);
  await writeFile(path.join(ROOT, PICTURE.file), Buffer.from(data, 'base64'));
  console.log(PICTURE.file);
}

// NAD+: one full turn. Each frame is copied straight after its render, while
// the WebGL canvas still holds it, into the square (at twice the size).
if (wants('spin')) {
const nadFrames = await page.evaluate(async ({ count, size, box, quality }) => {
  const obj = document.createElement('div');
  const boxH = (size * box[1]) / box[0];
  obj.innerHTML = `<div class="three-host" style="width: ${size}px; height: ${boxH}px"></div>`;
  document.body.append(obj);
  const view = await createMolecule(obj, '/models/nad.sdf', 2);
  if (!view) throw new Error('No WebGL');
  const gl = obj.querySelector('canvas');
  const frames = [];
  for (let k = 0; k < count; k++) {
    // One extra full turn, so the first frame isn't skipped as already drawn.
    view.render({ turn: 2 * Math.PI * (1 + k / count) });
    const square = document.createElement('canvas');
    square.width = square.height = 2 * size;
    square.getContext('2d').drawImage(gl, 0, size - boxH, 2 * size, 2 * boxH);
    frames.push(square);
  }
  const out = [];
  for (const frame of frames) out.push(await encode(frame, size, size, quality, true));
  view.dispose();
  obj.remove();
  return out;
}, { ...NAD, quality: QUALITY });
for (let k = 0; k < nadFrames.length; k++) await save(NAD.dir, NAD.name, k + 1, nadFrames[k]);
console.log(`${NAD.dir}: ${nadFrames.length} frames`);
}

// Hair & Scalp: the sway from −1 to +1, with the idle sway at rest.
if (wants('sway')) {
const hairFrames = await page.evaluate(async ({ count, size: [w, h], quality }) => {
  const content = document.createElement('div');
  content.style.cssText = `position: relative; width: ${w}px; height: ${h}px`;
  content.innerHTML = `<img src="/images/hair.webp" width="${w}" height="${h}" style="display: block; width: 100%; height: 100%">`;
  document.body.append(content);
  const img = content.querySelector('img');
  await img.decode();
  const sway = await createHairSway(content, img, '/images/hair-mask.webp', 1);
  if (!sway) throw new Error('No WebGL');
  sway.setIdle(0);
  const frames = [];
  for (let k = 0; k < count; k++) {
    sway.setSway(-1 + (2 * k) / (count - 1));
    sway.render(0);
    const copy = document.createElement('canvas');
    copy.width = w;
    copy.height = h;
    copy.getContext('2d').drawImage(sway.canvas, 0, 0, w, h);
    frames.push(copy);
  }
  const out = [];
  for (const frame of frames) out.push(await encode(frame, w, h, quality, true));
  sway.dispose();
  content.remove();
  return out;
}, { ...HAIR, quality: QUALITY });
for (let k = 0; k < hairFrames.length; k++) await save(HAIR.dir, HAIR.name, k + 1, hairFrames[k]);
console.log(`${HAIR.dir}: ${hairFrames.length} frames`);
}

// The 800px copies.
const copies = wants('copies') ? await page.evaluate(() => [...PHONE_COPIES]) : [];
for (const src of copies) {
  const [data] = await page.evaluate(async ({ src, quality }) => {
    const img = new Image();
    img.src = `/${src}`;
    await img.decode();
    const width = 800;
    const height = Math.round((img.naturalHeight * width) / img.naturalWidth);
    return encode(img, width, height, quality, false);
  }, { src, quality: COPY_QUALITY });
  await writeFile(path.join(ROOT, src.replace(/\.webp$/, '-sm.webp')), Buffer.from(data, 'base64'));
}
if (copies.length) console.log(`${copies.length} copies at 800px`);

await browser.close();
server.close();
