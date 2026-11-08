# Murali Forge Systems — website

React 19 + TypeScript + esbuild. No UI/animation framework; custom motion controller.

**Quick start — no install, no terminal (Windows / macOS / Linux):** extract the zip and double-click `OPEN-SITE.html` (or `dist/index.html`). The built site in `dist/` is fully static and works straight from disk.

**Prefer a local server?** (needs Node.js; no `npm install` required)
```
npm start            # serves dist/ at http://127.0.0.1:5173   (Windows: or double-click start-site.bat)
```
Port busy? PowerShell: `$env:PORT=5180; npm start` — macOS/Linux: `PORT=5180 npm start`.

**Rebuilding / editing:**
```
npm install
npm run dev          # esbuild watch + serve at http://127.0.0.1:5173
npm run build        # → dist/ (static site; serve with any static server)
npm run check        # typecheck + build
```

**Windows tip:** keep the project outside OneDrive-synced folders (e.g. `C:\dev\mfs-site`). OneDrive "Files On-Demand" placeholders break Node tooling, and `node_modules` would sync thousands of files. Also run npm from the folder that contains this `package.json` — npm silently uses the nearest `package.json` in a parent folder if the current one has none (`npm pkg get name` should print `mfs-site`).

## Tests (Playwright + Node; start `python3 -m http.server 5180 -d dist` first)
- `node tests/advantage.cjs <outDir>` · `node tests/process.cjs <outDir>` · `node tests/closing.cjs <outDir>` · `node tests/ae.cjs <outDir>` — the cinematic sections: states, overflow at six widths, reduced motion, screenshots
- `node tests/overflow.cjs` — whole-page horizontal overflow at 1440 / 1280 / 1024 / 768 / 390 / 360
- `node tests/demos.cjs [WxH] [ids]` — all nine demos autoplay through their guided sequence, no overflow or console errors; `node tests/dm-interact.cjs` — manual interactions in each demo; `node tests/dm-shot.cjs` — screenshots
- `node tests/sections.cjs <outDir>` — six-stage process, FAQ opens, split-flap board, demo CTA → contact, footer anchors
- `node tests/about-contact.cjs [url] [outDir] [WxH,...]` — About FAQ (8 questions, 6 shown, View All, one open at a time, keyboard) and Contact (old form gone, Cal.com loaded on demand, exact event link, hide/show keeps the iframe, fallback). app.cal.com is mocked/blocked in this test: it verifies the integration, not Cal.com's live booking.
- `node tests/standalone.cjs <file:// url of dist/index.html> <http url>` — the build works when opened from disk AND over http (fonts, demo run, board, no console errors); `node tests/open-site.cjs <file:// url of OPEN-SITE.html>`
- `node tests/inert-check.cjs <url>` — closed mobile menu is inert / skipped by Tab, opens and closes with focus handled (run at a 390px viewport internally)
- `node tests/nav-kbd.cjs`, `node tests/responsive.cjs <outDir>`, `node tests/hero-gate.cjs <url> <outDir>`

## Design notes
- Palette (Ivory Graphite): Warm Ivory `#F9F6EF` · Soft Cream `#F2EDE3` · Sand Beige `#E8E1D6` · Graphite `#343A3A` · Deep Charcoal `#171918` · Champagne Gold `#B99865` · Muted Taupe `#8C8173` · Warm Silver `#CFC8BC`. Tokens live in `src/styles/tokens.css`; any section can opt into `.th-light` or `.th-dark` and every component follows. Glass (`src/styles/glass.css`) is soft opaque: 88–96% surface, 14–22px blur, one elevation scale `--e1…--e4`.
- Services cards use `components/services/WorkflowThumb.tsx` (data-driven workflows; Simple Icons keep official brand colours, Tabler icons for generic concepts). Logos are illustrative and imply no partnership.
- Not available offline as official marks: OpenAI, Salesforce, webhook — generic icons / HubSpot are used instead; no logos were invented.

## Honest notes
- All nine interactive demos (CRM, AI agent studio, process console, marketing journey, API workspace, WhatsApp, inventory and orders, finance reconciliation, dashboards) are **local simulations on sample data**, labelled as such, with a Presentation mode (guided, keyboard-controllable). Nothing is emailed, sent to WhatsApp, written to a CRM, booked, charged or stored. The AI-agent demo is rule-based, not live AI.
- Contact: there is no form. The section embeds the real Cal.com event (https://cal.com/murali-forge-systems-1bhduf/30min, MFS Discovery Call) with Cal.com's official inline embed, loaded only when the visitor clicks "Book an MFS Discovery Call". Cal.com owns the booking questions, availability, timezone, booking and confirmation; nothing is duplicated in the site. If the embed cannot load, an "Open Booking Page" fallback appears. Email alternative: muraliforgesystems@gmail.com. To change the event, edit `CAL_LINK` in `src/components/contact/CalEmbed.tsx`.
- `src/types/react-shim.d.ts` stands in for `@types/react` (could not be installed offline). Delete it after `npm i -D @types/react @types/react-dom`.

## Services, Lab, portfolio and SEO
- One data source: `src/data/services.ts` (11 approved services, fixed order). Directory (`components/services/ServiceDirectory.tsx`), showcase cards, footer and JSON-LD all read from it. Deep links: `#service-<id>`.
- Portfolio entries live in `src/data/portfolio.ts` (two confirmed URLs; add a third entry there once a real URL exists — none is invented).
- **MFS Business Systems Lab** (`components/lab/`): six illustrative scenarios × six stages. Simulation only, labelled; no real metrics.
- SEO: `site.config.json` → `siteUrl` (or `SITE_URL=https://… npm run check`) enables canonical, og:url/og:image, absolute JSON-LD URLs and `sitemap.xml`. Leave empty and they are omitted. `allowAiTraining:false` adds training-crawler opt-outs to `robots.txt` (search crawlers stay allowed). Verify crawler names against each vendor's current docs before relying on them.
- More tests: `node tests/eleven.cjs` (services, Lab, portfolio, links, SEO output), `node tests/a11y-perf.cjs` (structural a11y + CLS/LCP measured in Chromium), `node tests/layout-audit.cjs`. Run a static server on port 5180 over `dist/` first.

