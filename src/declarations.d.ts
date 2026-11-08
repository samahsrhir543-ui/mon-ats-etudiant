declare namespace React {
  type ReactNode = any;
  type FormEvent<T = any> = any;
  type ChangeEvent<T = any> = any;
  type MouseEvent<T = any> = any;
  type KeyboardEvent<T = any> = any;
  type DragEvent<T = any> = any;
  type FC<P = {}> = (props: P) => any;
  type Dispatch<A> = (value: A) => void;
  type SetStateAction<S> = S | ((prevState: S) => S);
  function useState<T>(initialState: T | (() => T)): [T, (newState: T | ((prevState: T) => T)) => void];
  function useEffect(effect: () => void | (() => void), deps?: any[]): void;
  function useMemo<T>(factory: () => T, deps: any[] | undefined): T;
  function useCallback<T extends (...args: any[]) => any>(callback: T, deps: any[]): T;
  function useRef<T>(initialValue?: T | null): { current: any };
  const StrictMode: any;
}

declare module 'react' {
  export = React;
}

declare module 'react-dom/client' {
  export const createRoot: any;
}
