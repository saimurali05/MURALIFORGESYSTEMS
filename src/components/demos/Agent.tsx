// Demo 02 — AI Agents & Chatbots. An agent studio: conversation inbox, intent, approved knowledge, suggested reply, human handoff, settings.
import { useEffect, useState } from 'react';
import { TbBooks, TbInbox, TbSettings2 } from 'react-icons/tb';
import type { DemoProps } from './engine';
import { Av, Panel, Pill, Seg, Toast, useToast, Win } from './kit';

interface Conv { id: string; who: string; msg: string; intent: string; conf: number; kb: string | null; reply: string; when: string }
const KB = [
  { id: 'k1', title: 'Delivery areas', text: 'We deliver to Hyderabad and surrounding districts. Delivery timing is confirmed once the order is placed.' },
  { id: 'k2', title: 'Warranty policy', text: 'Products carry a 12-month warranty from the purchase date. Extensions and exceptions are reviewed by the service team.' },
  { id: 'k3', title: 'Working hours', text: 'The team is available Monday to Saturday, 9:30 to 18:00.' },
  { id: 'k4', title: 'Returns', text: 'Unused items can be returned within 7 days of delivery with the invoice.' },
];
const CONVS: Conv[] = [
  { id: 'c1', who: 'Ravi Teja', msg: 'Do you deliver to Hyderabad?', intent: 'Delivery enquiry', conf: 94, kb: 'k1', reply: 'Yes — we deliver to Hyderabad and surrounding districts. Timing is confirmed once the order is placed. Would you like to place an order?', when: '2 min ago' },
  { id: 'c2', who: 'Farah Khan', msg: 'My pump is 14 months old — is it still under warranty?', intent: 'Warranty question', conf: 58, kb: 'k2', reply: 'Our standard warranty is 12 months from purchase. Let me pass this to the service team to review.', when: '9 min ago' },
  { id: 'c3', who: 'Dinesh Kumar', msg: 'Can you give me a 30% discount on a bulk order?', intent: 'Pricing negotiation', conf: 31, kb: null, reply: '', when: '24 min ago' },
  { id: 'c4', who: 'Lakshmi P.', msg: 'What are your working hours?', intent: 'Business hours', conf: 97, kb: 'k3', reply: 'We are available Monday to Saturday, 9:30 to 18:00.', when: '1 h ago' },
];
const NAV = [{ id: 'inbox', label: 'Inbox', Icon: TbInbox }, { id: 'kb', label: 'Knowledge', Icon: TbBooks }, { id: 'settings', label: 'Settings', Icon: TbSettings2 }];
const Sk = ({ n = 2 }: { n?: number }) => <div className="sk" aria-hidden="true">{Array.from({ length: n }, (_, i) => <i key={i} style={{ width: `${88 - i * 22}%` }} />)}</div>;

