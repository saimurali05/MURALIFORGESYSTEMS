// THE CLOSING STATEMENT — "You know the business. I know the chemistry."
// A near-black composition built around one idea: two bodies of knowledge that overlap. Two faint rings (the business · MFS systems)
// are drawn behind a glass split-flap board; the board states the line once, and as each sentence lands the matching ring is lit —
// ivory for the business, copper for the systems — until the overlap glows. Nothing loops, nothing rotates.
// The board reports phases (1 start · 2 first sentence · 3 finished) and CSS reads them from data-phase on the section.
import { useRef } from 'react';
import type { CSSProperties } from 'react';
import { FiArrowRight } from 'react-icons/fi';
import TextFlippingBoard, { STATEMENT } from './TextFlippingBoard';

const v = (o: Record<string, number | string>) => o as unknown as CSSProperties;

export default function Closing() {
  const root = useRef<HTMLElement>(null);
  const reduced = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const phase = (n: number) => { if (root.current) root.current.dataset.phase = String(n); };
  return (
    <section ref={root} className="cl th-dark has-lamps" id="closing" aria-labelledby="cl-title" data-phase={reduced ? 3 : 0}>
      <i className="lamp cl__lamp cl__lamp--l" style={v({ '--lamp-x': '36%', '--lamp-y': '46%', '--lamp-w': '56%', '--lamp-h': '86%', '--lamp-c': '242, 233, 227', '--lamp-a': 0.07 })} />
      <i className="lamp cl__lamp cl__lamp--r" style={v({ '--lamp-x': '64%', '--lamp-y': '46%', '--lamp-w': '56%', '--lamp-h': '86%', '--lamp-a': 0.17 })} />
      <div className="wrap cl__in">
        <h2 id="cl-title" className="sr-only">{STATEMENT}</h2>

        <div className="cl__stage">
          <div className="cl__art" aria-hidden="true">
            {/* wide: two rings side by side */}
            <svg className="cl__rings cl__rings--wide" viewBox="0 0 1200 560" focusable="false">
              <defs>
                <clipPath id="cl-clip-a"><circle cx="452" cy="280" r="232" /></clipPath>
                <radialGradient id="cl-lens-w" cx="50%" cy="50%" r="50%"><stop offset="0" stopColor="#C9AA78" stopOpacity="0.5" /><stop offset="0.65" stopColor="#B99865" stopOpacity="0.16" /><stop offset="1" stopColor="#B99865" stopOpacity="0" /></radialGradient>
              </defs>
              <circle className="cl__lens" cx="748" cy="280" r="232" clipPath="url(#cl-clip-a)" fill="url(#cl-lens-w)" />
              <circle className="cl__ring cl__ring--a" cx="452" cy="280" r="232" pathLength={1} transform="rotate(-90 452 280)" />
              <circle className="cl__ring cl__ring--b" cx="748" cy="280" r="232" pathLength={1} transform="rotate(-90 748 280)" />
              <circle className="cl__node cl__node--a" cx="452" cy="48" r="3.5" />
              <circle className="cl__node cl__node--b" cx="748" cy="48" r="3.5" />
            </svg>
            {/* narrow: the same two rings, stacked */}
            <svg className="cl__rings cl__rings--tall" viewBox="0 0 400 580" focusable="false">
              <defs>
                <clipPath id="cl-clip-t"><circle cx="200" cy="200" r="150" /></clipPath>
                <radialGradient id="cl-lens-t" cx="50%" cy="50%" r="50%"><stop offset="0" stopColor="#C9AA78" stopOpacity="0.5" /><stop offset="0.65" stopColor="#B99865" stopOpacity="0.16" /><stop offset="1" stopColor="#B99865" stopOpacity="0" /></radialGradient>
              </defs>
              <circle className="cl__lens" cx="200" cy="380" r="150" clipPath="url(#cl-clip-t)" fill="url(#cl-lens-t)" />
              <circle className="cl__ring cl__ring--a" cx="200" cy="200" r="150" pathLength={1} transform="rotate(-90 200 200)" />
              <circle className="cl__ring cl__ring--b" cx="200" cy="380" r="150" pathLength={1} transform="rotate(-90 200 380)" />
              <circle className="cl__node cl__node--a" cx="200" cy="50" r="3.5" />
              <circle className="cl__node cl__node--b" cx="200" cy="530" r="3.5" />
            </svg>
            <div className="cl__frame glass glass--raised" style={v({ '--g-r': '24px' })}>
              <TextFlippingBoard onPhase={phase} />
              <i className="cl__sweep" />
            </div>
          </div>

          <div className="cl__sides" aria-hidden="true">
            <p className="cl__side cl__side--a"><b>Your business</b><span>customers · craft · standards</span></p>
            <p className="cl__side cl__side--b"><b>MFS systems</b><span>systems · integrations · technology</span></p>
          </div>
        </div>

        <p className="cl__lede">Your business has enough to manage. <em>Let your systems handle more.</em></p>
        <div className="cl__cta"><a className="btn btn--primary" href="#contact">Discuss Your Workflow <FiArrowRight className="arrow" aria-hidden="true" /></a></div>
      </div>
    </section>
  );
}
