"""Builds data/line-art.js: one clean line drawing per featured treatment.

Run from anywhere:  python3 scripts/line-art/make-line-art.py
(it writes data/line-art.js; commit both).

Every drawing lives in a 400 x 400 box. The page's centre line comes down at
x = 200 to the drawing's `top` point and leaves from its `bottom` point.
Paths are written top-down (each one starts at its highest end), because
each is drawn as the page's 'pen' (the middle of the screen) passes down
through it.
"""
import json, math, os, re, sys

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..')

def f(v):
    s = f"{v:.1f}"
    return s[:-2] if s.endswith('.0') else s

def P(*pts):
    return ' '.join(f(p) for p in pts)

def circle_from_top(cx, cy, r):
    # a full circle starting at its top, going clockwise (two arcs)
    return f"M{P(cx, cy - r)} A{P(r, r)} 0 0 1 {P(cx, cy + r)} A{P(r, r)} 0 0 1 {P(cx, cy - r)}"

def halves_circle(cx, cy, r):
    # left and right halves, both from the top down to the bottom
    return [f"M{P(cx, cy - r)} A{P(r, r)} 0 0 0 {P(cx, cy + r)}",
            f"M{P(cx, cy - r)} A{P(r, r)} 0 0 1 {P(cx, cy + r)}"]

def halves_ellipse(cx, cy, rx, ry):
    return [f"M{P(cx, cy - ry)} A{P(rx, ry)} 0 0 0 {P(cx, cy + ry)}",
            f"M{P(cx, cy - ry)} A{P(rx, ry)} 0 0 1 {P(cx, cy + ry)}"]

def ground(y, half):
    # a short base line, drawn from both ends in to the middle, where the line leaves
    return [f"M{P(200 - half, y)} L{P(200, y)}", f"M{P(200 + half, y)} L{P(200, y)}"]

def polar(cx, cy, r, deg):
    a = math.radians(deg)
    return cx + r * math.cos(a), cy + r * math.sin(a)

ART = {}

# 1. Hydration: a coconut cut open, with a straw, and a drop of water
zig = [(104, 196)]
x = 104
up = True
while x < 290:
    x += 16
    zig.append((min(x, 296), 186 if up else 198))
    up = not up
zig[-1] = (296, 196)
ART['hydration'] = {
    'alt': 'A line drawing of a coconut cut open, with a straw and a drop of water',
    'top': 34, 'bottom': 312,
    'paths': [
        "M200 34 C200 34 172 74 172 94 A28 28 0 0 0 228 94 C228 74 200 34 200 34",
        "M290 92 L262 102 L234 186",
        "M" + " L".join(P(a, b) for a, b in zig),
        "M118 212 Q200 238 282 212",
        "M104 196 C104 264 146 312 200 312",
        "M296 196 C296 264 254 312 200 312",
    ],
}

# 2. Energy: a runner mid-stride, with three speed lines
ART['energy'] = {
    'alt': 'A line drawing of a runner mid-stride',
    'top': 52, 'bottom': 316,
    'paths': [
        circle_from_top(200, 72, 20),
        "M196 96 L180 194",
        "M193 118 L224 144 L248 120",
        "M193 118 L166 152 L150 182",
        "M180 194 L224 222 L214 272 L234 277",
        "M180 194 L168 250 L128 238",
        "M86 146 L122 146",
        "M74 172 L114 172",
        "M88 198 L124 198",
        *ground(316, 80),
    ],
}

# 3. Myers Cocktail: two small bottles tipping into a round flask
def bottle(cx, cy, deg):
    pts = "M-7 -46 L7 -46 M-6 -46 L-6 -34 Q-18 -30 -18 -18 L-18 30 Q-18 38 -10 38 L10 38 Q18 38 18 30 L18 -18 Q18 -30 6 -34 L6 -46"
    return {'d': pts, 'transform': f"translate({f(cx)} {f(cy)}) rotate({f(deg)})"}
