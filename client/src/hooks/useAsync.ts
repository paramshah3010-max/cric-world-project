import { useCallback, useEffect, useState } from 'react';

interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

// Runs an async function on mount (and when deps change), tracking loading and
// error state. Handy for the demo data fetches on each page.
export function useAsync<T>(fn: () => Promise<T>, deps: unknown[] = []) {
  const [state, setState] = useState<AsyncState<T>>({ data: null, loading: true, error: null });

  const run = useCallback(() => {
    let active = true;
    setState((s) => ({ ...s, loading: true, error: null }));
    fn()
      .then((data) => active && setState({ data, loading: false, error: null }))
      .catch((err: Error) => active && setState({ data: null, loading: false, error: err.message }));
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(run, [run]);

  return state;
}
