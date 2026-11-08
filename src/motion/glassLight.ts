// Glass lighting. ONE delegated pointer listener for the whole page — no per-card listeners, no React state.
// For the pane under the pointer (and up to two glass ancestors) it writes --mx/--my (px, relative to that pane) and
// toggles .is-lit; CSS then paints the cursor-lit rim + inner glow. Buttons get --bx/--by for their sheen, and
// [data-tilt] panes get a few degrees of perspective tilt. Fine pointers only; off for touch and reduced motion.
import { motion } from './controller';

const LIT = '.glass, .demo__panel, .demo__meet, .oc, .contact__form, .demo__headline, .demo__invite, .faq, .mm-vp, .demo__idle';
const MAX_TILT = 2.6; // degrees

export function initGlassLight() {
  if (typeof window === 'undefined' || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

  let lit: HTMLElement[] = [];
  let tilt: HTMLElement | null = null;
  let px = 0, py = 0, raf = 0, active = false;

  const clearLit = () => { lit.forEach((n) => n.classList.remove('is-lit')); lit = []; };
  const clearTilt = () => { if (tilt) { tilt.style.removeProperty('--rx'); tilt.style.removeProperty('--ry'); tilt = null; } };

  const frame = () => {
    raf = 0;
    if (!active || motion.state.reduced) return;
    const target = document.elementFromPoint(px, py); // also correct while the page scrolls under a still pointer
    // panes: closest + two glass ancestors
    const chain: HTMLElement[] = [];
    let n = target ? (target.closest(LIT) as HTMLElement | null) : null;
    while (n && chain.length < 3) { chain.push(n); n = n.parentElement ? (n.parentElement.closest(LIT) as HTMLElement | null) : null; }
    lit.forEach((o) => { if (!chain.includes(o)) o.classList.remove('is-lit'); });
    chain.forEach((o) => {
      const r = o.getBoundingClientRect();
      o.style.setProperty('--mx', (px - r.left).toFixed(0) + 'px');
      o.style.setProperty('--my', (py - r.top).toFixed(0) + 'px');
      o.classList.add('is-lit');
    });
    lit = chain;

    // buttons: sheen follows the pointer
    const b = target ? (target.closest('.btn, .chip') as HTMLElement | null) : null;
    if (b) {
      const r = b.getBoundingClientRect();
      b.style.setProperty('--bx', (px - r.left).toFixed(0) + 'px');
      b.style.setProperty('--by', (py - r.top).toFixed(0) + 'px');
    }

    // tilt
    const t = target ? (target.closest('[data-tilt]') as HTMLElement | null) : null;
    if (tilt && tilt !== t) clearTilt();
    if (t) {
      const r = t.getBoundingClientRect();
      const nx = ((px - r.left) / r.width - 0.5) * 2, ny = ((py - r.top) / r.height - 0.5) * 2;
      t.style.setProperty('--ry', (nx * MAX_TILT).toFixed(2) + 'deg');
      t.style.setProperty('--rx', (-ny * MAX_TILT).toFixed(2) + 'deg');
      tilt = t;
    }
  };

  const onMove = (e: PointerEvent) => {
    if (e.pointerType === 'touch' || motion.state.reduced) return;
    px = e.clientX; py = e.clientY; active = true;
    if (!raf) raf = requestAnimationFrame(frame);
  };
  const onLeave = () => { active = false; clearLit(); clearTilt(); };
  window.addEventListener('pointermove', onMove, { passive: true });
  document.documentElement.addEventListener('pointerleave', onLeave);
  window.addEventListener('blur', onLeave);
  // a scroll moves panes under a still pointer: refresh once per frame while scrolling
  window.addEventListener('scroll', () => { if (active && !raf) raf = requestAnimationFrame(frame); }, { passive: true });
}