ART['myers'] = {
    'alt': 'A line drawing of two small bottles pouring into a round flask',
    'top': 44, 'bottom': 348,
    'paths': [
        "M200 44 C200 44 190 60 190 67 A10 10 0 0 0 210 67 C210 60 200 44 200 44",
        bottle(122, 96, 141),
        bottle(278, 96, -141),
        "M154 134 Q176 150 192 176",
        "M246 134 Q224 150 208 176",
        "M178 182 L222 182",
        f"M186 182 L186 {f(286 - math.sqrt(62**2 - 14**2))} A62 62 0 0 0 200 348",
        f"M214 182 L214 {f(286 - math.sqrt(62**2 - 14**2))} A62 62 0 0 1 200 348",
        f"M{f(200 - math.sqrt(62**2 - 22**2))} 264 L{f(200 + math.sqrt(62**2 - 22**2))} 264",
        circle_from_top(184, 302, 5),
        circle_from_top(216, 318, 4),
    ],
}

# 4. Iron: a red blood cell, a rounded disc with a dimple
ART['iron'] = {
    'alt': 'A line drawing of a red blood cell',
    'top': 116, 'bottom': 284,
    'paths': [
        *halves_ellipse(200, 200, 132, 84),
        *halves_ellipse(200, 194, 70, 36),
        "M96 226 Q200 286 304 226",
    ],
}

# 5. Muscle & Fitness: a figure standing tall at the top of a deadlift
def plate(x, h):
    return f"M{P(x - 5, 208 - h)} L{P(x + 5, 208 - h)} L{P(x + 5, 208 + h)} L{P(x - 5, 208 + h)} Z"
ART['muscle-recovery'] = {
    'alt': 'A line drawing of a figure standing tall, holding a barbell at the top of a deadlift',
    'top': 44, 'bottom': 318,
    'paths': [
        circle_from_top(200, 64, 20),
        "M200 84 L200 98",
        "M162 100 L238 100",
        "M176 100 L186 196",
        "M224 100 L214 196",
        "M186 196 L214 196",
        "M162 100 L154 206",
        "M238 100 L246 206",
        "M190 196 L184 306 L168 308",
        "M210 196 L216 306 L232 308",
        "M86 208 L314 208",
        plate(104, 30), plate(118, 24),
        plate(296, 30), plate(282, 24),
        *ground(318, 90),
    ],
}

# 6. NAD+: a molecule, spheres joined by rods
nodes = {'a': (200, 62, 16), 'b': (200, 142, 22), 'c': (128, 184, 15), 'd': (272, 184, 15),
         'e': (128, 262, 15), 'f': (272, 262, 15), 'g': (200, 302, 22), 'h': (200, 356, 12)}
rods = [('a', 'b'), ('b', 'c'), ('b', 'd'), ('c', 'e'), ('d', 'f'), ('e', 'g'), ('f', 'g'), ('g', 'h')]
paths = []
for k, (x, y, r) in nodes.items():
    paths.append(circle_from_top(x, y, r))
for p, q in rods:
    (x1, y1, r1), (x2, y2, r2) = nodes[p], nodes[q]
    L = math.hypot(x2 - x1, y2 - y1)
    ux, uy = (x2 - x1) / L, (y2 - y1) / L
    paths.append(f"M{P(x1 + ux * (r1 + 4), y1 + uy * (r1 + 4))} L{P(x2 - ux * (r2 + 4), y2 - uy * (r2 + 4))}")
    # double bond on the ring's left side
    if (p, q) in [('c', 'e')]:
        paths.append(f"M{P(x1 + 9 + ux * (r1 + 8), y1 + uy * (r1 + 8))} L{P(x2 + 9 - ux * (r2 + 8), y2 - uy * (r2 + 8))}")
ART['nad'] = {'alt': 'A line drawing of a molecule: spheres joined by rods', 'top': 46, 'bottom': 368, 'paths': paths}

