// The real Cal.com event, embedded with Cal.com's official inline-embed loader (https://cal.com/docs → embed → inline).
// Cal.com stays the source of truth for the questions, availability, timezone, booking and confirmation: nothing is copied here.
// Mounted only the first time the visitor asks for it, and then kept mounted so their progress survives hiding the panel.
import { useEffect, useRef, useState } from 'react';

export const CAL_LINK = 'murali-forge-systems-1bhduf/30min';
export const BOOKING_URL = `https://cal.com/${CAL_LINK}`;
const ORIGIN = 'https://app.cal.com'; const SRC = `${ORIGIN}/embed/embed.js`; const NS = 'mfsdiscovery'; const SLOW_MS = 15000;
type Cal = any;

/** Cal.com's own loader snippet, written out readably. Safe to call more than once. */
function bootCal(): Cal {
  const w = window as any;
  if (!w.Cal) {
    const push = (api: any, args: any) => { api.q.push(args); };
    w.Cal = function () {
      const cal = w.Cal; const ar = arguments as any;
      if (!cal.loaded) { cal.ns = {}; cal.q = cal.q || []; document.head.appendChild(document.createElement('script')).src = SRC; cal.loaded = true; }
      if (ar[0] === 'init') {
        const api: any = function () { push(api, arguments); }; const ns = ar[1]; api.q = api.q || [];
        if (typeof ns === 'string') { cal.ns[ns] = cal.ns[ns] || api; push(cal.ns[ns], ar); push(cal, ['initNamespace', ns]); } else push(cal, ar);
        return;
      }
      push(cal, ar);
    };
  }
  return w.Cal;
}

export default function CalEmbed() {
  const host = useRef<HTMLDivElement>(null); const [state, setState] = useState<'loading' | 'ready' | 'failed'>('loading');
  useEffect(() => {
    let dead = false; const cleanups: (() => void)[] = [];
    const ready = () => { if (!dead) setState('ready'); }; const fail = () => { if (!dead) setState((s) => (s === 'ready' ? s : 'failed')); };
    try {
      const Cal = bootCal(); Cal('init', NS, { origin: ORIGIN }); const api = Cal.ns[NS];
      const tag = document.querySelector<HTMLScriptElement>(`script[src="${SRC}"]`);
      if (tag) { tag.addEventListener('error', fail); cleanups.push(() => tag.removeEventListener('error', fail)); }
      api('on', { action: 'linkReady', callback: ready }); api('on', { action: 'linkFailed', callback: fail });
      api('inline', { elementOrSelector: host.current, calLink: CAL_LINK, layout: 'month_view', config: { layout: 'month_view', theme: 'light' } });
      // Embed colours: Cal.com themes its own iframe; only these supported variables can be set from outside.
      api('ui', { theme: 'light', hideEventTypeDetails: false, layout: 'month_view', cssVarsPerTheme: { light: { 'cal-brand': '#343A3A', 'cal-brand-emphasis': '#171918', 'cal-brand-text': '#F9F6EF' }, dark: { 'cal-brand': '#B99865', 'cal-brand-emphasis': '#D1B27D', 'cal-brand-text': '#171918' } } });
    } catch { fail(); }
    const t = window.setTimeout(fail, SLOW_MS); cleanups.push(() => clearTimeout(t));
    return () => { dead = true; cleanups.forEach((c) => c()); };
  }, []);
  return (
    <div className="cal" data-state={state}>
      <div className="cal__host" ref={host} aria-busy={state === 'loading'} />
      {state === 'loading' && <div className="cal__load" role="status"><span className="cal__spin" aria-hidden="true" /><span>Opening the booking calendar&hellip;</span></div>}
      {state === 'failed' && (
        <div className="cal__fail" role="alert">
          <p className="cal__fail-t">Having trouble opening the booking calendar?</p>
          <p className="cal__fail-d">Your browser or network may be blocking the embedded calendar. The same booking page works on its own.</p>
          <a className="btn btn--primary" href={BOOKING_URL} target="_blank" rel="noopener noreferrer">Open Booking Page</a>
        </div>
      )}
    </div>
  );
}
