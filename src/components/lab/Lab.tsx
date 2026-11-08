// MFS Business Systems Lab — a six-stage, scenario-based walkthrough: business → current process → problems → proposed system →
// outcome → handover. Everything is an illustrative simulation (no results, savings or live integrations are claimed).
import { useEffect, useRef, useState } from 'react';
import { TbArrowLeft, TbArrowRight, TbBolt, TbCheck, TbChevronDown, TbRotate2, TbUser, TbDatabase, TbAlertTriangle, TbEye, TbPlayerPlay } from 'react-icons/tb';
import { DELIVERABLES, KINDS, ACTOR, PROBLEM, SCENARIOS } from './scenarios';
import { openBooking } from '../../data/book';
import { motion } from '../../motion/controller';
import { Seg } from '../demos/kit';

const STAGES = ['Scenario', 'Today', 'Problems', 'System', 'Outcome', 'Handover'] as const;
const MODES = ['Current process', 'Proposed process'] as const; type Mode = (typeof MODES)[number];
const TITLE = ['Select a business scenario', 'Understand the current operation', 'Identify the operational problems', 'Design the proposed system', 'See the business outcome', 'The MFS handover'];
const LEAD = [
  'Every business works differently. Pick an illustrative scenario to see how a process can be understood and redesigned.',
  'This is how the process typically runs today. Steps marked “manual” rely on people remembering, retyping or chasing.',
  'Select a problem to see where it appears in the process and why it matters. We never invent costs or percentages.',
  'Select any stage to see what happens there. Amber stages are automatic; the ivory stage needs a person.',
  'The proposed system separates what is automatic from what needs a person, and makes every action visible and recorded.',
  'What a client actually receives when the project is handed over.',
];

