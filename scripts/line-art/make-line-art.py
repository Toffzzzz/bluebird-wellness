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

# Smooth curves through key points (Catmull-Rom), for the portraits and the lifter.
def through(pts):
    d = f"M{P(*pts[0])}"
    for i in range(len(pts) - 1):
        p0 = pts[i - 1] if i > 0 else pts[i]
        p1, p2 = pts[i], pts[i + 1]
        p3 = pts[i + 2] if i + 2 < len(pts) else pts[i + 1]
        c1 = (p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6)
        c2 = (p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6)
        d += f" C{P(*c1)} {P(*c2)} {P(*p2)}"
    return d

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

# 4. Iron: a red blood cell, a soft kidney-bean shape with a curved crease
def cubic(p0, p1, p2, p3, t):
    u = 1 - t
    return tuple(u**3 * a + 3 * u * u * t * b + 3 * u * t * t * c + t**3 * d for a, b, c, d in zip(p0, p1, p2, p3))
def split(p0, p1, p2, p3, t):
    # de Casteljau: the two halves of a cubic at t
    lerp = lambda a, b: tuple(x + (y - x) * t for x, y in zip(a, b))
    a, b, c = lerp(p0, p1), lerp(p1, p2), lerp(p2, p3)
    d, e = lerp(a, b), lerp(b, c)
    f = lerp(d, e)
    return (p0, a, d, f), (f, e, c, p3)
def at_x(seg, x):
    lo, hi = 0.0, 1.0
    rising = cubic(*seg, 1)[0] > cubic(*seg, 0)[0]
    for _ in range(60):
        mid = (lo + hi) / 2
        if (cubic(*seg, mid)[0] < x) == rising: lo = mid
        else: hi = mid
    return (lo + hi) / 2
C = lambda *pts: ' '.join(P(*q) for q in pts)
# The outline, clockwise from where the line meets it (on the upper lobe's
# shoulder): over the upper lobe, down the rounded side, round the lower lobe,
# up the left side and in through the dent.
s1 = ((200, 92), (222, 70), (300, 66), (318, 126))
s2 = ((318, 126), (336, 186), (300, 262), (236, 304))
s3 = ((236, 304), (180, 340), (96, 338), (80, 286))
s4 = ((80, 286), (66, 240), (100, 206), (138, 192))
s5 = ((138, 192), (178, 176), (178, 114), (200, 92))
t = at_x(s3, 200)
s3a, s3b = split(*s3, t)
bottom = s3a[3]
rev = lambda seg: (seg[3], seg[2], seg[1], seg[0])
right = f"M{P(*s1[0])} " + ' '.join(f"C{C(*seg[1:])}" for seg in [s1, s2, s3a])
left = f"M{P(*s5[3])} " + ' '.join(f"C{C(*seg[1:])}" for seg in [rev(s5), rev(s4), rev(s3b)])
ART['iron'] = {
    'alt': 'A line drawing of a red blood cell',
    'top': 92, 'bottom': round(bottom[1], 1),
    'paths': [
        right,
        left,
        "M276 122 C300 166 286 226 238 252",
    ],
}

# 5. Muscle & Fitness: a lifter at the bottom of a deadlift, side on and facing
# right, his arms straight down to the bar, with a big plate at each end; drawn
# as an outline. The page's line comes into the back of his head and leaves
# from the floor.
def plate(cx, side):
    # a plate seen at an angle: its oval face, its hub, and its rim on the outer side
    return [*halves_ellipse(cx, 300, 17, 56), *halves_ellipse(cx, 300, 6, 15),
            halves_ellipse(cx + 8 * side, 300, 17, 56)[0 if side < 0 else 1]]
