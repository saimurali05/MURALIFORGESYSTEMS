# Extracts the MFS logo from the paper mockup into a transparent PNG.
# Colours are preserved (un-matted from the paper), shapes untouched; only the paper is removed and the empty margin trimmed.
import sys, numpy as np, cv2
src, out = sys.argv[1], sys.argv[2]
im = cv2.imread(src, cv2.IMREAD_COLOR).astype(np.float32)  # BGR
H, W = im.shape[:2]
k = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (61, 61))
bg = np.stack([cv2.morphologyEx(im[..., c], cv2.MORPH_CLOSE, k) for c in range(3)], -1)
bg = cv2.GaussianBlur(bg, (0, 0), 12)
lum = lambda a: 0.114 * a[..., 0] + 0.587 * a[..., 1] + 0.299 * a[..., 2]
Lb, L = lum(bg), lum(im)
Lcore = 108.0  # luminance at which the brightest logo blue is fully opaque
a = np.clip((Lb - L) / (Lb - Lcore), 0, 1)
a[a < 0.06] = 0
# un-matte colour from the paper
ac = np.maximum(a, 1e-3)[..., None]
col = np.clip((im - bg * (1 - a[..., None])) / ac, 0, 255)
rgba = np.dstack([col, (a * 255)]).astype(np.uint8)
ys, xs = np.where(a > 0.15)
# drop speckle: keep bounding box of significant components
n, lab, stats, _ = cv2.connectedComponentsWithStats((a > 0.15).astype(np.uint8), 8)
keep = [i for i in range(1, n) if stats[i, cv2.CC_STAT_AREA] > 40]
mask = np.isin(lab, keep)
rgba[..., 3] = np.where(mask | (cv2.dilate(mask.astype(np.uint8), np.ones((5, 5))) > 0), rgba[..., 3], 0)
ys, xs = np.where(rgba[..., 3] > 20)
pad = 6
y0, y1, x0, x1 = max(ys.min() - pad, 0), min(ys.max() + pad, H), max(xs.min() - pad, 0), min(xs.max() + pad, W)
cv2.imwrite(out, rgba[y0:y1, x0:x1])
print("bbox", x0, y0, x1, y1, "->", rgba[y0:y1, x0:x1].shape)
