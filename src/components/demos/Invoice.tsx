// Demo 08 — Invoice & Payment Automation. Finance workspace: invoices, detail, transaction matching, reconciliation, receivables and reporting.
import { useEffect, useRef, useState } from 'react';
import { TbFileInvoice, TbArrowsExchange, TbChartBar } from 'react-icons/tb';
import { Count, type DemoProps } from './engine';
import { Panel, Pill, Toast, useToast, Win } from './kit';

const inr = (n: number) => '₹' + n.toLocaleString('en-IN');
interface Inv { id: string; who: string; amt: number; due: string; late: boolean }
interface Tx { id: string; from: string; amt: number; date: string }
const INVS: Inv[] = [
  { id: 'INV-1038', who: 'Rao Precision Works', amt: 54500, due: '3 days ago', late: false }, { id: 'INV-1039', who: 'Reddy Agro Tools', amt: 18750, due: '12 days ago', late: true }, { id: 'INV-1041', who: 'Deccan Safety Supplies', amt: 12400, due: 'in 4 days', late: false },
  { id: 'INV-1042', who: 'Mirza Print House', amt: 28000, due: '8 days ago', late: true }, { id: 'INV-1043', who: 'Desai Cold Storage', amt: 96000, due: 'in 18 days', late: false },
];
const TXS: Tx[] = [{ id: 't1', from: 'Rao Precision Works', amt: 54500, date: 'Mon' }, { id: 't2', from: 'Deccan Safety Supplies', amt: 12400, date: 'Tue' }, { id: 't3', from: 'Mirza Print House', amt: 28000, date: 'Wed' }, { id: 't4', from: 'Unknown sender', amt: 7300, date: 'Wed' }];
const AP = [['Steel supplier', 64000, 'due in 5 days'], ['Packaging', 12500, 'due in 9 days'], ['Power & utilities', 18200, 'due in 12 days']] as const;
const NAV = [{ id: 'inv', label: 'Invoices', Icon: TbFileInvoice }, { id: 'tx', label: 'Transactions', Icon: TbArrowsExchange }, { id: 'rep', label: 'Reports', Icon: TbChartBar }];

