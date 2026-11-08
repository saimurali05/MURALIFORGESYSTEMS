// Stage timeline — the ONE way the cinematic sections sequence their scenes.
// It writes `data-step="n"` and `--step` on the stage element; CSS does all the visual work from that attribute
// (no per-frame React state, no competing animation systems). A scene is just a number of milliseconds.
//
//   const ref = useRef<HTMLElement>(null);
//   const tl = useTimeline(ref, { scenes: [2200, 2200, 2600, 2600, 3000], loop: true });
//   <section ref={ref} className="stage" data-step="0"> … CSS: .stage[data-step="2"] .tile--engine { … }
//
// • Starts when ≥ 35 % of the stage is on screen, pauses when it leaves, resumes where it was.
// • prefers-reduced-motion / no IntersectionObserver: shows the `rest` scene (default: the last, i.e. the finished
//   state) and never advances — the section must be fully understandable in that frame.
// • tl.goto(n) jumps to a scene (e.g. a visitor clicks a step marker) and holds it for `dwell` ms before autoplay resumes.
import { useEffect, useRef } from 'react';
import type { RefObject } from 'react';
import { motion } from './controller';

export interface TimelineOpts {
  /** how long each scene is shown (ms); the array length is the number of scenes */
  scenes: number[];
  /** restart from scene 0 after the last scene (default false: stay on the finished state) */
  loop?: boolean;
  /** extra ms to hold the last scene before looping (default 2600) */
  hold?: number;
  /** scene shown for reduced motion / before JS runs (default: last) */
  rest?: number;
  /** ms a manually selected scene is held before autoplay resumes (default 6500) */
  dwell?: number;
  /** visible fraction that starts playback (default 0.35) */
  threshold?: number;
  /** called when the scene changes (use sparingly — prefer CSS from data-step) */
  onStep?: (n: number) => void;
}

export function useTimeline(ref: RefObject<HTMLElement | null>, opts: TimelineOpts) {
  const api = useRef({ goto: (_n: number) => {} });
  const o = useRef(opts); o.current = opts;
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const { scenes } = o.current; const last = scenes.length - 1;
    let step = -1, timer = 0, visible = false, alive = true;
    const set = (k: number) => { step = k; el.dataset.step = String(k); el.style.setProperty('--step', String(k)); o.current.onStep?.(k); };
    const later = (fn: () => void, ms: number) => { clearTimeout(timer); timer = window.setTimeout(fn, ms); };
    const advance = () => {
      if (!alive || !visible) return;
      if (step >= last) {
        if (!o.current.loop) return;
        later(() => { if (!visible) return; set(0); later(advance, scenes[0]); }, o.current.hold ?? 2600);
        return;
      }
      set(step + 1); later(advance, scenes[step]);
    };
    api.current.goto = (n: number) => {
      const k = Math.max(0, Math.min(last, n)); set(k);
      if (motion.state.reduced) return;
      later(advance, o.current.dwell ?? 6500);
    };

    if (motion.state.reduced || typeof IntersectionObserver === 'undefined') { set(o.current.rest ?? last); return; }
    set(0);
    const io = new IntersectionObserver(([e]) => {
      const now = e.isIntersecting; if (now === visible) return; visible = now;
      if (visible) later(advance, scenes[Math.max(step, 0)]); else clearTimeout(timer);
    }, { threshold: o.current.threshold ?? 0.35 });
    io.observe(el);
    return () => { alive = false; clearTimeout(timer); io.disconnect(); };
  }, [ref]);
  return { goto: (n: number) => api.current.goto(n) };
}
