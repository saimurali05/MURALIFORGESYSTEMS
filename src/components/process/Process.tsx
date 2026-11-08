// HOW MFS WORKS — six stages: Understand · Map · Design · Build · Test · Support.
// A rail of numbered nodes joins the cards. Every card is complete as plain text (what happens, what you get); the
// miniature "working document" at the top of each card is an ILLUSTRATION (labelled) with its own visual language:
// Discover = a surveyed audit · Design = a blueprint · Build = live assembly · Improve = telemetry.
// All motion is CSS, started once when the card scrolls into view (Reveal adds .in). No scroll-linking, no timers, no React state.
import type { CSSProperties, ReactNode } from 'react';
import { TbChartLine, TbCheck, TbChecklist, TbRoute, TbSearch, TbSitemap, TbTools, TbTrendingDown, TbUser } from 'react-icons/tb';
import { FiArrowRight } from 'react-icons/fi';
import { BRAND } from '../services/WorkflowThumb';
import { Headline, Reveal } from '../../motion/reveal';

type K = keyof typeof BRAND;
const v = (o: Record<string, number | string>) => o as unknown as CSSProperties;
const Mark = ({ k, size = '1.5em' }: { k: K; size?: string }) => { const b = BRAND[k]; const I = b.I; return <I size={size} color={b.c} aria-hidden="true" />; };

// every illustration lives in a 200 × 140 unit box; positions are percentages of it and text is sized in em
const W = 200, H = 140;
const at = (x: number, y: number, w?: number, h?: number): CSSProperties => ({ left: `${(x / W) * 100}%`, top: `${(y / H) * 100}%`, ...(w ? { width: `${(w / W) * 100}%` } : {}), ...(h ? { height: `${(h / H) * 100}%` } : {}) });

/* ---------- 01 Discover — an audit of how the work happens today ---------- */
function Discover() {
  const rows = [['1', 'Enquiry arrives', ''], ['2', 'Copied to a sheet', 're-typed'], ['3', 'Reminder by memory', 'missed'], ['4', 'Follow-up sent', 'late']] as const;
  return (
    <div className="pa pa--discover">
      <p className="pa__bar"><span>Workflow today</span><b>3 flags</b></p>
      <ul className="pa__rows">
        {rows.map(([n, t, f], i) => (
          <li key={n} className={f ? 'is-flag' : undefined} style={v({ '--i': Math.max(0, i - 1) })}><i>{n}</i><span>{t}</span>{f ? <em>{f}</em> : null}</li>
        ))}
      </ul>
      <span className="pa__scan" />
    </div>
  );
}

/* ---------- 02 Design — the workflow drawn before anything is built ---------- */
function Design() {
  const wires = ['M58 63 H82', 'M98 47 V27 H138', 'M114 63 H126 V70 H138'];
  return (
    <div className="pa pa--design">
      <p className="pa__dim"><i /><span>Blueprint</span><i /></p>
      <svg className="pa__svg" viewBox={`0 0 ${W} ${H}`} aria-hidden="true" focusable="false">
        {wires.map((d, i) => <path key={d} className="pa__c" pathLength={1} d={d} style={v({ '--i': i })} />)}
        <path className="pa__c pa__c--soft" d="M168 83 V100" style={v({ '--i': 3 })} />
      </svg>
      <div className="pa__n" style={{ ...at(2, 50, 56, 26), ...v({ '--i': 0 }) }}><b>Enquiry</b><small>trigger</small></div>
      <div className="pa__dia" style={{ ...at(82, 47, 32, 32), ...v({ '--i': 1 }) }}><span>?</span></div>
      <span className="pa__cap" style={{ ...at(98, 83), ...v({ '--i': 1 }) }}>urgent?</span>
      <span className="pa__lbl" style={{ ...at(120, 20), ...v({ '--i': 2 }) }}>yes</span>
      <span className="pa__lbl" style={{ ...at(120, 55), ...v({ '--i': 2 }) }}>no</span>
      <div className="pa__n" style={{ ...at(138, 14, 60, 26), ...v({ '--i': 2 }) }}><b>Notify</b><small>the owner</small></div>
      <div className="pa__n" style={{ ...at(138, 57, 60, 26), ...v({ '--i': 2 }) }}><b>Queue</b><small>follow-up</small></div>
      <div className="pa__n pa__n--human" style={{ ...at(138, 100, 60, 26), ...v({ '--i': 3 }) }}><b><TbUser aria-hidden="true" />You</b><small>sign off</small></div>
    </div>
  );
}

