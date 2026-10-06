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

# Four drawings are traced from line art drawn in ChatGPT (Energy, Muscle &
# Fitness, Beauty & Glow, Hair & Scalp): scripts/line-art/trace-drawings.py
# turns scripts/line-art/sources/*.png into traced.json, read here.
TRACED = json.load(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'traced.json')))

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

# 2. Energy: a woman running at full stride, side on (traced)
ART['energy'] = TRACED['energy']

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

# 4. Iron: an IV drip bag hanging from its hook, filled with liquid, with
# "Fe" (iron's symbol) in the liquid. The page's line comes into the top of
# the hanger and leaves from the end of the tube.
ART['iron'] = {
    'alt': 'A line drawing of an IV drip bag filled with liquid, with Fe, the symbol for iron, in the liquid',
    'top': 30, 'bottom': 384,
    'paths': [
        # the hanger, a ring at the top of the bag
        "M200 30 A12 12 0 0 0 200 54 A12 12 0 0 0 200 30",
        # the bag: its top edge from the hanger out to the corners, and its sides
        # down to the rounded bottom, which narrows into the port
        "M200 54 L200 66 L150 66 Q130 66 130 86 L130 266 Q130 300 164 314 L186 322",
        "M200 66 L250 66 Q270 66 270 86 L270 266 Q270 300 236 314 L214 322",
        # the seal across the top of the bag, with the hole it hangs by
        "M130 84 L270 84",
        # the surface of the liquid
        "M130 120 C156 112 176 128 200 120 C224 112 244 128 270 120",
        # the measuring marks
        "M250 146 L270 146", "M258 170 L270 170", "M250 194 L270 194", "M258 218 L270 218", "M250 242 L270 242",
        # Fe
        "M158 166 L158 236", "M158 166 L190 166", "M158 200 L184 200",
        "M238 219 A19 19 0 1 0 232.4 232.4", "M200 219 L238 219",
        # two small bubbles
        circle_from_top(156, 272, 4), circle_from_top(172, 288, 3),
        # the port, and the tube leaving it
        "M186 322 L186 344 L214 344 L214 322",
        "M200 344 L200 384",
    ],
}

# 5. Muscle & Fitness: a man at the bottom of a deadlift, gripping a barbell
# with a big plate at each end (traced)
ART['muscle-recovery'] = TRACED['muscle-recovery']

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

# 12. Beauty & Glow: a woman's face in profile, turned up, eyes closed (traced)
ART['skin'] = TRACED['skin']

# 13. Hair & Scalp: a woman with long, wavy hair, eyes closed (traced)
ART['hair'] = TRACED['hair']

# 14. Signature: a fountain pen nib, the Bluebird logo, and a signature line
logo = open(os.path.join(ROOT, 'images', 'logo', 'bluebird-mark-thin.svg')).read()  # the logo with thinner strokes (thin-logo.py)
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
