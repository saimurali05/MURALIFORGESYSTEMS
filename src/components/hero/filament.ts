// Geometry + animation model for the MFS signature filament artwork.
// Coordinates are in the REFERENCE art space (634 × 392) traced from references/MFS-filament-background-reference.png:
// focal convergence ≈ (295, 214); the left bundle enters from the top-left; three right-hand bundles (upper crest,
// flat middle, lower U) rise/fall to the right edge. Every strand is a hairline; richness comes from fibre count,
// per-fibre phase, additive light and timing — never from stroke width.
export const ART_W = 634;
export const ART_H = 392;
export const FOCAL = { x: 295, y: 214 };

/** motion intensity knobs (hero must read as continuously alive, not as a still image) */
export const FLOW = 3.4, BREATH = 1.9, WOB = 1.7, RIDE = 4.2;
export type Tone = 'steel' | 'copper' | 'champagne';
export interface BundleDef {
  id: string;
  pts: [number, number][];
  count: number;
  /** half-width profile: [u, art-units]; interpolated smoothly */
  wp: [number, number][];
  twist: number;         // shared twist rate (cos(pi*(twist*u+b)))
  twistB: number;
  grad: string;          // gradient family id
  copperFrac: number;
  champFrac: number;
  breath: number;        // centreline breathing amplitude (art units)
  speed: number;         // rad/s of breathing; sign = direction
  wRange: [number, number];   // stroke width css-px
  oRange: [number, number];   // opacity of ordinary fibres
  rim: number;           // fraction of fibres that sit on the rim and glow brighter
  hl: number;            // number of travelling highlight fibres
  hlSpeed: number;
}