# 7. Detox: a cucumber slice dropping into a tall glass of water
seeds = [polar(200, 74, 11, a) for a in (-90, 30, 150)]
ART['detox'] = {
    'alt': 'A line drawing of a cucumber slice dropping into a tall glass of water',
    'top': 46, 'bottom': 342,
    'paths': [
        circle_from_top(200, 74, 28),
        circle_from_top(200, 74, 21),
        *[circle_from_top(x, y, 2.5) for x, y in seeds],
        "M180 128 Q170 118 162 118",
        "M220 128 Q230 118 238 118",
        "M146 140 L254 140",
        f"M{f(146 + 40 * 14 / 202)} 180 L{f(254 - 40 * 14 / 202)} 180",
        "M146 140 L160 342 L200 342",
        "M254 140 L240 342 L200 342",
    ],
}

# 8. Immunity: an orange cut in half, showing its segments
wedges = []
for i in range(10):
    a0, a1 = -90 + i * 36 + 3.5, -90 + (i + 1) * 36 - 3.5
    p0, p1 = polar(200, 200, 16, a0), polar(200, 200, 70, a0)
    p2, p3 = polar(200, 200, 70, a1), polar(200, 200, 16, a1)
    wedges.append(f"M{P(*p1)} A70 70 0 0 1 {P(*p2)} L{P(*p3)} L{P(*p0)} Z")
ART['immunity'] = {
    'alt': 'A line drawing of an orange cut in half, showing its segments',
    'top': 108, 'bottom': 292,
    'paths': [*halves_circle(200, 200, 92), *halves_circle(200, 200, 80), *wedges,
              "M318 120 C318 120 308 136 308 142 A10 10 0 0 0 328 142 C328 136 318 120 318 120"],
}

# 9. Recovery: a sun with rays
rays = []
for i in range(12):
    deg = -90 + i * 30
    a, b = polar(200, 200, 82, deg), polar(200, 200, 110, deg)
    top, bot = (a, b) if a[1] <= b[1] else (b, a)
    rays.append(f"M{P(*top)} L{P(*bot)}")
ART['recovery'] = {
    'alt': 'A line drawing of a sun with rays',
    'top': 90, 'bottom': 310,
    'paths': [*halves_circle(200, 200, 62), "M160 200 A40 40 0 0 1 200 160", *rays],
}

# 10. Vitamin D: a bone
r = 22
c = 18  # knob centres at 200 -/+ c
dy = math.sqrt(r * r - c * c)
top_notch, bot_notch = 78 - dy, 322 + dy
ART['vitamin-d'] = {
    'alt': 'A line drawing of a bone',
    'top': round(top_notch, 1), 'bottom': round(bot_notch, 1),
    'paths': [
        f"M200 {f(top_notch)} A{r} {r} 0 1 0 {f(200 - c)} {f(78 + r)} L{f(200 - c)} {f(322 - r)} A{r} {r} 0 1 0 200 {f(bot_notch)}",
        f"M200 {f(top_notch)} A{r} {r} 0 1 1 {f(200 + c)} {f(78 + r)} L{f(200 + c)} {f(322 - r)} A{r} {r} 0 1 1 200 {f(bot_notch)}",
    ],
}

# 11. Longevity: a young shoot with two leaves, rising from the soil
ART['longevity'] = {
    'alt': 'A line drawing of a young shoot with two leaves growing from the soil',
    'top': 72, 'bottom': 304,
    'paths': [
        "M200 72 C196 84 196 96 200 108 C204 96 204 84 200 72",
        "M200 108 L200 284",
        "M284 112 Q238 104 200 150 Q262 166 284 112",
        "M284 112 Q240 128 200 150",
        "M116 160 Q162 154 200 198 Q136 212 116 160",
        "M116 160 Q160 176 200 198",
        "M200 284 Q150 286 122 304",
        "M200 284 Q250 286 278 304",
        *ground(304, 104),
    ],
}

# 12. Beauty & Glow: a pearl in an open scallop shell
H = (200, 300)
R = 168
angles = list(range(200, 341, 20))   # 200 .. 340
ends = {a: polar(*H, R, a) for a in angles}
ribs = []
for a in angles:
    if a in (200, 340):
        continue
    outer, inner = polar(*H, R - 2, a), polar(*H, 64, a)
    ribs.append(f"M{P(*outer)} L{P(*inner)}")
