// MFS Business Systems Lab — illustrative scenarios. These are NOT client case studies and contain no results, savings or
// percentages: they show how a process is understood, where it breaks and how a connected system could be designed.
export type PKind = 'missing' | 'repeat' | 'delay' | 'owner' | 'status' | 'apps' | 'follow';
export const PROBLEM: Record<PKind, { t: string; what: string }> = {
  missing: { t: 'Missing information', what: 'Details are not collected up front, so people go back to the customer or colleague later.' },
  repeat: { t: 'Repeated data entry', what: 'The same details are typed again into a second or third place, which costs time and introduces mistakes.' },
  delay: { t: 'Delayed approvals', what: 'A decision waits for someone who does not know it is waiting.' },
  owner: { t: 'Unclear task ownership', what: 'Nobody is certain whose job the next step is, so it waits.' },
  status: { t: 'Poor status visibility', what: 'To know where something stands, someone has to ask someone else.' },
  apps: { t: 'Disconnected applications', what: 'Information lives in separate tools that do not talk to each other.' },
  follow: { t: 'Missed follow-ups', what: 'Follow-ups depend on memory, so some are late or never happen.' },
};
export const KINDS = ['Trigger', 'Information input', 'Validation', 'Decision', 'Automation', 'Human approval', 'System integration', 'Status update', 'Completion', 'Exception handling'] as const;
/** who acts at each node kind */
export const ACTOR: ('Automatic' | 'A person' | 'System')[] = ['System', 'System', 'Automatic', 'Automatic', 'Automatic', 'A person', 'System', 'Automatic', 'System', 'A person'];

export interface Scenario {
  id: string; name: string; process: string; summary: string;
  steps: string[];
  problems: { k: PKind; at: number[]; d: string }[];
  nodes: [string, string][];                    // ten, in KINDS order
  out: { auto: string[]; human: string[]; live: string[]; rec: string[]; exc: string[] };
  integ: string; ui: string;
}

