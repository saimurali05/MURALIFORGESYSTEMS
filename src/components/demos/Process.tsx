// Demo 03 — Business Process Automation. Workflow operations dashboard: overview, stage tracker, approval, execution history.
import { useEffect, useRef, useState } from 'react';
import { TbChecklist, TbHistory, TbLayoutDashboard, TbCheck } from 'react-icons/tb';
import { Count, type DemoProps } from './engine';
import { Panel, Pill, Toast, useToast, Win } from './kit';

const STAGES = ['Submitted', 'Validated', 'Approval', 'Assigned', 'Completed'];
interface Wf { id: string; title: string; by: string; amt: string; stage: number; status: 'Running' | 'Awaiting approval' | 'Completed' | 'Rejected'; owner: string }
interface Ev { t: string; wf: string; msg: string; who: string }
const BASE: Wf[] = [
  { id: 'w1', title: 'Purchase request · Safety helmets (20)', by: 'Anita R.', amt: '₹38,000', stage: 2, status: 'Awaiting approval', owner: 'Manager' },
  { id: 'w2', title: 'Expense claim · Site travel', by: 'Rohan S.', amt: '₹6,450', stage: 3, status: 'Running', owner: 'Accounts' },
  { id: 'w3', title: 'Vendor onboarding · Mirza Print', by: 'Meera I.', amt: '—', stage: 1, status: 'Running', owner: 'System' },
  { id: 'w4', title: 'Leave request · 2 days', by: 'Karthik N.', amt: '—', stage: 4, status: 'Completed', owner: 'HR' },
];
const NEW: Wf = { id: 'w5', title: 'Purchase request · Office chairs (6)', by: 'Priya N.', amt: '₹27,600', stage: 0, status: 'Running', owner: 'System' };
const LOG0: Ev[] = [{ t: '09:12', wf: 'Leave request · 2 days', msg: 'Completed and HR records updated', who: 'System' }, { t: '09:05', wf: 'Expense claim · Site travel', msg: 'Approved and assigned to Accounts', who: 'Manager' }];
const NAV = [{ id: 'overview', label: 'Overview', Icon: TbLayoutDashboard }, { id: 'history', label: 'History', Icon: TbHistory }, { id: 'queue', label: 'Review queue', Icon: TbChecklist }];
const statusK = (s: Wf['status']) => (s === 'Completed' ? 'ok' : s === 'Rejected' ? 'err' : s === 'Awaiting approval' ? 'warn' : 'n') as 'ok' | 'err' | 'warn' | 'n';

