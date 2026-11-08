import { TbArrowUpRight } from 'react-icons/tb';
import { PORTFOLIO } from '../../data/portfolio';
import { Reveal } from '../../motion/reveal';

const hostOf = (u: string) => new URL(u).hostname;
export default function Portfolio() {
  return (
    <section className="pf" aria-labelledby="pf-title">
      <h4 className="pf__h" id="pf-title">Explore Our Website Work</h4>
      <p className="pf__lead">Explore selected website experiences designed to communicate brands clearly, present business offerings professionally and create a stronger digital presence.</p>
      <ul className="pf__grid" data-count={PORTFOLIO.length}>
        {PORTFOLIO.map((p, i) => (
          <Reveal as="li" key={p.url} variant="up" i={i} className="pf__card">
            <div className="pf__frame" aria-hidden="true">
              <div className="pf__bar"><i /><i /><i /><span>{hostOf(p.url)}</span></div>
              <div className="pf__shot"><b>{p.kind}</b><span /><span /><span /><em>Live site opens in a new tab</em></div>
            </div>
            <div className="pf__body">
              <p className="pf__meta">{p.label} · {p.host}</p>
              <h5>{p.kind}</h5>
              <p>{p.summary}</p>
              <a className="btn pf__go" href={p.url} target="_blank" rel="noopener noreferrer" aria-label={`View Live Website: ${p.label}, ${p.kind} (opens in a new tab)`}>View Live Website <TbArrowUpRight size={17} aria-hidden="true" /></a>
            </div>
          </Reveal>
        ))}
      </ul>
    </section>
  );
}
