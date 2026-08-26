import { useCallback, useEffect, useRef, useState } from "react";
import { clone } from "../core.js";

export function useOptimistic(source, commit, options = {}) {
  const [value, setValue] = useState(() => clone(source));
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(null);
  const operation = useRef(0);
  const current = useRef(value);
  const optionsRef = useRef(options);
  const commitRef = useRef(commit);
  optionsRef.current = options;
  commitRef.current = commit;
  current.current = value;

  useEffect(() => {
    if (!pending) setValue(clone(source));
  }, [pending, source]);

  const update = useCallback(
    async (next) => {
      if (pending && optionsRef.current.concurrent !== true) return false;
      const id = ++operation.current;
      const previous = clone(current.current);
      const optimistic =
        typeof next === "function" ? next(current.current) : next;
      setValue(optimistic);
      setPending(true);
      setError(null);

      try {
        const confirmed = await commitRef.current(optimistic, previous);
        if (id !== operation.current) return true;
        if (confirmed !== undefined) setValue(clone(confirmed));
        optionsRef.current.onSuccess?.(confirmed ?? optimistic);
        return true;
      } catch (reason) {
        if (id !== operation.current) return false;
        setValue(previous);
        setError(reason);
        optionsRef.current.onError?.(reason);
        return false;
      } finally {
        if (id === operation.current) setPending(false);
      }
    },
    [pending],
  );

  const reset = useCallback(
    (next = source) => {
      operation.current += 1;
      setValue(clone(next));
      setPending(false);
      setError(null);
    },
    [source],
  );

  return { busy: pending, error, pending, reset, update, value };
}
