// The MFS statement as a continuous, seamless loop: a champagne light passes across the words one after another, each word lifts a hair as it
// catches the light, and a fine rule draws beneath. CSS-only motion (compositor-friendly), paused while off-screen, static under reduced motion.
// The words are real text for assistive technology; the animated copy is aria-hidden.
import { useEffect, useRef } from 'react';
import { Reveal } from '../../motion/reveal';

const LINES = [['YOU', 'KNOW', 'THE', 'BUSINESS.'], ['I', 'KNOW', 'THE', 'CHEMISTRY.']];

export default function Tagline() {
  const el = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const n = el.current; if (!n || typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver((e) => n.classList.toggle('is-away', !e[0].isIntersecting), { threshold: 0.05 });
    io.observe(n); return () => io.disconnect();
  }, []);
  let w = 0;
  return (
    <Reveal as="div" variant="up" className="tg-wrap">
      <div ref={el} className="tg glass glass--raised th-light" role="group" aria-label="Our philosophy">
        <p className="sr-only">You know the business. I know the chemistry.</p>
        <p className="tg__eyebrow" aria-hidden="true">The MFS philosophy</p>
        <div className="tg__lines" aria-hidden="true">
          {LINES.map((ln, i) => (
            <div className="tg__line" key={i}>{ln.map((word) => <span key={word + w} className="tg__w" style={{ ['--w' as any]: w++ }}>{word}</span>)}</div>
          ))}
        </div>
        <span className="tg__rule" aria-hidden="true" />
      </div>
    </Reveal>
  );
}
