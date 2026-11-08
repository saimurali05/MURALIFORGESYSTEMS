import { useEffect, useState } from 'react';
import FloatingDock, { MobileMenu, useScrollSpy } from './FloatingDock';
import { NAV } from '../../data/services';

const LOGO = './assets/mfs-logo-dark.png';
const IDS = NAV.map((n) => n.id);

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const active = useScrollSpy(IDS);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 24);
    on(); window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, []);
  return (
    <header className={`hdr${scrolled ? ' is-scrolled' : ''}`}>
      <div className="hdr__in hdr-in">
        <a className="brand" href="#home" aria-label="Murali Forge Systems — back to top">
          <img src={LOGO} alt="Murali Forge Systems — Software · AI · Automation" width="1064" height="542" />
        </a>
        <div className="hdr__dock"><FloatingDock active={active} /></div>
        <a className="btn btn--sm hdr__cta" href="#contact">Discuss Your Workflow</a>
        <MobileMenu active={active} />
      </div>
    </header>
  );
}
