"""Traces four of the line drawings from black-on-white pictures.

Beauty & Glow (the face in profile), Hair & Scalp (the woman with wavy hair),
Muscle & Fitness (the deadlift) and Energy (the runner) were drawn in ChatGPT
as black line art (scripts/line-art/sources/, kept as one-bit PNGs) and are
traced here into the site's strokes:

  1. each picture's lines are thinned to their centre lines (scikit-image);
  2. the centre lines are split into strokes, joined again where a stroke
     carries straight on through a crossing, and numbered longest first;
  3. the strokes in DROP (creases, muscle lines, laces, eyelashes, …) and any
     shorter than MIN_LENGTH are left out, so each drawing stays clean;
  4. each one is smoothed, fitted to the 400 x 400 box so that its two
     anchors land on the page's centre line (x = 200): the line comes into
     the drawing at the top anchor and leaves it at the bottom one (a few
     lines can be added by hand, in 'add', and a stroke shortened, in
     'cut_below'); and
     written top-down (each stroke starts at its higher end).

The result is scripts/line-art/traced.json, which make-line-art.py reads.
Only run this to re-trace (it needs Python with scikit-image and Pillow):

    python3 scripts/line-art/trace-drawings.py            # writes traced.json
    python3 scripts/line-art/trace-drawings.py --preview  # also writes
        scripts/line-art/sources/<name>-strokes.png, every stroke numbered,
        for choosing what goes in DROP (don't commit those)

Then run python3 scripts/line-art/make-line-art.py and the generator.
The stroke numbers depend on the scikit-image version; after upgrading it,
check the previews before trusting DROP.
"""
import json, math, os, sys, warnings

import numpy as np
from PIL import Image, ImageDraw
from skimage.morphology import skeletonize

warnings.filterwarnings('ignore')
HERE = os.path.dirname(os.path.abspath(__file__))
SOURCES = os.path.join(HERE, 'sources')
MIN_LENGTH = 30  # px in the source picture: anything shorter is a detail

# For each drawing: its picture, what to leave out, and where the page's line
# meets it (top: comes in; bottom: leaves), in the picture's pixels, and where
# those land in the 400 x 400 box (always at x = 200).
DRAWINGS = {
    'skin': {
        'source': 'beauty-face.png',
        'alt': "A line drawing of a woman's face in profile, turned up, with her eyes closed",
        'drop': [5, 8, 9, 11, 12, 13],          # the doubled brow, the eyelid crease, the eyelashes
        'keep_short': [],
        'top': ('top-end', 1),                   # the top of the forehead
        'bottom': ('bottom-end', 2),             # the foot of the neck
    },
    'hair': {
        'source': 'hair-woman.png',
        'alt': 'A line drawing of a woman with long, wavy hair, her eyes closed',
        'drop': [23, 29, 31, 33, 34],            # the doubled brow, the eyelashes
        'keep_short': [],
        'top': ('above', 21, 'bottom'),          # the crown, straight above where the line leaves
        'bottom': ('left-end', 18),              # the inner end of the shoulder line
    },
    'muscle-recovery': {
        'source': 'deadlift.png',
        'alt': 'A line drawing of a man at the bottom of a deadlift, gripping a barbell with a big plate at each end',
        # muscle lines on the arm, back and legs, the creases in the shorts,
        # the inside of the ear, the laces and the finger lines
        'drop': [40, 42, 43, 45, 51, 52, 53, 54, 55, 56, 60, 62, 65, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 80, 82, 83],
        'keep_short': [79, 81],                  # the eye and the mouth
        'top': ('highest', 4),                   # the top of his head
        'bottom': ('below', 2, 'top'),           # the floor, straight below it
    },
    'energy': {
        'source': 'runner.png',
        'alt': 'A line drawing of a woman in running leggings at full stride, side on',
        # the shorts' hems and creases, the creases in the top, muscle lines,
        # the laces, the hair tie, the inside of the ear and the knuckles
        'drop': [28, 29, 35, 37, 40, 41, 42, 43, 45, 46, 47, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 60, 62, 63, 64,
                 65, 66, 67, 68, 69, 70, 72, 73, 74, 80, 84, 85, 91],
        'keep_short': [77, 95],                  # the lips and the eye
        # Full-length leggings rather than shorts: no shorts hem at the back of
        # the thigh (29), the glute line stops where the back thigh meets it,
        # and a hem is added at each ankle, just above the trainer.
        'cut_below': {5: 606},
        'add': [[(544, 653), (549, 630), (559, 605)],
                [(269, 974), (287, 987), (305, 1001)],
                [(761, 870), (784, 881), (809, 891)]],
        'top': ('highest', 20),                  # the top of her head
        'bottom': ('floor-under', 9, 'top'),     # the ground line, carried on to straight below it
    },
}