# the scalloped edge, from the middle out to each side, each scallop a soft curve
seq_l = [260, 240, 220, 200]
seq_r = [280, 300, 320, 340]
def edge(seq):
    d = f"M{P(*polar(*H, R + 14, 270))}"
    prev = 270
    first = True
    for a in seq:
        # the first is a half scallop, from the top centre to the first rib's end
        c = polar(*H, R + 16 if first else R + 18, (prev + a) / 2)
        d += f" Q{P(*c)} {P(*ends[a])}"
        first = False
        prev = a
    return d
ART['skin'] = {
    'alt': 'A line drawing of a pearl in an open scallop shell',
    'top': round(H[1] - R - 14, 1), 'bottom': 321,
    'paths': [
        edge(seq_l), edge(seq_r),
        f"M{P(*ends[200])} L{P(*polar(*H, 30, 200))}",
        f"M{P(*ends[340])} L{P(*polar(*H, 30, 340))}",
        *ribs,
        circle_from_top(200, 266, 24),
        "M190 258 A12 12 0 0 1 200 252",
        "M96 292 Q150 321 200 321",
        "M304 292 Q250 321 200 321",
        "M96 292 Q200 312 304 292",
    ],
}

# 13. Hair & Scalp: a head seen from behind, with long hair
ART['hair'] = {
    'alt': 'A line drawing of a head seen from behind, with long flowing hair',
    'top': 56, 'bottom': 344,
    'paths': [
        "M200 56 C154 56 132 92 134 140 C136 188 132 238 118 292 C112 318 150 340 200 344",
        "M200 56 C246 56 268 92 266 140 C264 188 268 238 282 292 C288 318 250 340 200 344",
        "M196 70 C172 140 160 240 154 330",
        "M204 70 C228 140 240 240 246 330",
        "M200 66 C197 160 202 260 200 344",
        "M131 236 Q96 246 62 286",
        "M269 236 Q304 246 338 286",
    ],
}

# 14. Signature: a fountain pen nib, the Bluebird logo, and a signature line
logo = open(os.path.join(ROOT, 'images', 'logo', 'bluebird-mark.svg')).read()
d = re.search(r' d="([^"]+)"', logo).group(1)
# The logo is 463.9 x 613.9; fit it 226 tall, centred, from y = 112. It is
# filled (as the logo is), revealed from the top down as the pen passes.
s = 226 / 613.9
tx = 200 - 463.9 * s / 2
ART['signature'] = {
    'alt': 'A line drawing of a fountain pen nib above the Bluebird Wellness bird',
    'top': 40, 'bottom': 356,
    'paths': [
        "M188 40 L212 40 L212 66 L200 96 L188 66 Z",
        circle_from_top(200, 66, 3.5),
        "M200 70 L200 96",
        {'d': d, 'transform': f"translate({f(tx)} 112) scale({s:.5f})", 'fill': True, 'box': [0, 0, 463.9, 613.9]},
        *ground(356, 70),
    ],
}

order = ['hydration', 'energy', 'myers', 'iron', 'muscle-recovery', 'nad', 'detox', 'immunity', 'recovery', 'vitamin-d', 'longevity', 'skin', 'hair', 'signature']
out = {k: ART[k] for k in order}
js = """/* ==========================================================================
   Bluebird Wellness: the line drawings (the "line-drawings" version of the
   featured treatments; script.js, TX_STYLE = 'lines')

   One clean line drawing per featured treatment, keyed by its id in
   TREATMENTS (script.js). Each sits in a 400 x 400 box:
     - top / bottom: where the page's centre line (x = 200) meets the
       drawing and leaves it again;
     - paths: the strokes, each written from its highest end, because each
       is drawn as the middle of the screen passes down through it. A path
       is an SVG path string, or { d, transform } for a moved or turned one;
     - alt: what the drawing shows, for screen readers.
   All drawn with one even, round-ended line in Bluebird Blue (styles.css).
   ========================================================================== */

window.LINE_ART = """ + json.dumps(out, indent=2) + ";\n"
open(sys.argv[1] if len(sys.argv) > 1 else os.path.join(ROOT, 'data', 'line-art.js'), 'w').write(js)
print('ok', sum(len(v['paths']) for v in out.values()), 'paths')
