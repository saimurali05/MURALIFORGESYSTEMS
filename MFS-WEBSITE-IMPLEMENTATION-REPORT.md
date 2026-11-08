# MFS Website — Implementation Report

Status: **built and tested locally in Chromium only. Not deployed.**

## Final service list (one data source, `src/data/services.ts`)
01 Website Design & Development · 02 Company Profile Design · 03 AI Agents & Intelligent Assistants · 04 Lead Management & CRM Automation · 05 WhatsApp Business Automation · 06 Business Process Automation · 07 Marketing Automation · 08 API & System Integrations · 09 Inventory & Order Management Systems · 10 Payment & Invoice Automation · 11 Dashboards & Business Analytics.
Verified: exact names and order in directory; 11 showcase cards; 11 footer links; no duplicates; no old service names in rendered text. Each service has the eight business-outcome fields (who, problem, cost today, delivers, how, handover, timeline, support). Timelines state dependencies only; no prices, guarantees or testimonials were invented.

## Files
New: `src/data/{services,faq,portfolio,book}.ts`, `src/components/services/{ServiceDirectory,Portfolio}.tsx`, `src/components/lab/{Lab.tsx,scenarios.ts}`, `src/components/demos/{Inventory,Dashboard}.tsx`, `src/styles/{directory,lab}.css`, `site.config.json`, `scripts/seo.mjs`, `scripts/gen-og.cjs`, `public/og-image.png`, tests `eleven`, `a11y-perf`, `layout-audit`, `shots11`.
Modified: `App.tsx`, `HeroParallax.tsx`, `WorkflowThumb.tsx`, `Footer.tsx`, `DemoSection.tsx`, demo `registry.ts`/`engine.tsx`, `Contact.tsx`, `About.tsx`, `services.css`, `main.tsx`, `index.html`, `scripts/build.mjs`, README, several tests.
Removed: `Schedule.tsx`, `Support.tsx` demos (old services).

## Alignment
Shared container and `--sec-y` section padding. Layout audit: headings share the container's left edge at ten widths; hero (full-bleed), closing (centred by design) and contact (heading inside card) are intentional exceptions. No horizontal overflow at 1440/1280/1024/768/390/360.

## Business Systems Lab and demos
Six scenarios (construction, manufacturing, retail, service, e-commerce, professional services) × six stages with stepper, back/next/reset, current vs proposed process, workflow nodes with a human-approval step, exception path, sample run (normal and with a problem), eight expandable handover items, booking CTA. All simulated and labelled; no fake metrics. Nine distinct demos: lead, agents, WhatsApp, marketing, process, API, inventory, payment & invoice, dashboards — all autoplay and respond to manual interaction in tests.

## Portfolio
Under Website Design & Development, heading "Explore Our Website Work", two cards linking to https://portfolio-omega-three-28bfnl5rm9.vercel.app and https://architecture-unfold.lovable.app (new tab, noopener). Neutral labels. Cards use framed placeholders, not screenshots. Both sites loaded when fetched earlier; I could not test them from the sandbox shell. Third slot: add an entry in `portfolio.ts` when a real URL exists.

## About / FAQ and Contact / Cal.com
About FAQ (8 questions) and Contact with inline Cal.com embed (`murali-forge-systems-1bhduf/30min`, fallback link) implemented and tested with Cal.com mocked/blocked. **Live booking was not tested** — the sandbox cannot reach app.cal.com. Please make one real test booking after deploying.

## SEO
Title, description, theme-color, OG/Twitter tags, JSON-LD (1 Organization, 1 WebSite, 11 Service; no ratings/reviews/address), no-JS crawlable service and FAQ content, robots.txt, sitemap. **Needs your input:** no production domain is confirmed, so canonical, og:url, og:image URL and sitemap are omitted until `siteUrl` in `site.config.json` or `SITE_URL` is set (tested with a dummy URL). robots.txt allows search crawlers and opts out GPTBot, Google-Extended, ClaudeBot, CCBot from training (`allowAiTraining:false`); **these names were not re-verified against official vendor docs in this session** — check before relying. No ranking claims are made.

## Accessibility / performance (measured, not scored)
Structural checks pass: accessible names on controls, unique ids, valid aria references, one h1/one main, no skipped heading levels, alt text, noopener, reduced-motion renders. Chromium local: CLS 0, LCP ≈ 480 ms, 3,886 DOM nodes; bundle 633 KB total (app.js 479 KB, app.css 154 KB). No Lighthouse run and no colour-contrast tool run; no screen-reader testing.

## Checks run
`tsc --noEmit` clean; production build OK; tests passing: eleven, a11y-perf, sections, nav-kbd, overflow, responsive, advantage, process, closing, demos, dm-interact, about-contact, inert-check, standalone (file:// and http). Chromium only — Safari/Firefox/real phones untested.

## Remaining manual configuration / unresolved
Production URL; real third portfolio URL (optional); live Cal.com test; verify crawler names; optional real portfolio screenshots; cross-browser and real-device testing.
Deployment: **not deployed.**
