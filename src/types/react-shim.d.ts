// @types/react cannot be installed offline (npm registry is blocked in this sandbox).
// This is a deliberately small ambient declaration covering exactly the React APIs this project uses,
// so that `tsc --noEmit` can still type-check all logic modules strictly and the components structurally.
// If you run `npm i -D @types/react @types/react-dom`, delete this file.
declare module 'react' {
  export type ReactNode = any;
  export type CSSProperties = { [k: string]: any };
  export type Ref<T> = ((el: T | null) => void) | { current: T | null } | null;
  export type RefObject<T> = { current: T | null };
  export type MutableRefObject<T> = { current: T };
  export type Dispatch<A> = (v: A) => void;
  export type SetStateAction<S> = S | ((prev: S) => S);
  export type FC<P = {}> = (props: P & { children?: ReactNode }) => any;
  export type PropsWithChildren<P = {}> = P & { children?: ReactNode };
  export type KeyboardEvent<T = Element> = any;
  export type PointerEvent<T = Element> = any;
  export type MouseEvent<T = Element> = any;
  export type ChangeEvent<T = Element> = any;
  export type FormEvent<T = Element> = any;
  export type FocusEvent<T = Element> = any;
  export type TouchEvent<T = Element> = any;
  export type WheelEvent<T = Element> = any;
  export type SVGProps<T> = any;
  export interface SVGAttributes<T> { [k: string]: any }
  export interface HTMLAttributes<T> { [k: string]: any }
  export type ReactElement = any;
  export type ComponentType<P = any> = (props: P) => any;
  export function useState<S>(init: S | (() => S)): [S, Dispatch<SetStateAction<S>>];
  export function useEffect(fn: () => void | (() => void), deps?: readonly any[]): void;
  export function useLayoutEffect(fn: () => void | (() => void), deps?: readonly any[]): void;
  export function useRef<T>(init: T): MutableRefObject<T>;
  export function useRef<T>(init: T | null): RefObject<T>;
  export function useRef<T = undefined>(): MutableRefObject<T | undefined>;
  export function useMemo<T>(fn: () => T, deps: readonly any[]): T;
  export function useCallback<T extends (...a: any[]) => any>(fn: T, deps: readonly any[]): T;
  export function useReducer<S, A>(r: (s: S, a: A) => S, init: S): [S, Dispatch<A>];
  export function useId(): string;
  export function useContext<T>(c: Context<T>): T;
  export function useSyncExternalStore<T>(sub: (cb: () => void) => () => void, get: () => T, getServer?: () => T): T;
  export function memo<T>(c: T, eq?: (a: any, b: any) => boolean): T;
  export function forwardRef<T, P>(r: (props: P, ref: Ref<T>) => any): (props: P & { ref?: Ref<T> }) => any;
  export interface Context<T> { Provider: any; Consumer: any; _t?: T }
  export function createContext<T>(v: T): Context<T>;
  export function createElement(type: any, props?: any, ...children: any[]): any;
  export const Fragment: any;
  export const StrictMode: any;
  export function startTransition(fn: () => void): void;
  const React: any;
  export default React;
}
declare module 'react/jsx-runtime' { export const jsx: any; export const jsxs: any; export const Fragment: any; }
declare module 'react-dom/client' { export function createRoot(el: Element | DocumentFragment): { render(n: any): void; unmount(): void }; }
declare module 'react-dom' { export function flushSync(fn: () => void): void; export function createPortal(n: any, c: Element): any; }
declare module 'react-icons/*';
declare namespace JSX {
  interface IntrinsicElements { [tag: string]: any }
  interface IntrinsicAttributes { key?: any }
  type Element = any;
}
declare module '*.png' { const src: string; export default src; }
declare module '*.svg' { const src: string; export default src; }

declare module '*.css' { const css: string; export default css; }
