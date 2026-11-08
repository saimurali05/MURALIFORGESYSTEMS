// AutomationStage — "Practical automation for real businesses": one readable run of a connected workflow.
// Business event → trigger → automation engine → connected apps → outcome. It is an ILLUSTRATION (sample data, labelled).
// Five scenes are sequenced by useTimeline, which writes data-step on the root; every visual below is CSS from that
// attribute. Desktop = one canvas (HTML nodes placed in % + an SVG wire layer on the same viewBox). Narrow screens =
// a vertical flow with CSS spine lines. Reduced motion shows the finished state; the step rail jumps between scenes.
import { Fragment, useRef, useState } from 'react';
import { TbWebhook, TbCircleCheck, TbCheck } from 'react-icons/tb';
import { BRAND } from './WorkflowThumb';
import { useTimeline } from '../../motion/useTimeline';

const STEPS = [
  { n: '01', label: 'Event', cap: 'A business event occurs — a new enquiry arrives from a lead ad.' },
  { n: '02', label: 'Trigger', cap: 'The trigger activates — a webhook hands the enquiry to the automation engine.' },
  { n: '03', label: 'Engine', cap: 'Data moves through the engine — it is validated, enriched and routed.' },
  { n: '04', label: 'Apps', cap: 'Connected apps receive it — CRM, spreadsheet, WhatsApp and calendar update together.' },
  { n: '05', label: 'Outcome', cap: 'The business gets the result — captured, organized and followed up.' },
] as const;
const APPS = [
  { k: 'hubspot', name: 'HubSpot CRM', st: 'Contact created' },
  { k: 'sheets', name: 'Google Sheets', st: 'Row added' },
  { k: 'whatsapp', name: 'WhatsApp', st: 'Follow-up drafted' },
  { k: 'calendar', name: 'Google Calendar', st: 'Meeting offered' },
] as const;
const ENGINE = [
  { t: 'Validate', d: 'Details checked' },
  { t: 'Enrich', d: 'Source and interest added' },
  { t: 'Route', d: 'Assigned to an owner' },
] as const;
const OUTCOME = ['Record created', 'Team notified', 'Follow-up queued'];

// desktop canvas geometry (viewBox units)
const W = 1200, H = 500;
const G = {
  ev: [172, 235], tr: [412, 235], en: [690, 235], out: [600, 464],
  apps: [72, 178, 284, 390].map((y) => [925, y]),
  w1: 'M297 235 H384', w2: 'M440 235 H545',
  w3: [72, 178, 284, 390].map((y) => `M835 235 C868 235 866 ${y} 897 ${y}`),
};
const at = (x: number, y: number) => ({ left: `${(x / W) * 100}%`, top: `${(y / H) * 100}%` });

const Mark = ({ k, size = '1.75em' }: { k: keyof typeof BRAND; size?: string }) => { const b = BRAND[k]; const I = b.I; return <I size={size} color={b.c} aria-hidden="true" />; };

function Event() {
  return (
    <div className="ae__ev ae__panel">
      <div className="ae__ev-top"><span className="ae__tag">New enquiry</span><span className="ae__src"><Mark k="instagram" size="1.2em" /><Mark k="facebook" size="1.2em" /></span></div>
      <p className="ae__who">Priya S.</p>
      <p className="ae__msg">“Need a quote for 40 units.”</p>
      <p className="ae__meta">Lead ad · sample data</p>
    </div>
  );
}
function Engine() {
  return (
    <div className="ae__en ae__panel">
      <div className="ae__en-top"><span className="tile tile--sm"><Mark k="n8n" size="1.6em" /></span><span><b>Automation engine</b><small>for example n8n</small></span></div>
      <ol className="ae__steps">{ENGINE.map((s, i) => <li key={s.t} style={{ ['--k' as any]: i }}><i><TbCheck aria-hidden="true" /></i><b>{s.t}</b><span>{s.d}</span></li>)}</ol>
    </div>
  );
}
function Outcome() {
  return (
    <div className="ae__out ae__panel">
      <TbCircleCheck className="ae__ok" aria-hidden="true" />
      <p><b>Enquiry captured, organized and followed up — nothing re-typed.</b><span>{OUTCOME.map((o) => <em key={o}>✓ {o}</em>)}</span></p>
    </div>
  );
}
const Trigger = () => (<><span className="tile"><TbWebhook size="1.7em" color="var(--champagne)" aria-hidden="true" /></span><span className="ae__cap2"><b>Webhook trigger</b><small>Fires on each new enquiry</small></span></>);
const App = ({ a }: { a: (typeof APPS)[number] }) => (
  <><span className="tile"><Mark k={a.k} /></span><span className="ae__apptxt"><b>{a.name}</b><small>{a.st}</small></span></>
);

