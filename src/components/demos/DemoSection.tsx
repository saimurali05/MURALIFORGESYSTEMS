// #demos — nine interactive software demonstrations. A tab selector chooses one; only the selected demo is ever mounted,
// so only one demo can autoplay at a time. Deep links (#demo-invoice) open the right demo.
import { useEffect, useRef, useState } from 'react';
import type { KeyboardEvent } from 'react';
import { serviceById, type DemoId } from '../../data/services';
import { Headline, Reveal } from '../../motion/reveal';
import { motion } from '../../motion/controller';
import { DemoStage, inviteTo } from './engine';
import { DEMOS } from './registry';
import Lab from '../lab/Lab';

const fromHash = (): DemoId | null => { const m = /^#demo-(.+)$/.exec(location.hash); const s = m && DEMOS.find((x) => x.id === m[1]); return s ? (s.id as DemoId) : null; };

export default function DemoSection() {
  const [active, setActive] = useState<DemoId>(() => fromHash() ?? 'lead');
  const tabs = useRef<(HTMLButtonElement | null)[]>([]); const root = useRef<HTMLElement>(null);
  useEffect(() => {
    const on = () => { const id = fromHash(); if (!id) return; setActive(id); requestAnimationFrame(() => root.current?.scrollIntoView({ behavior: motion.state.reduced ? 'auto' : 'smooth', block: 'start' })); };
    window.addEventListener('hashchange', on); if (fromHash()) setTimeout(on, 60);
    return () => window.removeEventListener('hashchange', on);
  }, []);
  const pick = (id: DemoId, focus = false) => { setActive(id); history.replaceState(null, '', `#demo-${id}`); if (focus) tabs.current[DEMOS.findIndex((s) => s.id === id)]?.focus(); };
  const onKey = (e: KeyboardEvent, i: number) => {
    const n = DEMOS.length; const k = e.key;
    const to = k === 'ArrowRight' || k === 'ArrowDown' ? (i + 1) % n : k === 'ArrowLeft' || k === 'ArrowUp' ? (i + n - 1) % n : k === 'Home' ? 0 : k === 'End' ? n - 1 : -1;
    if (to >= 0) { e.preventDefault(); pick(DEMOS[to].id as DemoId, true); }
  };
  const idx = Math.max(0, DEMOS.findIndex((d) => d.id === active));
  return (
    <section className="sec demos th-light" id="demos" ref={root} aria-labelledby="demos-title">
      <div className="demos__grid" aria-hidden="true" />
      <div className="wrap">
        <Reveal as="p" className="eyebrow" variant="up">Interactive solutions</Reveal>
        <Headline lines={['MFS Business', 'Systems Lab']} accent={1} className="sec-title" as="h2" id="demos-title" />
        <Reveal as="p" className="sec__lead" variant="up" i={2}>Every business works differently. Explore how we understand your operations and design systems around the way you actually work.</Reveal>
        <Lab />
        <div className="demos__sub"><h3>Explore individual systems</h3><p>From connected business tools to AI-powered workflows, explore practical systems designed around the way businesses operate. Each demo is a simulation running in your browser on sample data — nothing is sent, saved or connected.</p></div>
        <Reveal variant="up" i={3} className="demos__navwrap">
          <div className="demos__tabs" role="tablist" aria-label="Choose a demo">
            {DEMOS.map((s, i) => (
              <button key={s.id} ref={(el: HTMLButtonElement | null) => { tabs.current[i] = el; }} type="button" role="tab" id={`tab-${s.id}`} aria-selected={s.id === active} aria-controls="demo-panel" tabIndex={s.id === active ? 0 : -1}
                className={s.id === active ? 'is-on' : ''} onClick={() => pick(s.id)} onKeyDown={(e: KeyboardEvent) => onKey(e, i)}>
                <b>{String(i + 1).padStart(2, '0')}</b><span>{serviceById(s.id).nav}</span>
              </button>))}
          </div>
        </Reveal>
        <div id="demo-panel" role="tabpanel" aria-labelledby={`tab-${active}`} className="demos__panel"><DemoStage key={active} entry={DEMOS[idx]} index={idx} /></div>
        <Reveal variant="up" className="demos__more"><p>Your process isn’t on the list? Describe it and we’ll show you what a system around it could look like.</p><button type="button" className="btn" onClick={() => inviteTo(active)}>Describe your workflow</button></Reveal>
      </div>
    </section>
  );
}
