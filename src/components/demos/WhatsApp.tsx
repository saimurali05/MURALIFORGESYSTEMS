// Demo 06 — WhatsApp Business Automation. Conversation workspace: inbox, chat, customer record, approved templates, journey, handoff, status.
import { useEffect, useState } from 'react';
import { TbBrandWhatsapp, TbTemplate, TbUsers } from 'react-icons/tb';
import type { DemoProps } from './engine';
import { Av, Panel, Pill, Seg, Toast, useToast, Win } from './kit';

interface Cv { id: string; who: string; co: string; msg: string; intent: string; hist: string; qty?: number }
const CVS: Cv[] = [
  { id: 'a', who: 'Suresh Menon', co: 'Menon Constructions', msg: 'Hi, I need 20 safety helmets. Do you have stock?', intent: 'Product enquiry · order', hist: '3 earlier orders (sample)', qty: 20 },
  { id: 'b', who: 'Fatima Begum', co: 'Begum Fabricators', msg: 'Can you send me the invoice copy for my last order?', intent: 'Billing request', hist: '1 earlier order (sample)' },
  { id: 'c', who: 'Gopal Rao', co: 'Rao Agro Tools', msg: 'Can you deliver tomorrow morning?', intent: 'Delivery question', hist: '6 earlier orders (sample)' },
];
const STOCK = 64; const TPL = ['Stock & price', 'Ask for details', 'Order summary'] as const;
const STAT = ['New', 'Auto-replied', 'With team', 'Resolved'] as const;
const JOURNEY = ['Message received', 'Intent identified', 'Stock checked', 'Reply from approved template', 'Handoff to sales if needed', 'Record saved'];
const NAV = [{ id: 'inbox', label: 'Inbox', Icon: TbBrandWhatsapp }, { id: 'tpl', label: 'Templates', Icon: TbTemplate }, { id: 'cust', label: 'Customers', Icon: TbUsers }];

