import { useEffect, useMemo, useRef } from 'react';
import { motion } from '../../motion/controller';
import { ART_H, ART_W, FOCAL, FilamentModel, RIDE, GRADS, SAMPLES, computeView, mulberry32, smoothPathD, type Tone } from './filament';

const TONE_COLOR: Record<Tone, string> = { copper: '#B08C55', champagne: '#B99865', steel: '#8C8173' };
const GAIN = 0.62; // strands are drawn as ink on ivory (normal compositing): keep stacked fibres from filling in
const STATIC_T = 7.5; // calm still composition used for reduced-motion

/** vertical guides (reference x positions) */
const GUIDES = [
  { x: 295, o: 0.95, w: 1.2, glow: true, end: undefined as number | undefined }, { x: 309, o: 0.55, w: 0.8, glow: false, end: undefined as number | undefined },
  { x: 165, o: 0.55, w: 0.8, glow: false, end: 122 }, { x: 80, o: 0.36, w: 0.7, glow: false, end: undefined as number | undefined },
  { x: 105, o: 0.18, w: 0.6, glow: false, end: undefined as number | undefined }, { x: 273, o: 0.16, w: 0.6, glow: false, end: undefined as number | undefined },
];
const SPARKS = [
  { x: 295, y: 308, r: 0.5 }, { x: 309, y: 95, r: 0.45 }, { x: 80, y: 180, r: 0.4 },
  { x: 80, y: 310, r: 0.45 }, { x: 273, y: 272, r: 0.35 }, { x: 165, y: 120, r: 0.4 }, { x: 556, y: 22, r: 0.3 },
];
/** small geometric nodes traced from the reference [x, y, radius, tone, filled] */
const NODES: [number, number, number, Tone, boolean][] = [
  [132, 69, 7, 'copper', false], [110, 97, 8, 'steel', false], [143, 139, 6, 'champagne', true], [36, 144, 7, 'copper', false],
  [75, 159, 3, 'copper', true], [59, 225, 9, 'steel', false], [116, 220, 5, 'copper', true], [168, 248, 5, 'copper', false],
  [194, 170, 3, 'copper', true], [160, 119, 3, 'copper', false], [33, 97, 2.5, 'copper', true], [409, 247, 8, 'steel', false],
  [603, 203, 6, 'copper', false], [621, 194, 3, 'steel', true], [375, 257, 3, 'copper', true], [416, 266, 3, 'copper', true],
  [482, 272, 3, 'steel', true], [503, 301, 3.5, 'copper', true], [477, 314, 4, 'champagne', true], [507, 281, 2.5, 'steel', true],
];
const hexPts = (r: number) => Array.from({ length: 6 }, (_, i) => `${(Math.cos((Math.PI / 3) * i + Math.PI / 6) * r).toFixed(2)},${(Math.sin((Math.PI / 3) * i + Math.PI / 6) * r).toFixed(2)}`).join(' ');
const rgba = (hex: string, a: number) => { const n = parseInt(hex.slice(1), 16); return `rgba(${n >> 16},${(n >> 8) & 255},${n & 255},${a})`; };

