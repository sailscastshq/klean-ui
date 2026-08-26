import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  clearDraft,
  clone,
  empty,
  equal,
  readDraft,
  writeDraft,
} from "../core.js";

export function useFormDraft(key, data, options = {}) {
  const [draft, setDraft] = useState(null);
  const [restored, setRestored] = useState(false);
  const [initial, setInitial] = useState(() => clone(data));
  const timer = useRef();
  const optionsRef = useRef(options);
  optionsRef.current = options;
  const dirty = useMemo(() => !equal(data, initial), [data, initial]);

  const load = useCallback(() => {
    const saved = readDraft(key, optionsRef.current);
    setDraft(saved);
    return saved;
  }, [key]);

  const discard = useCallback(() => {
    clearTimeout(timer.current);
    clearDraft(key, optionsRef.current);
    setDraft(null);
    setRestored(false);
  }, [key]);

  const clear = useCallback(() => {
    discard();
    setInitial(clone(data));
  }, [data, discard]);

  const save = useCallback(
    (next = data) => {
      const currentOptions = optionsRef.current;
      const saved = writeDraft(key, strip(next, currentOptions.exclude), {
        isEmpty: currentOptions.isEmpty || empty,
        ...currentOptions,
      });
      setDraft(saved);
      return saved;
    },
    [data, key],
  );

  const restore = useCallback(() => {
    if (!draft) return null;
    const next = clone(draft.data);
    optionsRef.current.onRestore?.(next);
    setRestored(true);
    return next;
  }, [draft]);

  useEffect(() => {
    load();
  }, [load]);
  useEffect(() => {
    if (options.enabled === false || options.clearWhen) return;
    clearTimeout(timer.current);
    timer.current = setTimeout(() => save(data), options.debounceMs ?? 500);
    return () => clearTimeout(timer.current);
  }, [data, options.debounceMs, options.enabled, save]);
  useEffect(() => {
    if (options.clearWhen) clear();
  }, [clear, options.clearWhen]);
  useEffect(() => {
    function guard(event) {
      if (options.guard === false || !dirty) return;
      event.preventDefault();
      event.returnValue = "";
    }
    addEventListener("beforeunload", guard);
    return () => removeEventListener("beforeunload", guard);
  }, [dirty, options.guard]);

  return {
    clear,
    dirty,
    discard,
    draft,
    hasDraft: Boolean(draft),
    load,
    restore,
    restored,
    save,
    savedAt: draft?.savedAt ? new Date(draft.savedAt) : null,
  };
}

function strip(data, excluded = []) {
  const blocked = new Set(excluded);
  return Object.fromEntries(
    Object.entries(clone(data)).filter(
      ([key, value]) =>
        !blocked.has(key) &&
        !(typeof File !== "undefined" && value instanceof File) &&
        !(typeof Blob !== "undefined" && value instanceof Blob),
    ),
  );
}