N8 = [(-1, -1), (-1, 0), (-1, 1), (0, -1), (0, 1), (1, -1), (1, 0), (1, 1)]


def strokes_of(path):
    """The picture's centre lines as strokes [(x, y), …], longest first."""
    ink = np.array(Image.open(path).convert('L')) < 128
    sk = skeletonize(ink)
    pts = set(zip(*np.nonzero(sk)))
    nbrs = lambda p: [(p[0] + dy, p[1] + dx) for dy, dx in N8 if (p[0] + dy, p[1] + dx) in pts]
    nodes = {p for p in pts if len(nbrs(p)) != 2}
    cluster, cid = {}, 0
    for p in sorted(nodes):
        if p in cluster:
            continue
        stack = [p]
        cluster[p] = cid
        while stack:
            q = stack.pop()
            for r in nbrs(q):
                if r in nodes and r not in cluster:
                    cluster[r] = cid
                    stack.append(r)
        cid += 1
    # Walk from every node along each branch to the next node.
    edges, walked = [], set()
    for p in sorted(nodes):
        for q in sorted(nbrs(p)):
            if q in nodes or (p, q) in walked:
                continue
            path, prev, cur = [p, q], p, q
            while cur not in nodes:
                nx = sorted(r for r in nbrs(cur) if r != prev)
                if not nx:
                    break
                nn = [r for r in nx if r in nodes]
                prev, cur = cur, (nn[0] if nn else nx[0])
                path.append(cur)
            walked.add((p, q))
            walked.add((path[-1], path[-2]))
            edges.append(path)
    # Closed loops with no node on them.
    seen = {x for e in edges for x in e}
    for p in sorted(pts):
        if p in seen or p in nodes:
            continue
        path, prev, cur = [p], None, p
        while True:
            nx = sorted(r for r in nbrs(cur) if r != prev and r not in path[-3:])
            if not nx:
                break
            prev, cur = cur, nx[0]
            if cur == p or cur in seen:
                path.append(cur)
                break
            path.append(cur)
            seen.add(cur)
        seen.update(path)
        if len(path) > 10:
            edges.append(path)
    uniq, keys = [], set()
    for e in edges:
        k = (min(e[0], e[-1]), max(e[0], e[-1]), len(e))
        if k not in keys:
            keys.add(k)
            uniq.append([(x, y) for y, x in e])
    edges = [e for e in uniq if len(e) >= 2]

    # Join two strokes through a crossing when one carries straight on into the other.
    def outward(e, at_start, k=12):
        a = e[0] if at_start else e[-1]
        b = e[min(k, len(e) - 1)] if at_start else e[max(-k - 1, -len(e))]
        L = math.dist(a, b) or 1
        return (a[0] - b[0]) / L, (a[1] - b[1]) / L
    cl = lambda pt: cluster.get((pt[1], pt[0]))
    while True:
        ends = {}
        for i, e in enumerate(edges):
            for s in (True, False):
                c = cl(e[0] if s else e[-1])
                if c is not None:
                    ends.setdefault(c, []).append((i, s))
        best = None
        for c in sorted(ends):
            lst = ends[c]
            for a in range(len(lst)):
                for b in range(a + 1, len(lst)):
                    (i, si), (j, sj) = lst[a], lst[b]
                    if i == j or len(edges[i]) < 6 or len(edges[j]) < 6:
                        continue
                    da, db = outward(edges[i], si), outward(edges[j], sj)
                    dot = da[0] * db[0] + da[1] * db[1]
                    if dot < -0.75 and (best is None or dot < best[0]):
                        best = (dot, i, si, j, sj)
        if not best:
            break
        _, i, si, j, sj = best
        A = edges[i][::-1] if si else edges[i]
        B = edges[j] if sj else edges[j][::-1]
        edges = [e for k, e in enumerate(edges) if k not in (i, j)] + [A + B]
    length = lambda e: sum(math.dist(a, b) for a, b in zip(e, e[1:]))
    edges = [e for e in edges if length(e) > 6]
    edges.sort(key=lambda e: (-round(length(e), 3), e[0]))
    return edges, length


