// Demo 09 — Inventory & Order Management. Stock levels, orders, availability checks, movements and low-stock flags.
import { useEffect, useState } from 'react';
import { TbPackage, TbTruckDelivery, TbListDetails } from 'react-icons/tb';
import type { DemoProps } from './engine';
import { Panel, Pill, Toast, useToast, Win } from './kit';

interface Item { sku: string; name: string; bay: string; min: number }
interface Order { id: string; who: string; sku: string; qty: number }
const ITEMS: Item[] = [
  { sku: 'BRK-120', name: 'Steel brackets', bay: 'Bay A', min: 100 }, { sku: 'PKG-040', name: 'Packing cartons', bay: 'Bay B', min: 150 },
  { sku: 'FST-500', name: 'M8 fastener packs', bay: 'Bay A', min: 80 }, { sku: 'PLT-010', name: 'Pallet wrap rolls', bay: 'Bay C', min: 20 },
];
const ORDERS: Order[] = [
  { id: 'ORD-2101', who: 'Rao Precision Works', sku: 'BRK-120', qty: 60 }, { id: 'ORD-2102', who: 'Deccan Safety Supplies', sku: 'PKG-040', qty: 200 },
  { id: 'ORD-2103', who: 'Reddy Agro Tools', sku: 'FST-500', qty: 50 }, { id: 'ORD-2104', who: 'Mirza Print House', sku: 'BRK-120', qty: 40 },
];
const NAV = [{ id: 'stock', label: 'Stock', Icon: TbPackage }, { id: 'orders', label: 'Orders', Icon: TbTruckDelivery }, { id: 'log', label: 'Movements', Icon: TbListDetails }];
type St = 'New' | 'Picking' | 'Shipped' | 'Needs attention';
interface S { qty: Record<string, number>; st: Record<string, St>; log: string[] }
// the guided steps rebuild this state deterministically, so Previous / Next / jump always show the right picture
const build = (step: number): S => {
  const s: S = { qty: { 'BRK-120': 180, 'PKG-040': 420, 'FST-500': 64, 'PLT-010': 36 }, st: { 'ORD-2101': 'Shipped', 'ORD-2102': 'Picking', 'ORD-2103': 'Picking', 'ORD-2104': 'New' }, log: ['ORD-2101 shipped · BRK-120 −60 (sample)'] };
  if (step >= 3) { s.qty['BRK-120'] -= 40; s.st['ORD-2104'] = 'Picking'; s.log.unshift('ORD-2104 picked · BRK-120 −40'); }
  if (step >= 4) { s.qty['FST-500'] -= 50; s.st['ORD-2103'] = 'Shipped'; s.log.unshift('ORD-2103 shipped · FST-500 −50 · now below minimum'); }
  if (step >= 5) { s.st['ORD-2104'] = 'Shipped'; s.log.unshift('ORD-2104 shipped · status updated for the customer'); }
  return s;
};

