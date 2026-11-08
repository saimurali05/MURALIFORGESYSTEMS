// Shared motion tokens. CSS mirrors these as custom properties in styles/tokens.css.
export const dur = { xs: 140, s: 260, m: 480, l: 820, xl: 1300 } as const;
export const stagger = { tight: 55, base: 90, loose: 140 } as const;
export const ease = {
  out: (t: number) => 1 - Math.pow(1 - t, 3),
  inOut: (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
  soft: (t: number) => 1 - Math.pow(1 - t, 2),
  linear: (t: number) => t,
};
export const intensity = { hero: 1, section: 0.7, quiet: 0.45 } as const;

export const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
/** frame-rate independent exponential smoothing factor */
export const damp = (rate: number, dtSec: number) => 1 - Math.exp(-rate * dtSec);
export const mix = lerp;
export const map = (v: number, a: number, b: number, c: number, d: number) => c + ((v - a) / (b - a)) * (d - c);
export const sat = (v: number) => clamp(v, 0, 1);
