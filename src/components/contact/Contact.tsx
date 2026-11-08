// Contact: a single, focused path — book the MFS Discovery Call. No form here; the Cal.com event owns every question and the booking itself.
import { useEffect, useRef, useState } from 'react';
import { TbCalendarEvent, TbClock, TbMail } from 'react-icons/tb';
import { CONTACT } from '../../data/services';
import { Headline, Reveal } from '../../motion/reveal';
import { motion } from '../../motion/controller';
import CalEmbed from './CalEmbed';

const COVER = [
  { t: 'Your workflow', d: 'Where time is lost today and which tools are involved.' },
  { t: 'What could be connected', d: 'Which systems, integrations or automations may help — and what cannot be done.' },
  { t: 'The sensible next step', d: 'A clear view of scope and timeline before anything is agreed.' },
];

export default function Contact() {
  const [open, setOpen] = useState(false); const [mounted, setMounted] = useState(false);
  const drawer = useRef<HTMLDivElement>(null);
  useEffect(() => { const n = drawer.current; if (n) (n as any).inert = !open; }, [open]);
  const reveal = () => { setMounted(true); setOpen(true); window.setTimeout(() => drawer.current?.scrollIntoView({ behavior: motion.state.reduced ? 'auto' : 'smooth', block: 'start' }), 140); };
  const toggle = () => { if (open) setOpen(false); else reveal(); };
  // CTAs elsewhere on the page (demos, service directory) ask for the booking calendar to open
  useEffect(() => { window.addEventListener('mfs-book', reveal); return () => window.removeEventListener('mfs-book', reveal); }, []);
  return (
    <section className="sec contact th-light" id="contact" aria-labelledby="contact-title">
      <div className="wrap">
        <Reveal as="div" variant="focus" className="ct glass glass--raised th-dark" style={{ ['--g-r' as any]: '28px' }}>
          <svg className="ct__fil" viewBox="0 0 600 400" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
            <path d="M-20 330 C 120 300 180 120 320 150 S 520 330 640 60" /><path d="M-20 370 C 140 330 220 170 340 200 S 540 350 640 120" /><path d="M-20 290 C 100 270 160 80 300 110 S 500 290 640 10" />
          </svg>
          <div className="ct__grid">
            <div className="ct__copy">
              <Reveal as="p" className="eyebrow" variant="up" i={1}>Let&rsquo;s build something useful</Reveal>
              <Headline lines={['Let’s talk about what', 'your business needs.']} accent={1} className="sec-title" id="contact-title" />
              <Reveal as="p" className="sec__lead" variant="up" i={3}>Tell us where your business is facing challenges. We&rsquo;ll explore how the right systems, integrations and automation can help.</Reveal>
              <Reveal as="div" className="ct__cta" variant="up" i={4}>
                <button type="button" className="btn btn--primary btn--lg ct__btn" aria-expanded={open} aria-controls="ct-book" onClick={toggle}>
                  <TbCalendarEvent size={20} aria-hidden="true" /><span>{open ? 'Hide Booking Calendar' : 'Book an MFS Discovery Call'}</span>
                </button>
                <p className="ct__meta"><TbClock size={16} aria-hidden="true" /> 30-minute conversation. Choose a convenient time.</p>
              </Reveal>
              <Reveal as="p" className="ct__mail" variant="up" i={5}>Prefer email? <a href={`mailto:${CONTACT.email}`}><TbMail size={15} aria-hidden="true" />{CONTACT.email}</a></Reveal>
            </div>
            <Reveal as="aside" className="ct__cover" variant="up" i={3} aria-label="What the discovery call covers">
              <p className="ct__cover-h">In 30 minutes we&rsquo;ll talk through</p>
              <ol>{COVER.map((c, i) => <li key={c.t}><span className="ct__no" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span><div><h3>{c.t}</h3><p>{c.d}</p></div></li>)}</ol>
              <p className="ct__note">Booking is handled securely by Cal.com. You&rsquo;ll answer a few short questions about your business so we can prepare.</p>
            </Reveal>
          </div>
          <div className="ct__drawer" id="ct-book" data-open={open} ref={drawer} role="region" aria-label="MFS Discovery Call booking calendar">
            <div className="ct__drawer-in"><div className="ct__panel">{mounted && <CalEmbed />}</div></div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