export default function InventoryDemo({ step, rk }: DemoProps) {
  const [view, setView] = useState('stock'); const [sel, setSel] = useState('ORD-2104'); const [s, setS] = useState<S>(() => build(0)); const [toast, say] = useToast();
  useEffect(() => { setS(build(step)); setSel(step >= 4 ? 'ORD-2103' : 'ORD-2104'); setView(step === 0 || step === 4 ? 'stock' : step === 3 ? 'log' : 'orders'); }, [step, rk]); // eslint-disable-line
  const item = (sku: string) => ITEMS.find((i) => i.sku === sku)!; const low = (i: Item) => s.qty[i.sku] < i.min;
  const cur = ORDERS.find((o) => o.id === sel)!; const avail = s.qty[cur.sku]; const ok = avail >= cur.qty;
  const fulfil = (o: Order) => {
    if (s.st[o.id] === 'Shipped') return;
    if (s.qty[o.sku] < o.qty) { setS((x) => ({ ...x, st: { ...x.st, [o.id]: 'Needs attention' }, log: [`${o.id} blocked · only ${x.qty[o.sku]} of ${item(o.sku).name} available`, ...x.log] })); say('Not enough stock — flagged for a person to decide'); return; }
    setS((x) => ({ qty: { ...x.qty, [o.sku]: x.qty[o.sku] - o.qty }, st: { ...x.st, [o.id]: 'Shipped' }, log: [`${o.id} shipped · ${o.sku} −${o.qty}`, ...x.log] })); say('Simulation: stock updated and movement recorded');
  };
  const receive = (i: Item) => { setS((x) => ({ ...x, qty: { ...x.qty, [i.sku]: x.qty[i.sku] + 50 }, log: [`Goods received · ${i.sku} +50`, ...x.log] })); say('Simulation: 50 units received and recorded'); };
  const pk = (t: St) => (t === 'Shipped' ? 'ok' : t === 'Needs attention' ? 'err' : t === 'Picking' ? 'info' : 'warn') as 'ok' | 'err' | 'info' | 'warn';
  const mx = Math.max(...ITEMS.map((i) => Math.max(i.min * 2, s.qty[i.sku])));
  return (
    <Win tone="dark" app="Stock Desk" nav={NAV} view={view} setView={setView}>
      <Toast msg={toast} />
      {view === 'stock' && (
        <div className="ap__stack">
          <Panel p="stock" title="Stock on hand · sample data" aside={<Pill k={ITEMS.some(low) ? 'warn' : 'ok'}>{ITEMS.filter(low).length} below minimum</Pill>}>
            <ul className="bars">{ITEMS.map((i, k) => <li key={i.sku} style={{ gridTemplateColumns: 'minmax(120px,170px) minmax(0,1fr) 112px' }}><span title={i.sku}><b>{i.name}</b></span><div><i key={rk + i.sku + s.qty[i.sku]} style={{ width: `${(s.qty[i.sku] / mx) * 100}%`, ['--d' as any]: `${k * 90}ms`, background: low(i) ? 'var(--err)' : undefined }} /></div><b>{s.qty[i.sku]} <small className="faint">/ min {i.min}</small></b></li>)}</ul>
          </Panel>
          <Panel p="alerts" title="Needs attention">
            {ITEMS.filter(low).length ? <ul className="wlist">{ITEMS.filter(low).map((i) => <li key={i.sku}><button type="button" onClick={() => receive(i)}><span><b>{i.name} is below its minimum</b><small>{s.qty[i.sku]} left, minimum {i.min} · {i.bay}</small></span><Pill k="acc">Receive 50</Pill></button></li>)}</ul> : <p className="faint">Every item is at or above its minimum level.</p>}
            <p className="faint">Low-stock flags come from the minimum level set for each item. Nothing is ordered automatically in this demo.</p>
          </Panel>
        </div>)}
      {view === 'orders' && (
        <div className="ap__split">
          <Panel p="orders" title="Orders" aside={<span className="faint">Sample data</span>} className="tbl-wrap"><table className="tbl"><thead><tr><th>Order</th><th>Customer</th><th>Item</th><th>Qty</th><th>Status</th></tr></thead><tbody>
            {ORDERS.map((o) => <tr key={o.id} className={sel === o.id ? 'is-sel' : ''} onClick={() => setSel(o.id)}><td><b>{o.id}</b></td><td>{o.who}</td><td>{o.sku}</td><td>{o.qty}</td><td><Pill k={pk(s.st[o.id])}>{s.st[o.id]}</Pill></td></tr>)}</tbody></table></Panel>
          <Panel p="check" title="Availability check" aside={<Pill k={ok ? 'ok' : 'err'}>{ok ? 'In stock' : 'Short'}</Pill>}>
            <b>{cur.id}</b><p className="faint">{cur.who}</p>
            <dl className="kv"><div><dt>Ordered</dt><dd>{cur.qty} × {item(cur.sku).name}</dd></div><div><dt>Available now</dt><dd>{avail}</dd></div><div><dt>After this order</dt><dd>{ok ? avail - cur.qty : 'Not enough stock'}</dd></div></dl>
            {s.st[cur.id] !== 'Shipped' ? <button type="button" className="mbtn mbtn--solid" onClick={() => fulfil(cur)}>{ok ? 'Pick and ship' : 'Try to fulfil'}</button> : <p className="faint">Shipped. The movement is in the record.</p>}
          </Panel>
        </div>)}
      {view === 'log' && (
        <div className="ap__stack">
          <Panel p="log" title="Stock movements · every change is recorded"><ul className="wlist">{s.log.map((l, i) => <li key={l + i}><button type="button" tabIndex={-1} className={i === 0 ? 'is-on' : ''}><span><b>{l}</b></span></button></li>)}</ul></Panel>
          <p className="faint">Movements are written by the system as orders are fulfilled and goods are received, so the record and the stock figures cannot drift apart.</p>
        </div>)}
    </Win>
  );
}
