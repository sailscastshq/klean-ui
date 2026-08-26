import { clone } from "../core.js";

export function createOptimistic(source, commit, options = {}) {
  let value = $state(clone(read(source)));
  let pending = $state(false);
  let error = $state(null);
  let operation = 0;

  $effect(() => {
    const next = read(source);
    if (!pending) value = clone(next);
  });

  async function update(next) {
    if (pending && options.concurrent !== true) return false;
    const id = ++operation;
    const previous = clone(value);
    value = typeof next === "function" ? next(value) : next;
    pending = true;
    error = null;

    try {
      const confirmed = await commit(value, previous);
      if (id !== operation) return true;
      if (confirmed !== undefined) value = clone(confirmed);
      options.onSuccess?.(value);
      return true;
    } catch (reason) {
      if (id !== operation) return false;
      value = previous;
      error = reason;
      options.onError?.(reason);
      return false;
    } finally {
      if (id === operation) pending = false;
    }
  }

  function reset(next = read(source)) {
    operation += 1;
    value = clone(next);
    pending = false;
    error = null;
  }

  return {
    get busy() {
      return pending;
    },
    get error() {
      return error;
    },
    get pending() {
      return pending;
    },
    reset,
    update,
    get value() {
      return value;
    },
  };
}

function read(source) {
  return typeof source === "function" ? source() : source;
}
