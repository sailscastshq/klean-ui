import { useCallback, useEffect, useRef, useState } from "react";
import { readQuery, subscribeQuery, writeQuery } from "../core.js";

export function useQueryState(key, fallback = null, options = {}) {
  const timer = useRef();
  const optionsRef = useRef(options);
  const fallbackRef = useRef(fallback);
  optionsRef.current = options;
  const [value, setCurrent] = useState(fallback);

  useEffect(() => {
    const read = () =>
      setCurrent(readQuery(key, fallbackRef.current, optionsRef.current));
    read();
    const unsubscribe = subscribeQuery(key, read);
    return () => {
      clearTimeout(timer.current);
      unsubscribe();
    };
  }, [key]);

  const setValue = useCallback(
    (next) => {
      const resolved = typeof next === "function" ? next(value) : next;
      clearTimeout(timer.current);
      const commit = () => {
        writeQuery(key, resolved, fallbackRef.current, optionsRef.current);
        setCurrent(resolved);
      };
      if (optionsRef.current.debounceMs > 0) {
        timer.current = setTimeout(commit, optionsRef.current.debounceMs);
      } else commit();
    },
    [key, value],
  );

  return [value, setValue];
}