export default function InvoiceDemo({ step, rk }: DemoProps) {
  const [view, setView] = useState('inv'); const [sel, setSel] = useState('INV-1042'); const [m, setM] = useState<Record<string, string>>({ t1: 'INV-1038' }); const [rem, setRem] = useState<string[]>([]); const [busy, setBusy] = useState(false); const [toast, say] = useToast(); const tm = useRef(0);
  const FULL = { t1: 'INV-1038', t2: 'INV-1041', t3: 'INV-1042' };
  useEffect(() => () => clearTimeout(tm.current), []);
  useEffect(() => { clearTimeout(tm.current); setBusy(false); setSel('INV-1042'); setM(step >= 2 ? FULL : { t1: 'INV-1038' }); setRem(step >= 3 ? ['INV-1039'] : []); setView(step === 0 || step === 3 ? 'inv' : step === 4 ? 'rep' : 'tx'); }, [step, rk]); // eslint-disable-line react-hooks/exhaustive-deps
  const paid = (id: string) => Object.values(m).includes(id); const status = (i: Inv) => (paid(i.id) ? 'Paid' : i.late ? 'Overdue' : 'Pending'); const k = (s: string) => (s === 'Paid' ? 'ok' : s === 'Overdue' ? 'err' : 'warn') as 'ok' | 'err' | 'warn';
  const cur = INVS.find((i) => i.id === sel)!; const open = INVS.filter((i) => !paid(i.id)); const overdue = open.filter((i) => i.late); const unm = TXS.filter((t) => !m[t.id]);
  const reconcile = () => { setBusy(true); tm.current = window.setTimeout(() => { setM(FULL); setBusy(false); say('Simulation: 2 transactions matched · 1 left for review'); }, 900); };
  const manual = (t: Tx, id: string) => { const inv = INVS.find((i) => i.id === id); if (!inv) return; if (inv.amt !== t.amt) { say(`Amounts differ (${inr(t.amt)} vs ${inr(inv.amt)}) — left for review`); return; } setM((o) => ({ ...o, [t.id]: id })); say('Simulation: matched'); };
  const sum = (a: Inv[]) => a.reduce((s, i) => s + i.amt, 0);
  const aging = [['Current', sum(open.filter((i) => !i.late))], ['1–15 days', sum(overdue)], ['16–30 days', 0]] as const; const mx = Math.max(...aging.map((a) => a[1]), 1);
  const detail = (
    <Panel p="detail" title="Invoice detail" aside={<Pill k={k(status(cur))}>{status(cur)}</Pill>}>
      <b>{cur.id}</b><p className="faint">{cur.who}</p>
      <dl className="kv"><div><dt>Amount</dt><dd>{inr(cur.amt)}</dd></div><div><dt>Due</dt><dd>{cur.due}</dd></div><div><dt>Payment</dt><dd>{paid(cur.id) ? 'Matched to a transaction (sample)' : 'None found yet'}</dd></div></dl>
      {!paid(cur.id) && <button type="button" className="mbtn" onClick={() => { setRem((r) => (r.includes(cur.id) ? r : [...r, cur.id])); say('Simulation: reminder draft prepared — nothing sent'); }}>Prepare reminder</button>}
      {rem.includes(cur.id) && !paid(cur.id) && <p className="quote">Draft: “Hello, a gentle reminder that invoice {cur.id} for {inr(cur.amt)} is past its due date. Please let us know if you need a copy.”<br /><small className="faint">Draft only — not sent.</small></p>}
    </Panel>);
  return (
    <Win tone="light" app="Finance Desk" nav={NAV} view={view} setView={setView}>
      <Toast msg={toast} />
      {view === 'inv' && <div className="ap__split"><Panel p="inv" title="Invoices" aside={<span className="faint">Sample data</span>} className="tbl-wrap"><table className="tbl"><thead><tr><th>Invoice</th><th>Customer</th><th>Amount</th><th>Due</th><th>Status</th></tr></thead><tbody>{INVS.map((i) => <tr key={i.id} className={sel === i.id ? 'is-sel' : ''} onClick={() => setSel(i.id)}><td><button type="button" className="rowbtn" aria-pressed={sel === i.id} onClick={() => setSel(i.id)}><b>{i.id}</b></button></td><td>{i.who}</td><td>{inr(i.amt)}</td><td>{i.due}</td><td><Pill k={k(status(i))}>{status(i)}</Pill></td></tr>)}</tbody></table></Panel>{detail}</div>}
      {view === 'tx' && (
        <div className="ap__stack">
          <Panel p="match" title="Bank transactions · sample feed" aside={<button type="button" className="mbtn mbtn--solid" onClick={reconcile} disabled={busy || !unm.length}>{busy ? 'Matching…' : 'Reconcile'}</button>} className="tbl-wrap"><table className="tbl"><thead><tr><th>From</th><th>Amount</th><th>Day</th><th>Matched to</th></tr></thead><tbody>{TXS.map((t) => <tr key={t.id} className={m[t.id] ? '' : 'is-un'}><td>{t.from}</td><td>{inr(t.amt)}</td><td>{t.date}</td><td>{m[t.id] ? <Pill k="ok">{m[t.id]}</Pill> : <select aria-label={`Match ${t.from} to an invoice`} value="" onChange={(e: { target: { value: string } }) => manual(t, e.target.value)}><option value="">Unmatched — choose…</option>{open.map((i) => <option key={i.id} value={i.id}>{i.id} · {inr(i.amt)}</option>)}</select>}</td></tr>)}</tbody></table></Panel>
          <Panel p="recon" title="Reconciliation summary"><div className="kpis kpis--3">{[['Matched', Object.keys(m).length], ['Unmatched', unm.length], ['Invoices still open', open.length]].map(([l, n], i) => <div className="kpi" key={l as string} style={{ ['--d' as any]: `${i * 80}ms` }}><span>{l}</span><b><Count to={n as number} rk={rk} /></b></div>)}</div><p className="faint">Matching compares amount and sender. Nothing here confirms a real payment.</p></Panel>
        </div>
      )}
      {view === 'rep' && (
        <div className="ap__stack">
          <div className="kpis kpis--3" data-p="report">{[['Receivable (open)', sum(open)], ['Overdue', sum(overdue)], ['Payable (sample)', 94700]].map(([l, n], i) => <div className="kpi" key={l as string} style={{ ['--d' as any]: `${i * 90}ms` }}><span>{l}</span><b><Count to={n as number} rk={rk} fmt={inr} /></b></div>)}</div>
          <div className="ap__2"><Panel title="Receivables ageing"><ul className="bars">{aging.map(([l, v], i) => <li key={l}><span>{l}</span><div><i key={rk + l + v} style={{ width: `${(v / mx) * 100}%`, ['--d' as any]: `${i * 110}ms` }} /></div><b>{v ? Math.round(v / 1000) + 'k' : '0'}</b></li>)}</ul></Panel>
            <Panel title="Payables · sample"><ul className="wlist">{AP.map(([n, v, d]) => <li key={n}><button type="button" tabIndex={-1}><span><b>{n}</b><small>{d}</small></span><b>{inr(v)}</b></button></li>)}</ul></Panel></div>
        </div>
      )}
    </Win>
  );
}
