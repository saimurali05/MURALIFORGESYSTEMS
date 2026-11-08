// Presentation engine shared by all nine demos.
// A demo is a real, clickable software interface (a React component) + a scripted list of steps. The engine owns timing:
//   • autoplay starts when the demo is on screen and stops when it leaves; any touch/keypress inside the app hands control to the visitor
//   • manual Previous / Next / Replay; Presentation Mode (full-screen canvas, spotlight on the active panel, caption, progress, keyboard)
// Demos never run their own timers for the scripted sequence — they only react to `step` (and `rk`, the replay counter).
import { createContext, createElement, useCallback, useContext, useEffect, useRef, useState } from 'react';
import type { ComponentType, KeyboardEvent, ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { TbArrowsMaximize, TbPlayerPause, TbPlayerPlay, TbPlayerTrackNext, TbPlayerTrackPrev, TbReload, TbX } from 'react-icons/tb';
import type { ServiceId } from '../../data/services';
import { motion } from '../../motion/controller';
import { openBooking } from '../../data/book';

/** Scroll to the Contact section (the booking panel). The event is harmless if nothing listens. */
export function inviteTo(_id: string) { openBooking(); }

export interface StepDef { label: string; note: string; spot: string }
export interface DemoProps { step: number; rk: number }
export interface DemoEntry {
  id: ServiceId; tone: 'dark' | 'light'; headline: string; problem: string; blurb: string; caps: string[]; howto: string; sample: string;
  steps: StepDef[]; Comp: ComponentType<DemoProps>;
}

const STEP_MS = 2600;
export const LiveCtx = createContext(false);

/** Count-up that waits for the demo to be live; restarts with the replay counter. */
export function Count({ to, rk, ms = 900, fmt }: { to: number; rk: number; ms?: number; fmt?: (n: number) => string }) {
  const live = useContext(LiveCtx); const [v, setV] = useState(live && !motion.state.reduced ? 0 : to);
  useEffect(() => {
    if (!live || motion.state.reduced) { setV(to); return; }
    let raf = 0; const t0 = performance.now();
    const tick = (t: number) => { const k = Math.min(1, (t - t0) / ms); setV(to * (1 - Math.pow(1 - k, 3))); if (k < 1) raf = requestAnimationFrame(tick); };
    setV(0); raf = requestAnimationFrame(tick); return () => cancelAnimationFrame(raf);
  }, [live, to, rk, ms]);
  const r = Math.round(v); return createElement('span', null, fmt ? fmt(r) : r.toLocaleString('en-IN'));
}

function Controls({ i, n, playing, onPlay, onPrev, onNext, onReplay, children }: { i: number; n: number; playing: boolean; onPlay: () => void; onPrev: () => void; onNext: () => void; onReplay: () => void; children?: ReactNode }) {
  return (
    <div className="dm-ctl" role="group" aria-label="Presentation controls">
      <button type="button" onClick={onPrev} disabled={i <= 0} aria-label="Previous step" title="Previous step"><TbPlayerTrackPrev aria-hidden="true" /></button>
      <button type="button" className="is-main" onClick={onPlay} aria-label={playing ? 'Pause' : 'Play'} title={playing ? 'Pause' : 'Play'}>{playing ? <TbPlayerPause aria-hidden="true" /> : <TbPlayerPlay aria-hidden="true" />}</button>
      <button type="button" onClick={onNext} disabled={i >= n - 1} aria-label="Next step" title="Next step"><TbPlayerTrackNext aria-hidden="true" /></button>
      <button type="button" onClick={onReplay} aria-label="Replay from the start" title="Replay"><TbReload aria-hidden="true" /></button>
      {children}
    </div>
  );
}

export function DemoStage({ entry, index }: { entry: DemoEntry; index: number }) {
  const { steps, Comp } = entry; const n = steps.length;
  const [step, setStep] = useState(0); const [playing, setPlaying] = useState(false); const [touched, setTouched] = useState(false);
  const [userPaused, setUserPaused] = useState(false); const [rk, setRk] = useState(0); const [pm, setPm] = useState(false);
  const [inView, setInView] = useState(false); const [seen, setSeen] = useState(false);
  const root = useRef<HTMLDivElement>(null); const appBox = useRef<HTMLDivElement>(null); const pmBtn = useRef<HTMLButtonElement>(null); const dlg = useRef<HTMLDivElement>(null);
  const keep = useRef(0); const reduced = motion.state.reduced;
  const vis = inView || pm; const done = step >= n - 1;

  useEffect(() => {
    const el = root.current; if (!el || typeof IntersectionObserver === 'undefined') { setInView(true); setSeen(true); return; }
    const io = new IntersectionObserver((e) => { const on = e[0].isIntersecting; setInView(on); if (on) setSeen(true); }, { threshold: 0.3 });
    io.observe(el); return () => io.disconnect();
  }, []);
  // autoplay: only while visible, never after the visitor has taken over, never under reduced motion
  useEffect(() => { if (!vis) setPlaying(false); else if (!touched && !userPaused && !reduced && !done) setPlaying(true); }, [vis, touched, userPaused, reduced, done]);
  useEffect(() => {
    if (!playing) return;
    const t = setTimeout(() => { if (step < n - 1) setStep(step + 1); else setPlaying(false); }, step === 0 ? 1900 : STEP_MS);
    return () => clearTimeout(t);
  }, [playing, step, n]);

  // spotlight: the active panel gets a champagne ring (inline) and the rest dim (presentation mode)
  useEffect(() => {
    const host = (pm ? dlg.current : appBox.current); if (!host) return;
    const raf = requestAnimationFrame(() => host.querySelectorAll<HTMLElement>('[data-p]').forEach((p) => p.classList.toggle('spot-on', p.dataset.p === steps[step].spot)));
    return () => cancelAnimationFrame(raf);
  }, [step, pm, rk, steps]);

  const take = useCallback(() => { setTouched(true); setPlaying(false); }, []);
  const go = (to: number) => { setTouched(true); setPlaying(false); setStep(Math.max(0, Math.min(n - 1, to))); };
  const replay = () => { setStep(0); setRk((k) => k + 1); setTouched(false); setUserPaused(false); setPlaying(false); setTimeout(() => setPlaying(!reduced), 60); };
  const toggle = () => { if (playing) { setPlaying(false); setUserPaused(true); } else { setUserPaused(false); setTouched(false); if (done) replay(); else setPlaying(!reduced); } };
  const open = () => { keep.current = appBox.current?.offsetHeight ?? 0; setPm(true); setStep(0); setRk((k) => k + 1); setTouched(false); setUserPaused(false); };
  const close = () => { setPm(false); setPlaying(false); setTouched(true); requestAnimationFrame(() => pmBtn.current?.focus()); };

  useEffect(() => {
    if (!pm) return;
    const app = document.getElementById('root'); const prev = document.documentElement.style.overflow;
    document.documentElement.style.overflow = 'hidden'; try { (app as any).inert = true; } catch { /* older browsers */ }
    dlg.current?.focus();
    return () => { document.documentElement.style.overflow = prev; try { (app as any).inert = false; } catch { /* */ } };
  }, [pm]);
  const onKey = (e: KeyboardEvent) => {
    if (!pm) return; const tag = (e.target as HTMLElement).tagName;
    if (e.key === 'Escape') { e.preventDefault(); close(); }
    else if (e.key === 'ArrowRight' && tag !== 'INPUT' && tag !== 'SELECT' && tag !== 'TEXTAREA') { e.preventDefault(); go(step + 1); }
    else if (e.key === 'ArrowLeft' && tag !== 'INPUT' && tag !== 'SELECT' && tag !== 'TEXTAREA') { e.preventDefault(); go(step - 1); }
    else if (e.key === ' ' && e.target === dlg.current) { e.preventDefault(); toggle(); }
    else if (e.key === 'Tab' && dlg.current) {
      const f = [...dlg.current.querySelectorAll<HTMLElement>('button:not([disabled]),[href],input,select,textarea,[tabindex]:not([tabindex="-1"])')].filter((x) => x.offsetParent !== null);
      if (!f.length) return; const a = f[0], z = f[f.length - 1];
      if (e.shiftKey && (document.activeElement === a || document.activeElement === dlg.current)) { e.preventDefault(); z.focus(); }
      else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus(); }
    }
  };

  const s = steps[step];
  const body = <Comp step={step} rk={rk} />;
  const hint = touched && !pm ? 'You’re in control — explore freely, or press Replay for the guided sequence.' : entry.howto;
  return (
    <LiveCtx.Provider value={seen && vis}>
      <div ref={root} className={`dm dm--${entry.tone}${seen ? ' is-in' : ''}`} data-demo={entry.id}>
        <div className="dm__copy">
          <p className="dm__kicker"><b>{String(index + 1).padStart(2, '0')}</b><span>Demo {index + 1} of 9</span></p>
          <h3 className="dm__title">{entry.headline}</h3>
          <p className="dm__problem"><strong>The problem.</strong> {entry.problem}</p>
          <p className="dm__blurb">{entry.blurb}</p>
          <ul className="dm__caps" aria-label="Key capabilities">{entry.caps.map((c) => <li key={c}>{c}</li>)}</ul>
          <div className="dm__how" aria-live="polite"><span>How to use it</span>{hint}</div>
          <div className="dm__now" aria-hidden={pm}>
            <ol className="dm__prog" aria-label="Guided sequence">{steps.map((st, k) => <li key={st.label}><button type="button" className={k === step ? 'is-on' : k < step ? 'is-done' : ''} onClick={() => go(k)} aria-label={`Step ${k + 1}: ${st.label}`} aria-current={k === step ? 'step' : undefined} /></li>)}</ol>
            <p className="dm__cap"><b>{step + 1}/{n} · {s.label}</b><span>{s.note}</span></p>
          </div>
          <Controls i={step} n={n} playing={playing} onPlay={toggle} onPrev={() => go(step - 1)} onNext={() => go(step + 1)} onReplay={replay}>
            <button ref={pmBtn} type="button" className="dm-ctl__pm" onClick={open}><TbArrowsMaximize aria-hidden="true" /> Presentation mode</button>
          </Controls>
          <div className="dm__cta"><p>Want a system like this around your business?</p><button type="button" className="btn btn--primary" onClick={() => inviteTo(entry.id)}>Book a discovery call</button></div>
        </div>
        <div className="dm__stage">
          <div className="dm__plate" aria-hidden="true" />
          <div className="dm__app" ref={appBox} onPointerDownCapture={take} onKeyDownCapture={(e: KeyboardEvent) => { if (e.key !== 'Tab') take(); }} style={pm ? { minHeight: keep.current } : undefined}>
            {!pm && body}{pm && <p className="dm__placeholder">Presenting in full screen…</p>}
          </div>
          <p className="dm__sample"><i aria-hidden="true" />{entry.sample}</p>
        </div>
        {pm && createPortal(
          <div className={`pm th-dark has-spot`} role="dialog" aria-modal="true" aria-label={`${entry.headline} — presentation mode`} tabIndex={-1} ref={dlg} onKeyDown={onKey}>
            <header className="pm__top">
              <div><b>{String(index + 1).padStart(2, '0')}</b> {entry.headline}</div>
              <ol className="pm__bar" aria-label="Progress">{steps.map((st, k) => <li key={st.label} className={k < step ? 'is-done' : k === step ? 'is-on' : ''}><button type="button" onClick={() => go(k)} aria-label={`Go to step ${k + 1}: ${st.label}`} /></li>)}</ol>
              <button type="button" className="pm__x" onClick={close} aria-label="Exit presentation mode"><TbX aria-hidden="true" /> Exit</button>
            </header>
            <div className={`pm__canvas dm dm--${entry.tone} is-in`} onPointerDownCapture={take} onKeyDownCapture={(e: KeyboardEvent) => { if (e.key !== 'Tab' && e.key !== 'Escape' && !e.key.startsWith('Arrow')) take(); }}>
              <LiveCtx.Provider value><div className="dm__app dm__app--pm">{body}</div></LiveCtx.Provider>
            </div>
            <footer className="pm__foot">
              <p className="pm__cap" key={step}><span>Step {step + 1} of {n}</span><b>{s.label}</b>{s.note}</p>
              <Controls i={step} n={n} playing={playing} onPlay={toggle} onPrev={() => go(step - 1)} onNext={() => go(step + 1)} onReplay={replay} />
              <p className="pm__keys" aria-hidden="true">← → step · Space play/pause · Esc exit</p>
            </footer>
          </div>, document.body)}
      </div>
    </LiveCtx.Provider>
  );
}
