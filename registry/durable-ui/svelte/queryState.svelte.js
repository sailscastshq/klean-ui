import { readQuery, subscribeQuery, writeQuery } from "../core.js";

export function createQueryState(key, fallback = null, options = {}) {
  let value = $state(fallback);
  let timer;

  function read() {
    value = readQuery(key, fallback, options);
  }

  function set(next) {
    const resolved = typeof next === "function" ? next(value) : next;
    clearTimeout(timer);
    const commit = () => {
      writeQuery(key, resolved, fallback, options);
      value = resolved;
    };
    if (options.debounceMs > 0) timer = setTimeout(commit, options.debounceMs);
    else commit();
  }

  $effect(() => {
    read();
    const unsubscribe = subscribeQuery(key, read);
    return () => {
      clearTimeout(timer);
      unsubscribe();
    };
  });

  return {
    get value() {
      return value;
    },
    set value(next) {
      set(next);
    },
    set,
  };
}