export const BUNDLES: BundleDef[] = [
  { id: 'L', pts: [[6, -8], [24, 32], [48, 72], [80, 112], [112, 150], [146, 184], [184, 199], [226, 203], [262, 208], [295, 214]],
    count: 30, wp: [[0, 0], [0.1, 3], [0.28, 15], [0.46, 26], [0.64, 16], [0.8, 9], [0.92, 4.5], [1, 0]], twist: 0.38, twistB: 0.0, grad: 'left', copperFrac: 0.46, champFrac: 0.08,
    breath: 1.5, speed: 0.31, wRange: [0.4, 0.8], oRange: [0.22, 0.6], rim: 0.24, hl: 8, hlSpeed: 0.055 },
  { id: 'R1', pts: [[295, 214], [325, 205], [358, 191], [392, 172], [424, 156], [455, 149], [484, 156], [509, 178], [533, 214], [562, 252], [595, 280], [640, 296]],
    count: 36, wp: [[0, 0], [0.07, 3], [0.2, 11], [0.38, 18], [0.55, 23], [0.72, 22], [0.88, 20], [1, 20]], twist: 0.3, twistB: 0.02, grad: 'mix', copperFrac: 0.64, champFrac: 0.1,
    breath: 2.4, speed: -0.26, wRange: [0.4, 0.85], oRange: [0.24, 0.66], rim: 0.22, hl: 12, hlSpeed: 0.045 },
  { id: 'R2', pts: [[295, 214], [335, 204], [380, 190], [420, 178], [458, 176], [492, 190], [525, 212], [560, 232], [598, 240], [640, 238]],
    count: 22, wp: [[0, 0], [0.08, 2.5], [0.25, 8], [0.5, 12], [0.75, 14], [1, 15]], twist: 0.3, twistB: 0.1, grad: 'steelRight', copperFrac: 0.14, champFrac: 0.05,
    breath: 1.8, speed: 0.22, wRange: [0.4, 0.8], oRange: [0.22, 0.58], rim: 0.2, hl: 8, hlSpeed: 0.05 },
  { id: 'R3', pts: [[295, 214], [340, 211], [395, 203], [445, 200], [490, 206], [530, 222], [565, 243], [600, 262], [640, 272]],
    count: 14, wp: [[0, 0], [0.1, 2], [0.35, 6], [0.7, 8], [1, 9]], twist: 0.26, twistB: 0.0, grad: 'mix', copperFrac: 0.55, champFrac: 0.12,
    breath: 1.4, speed: -0.34, wRange: [0.4, 0.75], oRange: [0.22, 0.56], rim: 0.18, hl: 6, hlSpeed: 0.06 },
  { id: 'R4', pts: [[295, 214], [315, 235], [345, 266], [385, 304], [430, 333], [475, 350], [520, 342], [560, 322], [600, 303], [640, 292]],
    count: 34, wp: [[0, 0], [0.08, 3], [0.22, 11], [0.45, 20], [0.62, 24], [0.82, 22], [1, 20]], twist: 0.28, twistB: -0.04, grad: 'lower', copperFrac: 0.22, champFrac: 0.06,
    breath: 2.2, speed: 0.24, wRange: [0.4, 0.85], oRange: [0.24, 0.66], rim: 0.22, hl: 10, hlSpeed: 0.04 },
  { id: 'R5', pts: [[295, 214], [330, 244], [372, 276], [418, 303], [466, 320], [515, 318], [560, 307], [600, 297], [640, 286]],
    count: 16, wp: [[0, 0], [0.1, 2.5], [0.3, 8], [0.6, 11], [1, 10]], twist: 0.3, twistB: 0.1, grad: 'lower', copperFrac: 0.2, champFrac: 0.05,
    breath: 1.6, speed: -0.29, wRange: [0.4, 0.75], oRange: [0.22, 0.55], rim: 0.18, hl: 6, hlSpeed: 0.052 },
  // very fine copper filaments wandering through the node field (the "web" in the reference)
  { id: 'W1', pts: [[326, 262], [364, 282], [412, 294], [470, 297], [528, 288], [584, 270], [640, 252]], count: 2, wp: [[0, 1], [1, 3]], twist: 0.5, twistB: 0.2, grad: 'web', copperFrac: 1, champFrac: 0,
    breath: 3, speed: 0.18, wRange: [0.35, 0.5], oRange: [0.22, 0.4], rim: 0, hl: 0, hlSpeed: 0 },
  { id: 'W2', pts: [[318, 246], [366, 262], [428, 272], [496, 264], [556, 247], [616, 256]], count: 2, wp: [[0, 1], [1, 3]], twist: 0.7, twistB: 0.0, grad: 'web', copperFrac: 1, champFrac: 0,
    breath: 3, speed: -0.2, wRange: [0.35, 0.5], oRange: [0.22, 0.4], rim: 0, hl: 0, hlSpeed: 0 },
  { id: 'W3', pts: [[330, 228], [372, 238], [420, 232], [470, 238], [520, 252], [572, 262], [630, 258]], count: 2, wp: [[0, 1], [1, 3]], twist: 0.6, twistB: 0.1, grad: 'web', copperFrac: 1, champFrac: 0,
    breath: 3, speed: 0.15, wRange: [0.3, 0.45], oRange: [0.16, 0.32], rim: 0, hl: 0, hlSpeed: 0 },
  { id: 'W4', pts: [[372, 300], [420, 314], [470, 312], [524, 302], [580, 296], [634, 284]], count: 2, wp: [[0, 1], [1, 3]], twist: 0.6, twistB: 0.3, grad: 'web', copperFrac: 1, champFrac: 0,
    breath: 3, speed: -0.17, wRange: [0.3, 0.45], oRange: [0.16, 0.32], rim: 0, hl: 0, hlSpeed: 0 },
  { id: 'LC', pts: [[108, 268], [135, 258], [165, 240], [195, 220], [228, 210], [262, 210], [295, 214]], count: 3, wp: [[0, 1], [1, 3]], twist: 0.5, twistB: 0.1, grad: 'left', copperFrac: 1, champFrac: 0.3,
    breath: 1.5, speed: 0.27, wRange: [0.4, 0.6], oRange: [0.3, 0.55], rim: 0, hl: 2, hlSpeed: 0.05 },
];

