// THE MFS ADVANTAGE — "Same business. Connected."
// One scene, two operating environments. The same six apps first sit scattered, with a person re-typing between them,
// then glide into a connected arrangement around one live view. The scene is an ILLUSTRATION (sample data, labelled).
// Sequencing = useTimeline (writes data-step; CSS does the rest). Below it, the six advantages each get their own
// miniature interface. No scroll-pinning: the page always scrolls normally.
import { Fragment, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import { TbArrowsExchange, TbCheck, TbCopy, TbFiles, TbLayoutDashboard, TbListNumbers, TbPlugConnected, TbPlugConnectedX, TbRoute, TbUser } from 'react-icons/tb';
import { BRAND } from '../services/WorkflowThumb';
import { Headline, Reveal } from '../../motion/reveal';
import { useTimeline } from '../../motion/useTimeline';

type K = keyof typeof BRAND;
const v = (o: Record<string, number | string>) => o as unknown as CSSProperties;
const Mark = ({ k, size = '1.75em' }: { k: K; size?: string }) => { const b = BRAND[k]; const I = b.I; return <I size={size} color={b.c} aria-hidden="true" />; };

// s = scattered position (x, y, rotation°) and a = connected position on the 1200×520 desktop canvas;
// j = the same scatter as a small offset (px, px, °) for the narrow-screen grid layout
const TILES = [
  { id: 'ig', k: 'instagram', name: 'Instagram', bad: 'Leads wait in DMs', good: 'Lead captured', s: [150, 120, -6], a: [204, 114], j: [8, 34, -7] },
  { id: 'wa', k: 'whatsapp', name: 'WhatsApp', bad: 'Follow-ups missed', good: 'Follow-up queued', s: [470, 92, 4], a: [204, 250], j: [-4, -2, 5] },
  { id: 'gm', k: 'gmail', name: 'Gmail', bad: 'Unread, no owner', good: 'Logged to the record', s: [430, 412, -5], a: [204, 386], j: [-8, 42, -6] },
  { id: 'hs', k: 'hubspot', name: 'HubSpot CRM', bad: 'Contact out of date', good: 'Contact created', s: [1040, 112, 5], a: [996, 114], j: [6, -40, 6] },
  { id: 'sh', k: 'sheets', name: 'Google Sheets', bad: 'Duplicate rows', good: 'One clean record', s: [910, 408, 6], a: [996, 250], j: [-4, -6, -5] },
  { id: 'ca', k: 'calendar', name: 'Google Calendar', bad: 'Double-bookings', good: 'Slots reserved', s: [1100, 330, -6], a: [996, 386], j: [-6, -46, 7] },
] as const;

// wires (desktop): connected state — tile → hub on the left, hub → tile on the right. Narrow screens draw the same links with CSS.
const WIRES_H = ['M232 114 C320 114 330 165 410 165', 'M232 250 H410', 'M232 386 C320 386 330 335 410 335', 'M790 165 C870 165 880 114 968 114', 'M790 250 H968', 'M790 335 C870 335 880 386 968 386'];
// manual hand-offs (scattered state, desktop only)
const MANUAL = [
  { d: 'M185 140 C330 150 470 215 590 238', t: 'copy', x: 400, y: 196 },
  { d: 'M462 392 C530 380 570 330 604 280', t: 'forward', x: 548, y: 352 },
  { d: 'M650 262 C740 285 830 330 880 382', t: 're-type', x: 790, y: 322 },
  { d: 'M650 232 C760 210 920 165 1012 130', t: 'paste', x: 850, y: 188 },
] as const;
const KPIS = [['New enquiries', '24', 'M0 14 L10 12 L20 13 L30 8 L40 9 L50 4 L60 2'], ['Follow-ups due', '5', 'M0 4 L10 5 L20 6 L30 9 L40 10 L50 12 L60 13'], ['Open invoices', '8', 'M0 7 L10 6 L20 9 L30 7 L40 10 L50 8 L60 6']] as const;

const NO = [[TbPlugConnectedX, 'Disconnected applications'], [TbCopy, 'Manual information transfers'], [TbFiles, 'Scattered records'], [TbListNumbers, 'Multiple administrative steps']] as const;
const YES = [[TbPlugConnected, 'Connected applications'], [TbArrowsExchange, 'Automated information movement'], [TbLayoutDashboard, 'Centralized visibility'], [TbRoute, 'Streamlined business operations']] as const;

function Stage() {
  const ref = useRef<HTMLElement>(null);
  const [initial] = useState(() => (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 2 : 0));
  const [step, setStep] = useState(initial);
  const tl = useTimeline(ref, { scenes: [2600, 2100, 3000], loop: false, onStep: setStep });
  return (
    <section ref={ref} className="wc glass glass--raised stage has-lamps" data-step={initial} aria-label="The same business without and with connected systems" style={v({ '--g-r': '26px' })}>
      <i className="lamp wc__lamp" style={v({ '--lamp-x': '50%', '--lamp-y': '50%', '--lamp-w': '84%', '--lamp-h': '110%', '--lamp-a': 0.15 })} />
      <div className="stage__grid" />
      <header className="wc__top">
        <span className="badge badge--live"><i />Illustrative scenario · sample data</span>
        <span className="wc__note">Logos show the kinds of tools MFS can connect — no partnership implied.</span>
      </header>

      <div className="wc__canvas">
        <div className="wc__world">
          <svg className="wc__wires wc__wires--h" viewBox="0 0 1200 520" aria-hidden="true" focusable="false">
            {MANUAL.map((m) => <path key={m.t} className="wire wire--dash wc__man" d={m.d} />)}
            {WIRES_H.map((d, i) => <path key={i} className="wire" d={d} />)}
            {WIRES_H.map((d, i) => <path key={i} className="wire--live wc__live-wire" pathLength={1} d={d} style={v({ '--k': i % 3 })} />)}
            {WIRES_H.map((d, i) => <path key={i} className="wc__flow" d={d} />)}
          </svg>

          {/* the person doing it by hand — only in the “without” state */}
          <div className="wc__u wc__you" style={v({ '--hx': 620, '--hy': 246 })}>
            <span className="tile"><TbUser size="1.7em" color="var(--taupe)" aria-hidden="true" /></span><span className="wc__cap2">You, copy-pasting</span>
            <span className="wc__chips" aria-hidden="true">{MANUAL.map((m) => <span key={m.t}>{m.t}</span>)}</span>
          </div>
          {MANUAL.map((m) => <span key={m.t} className="wc__u wc__chip" style={v({ '--hx': m.x, '--hy': m.y })}>{m.t}</span>)}

          {TILES.map((t, i) => (
            <div key={t.id} className={`wc__t wc__t--${t.id}`} style={v({ '--sx': t.s[0], '--sy': t.s[1], '--sr': t.s[2], '--ax': t.a[0], '--ay': t.a[1], '--jx': t.j[0], '--jy': t.j[1], '--jr': t.j[2], '--k': i % 3 })}>
              <span className="tile"><Mark k={t.k} /></span>
              <span className="wc__cap" aria-hidden="true"><b className="wc__bad">{t.bad}</b><b className="wc__mid">{t.name}</b><b className="wc__good">{t.good}</b></span>
              <span className="sr-only">{t.name}: {step >= 2 ? t.good : t.bad}</span>
            </div>
          ))}

          {/* the connected state: one live view */}
          <div className="wc__u wc__hub" style={v({ '--hx': 600, '--hy': 250, '--hw': 380, '--hh': 330 })}>
            <div className="wc__hub-top"><img src="./assets/mfs-logo-dark.png" alt="" width="1064" height="542" /><span className="wc__livetag"><i />Live view</span></div>
            <p className="wc__hub-h">Connected operations</p>
            <ul className="wc__kpis">
              {KPIS.map(([l, n, d]) => (<li key={l}><span>{l}</span><b>{n}</b><svg viewBox="0 0 60 16" aria-hidden="true"><path d={d} pathLength={1} /></svg></li>))}
            </ul>
            <p className="wc__hub-f">One record per customer, updated automatically.</p>
          </div>
        </div>
      </div>

      <div className="wc__cols">
        {([['no', 'Without connected systems', NO, 0], ['yes', 'With MFS systems', YES, 2]] as const).map(([k, title, items, to]) => {
          const on = k === 'no' ? step < 1 : step >= 1;
          return (
          <div key={k} className={`wc__col wc__col--${k}${on ? ' is-on' : ''}`}>
            <button type="button" className="wc__colhead" aria-pressed={on} onClick={() => tl.goto(to)}><span>{title}</span></button>
            <ul>{items.map(([I, t]) => <li key={t}><I aria-hidden="true" /><span>{t}</span></li>)}</ul>
          </div>
          );
        })}
      </div>
    </section>
  );
}

/* ---------- six advantages, each with its own miniature interface ---------- */
const ADV = [
  { t: 'Less manual work', p: 'Your team spends too much time on the same tasks every day.', c: 'MFS builds systems that handle the routine steps automatically.', g: 'More time for the work that needs a person.', ui: 'admin' },
  { t: 'Connected business tools', p: 'Important information is scattered across different tools.', c: 'We connect your tools and bring the key details together.', g: 'You find what you need without searching everywhere.', ui: 'apps' },
  { t: 'Fewer missed follow-ups', p: 'Enquiries and tasks can get forgotten.', c: 'We set up organised tracking, reminders and follow-up workflows.', g: 'Your team knows what needs attention next.', ui: 'team' },
  { t: 'Better visibility', p: 'Owners cannot always see what is happening across daily operations.', c: 'We create clear records, dashboards and status views.', g: 'A better understanding of what is going on in the business.', ui: 'view' },
  { t: 'Faster information flow', p: 'Information waits until someone remembers to pass it on.', c: 'It reaches the right person as soon as it exists.', g: 'Fewer delays between one step and the next.', ui: 'flow' },
  { t: 'More time for growth', p: 'Hours go into coordination instead of customers.', c: 'Hand-offs and reminders run by simple rules.', g: 'Hours go back to customers, sales and the next idea.', ui: 'time' },
] as const;

function Mini({ ui }: { ui: (typeof ADV)[number]['ui'] }) {
  if (ui === 'admin') return (
    <ul className="mini mini--admin" aria-hidden="true">
      {['Log the new enquiry', 'Update the spreadsheet', 'Send the confirmation', 'Remind the owner'].map((t, i) => (<li key={t} style={v({ '--i': i })}><i><TbCheck /></i><span>{t}</span><em>auto</em></li>))}
    </ul>
  );
  if (ui === 'apps') return (
    <div className="mini mini--apps" aria-hidden="true">
      <div className="mini__stage">
        <svg viewBox="0 0 240 150"><g className="mini__w">{['M54 40 L96 64', 'M186 40 L144 64', 'M54 110 L96 86', 'M186 110 L144 86'].map((d, i) => <path key={i} d={d} pathLength={1} style={v({ '--i': i })} />)}</g></svg>
        <span className="mini__hub">MFS</span>
        {(['hubspot', 'sheets', 'whatsapp', 'gmail'] as K[]).map((k, i) => <span key={k} className={`tile tile--sm mini__app mini__app--${i}`}><Mark k={k} size="1.45em" /></span>)}
      </div>
    </div>
  );
  if (ui === 'view') return (
    <div className="mini mini--view" aria-hidden="true">
      {[['New', '24'], ['Due', '5'], ['Open', '8']].map(([l, n]) => (<div key={l}><small>{l}</small><b>{n}</b></div>))}
      <svg viewBox="0 0 240 56" preserveAspectRatio="none"><path className="mini__area" d="M0 44 L30 38 L60 41 L90 28 L120 31 L150 18 L180 22 L210 8 L240 12 L240 56 L0 56 Z" /><path className="mini__line" pathLength={1} d="M0 44 L30 38 L60 41 L90 28 L120 31 L150 18 L180 22 L210 8 L240 12" /></svg>
    </div>
  );
  if (ui === 'flow') return (
    <div className="mini mini--flow" aria-hidden="true">
      <div><small>Passed on by hand</small><p className="mini__lane"><i style={v({ '--w': 22, '--i': 0 })} /><u style={v({ '--w': 18 })} /><i style={v({ '--w': 16, '--i': 1 })} /><u style={v({ '--w': 20 })} /><i style={v({ '--w': 14, '--i': 2 })} /></p></div>
      <div><small>Moves on its own</small><p className="mini__lane mini__lane--fast"><i style={v({ '--w': 26, '--i': 3 })} /><em><TbCheck /></em></p></div>
    </div>
  );
  if (ui === 'team') return (
    <ul className="mini mini--team" aria-hidden="true">
      {[['P', 'New enquiry', 'Assigned to Priya'], ['A', 'Quote due Friday', 'Reminder sent'], ['R', 'Invoice overdue', 'Owner notified']].map(([a, t, c], i) => (<li key={t} style={v({ '--i': i })}><b>{a}</b><span>{t}</span><em>{c}</em></li>))}
    </ul>
  );
  return (
    <div className="mini mini--time" aria-hidden="true">
      <div className="mini__days">{['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map((d, c) => (<div key={d}><small>{d}</small>{[0, 1, 2].map((r) => { const back = (c + r) % 3 === 1 || (c === 4 && r === 2); return <span key={r} className={back ? 'is-back' : 'is-admin'} style={v({ '--i': c + r })} />; })}</div>))}</div>
      <p><span className="lg lg--admin" />Admin <span className="lg lg--back" />Time back</p>
    </div>
  );
}

export default function Advantage() {
  return (
    <section className="sec adv th-light" id="advantage" aria-labelledby="adv-title">
      <div className="wrap">
        <div className="sec-head sec-head--split">
          <div className="sec-head__main">
            <Reveal as="p" className="eyebrow" variant="up">The MFS Advantage</Reveal>
            <Headline lines={['Same business.', 'Connected.']} accent={1} className="sec-title" id="adv-title" />
          </div>
          <div className="sec-head__aside">
            <Reveal as="p" className="lede" variant="up" i={2}>The tools you already use stop working in separate corners. MFS connects them so information moves on its own — less admin, clearer visibility and more time for the work that grows the business.</Reveal>
          </div>
        </div>
        <Stage />
        <ul className="adv__grid">
          {ADV.map((a, i) => (
            <Fragment key={a.t}>
              <Reveal as="li" variant="up" i={i % 3} className="adv__card glass">
                <Mini ui={a.ui} />
                <h3>{a.t}</h3>
                <dl className="adv__pcs">
                  <div><dt>Today</dt><dd>{a.p}</dd></div>
                  <div><dt>MFS changes</dt><dd>{a.c}</dd></div>
                  <div className="is-get"><dt>You get</dt><dd>{a.g}</dd></div>
                </dl>
              </Reveal>
            </Fragment>
          ))}
        </ul>
      </div>
    </section>
  );
}