export default function Lab() {
  const [sc, setSc] = useState(0); const [st, setSt] = useState(0); const [pr, setPr] = useState<number | null>(null); const [nd, setNd] = useState(0);
  const [mode, setMode] = useState<Mode>('Proposed process'); const [run, setRun] = useState(-1); const [exc, setExc] = useState(false);
  const [ho, setHo] = useState<boolean[]>(() => DELIVERABLES.map(() => false)); const [touched, setTouched] = useState(false); const [sweep, setSweep] = useState(0);
  const [vis, setVis] = useState(false); const root = useRef<HTMLElement>(null);
  const S = SCENARIOS[sc]; const reduced = motion.state.reduced;
  useEffect(() => { const el = root.current; if (!el || typeof IntersectionObserver === 'undefined') { setVis(true); return; } const io = new IntersectionObserver(([e]) => setVis(e.isIntersecting), { threshold: 0.25 }); io.observe(el); return () => io.disconnect(); }, []);
  // a gentle left-to-right pulse across the proposed workflow, only while it is on screen and untouched
  useEffect(() => {
    if (st !== 3 || mode !== 'Proposed process' || touched || !vis || reduced) return;
    const id = window.setInterval(() => setSweep((x) => (x + 1) % 9), 1100); return () => clearInterval(id);
  }, [st, mode, touched, vis, reduced, sc]);
  // sample run: lines reveal one at a time
  const lines = (() => {
    const n = S.nodes; const base: { t: string; w: string }[] = [];
    const add = (i: number, w: string, t?: string) => base.push({ w, t: t ?? `${n[i][0]} — ${n[i][1]}` });
    add(0, 'Automatic'); add(1, 'Automatic'); add(2, 'Automatic');
    if (exc) { add(3, 'Automatic'); base.push({ w: 'Exception', t: `${n[9][0]} — ${n[9][1]}` }); base.push({ w: 'A person', t: 'Routed to a named person with the full history attached. The record shows who picked it up.' }); return base; }
    add(3, 'Automatic'); add(4, 'Automatic'); base.push({ w: 'Waiting', t: 'Waiting for a person to decide — nothing continues without them.' }); base.push({ w: 'A person', t: `${n[5][0]} — approved by a person (simulated).` });
    add(6, 'Automatic'); add(7, 'Automatic'); add(8, 'Automatic'); return base;
  })();
  useEffect(() => {
    if (run < 0 || run >= lines.length) return;
    const id = window.setTimeout(() => setRun((r) => r + 1), reduced ? 0 : 750); return () => clearTimeout(id);
  }, [run, lines.length, reduced]);
  const go = (n: number) => { setSt(Math.max(0, Math.min(5, n))); setRun(-1); };
  const reset = () => { setSc(0); setSt(0); setPr(null); setNd(0); setMode('Proposed process'); setRun(-1); setExc(false); setHo(DELIVERABLES.map(() => false)); setTouched(false); setSweep(0); };
  const pickScenario = (i: number) => { setSc(i); setPr(null); setNd(0); setRun(-1); setTouched(false); setSweep(0); setSt(1); };
  const hit = (i: number) => (st === 2 && pr !== null ? S.problems[pr].at.includes(i) : st === 1 ? false : false);
  const manual = (i: number) => S.problems.some((p) => p.at.includes(i));
  const steps = (
    <ol className={`lab__steps${st === 2 && pr !== null ? ' has-hit' : ''}`}>
      {S.steps.map((x, i) => <li key={x} className={hit(i) ? 'is-hit' : ''}><span className="lab__sn">{i + 1}</span><span className="lab__st">{x}</span>{manual(i) && <em className="lab__tag">manual</em>}</li>)}
    </ol>
  );
  const cur = S.nodes[nd]; const actor = ACTOR[nd];
  const kindCls = (i: number) => (i === 9 ? 'is-exc' : ACTOR[i] === 'A person' ? 'is-human' : ACTOR[i] === 'System' ? 'is-sys' : 'is-auto');
  const outCols = [
    { k: 'auto', t: 'Handled automatically', I: TbBolt, items: S.out.auto }, { k: 'human', t: 'Needs a human decision', I: TbUser, items: S.out.human },
    { k: 'live', t: 'Visible in real time', I: TbEye, items: S.out.live }, { k: 'rec', t: 'Recorded in the system', I: TbDatabase, items: S.out.rec }, { k: 'exc', t: 'Exceptions needing attention', I: TbAlertTriangle, items: S.out.exc },
  ];
  return (
    <section className="lab glass glass--raised th-dark" ref={root} aria-labelledby="lab-t" style={{ ['--g-r' as any]: '28px' }}>
      <header className="lab__top">
        <div><p className="lab__eyebrow">Illustrative scenario · sample data</p><h3 id="lab-t" className="lab__title">{TITLE[st]}</h3></div>
        {st > 0 && <div className="lab__who"><span>Scenario</span><b>{S.name}</b><button type="button" className="lab__link" onClick={() => go(0)}>Change</button></div>}
      </header>
      <ol className="lab__stepper" aria-label="Lab stages">
        {STAGES.map((n, i) => <li key={n}><button type="button" className={i === st ? 'is-on' : i < st ? 'is-done' : ''} aria-current={i === st ? 'step' : undefined} onClick={() => go(i)}><b>{i + 1}</b><span>{n}</span></button></li>)}
      </ol>
      <p className="lab__lead">{LEAD[st]}</p>
      <div className="lab__stage" key={`${st}-${sc}`}>
        {st === 0 && (
          <ul className="lab__cards">{SCENARIOS.map((s, i) => (
            <li key={s.id}><button type="button" className={`lab__card${i === sc ? ' is-on' : ''}`} onClick={() => pickScenario(i)}><b>{String(i + 1).padStart(2, '0')}</b><span className="lab__cn">{s.name}</span><span className="lab__cp">{s.process}</span><span className="lab__cs">{s.summary}</span><span className="lab__go">Explore <TbArrowRight size={15} aria-hidden="true" /></span></button></li>))}</ul>)}
        {st === 1 && (<div className="lab__split"><div><h4 className="lab__h">{S.process}</h4>{steps}</div><aside className="lab__note"><h4>Where it gets hard</h4><p>Each “manual” step depends on someone remembering to enter, check, chase or pass something on. In the next stage we look at exactly what goes wrong.</p><button type="button" className="btn btn--primary" onClick={() => go(2)}>Show the problems <TbArrowRight size={16} aria-hidden="true" /></button></aside></div>)}
        {st === 2 && (
          <div className="lab__split">
            <div><h4 className="lab__h">{S.process}</h4>{steps}</div>
            <div className="lab__probs"><h4>Problems in this process</h4><ul>{S.problems.map((p, i) => (
              <li key={p.k}><button type="button" aria-pressed={pr === i} className={pr === i ? 'is-on' : ''} onClick={() => setPr(pr === i ? null : i)}>{PROBLEM[p.k].t}</button></li>))}</ul>
              <div className="lab__pd" aria-live="polite">{pr === null ? <p>Select a problem to highlight where it shows up.</p> : <><p className="lab__pk">{PROBLEM[S.problems[pr].k].t}</p><p>{PROBLEM[S.problems[pr].k].what}</p><p><b>In this process:</b> {S.problems[pr].d}</p></>}</div>
            </div>
          </div>)}
        {st === 3 && (
          <div>
            <div className="lab__bar"><Seg value={mode} onChange={(m: Mode) => { setMode(m); setTouched(true); }} items={MODES} label="Process view" /><ul className="lab__legend" aria-label="Legend"><li className="is-auto">Automatic</li><li className="is-human">A person decides</li><li className="is-sys">Record or system</li><li className="is-exc">Exception</li></ul></div>
            {mode === 'Current process' ? <div className="lab__split"><div>{steps}</div><aside className="lab__note"><h4>Today</h4><p>{S.steps.length} steps, each handled by hand. Switch to “Proposed process” to see the same work as a connected system.</p></aside></div> : (
              <>
                <ol className="lab__flow" aria-label={`Proposed workflow: ${S.process}`}>
                  {S.nodes.slice(0, 9).map(([t], i) => (
                    <li key={i}><button type="button" className={`lab__n ${kindCls(i)}${nd === i ? ' is-sel' : ''}${!touched && vis && !reduced && sweep === i ? ' is-pulse' : ''}`} aria-pressed={nd === i} onClick={() => { setNd(i); setTouched(true); }}><i>{KINDS[i]}</i><span>{t}</span></button></li>))}
                </ol>
                <div className="lab__excrow"><span>If something goes wrong</span><button type="button" className={`lab__n is-exc${nd === 9 ? ' is-sel' : ''}`} aria-pressed={nd === 9} onClick={() => { setNd(9); setTouched(true); }}><i>{KINDS[9]}</i><span>{S.nodes[9][0]}</span></button></div>
                <div className="lab__detail" aria-live="polite"><p className="lab__dk">{KINDS[nd]} · <b>{actor === 'A person' ? 'A person acts' : actor === 'Automatic' ? 'Runs automatically' : 'Recorded by the system'}</b></p><h4>{cur[0]}</h4><p>{cur[1]}</p><p className="lab__rec"><TbCheck size={15} aria-hidden="true" /> Every action at this stage is recorded in the system.</p></div>
              </>)}
          </div>)}
        {st === 4 && (
          <div>
            <ul className="lab__out">{outCols.map(({ k, t, I, items }) => <li key={k} className={`lab__oc is-${k}`}><h4><I size={18} aria-hidden="true" />{t}</h4><ul>{items.map((x) => <li key={x}>{x}</li>)}</ul></li>)}</ul>
            <div className="lab__run">
              <div className="lab__runh"><h4>Follow one sample case</h4><div className="lab__runb">
                <button type="button" className="btn btn--primary" onClick={() => { setExc(false); setRun(0); }}><TbPlayerPlay size={16} aria-hidden="true" /> Run the sample case</button>
                <button type="button" className="btn" onClick={() => { setExc(true); setRun(0); }}>Run it with a problem</button></div></div>
              <ol className="lab__log" aria-live="polite">{run < 0 ? <li className="lab__empty">Run the sample case to watch the work move through the system.</li> : lines.slice(0, run + 1).map((l, i) => <li key={i} className={`is-${l.w.toLowerCase().replace(' ', '')}`}><b>{l.w}</b><span>{l.t}</span></li>)}</ol>
            </div>
          </div>)}
        {st === 5 && (
          <div>
            <div className="lab__hobar"><p>Eight things a client receives. Expand any to see what it means for <b>{S.name.toLowerCase()}</b>.</p><button type="button" className="lab__link" onClick={() => setHo(DELIVERABLES.map(() => !ho.every(Boolean)))}>{ho.every(Boolean) ? 'Collapse all' : 'Expand all'}</button></div>
            <ul className="lab__ho">{DELIVERABLES.map((d, i) => { const text = d.d || (d.t === 'Relevant integrations' ? S.integ : S.ui); return (
              <li key={d.t} className={ho[i] ? 'is-open' : ''}><button type="button" aria-expanded={ho[i]} aria-controls={`lab-ho-${i}`} onClick={() => setHo((o) => o.map((v, k) => (k === i ? !v : v)))}><b>{String(i + 1).padStart(2, '0')}</b><span>{d.t}</span><TbChevronDown size={18} aria-hidden="true" /></button>
                <div className="lab__hop" id={`lab-ho-${i}`} role="region"><div><p>{text}</p></div></div></li>); })}</ul>
            <div className="lab__final"><p>Your business is different from these examples. Tell us how yours works and we will show you what a system around it could look like.</p><button type="button" className="btn btn--primary" onClick={openBooking}>Book a discovery call <TbArrowRight size={17} aria-hidden="true" /></button></div>
          </div>)}
      </div>
      <footer className="lab__foot">
        <button type="button" className="btn" onClick={() => go(st - 1)} disabled={st === 0}><TbArrowLeft size={16} aria-hidden="true" /> Back</button>
        <button type="button" className="lab__link" onClick={reset}><TbRotate2 size={15} aria-hidden="true" /> Reset the lab</button>
        {st < 5 ? <button type="button" className="btn btn--primary" onClick={() => go(st + 1)} disabled={st === 0 && false}>Next: {STAGES[st + 1]} <TbArrowRight size={16} aria-hidden="true" /></button> : <button type="button" className="btn btn--primary" onClick={openBooking}>Book a discovery call</button>}
      </footer>
      <p className="lab__sim">Simulation: this lab runs entirely in your browser. It does not call an AI model, send messages, create records or connect to any business software.</p>
    </section>
  );
}
