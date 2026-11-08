// FloatingDock — adapted from the supplied dock *pattern* (pointer-distance magnify, hover labels, collapsed mobile stack).
// All content is MFS: six real in-page destinations, no sample social links. Magnify is applied with transforms written
// straight to the DOM (no React state per pointer move). Mobile uses an accessible disclosure menu.
import { useEffect, useRef, useState } from 'react';
import { TbHome2, TbLayoutGrid, TbPlayerPlay, TbRoute, TbInfoCircle, TbMail, TbMenu2, TbX } from 'react-icons/tb';
import { NAV } from '../../data/services';

const ICONS: Record<string, any> = { home: TbHome2, services: TbLayoutGrid, demos: TbPlayerPlay, advantage: TbRoute, about: TbInfoCircle, contact: TbMail };

export function useScrollSpy(ids: readonly string[]) {
  const [active, setActive] = useState<string>(ids[0]);
  useEffect(() => {
    const els = ids.map((id) => document.getElementById(id)).filter(Boolean) as HTMLElement[];
    if (!els.length || !('IntersectionObserver' in window)) return;
    const vis = new Map<string, number>();
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) vis.set(e.target.id, e.isIntersecting ? e.intersectionRatio : 0);
      // the section whose band crosses the reading line wins; ties resolved by document order
      let best = ''; let bestV = 0;
      for (const el of els) { const v = vis.get(el.id) || 0; if (v > bestV) { best = el.id; bestV = v; } }
      if (best) setActive(best);
    }, { rootMargin: '-38% 0px -52% 0px', threshold: [0, 0.01, 0.1, 0.5, 1] });
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [ids.join('|')]);
  return active;
}

export default function FloatingDock({ active }: { active: string }) {
  const dock = useRef<HTMLElement>(null);

  // distance-based magnify, written as CSS vars on each item
  useEffect(() => {
    const el = dock.current; if (!el) return;
    const items = Array.from(el.querySelectorAll<HTMLElement>('[data-dock-item]'));
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    if (!fine) return;
    const move = (e: PointerEvent) => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      for (const it of items) {
        const r = it.getBoundingClientRect(); const c = r.left + r.width / 2;
        const d = Math.abs(e.clientX - c);
        it.style.setProperty('--ms', (1 + 0.34 * Math.exp(-Math.pow(d / 58, 2))).toFixed(3));
      }
    };
    const leave = () => items.forEach((it) => it.style.setProperty('--ms', '1'));
    el.addEventListener('pointermove', move, { passive: true });
    el.addEventListener('pointerleave', leave);
    return () => { el.removeEventListener('pointermove', move); el.removeEventListener('pointerleave', leave); };
  }, []);

  return (
    <nav className="dock" ref={dock} aria-label="Primary">
      <ul>
        {NAV.map((n) => {
          const Icon = ICONS[n.id]; const on = active === n.id;
          return (
            <li key={n.id}>
              <a href={`#${n.id}`} data-dock-item className={`dock__item${on ? ' is-active' : ''}`} aria-label={n.label} aria-current={on ? 'location' : undefined}>
                <span className="dock__ico"><Icon aria-hidden="true" size={19} /></span>
                <span className="dock__lbl" aria-hidden="true">{n.label}</span>
                <span className="dock__tip" aria-hidden="true">{n.label}</span>
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export function MobileMenu({ active }: { active: string }) {
  const [open, setOpen] = useState(false);
  const btn = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const first = panel.current?.querySelector<HTMLElement>('a'); first?.focus();
    const key = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setOpen(false); btn.current?.focus(); }
      if (e.key === 'Tab' && panel.current) {
        const f = [btn.current!, ...Array.from(panel.current.querySelectorAll<HTMLElement>('a'))];
        const i = f.indexOf(document.activeElement as HTMLElement);
        if (e.shiftKey && i <= 0) { e.preventDefault(); f[f.length - 1].focus(); }
        else if (!e.shiftKey && i === f.length - 1) { e.preventDefault(); f[0].focus(); }
      }
    };
    const away = (e: PointerEvent) => { const t = e.target as Node; if (!panel.current?.contains(t) && !btn.current?.contains(t)) setOpen(false); };
    document.addEventListener('keydown', key); document.addEventListener('pointerdown', away);
    return () => { document.removeEventListener('keydown', key); document.removeEventListener('pointerdown', away); };
  }, [open]);
  return (
    <div className="mnav">
      <button ref={btn} className="mnav__btn" type="button" aria-expanded={open} aria-controls="mnav-panel" aria-label={open ? 'Close menu' : 'Open menu'} onClick={() => setOpen((v) => !v)}>
        {open ? <TbX aria-hidden="true" size={22} /> : <TbMenu2 aria-hidden="true" size={22} />}
      </button>
      <div id="mnav-panel" ref={panel} className={`mnav__panel${open ? ' is-open' : ''}`} inert={!open}>
        <ul>
          {NAV.map((n, i) => {
            const Icon = ICONS[n.id];
            return (
              <li key={n.id} style={{ ['--i' as any]: i }}>
                <a href={`#${n.id}`} className={active === n.id ? 'is-active' : ''} aria-current={active === n.id ? 'location' : undefined} onClick={() => setOpen(false)}>
                  <Icon aria-hidden="true" size={18} /><span>{n.label}</span>
                </a>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
