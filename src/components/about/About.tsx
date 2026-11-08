// About: the "Working with MFS" client FAQ. Only claims that are true: no invented timelines, hourly rates, clients, numbers or support promises.
import { useEffect, useRef, useState } from 'react';
import { Headline, Reveal } from '../../motion/reveal';
import Tagline from './Tagline';
import { FAQ } from '../../data/faq';

const PRINCIPLES = [
  { t: 'Built around your process', d: 'We start from how the work really happens, not from a tool we want to sell.' },
  { t: 'Honest about what is real', d: 'Simulations are labelled as simulations. If something has not been verified or connected, we say so.' },
  { t: 'People stay in the loop', d: 'Uncertain, sensitive or unusual cases are routed to a person instead of guessed at.' },
];
const PAY = [
  { p: 30, t: 'Project confirmation and initiation' },
  { p: 40, t: 'Agreed working milestone or preview' },
  { p: 30, t: 'Final approval, before final handover' },
];
const PRIORITY = 6;

export default function About() {
  const [open, setOpen] = useState<number | null>(0); const [all, setAll] = useState(false);
  const wrap = useRef<HTMLDivElement>(null); const more = useRef<HTMLDivElement>(null);
  useEffect(() => { const n = more.current; if (n) (n as any).inert = !all; }, [all]);
  const toggleAll = () => { if (all && open !== null && open >= PRIORITY) setOpen(null); setAll(!all); };
  const keys = (e: any) => {
    const k = e.key; if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(k)) return;
    const bs = Array.from(wrap.current?.querySelectorAll<HTMLButtonElement>('button.fq__b') ?? []).filter((b) => !b.closest('[inert]'));
    const at = bs.indexOf(document.activeElement as HTMLButtonElement); if (at < 0) return; e.preventDefault();
    bs[k === 'Home' ? 0 : k === 'End' ? bs.length - 1 : (at + (k === 'ArrowDown' ? 1 : -1) + bs.length) % bs.length]?.focus();
  };
  const row = (x: (typeof FAQ)[number], i: number, anim: boolean) => {
    const on = open === i; const inner = (
      <>
        <h3 className="fq__h"><button type="button" className="fq__b" id={`fq-b${i}`} aria-expanded={on} aria-controls={`fq-p${i}`} onClick={() => setOpen(on ? null : i)}>
          <span className="fq__n" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span><span className="fq__q">{x.q}</span><span className="fq__ic" aria-hidden="true" />
        </button></h3>
        <div className="fq__p" id={`fq-p${i}`} role="region" aria-labelledby={`fq-b${i}`}><div className="fq__pi">
          <p>{x.a}</p>
          {x.pay && <ol className="pay" aria-label="Payment structure">{PAY.map((s) => <li key={s.p + s.t} style={{ ['--w' as any]: s.p }}><b>{s.p}%</b><span>{s.t}</span></li>)}</ol>}
        </div></div>
      </>
    );
    return anim
      ? <Reveal as="li" key={x.q} variant="up" i={i} className="fq__i" data-open={on}>{inner}</Reveal>
      : <li key={x.q} className="fq__i" data-open={on} style={{ ['--i' as any]: i - PRIORITY }}>{inner}</li>;
  };
  return (
    <section className="sec about th-light" id="about" aria-labelledby="about-title">
      <div className="wrap">
      <Tagline />
      <div className="about__grid">
        <div className="about__intro">
          <Reveal as="p" className="eyebrow" variant="up">Working with MFS</Reveal>
          <Headline lines={['Clear Expectations.', 'Practical Solutions.', 'Professional Delivery.']} accent={1} className="sec-title" id="about-title" />
          <Reveal as="p" className="sec__lead" variant="up" i={2}>We believe every project should begin with clear communication. Here&rsquo;s what you should know about working with Murali Forge Systems.</Reveal>
          <ul className="about__pr">{PRINCIPLES.map((p, i) => <Reveal as="li" key={p.t} variant="up" i={i + 3}><h3>{p.t}</h3><p>{p.d}</p></Reveal>)}</ul>
        </div>
        <div className="fq glass glass--raised" ref={wrap} onKeyDown={keys}>
          <ul className="fq__list">{FAQ.slice(0, PRIORITY).map((x, i) => row(x, i, true))}</ul>
          <div className="fq__more" id="fq-more" data-open={all} ref={more}><div className="fq__more-in"><ul className="fq__list">{FAQ.slice(PRIORITY).map((x, j) => row(x, j + PRIORITY, false))}</ul></div></div>
          <Reveal as="div" className="fq__foot" variant="up" i={PRIORITY}>
            <button type="button" className="btn fq__all" aria-expanded={all} aria-controls="fq-more" onClick={toggleAll}>{all ? 'Show fewer' : 'View All FAQs'}<span className="fq__all-n" aria-hidden="true">{all ? '' : `+${FAQ.length - PRIORITY}`}</span></button>
          </Reveal>
        </div>
      </div>
      </div>
    </section>
  );
}