export default function AutomationStage() {
  const ref = useRef<HTMLElement>(null);
  const [initial] = useState(() => (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 4 : 0));
  const [step, setStep] = useState(initial);
  const tl = useTimeline(ref, { scenes: [3000, 3000, 3400, 3600, 3600], loop: true, hold: 3200, onStep: setStep });
  return (
    <section ref={ref} className="ae th-dark glass glass--raised stage has-lamps" data-step={initial} aria-label="A connected workflow, illustrated in five steps" style={{ ['--g-r' as any]: '26px' }}>
      <i className="lamp" style={{ ['--lamp-x' as any]: '68%', ['--lamp-y' as any]: '42%', ['--lamp-w' as any]: '80%', ['--lamp-h' as any]: '100%', ['--lamp-a' as any]: 0.12 }} />
      <div className="stage__grid" />
      <header className="ae__top">
        <span className="badge badge--live"><i />Illustrative flow · sample data</span>
        <span className="ae__logos">Logos show the kinds of tools MFS can connect — no partnership implied.</span>
      </header>

      {/* desktop canvas */}
      <div className="ae__canvas">
        <div className="ae__scene ae__scene--h">
          <svg className="ae__wires" viewBox={`0 0 ${W} ${H}`} aria-hidden="true" focusable="false">
            <path className="wire" d={G.w1} /><path className="wire" d={G.w2} />{G.w3.map((d, i) => <path key={i} className="wire" d={d} />)}
            <path className="wire--live ae__l1" pathLength={1} d={G.w1} /><path className="wire--live ae__l2" pathLength={1} d={G.w2} />
            {G.w3.map((d, i) => <path key={i} className="wire--live ae__l3" pathLength={1} d={d} style={{ ['--k' as any]: i }} />)}
            <path className="ae__pk ae__pk1" pathLength={1} d={G.w1} /><path className="ae__pk ae__pk2" pathLength={1} d={G.w2} />
            {G.w3.map((d, i) => <path key={i} className="ae__pk ae__pk3" pathLength={1} d={d} style={{ ['--k' as any]: i }} />)}
          </svg>
          <div className="ae__at ae__at--ev" style={at(G.ev[0], G.ev[1])}><Event /></div>
          <div className="ae__at ae__tr" style={at(G.tr[0], G.tr[1])}><Trigger /></div>
          <div className="ae__at ae__at--en" style={at(G.en[0], G.en[1])}><Engine /></div>
          {APPS.map((a, i) => <div key={a.k} className="ae__at ae__app" style={{ ...at(G.apps[i][0], G.apps[i][1]), ['--k' as any]: i }}><App a={a} /></div>)}
          <div className="ae__at ae__at--out" style={at(G.out[0], G.out[1])}><Outcome /></div>
        </div>

        {/* narrow screens: vertical flow */}
        <div className="ae__scene ae__scene--v">
          <Event />
          <i className="ae__seg ae__seg--1" />
          <div className="ae__tr ae__row"><Trigger /></div>
          <i className="ae__seg ae__seg--2" />
          <Engine />
          <i className="ae__seg ae__seg--3" />
          {APPS.map((a, i) => (<Fragment key={a.k}>{i > 0 && <i className="ae__seg ae__seg--3" style={{ ['--k' as any]: i }} />}<div className="ae__app ae__row" style={{ ['--k' as any]: i }}><App a={a} /></div></Fragment>))}
          <i className="ae__seg ae__seg--4" />
          <Outcome />
        </div>
      </div>

      <div className="ae__foot">
        <div className="ae__caps" aria-label="What is happening">{STEPS.map((s, i) => <p key={s.n} className={`ae__cap ae__cap--${i}`}>{s.cap}</p>)}</div>
        <ol className="ae__rail" aria-label="Workflow steps">
          {STEPS.map((s, i) => (
            <li key={s.n}><button type="button" className={`ae__step${i < step ? ' is-done' : ''}`} aria-current={step === i ? 'step' : undefined} onClick={() => tl.goto(i)}><b>{s.n}</b><span>{s.label}</span></button></li>
          ))}
        </ol>
      </div>
    </section>
  );
}
