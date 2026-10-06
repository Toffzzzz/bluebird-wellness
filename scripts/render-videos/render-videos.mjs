#!/usr/bin/env node
/* ==========================================================================
   Re-renders the featured treatments' videos (images/treatment-videos/).

   The videos are recordings of the scroll animations the home page used to
   run live (the pinned stage: script.js's SCENES, frame sequences and 3D
   views). That code is no longer part of the site, so this tool takes it
   from the commit tagged `stage-animations`:

   1. checks that commit out into a temporary folder (git worktree), and
      copies scripts/render-videos/fixes/ over it (small fixes to the
      pictures that the old stage used, e.g. the Myers flask's base);
   2. serves that folder on a local port and opens it in a headless Chromium
      (Playwright) at 1440 × 900, three device pixels per CSS pixel;
   3. for each treatment, hides everything but its scene, sets the stage's
      background to its tint, and steps the stage's timeline from just after
      the treatment has appeared to its rest point, one 60 fps frame at a
      time (GSAP's clock is driven by the frame number, so every run is
      identical), saving each frame as a PNG;
   4. runs encode.py on the frames: crops to the animation, centres it on
      the tint, and writes into images/treatment-videos/ <id>-1080.mp4 and
      <id>-720.mp4 (the phones' videos: H.264, 60 fps, BT.709, fast start,
      no sound), <id>-scrub.mp4 (the laptops' video, moved by the scroll:
      30 fps, a keyframe every 4 frames), <id>-start.webp and <id>-end.webp.

   Needs (not part of the site):
     npm install --no-save playwright && npx playwright install chromium
     ffmpeg              (macOS: brew install ffmpeg)
     python3 with numpy and Pillow   (pip3 install numpy pillow)
   Run from the repo's folder:
     node scripts/render-videos/render-videos.mjs                  all of them
     node scripts/render-videos/render-videos.mjs myers signature  only those
   Each treatment takes a few minutes. Check the new videos on the page
   before committing them.
   ========================================================================== */

