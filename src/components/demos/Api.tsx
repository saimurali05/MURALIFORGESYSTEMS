// Demo 05 — API Integrations & Data Automation. Integration workspace: apps + auth status, pipeline run, request/response, field mapping, transform, execution log.
import { useEffect, useRef, useState } from 'react';
import { TbPlugConnected, TbArrowsShuffle, TbListDetails } from 'react-icons/tb';
import type { DemoProps } from './engine';
import { Panel, Pill, Seg, Toast, useToast, Win } from './kit';

const APPS = [
  { id: 'shop', name: 'Online store', role: 'Source', auth: 'Connected', ok: true, ev: 'order.created' }, { id: 'pay', name: 'Payments', role: 'Source', auth: 'Connected', ok: true, ev: 'payment.succeeded' },
  { id: 'crm', name: 'CRM', role: 'Destination', auth: 'Connected', ok: true, ev: 'contact.upsert' }, { id: 'sheet', name: 'Spreadsheet', role: 'Destination', auth: 'Connected', ok: true, ev: 'row.append' }, { id: 'acct', name: 'Accounting', role: 'Destination', auth: 'Re-authorise', ok: false, ev: 'invoice.create' },
];
const FLOW = ['Webhook', 'Validate', 'Map fields', 'Transform', 'CRM', 'Spreadsheet'];
const MAP = [
  { s: 'order.id', t: 'reference', f: 'copy', b: 'ORD-1043', a: 'ORD-1043' }, { s: 'order.total', t: 'amount_inr', f: 'number', b: '"28000"', a: '28000' },
  { s: 'customer.name', t: 'contact_name', f: 'trim · title case', b: '"  anita  RAO "', a: '"Anita Rao"' }, { s: 'customer.email', t: 'email', f: 'lowercase', b: '"Anita@RaoPrecision.example"', a: '"anita@raoprecision.example"' }, { s: 'items[0].sku', t: 'product_code', f: 'uppercase', b: '"hlm-20"', a: '"HLM-20"' },
];
const reqJson = (ev: string, bad: boolean) => `{\n  "event": "${ev}",\n  "order": { "id": "ORD-1043", "total": 28000, "currency": "INR" },\n  "customer": { "name": "Anita Rao"${bad ? '' : ',\n    "email": "anita@raoprecision.example"'} },\n  "items": [{ "sku": "HLM-20", "qty": 20 }]\n}`;
const OK = '{\n  "status": "accepted",\n  "crm_record": "CRM-5581",\n  "sheet_row": 214,\n  "duration_ms": 148\n}';
const BAD = '{\n  "status": "rejected",\n  "error": "missing_field",\n  "field": "customer.email",\n  "retry": "after the source is fixed"\n}';
interface Run { id: string; ev: string; res: 'Success' | 'Failed' | 'Retried'; ms: string; note: string }
const LOG0: Run[] = [{ id: '#1042', ev: 'order.created', res: 'Success', ms: '151 ms', note: 'CRM + sheet updated' }, { id: '#1041', ev: 'payment.succeeded', res: 'Retried', ms: '602 ms', note: 'Accounting timed out, retry 1 ok' }, { id: '#1040', ev: 'order.created', res: 'Success', ms: '139 ms', note: 'CRM + sheet updated' }];
const NAV = [{ id: 'pipe', label: 'Pipeline', Icon: TbPlugConnected }, { id: 'inspect', label: 'Inspector', Icon: TbArrowsShuffle }, { id: 'logs', label: 'Logs', Icon: TbListDetails }];

