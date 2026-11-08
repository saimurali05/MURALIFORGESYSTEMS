// Scroll-triggered reveals: one shared IntersectionObserver, class toggling only (no React state per element).
// Content is visible by default; CSS hides it only while `.js` is set and the element has not yet intersected.
import { createElement, useEffect, useRef } from 'react';
import type { ReactNode, CSSProperties } from 'react';

let io: IntersectionObserver | null = null;
function observer() {
  if (io || typeof IntersectionObserver === 'undefined') return io;
  io = new IntersectionObserver((entries) => {
    for (const e of entries) if (e.isIntersecting) { (e.target as HTMLElement).classList.add('in'); io!.unobserve(e.target); }
  }, { rootMargin: '0px 0px -6% 0px', threshold: 0.01 });
  return io;
}
export function useReveal<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const o = observer();
    if (!o) { el.classList.add('in'); return; }
    o.observe(el);
    return () => o.unobserve(el);
  }, []);
  return ref;
}

export type Variant = 'up' | 'rise' | 'left' | 'right' | 'mask' | 'maskv' | 'focus' | 'line' | 'none';
export function Reveal({ as = 'div', variant = 'up', i = 0, className = '', style, children, ...rest }: { as?: string; variant?: Variant; i?: number; className?: string; style?: CSSProperties; children?: ReactNode; [k: string]: any }) {
  const ref = useReveal<HTMLElement>();
  return createElement(as, { ref, className: `rv rv--${variant} ${className}`, style: { ...style, ['--i' as any]: i }, ...rest }, children);
}

/** Headline whose lines are masked and rise into place. `lines` are authored explicitly so no layout is measured. */
export function Headline({ lines, as = 'h2', className = '', accent, id }: { lines: string[]; as?: string; className?: string; accent?: number; id?: string }) {
  const ref = useReveal<HTMLElement>();
  return createElement(as, { ref, id, className: `display rv ${className}` },
    lines.map((l, k) => createElement('span', { key: k, className: 'ln', style: { ['--l' as any]: k } }, createElement('span', { className: accent === k ? 'copper-text' : '' }, l))));
}