def preview(name, edges, size):
    out = Image.new('RGB', size, 'white')
    d = ImageDraw.Draw(out)
    cols = [(220, 30, 30), (30, 120, 220), (20, 160, 60), (200, 120, 0), (150, 40, 180), (0, 150, 150), (90, 90, 90)]
    for i, e in enumerate(edges):
        d.line(e, fill=cols[i % len(cols)], width=3)
        m = e[len(e) // 2]
        d.text((m[0] + 4, m[1] - 6), str(i), fill=cols[i % len(cols)])
    out.save(os.path.join(SOURCES, f'{name}-strokes.png'))


def resample(e, step=2.0):
    out = [e[0]]
    acc = 0.0
    for a, b in zip(e, e[1:]):
        d = math.dist(a, b)
        while acc + d >= step:
            t = (step - acc) / d
            a = (a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t)
            out.append(a)
            d = math.dist(a, b)
            acc = 0.0
        acc += d
    if math.dist(out[-1], e[-1]) > 0.5:
        out.append(tuple(e[-1]))
    return out


def smooth(e, sigma=2.5):
    """Gaussian smoothing along the stroke (its ends stay put; a loop wraps)."""
    n = len(e)
    if n < 5:
        return e
    closed = math.dist(e[0], e[-1]) < 3
    r = int(sigma * 3)
    w = [math.exp(-(k * k) / (2 * sigma * sigma)) for k in range(-r, r + 1)]
    out = []
    for i in range(n):
        sx = sy = sw = 0.0
        for k in range(-r, r + 1):
            j = i + k
            if closed:
                j %= n
            elif j < 0 or j >= n:
                continue
            sx += e[j][0] * w[k + r]
            sy += e[j][1] * w[k + r]
            sw += w[k + r]
        out.append((sx / sw, sy / sw))
    if not closed:
        # keep the ends where they were, easing into the smoothed line
        for i in range(min(r, n)):
            f = i / r
            for idx in (i, n - 1 - i):
                out[idx] = (e[idx][0] * (1 - f) + out[idx][0] * f, e[idx][1] * (1 - f) + out[idx][1] * f)
    return out


def simplify(pts, tol):
    """Ramer-Douglas-Peucker."""
    if len(pts) < 3:
        return pts
    a, b = pts[0], pts[-1]
    dx, dy = b[0] - a[0], b[1] - a[1]
    L = math.hypot(dx, dy)
    best, idx = -1, 0
    for i in range(1, len(pts) - 1):
        p = pts[i]
        d = abs(dy * (p[0] - a[0]) - dx * (p[1] - a[1])) / L if L else math.dist(p, a)
        if d > best:
            best, idx = d, i
    if best <= tol:
        return [a, b]
    return simplify(pts[:idx + 1], tol)[:-1] + simplify(pts[idx:], tol)


def anchor(rule, strokes, other=None):
    kind, i = rule[0], rule[1]
    e = strokes[i]
    if kind == 'top-end':
        return min(e[0], e[-1], key=lambda p: p[1])
    if kind == 'bottom-end':
        return max(e[0], e[-1], key=lambda p: p[1])
    if kind == 'left-end':
        return min(e[0], e[-1], key=lambda p: p[0])
    if kind == 'highest':
        return min(e, key=lambda p: p[1])
    if kind in ('above', 'below', 'floor-under'):
        x = other[0]
        if kind == 'floor-under':
            if e[0][0] > e[-1][0]:
                e.reverse()    # left to right, so it can be carried on at its right end
            right = max(e, key=lambda p: p[0])
            if right[0] < x:   # carry the ground line on to straight below
                y = right[1]
                e.extend((xx, y) for xx in range(int(right[0]) + 2, int(x) + 1, 2))
                e.append((x, y))
                return (x, y)
        p = min(e, key=lambda p: abs(p[0] - x))
        return (x, p[1])
    raise ValueError(rule)


def fit(name, spec, strokes):
    """Strokes in the 400 x 400 box, with both anchors on x = 200."""
    t_rule, b_rule = spec['top'], spec['bottom']
    if len(t_rule) == 3:
        B = anchor(b_rule, strokes)
        A = anchor(t_rule, strokes, B)
    else:
        A = anchor(t_rule, strokes)
        B = anchor(b_rule, strokes, A) if len(b_rule) == 3 else anchor(b_rule, strokes)
    keep = [i for i, e in enumerate(strokes)
            if i not in spec['drop'] and (STROKE_LEN(e) >= MIN_LENGTH or i in spec['keep_short'])]
    # rotate so that A -> B points straight down
    ang = math.atan2(B[0] - A[0], B[1] - A[1])
    c, s_ = math.cos(ang), math.sin(ang)
    rot = lambda p: ((p[0] - A[0]) * c - (p[1] - A[1]) * s_, (p[0] - A[0]) * s_ + (p[1] - A[1]) * c)
    for i, y in spec.get('cut_below', {}).items():   # shorten a stroke: drop its points below y
        strokes[i] = [p for p in strokes[i] if p[1] <= y]
    paths = [[rot(p) for p in smooth(resample(strokes[i]))] for i in keep]
    # lines added by hand, in the picture's pixels (e.g. the hems of her leggings)
    paths += [[rot(p) for p in resample(line)] for line in spec.get('add', [])]
    us = [p[0] for e in paths for p in e]
    vs = [p[1] for e in paths for p in e]
    m = 12
    scale = min((200 - m) / max(-min(us), 1e-6), (200 - m) / max(max(us), 1e-6), (400 - 2 * m) / (max(vs) - min(vs)))
    top = (400 - scale * (max(vs) + min(vs))) / 2
    box = lambda p: (200 + p[0] * scale, top + p[1] * scale)
    out = []
    for e in paths:
        e = simplify([box(p) for p in e], 0.3)
        if math.dist(e[0], e[-1]) < 1.5 and len(e) > 3:      # a loop: start at its top
            e = e[:-1]
            k = min(range(len(e)), key=lambda j: e[j][1])
            e = e[k:] + e[:k + 1]
        elif e[-1][1] < e[0][1]:                            # written from its higher end
            e = e[::-1]
        out.append(e)
    out.sort(key=lambda e: min(p[1] for p in e))
    f = lambda v: (f"{v:.1f}"[:-2] if f"{v:.1f}".endswith('.0') else f"{v:.1f}")
    d = ['M' + ' L'.join(f'{f(x)} {f(y)}' for x, y in e) for e in out]
    return {'alt': spec['alt'], 'top': round(top + 0 * scale, 1), 'bottom': round(top + rot(B)[1] * scale, 1), 'paths': d}


STROKE_LEN = None

if __name__ == '__main__':
    result = {}
    for name, spec in DRAWINGS.items():
        path = os.path.join(SOURCES, spec['source'])
        strokes, STROKE_LEN = strokes_of(path)
        strokes = [list(e) for e in strokes]
        if '--preview' in sys.argv:
            preview(name, strokes, Image.open(path).size)
        result[name] = fit(name, spec, strokes)
        print(name, len(strokes), 'strokes traced,', len(result[name]['paths']), 'kept')
    with open(os.path.join(HERE, 'traced.json'), 'w') as fh:
        json.dump(result, fh, indent=1)
        fh.write('\n')
