// Demo 01 — Lead Capture & CRM. A CRM workspace: overview KPIs, pipeline board, lead table, detail inspector, and an "incoming enquiry" run.
import { useEffect, useRef, useState } from 'react';
import { TbChartBar, TbLayoutKanban, TbUsers, TbSearch, TbMailFast, TbCheck } from 'react-icons/tb';
import { Count, type DemoProps } from './engine';
import { Av, Panel, Pill, Seg, Toast, useToast, Win } from './kit';

type Stage = 'New' | 'Qualified' | 'Proposal' | 'Won'; type Pri = 'High' | 'Medium' | 'Low';
interface Lead { id: string; name: string; co: string; src: string; pri: Pri; stage: Stage; owner: string; due: string; note: string; email: string; act: [string, string][] }
const STAGES: Stage[] = ['New', 'Qualified', 'Proposal', 'Won']; const OWNERS = ['Karthik', 'Meera', 'Rohan'];
const BASE: Lead[] = [
  { id: 'l1', name: 'Anita Rao', co: 'Rao Precision Works', src: 'Website form', pri: 'High', stage: 'New', owner: 'Karthik', due: 'Today', note: 'Needs a quote for CNC fixtures this month.', email: 'anita@raoprecision.example', act: [['Today', 'Enquiry received via website form'], ['Today', 'Assigned to Karthik']] },
  { id: 'l2', name: 'Imran Sheikh', co: 'Deccan Safety Supplies', src: 'WhatsApp', pri: 'Medium', stage: 'Qualified', owner: 'Meera', due: 'Tomorrow', note: 'Compares three suppliers; wants a call.', email: 'imran@deccansafety.example', act: [['Yesterday', 'Qualified after first reply'], ['Mon', 'Enquiry received on WhatsApp']] },
  { id: 'l3', name: 'Priya Nair', co: 'Nair Interiors', src: 'Instagram', pri: 'Low', stage: 'New', owner: 'Rohan', due: 'Fri', note: 'Browsing options for an office fit-out.', email: 'priya@nairinteriors.example', act: [['Today', 'Enquiry received via Instagram']] },
  { id: 'l4', name: 'Vikram Desai', co: 'Desai Cold Storage', src: 'Referral', pri: 'High', stage: 'Proposal', owner: 'Meera', due: 'Tomorrow', note: 'Proposal sent; waiting for budget approval.', email: 'vikram@desaicold.example', act: [['Yesterday', 'Proposal prepared'], ['Mon', 'Site visit completed']] },
  { id: 'l5', name: 'Sana Mirza', co: 'Mirza Print House', src: 'Website form', pri: 'Medium', stage: 'Qualified', owner: 'Rohan', due: 'Fri', note: 'Asked about monthly service plans.', email: 'sana@mirzaprint.example', act: [['Tue', 'Qualified by phone']] },
  { id: 'l6', name: 'Arjun Reddy', co: 'Reddy Agro Tools', src: 'Spreadsheet import', pri: 'Low', stage: 'Won', owner: 'Karthik', due: '—', note: 'Order confirmed.', email: 'arjun@reddyagro.example', act: [['Last week', 'Marked as won']] },
];
const NEWL: Lead = { id: 'new', name: 'Neha Kulkarni', co: 'Kulkarni Industrial Pumps', src: 'Website form', pri: 'High', stage: 'New', owner: 'Karthik', due: 'Tomorrow', note: 'Quote for 12 pumps plus an installation visit.', email: 'neha@kulkarnipumps.example',
  act: [['Just now', 'Team notified (Karthik)'], ['Just now', 'CRM record prepared'], ['Just now', 'Categorised: High priority · New'], ['Just now', 'Duplicate check passed'], ['Just now', 'Enquiry received via website form']] };
const FLOW = ['Enquiry received', 'Information validated', 'Duplicate checked', 'Lead categorised', 'CRM record prepared', 'Team notified'];
const NAV = [{ id: 'overview', label: 'Overview', Icon: TbChartBar }, { id: 'pipeline', label: 'Pipeline', Icon: TbLayoutKanban }, { id: 'leads', label: 'Leads', Icon: TbUsers }];
const priK = (p: Pri) => (p === 'High' ? 'err' : p === 'Medium' ? 'warn' : 'n') as 'err' | 'warn' | 'n';

