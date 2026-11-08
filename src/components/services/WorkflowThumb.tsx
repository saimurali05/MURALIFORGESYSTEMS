// WorkflowThumb — a reusable, data-driven automation-workflow preview. Real brand marks (Simple Icons) keep their
// official colours; generic technical concepts (webhook, API, database, AI) use Tabler line icons. Everything is
// illustrative: logos show which kinds of tools MFS can connect — they do not imply a partnership or a live connection.
import { useEffect, useRef, useState } from 'react';
import type { ComponentType } from 'react';
import {
  SiFacebook, SiInstagram, SiGmail, SiGooglesheets, SiGoogleforms, SiGooglecalendar, SiWhatsapp, SiN8N, SiHubspot, SiZoho,
  SiRazorpay, SiStripe, SiPostgresql, SiMailchimp, SiYoutube, SiZendesk, SiGoogleanalytics,
} from 'react-icons/si';
import {
  TbWebhook, TbApi, TbApiApp, TbBell, TbBolt, TbBook2, TbBrandOpenai, TbCalendarEvent, TbCheck, TbDatabase, TbFileInvoice,
  TbFilter, TbHeadset, TbMessageChatbot, TbReceipt, TbSparkles, TbTicket, TbUserCheck, TbUsers, TbArticle,
} from 'react-icons/tb';
import { motion } from '../../motion/controller';

type Ico = ComponentType<{ size?: number | string; color?: string; style?: any; 'aria-hidden'?: any }>;
// brand: official mark + official colour. gen: generic line icon in champagne.
export const BRAND: Record<string, { I: Ico; c: string; light?: boolean }> = {
  facebook: { I: SiFacebook, c: '#1877F2' }, instagram: { I: SiInstagram, c: '#E4405F' }, gmail: { I: SiGmail, c: '#EA4335' },
  sheets: { I: SiGooglesheets, c: '#34A853' }, forms: { I: SiGoogleforms, c: '#7248B9' }, calendar: { I: SiGooglecalendar, c: '#4285F4' },
  whatsapp: { I: SiWhatsapp, c: '#25D366' }, n8n: { I: SiN8N, c: '#EA4B71' }, hubspot: { I: SiHubspot, c: '#FF7A59' },
  zoho: { I: SiZoho, c: '#E42527', light: true }, razorpay: { I: SiRazorpay, c: '#3395FF' }, stripe: { I: SiStripe, c: '#8A84FF' },
  postgres: { I: SiPostgresql, c: '#6C94D8' }, mailchimp: { I: SiMailchimp, c: '#FFE01B' }, youtube: { I: SiYoutube, c: '#FF0000' },
  zendesk: { I: SiZendesk, c: '#03363D', light: true }, analytics: { I: SiGoogleanalytics, c: '#F9AB00' },
};
const GEN: Record<string, Ico> = {
  webhook: TbWebhook, api: TbApi, app: TbApiApp, bell: TbBell, bolt: TbBolt, kb: TbBook2, ai: TbBrandOpenai, booking: TbCalendarEvent,
  check: TbCheck, db: TbDatabase, invoice: TbFileInvoice, filter: TbFilter, agent: TbHeadset, bot: TbMessageChatbot, order: TbReceipt,
  sparkle: TbSparkles, ticket: TbTicket, approve: TbUserCheck, users: TbUsers, doc: TbArticle,
};

export interface WfNode { k: string; x: number; y: number; l: string; ui?: 'chat' | 'paid' }
export interface Workflow { trigger: string; nodes: WfNode[]; edges: [number, number][]; }

