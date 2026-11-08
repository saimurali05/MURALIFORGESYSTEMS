// Small interface kit shared by the nine demo applications: window chrome, sidebar, pills, avatars, segmented control, toast.
import { useEffect, useState } from 'react';
import type { ComponentType, ReactNode } from 'react';

export interface NavItem { id: string; label: string; Icon: ComponentType<{ size?: number; 'aria-hidden'?: boolean | 'true' }> }

export function Win({ tone, app, nav, view, setView, children, right }: { tone: 'dark' | 'light'; app: string; nav: NavItem[]; view: string; setView: (v: string) => void; children: ReactNode; right?: ReactNode }) {
  return (
    <div className={`ap th-${tone}`}>
      <div className="ap__top">
        <span className="ap__dots" aria-hidden="true"><i /><i /><i /></span>
        <span className="ap__brand"><b>MFS</b> {app}</span>
        {right}
        <span className="ap__badge" title="Everything in this window is simulated sample data">Simulated · sample data</span>
      </div>
      <div className="ap__body">
        <nav className="ap__side" aria-label={`${app} sections`}>
          {nav.map(({ id, label, Icon }) => (
            <button key={id} type="button" className={view === id ? 'is-on' : ''} aria-current={view === id ? 'page' : undefined} onClick={() => setView(id)}><Icon size={17} aria-hidden="true" /><span>{label}</span></button>
          ))}
        </nav>
        <div className="ap__main" key={view}>{children}</div>
      </div>
    </div>
  );
}

export const Pill = ({ k = 'n', children }: { k?: 'ok' | 'warn' | 'err' | 'acc' | 'n' | 'info'; children: ReactNode }) => <span className={`pill pill--${k}`}>{children}</span>;
export const Av = ({ name, k = 0 }: { name: string; k?: number }) => <span className={`av av--${k % 5}`} aria-hidden="true">{name.split(' ').map((w) => w[0]).slice(0, 2).join('')}</span>;

export function Seg<T extends string>({ value, onChange, items, label }: { value: T; onChange: (v: T) => void; items: readonly T[]; label: string }) {
  return <div className="seg" role="group" aria-label={label}>{items.map((i) => <button key={i} type="button" className={value === i ? 'is-on' : ''} aria-pressed={value === i} onClick={() => onChange(i)}>{i}</button>)}</div>;
}

/** Short-lived confirmation message that sits above the interface (always labelled as a simulation). */
export function useToast(): [string | null, (m: string) => void] {
  const [t, set] = useState<string | null>(null);
  useEffect(() => { if (!t) return; const id = setTimeout(() => set(null), 2600); return () => clearTimeout(id); }, [t]);
  return [t, set];
}
export const Toast = ({ msg }: { msg: string | null }) => <div className={`ap__toast glass${msg ? ' is-on' : ''}`} role="status" aria-live="polite">{msg}</div>;

export const Panel = ({ p, title, aside, className = '', children }: { p?: string; title?: string; aside?: ReactNode; className?: string; children: ReactNode }) => (
  <section className={`pn ${className}`} data-p={p}>{title && <header className="pn__h"><h4>{title}</h4>{aside}</header>}{children}</section>
);
