// A calm, glass logo strip of the kinds of tools MFS can connect. Illustrative only — no partnership or live connection implied.
import { BRAND } from './WorkflowThumb';

const TOOLS: [string, string][] = [
  ['whatsapp', 'WhatsApp'], ['n8n', 'n8n'], ['gmail', 'Gmail'], ['sheets', 'Google Sheets'], ['forms', 'Google Forms'], ['calendar', 'Google Calendar'],
  ['hubspot', 'HubSpot'], ['zoho', 'Zoho'], ['razorpay', 'Razorpay'], ['stripe', 'Stripe'], ['instagram', 'Instagram'], ['facebook', 'Facebook'],
  ['mailchimp', 'Mailchimp'], ['zendesk', 'Zendesk'], ['postgres', 'PostgreSQL'], ['analytics', 'Google Analytics'], ['youtube', 'YouTube'],
];

export default function ToolStrip() {
  const row = (hidden: boolean) => (
    <ul className="ts__row" aria-hidden={hidden || undefined}>
      {TOOLS.map(([k, name]) => { const { I, c, light } = BRAND[k]; return (
        <li key={k} className={light ? 'is-light' : ''}><span><I size={20} color={c} aria-hidden="true" /></span>{name}</li>); })}
    </ul>
  );
  return (
    <div className="ts wrap" role="group" aria-label="Kinds of tools MFS can connect">
      <p className="eyebrow">Tools we connect</p>
      <div className="ts__track">{row(false)}{row(true)}</div>
      <p className="ts__note">Illustrative: logos show the kinds of tools a workflow can connect. They do not imply a partnership or an active integration.</p>
    </div>
  );
}
