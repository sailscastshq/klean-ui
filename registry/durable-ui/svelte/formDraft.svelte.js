import {
  clearDraft,
  clone,
  empty,
  equal,
  readDraft,
  writeDraft,
} from "../core.js";

export function createFormDraft(key, source, options = {}) {
  let draft = $state(null);
  let restored = $state(false);
  let initial = $state(clone(read(source)));
  let timer;

  function load() {
    draft = readDraft(key, options);
    return draft;
  }

  function restore() {
    if (!draft) return null;
    const data = clone(draft.data);
    if (options.restore) options.restore(data);
    else if (source && typeof source === "object") Object.assign(source, data);
    restored = true;
    return data;
  }

  function discard() {
    clearTimeout(timer);
    clearDraft(key, options);
    draft = null;
    restored = false;
  }

  function clear() {
    discard();
    initial = clone(read(source));
  }

  function save(data = read(source)) {
    draft = writeDraft(key, strip(data, options.exclude), {
      isEmpty: options.isEmpty || empty,
      ...options,
    });
    return draft;
  }

  function guard(event) {
    if (options.guard === false || equal(read(source), initial)) return;
    event.preventDefault();
    event.returnValue = "";
  }

  $effect(() => {
    load();
    addEventListener("beforeunload", guard);
    return () => {
      clearTimeout(timer);
      removeEventListener("beforeunload", guard);
    };
  });

  $effect(() => {
    const data = read(source);
    if (options.enabled === false || read(options.clearWhen)) return;
    clearTimeout(timer);
    timer = setTimeout(() => save(data), options.debounceMs ?? 500);
  });

  $effect(() => {
    if (read(options.clearWhen)) clear();
  });

  return {
    clear,
    get dirty() {
      return !equal(read(source), initial);
    },
    discard,
    get draft() {
      return draft;
    },
    get hasDraft() {
      return Boolean(draft);
    },
    load,
    restore,
    get restored() {
      return restored;
    },
    save,
    get savedAt() {
      return draft?.savedAt ? new Date(draft.savedAt) : null;
    },
  };
}

function read(source) {
  return typeof source === "function" ? source() : source;
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