export default function ApiDemo({ step, rk }: DemoProps) {
  const [view, setView] = useState('pipe'); const [src, setSrc] = useState('shop'); const [seg, setSeg] = useState<'Request' | 'Response'>('Request'); const [row, setRow] = useState(0);
  const [at, setAt] = useState(-1); const [bad, setBad] = useState(false); const [log, setLog] = useState<Run[]>(LOG0); const [toast, say] = useToast(); const tm = useRef(0); const [n, setN] = useState(1043);
  useEffect(() => () => clearInterval(tm.current), []);
  useEffect(() => { clearInterval(tm.current); setSrc('shop'); setBad(false); setLog(step >= 5 ? [{ id: '#1043', ev: 'order.created', res: 'Success', ms: '148 ms', note: 'CRM + sheet updated' }, ...LOG0] : LOG0);
    setView(step === 0 ? 'pipe' : step === 5 ? 'logs' : 'inspect'); setSeg(step === 4 ? 'Response' : 'Request'); setRow(step === 3 ? 2 : 0); setAt(step === 0 ? 0 : step >= 5 ? 6 : step); }, [step, rk]);
  const app = APPS.find((a) => a.id === src)!;
  const run = (fail: boolean) => { clearInterval(tm.current); setBad(fail); setAt(0); let i = 0; const id = '#' + n; setN((x) => x + 1);
    tm.current = window.setInterval(() => { i++; if (fail && i === 2) { clearInterval(tm.current); setAt(-2); setLog((l) => [{ id, ev: app.ev, res: 'Failed', ms: '73 ms', note: 'Missing required field: customer.email' }, ...l]); say('Simulation: run failed at Validate — see Logs'); return; }
      setAt(i); if (i >= 6) { clearInterval(tm.current); setLog((l) => [{ id, ev: app.ev, res: 'Success', ms: '148 ms', note: 'CRM + sheet updated' }, ...l]); say('Simulation: run finished'); } }, 520); };
  const retry = () => { setBad(false); run(false); setLog((l) => l.map((x, i) => (i === 0 && x.res === 'Failed' ? { ...x, res: 'Retried' as const, note: 'Fixed at source, retried' } : x))); };
  return (
    <Win tone="dark" app="Integration Hub" nav={NAV} view={view} setView={setView}>
      <Toast msg={toast} />
      {view === 'pipe' && (
        <div className="ap__split ap__split--wide">
          <div className="ap__stack">
            <Panel p="flow" title="Pipeline · new order"><ol className="pipe">{FLOW.map((f, i) => <li key={f} className={at === -2 && i === 1 ? 'is-err' : at > i ? 'is-done' : at === i ? 'is-now' : ''}><i>{at === -2 && i === 1 ? '!' : at > i ? '✓' : i + 1}</i>{f}</li>)}</ol>
              <div className="row"><button type="button" className="mbtn mbtn--solid" onClick={() => run(false)}>Trigger a successful run</button><button type="button" className="mbtn" onClick={() => run(true)}>Trigger an error</button>{at === -2 && <button type="button" className="mbtn" onClick={retry}>Fix and retry</button>}</div>
              {at === -2 && <p className="quote quote--none">Validate failed: <b>customer.email</b> is missing. Nothing was written to the CRM or spreadsheet.</p>}
            </Panel>
            <Panel title="Authentication"><p className="faint">Credentials are held by the integration platform and never shown here. This is sample status only.</p><dl className="kv"><div><dt>Method</dt><dd>OAuth 2.0 (sample)</dd></div><div><dt>Scopes</dt><dd>{app.role === 'Source' ? 'read events' : 'write records'}</dd></div></dl></Panel>
          </div>
          <Panel p="src" title="Connected apps"><ul className="convs">{APPS.map((a) => <li key={a.id}><button type="button" className={src === a.id ? 'is-on' : ''} aria-pressed={src === a.id} onClick={() => setSrc(a.id)}><span><b>{a.name}</b><small>{a.role} · {a.ev}</small></span><Pill k={a.ok ? 'ok' : 'warn'}>{a.auth}</Pill></button></li>)}</ul></Panel>
        </div>
      )}
      {view === 'inspect' && (
        <div className="ap__stack">
          <Panel p={seg === 'Request' ? 'req' : 'resp'} title="Inspector" aside={<Seg label="Request or response" items={['Request', 'Response'] as const} value={seg} onChange={setSeg} />}>
            <pre className="code" aria-label={seg === 'Request' ? 'Sample request body' : 'Sample response body'}>{seg === 'Request' ? `POST /webhooks/${app.ev}\n` + reqJson(app.ev, bad) : (bad ? BAD : OK)}</pre>
          </Panel>
          <div className="ap__2">
            <Panel p="map" title="Field mapping"><div className="tbl-wrap"><table className="tbl tbl--sm"><thead><tr><th>Source</th><th>Target</th><th>Rule</th></tr></thead><tbody>{MAP.map((m, i) => <tr key={m.s} className={row === i ? 'is-sel' : ''} onClick={() => setRow(i)}><td><button type="button" className="rowbtn" aria-pressed={row === i} onClick={() => setRow(i)}><code>{m.s}</code></button></td><td><code>{m.t}</code></td><td>{m.f}</td></tr>)}</tbody></table></div></Panel>
            <Panel p="xform" title="Transformation"><p className="faint"><code>{MAP[row].s}</code> → <code>{MAP[row].t}</code></p><div className="ba"><div><small>Before</small><code>{MAP[row].b}</code></div><div className="ba__a"><small>After</small><code>{MAP[row].a}</code></div></div></Panel>
          </div>
        </div>
      )}
      {view === 'logs' && (
        <Panel p="log" title="Execution log" aside={<span className="faint">{log.length} runs</span>}><div className="tbl-wrap"><table className="tbl tbl--sm"><thead><tr><th>Run</th><th>Event</th><th>Result</th><th>Time</th><th>Note</th></tr></thead><tbody>{log.map((r, i) => <tr key={r.id + i} className={i === 0 && step >= 5 ? 'is-new' : ''}><td>{r.id}</td><td><code>{r.ev}</code></td><td><Pill k={r.res === 'Success' ? 'ok' : r.res === 'Failed' ? 'err' : 'warn'}>{r.res}</Pill></td><td>{r.ms}</td><td>{r.note}</td></tr>)}</tbody></table></div></Panel>
      )}
    </Win>
  );
}
