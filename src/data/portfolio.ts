// Website portfolio shown under "Website Design & Development". Add a verified URL to PORTFOLIO and the grid adapts
// (two items → two columns, three → three). Nothing here claims paid client work; names stay neutral until verified.
export interface PortfolioItem { url: string; label: string; kind: string; summary: string; host: string; }
export const PORTFOLIO: PortfolioItem[] = [
  { url: 'https://portfolio-omega-three-28bfnl5rm9.vercel.app', label: 'Website Project 01', kind: 'Personal portfolio website', host: 'Published on Vercel',
    summary: 'A single-page portfolio that presents selected projects, skills and contact details, with project showcases, scroll navigation and a responsive layout.' },
  { url: 'https://architecture-unfold.lovable.app', label: 'Website Project 02', kind: 'Property showcase website', host: 'Published on Lovable',
    summary: 'A property showcase with a blueprint-to-3D storytelling layout, a collection of listings, location details and consultation and WhatsApp enquiry options.' },
];