export default function ProcessDemo({ step, rk }: DemoProps) {
  const [view, setView] = useState('overview'); const [wfs, setWfs] = useState<Wf[]>(BASE); const [log, setLog] = useState<Ev[]>(LOG0); const [sel, setSel] = useState('w1'); const [toast, say] = useToast(); const tm = useRef(0);
  useEffect(() => () => clearInterval(tm.current), []);
  useEffect(() => { // idempotent: each step builds its whole state
    clearInterval(tm.current); setView('overview');
    const mk = (stage: number, status: Wf['status'], owner: string) => ({ ...NEW, stage, status, owner });
    const ev = (n: number): Ev[] => [
      ...(n >= 5 ? [{ t: '09:41', wf: NEW.title, msg: 'Completed · records updated · requester notified', who: 'System' }] : []),
      ...(n >= 4 ? [{ t: '09:38', wf: NEW.title, msg: 'Assigned to Procurement', who: 'System' }] : []),
      ...(n >= 3 ? [{ t: '09:36', wf: NEW.title, msg: 'Approved by Operations Manager', who: 'Manager' }] : []),
      ...(n >= 2 ? [{ t: '09:34', wf: NEW.title, msg: 'Validated: fields, budget and stock checked', who: 'System' }] : []),
      ...(n >= 1 ? [{ t: '09:33', wf: NEW.title, msg: 'Request submitted', who: 'Priya N.' }] : []), ...LOG0];
    if (step === 0) { setWfs(BASE); setSel('w1'); setLog(LOG0); }
    if (step === 1) { setWfs([mk(0, 'Running', 'System'), ...BASE]); setSel('w5'); setLog(ev(1)); }
    if (step === 2) { setWfs([mk(1, 'Running', 'System'), ...BASE]); setSel('w5'); setLog(ev(2)); }
    if (step === 3) { setWfs([mk(2, 'Awaiting approval', 'Manager'), ...BASE]); setSel('w5'); setLog(ev(2)); }
    if (step === 4) { setWfs([mk(3, 'Running', 'Procurement'), ...BASE]); setSel('w5'); setLog(ev(4)); }
    if (step === 5) { setWfs([mk(4, 'Completed', 'Procurement'), ...BASE]); setSel('w5'); setLog(ev(5)); setView('history'); }
  }, [step, rk]);
  const cur = wfs.find((w) => w.id === sel) ?? wfs[0]; const now = () => '09:4' + Math.min(9, log.length % 10);
  const patch = (id: string, p: Partial<Wf>, msg: string, who: string) => { setWfs((ws) => ws.map((w) => (w.id === id ? { ...w, ...p } : w))); setLog((l) => [{ t: now(), wf: wfs.find((w) => w.id === id)!.title, msg, who }, ...l]); say('Simulation: ' + msg.toLowerCase()); };
  const run = () => {
    clearInterval(tm.current); const w: Wf = { ...NEW, id: 'w' + (wfs.length + 10), title: 'Purchase request · Laptop bags (10)', amt: '₹19,000' };
    setWfs((ws) => [w, ...ws]); setSel(w.id); setLog((l) => [{ t: now(), wf: w.title, msg: 'Request submitted', who: 'Priya N.' }, ...l]); let i = 0;
    tm.current = window.setInterval(() => { i++; if (i === 1) { setWfs((ws) => ws.map((x) => (x.id === w.id ? { ...x, stage: 1 } : x))); setLog((l) => [{ t: now(), wf: w.title, msg: 'Validated: fields, budget and stock checked', who: 'System' }, ...l]); }
      else { setWfs((ws) => ws.map((x) => (x.id === w.id ? { ...x, stage: 2, status: 'Awaiting approval', owner: 'Manager' } : x))); clearInterval(tm.current); } }, 800);
  };
  const pending = wfs.filter((w) => w.status === 'Awaiting approval');
  const approval = cur.status === 'Awaiting approval' && (
    <Panel p="approval" title="Pending approval" aside={<Pill k="warn">Needs a decision</Pill>}>
      <p><b>{cur.title}</b></p><p className="faint">Requested by {cur.by} · {cur.amt} · within budget · stock available (sample checks)</p>
      <div className="row"><button type="button" className="mbtn mbtn--solid" onClick={() => patch(cur.id, { stage: 3, status: 'Running', owner: 'Procurement' }, 'Approved — assigned to Procurement', 'Manager')}><TbCheck size={15} aria-hidden="true" /> Approve</button>
        <button type="button" className="mbtn" onClick={() => patch(cur.id, { status: 'Rejected', owner: 'Requester' }, 'Rejected — returned to requester with a reason', 'Manager')}>Reject</button></div>
    </Panel>);
  return (
    <Win tone="light" app="Process Console" nav={NAV} view={view} setView={setView}>
      <Toast msg={toast} />
      {view === 'overview' && (
        <div className="ap__stack">
          <div className="kpis" data-p="kpi">{[['Active workflows', wfs.filter((w) => w.status === 'Running' || w.status === 'Awaiting approval').length], ['Pending approvals', pending.length], ['Completed today', wfs.filter((w) => w.status === 'Completed').length + 11], ['In review queue', wfs.filter((w) => w.status === 'Rejected').length]].map(([l, n], i) => (
            <div className="kpi" key={l as string} style={{ ['--d' as any]: `${i * 90}ms` }}><span>{l}</span><b><Count to={n as number} rk={rk} /></b></div>))}</div>
          <div className="ap__2">
            <Panel p="list" title="Workflows" aside={<button type="button" className="mbtn" onClick={run}>Run a new request</button>}>
              <ul className="wlist">{wfs.map((w) => <li key={w.id}><button type="button" className={`${sel === w.id ? 'is-on' : ''}${w.id === 'w5' ? ' is-new' : ''}`} aria-pressed={sel === w.id} onClick={() => setSel(w.id)}><span><b>{w.title}</b><small>{w.by} · {w.amt}</small></span><Pill k={statusK(w.status)}>{w.status}</Pill></button></li>)}</ul>
            </Panel>
            <div className="ap__stack">
              <Panel p="stage" title="Current stage" aside={<span className="faint">Owner: {cur.owner}</span>}>
                <p className="wtitle">{cur.title}</p>
                <ol className="track">{STAGES.map((s, i) => <li key={s} className={cur.status === 'Rejected' && i >= cur.stage ? 'is-x' : i < cur.stage || cur.status === 'Completed' ? 'is-done' : i === cur.stage ? 'is-now' : ''}><i>{i < cur.stage || cur.status === 'Completed' ? <TbCheck size={12} aria-hidden="true" /> : i + 1}</i><span>{s}</span></li>)}</ol>
              </Panel>
              {approval}
              {cur.status === 'Running' && cur.stage === 3 && <Panel title="Assigned task"><p>Raise purchase order · {cur.owner}</p><button type="button" className="mbtn" onClick={() => patch(cur.id, { stage: 4, status: 'Completed' }, 'Completed — records updated, requester notified', cur.owner)}>Mark complete</button></Panel>}
            </div>
          </div>
        </div>
      )}
      {view === 'history' && (
        <Panel p="history" title="Execution history" aside={<span className="faint">Newest first</span>}>
          <ol className="feed feed--wide">{log.slice(0, 9).map((e, i) => <li key={e.t + e.msg + i} style={{ ['--d' as any]: `${i * 60}ms` }}><time>{e.t} · {e.who}</time><b>{e.wf}</b><br />{e.msg}</li>)}</ol>
        </Panel>
      )}
      {view === 'queue' && (
        <Panel title="Human review queue" aside={<span className="faint">{pending.length} waiting</span>}>
          {pending.length ? <ul className="wlist">{pending.map((w) => <li key={w.id}><button type="button" onClick={() => { setSel(w.id); setView('overview'); }}><span><b>{w.title}</b><small>{w.by} · {w.amt}</small></span><Pill k="warn">Open</Pill></button></li>)}</ul> : <p className="empty">Nothing waiting for a decision.</p>}
        </Panel>
      )}
    </Win>
  );
}