export const WORKFLOWS: Record<string, Workflow> = {
  // Facebook / Instagram lead ads → webhook → n8n → CRM → Sheets → WhatsApp follow-up → sales notification
  lead: { trigger: 'NEW LEAD', nodes: [
    { k: 'facebook', x: 50, y: 74, l: 'Lead Ads' }, { k: 'webhook', x: 150, y: 74, l: 'Webhook' }, { k: 'n8n', x: 250, y: 74, l: 'n8n' }, { k: 'hubspot', x: 350, y: 74, l: 'CRM' },
    { k: 'sheets', x: 350, y: 170, l: 'Sheets' }, { k: 'whatsapp', x: 250, y: 170, l: 'Follow-up' }, { k: 'bell', x: 150, y: 170, l: 'Sales alert' }, { k: 'instagram', x: 50, y: 170, l: 'Insta Ads' },
  ], edges: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [7, 1]] },
  // Customer query → chatbot → AI model → knowledge base → AI response → CRM update
  agent: { trigger: 'NEW QUERY', nodes: [
    { k: 'users', x: 50, y: 74, l: 'Customer' }, { k: 'bot', x: 150, y: 74, l: 'Chatbot' }, { k: 'ai', x: 250, y: 74, l: 'AI model' }, { k: 'kb', x: 350, y: 74, l: 'Knowledge' },
    { k: 'chat', x: 318, y: 172, l: 'AI response', ui: 'chat' }, { k: 'hubspot', x: 170, y: 170, l: 'CRM update' },
  ], edges: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5]] },
  // Form → webhook → n8n → Sheets → approval → WhatsApp notification → database update
  process: { trigger: 'FORM SUBMITTED', nodes: [
    { k: 'forms', x: 50, y: 74, l: 'Form' }, { k: 'webhook', x: 150, y: 74, l: 'Webhook' }, { k: 'n8n', x: 250, y: 74, l: 'n8n' }, { k: 'sheets', x: 350, y: 74, l: 'Sheets' },
    { k: 'approve', x: 350, y: 170, l: 'Approval' }, { k: 'whatsapp', x: 250, y: 170, l: 'Notify' }, { k: 'db', x: 150, y: 170, l: 'DB update' },
  ], edges: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6]] },
  // Instagram / Facebook → new lead → CRM → segmentation → email → WhatsApp → analytics
  marketing: { trigger: 'NEW LEAD', nodes: [
    { k: 'instagram', x: 50, y: 74, l: 'Instagram' }, { k: 'facebook', x: 50, y: 160, l: 'Facebook' }, { k: 'hubspot', x: 150, y: 112, l: 'CRM' }, { k: 'filter', x: 250, y: 112, l: 'Segment' },
    { k: 'mailchimp', x: 350, y: 74, l: 'Email' }, { k: 'whatsapp', x: 350, y: 160, l: 'Follow-up' }, { k: 'analytics', x: 250, y: 178, l: 'Analytics' },
  ], edges: [[0, 2], [1, 2], [2, 3], [3, 4], [3, 5], [5, 6]] },
  // App A → REST API → webhook → processing → database → app B
  api: { trigger: 'API CALL', nodes: [
    { k: 'app', x: 50, y: 74, l: 'App A' }, { k: 'api', x: 150, y: 74, l: 'REST API' }, { k: 'webhook', x: 250, y: 74, l: 'Webhook' }, { k: 'bolt', x: 350, y: 74, l: 'Processing' },
    { k: 'postgres', x: 350, y: 170, l: 'Database' }, { k: 'app', x: 150, y: 170, l: 'App B' },
  ], edges: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5]] },
  // Customer WhatsApp message → trigger → AI intent → customer DB → automated reply → human handoff
  whatsapp: { trigger: 'NEW MESSAGE', nodes: [
    { k: 'whatsapp', x: 50, y: 74, l: 'Message' }, { k: 'n8n', x: 150, y: 74, l: 'Trigger' }, { k: 'sparkle', x: 250, y: 74, l: 'AI intent' }, { k: 'postgres', x: 350, y: 74, l: 'Customer DB' },
    { k: 'chat', x: 318, y: 172, l: 'Auto reply', ui: 'chat' }, { k: 'approve', x: 150, y: 170, l: 'Human handoff' },
  ], edges: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5]] },
  // New order → invoice → Zoho → Razorpay / Stripe → payment confirmation → Gmail receipt
  invoice: { trigger: 'NEW ORDER', nodes: [
    { k: 'order', x: 50, y: 74, l: 'New order' }, { k: 'invoice', x: 150, y: 74, l: 'Invoice' }, { k: 'zoho', x: 250, y: 74, l: 'Zoho' }, { k: 'razorpay', x: 350, y: 58, l: 'Razorpay' },
    { k: 'stripe', x: 350, y: 124, l: 'or Stripe' }, { k: 'paid', x: 256, y: 176, l: 'Payment confirmed', ui: 'paid' }, { k: 'gmail', x: 110, y: 172, l: 'Gmail receipt' },
  ], edges: [[0, 1], [1, 2], [2, 3], [2, 4], [3, 5], [4, 5], [5, 6]] },
  // Visitor → pages → enquiry → notification → analytics
  website: { trigger: 'NEW VISITOR', nodes: [
    { k: 'users', x: 50, y: 74, l: 'Visitor' }, { k: 'doc', x: 150, y: 74, l: 'Pages' }, { k: 'forms', x: 250, y: 74, l: 'Enquiry' }, { k: 'gmail', x: 350, y: 74, l: 'Notify' },
    { k: 'analytics', x: 350, y: 170, l: 'Analytics' }, { k: 'check', x: 150, y: 170, l: 'Live' },
  ], edges: [[0, 1], [1, 2], [2, 3], [3, 4]] },
  // Brand content → design → review → approved documents
  profile: { trigger: 'BRIEF', nodes: [
    { k: 'doc', x: 50, y: 74, l: 'Content' }, { k: 'sparkle', x: 150, y: 74, l: 'Design' }, { k: 'approve', x: 250, y: 74, l: 'Review' }, { k: 'check', x: 350, y: 74, l: 'Approved' },
    { k: 'doc', x: 350, y: 170, l: 'Profile' }, { k: 'users', x: 150, y: 170, l: 'Clients' },
  ], edges: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5]] },
  // Order → stock check → inventory update → low-stock alert → order status
  inventory: { trigger: 'NEW ORDER', nodes: [
    { k: 'order', x: 50, y: 74, l: 'Order' }, { k: 'filter', x: 150, y: 74, l: 'Stock check' }, { k: 'postgres', x: 250, y: 74, l: 'Inventory' }, { k: 'bell', x: 350, y: 74, l: 'Low stock' },
    { k: 'check', x: 350, y: 170, l: 'Fulfilled' }, { k: 'sheets', x: 150, y: 170, l: 'Records' },
  ], edges: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5]] },
  // Systems → data → measures → dashboard → decision
  dashboard: { trigger: 'DATA SYNC', nodes: [
    { k: 'postgres', x: 50, y: 74, l: 'Systems' }, { k: 'sheets', x: 50, y: 160, l: 'Sheets' }, { k: 'filter', x: 150, y: 112, l: 'Measures' }, { k: 'analytics', x: 250, y: 112, l: 'Dashboard' },
    { k: 'users', x: 350, y: 74, l: 'Managers' }, { k: 'bell', x: 350, y: 160, l: 'Alerts' },
  ], edges: [[0, 2], [1, 2], [2, 3], [3, 4], [3, 5]] },
};

