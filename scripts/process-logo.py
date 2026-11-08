"""Cut the MFS logo out of its paper mockup WITHOUT recolouring it.
Background paper is estimated per-pixel (large max-filter), alpha is derived from how much darker the
pixel is than the paper in the red channel (both navy and blue are dark in R), and the foreground colour is
un-mixed from the paper so edge pixels carry no white fringe. Interior pixels are untouched."""
import numpy as np
from PIL import Image
from scipy import ndimage as ndi

src = Image.open('references/MFS-logo-reference.png').convert('RGB')
a = np.asarray(src).astype(np.float32)
H, W, _ = a.shape
# Local paper estimate: grey-closing (max filter) removes the logo, then smooth.
bg = np.empty_like(a)
for c in range(3):
    m = ndi.maximum_filter(a[..., c], size=41)
    bg[..., c] = ndi.gaussian_filter(m, 18)
ratio_r = np.clip(a[..., 0] / np.maximum(bg[..., 0], 1), 0, 1)
alpha = (1 - ratio_r) / 0.93                      # R of logo colours is ~7% of paper R
alpha = np.clip(alpha, 0, 1)
# kill embossed paper shadows/highlights; ramp the real edge
lo, hi = 0.30, 0.58
alpha = np.clip((alpha - lo) / (hi - lo), 0, 1)
alpha = alpha ** 0.9
# un-mix foreground colour from paper
fg = np.where(alpha[..., None] > 0.02,
              (a - (1 - alpha[..., None]) * bg) / np.maximum(alpha[..., None], 0.02), a)
fg = np.clip(fg, 0, 255)
# interior: keep original pixels exactly
solid = alpha > 0.985
fg[solid] = a[solid]
rgba = np.dstack([fg, alpha * 255]).astype(np.uint8)
# remove tiny specks, then crop to content with padding
mask = alpha > 0.35
lab, n = ndi.label(mask)
sizes = ndi.sum(mask, lab, range(1, n + 1))
keep = np.isin(lab, [i + 1 for i, s in enumerate(sizes) if s > 5])   # drop only paper specks; keep bullets, '&', 'AI'
keep = ndi.binary_dilation(keep, iterations=2)
rgba[..., 3] = (rgba[..., 3] * keep).astype(np.uint8)
ys, xs = np.where(rgba[..., 3] > 40)
pad = 14
box = (max(xs.min() - pad, 0), max(ys.min() - pad, 0), min(xs.max() + pad, W), min(ys.max() + pad, H))
out = Image.fromarray(rgba, 'RGBA').crop(box)
out.save('public/assets/mfs-logo.png', optimize=True)
print('logo box', box, 'size', out.size)
# preview on the page charcoal and on champagne for inspection
for name, col in (('charcoal', (23, 21, 22)), ('light', (247, 240, 233))):
    bgimg = Image.new('RGBA', out.size, col + (255,)); bgimg.alpha_composite(out)
    bgimg.convert('RGB').save(f'/tmp/claude-0/-home-claude/bda6dab2-b565-5139-a791-704f0b42d845/scratchpad/logo_on_{name}.png')
