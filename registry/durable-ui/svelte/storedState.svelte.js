import {
  readStored,
  removeStored,
  subscribeStored,
  writeStored,
} from "../core.js";

export function createStoredState(key, fallback, options = {}) {
  let value = $state(fallback);
  let restored = $state(false);
  let syncing = false;

  function read() {
    syncing = true;
    value = readStored(key, fallback, options).value;
    syncing = false;
    restored = true;
  }

  function reset() {
    removeStored(key, options);
    syncing = true;
    value = fallback;
    syncing = false;
  }

  $effect(() => {
    read();
    return subscribeStored(key, read, options);
  });

  $effect(() => {
    if (restored && !syncing) writeStored(key, value, fallback, options);
  });

  return {
    get value() {
      return value;
    },
    set value(next) {
      value = typeof next === "function" ? next(value) : next;
    },
    get restored() {
      return restored;
    },
    reset,
  };
}
