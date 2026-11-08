// Split-flap board for the closing statement.
// Plays ONCE when it scrolls into view: every character flips through a few letters until it lands, the first sentence settles,
// then the second — and it stays settled (no rotating messages, no replay button). The statement is also real text for assistive
// technology (the flaps are aria-hidden). Reduced motion paints the finished statement at once.
// It reports its progress as a phase number (1 = started · 2 = first sentence landed · 3 = finished) so the surrounding
// composition can respond with light.
import { useEffect, useRef, useState } from 'react';
import { motion } from '../../motion/controller';

type Layout = { cols: number; rows: string[]; groups: number[][] };
// wide: one line per sentence · narrow (phones): each sentence wraps onto two lines so the letters stay large enough to read
const WIDE: Layout = { cols: 22, rows: ['YOU KNOW THE BUSINESS.', 'I KNOW THE CHEMISTRY.'], groups: [[0], [1]] };
const NARROW: Layout = { cols: 12, rows: ['YOU KNOW THE', 'BUSINESS.', 'I KNOW THE', 'CHEMISTRY.'], groups: [[0, 1], [2, 3]] };
export const STATEMENT = 'You know the business. I know the chemistry.';
const CHARS = ' ABCDEFGHIJKLMNOPQRSTUVWXYZ.';
const pad = (s: string, n: number) => { const k = Math.max(0, n - s.length); const l = Math.floor(k / 2); return ' '.repeat(l) + s + ' '.repeat(k - l); };

function useNarrow() {
  const mq = () => (typeof window !== 'undefined' ? window.matchMedia('(max-width: 719px)') : null);
  const [n, setN] = useState(() => !!mq()?.matches);
  useEffect(() => { const m = mq(); if (!m) return; const f = () => setN(m.matches); m.addEventListener('change', f); f(); return () => m.removeEventListener('change', f); }, []);
  return n;
}

// true split-flap: the old top half folds down, the new bottom half lands; a static old-bottom layer hides the seam
const layer = (c: HTMLElement, ch: string, part: 'top' | 'bot') => {
  const d = document.createElement('i'); d.className = `fl fl--${part}`; d.setAttribute('aria-hidden', 'true'); d.textContent = ch === ' ' ? '' : ch; c.appendChild(d); return d;
};
const flipOne = (c: HTMLSpanElement, from: string, to: string, ms: number) => {
  const oldBot = layer(c, from, 'bot'), top = layer(c, from, 'top'), bot = layer(c, to, 'bot');
  c.dataset.ch = to; let tn = Array.from(c.childNodes).find((n) => n.nodeType === 3) as Text | undefined; if (!tn) { tn = document.createTextNode(''); c.prepend(tn); } tn.data = to === ' ' ? '' : to;
  c.classList.toggle('on', to !== ' ');
  const t = top.animate([{ transform: 'rotateX(0deg)' }, { transform: 'rotateX(-90deg)' }], { duration: ms, easing: 'ease-in', fill: 'forwards' });
  bot.style.transform = 'rotateX(90deg)';
  const b = bot.animate([{ transform: 'rotateX(90deg)' }, { transform: 'rotateX(0deg)' }], { duration: ms, delay: ms, easing: 'cubic-bezier(.3,1.5,.5,1)', fill: 'forwards' });
  Promise.allSettled([t.finished, b.finished]).then(() => { oldBot.remove(); top.remove(); bot.remove(); });
};

export default function TextFlippingBoard({ onPhase }: { onPhase?: (n: number) => void }) {
  const narrow = useNarrow(); const L = narrow ? NARROW : WIDE;
  const wrap = useRef<HTMLDivElement>(null); const cells = useRef<(HTMLSpanElement | null)[]>([]);
  const finished = useRef(false); const [started, setStarted] = useState(false);

  useEffect(() => {
    const el = wrap.current; if (!el) return;
    if (motion.state.reduced || typeof IntersectionObserver === 'undefined') { setStarted(true); return; }
    const io = new IntersectionObserver((e) => { if (e[0].isIntersecting) { setStarted(true); io.disconnect(); } }, { threshold: 0.5 });
    io.observe(el); return () => io.disconnect();
  }, []);

  useEffect(() => {
    const total = L.cols * L.rows.length;
    const target = L.rows.map((r) => pad(r, L.cols)).join('');
    const paint = (txt: string) => cells.current.forEach((c, i) => { if (c) { c.textContent = txt[i] === ' ' ? '' : txt[i]; c.dataset.ch = txt[i]; c.classList.toggle('on', txt[i] !== ' '); } });
    const root = wrap.current;
    if (!started) { paint(' '.repeat(total)); return; }
    if (finished.current || motion.state.reduced) { paint(target); root?.classList.add('is-final'); finished.current = true; onPhase?.(3); return; }
    paint(' '.repeat(total)); root?.classList.remove('is-final');
    let dead = false; const timers: number[] = []; const later = (fn: () => void, ms: number) => timers.push(window.setTimeout(fn, ms));
    const flipGroup = (rowsIn: number[], done: () => void) => {
      let pending = 0;
      rowsIn.forEach((r, ri) => {
        for (let col = 0; col < L.cols; col++) {
          const i = r * L.cols + col; const c = cells.current[i]; if (!c) continue;
          const want = target[i]; let from = c.dataset.ch ?? ' '; if (want === from) continue;
          const steps = 3 + ((i * 7) % 4); const delay = col * 46 + ri * 150; pending++;
          for (let s = 0; s <= steps; s++) {
            later(() => {
              if (dead) return; const ch = s === steps ? want : CHARS[(i * 5 + s * 11 + 3) % CHARS.length];
              flipOne(c, from, ch, 70); from = ch;
              if (s === steps) later(() => { if (--pending === 0) done(); }, 160);
            }, delay + s * 170);
          }
        }
      });
      if (!pending) done();
    };
    onPhase?.(1);
    later(() => flipGroup(L.groups[0], () => {
      if (dead) return; onPhase?.(2);
      later(() => flipGroup(L.groups[1], () => { if (dead) return; finished.current = true; root?.classList.add('is-final'); onPhase?.(3); }), 800);
    }), 900);
    return () => { dead = true; timers.forEach(clearTimeout); };
  }, [started, narrow]);

  return (
    <div className="tfb" ref={wrap} aria-hidden="true">
      <div className="tfb__board" style={{ ['--cols' as any]: L.cols }} key={narrow ? 'n' : 'w'}>
        {Array.from({ length: L.cols * L.rows.length }, (_, i) => {
          const r = Math.floor(i / L.cols); const g = L.groups.findIndex((gr) => gr.includes(r));
          return <span key={i} className={`tfb__cell g${g}${r > 0 && r === L.groups[1][0] ? ' is-break' : ''}`} ref={(el: HTMLSpanElement | null) => { cells.current[i] = el; }} />;
        })}
      </div>
    </div>
  );
}