import { createServer } from 'node:http';
import { readFile, mkdir, rm, cp, readdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(HERE, '../..');
const TAG = 'stage-animations';
const OUT = path.join(REPO, 'images/treatment-videos');
const FPS = 60;
// How long each recording lasts (seconds); the rest take 2.4.
const SECONDS = { myers: 3.4, signature: 3.2, recovery: 3.0, skin: 2.8, 'vitamin-d': 2.6 };
// Where each recording starts, as a share of the treatment's segment: just
// after it has faded in (the runner, whose entrance is part of the story, a
// little earlier).
const FROM = { energy: 0.1 };
const FROM_DEFAULT = 0.2;
// The part of the 1440 × 900 page where the stage's picture sits.
const CLIP = { x: 600, y: 120, width: 840, height: 760 };

const only = process.argv.slice(2);

let chromium;
try {
  ({ chromium } = await import('playwright'));
} catch {
  console.error('This tool needs Playwright: npm install --no-save playwright && npx playwright install chromium');
  process.exit(1);
}
for (const [cmd, args, hint] of [['ffmpeg', ['-version'], 'ffmpeg (macOS: brew install ffmpeg)'], ['python3', ['-c', 'import numpy, PIL'], 'python3 with numpy and Pillow (pip3 install numpy pillow)']]) {
  try { execFileSync(cmd, args, { stdio: 'ignore' }); } catch { console.error(`This tool needs ${hint}.`); process.exit(1); }
}

const git = (...args) => execFileSync('git', ['-C', REPO, ...args], { encoding: 'utf8' }).trim();
try { git('rev-parse', '--verify', `${TAG}^{commit}`); } catch {
  console.error(`No commit tagged "${TAG}". It marks the last version of the site with the scroll animations.`);
  process.exit(1);
}

const work = path.join(os.tmpdir(), `bluebird-stage-${process.pid}`);
const frames = path.join(os.tmpdir(), `bluebird-frames-${process.pid}`);
git('worktree', 'add', '--detach', work, TAG);
let server, browser;
try {
  const fixes = path.join(HERE, 'fixes');
  if (existsSync(fixes)) await cp(fixes, work, { recursive: true });

  // A plain static server for the old site.
  const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.sdf': 'text/plain', '.mp4': 'video/mp4', '.woff2': 'font/woff2' };
  server = createServer(async (req, res) => {
    let file = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    if (file.endsWith('/')) file += 'index.html';
    try {
      const body = await readFile(path.join(work, file));
      res.writeHead(200, { 'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream' });
      res.end(body);
    } catch { res.writeHead(404); res.end(); }
  });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const url = `http://127.0.0.1:${server.address().port}/`;

  // RENDER_SWIFTSHADER=1 draws WebGL in software (for a computer without a usable GPU).
  const software = process.env.RENDER_SWIFTSHADER ? ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] : [];
  browser = await chromium.launch({ args: ['--ignore-gpu-blocklist', ...software] });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 3 });
  page.on('pageerror', (e) => console.error('page error:', e.message));
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.waitForFunction(() => typeof stage !== 'undefined' && stage && !!stage.tl, null, { timeout: 180000, polling: 500 });

  // Park inside the pinned stage, stop it following the scroll, and take over its clock.
  await page.evaluate(async () => {
    window.scrollTo(0, stage.pin.start + 5);
    if (lenis) { lenis.scrollTo(stage.pin.start + 5, { immediate: true }); lenis.stop(); }
    await new Promise((r) => setTimeout(r, 800));
    stage.st.kill();
    const style = document.createElement('style');
    style.id = 'render-style';
    document.head.appendChild(style);
    gsap.ticker.remove(tickLives);
  });

  const plan = await page.evaluate(({ FROM, FROM_DEFAULT }) => {
    const tl = stage.tl, L = STAGE.segment, E = STAGE.enterEnd, X = STAGE.exitStart;
    const lengths = FEATURED.map((t) => (t.length || 1) * L);
    const at = (i, f) => (f <= E ? f * L : (f >= X ? lengths[i] - (1 - f) * L : E * L + ((f - E) / (X - E)) * (lengths[i] - (E + 1 - X) * L)));
    return FEATURED.map((t, i) => {
      const def = SCENES[t.showcase.scene] || SCENES.fade;
      const lab = def.label ?? STAGE.label;
      const rest = tl.labels[t.id];
      const start = rest - at(i, lab);
      return { id: t.id, tint: t.showcase.tint || '#F7F4EF', from: start + at(i, FROM[t.id] ?? FROM_DEFAULT), to: rest };
    });
  }, { FROM, FROM_DEFAULT });

  const unknown = only.filter((id) => !plan.some((p) => p.id === id));
  if (unknown.length) throw new Error(`Unknown treatment id(s): ${unknown.join(', ')}. Known: ${plan.map((p) => p.id).join(', ')}`);

  await mkdir(OUT, { recursive: true });
  for (const p of plan) {
    if (only.length && !only.includes(p.id)) continue;
    const n = Math.round((SECONDS[p.id] || 2.4) * FPS);
    const dir = path.join(frames, p.id);
    await mkdir(dir, { recursive: true });
    console.log(`${p.id}: recording ${n} frames…`);
    await page.evaluate(async (p) => {
      // Only this treatment's scene, on its tint, without the text and side list;
      // the Myers visual at the full size of the visual area (the stage drew it at 80%).
      document.getElementById('render-style').textContent = `
        #stage .scene:not([data-scene="${p.id}"]) { visibility: hidden !important; }
        #stage .stage__bg { background: ${p.tint} !important; }
        #stage .obj--blend { width: min(var(--vis-w), calc(var(--vis-h) * var(--ratio))) !important; }
        #stage .stage__copy, #stage .stage__progress { visibility: hidden !important; }`;
      stage.tl.time(p.from);
      updateLives(p.from);
      for (const l of lives) { if (l.visible) { try { initLive(l); l.warm?.(); } catch (e) { /* not a live effect */ } } }
      await new Promise((r) => setTimeout(r, 2500));
    }, p);
    await page.evaluate(() => { gsap.ticker.sleep(); window.__g0 = gsap.globalTimeline.totalTime(); });
    for (let k = 0; k < n; k++) {
      await page.evaluate(({ p, k, n, FPS }) => {
        const t = p.from + (p.to - p.from) * (k / (n - 1));
        const vt = k / FPS;
        gsap.globalTimeline.totalTime(window.__g0 + vt);
        stage.tl.time(t);
        updateLives(t);
        for (const l of lives) frameLive(l, 1000 + vt);
      }, { p, k, n, FPS });
      await page.screenshot({ path: path.join(dir, `f${String(k).padStart(4, '0')}.png`), clip: CLIP });
    }
    await page.evaluate(() => gsap.ticker.wake());
    console.log(`${p.id}: encoding…`);
    execFileSync('python3', [path.join(HERE, 'encode.py'), dir, p.id, p.tint, OUT], { stdio: 'inherit' });
    await rm(dir, { recursive: true, force: true });
  }
  console.log(`Done: ${(await readdir(OUT)).length} files in images/treatment-videos/`);
} finally {
  if (browser) await browser.close();
  if (server) server.close();
  try { git('worktree', 'remove', '--force', work); } catch { /* already gone */ }
  await rm(frames, { recursive: true, force: true });
}
