import { CONTACT, NAV, SERVICES } from '../../data/services';

const EXPLORE = [...NAV.slice(0, 4), { id: 'process', label: 'How MFS Works' }, ...NAV.slice(4)];

export default function Footer() {
  return (
    <footer className="ftr th-dark">
      <div className="wrap ftr__grid">
        <div className="ftr__brand">
          <a href="#home" aria-label="Murali Forge Systems — back to top"><img src="./assets/mfs-logo-dark.png" alt="Murali Forge Systems — Software · AI · Automation" width="1064" height="542" loading="lazy" /></a>
          <p>Software, AI and automation systems built around the way your business actually works.</p>
        </div>
        <nav aria-label="Footer"><h2>Explore</h2><ul>{EXPLORE.map((n) => <li key={n.id}><a href={`#${n.id}`}>{n.label}</a></li>)}</ul></nav>
        <nav aria-label="Services"><h2>Services</h2><ul>{SERVICES.map((s) => <li key={s.id}><a href={`#${s.hash}`}>{s.nav}</a></li>)}</ul></nav>
        <div><h2>Contact</h2><ul><li><a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a></li><li><a href={CONTACT.whatsapp} target="_blank" rel="noopener noreferrer">WhatsApp</a></li></ul></div>
      </div>
      <div className="wrap ftr__base"><p>© {new Date().getFullYear()} Murali Forge Systems. Demos on this site are simulations that run in your browser; nothing is sent or stored.</p></div>
    </footer>
  );
}
