import { useRef } from 'react';
import Header from './components/nav/Header';
import Advantage from './components/advantage/Advantage';
import Process from './components/process/Process';
import About from './components/about/About';
import Closing from './components/closing/Closing';
import Contact from './components/contact/Contact';
import Footer from './components/footer/Footer';
import DemoSection from './components/demos/DemoSection';
import HeroParallax from './components/services/HeroParallax';
import ServiceDirectory from './components/services/ServiceDirectory';
import FilamentArt from './components/hero/FilamentArt';
import { useCursorLight } from './motion/useCursorLight';
import { FiArrowRight } from 'react-icons/fi';

function Hero() {
  const ref = useRef<HTMLElement>(null);
  useCursorLight(ref);
  return (
    <section className="hero th-light" id="home" ref={ref} aria-labelledby="hero-title">
      <div className="hero__bg" data-art-root><FilamentArt /></div>
      <div className="hero__veil" aria-hidden="true" />
      <div className="hero__light" aria-hidden="true" />
      <div className="hero__stack" aria-hidden="true"><i /><ul><li>Ideas</li><li>Automation</li><li>Systems</li><li>Growth</li></ul></div>
      <div className="hero__grid">
        <div className="hero__copy">
          <p className="eyebrow hero__eyebrow">Software · AI · Automation</p>
          <h1 className="display hero__h1" id="hero-title">
            <span className="ln" style={{ ['--l' as any]: 0 }}><span>We build systems</span></span>
            <span className="ln" style={{ ['--l' as any]: 1 }}><span>that give your business</span></span>
            <span className="ln" style={{ ['--l' as any]: 2 }}><span className="copper-text">its time back.</span></span>
          </h1>
          <p className="hero__sub">MFS connects your tools, automates repetitive workflows, and builds practical AI-powered systems around the way your business actually works.</p>
          <div className="hero__cta">
            <a className="btn btn--primary" href="#services">Explore Our Services <FiArrowRight className="arrow" aria-hidden="true" /></a>
            <a className="btn" href="#contact">Discuss Your Workflow</a>
          </div>
          <ul className="hero__benefits">
            <li>Automate Repetitive Work</li><li>Connect Your Tools</li><li>Improve Operational Visibility</li><li>More Time for Real Work</li>
          </ul>
        </div>
      </div>
      <a className="hero__scroll" href="#services" aria-label="Scroll to services"><span className="cap" /><span>Scroll</span></a>
    </section>
  );
}

export default function App() {
  return (<><a className="skip" href="#main">Skip to content</a><Header /><main id="main" tabIndex={-1}><Hero /><HeroParallax /><ServiceDirectory /><DemoSection /><Advantage /><Process /><About /><Closing /><Contact /></main><Footer /></>);
}