export default function LeadDemo({ step, rk }: DemoProps) {
  const [view, setView] = useState('overview'); const [leads, setLeads] = useState<Lead[]>(BASE); const [sel, setSel] = useState('l1');
  const [pri, setPri] = useState<'All' | Pri>('All'); const [q, setQ] = useState(''); const [inc, setInc] = useState(0); const [insp, setInsp] = useState(false); const [toast, say] = useToast();
  const timer = useRef(0);
  useEffect(() => () => clearInterval(timer.current), []);
  useEffect(() => { // scripted sequence → full state for this step (idempotent, so Previous / Next / jumps always land correctly)
    clearInterval(timer.current); setPri('All'); setQ(''); setInsp(false);
    const withNew = (inc: number) => { setInc(inc); setLeads(inc >= 6 ? [NEWL, ...BASE] : BASE); };
    if (step === 0) { setView('overview'); withNew(0); setSel('l1'); }
    if (step === 1) { setView('pipeline'); withNew(0); setSel('l4'); }
    if (step === 2) { setView('overview'); withNew(1); }
    if (step === 3) { setView('overview'); withNew(4); }
    if (step === 4) { setView('pipeline'); withNew(6); setSel('new'); }
    if (step === 5) { setView('leads'); withNew(6); setSel('new'); }
  }, [step, rk]);

  const run = () => {
    clearInterval(timer.current); setLeads(BASE); setInc(1); let i = 1;
    timer.current = window.setInterval(() => { i++; setInc(i); if (i >= 6) { clearInterval(timer.current); setLeads([NEWL, ...BASE]); setSel('new'); say('Simulation: record prepared — nothing was written to a real CRM'); } }, 620);
  };
  const shown = leads.filter((l) => (pri === 'All' || l.pri === pri) && (l.name + l.co + l.src).toLowerCase().includes(q.trim().toLowerCase()));
  const cur = leads.find((l) => l.id === sel) ?? leads[0];
  const upd = (id: string, patch: Partial<Lead>, msg?: string) => { setLeads((ls) => ls.map((l) => (l.id === id ? { ...l, ...patch, act: msg ? ([['Just now', msg], ...l.act] as [string, string][]) : l.act } : l))); if (msg) say(`Simulation: ${msg.toLowerCase()}`); };
  const cnt = (s: Stage) => leads.filter((l) => l.stage === s).length; const max = Math.max(...STAGES.map(cnt), 1);
  const srcs = [...new Set(leads.map((l) => l.src))].map((s) => [s, leads.filter((l) => l.src === s).length] as const);

  const renderDetail = (floating: boolean) => (
    <Panel p="detail" title="Lead detail" className={floating ? 'insp glass glass--raised' : 'ap__aside'} aside={floating ? <button type="button" className="mbtn" onClick={() => setInsp(false)} aria-label="Close lead detail">Close</button> : <Pill k={priK(cur.pri)}>{cur.pri}</Pill>}>
      <div className="lead__who"><Av name={cur.name} k={cur.name.length} /><div><b>{cur.name}</b><span>{cur.co}</span></div></div>
      <p className="lead__note">{cur.note}</p>
      <dl className="kv"><div><dt>Source</dt><dd>{cur.src}</dd></div><div><dt>Email</dt><dd>{cur.email}</dd></div><div><dt>Follow-up</dt><dd>{cur.due}</dd></div>
        <div><dt>Owner</dt><dd><select aria-label="Assigned team member" value={cur.owner} onChange={(e: { target: { value: string } }) => upd(cur.id, { owner: e.target.value }, `reassigned to ${e.target.value}`)}>{OWNERS.map((o) => <option key={o}>{o}</option>)}</select></dd></div></dl>
      <div className="seg seg--wrap" role="group" aria-label="Change status">{STAGES.map((s) => <button key={s} type="button" className={cur.stage === s ? 'is-on' : ''} aria-pressed={cur.stage === s} onClick={() => upd(cur.id, { stage: s }, `status changed to ${s}`)}>{s}</button>)}</div>
      <h5 className="pn__sub">Activity</h5>
      <ol className="feed">{cur.act.slice(0, 4).map(([t, m], i) => <li key={m + i} style={{ ['--d' as any]: `${i * 70}ms` }}><time>{t}</time>{m}</li>)}</ol>
    </Panel>
  );
  const detail = renderDetail(false);
  const filters = (
    <div className="ap__bar"><label className="srch"><TbSearch size={15} aria-hidden="true" /><input aria-label="Search leads" placeholder="Search leads" value={q} onChange={(e: { target: { value: string } }) => setQ(e.target.value)} /></label>
      <Seg label="Filter by priority" items={['All', 'High', 'Medium', 'Low'] as const} value={pri} onChange={setPri} /></div>
  );

  return (
    <Win tone="dark" app="Lead CRM" nav={NAV} view={view} setView={setView}>
      <Toast msg={toast} />
      {view === 'overview' && (
        <div className="ap__stack">
          <div className="kpis" data-p="kpi">
            {[['New enquiries', cnt('New') ], ['In pipeline', leads.filter((l) => l.stage !== 'Won').length], ['Follow-ups due', leads.filter((l) => l.due === 'Today' || l.due === 'Tomorrow').length], ['Won', cnt('Won')]].map(([l, n], i) => (
              <div className="kpi" key={l as string} style={{ ['--d' as any]: `${i * 90}ms` }}><span>{l}</span><b><Count to={n as number} rk={rk} /></b></div>))}
          </div>
          <div className="ap__2">
            <Panel p="flow" title="Incoming enquiry" aside={<button type="button" className="mbtn" onClick={run} disabled={inc > 0 && inc < 6}><TbMailFast size={15} aria-hidden="true" /> {inc >= 6 ? 'Run again' : 'Simulate an enquiry'}</button>}>
              <blockquote className="enq"><b>Neha Kulkarni · Website form</b>“Please quote for 12 industrial pumps and an installation visit. We need them next month.”</blockquote>
              <ol className="flow">{FLOW.map((f, i) => <li key={f} className={inc > i + 1 ? 'is-done' : inc === i + 1 ? 'is-now' : ''}><i>{inc > i + 1 ? <TbCheck size={13} aria-hidden="true" /> : i + 1}</i>{f}</li>)}</ol>
            </Panel>
            <Panel p="pipe" title="Pipeline" aside={<span className="faint">{leads.length} leads</span>}>
              <ul className="bars">{STAGES.map((s, i) => <li key={s}><span>{s}</span><div><i key={rk + s + cnt(s)} style={{ width: `${(cnt(s) / max) * 100}%`, ['--d' as any]: `${i * 110}ms` }} /></div><b>{cnt(s)}</b></li>)}</ul>
              <h5 className="pn__sub">By source</h5>
              <ul className="bars bars--s">{srcs.map(([s, c], i) => <li key={s}><span>{s}</span><div><i key={rk + s + c} style={{ width: `${(c / leads.length) * 100}%`, ['--d' as any]: `${300 + i * 90}ms` }} /></div><b>{c}</b></li>)}</ul>
            </Panel>
          </div>
        </div>
      )}
      {view === 'pipeline' && (
        <div className="ap__stack">{filters}
            <div className="board" data-p="pipe">{STAGES.map((s, ci) => (
              <div className="col" key={s} style={{ ['--d' as any]: `${ci * 90}ms` }}><h4>{s}<b>{shown.filter((l) => l.stage === s).length}</b></h4>
                {shown.filter((l) => l.stage === s).map((l) => (
                  <button type="button" key={l.id} className={`card${sel === l.id ? ' is-sel' : ''}${l.id === 'new' ? ' is-new' : ''}`} aria-pressed={sel === l.id} onClick={() => { setSel(l.id); setInsp(true); }}>
                    <span className="card__t">{l.name}</span><span className="card__s">{l.co}</span><span className="card__f"><Pill k={priK(l.pri)}>{l.pri}</Pill><Av name={l.owner} k={l.owner.length} /></span>
                  </button>))}
              </div>))}</div>
          {insp && renderDetail(true)}
        </div>
      )}
      {view === 'leads' && (
        <div className="ap__split">
          <div className="ap__stack">{filters}
            <Panel p="table" className="tbl-wrap"><table className="tbl"><thead><tr><th>Lead</th><th>Source</th><th>Priority</th><th>Status</th><th>Owner</th><th>Follow-up</th></tr></thead>
              <tbody>{shown.length ? shown.map((l) => (
                <tr key={l.id} className={`${sel === l.id ? 'is-sel' : ''}${l.id === 'new' ? ' is-new' : ''}`} onClick={() => setSel(l.id)}>
                  <td><button type="button" className="rowbtn" aria-pressed={sel === l.id} onClick={() => setSel(l.id)}><Av name={l.name} k={l.name.length} /><span><b>{l.name}</b><small>{l.co}</small></span></button></td>
                  <td>{l.src}</td><td><Pill k={priK(l.pri)}>{l.pri}</Pill></td><td>{l.stage}</td><td>{l.owner}</td><td>{l.due}</td></tr>)) : <tr><td colSpan={6} className="empty">No leads match this filter.</td></tr>}</tbody></table></Panel></div>
          {detail}
        </div>
      )}
    </Win>
  );
}
