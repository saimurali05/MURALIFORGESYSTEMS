// Demo 04 — Marketing Automation. Campaign workspace with a visual journey builder, audience segments, message preview, review and scheduling.
import { useEffect, useState } from 'react';
import { TbRoute2, TbSpeakerphone, TbUsersGroup } from 'react-icons/tb';
import type { DemoProps } from './engine';
import { Count } from './engine';
import { Panel, Pill, Seg, Toast, useToast, Win } from './kit';

const SEGS = [
  { id: 's1', name: 'Safety equipment buyers', n: 214, topic: 'helmets, harnesses and gloves' },
  { id: 's2', name: 'Fabrication workshops', n: 96, topic: 'fixtures and tooling' },
  { id: 's3', name: 'Facilities managers', n: 58, topic: 'maintenance and service plans' },
];
type NodeT = { id: string; t: 'Trigger' | 'Condition' | 'Email' | 'Wait' | 'WhatsApp'; title: string; sub: string; x: number; y: number };
const NODES: NodeT[] = [
  { id: 'n1', t: 'Trigger', title: 'Catalogue downloaded', sub: 'Website form', x: 0, y: 24 }, { id: 'n2', t: 'Condition', title: 'Consent given?', sub: 'Yes → continue · No → stop', x: 150, y: 24 },
  { id: 'n3', t: 'Email', title: 'Welcome + catalogue', sub: 'Immediately', x: 300, y: 24 }, { id: 'n4', t: 'Wait', title: 'Wait 2 days', sub: 'Then check engagement', x: 450, y: 24 },
  { id: 'n5', t: 'Condition', title: 'Opened the email?', sub: 'Engagement branch', x: 450, y: 170 }, { id: 'n6', t: 'WhatsApp', title: 'Short follow-up', sub: 'Only if opted in', x: 300, y: 170 }, { id: 'n7', t: 'Email', title: 'Gentle reminder', sub: 'Different subject line', x: 600, y: 170 },
];
const W = 118, H = 66;
const EDGES: [string, string, string?][] = [['n1', 'n2'], ['n2', 'n3', 'Yes'], ['n3', 'n4'], ['n4', 'n5'], ['n5', 'n6', 'Opened'], ['n5', 'n7', 'Not opened']];
const ORDER = ['n1', 'n2', 'n3', 'n4', 'n5'];
const NAV = [{ id: 'journey', label: 'Journey', Icon: TbRoute2 }, { id: 'campaigns', label: 'Campaigns', Icon: TbSpeakerphone }, { id: 'audience', label: 'Audience', Icon: TbUsersGroup }];
const pt = (a: NodeT, b: NodeT) => { // connector between two nodes' nearest edges
  if (a.y === b.y) return a.x < b.x ? `M${a.x + W} ${a.y + H / 2} L${b.x} ${b.y + H / 2}` : `M${a.x} ${a.y + H / 2} L${b.x + W} ${b.y + H / 2}`;
  return `M${a.x + W / 2} ${a.y + H} L${b.x + W / 2} ${b.y}`;
};

