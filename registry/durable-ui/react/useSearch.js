import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export function useSearch(query, search, options = {}) {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searched, setSearched] = useState(false);
  const controller = useRef();
  const timer = useRef();
  const optionsRef = useRef(options);
  const searchRef = useRef(search);
  optionsRef.current = options;
  searchRef.current = search;
  const normalized = String(query ?? "").trim();

  const cancel = useCallback(() => {
    clearTimeout(timer.current);
    controller.current?.abort();
    controller.current = undefined;
    setLoading(false);
  }, []);

  const run = useCallback(
    async (next = normalized) => {
      cancel();
      const value = String(next ?? "").trim();
      if (value.length < (optionsRef.current.minLength ?? 1)) {
        setResults([]);
        setSearched(false);
        setError(null);
        return [];
      }

      const active = new AbortController();
      controller.current = active;
      setLoading(true);
      setError(null);
      try {
        const found =
          (await searchRef.current(value, { signal: active.signal })) ?? [];
        if (controller.current !== active) return [];
        setResults(found);
        setSearched(true);
        return found;
      } catch (reason) {
        if (reason?.name !== "AbortError" && controller.current === active) {
          setError(reason);
          setSearched(true);
          optionsRef.current.onError?.(reason);
        }
        return [];
      } finally {
        if (controller.current === active) setLoading(false);
      }
    },
    [cancel, normalized],
  );

  useEffect(() => {
    if (options.immediate === false) return cancel;
    cancel();
    timer.current = setTimeout(
      () => run(normalized),
      options.debounceMs ?? 250,
    );
    return cancel;
  }, [cancel, normalized, options.debounceMs, options.immediate, run]);

  return {
    cancel,
    empty: useMemo(
      () => searched && !loading && !error && results.length === 0,
      [error, loading, results.length, searched],
    ),
    error,
    loading,
    query: normalized,
    results,
    run,
    searched,
  };
}