/* ---------- 03 Build — apps connected one by one ---------- */
function Build() {
  const apps = [['hubspot', 'HubSpot'], ['sheets', 'Sheets'], ['whatsapp', 'WhatsApp']] as const;
  const ys = [22, 62, 102];
  return (
    <div className="pa pa--build">
      <svg className="pa__svg" viewBox={`0 0 ${W} ${H}`} aria-hidden="true" focusable="false">
        {ys.map((y, i) => <path key={y} className="pa__w" d={`M49 62 C82 62 82 ${y} 116 ${y}`} />)}
        {ys.map((y, i) => <path key={y} className="pa__c pa__c--live" pathLength={1} d={`M49 62 C82 62 82 ${y} 116 ${y}`} style={v({ '--i': i })} />)}
      </svg>
      <span className="tile pa__eng" style={at(19, 47)}><Mark k="n8n" size="1.7em" /></span>
      <span className="pa__cap" style={at(34, 82)}>n8n</span>
      {apps.map(([k, name], i) => (
        <div key={k} className="pa__app" style={{ ...at(116, ys[i] - 14), ...v({ '--i': i }) }}>
          <span className="tile"><Mark k={k} /></span>
          <span className="pa__apptxt"><b>{name}</b><small className="pa__st"><em className="pa__pre">linking…</em><em>connected</em></small></span>
        </div>
      ))}
      <p className="pa__prog"><span>Build</span><i><b /></i><span>3 / 3</span></p>
    </div>
  );
}

/* ---------- 04 Improve — watch it run, refine the rules ---------- */
function Improve() {
  const bars = [14, 18, 16, 10, 20, 22, 22];
  const line = 'M2 36 C20 34 30 42 48 44 S74 52 90 52 S112 50 124 56 S152 72 168 76 S184 82 194 84';
  return (
    <div className="pa pa--improve">
      <p className="pa__bar"><span>Time on admin</span><b><TbTrendingDown aria-hidden="true" />improving</b></p>
      <svg className="pa__svg" viewBox={`0 0 ${W} ${H}`} aria-hidden="true" focusable="false">
        <path className="pa__area" d={`${line} L194 94 L2 94 Z`} />
        <path className="pa__mk" d="M124 34 V94" />
        <path className="pa__line" pathLength={1} d={line} />
        <circle className="pa__dot" cx="124" cy="56" r="2.6" />
        <circle className="pa__dot pa__dot--end" cx="194" cy="84" r="3" />
        <circle className="pa__ring" cx="194" cy="84" r="3" />
      </svg>
      <span className="pa__flag" style={at(128, 27)}>rule refined</span>
      <div className="pa__bars" style={at(2, 99, 170, 24)}>{bars.map((h, i) => <i key={i} className={i === 3 ? 'is-flag' : undefined} style={v({ '--h': `${(h / 24) * 100}%`, '--i': i })} />)}</div>
      <p className="pa__stat"><span className="pa__pre">1 run needs a look</span><span>adjusted · all clear</span><em>next workflow<FiArrowRight aria-hidden="true" /></em></p>
    </div>
  );
}

/* ---------- 02 Map — the workflow written down, hand-offs marked ---------- */
function MapScene() {
  const wires = ['M54 33 H74', 'M126 33 H146'];
  return (
    <div className="pa pa--design pa--map">
      <p className="pa__dim"><i /><span>Workflow map</span><i /></p>
      <svg className="pa__svg" viewBox={`0 0 ${W} ${H}`} aria-hidden="true" focusable="false">
        {wires.map((d, i) => <path key={d} className="pa__c" pathLength={1} d={d} style={v({ '--i': i })} />)}
        <path className="pa__c pa__c--soft" d="M100 46 V74" style={v({ '--i': 2 })} />
      </svg>
      <div className="pa__n" style={{ ...at(2, 20, 52, 26), ...v({ '--i': 0 }) }}><b>Enquiry</b><small>arrives</small></div>
      <div className="pa__n" style={{ ...at(74, 20, 52, 26), ...v({ '--i': 1 }) }}><b>Quote</b><small>prepared</small></div>
      <div className="pa__n" style={{ ...at(146, 20, 52, 26), ...v({ '--i': 2 }) }}><b>Order</b><small>confirmed</small></div>
      <div className="pa__n pa__n--human" style={{ ...at(74, 74, 52, 26), ...v({ '--i': 3 }) }}><b><TbUser aria-hidden="true" />Who?</b><small>hand-off gap</small></div>
    </div>
  );
}

/* ---------- 05 Test — normal and awkward cases before anyone relies on it ---------- */
function TestScene() {
  const rows = [['✓', 'Normal enquiry', 'pass'], ['✓', 'Missing email', 'pass'], ['✓', 'Duplicate contact', 'pass'], ['✓', 'Odd input', 'fixed']] as const;
  return (
    <div className="pa pa--discover pa--test">
      <p className="pa__bar"><span>Test cases</span><b>4 / 4</b></p>
      <ul className="pa__rows">
        {rows.map(([n, t, f], i) => (
          <li key={t} className={f === 'fixed' ? 'is-flag' : undefined} style={v({ '--i': Math.max(0, i - 1) })}><i>{n}</i><span>{t}</span><em>{f}</em></li>
        ))}
      </ul>
    </div>
  );
}

