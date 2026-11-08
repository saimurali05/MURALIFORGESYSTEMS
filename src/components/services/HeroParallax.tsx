// HeroParallax — adapted from the supplied pattern (3D-tilted rows that relax and slide horizontally with scroll).
// Content is the eleven MFS services with illustrative workflow previews. Driven by the shared motion controller (no scroll hijack).
// Below 900px, with reduced motion, or on coarse pointers it becomes a plain readable grid.
import { useEffect, useRef, useState } from 'react';
import { TbArrowRight } from 'react-icons/tb';
import { SERVICES } from '../../data/services';
import { motion } from '../../motion/controller';
import { clamp, damp, map } from '../../motion/tokens';
import { Headline, Reveal } from '../../motion/reveal';
import WorkflowThumb from './WorkflowThumb';
import ToolStrip from './ToolStrip';
import AutomationStage from './AutomationStage';

function Card({ s }: { s: (typeof SERVICES)[number] }) {
  return (
    <a className="hp__card" href={`#${s.hash}`} aria-label={`${s.title} — read what MFS delivers`}>
      <WorkflowThumb id={s.id} label={`Illustrative workflow preview for ${s.title}`} />
      <span className="hp__meta">
        <span className="hp__n">{String(s.n).padStart(2, '0')}</span>
        <span className="hp__t">{s.title}</span>
        <span className="hp__d">{s.summary}</span>
        <span className="hp__go">Explore service <TbArrowRight aria-hidden="true" size={15} /></span>
      </span>
    </a>
  );
}

export default function HeroParallax() {
  const root = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const rows = [useRef<HTMLDivElement>(null), useRef<HTMLDivElement>(null)];
  const [flat, setFlat] = useState(false);

  useEffect(() => {
    const q = window.matchMedia('(max-width: 899px), (prefers-reduced-motion: reduce)');
    const on = () => setFlat(q.matches); on(); q.addEventListener('change', on);
    return () => q.removeEventListener('change', on);
  }, []);

  useEffect(() => {
    if (flat) return;
    const el = root.current!, st = stage.current!;
    const cur = { p: 0, tilt: 0 };
    let seeded = false;
    const unsub = motion.subscribe((s) => {
      const r = el.getBoundingClientRect();
      // 0 when the section top reaches the viewport bottom → 1 when its bottom reaches the viewport top
      const raw = clamp((s.vh - r.top) / (r.height + s.vh), 0, 1);
      if (!seeded) { cur.p = raw; seeded = true; }
      const k = damp(7, s.dt); cur.p += (raw - cur.p) * k;
      const p = cur.p;
      const tilt = clamp(map(p, 0.12, 0.42, 0, 1), 0, 1);       // 0 → fully tilted, 1 → flat
      st.style.transform = `rotateX(${((1 - tilt) * 14).toFixed(2)}deg) rotateZ(${((1 - tilt) * 6).toFixed(2)}deg) translateY(${((1 - tilt) * -60).toFixed(1)}px)`;
      st.style.opacity = String(0.35 + 0.65 * Math.min(1, tilt * 1.6 + 0.2));
      const dx = map(p, 0.1, 0.9, -1, 1) * Math.min(260, s.vw * 0.18);
      rows[0].current!.style.transform = `translate3d(${(dx).toFixed(1)}px,0,0)`;
      rows[1].current!.style.transform = `translate3d(${(-dx).toFixed(1)}px,0,0)`;
    }, el);
    return () => { unsub(); st.style.transform = ''; };
  }, [flat]);

  return (
    <section className="hp th-light" id="services" ref={root} aria-labelledby="services-title">
      <div className="wrap">
        <div className="sec-head sec-head--split hp__head">
          <div className="sec-head__main">
            <Reveal as="p" variant="up" className="eyebrow">Eleven services</Reveal>
            <Headline lines={['Practical automation', 'for real businesses.']} className="sec-title" accent={1} id="services-title" />
          </div>
          <div className="sec-head__aside">
            <Reveal as="p" variant="up" i={2} className="lede">We design and implement software, AI, and automation systems that reduce manual work, connect your tools, and improve how your business operates.</Reveal>
            <ul className="hp__benefits" aria-label="What this means for your business">
              <li>Automate Repetitive Work</li><li>Connect Your Tools</li><li>Improve Operational Visibility</li><li>More Time for Real Work</li>
            </ul>
            <p className="hp__note">Workflow previews are illustrative. Logos show the kinds of tools MFS can connect; they do not imply a partnership or a live connection.</p>
          </div>
        </div>
      </div>
      <div className="wrap ae-wrap"><AutomationStage /></div>
      <div className={`hp__view${flat ? ' is-flat' : ''}`}>
        <div className="hp__stage" ref={stage}>
          <div className="hp__row" ref={rows[0]}>{SERVICES.slice(0, 6).map((s) => <Card key={s.id} s={s} />)}</div>
          <div className="hp__row hp__row--b" ref={rows[1]}>{SERVICES.slice(6).map((s) => <Card key={s.id} s={s} />)}</div>
        </div>
      </div>
      <ToolStrip />
    </section>
  );
}