const W = 400, H = 230, HALF = 22;
const half = (n: WfNode) => (n.ui === 'chat' ? { w: 62, h: 24 } : n.ui === 'paid' ? { w: 52, h: 22 } : { w: HALF, h: HALF });

function edgePath(a: WfNode, b: WfNode) {
  const dx = b.x - a.x, dy = b.y - a.y; const ha = half(a), hb = half(b);
  const clip = (h: { w: number; h: number }, sx: number, sy: number) => { const t = Math.min(h.w / Math.max(Math.abs(sx), 0.001), h.h / Math.max(Math.abs(sy), 0.001)); return t; };
  const ta = clip(ha, dx, dy) + 0.02, tb = clip(hb, dx, dy) + 0.02;
  const p1 = [a.x + dx * ta, a.y + dy * ta], p2 = [b.x - dx * tb, b.y - dy * tb];
  // outgoing direction: horizontal-dominant paths leave/enter sideways, vertical-dominant ones top/bottom
  const hor = Math.abs(dx) * 0.9 >= Math.abs(dy);
  const m = hor ? [(p1[0] + p2[0]) / 2, 0] : [0, (p1[1] + p2[1]) / 2];
  const d = hor ? `M${p1[0]} ${p1[1]}C${m[0]} ${p1[1]} ${m[0]} ${p2[1]} ${p2[0]} ${p2[1]}` : `M${p1[0]} ${p1[1]}C${p1[0]} ${m[1]} ${p2[0]} ${m[1]} ${p2[0]} ${p2[1]}`;
  return d;
}

