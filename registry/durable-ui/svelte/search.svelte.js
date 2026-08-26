export function createSearch(source, search, options = {}) {
  let results = $state([]);
  let loading = $state(false);
  let error = $state(null);
  let searched = $state(false);
  let controller;
  let timer;

  function cancel() {
    clearTimeout(timer);
    controller?.abort();
    controller = undefined;
    loading = false;
  }

  async function run(next = normalized()) {
    cancel();
    const query = String(next ?? "").trim();
    if (query.length < (options.minLength ?? 1)) {
      results = [];
      searched = false;
      error = null;
      return [];
    }

    controller = new AbortController();
    const active = controller;
    loading = true;
    error = null;
    try {
      const found = (await search(query, { signal: active.signal })) ?? [];
      if (active !== controller) return results;
      results = found;
      searched = true;
      return results;
    } catch (reason) {
      if (reason?.name !== "AbortError" && active === controller) {
        error = reason;
        searched = true;
        options.onError?.(reason);
      }
      return results;
    } finally {
      if (active === controller) loading = false;
    }
  }

  function normalized() {
    const value = typeof source === "function" ? source() : source;
    return String(value ?? "").trim();
  }

  $effect(() => {
    const query = normalized();
    if (options.immediate === false) return cancel;
    cancel();
    timer = setTimeout(() => run(query), options.debounceMs ?? 250);
    return cancel;
  });

  return {
    cancel,
    get empty() {
      return searched && !loading && !error && results.length === 0;
    },
    get error() {
      return error;
    },
    get loading() {
      return loading;
    },
    get query() {
      return normalized();
    },
    get results() {
      return results;
    },
    run,
    get searched() {
      return searched;
    },
  };
}
