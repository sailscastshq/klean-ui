import { clearDraft, clone, readDraft, writeDraft } from "../core.js";

export function createWizardDraft(key, defaults, options = {}) {
  const stepKeys = Object.keys(defaults);
  let currentStep = $state(1);
  let steps = $state(clone(defaults));
  let draft = $state(null);
  let restored = $state(false);
  let timer;

  function apply(saved) {
    if (!saved) return null;
    steps = merge(defaults, saved.data.steps);
    currentStep = clamp(saved.data.currentStep, stepKeys.length);
    restored = true;
    return saved.data;
  }

  function load() {
    draft = readDraft(key, {
      namespace: options.namespace || "wizard",
      ttl: options.ttl ?? 7 * 24 * 60 * 60 * 1000,
      ...options,
    });
    if (draft && options.restoreOnMount !== false) apply(draft);
    return draft;
  }

  function save() {
    draft = writeDraft(
      key,
      { currentStep, steps },
      {
        namespace: options.namespace || "wizard",
        ttl: options.ttl ?? 7 * 24 * 60 * 60 * 1000,
        isEmpty: () => false,
        ...options,
      },
    );
    return draft;
  }

  function clear() {
    clearTimeout(timer);
    clearDraft(key, { namespace: options.namespace || "wizard", ...options });
    draft = null;
    restored = false;
  }

  function goTo(step) {
    const number = typeof step === "string" ? stepKeys.indexOf(step) + 1 : step;
    currentStep = clamp(number, stepKeys.length);
  }

  function update(step, patch) {
    const name = typeof step === "number" ? stepKeys[step - 1] : step;
    if (!stepKeys.includes(name)) return;
    const next = typeof patch === "function" ? patch(steps[name]) : patch;
    steps = { ...steps, [name]: { ...steps[name], ...next } };
  }

  $effect(() => {
    load();
    return () => clearTimeout(timer);
  });

  $effect(() => {
    currentStep;
    steps;
    if (options.enabled === false || read(options.clearWhen)) return;
    clearTimeout(timer);
    timer = setTimeout(save, options.debounceMs ?? 500);
  });

  $effect(() => {
    if (read(options.clearWhen)) clear();
  });

  return {
    get canGoBack() {
      return currentStep > 1;
    },
    get canGoNext() {
      return currentStep < stepKeys.length;
    },
    clear,
    get currentStep() {
      return currentStep;
    },
    set currentStep(next) {
      goTo(next);
    },
    get currentStepKey() {
      return stepKeys[currentStep - 1];
    },
    get data() {
      return Object.assign({}, ...Object.values(steps));
    },
    get draft() {
      return draft;
    },
    goBack: () => goTo(currentStep - 1),
    goNext: () => goTo(currentStep + 1),
    goTo,
    load,
    reset() {
      clear();
      currentStep = 1;
      steps = clone(defaults);
    },
    restore: () => apply(draft),
    get restored() {
      return restored;
    },
    save,
    stepKeys,
    get steps() {
      return steps;
    },
    update,
  };
}

function read(source) {
  return typeof source === "function" ? source() : source;
}

function clamp(value, total) {
  const number = Number(value);
  return Number.isFinite(number)
    ? Math.min(Math.max(Math.trunc(number), 1), total)
    : 1;
}

function merge(defaults, saved = {}) {
  return Object.fromEntries(
    Object.entries(defaults).map(([key, value]) => [
      key,
      { ...value, ...(saved[key] || {}) },
    ]),
  );
}