export function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}

/** Catmull–Rom → dense polyline with cumulative length */
function densify(pts: [number, number][], per = 24) {
  const P = [pts[0], ...pts, pts[pts.length - 1]];
  const out: [number, number][] = [];
  for (let i = 0; i < P.length - 3; i++) {
    const [p0, p1, p2, p3] = [P[i], P[i + 1], P[i + 2], P[i + 3]];
    for (let k = 0; k < per; k++) {
      const t = k / per, t2 = t * t, t3 = t2 * t;
      out.push([
        0.5 * (2 * p1[0] + (-p0[0] + p2[0]) * t + (2 * p0[0] - 5 * p1[0] + 4 * p2[0] - p3[0]) * t2 + (-p0[0] + 3 * p1[0] - 3 * p2[0] + p3[0]) * t3),
        0.5 * (2 * p1[1] + (-p0[1] + p2[1]) * t + (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * t2 + (-p0[1] + 3 * p1[1] - 3 * p2[1] + p3[1]) * t3),
      ]);
    }
  }
  out.push(pts[pts.length - 1]);
  const len = [0];
  for (let i = 1; i < out.length; i++) len.push(len[i - 1] + Math.hypot(out[i][0] - out[i - 1][0], out[i][1] - out[i - 1][1]));
  return { pts: out, len };
}

export const SAMPLES = 40;
const smooth = (x: number) => x * x * (3 - 2 * x);
function profile(wp: [number, number][], u: number) {
  if (u <= wp[0][0]) return wp[0][1];
  for (let i = 1; i < wp.length; i++) {
    if (u <= wp[i][0]) { const f = (u - wp[i - 1][0]) / (wp[i][0] - wp[i - 1][0]); return wp[i - 1][1] + (wp[i][1] - wp[i - 1][1]) * smooth(f); }
  }
  return wp[wp.length - 1][1];
}

export interface Strand {
  bundle: BundleDef;
  tone: Tone;
  s: number;            // lateral spread -1..1
  width: number;
  opacity: number;
  psi: number;          // phase
  wob: number;          // personal wobble amplitude (art units)
  wobF: number;
  wobW: number;
  tw: number;           // personal twist phase offset
  twRate: number;       // personal twist rate offset
  pts: Float32Array;    // current frame sample points (x,y interleaved)
  hl: boolean;
  hlPhase: number;
  hlSpeed: number;
  spray?: { u0: number; side: number; ang: number; len: number; curl: number; sway: number };
  fade?: boolean;       // spray strands fade towards their free end
}
interface BundleGeo { cx: Float32Array; cy: Float32Array; nx: Float32Array; ny: Float32Array; tx: Float32Array; ty: Float32Array; len: number; }

export class FilamentModel {
  strands: Strand[] = [];
  private geo = new Map<string, BundleGeo>();
  constructor(density = 1, seed = 20261028) {
    const rnd = mulberry32(seed);
    for (const b of BUNDLES) {
      const d = densify(b.pts);
      const total = d.len[d.len.length - 1];
      const cx = new Float32Array(SAMPLES), cy = new Float32Array(SAMPLES), nx = new Float32Array(SAMPLES), ny = new Float32Array(SAMPLES), tx = new Float32Array(SAMPLES), ty = new Float32Array(SAMPLES);
      let j = 0;
      for (let k = 0; k < SAMPLES; k++) {
        const target = (k / (SAMPLES - 1)) * total;
        while (j < d.len.length - 2 && d.len[j + 1] < target) j++;
        const seg = d.len[j + 1] - d.len[j] || 1, f = (target - d.len[j]) / seg;
        cx[k] = d.pts[j][0] + (d.pts[j + 1][0] - d.pts[j][0]) * f;
        cy[k] = d.pts[j][1] + (d.pts[j + 1][1] - d.pts[j][1]) * f;
      }
      for (let k = 0; k < SAMPLES; k++) {
        const a = Math.max(0, k - 1), c = Math.min(SAMPLES - 1, k + 1);
        const dx = cx[c] - cx[a], dy = cy[c] - cy[a], m = Math.hypot(dx, dy) || 1;
        tx[k] = dx / m; ty[k] = dy / m; nx[k] = -dy / m; ny[k] = dx / m;
      }
      this.geo.set(b.id, { cx, cy, nx, ny, tx, ty, len: total });
      const n = b.count <= 4 ? b.count : Math.max(6, Math.round(b.count * density));
      const hlIdx = new Set<number>();
      const hlN = Math.min(n, Math.max(b.hl ? 1 : 0, Math.round(b.hl * (density < 1 ? 0.6 : 1))));
      while (hlIdx.size < hlN) hlIdx.add(Math.floor(rnd() * n));
      for (let i = 0; i < n; i++) {
        const rim = rnd() < b.rim;
        const g = rim ? (rnd() < 0.5 ? -1 : 1) * (0.78 + rnd() * 0.22) : (rnd() + rnd() - 1) * 0.98;
        const r = rnd();
        const tone: Tone = r < b.champFrac ? 'champagne' : r < b.champFrac + b.copperFrac ? 'copper' : 'steel';
        const o0 = b.oRange[0] + rnd() * (b.oRange[1] - b.oRange[0]);
        this.strands.push({
          bundle: b, tone, s: Math.max(-1, Math.min(1, g)),
          width: b.wRange[0] + rnd() * (b.wRange[1] - b.wRange[0]),
          opacity: Math.min(1, o0 * (rim ? 1.7 : 1)),
          psi: rnd() * Math.PI * 2, wob: 0.15 + rnd() * 0.85, wobF: 1.2 + rnd() * 2.4, wobW: (0.16 + rnd() * 0.3) * (rnd() < 0.5 ? -1 : 1),
          tw: (rnd() - 0.5) * 0.34, twRate: (rnd() - 0.5) * 0.4, pts: new Float32Array(SAMPLES * 2), hl: hlIdx.has(i),
          hlPhase: rnd(), hlSpeed: b.hlSpeed * (0.8 + rnd() * 0.5),
        });
      }
    }
    // fan of fine copper filaments leaving the left ribbon (the spray above/around it in the reference)
    const sprayN = Math.round(96 * density);
    const bL = BUNDLES[0];
    for (let i = 0; i < sprayN; i++) {
      const copper = rnd() < 0.82;
      this.strands.push({
        bundle: bL, tone: copper ? (rnd() < 0.2 ? 'champagne' : 'copper') : 'steel', s: 0, width: 0.35 + rnd() * 0.35, opacity: 0.4 + rnd() * 0.55,
        psi: rnd() * 6.28, wob: 0, wobF: 1, wobW: 0.3, tw: 0, twRate: 0, pts: new Float32Array(SAMPLES * 2), hl: false, hlPhase: 0, hlSpeed: 0, fade: true,
        spray: { u0: 0.2 + Math.pow(rnd(), 1.1) * 0.58, side: rnd() < 0.62 ? -1 : 1, ang: 0.12 + rnd() * 0.7, len: 18 + rnd() * rnd() * 85 + 10, curl: (rnd() - 0.35) * 0.95, sway: 0.5 + rnd() * 1.6 },
      });
    }
    this.update(0);
  }

  /** advance the geometry to time t (seconds). Pure sinusoids, so the loop never snaps or resets. */
  update(t0: number) {
    const t = t0 * FLOW; // internal time: everything is a pure sinusoid of t, so any FLOW keeps the loop seamless
    for (const st of this.strands) {
      const b = st.bundle, g = this.geo.get(b.id)!;
      if (st.spray) {
        const sp = st.spray;
        const f = sp.u0 * (SAMPLES - 1), i0 = Math.min(SAMPLES - 2, Math.floor(f)), r = f - i0;
        const bx = g.cx[i0] + (g.cx[i0 + 1] - g.cx[i0]) * r, by = g.cy[i0] + (g.cy[i0 + 1] - g.cy[i0]) * r;
        const tx = g.tx[i0], ty = g.ty[i0], nx = g.nx[i0] * sp.side, ny = g.ny[i0] * sp.side;
        const ang = sp.ang + 0.09 * Math.sin(0.23 * t * sp.sway + st.psi);
        const dx = tx * Math.cos(ang) + nx * Math.sin(ang), dy = ty * Math.cos(ang) + ny * Math.sin(ang);
        // lateral anchor jitter keeps the root riding inside the ribbon (it breathes with it)
        const root = (profile(b.wp, sp.u0) * 0.5) * Math.sin(0.4 * t + st.psi) * 0.4;
        const sx = bx + g.nx[i0] * root, sy = by + g.ny[i0] * root;
        for (let k = 0; k < SAMPLES; k++) {
          const v = k / (SAMPLES - 1);
          const bow = sp.curl * sp.len * 0.5 * Math.sin(Math.PI * v) * (1 + 0.18 * Math.sin(0.5 * t * sp.sway + st.psi));
          st.pts[2 * k] = sx + dx * sp.len * v + -dy * bow * 0.0 + nx * bow;
          st.pts[2 * k + 1] = sy + dy * sp.len * v + ny * bow;
        }
        continue;
      }
      const drift = 0.14 * Math.sin(0.11 * t * Math.sign(b.speed || 1) + st.psi * 0.3);
      const web = b.count <= 4;
      for (let k = 0; k < SAMPLES; k++) {
        const u = k / (SAMPLES - 1);
        const hw = profile(b.wp, u);
        const breath = b.breath * BREATH * Math.sin(Math.PI * u) * (Math.sin(6.283 * 0.9 * u + b.speed * t + st.psi * 0.05) + 0.5 * Math.sin(6.283 * 2.1 * u - b.speed * 0.73 * t));
        const twist = Math.cos(Math.PI * ((b.twist + st.twRate) * u + b.twistB + drift + st.tw));
        const lateral = st.s * hw * twist + (web ? 0 : st.wob * WOB * Math.min(1, hw / 6) * Math.sin(6.283 * st.wobF * u + st.wobW * t + st.psi)) + breath;
        st.pts[2 * k] = g.cx[k] + g.nx[k] * lateral;
        st.pts[2 * k + 1] = g.cy[k] + g.ny[k] * lateral;
      }
    }
  }

  /** position of a point at fraction u along a strand (linear between samples) */
  at(st: Strand, u: number, out: { x: number; y: number }) {
    const f = Math.max(0, Math.min(1, u)) * (SAMPLES - 1), i = Math.min(SAMPLES - 2, Math.floor(f)), r = f - i;
    out.x = st.pts[2 * i] * (1 - r) + st.pts[2 * i + 2] * r; out.y = st.pts[2 * i + 1] * (1 - r) + st.pts[2 * i + 3] * r;
  }
}

/** Map a container size to the art viewBox (cover-style crop; convergence offset right so copy keeps negative space). */
export interface ArtView { s: number; x0: number; y0: number; w: number; h: number; mode: 'ref' | 'wide' | 'mobile'; }
export function computeView(w: number, h: number, ref = false): ArtView {
  if (ref) return { s: 1, x0: 0, y0: 0, w, h, mode: 'ref' };
  if (w < 760) {
    const s = (w / ART_W) * 1.45;
    return { s, x0: FOCAL.x - 0.48 * (w / s), y0: FOCAL.y - 0.84 * (h / s), w, h, mode: 'mobile' };
  }
  const fx = w >= 1100 ? 0.6 : 0.52;
  const s = Math.max(h / ART_H, ((1 - fx) * w) / 339);
  return { s, x0: FOCAL.x - fx * (w / s), y0: (ART_H - h / s) / 2, w, h, mode: 'wide' };
}

/** smooth cubic path through control points (Catmull–Rom → Bézier) — for static decorative arcs & halos */
export function smoothPathD(pts: [number, number][], tension = 0.5): string {
  if (pts.length < 2) return '';
  const P = [pts[0], ...pts, pts[pts.length - 1]];
  let d = `M${pts[0][0]} ${pts[0][1]}`;
  for (let i = 1; i < P.length - 2; i++) {
    const [p0, p1, p2, p3] = [P[i - 1], P[i], P[i + 1], P[i + 2]];
    const c1 = [p1[0] + ((p2[0] - p0[0]) * tension) / 3, p1[1] + ((p2[1] - p0[1]) * tension) / 3];
    const c2 = [p2[0] - ((p3[0] - p1[0]) * tension) / 3, p2[1] - ((p3[1] - p1[1]) * tension) / 3];
    d += `C${c1[0].toFixed(1)} ${c1[1].toFixed(1)} ${c2[0].toFixed(1)} ${c2[1].toFixed(1)} ${p2[0]} ${p2[1]}`;
  }
  return d;
}

export type Stop = [number, string, number];
export const GRADS: Record<string, Record<Tone, Stop[]>> = {
  left: {
    steel: [[0, '#8C8173', 0], [0.06, '#8C8173', 0.5], [0.2, '#857F73', 0.72], [0.34, '#6E716B', 0.82], [0.43, '#3E4443', 0.92], [0.465, '#343A3A', 1], [1, '#343A3A', 1]],
    copper: [[0, '#B08C55', 0], [0.06, '#B08C55', 0.45], [0.2, '#B5925C', 0.8], [0.34, '#BF9F68', 0.95], [0.44, '#B99865', 1], [1, '#B99865', 1]],
    champagne: [[0, '#B99865', 0], [0.1, '#B99865', 0.55], [0.3, '#B99865', 0.9], [0.465, '#343A3A', 1], [1, '#343A3A', 1]],
  },
  mix: {
    steel: [[0, '#343A3A', 1], [0.46, '#343A3A', 1], [0.55, '#5A5F5B', 0.95], [0.7, '#6E716B', 0.9], [0.82, '#8C8173', 0.8], [1, '#8C8173', 0.7]],
    copper: [[0, '#B99865', 1], [0.46, '#B99865', 1], [0.55, '#B8955E', 1], [0.68, '#B08C55', 1], [0.9, '#B5925C', 0.95], [1, '#B08C55', 0.85]],
    champagne: [[0, '#343A3A', 1], [0.46, '#343A3A', 1], [0.75, '#B99865', 1], [1, '#B99865', 0.9]],
  },
  steelRight: {
    steel: [[0, '#343A3A', 0.95], [0.46, '#343A3A', 0.95], [0.7, '#6E716B', 0.85], [1, '#8C8173', 0.65]],
    copper: [[0, '#B99865', 0.9], [0.46, '#B99865', 0.9], [1, '#B08C55', 0.65]],
    champagne: [[0, '#343A3A', 1], [1, '#B99865', 0.7]],
  },
  lower: {
    steel: [[0, '#343A3A', 1], [0.46, '#343A3A', 1], [0.6, '#5A5F5B', 0.95], [0.8, '#6E716B', 0.9], [1, '#8C8173', 0.8]],
    copper: [[0, '#B99865', 0.9], [0.46, '#B99865', 0.9], [0.7, '#B08C55', 0.85], [1, '#B08C55', 1]],
    champagne: [[0, '#343A3A', 1], [1, '#B99865', 1]],
  },
  web: {
    steel: [[0, '#8C8173', 0], [0.5, '#8C8173', 0.9], [1, '#8C8173', 0.5]],
    copper: [[0, '#B08C55', 0], [0.5, '#B08C55', 1], [1, '#B08C55', 0.7]],
    champagne: [[0, '#B99865', 0], [0.5, '#B99865', 1], [1, '#B99865', 0.7]],
  },
};