export default function AgentDemo({ step, rk }: DemoProps) {
  const [view, setView] = useState('inbox'); const [sel, setSel] = useState('c1'); const [stage, setStage] = useState(0); const [thr, setThr] = useState(70);
  const [override, setOverride] = useState<Record<string, 'AI' | 'Human'>>({}); const [tone, setTone] = useState<'Friendly' | 'Formal'>('Friendly'); const [kbSel, setKbSel] = useState('k1');
  const [rules, setRules] = useState({ cite: true, price: true, refund: true }); const [toast, say] = useToast(); const [sent, setSent] = useState<string[]>([]);
  useEffect(() => { setView('inbox'); setThr(70); setOverride({}); setSent([]); setStage(step); setSel(step >= 5 ? 'c2' : 'c1'); }, [step, rk]);
  const c = CONVS.find((x) => x.id === sel)!; const kb = KB.find((k) => k.id === c.kb);
  const auto: 'AI' | 'Human' = c.kb && c.conf >= thr ? 'AI' : 'Human'; const mode = override[c.id] ?? auto;
  const full = stage >= 5; const st = (n: number) => full || stage >= n;
  const reply = tone === 'Formal' ? c.reply.replace('Yes — ', 'Yes. ').replace('Would you like to place an order?', 'Please let us know if you wish to place an order.') : c.reply;
  return (
    <Win tone="dark" app="Agent Studio" nav={NAV} view={view} setView={setView}>
      <Toast msg={toast} />
      {view === 'inbox' && (
        <div className="ap__split">
          <div className="ap__stack">
            <Panel p="inbox" title="Conversations" aside={<span className="faint">{CONVS.length} open</span>}>
              <ul className="convs">{CONVS.map((x) => { const m = override[x.id] ?? (x.kb && x.conf >= thr ? 'AI' : 'Human'); return (
                <li key={x.id}><button type="button" className={sel === x.id ? 'is-on' : ''} aria-pressed={sel === x.id} onClick={() => { setSel(x.id); setStage(5); }}>
                  <Av name={x.who} k={x.who.length} /><span><b>{x.who}</b><small>{x.msg}</small></span><Pill k={m === 'AI' ? 'ok' : 'warn'}>{m === 'AI' ? 'AI' : 'Person'}</Pill></button></li>); })}</ul>
            </Panel>
            <Panel p="thread" title="Conversation" aside={<span className="faint">{c.when}</span>}>
              {st(1) ? <div className="chat"><p className="b b--in">{c.msg}</p>
                {st(4) && mode === 'AI' && <p className="b b--out"><small>AI reply · preview, not sent</small>{reply}</p>}
                {st(5) && mode === 'Human' && <p className="b b--sys">Handed to the team with a summary: “{c.intent} · confidence {c.conf}%”.</p>}
                {sent.includes(c.id) && <p className="b b--sys">Simulated: reply approved. Nothing was sent to a customer.</p>}</div> : <Sk n={3} />}
            </Panel>
          </div>
          <div className="ap__stack">
            <Panel p="intent" title="Interpreted intent">{st(2) ? <><b className="big">{c.intent}</b><div className="meter" role="img" aria-label={`Confidence ${c.conf} percent`}><i style={{ width: `${c.conf}%` }} /><u style={{ left: `${thr}%` }} /></div><p className="faint">Confidence {c.conf}% · threshold {thr}%</p></> : <Sk />}</Panel>
            <Panel p="kb" title="Approved knowledge">{st(3) ? (kb ? <><b>{kb.title}</b><p className="quote">{kb.text}</p><p className="faint">Source: approved knowledge base</p></> : <p className="quote quote--none">No approved answer found — the agent will not guess.</p>) : <Sk />}</Panel>
            <Panel p={full ? 'handoff' : 'reply'} title={full ? 'Handling' : 'Suggested response'}>
              {st(4) ? <><Seg label="Who handles this conversation" items={['AI', 'Human'] as const} value={mode} onChange={(v) => { setOverride((o) => ({ ...o, [c.id]: v })); say(`Simulation: switched to ${v === 'AI' ? 'AI handling' : 'human handling'}`); }} />
                {mode === 'AI' ? <><p className="quote">{reply || 'No reply prepared.'}</p><button type="button" className="mbtn mbtn--solid" disabled={!reply} onClick={() => { setSent((s) => [...s, c.id]); say('Simulation: approved — not sent'); }}>Approve preview</button></>
                  : <p className="quote">Escalated to <b>Meera (Service team)</b>. Conversation, intent and the knowledge checked are attached.</p>}</> : <Sk />}
            </Panel>
          </div>
        </div>
      )}
      {view === 'kb' && (
        <div className="ap__split"><Panel title="Approved knowledge base" aside={<span className="faint">Sample content</span>}><ul className="convs">{KB.map((k) => <li key={k.id}><button type="button" className={kbSel === k.id ? 'is-on' : ''} aria-pressed={kbSel === k.id} onClick={() => setKbSel(k.id)}><span><b>{k.title}</b><small>{k.text}</small></span></button></li>)}</ul></Panel>
          <Panel title="Entry"><b>{KB.find((k) => k.id === kbSel)!.title}</b><p className="quote">{KB.find((k) => k.id === kbSel)!.text}</p><p className="faint">The agent may only answer from entries like this one.</p></Panel></div>
      )}
      {view === 'settings' && (
        <div className="ap__2">
          <Panel title="Agent instructions"><textarea aria-label="Agent instructions" rows={7} defaultValue={'You are the assistant for a sample industrial supplier.\nAnswer only from the approved knowledge base.\nIf you are unsure, hand over to a person.\nNever promise prices, discounts or delivery dates.'} /></Panel>
          <Panel title="Response & escalation">
            <p className="lbl">Tone</p><Seg label="Tone" items={['Friendly', 'Formal'] as const} value={tone} onChange={setTone} />
            <p className="lbl">Confidence needed to answer: <b>{thr}%</b></p><input type="range" min={40} max={95} value={thr} aria-label="Confidence threshold" onChange={(e: { target: { value: string } }) => setThr(+e.target.value)} />
            <p className="faint">Below this, the conversation goes to a person. Try it in the Inbox.</p>
            <ul className="sw">{([['cite', 'Show the source with each answer'], ['price', 'Always escalate pricing questions'], ['refund', 'Always escalate refund requests']] as const).map(([k, l]) => <li key={k}><label><input type="checkbox" checked={rules[k]} onChange={() => setRules((r) => ({ ...r, [k]: !r[k] }))} />{l}</label></li>)}</ul>
          </Panel>
        </div>
      )}
    </Win>
  );
}