export const SCENARIOS: Scenario[] = [
  { id: 'construction', name: 'Construction company', process: 'From project enquiry to payment', summary: 'Enquiries, site visits, quotations, approvals, materials and invoices across many projects.',
    steps: ['Receives a project enquiry', 'Collects customer and project details', 'Arranges a site visit', 'Prepares a quotation', 'Requests approval', 'Assigns work to a site team', 'Tracks materials and progress', 'Raises invoices', 'Tracks payment'],
    problems: [
      { k: 'missing', at: [1, 2], d: 'Site address, scope or budget is missing, so the visit is arranged without what the estimator needs.' },
      { k: 'repeat', at: [1, 3, 7], d: 'Customer and project details are retyped into the quotation and again into the invoice.' },
      { k: 'delay', at: [4], d: 'A quotation waits for a director who is on site and unaware of it.' },
      { k: 'owner', at: [5, 6], d: 'After approval it is unclear who owns materials ordering versus site progress.' },
      { k: 'status', at: [6, 8], d: 'Managers cannot see project progress or unpaid invoices without calling people.' },
      { k: 'follow', at: [2, 4, 8], d: 'Site-visit reminders, quotation follow-ups and payment reminders depend on memory.' },
    ],
    nodes: [['New project enquiry', 'An enquiry arrives from the website, a call log or WhatsApp.'], ['Project details form', 'A structured form collects site address, scope, budget and preferred dates.'], ['Completeness check', 'Required details are checked. Anything missing is requested from the customer automatically.'],
      ['Route the enquiry', 'Rules decide the estimator and whether a site visit is needed, based on project type and location.'], ['Prepare the quotation', 'A quotation draft is built from the details and your approved rate tables.'], ['Manager approval', 'The right manager reviews and approves, adjusts or rejects the quotation.'],
      ['Connect your tools', 'Approved quotations create the project record and, where agreed, flow to your accounting tool.'], ['Progress and payment status', 'Project stage, materials and invoice status update as work happens.'], ['Project closed', 'Final invoice settled, records archived, feedback requested.'], ['Exception to a person', 'Missing details after two requests, a rate not in the table or an overdue approval is escalated to a named person.']],
    out: { auto: ['Requesting missing details', 'Building the quotation draft', 'Reminders for visits and approvals'], human: ['Approving the quotation', 'Handling a non-standard request'], live: ['Enquiries by stage', 'Quotations awaiting approval', 'Invoice status by project'], rec: ['Who approved what, and when', 'Every status change on a project'], exc: ['Quotation waiting beyond the agreed time', 'Details still missing after reminders'] },
    integ: 'Connections to your accounting tool and project folders, where agreed.', ui: 'A project and approvals dashboard for managers and site coordinators.' },
  { id: 'manufacturing', name: 'Manufacturing company', process: 'From customer order to dispatch', summary: 'Purchase orders, material checks, production, quality and dispatch.',
    steps: ['Receives a purchase order', 'Checks material and capacity', 'Confirms the delivery date', 'Raises a production order', 'Tracks production progress', 'Carries out quality inspection', 'Packs and dispatches', 'Raises the invoice', 'Follows up payment'],
    problems: [
      { k: 'repeat', at: [0, 3, 7], d: 'Order details are re-keyed into production sheets and again into the invoice.' },
      { k: 'apps', at: [1, 4], d: 'Stock, orders and production live in separate spreadsheets.' },
      { k: 'delay', at: [2], d: 'A delivery date waits for confirmation from planning.' },
      { k: 'status', at: [4, 6], d: 'Sales cannot tell a customer where an order is without walking to the floor.' },
      { k: 'owner', at: [5], d: 'Failed inspections have no clear owner for rework.' },
      { k: 'follow', at: [8], d: 'Payment follow-up is irregular.' },
    ],
    nodes: [['Purchase order received', 'An order arrives by email or portal.'], ['Order details captured', 'Customer, items, quantities and dates are captured once, in one structure.'], ['Material and capacity check', 'Stock and planned capacity are checked against the order.'], ['Can we meet the date?', 'Rules decide: confirm, propose a later date or escalate.'],
      ['Production order created', 'A production order and pick list are generated.'], ['Planner confirms the date', 'Planning approves any date outside the standard lead time.'], ['Connect stock and production', 'Stock movements and production progress feed one shared record.'], ['Order status', 'Each stage updates automatically: planned, in production, inspected, dispatched.'], ['Dispatched and invoiced', 'Dispatch closes the order and prepares the invoice.'], ['Exception to a person', 'Shortages, failed inspections and date conflicts go to a named owner with the details.']],
    out: { auto: ['Creating the production order', 'Updating stock on dispatch', 'Preparing the invoice draft'], human: ['Confirming non-standard dates', 'Deciding on rework'], live: ['Order status for sales', 'Material shortages', 'Work waiting for inspection'], rec: ['Stock movements per order', 'Inspection results'], exc: ['Material shortage', 'Failed inspection'] },
    integ: 'Connections between your stock records, production sheets and invoicing, where agreed.', ui: 'An order-status board for sales, planning and the shop floor.' },
  { id: 'retail', name: 'Retail business', process: 'From stock question to restock', summary: 'Availability, reservations, stock counts, reordering and supplier follow-up.',
    steps: ['Customer asks about availability', 'Staff check shelves or records', 'A reservation or order is noted', 'Stock count is updated by hand', 'Reorder is decided from memory', 'Supplier is contacted', 'Goods are received', 'Records are corrected'],
    problems: [
      { k: 'status', at: [0, 1], d: 'Availability is checked by walking the floor or asking a colleague.' },
      { k: 'repeat', at: [2, 3, 7], d: 'Sales, counts and corrections are written in several places.' },
      { k: 'apps', at: [1, 3], d: 'The till, the stock sheet and supplier messages are separate.' },
      { k: 'follow', at: [4, 5], d: 'Reorders happen after an item runs out.' },
      { k: 'owner', at: [4], d: 'Nobody owns the reorder decision.' },
    ],
    nodes: [['Stock question or sale', 'A customer asks, or a sale or reservation is recorded.'], ['Item and quantity', 'Item, quantity and customer are captured once.'], ['Availability check', 'Current stock is checked, including reserved items.'], ['Enough in stock?', 'Rules decide: confirm, offer an alternative or flag as out of stock.'],
      ['Stock updated', 'Stock reduces automatically with every sale or reservation.'], ['Owner approves reorder', 'When stock passes its minimum, the owner approves or adjusts a suggested reorder.'], ['Supplier message prepared', 'An order message to the supplier is prepared from the approved reorder.'], ['Stock and order status', 'Everyone sees current stock and the status of open supplier orders.'], ['Goods received', 'Receiving updates stock and closes the supplier order.'], ['Exception to a person', 'Stock count mismatches and late deliveries are flagged.']],
    out: { auto: ['Reducing stock on every sale', 'Flagging items below minimum', 'Preparing supplier orders'], human: ['Approving reorders', 'Choosing alternatives'], live: ['Stock by item', 'Open supplier orders'], rec: ['Every stock movement', 'Who approved each reorder'], exc: ['Stock count mismatch', 'Late supplier delivery'] },
    integ: 'A connection to your point-of-sale or sales records, where one exists and is agreed.', ui: 'A simple stock and reorder screen for the counter and the owner.' },
  { id: 'service', name: 'Service company', process: 'From service request to completion', summary: 'Requests, scheduling, technician visits, job notes and invoicing.',
    steps: ['A request arrives by call or WhatsApp', 'Details are noted by hand', 'Technician availability is checked', 'A visit is scheduled', 'The job is carried out', 'Job notes are recorded', 'An invoice is raised', 'Feedback is requested'],
    problems: [
      { k: 'missing', at: [1], d: 'The fault, address or contact is incomplete when the technician is assigned.' },
      { k: 'apps', at: [2, 3], d: 'Messages, the calendar and job sheets are separate.' },
      { k: 'owner', at: [3, 4], d: 'It is unclear who confirmed the customer and who has the job.' },
      { k: 'status', at: [4, 5], d: 'Customers and office staff cannot see where a job is.' },
      { k: 'repeat', at: [5, 6], d: 'Job notes are retyped into the invoice.' },
      { k: 'follow', at: [7], d: 'Feedback requests are forgotten.' },
    ],
    nodes: [['Service request', 'A call is logged or a WhatsApp or web request arrives.'], ['Request details', 'Fault, address, contact and urgency are captured in a structured form.'], ['Completeness check', 'Missing details are requested before a technician is assigned.'], ['Who and when?', 'Rules choose a technician and slot by skill, area and availability.'],
      ['Visit scheduled', 'The visit is booked and a confirmation message is prepared.'], ['Supervisor approves exceptions', 'Urgent or out-of-area jobs are approved by a supervisor.'], ['Connect calendar and invoicing', 'Job details flow to the calendar and, on completion, to the invoice.'], ['Job status', 'Booked, on the way, in progress and completed update as the technician reports.'], ['Job closed', 'Notes, invoice and a feedback request are completed.'], ['Exception to a person', 'No technician available, a missed visit or a customer complaint is escalated.']],
    out: { auto: ['Requesting missing details', 'Preparing visit confirmations', 'Creating the invoice draft'], human: ['Approving urgent or out-of-area jobs', 'Resolving complaints'], live: ['Job status', 'Technician workload'], rec: ['Job notes and parts used', 'Customer confirmations'], exc: ['No technician available', 'Missed visit'] },
    integ: 'Connections to your calendar and invoicing tool, where agreed.', ui: 'A job board for the office and a simple view for technicians.' },
  { id: 'ecommerce', name: 'E-commerce business', process: 'From order to delivery and returns', summary: 'Orders, payments, stock, couriers, customer updates and returns.',
    steps: ['An order is placed', 'Payment is confirmed', 'Stock is checked', 'The order is packed', 'A courier is booked', 'The customer is notified', 'Delivery is tracked', 'A return is requested', 'A refund is processed'],
    problems: [
      { k: 'apps', at: [0, 2, 4], d: 'The store, stock sheet and courier tools are separate.' },
      { k: 'repeat', at: [3, 4], d: 'Addresses and items are copied into courier forms by hand.' },
      { k: 'status', at: [5, 6], d: 'Customers ask “where is my order?” because nobody has updated them.' },
      { k: 'owner', at: [7, 8], d: 'Returns bounce between support and the warehouse.' },
      { k: 'delay', at: [8], d: 'Refunds wait for a manual check.' },
    ],
    nodes: [['Order placed', 'A new order arrives from your store.'], ['Order and address', 'Items, address and payment status arrive in one structure.'], ['Payment and address check', 'Payment confirmation and address completeness are verified.'], ['Is everything in stock?', 'Rules decide: ship, split the order or hold and notify.'],
      ['Pick list and courier booking', 'A pick list is created and a courier booking is prepared.'], ['Owner approves refunds', 'Refunds above an agreed value are approved by a person.'], ['Connect store, stock and courier', 'Stock, tracking details and order status stay in step across tools.'], ['Customer updates', 'Customers are told when an order is packed, shipped and delivered.'], ['Order closed', 'Delivered orders close; returns open a linked case.'], ['Exception to a person', 'Failed payments, out-of-stock items and delivery problems are escalated.']],
    out: { auto: ['Checking payment and stock', 'Preparing courier bookings', 'Customer status messages'], human: ['Approving large refunds', 'Handling delivery problems'], live: ['Orders by status', 'Returns in progress'], rec: ['Every order status change', 'Refund approvals'], exc: ['Failed payment', 'Out of stock after ordering'] },
    integ: 'Connections between your store, stock record and courier tool, where those tools provide the integration.', ui: 'An orders and returns board for the team.' },
  { id: 'professional', name: 'Professional services business', process: 'From enquiry to engagement', summary: 'Enquiries, scoping, proposals, approvals, onboarding and billing.',
    steps: ['An enquiry is received', 'An introductory call is held', 'Scope is gathered', 'A proposal is prepared', 'The client approves', 'Onboarding documents are sent', 'Work is tracked', 'An invoice is raised', 'Follow-up after delivery'],
    problems: [
      { k: 'missing', at: [2], d: 'Scope notes are incomplete after the call.' },
      { k: 'repeat', at: [3, 5, 7], d: 'Client details are retyped into proposals, onboarding forms and invoices.' },
      { k: 'delay', at: [4], d: 'Proposals sit unanswered with no reminder.' },
      { k: 'follow', at: [4, 8], d: 'Follow-ups depend on who remembers.' },
      { k: 'status', at: [6], d: 'Partners cannot see the status of engagements.' },
    ],
    nodes: [['New enquiry', 'An enquiry arrives from the website or by email.'], ['Scoping form', 'The client describes the need in a short structured form before the call.'], ['Scope check', 'Required scope details are checked and gaps are flagged for the call.'], ['Is this a fit?', 'Rules route the enquiry to the right partner and flag out-of-scope requests.'],
      ['Proposal draft', 'A proposal draft is built from the scope and your approved templates.'], ['Partner approves', 'A partner reviews and approves the proposal before it is sent.'], ['Connect documents and billing', 'Client details flow to onboarding documents and billing.'], ['Engagement status', 'Proposal sent, accepted, in progress and invoiced are visible at a glance.'], ['Engagement started', 'Onboarding is complete and the work is tracked to delivery.'], ['Exception to a person', 'Unanswered proposals and scope changes are escalated.']],
    out: { auto: ['Preparing proposals from templates', 'Reminders for unanswered proposals', 'Onboarding documents'], human: ['Approving proposals', 'Agreeing scope changes'], live: ['Proposals by status', 'Engagements in progress'], rec: ['Proposal versions and approvals', 'Scope changes'], exc: ['Proposal unanswered beyond the agreed time', 'Scope change mid-engagement'] },
    integ: 'Connections between your documents, calendar and billing tool, where agreed.', ui: 'An engagements and proposals tracker for partners and staff.' },
];

export const DELIVERABLES: { t: string; d: string }[] = [
  { t: 'Configured system', d: 'The system set up around your process, rules and roles, tested on real examples from your business.' },
  { t: 'Workflow implementation', d: 'The workflow built as designed: triggers, validation, decisions, approvals and exception handling.' },
  { t: 'Relevant integrations', d: '' }, { t: 'User interface or dashboard', d: '' },
  { t: 'Testing', d: 'Testing against the cases you care about, including the awkward ones, before anything goes live.' },
  { t: 'Documentation', d: 'Plain-language documentation of how it works, who does what and how to change common settings.' },
  { t: 'Handover', d: 'A walk-through for your team so they can run it, with the opportunity to ask questions before sign-off.' },
  { t: 'Agreed support arrangements', d: 'Support and maintenance after delivery, arranged according to the project agreement. No unlimited-support promises.' },
];
