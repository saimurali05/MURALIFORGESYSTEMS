// Cursor-following diffuse light. One shared rAF loop (motion controller); coordinates are written as CSS vars,
// never React state. Disabled on touch + reduced motion. The light layer itself is pointer-events:none.
import { useEffect } from 'react';
import type { RefObject } from 'react';
import { motion } from './controller';
import { damp } from './tokens';

export function useCursorLight(ref: RefObject<HTMLElement>, rate = 6.5) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let x = 0, y = 0, tx = 0, ty = 0, seeded = false;
    const onMove = (e: PointerEvent) => {
      if (e.pointerType === 'touch' || motion.state.reduced) return;
      const r = el.getBoundingClientRect();
      tx = e.clientX - r.left; ty = e.clientY - r.top;
      if (!seeded) { x = tx; y = ty; seeded = true; }
      el.classList.add('has-pointer');
    };
    const onLeave = () => el.classList.remove('has-pointer');
    el.addEventListener('pointermove', onMove, { passive: true });
    el.addEventListener('pointerleave', onLeave);
    const unsub = motion.subscribe((s) => {
      if (s.reduced || s.touch || !seeded) return;
      const k = damp(rate, s.dt);
      x += (tx - x) * k; y += (ty - y) * k;
      el.style.setProperty('--lx', x.toFixed(1) + 'px');
      el.style.setProperty('--ly', y.toFixed(1) + 'px');
    }, el);
    return () => { el.removeEventListener('pointermove', onMove); el.removeEventListener('pointerleave', onLeave); unsub(); };
  }, [ref, rate]);
}
