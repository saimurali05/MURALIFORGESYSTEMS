// One shared motion controller: a single requestAnimationFrame loop, pointer + scroll state, reduced-motion and
// touch detection. Components subscribe instead of each adding their own scroll/pointer listeners.
import { damp } from './tokens';

export interface MotionState {
  t: number;            // seconds since start
  dt: number;           // seconds since previous frame (clamped)
  pointerX: number;     // raw pointer, viewport px
  pointerY: number;
  nx: number;           // smoothed pointer, -1..1 across viewport
  ny: number;
  scrollY: number;
  vh: number;
  vw: number;
  reduced: boolean;
  touch: boolean;
  hasPointer: boolean;
}
type Tick = (s: MotionState) => void;
interface Sub { fn: Tick; el?: Element | null; visible: boolean; io?: IntersectionObserver; }

class MotionController {
  state: MotionState = {
    t: 0, dt: 0.016, pointerX: 0, pointerY: 0, nx: 0, ny: 0, scrollY: 0,
    vh: 800, vw: 1280, reduced: false, touch: false, hasPointer: false,
  };
  private subs = new Set<Sub>();
  private raf = 0;
  private last = 0;
  private started = false;
  private targetNx = 0;
  private targetNy = 0;
  private reducedMql?: MediaQueryList;
  private reducedListeners = new Set<(r: boolean) => void>();

  init() {
    if (this.started || typeof window === 'undefined') return;
    this.started = true;
    const s = this.state;
    this.reducedMql = window.matchMedia('(prefers-reduced-motion: reduce)');
    s.reduced = this.reducedMql.matches;
    this.reducedMql.addEventListener('change', (e) => {
      s.reduced = e.matches;
      document.documentElement.classList.toggle('reduced-motion', e.matches);
      this.reducedListeners.forEach((fn) => fn(e.matches));
      this.kick();
    });
    document.documentElement.classList.toggle('reduced-motion', s.reduced);
    s.touch = window.matchMedia('(pointer: coarse)').matches || 'ontouchstart' in window;
    s.vh = window.innerHeight; s.vw = window.innerWidth; s.scrollY = window.scrollY;
    s.pointerX = s.vw / 2; s.pointerY = s.vh / 2;
    window.addEventListener('scroll', () => { s.scrollY = window.scrollY; this.kick(); }, { passive: true });
    window.addEventListener('resize', () => { s.vh = window.innerHeight; s.vw = window.innerWidth; this.kick(); }, { passive: true });
    window.addEventListener('pointermove', (e) => {
      if (e.pointerType === 'touch') return;
      s.hasPointer = true; s.pointerX = e.clientX; s.pointerY = e.clientY;
      this.targetNx = (e.clientX / s.vw) * 2 - 1; this.targetNy = (e.clientY / s.vh) * 2 - 1;
      this.kick();
    }, { passive: true });
    document.addEventListener('mouseleave', () => { this.targetNx = 0; this.targetNy = 0; this.kick(); });
    document.addEventListener('visibilitychange', () => { if (!document.hidden) this.kick(); });
  }

  onReducedChange(fn: (r: boolean) => void) { this.reducedListeners.add(fn); return () => this.reducedListeners.delete(fn); }

  /** Subscribe to the shared frame loop. If `el` is provided the callback only runs while it intersects the viewport. */
  subscribe(fn: Tick, el?: Element | null): () => void {
    this.init();
    const sub: Sub = { fn, el, visible: !el };
    if (el && 'IntersectionObserver' in window) {
      sub.io = new IntersectionObserver((entries) => { sub.visible = entries[0]?.isIntersecting ?? true; if (sub.visible) this.kick(); }, { rootMargin: '120px' });
      sub.io.observe(el);
    } else sub.visible = true;
    this.subs.add(sub);
    this.kick();
    return () => { sub.io?.disconnect(); this.subs.delete(sub); };
  }

  private kick() { if (!this.raf && !document.hidden) { this.last = performance.now(); this.raf = requestAnimationFrame(this.frame); } }

  private frame = (now: number) => {
    this.raf = 0;
    const s = this.state;
    const dt = Math.min(0.05, Math.max(0.001, (now - this.last) / 1000));
    this.last = now; s.dt = dt; s.t += dt;
    const k = damp(4.2, dt);
    s.nx += (this.targetNx - s.nx) * k; s.ny += (this.targetNy - s.ny) * k;
    let active = false;
    for (const sub of this.subs) { if (sub.visible) { active = true; sub.fn(s); } }
    const settling = Math.abs(this.targetNx - s.nx) > 0.0005 || Math.abs(this.targetNy - s.ny) > 0.0005;
    // Keep ticking while something visible subscribes (ambient motion) or the pointer is still settling.
    if ((active && !s.reduced && !document.hidden) || settling) this.raf = requestAnimationFrame(this.frame);
  };
}
export const motion = new MotionController();