export default function MarketingDemo({ step, rk }: DemoProps) {
  const [view, setView] = useState('journey'); const [seg, setSeg] = useState('s1'); const [lit, setLit] = useState(0); const [branch, setBranch] = useState<'Opened' | 'Not opened'>('Opened');
  const [rev, setRev] = useState(0); const [open, setOpen] = useState<string | null>(null); const [chan, setChan] = useState<'Email' | 'WhatsApp'>('Email'); const [toast, say] = useToast();
  useEffect(() => { setView('journey'); setOpen(null); setSeg('s1'); setBranch('Opened'); setChan('Email');
    setLit([0, 4, 4, 4, 5, 7][step]); setRev([0, 0, 0, 1, 2, 2][step]); if (step === 5) setView('campaigns'); }, [step, rk]);
  const S = SEGS.find((x) => x.id === seg)!; const skipped = Math.round(S.n * 0.08);
  const nodeOn = (id: string) => { const i = ORDER.indexOf(id); if (i >= 0) return i < lit; if (id === 'n6') return lit >= 7 && branch === 'Opened'; if (id === 'n7') return lit >= 7 && branch === 'Not opened'; return false; };
  const edgeOn = (a: string, b: string) => nodeOn(a) && nodeOn(b);
  const node = NODES.find((n) => n.id === open);
  const body = chan === 'Email' ? `Hello,\n\nThank you for downloading our catalogue. Here is the part most relevant to you: ${S.topic}.\n\nReply to this email if you would like a quote.` : `Hi! Thanks for downloading our catalogue. Want a quick quote on ${S.topic}? Reply YES and a person will help.`;
  const cn = (id: string) => NODES.find((n) => n.id === id)!;
  return (
    <Win tone="light" app="Campaign Studio" nav={NAV} view={view} setView={setView}>
      <Toast msg={toast} />
      {view === 'journey' && (
        <div className="ap__split ap__split--wide">
          <Panel p="journey" title="Journey · Catalogue follow-up" aside={<Seg label="Simulate the branch" items={['Opened', 'Not opened'] as const} value={branch} onChange={(b) => { setBranch(b); setLit((l) => Math.max(l, 7)); }} />}>
            <div className="jscroll"><div className="jcanvas">
              <svg viewBox="0 0 720 260" aria-hidden="true">{EDGES.map(([a, b, l]) => { const A = cn(a), B = cn(b); const on = edgeOn(a, b); return <g key={a + b}><path d={pt(A, B)} pathLength={1} className={`je${on ? ' is-on' : ''}`} />{l && <text x={(A.x + B.x + W) / 2 - (A.y === B.y ? 0 : 0)} y={(A.y + B.y) / 2 + H / 2 - 6} textAnchor="middle" className="jl">{l}</text>}</g>; })}</svg>
              {NODES.map((n) => <button type="button" key={n.id} className={`jn jn--${n.t.toLowerCase()}${nodeOn(n.id) ? ' is-on' : ''}${open === n.id ? ' is-open' : ''}`} style={{ left: n.x, top: n.y, width: W, height: H }} aria-pressed={open === n.id} onClick={() => setOpen(n.id === open ? null : n.id)}><small>{n.t}</small><b>{n.title}</b></button>)}
            </div></div>
            {node && <div className="selcard" role="group" aria-label="Step details"><div className="pn__h"><h4>{node.t} step</h4><button type="button" className="mbtn" onClick={() => setOpen(null)}>Close</button></div><b>{node.title}</b><p className="faint">{node.sub}. {node.t === 'Condition' ? 'The journey splits here based on the customer’s behaviour.' : node.t === 'Wait' ? 'The customer stays in the journey; nothing is sent.' : node.t === 'Trigger' ? 'Starts when a person downloads the catalogue.' : 'Preview the message in the panel on the right.'}</p></div>}
          </Panel>
          <div className="ap__stack">
            <Panel p="segment" title="Audience segment"><ul className="convs">{SEGS.map((x) => <li key={x.id}><button type="button" className={seg === x.id ? 'is-on' : ''} aria-pressed={seg === x.id} onClick={() => setSeg(x.id)}><span><b>{x.name}</b><small>{x.n} contacts · consent confirmed</small></span></button></li>)}</ul></Panel>
            <Panel p="content" title="Message preview" aside={<Seg label="Channel" items={['Email', 'WhatsApp'] as const} value={chan} onChange={setChan} />}>
              {chan === 'Email' && <p className="faint">Subject: Your catalogue — {S.topic}</p>}<pre className="msg">{body}</pre>
            </Panel>
            <Panel p="review" title="Review" aside={<Pill k={rev === 0 ? 'n' : rev === 1 ? 'warn' : 'ok'}>{['Draft', 'In review', 'Approved'][rev]}</Pill>}>
              {rev === 0 && <button type="button" className="mbtn" onClick={() => setRev(1)}>Send for review</button>}{rev === 1 && <button type="button" className="mbtn mbtn--solid" onClick={() => { setRev(2); say('Simulation: approved and scheduled'); }}>Approve</button>}{rev === 2 && <p className="faint">Approved by a person before scheduling.</p>}
            </Panel>
            <Panel p="schedule" title="Schedule"><p>{rev === 2 ? 'Tue 10:00 (recipient’s time)' : 'Not scheduled yet'}</p><p className="faint">{skipped} contacts skipped (unsubscribed or no consent)</p></Panel>
          </div>
        </div>
      )}
      {view === 'campaigns' && (
        <div className="ap__stack">
          <Panel p="stats" title="Engagement · sample data" aside={<Pill k="info">Running</Pill>}>
            <div className="kpis kpis--3">{[['Delivered', 196], ['Opened', 112], ['Replied', 17]].map(([l, n], i) => <div className="kpi" key={l as string} style={{ ['--d' as any]: `${i * 90}ms` }}><span>{l}</span><b><Count to={n as number} rk={rk} /></b></div>)}</div>
            <svg className="spark" viewBox="0 0 300 80" preserveAspectRatio="none" role="img" aria-label="Sample engagement over seven days"><path key={rk + 'a'} className="draw" pathLength={1} d="M0 70 C30 60 50 62 80 48 S130 40 160 30 S230 26 300 8" /><path key={rk + 'b'} className="draw draw--b" pathLength={1} d="M0 74 C40 72 60 70 90 64 S150 58 190 50 S260 48 300 40" /></svg>
          </Panel>
          <Panel title="Campaigns"><ul className="wlist">{[['Catalogue follow-up', 'Running', 'ok'], ['Service plan reminder', 'Scheduled', 'warn'], ['Festive greetings', 'Draft', 'n']].map(([n, s, k]) => <li key={n}><button type="button" onClick={() => { setView('journey'); say('Simulation: opened ' + n); }}><span><b>{n}</b><small>Email + WhatsApp</small></span><Pill k={k as 'ok' | 'warn' | 'n'}>{s}</Pill></button></li>)}</ul></Panel>
        </div>
      )}
      {view === 'audience' && (
        <Panel title="Audience segments" aside={<span className="faint">Sample data</span>}><div className="tbl-wrap"><table className="tbl"><thead><tr><th>Segment</th><th>Contacts</th><th>Consent</th><th>Channel</th></tr></thead><tbody>{SEGS.map((x) => <tr key={x.id} onClick={() => { setSeg(x.id); setView('journey'); }}><td><b>{x.name}</b></td><td>{x.n}</td><td><Pill k="ok">Confirmed</Pill></td><td>Email · WhatsApp (opted in)</td></tr>)}</tbody></table></div></Panel>
      )}
    </Win>
  );
}
