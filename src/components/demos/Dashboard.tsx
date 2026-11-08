// Demo 11 — Dashboards & Business Analytics. Measures with agreed definitions, and the decisions they point to.
import { useEffect, useState } from 'react';
import { TbLayoutDashboard, TbChartBar, TbBuildingWarehouse, TbRuler2 } from 'react-icons/tb';
import { Count, type DemoProps } from './engine';
import { Panel, Pill, Seg, Toast, useToast, Win } from './kit';

const inr = (n: number) => '₹' + n.toLocaleString('en-IN');
const RANGES = ['This week', 'Last week'] as const; type R = (typeof RANGES)[number];
const D: Record<R, { enq: number; quotes: number; orders: number; overdue: number; src: [string, number][]; funnel: [string, number][] }> = {
  'This week': { enq: 38, quotes: 11, orders: 14, overdue: 46750, src: [['Website', 16], ['WhatsApp', 12], ['Referral', 6], ['Social media', 4]], funnel: [['Enquiries', 38], ['Qualified', 24], ['Quoted', 11], ['Won', 6]] },
  'Last week': { enq: 31, quotes: 9, orders: 12, overdue: 28000, src: [['Website', 13], ['WhatsApp', 9], ['Referral', 6], ['Social media', 3]], funnel: [['Enquiries', 31], ['Qualified', 20], ['Quoted', 9], ['Won', 5]] },
};
const DEFS: [string, string][] = [
  ['Enquiries', 'Every new contact from the website form, WhatsApp, referrals or social media, counted once per person per week.'],
  ['Qualified', 'Enquiries that have a service need, a contact route and a decision-maker confirmed.'],
  ['Quotes waiting', 'Quotations sent and not yet approved or declined.'],
  ['Overdue invoices', 'Invoices past their due date with no matching payment recorded.'],
];
const NAV = [{ id: 'over', label: 'Overview', Icon: TbLayoutDashboard }, { id: 'sales', label: 'Sales', Icon: TbChartBar }, { id: 'ops', label: 'Operations', Icon: TbBuildingWarehouse }, { id: 'def', label: 'Definitions', Icon: TbRuler2 }];
const ACTIONS = [
  { id: 'a1', t: '3 quotations have waited more than 5 days', d: 'Approve, adjust or follow up with the customers.', k: 'warn' as const },
  { id: 'a2', t: 'M8 fastener packs are below the minimum level', d: '14 left, minimum 80. Decide whether to reorder.', k: 'err' as const },
  { id: 'a3', t: 'Two invoices are overdue (₹46,750)', d: 'Prepare reminders for review.', k: 'err' as const },
];

export default function DashboardDemo({ step, rk }: DemoProps) {
  const [view, setView] = useState('over'); const [range, setRange] = useState<R>('This week'); const [done, setDone] = useState<string[]>([]); const [def, setDef] = useState(0); const [toast, say] = useToast();
  useEffect(() => { setRange('This week'); setDone(step >= 5 ? ['a1'] : []); setDef(step === 5 ? 2 : 0); setView(step === 0 || step === 4 ? 'over' : step === 1 || step === 2 ? 'sales' : step === 3 ? 'ops' : 'def'); }, [step, rk]); // eslint-disable-line
  const d = D[range]; const mx = Math.max(...d.src.map((x) => x[1]));
  const kp: [string, number, ((n: number) => string) | undefined][] = [['Enquiries', d.enq, undefined], ['Quotes waiting', d.quotes, undefined], ['Orders in progress', d.orders, undefined], ['Overdue invoices', d.overdue, inr]];
  return (
    <Win tone="light" app="Business Pulse" nav={NAV} view={view} setView={setView} right={<Seg value={range} onChange={setRange} items={RANGES} label="Period" />}>
      <Toast msg={toast} />
      {view === 'over' && (
        <div className="ap__stack">
          <div className="kpis" data-p="kpi">{kp.map(([l, n, f], i) => <div className="kpi" key={l} style={{ ['--d' as any]: `${i * 80}ms` }}><span>{l}</span><b><Count to={n} rk={rk} fmt={f} /></b></div>)}</div>
          <Panel p="act" title="Needs a decision" aside={<Pill k={ACTIONS.length - done.length ? 'warn' : 'ok'}>{ACTIONS.length - done.length} open</Pill>}>
            <ul className="wlist">{ACTIONS.map((a) => <li key={a.id}><button type="button" className={done.includes(a.id) ? 'is-on' : ''} onClick={() => { setDone((x) => (x.includes(a.id) ? x : [...x, a.id])); say('Simulation: marked as reviewed — no action is taken'); }}><span><b>{a.t}</b><small>{a.d}</small></span>{done.includes(a.id) ? <Pill k="ok">Reviewed</Pill> : <Pill k={a.k}>Review</Pill>}</button></li>)}</ul>
          </Panel>
        </div>)}
      {view === 'sales' && (
        <div className="ap__2">
          <Panel p="src" title="Where enquiries come from"><ul className="bars">{d.src.map(([l, v], i) => <li key={l}><span>{l}</span><div><i key={rk + l + range} style={{ width: `${(v / mx) * 100}%`, ['--d' as any]: `${i * 100}ms` }} /></div><b>{v}</b></li>)}</ul></Panel>
          <Panel p="funnel" title="From enquiry to won"><ul className="bars bars--s">{d.funnel.map(([l, v], i) => <li key={l}><span>{l}</span><div><i key={rk + l + range} style={{ width: `${(v / d.funnel[0][1]) * 100}%`, ['--d' as any]: `${i * 100}ms` }} /></div><b>{v}</b></li>)}</ul><p className="faint">Counts for the selected period. Sample figures.</p></Panel>
        </div>)}
      {view === 'ops' && (
        <div className="ap__2">
          <Panel p="ops" title="Orders in progress"><ul className="wlist">{[['Picking', 6], ['Awaiting dispatch', 5], ['Needs attention', 3]].map(([l, n]) => <li key={l as string}><button type="button" tabIndex={-1}><span><b>{l}</b></span><Pill k={l === 'Needs attention' ? 'err' : 'n'}>{n}</Pill></button></li>)}</ul></Panel>
          <Panel title="Stock and payments"><ul className="wlist"><li><button type="button" tabIndex={-1}><span><b>Items below minimum</b><small>M8 fastener packs</small></span><Pill k="warn">1</Pill></button></li><li><button type="button" tabIndex={-1}><span><b>Overdue invoices</b><small>{inr(d.overdue)}</small></span><Pill k="err">2</Pill></button></li></ul></Panel>
        </div>)}
      {view === 'def' && (
        <div className="ap__split">
          <Panel p="def" title="Measures we agreed up front"><ul className="wlist">{DEFS.map(([n], i) => <li key={n}><button type="button" className={def === i ? 'is-on' : ''} onClick={() => setDef(i)}><span><b>{n}</b></span></button></li>)}</ul></Panel>
          <Panel title="How it is calculated"><b>{DEFS[def][0]}</b><p>{DEFS[def][1]}</p><p className="faint">Every figure on the dashboard has a written definition, so the numbers mean the same thing to everyone.</p></Panel>
        </div>)}
    </Win>
  );
}
