// Client FAQ — single source for the About section and the crawlable no-JavaScript fallback in index.html.
// Order = display order. The first six are the priority questions; the last two sit behind "View All FAQs".
export const FAQ: { q: string; a: string; pay?: boolean }[] = [
  { q: 'How long does it take to complete a project?', a: 'Project timelines depend on the scope, complexity and requirements. After understanding your needs, we provide a clear estimated delivery schedule with milestones before work begins.' },
  { q: 'Which services can MFS deliver the fastest?', a: 'Smaller website projects, straightforward integrations and focused workflow automations can often be delivered faster than complex custom systems. We confirm feasibility and estimated timelines after reviewing your requirements.' },
  { q: 'Do you charge hourly or offer fixed project pricing?', a: 'We offer pricing based on project scope and engagement requirements. Depending on the work, this may be a fixed project fee or an hourly arrangement. You receive transparent pricing details before work begins.' },
  { q: 'Are you available on weekends for projects and support?', a: 'Weekend availability can be arranged in advance, depending on the project, urgency and agreed support requirements.' },
  { q: 'How much advance payment is required to start a project?', a: 'We require a 30% advance payment to confirm the project and begin work. The remaining 70% is collected through agreed project milestones, with the final payment due before the completed solution is handed over. All payment terms are clearly outlined in the project proposal.', pay: true },
  { q: 'Do you provide support after project delivery?', a: 'Post-delivery support and maintenance can be arranged based on the solution, project agreement and support requirements.' },
  { q: 'What happens if project requirements change after work begins?', a: 'Changes outside the agreed project scope are reviewed separately. We communicate any additional costs and timeline adjustments and obtain approval before proceeding.' },
  { q: 'Will I receive updates and be able to review the work?', a: 'Yes. We share progress updates and agreed review milestones so you can provide feedback before final handover.' },
];