export default function FilamentArt({ refMode = false }: { refMode?: boolean }) {
  const root = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const density = useMemo(() => {
    if (refMode || typeof window === 'undefined') return 1;
    if (window.innerWidth < 760 || window.matchMedia('(pointer: coarse)').matches) return 0.55;
    // the art is scaled up on tall/large viewports; add fibres so the silk keeps its density without ever thickening a line
    const s = window.innerHeight / 392;
    return Math.max(0.9, Math.min(1.6, 0.85 + (s - 1) * 0.7));
  }, [refMode]);
  const model = useMemo(() => new FilamentModel(density), [density]);
  const arcA = useMemo(() => smoothPathD([[352, 243], [344, 232], [358, 222], [370, 205], [376, 180], [388, 140], [414, 98], [452, 62], [500, 36], [556, 14], [612, 0], [650, -8]]), []);

  useEffect(() => {
    const el = root.current!, svg = svgRef.current!, canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    let view = computeView(el.clientWidth || ART_W, el.clientHeight || ART_H, refMode);
    let dpr = Math.min(refMode ? 1 : 1.75, window.devicePixelRatio || 1);

    // gradients live in art space, so they are created once and survive any resize
    const grads: Record<string, Record<string, CanvasGradient>> = {};
    for (const [fam, tones] of Object.entries(GRADS)) {
      grads[fam] = {};
      for (const [tone, stops] of Object.entries(tones)) {
        const g = ctx.createLinearGradient(0, 0, ART_W, 0);
        for (const [o, c, a] of stops) g.addColorStop(o, rgba(c, a));
        grads[fam][tone] = g;
      }
    }

    // ---------- particles (all hug the strands) ----------
    const rnd = mulberry32(77);
    function mk(color: string) {
      const c = document.createElement('canvas'); c.width = c.height = 48; const g = c.getContext('2d')!;
      const gr = g.createRadialGradient(24, 24, 0, 24, 24, 24);
      gr.addColorStop(0, color); gr.addColorStop(0.2, color); gr.addColorStop(0.5, color + '55'); gr.addColorStop(1, color + '00');
      g.fillStyle = gr; g.fillRect(0, 0, 48, 48); return c;
    }
    const sprites: Record<Tone, HTMLCanvasElement> = { copper: mk('#B08C55'), champagne: mk('#B99865'), steel: mk('#6E716B') };
    const all = model.strands.map((_, i) => i);
    const main = all.filter((i) => model.strands[i].bundle.count > 4 && !model.strands[i].spray);
    const sprayIdx = all.filter((i) => model.strands[i].spray);
    const webIdx = all.filter((i) => model.strands[i].bundle.count <= 4);
    const pick = (a: number[]) => a[Math.floor(rnd() * a.length)];
    const riders = Array.from({ length: Math.round(54 * density) }, () => { const i = pick(main); return { i, u: rnd(), v: 0.012 + rnd() * 0.03, size: 0.8 + rnd() * 1.4, a: 0.4 + rnd() * 0.5, ph: rnd() * 6.28 }; });
    const beads = Array.from({ length: Math.round(34 * density) }, () => { const i = pick(webIdx); return { i, u: rnd(), v: 0.006 + rnd() * 0.012, size: 0.9 + rnd() * 1.3, a: 0.5 + rnd() * 0.5, ph: rnd() * 6.28 }; });
    const sprayBeads = Array.from({ length: Math.round(70 * density) }, () => { const i = pick(sprayIdx.length ? sprayIdx : main); return { i, u: 0.1 + rnd() * 0.85, v: 0.004 + rnd() * 0.01, size: 0.55 + rnd() * 1.1, a: 0.5 + rnd() * 0.5, ph: rnd() * 6.28 }; });
    // sparse ambient motes: tiny copper/steel points that drift very slowly through the empty field (kept off the headline zone by the veil)
    const motes = Array.from({ length: Math.round(150 * density) }, () => {
      const right = rnd() < 0.42;
      return { x: right ? 330 + rnd() * 300 : -20 + rnd() * 260, y: right ? 120 + rnd() * 230 : 20 + rnd() * 330, size: 0.4 + rnd() * 0.9, a: 0.18 + rnd() * 0.5, ph: rnd() * 6.28, w: 0.12 + rnd() * 0.3, steel: rnd() < 0.25 };
    });
    const dust = Array.from({ length: Math.round(380 * density) }, () => {
      const left = rnd() < 0.58; const i = left && sprayIdx.length ? pick(sprayIdx) : pick(main);
      return { i, u: left ? 0.3 + rnd() * 0.7 : 0.1 + rnd() * 0.9, off: (rnd() - 0.5) * (left ? 96 : 74), size: 0.4 + rnd() * 0.85, a: 0.25 + rnd() * 0.6, ph: rnd() * 6.28, w: 0.2 + rnd() * 0.5 };
    });
    const tmp = { x: 0, y: 0 };

    let reducedStatic = false;
    let lastDraw = -1;
    function applyView() {
      const w = el.clientWidth, h = el.clientHeight;
      if (!w || !h) return;
      view = computeView(w, h, refMode);
      dpr = Math.min(refMode ? 1 : 1.75, window.devicePixelRatio || 1);
      svg.setAttribute('viewBox', `${view.x0} ${view.y0} ${w / view.s} ${h / view.s}`);
      canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
      canvas.style.width = w + 'px'; canvas.style.height = h + 'px';
      const host = (el.closest('[data-art-root]') as HTMLElement) || el;
      host.style.setProperty('--art-s', String(view.s));
      host.style.setProperty('--art-x0', String(view.x0));
      host.style.setProperty('--art-y0', String(view.y0));
      host.dataset.artMode = view.mode;
      lastDraw = -1; draw(reducedStatic ? STATIC_T : motion.state.t);
    }

    function draw(t: number) {
      model.update(t);
      const k = view.s * dpr;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.globalCompositeOperation = 'source-over';
      ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      // art-space transform: line widths are expressed in css px / scale so every fibre stays a hairline at any size
      ctx.setTransform(k, 0, 0, k, -view.x0 * k, -view.y0 * k);
      const inv = 1 / view.s;
      const shimmerBase = 0.88 + 0.12 * Math.sin(t * 1.1);
      for (const st of model.strands) {
        const p = st.pts;
        ctx.strokeStyle = grads[st.bundle.grad][st.tone];
        ctx.lineWidth = st.width * inv;
        const a = st.opacity * shimmerBase * (0.82 + 0.18 * Math.sin(t * 1.5 + st.psi)) * (st.fade || st.bundle.count <= 4 ? 1 : GAIN * (st.tone === 'steel' ? 0.9 : 1.2) * (st.bundle.id === 'L' ? 1.55 : st.bundle.id === 'R1' && st.tone === 'copper' ? 1.4 : 1));
        if (st.fade) {
          // spray: three tapering runs (alpha falls off towards the free end)
          const cuts = [0, 14, 27, SAMPLES - 1];
          for (let c = 0; c < 3; c++) {
            ctx.globalAlpha = a * (c === 0 ? 1 : c === 1 ? 0.55 : 0.22);
            ctx.beginPath(); ctx.moveTo(p[2 * cuts[c]], p[2 * cuts[c] + 1]);
            for (let q = cuts[c] + 1; q <= cuts[c + 1]; q++) ctx.lineTo(p[2 * q], p[2 * q + 1]);
            ctx.stroke();
          }
          continue;
        }
        ctx.globalAlpha = a;
        ctx.beginPath(); ctx.moveTo(p[0], p[1]);
        for (let q = 1; q < SAMPLES - 1; q++) ctx.quadraticCurveTo(p[2 * q], p[2 * q + 1], (p[2 * q] + p[2 * q + 2]) / 2, (p[2 * q + 1] + p[2 * q + 3]) / 2);
        ctx.lineTo(p[2 * SAMPLES - 2], p[2 * SAMPLES - 1]);
        ctx.stroke();
      }
      // travelling highlights: a short, brighter run of one fibre that slides along it and fades at both ends
      for (const st of model.strands) {
        if (!st.hl) continue;
        const ph = (st.hlPhase + (reducedStatic ? 0 : t * st.hlSpeed * RIDE)) % 1;
        const fade = Math.pow(Math.sin(Math.PI * ph), 0.7);
        const a0 = Math.max(0, Math.floor((ph - 0.16) * (SAMPLES - 1))), a1 = Math.min(SAMPLES - 1, Math.ceil(ph * (SAMPLES - 1)));
        if (a1 - a0 < 1) continue;
        ctx.strokeStyle = st.tone === 'steel' ? '#B08C55' : '#9C7A45';
        ctx.lineWidth = 1.25 * inv; ctx.globalAlpha = 0.85 * fade;
        ctx.beginPath(); ctx.moveTo(st.pts[2 * a0], st.pts[2 * a0 + 1]);
        for (let q = a0 + 1; q <= a1; q++) ctx.lineTo(st.pts[2 * q], st.pts[2 * q + 1]);
        ctx.stroke();
      }
      // sprites in device pixels
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      const px = (x: number) => (x - view.x0) * k, py = (y: number) => (y - view.y0) * k;
      for (const r of riders) {
        const st = model.strands[r.i];
        const u = (r.u + (reducedStatic ? 0 : t * r.v * RIDE)) % 1;
        model.at(st, u, tmp);
        const fade = Math.sin(Math.PI * u) ** 0.8, tw = 0.75 + 0.25 * Math.sin(t * 1.3 + r.ph);
        ctx.globalAlpha = r.a * fade * tw;
        const sz = r.size * 5.2 * dpr;
        ctx.drawImage(sprites[st.tone], px(tmp.x) - sz / 2, py(tmp.y) - sz / 2, sz, sz);
      }
      for (const b of beads) {
        const st = model.strands[b.i];
        const u = (b.u + (reducedStatic ? 0 : t * b.v * RIDE)) % 1;
        model.at(st, u, tmp);
        ctx.globalAlpha = b.a * Math.sin(Math.PI * u) ** 0.6 * (0.8 + 0.2 * Math.sin(t * 1.1 + b.ph));
        const sz = b.size * 5.4 * dpr;
        ctx.drawImage(sprites.copper, px(tmp.x) - sz / 2, py(tmp.y) - sz / 2, sz, sz);
      }
      for (const b of sprayBeads) {
        const st = model.strands[b.i];
        const u = (b.u + (reducedStatic ? 0 : t * b.v * RIDE)) % 1;
        model.at(st, u, tmp);
        ctx.globalAlpha = b.a * (1 - u * 0.7) * (0.75 + 0.25 * Math.sin(t * 1.4 + b.ph));
        const sz = b.size * 5 * dpr;
        ctx.drawImage(sprites.copper, px(tmp.x) - sz / 2, py(tmp.y) - sz / 2, sz, sz);
      }
      for (const m of motes) {
        const x = m.x + Math.sin(t * m.w + m.ph) * 3.5, y = m.y + Math.cos(t * m.w * 0.8 + m.ph * 1.3) * 3;
        ctx.globalAlpha = m.a * (0.55 + 0.45 * Math.sin(t * 0.8 + m.ph));
        const sz = m.size * 4 * dpr;
        ctx.drawImage(m.steel ? sprites.steel : sprites.copper, px(x) - sz / 2, py(y) - sz / 2, sz, sz);
      }
      for (const d of dust) {
        const st = model.strands[d.i];
        model.at(st, d.u, tmp);
        const x = tmp.x + Math.sin(t * d.w + d.ph) * 2.2 + d.off * 0.5, y = tmp.y + Math.cos(t * d.w * 0.8 + d.ph) * 2 + d.off * 0.4;
        ctx.globalAlpha = d.a * (0.6 + 0.4 * Math.sin(t * 0.9 + d.ph));
        const sz = d.size * 4.2 * dpr;
        ctx.drawImage(sprites[st.tone === 'steel' && d.ph < 3 ? 'steel' : 'copper'], px(x) - sz / 2, py(y) - sz / 2, sz, sz);
      }
      ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
      lastDraw = t;
    }

    // parallax layers (damped pointer + gentle scroll) — only transform changes, no layout
    const wrapA = svg.parentElement as HTMLElement, wrapB = canvas;
    function tick(s: typeof motion.state) {
      if (s.reduced) {
        if (!reducedStatic || lastDraw < 0) { reducedStatic = true; draw(STATIC_T); }
        wrapA.style.transform = ''; wrapB.style.transform = '';
        return;
      }
      reducedStatic = false;
      if (s.t - lastDraw >= 1 / 36 || lastDraw < 0) draw(s.t);
      const touchless = !s.touch;
      const scroll = Math.min(s.scrollY, s.vh * 1.2);
      const pxv = touchless && !refMode ? s.nx : 0, pyv = touchless && !refMode ? s.ny : 0;
      wrapA.style.transform = `translate3d(${(-pxv * 5).toFixed(2)}px,${(-pyv * 3 + scroll * 0.05).toFixed(2)}px,0) scale(1.012)`;
      wrapB.style.transform = `translate3d(${(-pxv * 9).toFixed(2)}px,${(-pyv * 6 + scroll * 0.09).toFixed(2)}px,0) scale(1.012)`;
    }

    const ro = new ResizeObserver(applyView); ro.observe(el);
    applyView();
    const unsub = motion.subscribe(tick, el);
    const unRed = motion.onReducedChange(() => { lastDraw = -1; });
    return () => { unsub(); unRed(); ro.disconnect(); };
  }, [model, refMode, density]);

  return (
    <div className={`fa${refMode ? ' fa--ref' : ''}`} ref={root} aria-hidden="true">
      <div className="fa__layer">
        <svg ref={svgRef} className="fa__svg" viewBox={`0 0 ${ART_W} ${ART_H}`} preserveAspectRatio="xMinYMin slice" focusable="false">
          <defs>
            <linearGradient id="g-guide" gradientUnits="userSpaceOnUse" x1="0" y1="-10" x2="0" y2="400">
              <stop offset="0" stopColor="#B08C55" stopOpacity="0.1" /><stop offset="0.5" stopColor="#C6A872" stopOpacity="0.95" />
              <stop offset="1" stopColor="#B08C55" stopOpacity="0.65" />
            </linearGradient>
            <linearGradient id="g-guide-soft" gradientUnits="userSpaceOnUse" x1="0" y1="-10" x2="0" y2="400">
              <stop offset="0" stopColor="#B08C55" stopOpacity="0" /><stop offset="0.45" stopColor="#B08C55" stopOpacity="0.8" /><stop offset="1" stopColor="#B08C55" stopOpacity="0.25" />
            </linearGradient>
            <linearGradient id="g-arc" gradientUnits="userSpaceOnUse" x1="340" y1="240" x2="640" y2="-8">
              <stop offset="0" stopColor="#B08C55" stopOpacity="0.85" /><stop offset="0.7" stopColor="#B08C55" stopOpacity="0.55" /><stop offset="1" stopColor="#B08C55" stopOpacity="0" />
            </linearGradient>
            <radialGradient id="g-flare"><stop offset="0" stopColor="#FFF4E8" stopOpacity="1" /><stop offset="0.12" stopColor="#B99865" stopOpacity="0.85" /><stop offset="0.4" stopColor="#B08C55" stopOpacity="0.28" /><stop offset="1" stopColor="#B08C55" stopOpacity="0" /></radialGradient>
            <radialGradient id="g-spark"><stop offset="0" stopColor="#FFF4E8" stopOpacity="1" /><stop offset="0.25" stopColor="#C6A872" stopOpacity="0.55" /><stop offset="1" stopColor="#B08C55" stopOpacity="0" /></radialGradient>
            <radialGradient id="g-haze"><stop offset="0" stopColor="#B08C55" stopOpacity="0.075" /><stop offset="1" stopColor="#B08C55" stopOpacity="0" /></radialGradient>
            <radialGradient id="g-haze-steel"><stop offset="0" stopColor="#8C8173" stopOpacity="0.05" /><stop offset="1" stopColor="#8C8173" stopOpacity="0" /></radialGradient>
            <linearGradient id="g-floor" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#E8E1D6" stopOpacity="0" /><stop offset="0.12" stopColor="#E8E1D6" stopOpacity="0.55" /><stop offset="1" stopColor="#DDD5C8" stopOpacity="0.95" /></linearGradient>
            <linearGradient id="g-floorline" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#B08C55" stopOpacity="0" /><stop offset="0.4" stopColor="#B99865" stopOpacity="0.4" /><stop offset="0.6" stopColor="#B08C55" stopOpacity="0.2" /><stop offset="1" stopColor="#B08C55" stopOpacity="0" /></linearGradient>
          </defs>

          {/* ambient atmosphere (slow breathing light) */}
          <g className="fa-ambient">
            <ellipse cx="295" cy="214" rx="150" ry="70" fill="url(#g-haze)" className="fa-breathe" />
            <ellipse cx="505" cy="205" rx="110" ry="85" fill="url(#g-haze)" className="fa-breathe fa-breathe--b" opacity="0.8" />
            <ellipse cx="450" cy="300" rx="150" ry="60" fill="url(#g-haze-steel)" className="fa-breathe fa-breathe--c" />
            <ellipse cx="120" cy="140" rx="90" ry="70" fill="url(#g-haze)" className="fa-breathe fa-breathe--c" opacity="0.55" />
            <ellipse cx="478" cy="108" rx="15" ry="13" fill="url(#g-haze)" className="fa-breathe fa-breathe--b" opacity="1.6" />
            <ellipse cx="44" cy="338" rx="12" ry="11" fill="url(#g-haze)" className="fa-breathe fa-breathe--c" opacity="1.2" />
          </g>

          {/* floor + reflection */}
          <rect x="-300" y="362" width="1300" height="80" fill="url(#g-floor)" />
          <rect x="-300" y="362" width="1300" height="0.7" fill="url(#g-floorline)" opacity="0.7" />
          <ellipse cx="295" cy="366" rx="70" ry="3" fill="url(#g-haze)" opacity="0.7" />

          {/* architectural vertical guides */}
          <g className="fa-guides" fill="none">
            {GUIDES.map((g) => (
              <g key={g.x}>
                {g.glow && <line x1={g.x} y1="-10" x2={g.x} y2="400" stroke="url(#g-guide-soft)" strokeWidth="6" opacity="0.13" vectorEffect="non-scaling-stroke" />}
                <line x1={g.x} y1="-10" x2={g.x} y2={g.end ?? 400} stroke="url(#g-guide)" strokeWidth={g.w} opacity={g.o} vectorEffect="non-scaling-stroke" />
              </g>
            ))}
            {/* a slow light travelling down the primary guide */}
            <line x1="295" y1="-10" x2="295" y2="400" stroke="#B99865" strokeWidth="1.4" pathLength="100" strokeDasharray="4 96" className="fa-guide-run" vectorEffect="non-scaling-stroke" />
          </g>

          {/* orbital rings & arcs (slow, restrained) */}
          <g fill="none" className="fa-orbits">
            <g className="fa-rot fa-rot--a" style={{ transformOrigin: '320px 205px' }}>
              <circle cx="320" cy="205" r="175" stroke="#8C8173" strokeOpacity="0.1" strokeWidth="0.8" vectorEffect="non-scaling-stroke" />
              <circle cx="320" cy="205" r="175" stroke="#B08C55" strokeOpacity="0.5" strokeWidth="0.9" strokeDasharray="70 1030" vectorEffect="non-scaling-stroke" />
              <circle cx="495" cy="205" r="2" fill="#B99865" opacity="0.85" />
              <circle cx="320" cy="30" r="1.4" fill="#8C8173" opacity="0.7" />
            </g>
            <g className="fa-rot fa-rot--b" style={{ transformOrigin: '295px 214px' }}>
              <circle cx="295" cy="214" r="118" stroke="#8C8173" strokeOpacity="0.09" strokeWidth="0.7" vectorEffect="non-scaling-stroke" />
              <circle cx="295" cy="214" r="118" stroke="#B99865" strokeOpacity="0.4" strokeWidth="0.8" strokeDasharray="34 708" vectorEffect="non-scaling-stroke" />
              <circle cx="413" cy="214" r="1.6" fill="#B99865" opacity="0.8" />
            </g>
            <g className="fa-rot fa-rot--c" style={{ transformOrigin: '215px 150px' }}>
              <circle cx="215" cy="150" r="64" stroke="#8C8173" strokeOpacity="0.07" strokeWidth="0.7" vectorEffect="non-scaling-stroke" />
              <circle cx="279" cy="150" r="1.3" fill="#B08C55" opacity="0.7" />
            </g>
            <path d={arcA} stroke="url(#g-arc)" strokeWidth="0.9" vectorEffect="non-scaling-stroke" />
            <path d={arcA} stroke="#B99865" strokeWidth="1.2" pathLength="100" strokeDasharray="7 93" strokeOpacity="0.8" vectorEffect="non-scaling-stroke" className="fa-arcA" />
          </g>

          {/* geometric nodes */}
          <g className="fa-nodes">
            {NODES.map(([x, y, r, tone, filled], i) => (
              <g key={i} transform={`translate(${x} ${y})`}>
                <g className="fa-node" style={{ animationDuration: `${7 + (i % 5) * 1.6}s, ${70 + (i % 4) * 25}s`, animationDelay: `${-i * 0.9}s, ${-i * 7}s` }}>
                  <polygon points={hexPts(r)} fill={TONE_COLOR[tone]} fillOpacity={filled ? 0.38 : 0.05} stroke={TONE_COLOR[tone]} strokeOpacity={0.85} strokeWidth="0.8" vectorEffect="non-scaling-stroke" strokeLinejoin="round" />
                  {r >= 5 && <path d={`M0 0L${(Math.cos(Math.PI / 6) * r).toFixed(2)} ${(Math.sin(Math.PI / 6) * r).toFixed(2)}M0 0L${(Math.cos(Math.PI * 5 / 6) * r).toFixed(2)} ${(Math.sin(Math.PI * 5 / 6) * r).toFixed(2)}M0 0L0 ${-r}`} stroke={TONE_COLOR[tone]} strokeOpacity="0.5" strokeWidth="0.6" vectorEffect="non-scaling-stroke" fill="none" />}
                </g>
              </g>
            ))}
          </g>

          {/* sparkles + focal flare */}
          <g className="fa-sparks">
            {SPARKS.map((p, i) => (
              <g key={i} transform={`translate(${p.x} ${p.y})`} className="fa-twinkle" style={{ animationDelay: `${-i * 1.3}s`, animationDuration: `${4 + (i % 3)}s` }}>
                <circle r={p.r * 11} fill="url(#g-spark)" opacity="0.7" />
                <path d={`M${-p.r * 15} 0H${p.r * 15}M0 ${-p.r * 15}V${p.r * 15}`} stroke="#343A3A" strokeOpacity="0.55" strokeWidth="0.7" vectorEffect="non-scaling-stroke" />
              </g>
            ))}
            <g transform={`translate(${FOCAL.x} ${FOCAL.y})`}>
              <circle r="17" fill="url(#g-flare)" className="fa-breathe fa-breathe--flare" />
              <path d="M-46 0H46M0 -9V9" stroke="#343A3A" strokeOpacity="0.6" strokeWidth="0.8" vectorEffect="non-scaling-stroke" />
            </g>
          </g>
        </svg>
      </div>
      <canvas ref={canvasRef} className="fa__canvas" />
    </div>
  );
}