ART['muscle-recovery'] = {
    'alt': 'A line drawing of a lifter at the bottom of a deadlift, gripping a barbell with a big plate at each end',
    'top': 94, 'bottom': 356,
    'paths': [
        # the head, from where the line comes in
        "M200 94 A20 20 0 0 1 232 118 A20 20 0 0 1 200 94",
        # the back of the neck, the broad back, the glutes, the back of the leg and the heel
        through([(197, 113), (189, 115.5), (180, 114), (168, 111), (157, 111), (146.5, 113.5), (136, 119.5), (124, 129.5),
                 (111, 142), (98, 155), (85, 166.5), (72, 177), (61, 187.5), (54, 199), (54, 209), (60, 218.5), (70, 224),
                 (90, 231), (112, 238.5), (134.5, 245), (156.5, 250.5), (167, 254.5), (169.5, 260), (167.5, 266),
                 (163, 276), (159.5, 287), (155.5, 298.5), (151.5, 309), (147.5, 319.5), (143.5, 329.5), (140, 338),
                 (135.5, 345.5), (137.5, 352.5), (145, 356)]),
        # the shoulder and the arm hanging straight down: its back, then its front
        through([(181, 122.5), (172, 127), (167.5, 138), (166, 152), (165.5, 168), (167, 186), (169, 203), (168.5, 222),
                 (168, 244), (168, 266), (168, 287.5)]),
        through([(181, 122.5), (193, 125), (200, 134), (202, 148), (199.5, 165), (196, 184), (193, 201), (192, 216),
                 (190, 236), (188, 256), (185.5, 272), (183, 285.5)]),
        # the throat
        through([(212, 125.5), (206, 129.5), (202, 135)]),
        # the chest and belly, down to the hip, and the top of the thigh back to the arm
        through([(167, 172), (152, 178.5), (137, 185), (124, 191), (115.5, 196.5)]),
        through([(115.5, 196.5), (126, 201.5), (136.5, 206.5), (146.5, 211.5), (156.5, 216.5), (167.5, 221.5)]),
        # the knee in front of the arm, and the shin down to the hand
        through([(189, 231.5), (198.5, 237), (204, 246.5), (200.5, 256), (194.5, 266), (188.5, 276), (183, 286.5)]),
        # the hand round the bar
        through([(183, 285.5), (186.5, 291), (188.5, 300), (186, 309), (177, 313.5)]),
        through([(168, 287.5), (166, 296), (168, 306.5), (177, 313.5)]),
        # the shin below the hand, and the foot
        through([(169.5, 310), (164, 320), (158.5, 330), (154, 339), (161, 343), (174.5, 345.5), (187, 348),
                 (195, 351.5), (194, 356)]),
        # the bar, either side of the lifter, and the two plates
        "M86 300 L155.5 300", "M188.5 300 L268 300",
        "M44 300 L35 300", "M310 300 L319 300",
        *plate(69, -1), *plate(285, 1),
        # the floor
        *ground(356, 168),
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

# 12. Beauty & Glow: a face turned up, in profile, in one line: forehead, a
# closed eye under a soft brow, the nose, the lips, the chin and the long neck
ART['skin'] = {
    'alt': 'A line drawing of a face in profile, turned up, with closed eyes',
    'top': 36, 'bottom': 392,
    'paths': [
        through([(200, 36), (198, 70), (204, 104), (226, 126), (248, 140), (256, 150), (290, 168), (318, 177), (313, 188),
                 (300, 190), (296, 197), (310, 208), (298, 214), (308, 224), (296, 232), (302, 244), (294, 256), (266, 268),
                 (236, 282), (226, 300), (220, 340), (210, 370), (200, 392)]),
        through([(214, 150), (230, 142), (244, 143)]),
        through([(226, 170), (244, 180), (264, 174)]),
        through([(298, 214), (290, 213)]),
    ],
}

# 13. Hair & Scalp: a woman with long, wavy hair, her face turned to the right,
# eyes closed. Drawn on a 626-wide grid, then fitted to the box.
def fit(pts):
    return [(200 + (x - 313) * 0.62, 46 + (y - 60) * 0.62) for x, y in pts]
ART['hair'] = {
    'alt': 'A line drawing of a woman with long, wavy hair and closed eyes',
    'top': 46, 'bottom': 356,
    'paths': [through(fit(pts)) for pts in [
        # the hair: the crown and the waves falling on the left
        [(313, 60), (230, 70), (160, 110), (120, 180), (105, 260), (140, 330), (120, 400), (80, 450), (90, 510), (130, 545)],
        [(300, 70), (240, 110), (200, 180), (195, 250), (230, 300), (220, 360), (160, 420), (140, 480), (150, 540)],
        # the hair falling on the right
        [(313, 60), (400, 62), (460, 100), (490, 160), (480, 220), (520, 290), (500, 370), (470, 430), (480, 500), (460, 530)],
        # the hair framing the face, which is also its far cheek
        [(340, 80), (305, 125), (288, 190), (290, 250), (296, 320)],
        # the profile: forehead, nose, lips, chin, and the jaw back to the cheek
        [(372, 98), (405, 150), (415, 190), (412, 215), (428, 245), (446, 266), (442, 280), (430, 281), (434, 292), (446, 306),
         (432, 314), (442, 322), (432, 331), (441, 345), (432, 362), (400, 374), (352, 370), (316, 348), (296, 320)],
        # the nostril, the corner of the mouth, the brow and the closed eye
        [(436, 274), (426, 268), (420, 276), (428, 284), (438, 280)],
        [(432, 314), (418, 311)],
        [(352, 202), (378, 188), (406, 193)],
        [(356, 232), (378, 244), (402, 236)],
        # the neck, carrying on down the middle, the other side of it, and the shoulder
        [(332, 368), (328, 440), (320, 500), (313, 560)],
        [(410, 380), (412, 430), (422, 472)],
        [(220, 526), (268, 512), (316, 530)],
    ]],
}

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