export default function WhatsAppDemo({ step, rk }: DemoProps) {
  const [view, setView] = useState('inbox'); const [sel, setSel] = useState('a'); const [stage, setStage] = useState(0); const [tpl, setTpl] = useState<(typeof TPL)[number]>('Stock & price');
  const [human, setHuman] = useState<Record<string, boolean>>({}); const [status, setStatus] = useState<Record<string, (typeof STAT)[number]>>({}); const [sent, setSent] = useState<Record<string, string[]>>({}); const [toast, say] = useToast();
  useEffect(() => { setView('inbox'); setSel('a'); setStage(step); setTpl('Stock & price'); setSent({}); setHuman(step >= 4 ? { a: true } : {}); setStatus(step >= 5 ? { a: 'With team' } : step >= 3 ? { a: 'Auto-replied' } : {}); }, [step, rk]);
  const c = CVS.find((x) => x.id === sel)!; const st = (n: number) => stage >= n; const isH = !!human[c.id]; const stt = status[c.id] ?? 'New';
  const q = c.qty ?? 0; const reply = c.id === 'a' ? ({ 'Stock & price': `Hello Suresh! Yes, we have ${STOCK} helmets in stock, so ${q} is fine. Shall I prepare a quote for ${q} helmets?`, 'Ask for details': 'Thanks for your message! Could you share the delivery location and the date you need them?', 'Order summary': `Order enquiry: ${q} × safety helmets. A salesperson will confirm price and delivery shortly.` } as const)[tpl] : c.id === 'b' ? 'Thanks Fatima — I have passed your invoice request to our accounts team.' : 'Thanks Gopal — a team member will confirm tomorrow’s delivery slot.';
  const setS = (s: (typeof STAT)[number]) => { setStatus((o) => ({ ...o, [c.id]: s })); say(`Simulation: status set to ${s}`); };
  return (
    <Win tone="dark" app="Business Messaging" nav={NAV} view={view} setView={setView}>
      <Toast msg={toast} />
      {view === 'inbox' && (
        <div className="ap__split">
          <div className="ap__stack">
            <Panel title="Conversations"><ul className="convs convs--row">{CVS.map((x) => <li key={x.id}><button type="button" className={sel === x.id ? 'is-on' : ''} aria-pressed={sel === x.id} onClick={() => { setSel(x.id); setStage(5); }}><Av name={x.who} k={x.who.length} /><span><b>{x.who}</b><small>{x.msg}</small></span></button></li>)}</ul></Panel>
            <Panel p="chat" title={c.who} aside={<Pill k={stt === 'Resolved' ? 'ok' : stt === 'With team' ? 'warn' : 'n'}>{stt}</Pill>}>
              <div className="chat chat--wa">{st(1) ? <p className="b b--in">{c.msg}</p> : <p className="typing" aria-label="Customer is typing"><i /><i /><i /></p>}
                {st(3) && !isH && <p className="b b--out"><small>Automated reply</small>{reply}</p>}
                {isH && <p className="b b--sys">A person has taken over. Automation paused for this chat.</p>}
                {(sent[c.id] ?? []).map((m, i) => <p key={i} className="b b--sys">{m}</p>)}</div>
              <div className="composer" data-p="reply">
                <div className="composer__h"><span>Reply preview</span><Seg label="Approved template" items={TPL} value={tpl} onChange={setTpl} /></div>
                {st(2) ? <p className="quote">{reply}</p> : <p className="faint">Choosing a reply…</p>}
                <button type="button" className="mbtn mbtn--solid" disabled={isH || !st(2)} onClick={() => { setSent((o) => ({ ...o, [c.id]: [...(o[c.id] ?? []), 'Simulated: reply approved. Nothing was sent on WhatsApp.'] })); setS('Auto-replied'); }}>Approve reply preview</button>
              </div>
            </Panel>
          </div>
          <div className="ap__stack">
            <Panel p="profile" title="Customer"><div className="lead__who"><Av name={c.who} k={c.who.length} /><div><b>{c.who}</b><span>{c.co}</span></div></div>
              {st(1) ? <dl className="kv"><div><dt>History</dt><dd>{c.hist}</dd></div><div><dt>Intent</dt><dd>{c.intent}</dd></div>{c.qty && <div><dt>Stock check</dt><dd>{STOCK} helmets available (sample)</dd></div>}{stage >= 5 && c.qty && <div><dt>Saved</dt><dd>Order enquiry · {c.qty} helmets</dd></div>}</dl> : <p className="faint">Looking up the customer…</p>}</Panel>
            <Panel p="journey" title="Automation journey"><ol className="flow flow--s">{JOURNEY.map((j, i) => <li key={j} className={stage >= 5 || stage > i ? 'is-done' : stage === i ? 'is-now' : ''}><i>{stage >= 5 || stage > i ? '✓' : i + 1}</i>{j}</li>)}</ol></Panel>
            <Panel p="handoff" title="Handling"><Seg label="Who handles this chat" items={['Automation', 'Human'] as const} value={isH ? 'Human' : 'Automation'} onChange={(v) => { setHuman((o) => ({ ...o, [c.id]: v === 'Human' })); if (v === 'Human') setS('With team'); }} />
              <p className="lbl">Status</p><select aria-label="Conversation status" value={stt} onChange={(e: { target: { value: string } }) => setS(e.target.value as (typeof STAT)[number])}>{STAT.map((s) => <option key={s}>{s}</option>)}</select>
              {isH && <p className="faint">Assigned to Meera (Sales) with the full chat.</p>}</Panel>
          </div>
        </div>
      )}
      {view === 'tpl' && <Panel title="Approved message templates" aside={<span className="faint">Sample</span>}><ul className="convs">{TPL.map((t) => <li key={t}><button type="button" onClick={() => { setTpl(t); setView('inbox'); }}><span><b>{t}</b><small>Tap to preview it in the inbox</small></span><Pill k="ok">Approved</Pill></button></li>)}</ul></Panel>}
      {view === 'cust' && <Panel title="Customers" aside={<span className="faint">Sample records</span>}><div className="tbl-wrap"><table className="tbl"><thead><tr><th>Customer</th><th>Business</th><th>History</th></tr></thead><tbody>{CVS.map((x) => <tr key={x.id} onClick={() => { setSel(x.id); setView('inbox'); setStage(5); }}><td><b>{x.who}</b></td><td>{x.co}</td><td>{x.hist}</td></tr>)}</tbody></table></div></Panel>}
    </Win>
  );
}