const STAGES: { n: string; id: string; t: string; k: string; Icon: (p: { className?: string }) => ReactNode; lead: string; pts: string[]; out: string; Art: () => ReactNode }[] = [
  { n: '01', id: 'understand', t: 'Understand the business', k: 'Listen', Icon: (p) => <TbSearch {...p} aria-hidden="true" />, lead: 'Learn how your business works today: the people, the tools and where time is lost.', pts: ['Talk through a normal week', 'See which tools and steps are involved', 'Agree what “done” looks like'], out: 'A plain summary of how the work happens today and where it gets stuck.', Art: Discover },
  { n: '02', id: 'map', t: 'Map the workflow', k: 'Chart', Icon: (p) => <TbRoute {...p} aria-hidden="true" />, lead: 'Write the workflow down step by step: who does what, and where hand-offs get lost.', pts: ['Describe each step in plain words', 'Mark hand-offs and delays', 'Pick the workflows worth automating'], out: 'A one-page map of the workflow that you can check and correct.', Art: MapScene },
  { n: '03', id: 'design', t: 'Design the solution', k: 'Plan', Icon: (p) => <TbSitemap {...p} aria-hidden="true" />, lead: 'Decide how the system should behave and how your tools connect.', pts: ['Choose the tools to connect', 'Set the rules for each decision', 'Keep a person in the loop for judgement calls'], out: 'A clear design you can approve before anything is built.', Art: Design },
  { n: '04', id: 'build', t: 'Build and integrate', k: 'Make', Icon: (p) => <TbTools {...p} aria-hidden="true" />, lead: 'Build and connect the system in small pieces you can review along the way.', pts: ['Build one piece at a time', 'Connect your existing tools', 'Review early versions together'], out: 'A working system you can try on real examples.', Art: Build },
  { n: '05', id: 'test', t: 'Test and refine', k: 'Check', Icon: (p) => <TbChecklist {...p} aria-hidden="true" />, lead: 'Try normal cases and awkward ones before anyone relies on it.', pts: ['Test the usual path', 'Test missing and unusual data', 'Fix what breaks and note any limits'], out: 'Confidence that it behaves as designed, with any limits stated plainly.', Art: TestScene },
  { n: '06', id: 'support', t: 'Support and improve', k: 'Refine', Icon: (p) => <TbChartLine {...p} aria-hidden="true" />, lead: 'Watch how it performs in use, fix issues and extend what helps.', pts: ['Watch how it performs', 'Adjust rules as the work changes', 'Extend to the next workflow'], out: 'A system that keeps fitting the way your business works.', Art: Improve },
];

export default function Process() {
  return (
    <section className="sec pw th-light" id="process" aria-labelledby="pw-title">
      <div className="wrap">
        <div className="sec-head sec-head--split">
          <div className="sec-head__main">
            <Reveal as="p" className="eyebrow" variant="up">How MFS works</Reveal>
            <Headline lines={['From how work happens', 'to a system that does it.']} accent={1} className="sec-title" id="pw-title" />
          </div>
          <div className="sec-head__aside">
            <Reveal as="p" className="lede" variant="up" i={2}>Six clear stages, each ending in something you can review — so you always know what is being built, why, and what comes next.</Reveal>
          </div>
        </div>

        <ol className="pw__list">
          {STAGES.map((s, i) => (
            <Reveal as="li" key={s.id} variant="up" i={i} className={`pw__stage pw__stage--${s.id}`}>
              <div className="pw__rail" aria-hidden="true"><span className="pw__node">{s.n}</span><i className="pw__line" /></div>
              <article className="pw__card glass glass--hover" aria-labelledby={`pw-${s.id}`}>
                <div className="pw__scene"><s.Art /><span className="pw__tag">Illustrative</span></div>
                <div className="pw__body">
                  <p className="pw__k"><span>{s.k}</span><s.Icon className="pw__ic" /></p>
                  <h3 id={`pw-${s.id}`}><span className="sr-only">Stage {s.n}: </span>{s.t}</h3>
                  <p className="pw__lead">{s.lead}</p>
                  <ul className="pw__pts">{s.pts.map((p) => <li key={p}><TbCheck aria-hidden="true" /><span>{p}</span></li>)}</ul>
                </div>
                <p className="pw__out"><small>You get</small>{s.out}</p>
              </article>
            </Reveal>
          ))}
        </ol>

        <Reveal as="p" className="pw__cta" variant="up">
          <span>Have a process in mind? Start with a conversation about how it works today.</span>
          <a className="link" href="#contact">Discuss Your Workflow <FiArrowRight className="arrow" aria-hidden="true" /></a>
        </Reveal>
      </div>
    </section>
  );
}
