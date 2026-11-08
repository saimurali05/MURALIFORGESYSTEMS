// The service directory: all eleven approved services, each explained in business terms from the single data source.
// Every panel stays in the DOM (inactive ones are `hidden`) so the content is crawlable and deep-linkable (#service-lead).
import { useEffect, useRef, useState } from 'react';
import type { KeyboardEvent } from 'react';
import { TbArrowRight, TbCheck } from 'react-icons/tb';
import { SERVICES, type ServiceId } from '../../data/services';
import { openBooking } from '../../data/book';
import { Headline, Reveal } from '../../motion/reveal';
import { motion } from '../../motion/controller';
import Portfolio from './Portfolio';

const fromHash = (): ServiceId | null => { const m = /^#service-(.+)$/.exec(location.hash); const s = m && SERVICES.find((x) => x.id === m[1]); return s ? s.id : null; };

function ProfilePreview() {
  return (
    <div className="pv" aria-label="Illustrative company profile layouts">
      {['Cover', 'Capabilities', 'Contact'].map((t, i) => (
        <figure key={t} className={`pv__pg pv__pg--${i}`}><div aria-hidden="true"><b /><i /><i /><i /><u /></div><figcaption>{t}</figcaption></figure>
      ))}
      <p className="pv__note">Illustrative layouts only — not client documents. Your profile is built from your own content, brand and credentials.</p>
    </div>
  );
}

export default function ServiceDirectory() {
  const [active, setActive] = useState<ServiceId>(() => fromHash() ?? 'website');
  const root = useRef<HTMLElement>(null); const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  useEffect(() => {
    const on = () => { const id = fromHash(); if (!id) return; setActive(id); requestAnimationFrame(() => root.current?.scrollIntoView({ behavior: motion.state.reduced ? 'auto' : 'smooth', block: 'start' })); };
    window.addEventListener('hashchange', on); if (fromHash()) setTimeout(on, 60);
    return () => window.removeEventListener('hashchange', on);
  }, []);
  const pick = (id: ServiceId, focus = false) => { setActive(id); if (focus) tabs.current[SERVICES.findIndex((s) => s.id === id)]?.focus(); };
  const onKey = (e: KeyboardEvent, i: number) => {
    const n = SERVICES.length; const k = e.key;
    const to = k === 'ArrowDown' || k === 'ArrowRight' ? (i + 1) % n : k === 'ArrowUp' || k === 'ArrowLeft' ? (i + n - 1) % n : k === 'Home' ? 0 : k === 'End' ? n - 1 : -1;
    if (to >= 0) { e.preventDefault(); pick(SERVICES[to].id, true); }
  };
  return (
    <section className="sec sd th-light" id="service-directory" ref={root} aria-labelledby="sd-title">
      <div className="wrap">
        <Reveal as="p" className="eyebrow" variant="up">What MFS delivers</Reveal>
        <Headline lines={['Eleven services,', 'explained in plain terms.']} accent={1} className="sec-title" as="h2" id="sd-title" />
        <Reveal as="p" className="sec__lead" variant="up" i={2}>For every service: who it is for, the problem it solves, what that problem costs today, what you receive at handover and what support can follow. No guaranteed results — scope decides timelines and pricing.</Reveal>
        <div className="sd__grid">
          <div className="sd__tabs" role="tablist" aria-label="MFS services" aria-orientation="vertical">
            {SERVICES.map((s, i) => (
              <button key={s.id} type="button" role="tab" id={`sdt-${s.id}`} ref={(el: HTMLButtonElement | null) => { tabs.current[i] = el; }} aria-selected={s.id === active} aria-controls={`service-${s.id}`}
                tabIndex={s.id === active ? 0 : -1} className={s.id === active ? 'is-on' : ''} onClick={() => pick(s.id)} onKeyDown={(e: KeyboardEvent) => onKey(e, i)}>
                <b>{String(s.n).padStart(2, '0')}</b><span>{s.title}</span>
              </button>))}
          </div>
          <div className="sd__panels">
            {SERVICES.map((s) => (
              <article key={s.id} id={`service-${s.id}`} role="tabpanel" aria-labelledby={`sdt-${s.id}`} hidden={s.id !== active} className="sd__panel glass glass--raised">
                <header className="sd__head"><p className="sd__no">Service {String(s.n).padStart(2, '0')} of {SERVICES.length}</p><h3>{s.title}</h3><p className="sd__sum">{s.summary}</p></header>
                <dl className="sd__facts">
                  <div><dt>Who needs this?</dt><dd>{s.who}</dd></div>
                  <div><dt>The problem</dt><dd>{s.problem}</dd></div>
                  <div><dt>What it costs today</dt><dd>{s.cost}</dd></div>
                  <div><dt>What MFS delivers</dt><dd>{s.delivers}</dd></div>
                  <div className="sd__wide"><dt>How it works</dt><dd>{s.how}</dd></div>
                </dl>
                <div className="sd__two">
                  <div><h4>At handover you receive</h4><ul className="sd__ck">{s.handover.map((h) => <li key={h}><TbCheck size={16} aria-hidden="true" />{h}</li>)}</ul></div>
                  <div><h4>Indicative timeline</h4><p>{s.timeline}</p><h4>After delivery</h4><p>{s.support}</p></div>
                </div>
                {s.id === 'website' && <Portfolio />}
                {s.id === 'profile' && <ProfilePreview />}
                <div className="sd__act">
                  <button type="button" className="btn btn--primary" onClick={openBooking}>Book a discovery call <TbArrowRight size={17} aria-hidden="true" /></button>
                  {s.demo && <a className="btn" href={`#demo-${s.demo}`}>See it in a demo</a>}
                </div>
              </article>))}
          </div>
        </div>
      </div>
    </section>
  );
}