// a node whose connector leaves/enters through its bottom edge gets its label above, so no line runs through text
function labelAbove(nodes: WfNode[], edges: [number, number][]) {
  const up = new Set<number>();
  for (const [a, b] of edges) {
    const dx = nodes[b].x - nodes[a].x, dy = nodes[b].y - nodes[a].y;
    if (Math.abs(dx) * 0.9 >= Math.abs(dy)) continue;
    if (dy > 0) up.add(a); else up.add(b);
  }
  return up;
}

function Tile({ n }: { n: WfNode }) {
  if (n.ui === 'chat') return (
    <span className="wf__ui wf__ui--chat" aria-hidden="true"><i className="in" /><i className="out"><b /><TbCheck size="1.1em" /></i></span>
  );
  if (n.ui === 'paid') return <span className="wf__ui wf__ui--paid" aria-hidden="true"><TbCheck size="1.5em" /><b>PAID</b></span>;
  const br = BRAND[n.k];
  if (br) { const I = br.I; return <span className={`wf__tile${br.light ? ' is-light' : ''}`} aria-hidden="true"><I size="62%" color={br.c} aria-hidden="true" /></span>; }
  const G = GEN[n.k]; return <span className="wf__tile wf__tile--gen" aria-hidden="true"><G size="62%" aria-hidden="true" /></span>;
}

export default function WorkflowThumb({ id, hot = false, label }: { id: string; hot?: boolean; label: string }) {
  const wf = WORKFLOWS[id]; const root = useRef<HTMLDivElement>(null); const svg = useRef<SVGSVGElement>(null);
  const [reduced, setReduced] = useState(false);
  useEffect(() => { setReduced(motion.state.reduced); }, []);
  // pause the travelling particles whenever the card is off-screen (keeps the page light)
  useEffect(() => {
    const el = root.current; if (!el || reduced || typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver(([e]) => { const s = svg.current as any; if (!s?.pauseAnimations) return; e.isIntersecting ? s.unpauseAnimations() : s.pauseAnimations(); });
    io.observe(el); return () => io.disconnect();
  }, [reduced]);
  if (!wf) return null;
  const above = labelAbove(wf.nodes, wf.edges);
  const paths = wf.edges.map(([a, b]) => edgePath(wf.nodes[a], wf.nodes[b]));
  return (
    <div className={`wf${hot ? ' is-hot' : ''}`} ref={root} role="img" aria-label={label}>
      <svg ref={svg} className="wf__svg" viewBox={`0 0 ${W} ${H}`} aria-hidden="true" focusable="false">
        <defs>
          <marker id={`wf-ah-${id}`} viewBox="0 0 8 8" refX="6.4" refY="4" markerWidth="5.5" markerHeight="5.5" orient="auto"><path d="M1 1L6.6 4L1 7" fill="none" stroke="#E6A77F" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></marker>
          {paths.map((d, i) => <path key={i} id={`wf-${id}-${i}`} d={d} />)}
        </defs>
        {paths.map((d, i) => <path key={'g' + i} className="wf__edge-glow" d={d} />)}
        {paths.map((d, i) => <path key={'e' + i} className="wf__edge" d={d} markerEnd={`url(#wf-ah-${id})`} />)}
        {!reduced && paths.map((_, i) => (
          <circle key={'p' + i} className="wf__dot" r="2.6">
            <animateMotion dur={`${2.4 + (i % 3) * 0.35}s`} begin={`${(i * 0.37).toFixed(2)}s`} repeatCount="indefinite" keyTimes="0;1" keySplines=".4 0 .6 1" calcMode="spline"><mpath href={`#wf-${id}-${i}`} /></animateMotion>
          </circle>))}
      </svg>
      <span className="wf__trigger"><i />{wf.trigger}</span>
      {wf.nodes.map((n, i) => {
        const h = half(n);
        return (
          <span key={i} className={`wf__node${i === 0 ? ' is-first' : ''}${n.ui ? ' is-ui' : ''}${above.has(i) && !n.ui ? ' is-up' : ''}`} style={{ left: `${(n.x / W) * 100}%`, top: `${(n.y / H) * 100}%`, width: `${(h.w * 2 / W) * 100}%`, height: `${(h.h * 2 / W) * 100}cqw`, ['--i' as any]: i }}>
            <Tile n={n} />
            <em>{n.l}</em>
          </span>
        );
      })}
    </div>
  );
}
