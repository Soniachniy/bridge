import { DependencyList, useCallback, useEffect, useRef } from "react";

export type UseTimeoutFnReturn = [() => boolean | null, () => void, () => void];

export const useTimeoutFn = (
  fn: () => void,
  ms: number = 0
): UseTimeoutFnReturn => {
  const ready = useRef<boolean | null>(false);
  const timeout = useRef<ReturnType<typeof setTimeout>>(undefined);
  const callback = useRef(fn);

  const isReady = useCallback(() => ready.current, []);

  const set = useCallback(() => {
    ready.current = false;
    timeout.current && clearTimeout(timeout.current);

    timeout.current = setTimeout(() => {
      ready.current = true;
      callback.current();
    }, ms);
  }, [ms]);

  const clear = useCallback(() => {
    ready.current = null;
    timeout.current && clearTimeout(timeout.current);
  }, []);

  // update ref when function changes
  useEffect(() => {
    callback.current = fn;
  }, [fn]);

  // set on mount, clear on unmount
  useEffect(() => {
    set();

    return clear;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ms]);

  return [isReady, clear, set];
};

export type UseDebounceReturn = [() => boolean | null, () => void];

export const useDebounce = (
  fn: () => void,
  ms: number = 0,
  deps: DependencyList = []
): UseDebounceReturn => {
  const [isReady, cancel, reset] = useTimeoutFn(fn, ms);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(reset, deps);

  return [isReady, cancel];
};
