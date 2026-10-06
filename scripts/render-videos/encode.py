#!/usr/bin/env python3
"""Encodes one treatment's recorded frames (render-videos.mjs) into its videos.

  python3 encode.py <frames folder> <id> <tint, e.g. #F3F1EE> <output folder>

Writes <id>-1080.mp4 and <id>-720.mp4 (H.264 High, 60 fps, BT.709 limited
range, fast start, no sound: the phones' videos, which play by themselves),
<id>-scrub.mp4 (1080, 30 fps with a keyframe every 4 frames and no B-frames,
so laptops can move it to any point instantly as the page scrolls) and
<id>-start.webp / <id>-end.webp (1080 x 1080, the first and last frames). The animation is cropped to everything that ever
differs from the tint (plus 2%), scaled to fill 84% of the square (never
enlarged), and centred on the tint, so the page can blend the video into a
section of the same colour. Near-tint haze that some cut-out pictures carry
(a faint box round the shell, the glass's table) is first eased into the
tint exactly: pixels within 2 levels of it become the tint, those 2 to 5
levels away are drawn smoothly towards it. And a faint shadow that a picture
cuts off at its own edge (the shell's) fades out towards the edge of the
crop instead of ending in a straight line; strong colours are untouched.
"""
import os, shutil, subprocess, sys, tempfile
import numpy as np
from PIL import Image

src, vid, tint_hex, out = sys.argv[1:5]
FILL = 0.84
tint = np.array([int(tint_hex[k:k + 2], 16) for k in (1, 3, 5)], np.int16)
frames = sorted(f for f in os.listdir(src) if f.endswith('.png'))
if not frames:
    sys.exit(f'No frames in {src}')

# The area the animation ever covers.
x0 = y0 = 10 ** 9
x1 = y1 = -1
for f in frames[::3] + [frames[-1]]:
    a = np.asarray(Image.open(os.path.join(src, f)).convert('RGB')).astype(np.int16)
    ys, xs = np.where(np.abs(a - tint).max(2) > 5)
    if len(xs):
        x0, x1, y0, y1 = min(x0, xs.min()), max(x1, xs.max()), min(y0, ys.min()), max(y1, ys.max())
if x1 < 0:
    sys.exit(f'{vid}: every frame is just the tint')
H, W = a.shape[:2]
pad = int(0.02 * max(x1 - x0, y1 - y0))
x0, y0, x1, y1 = max(0, x0 - pad), max(0, y0 - pad), min(W - 1, x1 + pad), min(H - 1, y1 + pad)
cw, ch = x1 - x0 + 1, y1 - y0 + 1
colour = '0x' + tint_hex[1:]

# Every frame, cropped and cleaned (see above).
clean = tempfile.mkdtemp(prefix=f'{vid}-')
t = tint.astype(np.float32)
yy, xx = np.mgrid[0:ch, 0:cw].astype(np.float32)
edge = np.minimum(np.minimum(xx, cw - 1 - xx), np.minimum(yy, ch - 1 - yy))
fade_w = 0.06 * max(cw, ch)
e = np.clip(edge / fade_w, 0, 1)
near_edge = (e * e * (3 - 2 * e))[..., None]   # 0 at the crop's edge, 1 from 6% in
for i, f in enumerate(frames):
    a = np.asarray(Image.open(os.path.join(src, f)).convert('RGB'))[y0:y1 + 1, x0:x1 + 1].astype(np.float32)
    d = np.abs(a - t).max(2, keepdims=True)
    k = np.clip((d - 2) / 3, 0, 1)
    w = k * k * (3 - 2 * k)
    f = np.clip((d - 12) / 18, 0, 1)
    faint = 1 - f * f * (3 - 2 * f)                 # 1 for faint shadows, 0 from 30 levels
    w = w * (1 - faint * (1 - near_edge))
    eased = t + (a - t) * w
    Image.fromarray(np.clip(np.rint(eased), 0, 255).astype(np.uint8)).save(os.path.join(clean, f'f{i:04d}.png'), compress_level=1)
cleaned = sorted(os.listdir(clean))

for size in (1080, 720):
    s = min(size * FILL / cw, size * FILL / ch, 1.0)
    sw, sh = int(round(cw * s / 2)) * 2, int(round(ch * s / 2)) * 2
    px, py = (size - sw) // 2 // 2 * 2, (size - sh) // 2 // 2 * 2
    vf = (f'scale={sw}:{sh}:flags=lanczos,pad={size}:{size}:{px}:{py}:color={colour},'
          'scale=out_color_matrix=bt709:out_range=tv,format=yuv420p')
    subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-framerate', '60', '-i', os.path.join(clean, 'f%04d.png'), '-vf', vf,
                    '-c:v', 'libx264', '-profile:v', 'high', '-level', '4.0', '-preset', 'slow', '-crf', '22', '-g', '60',
                    '-pix_fmt', 'yuv420p', '-colorspace', 'bt709', '-color_primaries', 'bt709', '-color_trc', 'bt709',
                    '-color_range', 'tv', '-movflags', '+faststart', '-an', os.path.join(out, f'{vid}-{size}.mp4')], check=True)
    if size == 1080:
        for f, suffix in ((cleaned[0], 'start'), (cleaned[-1], 'end')):
            im = Image.open(os.path.join(clean, f)).convert('RGB').resize((sw, sh), Image.LANCZOS)
            canvas = Image.new('RGB', (size, size), tuple(int(v) for v in tint))
            canvas.paste(im, (px, py))
            canvas.save(os.path.join(out, f'{vid}-{suffix}.webp'), 'WEBP', quality=90, method=5)
    if size == 1080:
        subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-framerate', '60', '-i', os.path.join(clean, 'f%04d.png'), '-vf', vf,
                        '-r', '30', '-c:v', 'libx264', '-profile:v', 'high', '-level', '4.0', '-preset', 'slow', '-crf', '21',
                        '-g', '4', '-keyint_min', '4', '-bf', '0', '-sc_threshold', '0',
                        '-pix_fmt', 'yuv420p', '-colorspace', 'bt709', '-color_primaries', 'bt709', '-color_trc', 'bt709',
                        '-color_range', 'tv', '-movflags', '+faststart', '-an', os.path.join(out, f'{vid}-scrub.mp4')], check=True)
    print(f'{vid}: {size} x {size}, picture {sw} x {sh}')
shutil.rmtree(clean)
