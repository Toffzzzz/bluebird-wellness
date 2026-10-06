"""Makes a thinner version of the Bluebird logo for the Signature line drawing.

The logo (images/logo/bluebird-mark.svg) is drawn with thick, tapering
strokes. This keeps its exact shape and taper but makes every stroke
THICKNESS times as thick (e.g. 0.4 = 40%), so the bird matches the fine
line drawings. It writes images/logo/bluebird-mark-thin.svg, which
make-line-art.py uses. The site's own logo (header, footer) is unchanged.

Run:  python3 scripts/line-art/thin-logo.py
Needs: numpy, scipy, scikit-image (pip install numpy scipy scikit-image).
"""
import os, re
import numpy as np
from scipy import ndimage
from skimage import draw, measure, morphology

THICKNESS = 0.55    # share of the original stroke thickness
SCALE = 6           # raster pixels per logo unit while working (finer = smoother)
MIN_RADIUS = 1.6    # logo units: the thinnest a stroke gets (keeps the tips)
TOLERANCE = 0.12    # logo units: how closely the outline follows the shape

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..')
src = open(os.path.join(ROOT, 'images', 'logo', 'bluebird-mark.svg')).read()
view = [float(v) for v in re.search(r'viewBox="([^"]+)"', src).group(1).split()]
d = re.search(r' d="([^"]+)"', src).group(1)
W, H = view[2], view[3]

# 1. The logo as pixels (its path is straight segments only).
mask = np.zeros((int(H * SCALE) + 4, int(W * SCALE) + 4), bool)
for sub in [s for s in d.split('Z') if s.strip()]:
    nums = [float(v) for v in re.findall(r'-?\d+(?:\.\d+)?', sub)]
    xs, ys = np.array(nums[0::2]) * SCALE, np.array(nums[1::2]) * SCALE
    rr, cc = draw.polygon(ys, xs, mask.shape)
    mask[rr, cc] = True

# 2. Each stroke's middle line, and how thick the stroke is all along it.
skeleton = morphology.skeletonize(mask)
half = ndimage.distance_transform_edt(mask)

# 3. The same strokes, thinner: a disc at every point of the middle line.
thin = np.zeros_like(mask)
for r, c in zip(*np.nonzero(skeleton)):
    radius = max(half[r, c] * THICKNESS, MIN_RADIUS * SCALE)
    rr, cc = draw.disk((r, c), radius, shape=thin.shape)
    thin[rr, cc] = True
thin = ndimage.binary_closing(thin, iterations=2)
# Close the tiny gaps the middle lines leave at the strokes' tips (not the spaces between strokes).
HOLE = int((14 * SCALE) ** 2)
try:
    thin = morphology.remove_small_holes(thin, max_size=HOLE)        # scikit-image 0.26 and later
except TypeError:
    thin = morphology.remove_small_holes(thin, area_threshold=HOLE)  # earlier versions

# 4. Back to a smooth outline, in the logo's own units.
paths = []
for contour in measure.find_contours(ndimage.gaussian_filter(thin.astype(float), 1.2), 0.5):
    poly = measure.approximate_polygon(contour, TOLERANCE * SCALE)
    if len(poly) < 4:
        continue
    pts = [f"{c / SCALE:.2f} {r / SCALE:.2f}" for r, c in poly]
    paths.append('M' + ' L'.join(pts) + ' Z')

out = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="{view[0]:g} {view[1]:g} {W:g} {H:g}" fill="currentColor">
  <!-- The Bluebird logo with thinner strokes (made by scripts/line-art/thin-logo.py from bluebird-mark.svg) -->
  <path d="{' '.join(paths)}"/>
</svg>
'''
open(os.path.join(ROOT, 'images', 'logo', 'bluebird-mark-thin.svg'), 'w').write(out)
print('ok', len(paths), 'outlines,', sum(p.count('L') for p in paths), 'points')
