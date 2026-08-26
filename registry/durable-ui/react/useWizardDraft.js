import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { clearDraft, clone, readDraft, writeDraft } from "../core.js";

export function useWizardDraft(key, defaults, options = {}) {
  const defaultsRef = useRef(defaults);
  const stepKeys = useMemo(() => Object.keys(defaultsRef.current), []);
  const [currentStep, setCurrentStep] = useState(1);
  const [steps, setSteps] = useState(() => clone(defaultsRef.current));
  const [draft, setDraft] = useState(null);
  const [restored, setRestored] = useState(false);
  const timer = useRef();
  const optionsRef = useRef(options);
  optionsRef.current = options;

  const apply = useCallback(
    (saved) => {
      if (!saved) return null;
      setSteps(merge(defaultsRef.current, saved.data.steps));
      setCurrentStep(clamp(saved.data.currentStep, stepKeys.length));
      setRestored(true);
      return saved.data;
    },
    [stepKeys.length],
  );

  const load = useCallback(() => {
    const currentOptions = optionsRef.current;
    const saved = readDraft(key, {
      namespace: currentOptions.namespace || "wizard",
      ttl: currentOptions.ttl ?? 7 * 24 * 60 * 60 * 1000,
      ...currentOptions,
    });
    setDraft(saved);
    if (saved && currentOptions.restoreOnMount !== false) apply(saved);
    return saved;
  }, [apply, key]);

  const save = useCallback(() => {
    const currentOptions = optionsRef.current;
    const saved = writeDraft(
      key,
      { currentStep, steps },
      {
        namespace: currentOptions.namespace || "wizard",
        ttl: currentOptions.ttl ?? 7 * 24 * 60 * 60 * 1000,
        isEmpty: () => false,
        ...currentOptions,
      },
    );
    setDraft(saved);
    return saved;
  }, [currentStep, key, steps]);

  const clear = useCallback(() => {
    clearTimeout(timer.current);
    const currentOptions = optionsRef.current;
    clearDraft(key, {
      namespace: currentOptions.namespace || "wizard",
      ...currentOptions,
    });
    setDraft(null);
    setRestored(false);
  }, [key]);

  const goTo = useCallback(
    (step) => {
      const number =
        typeof step === "string" ? stepKeys.indexOf(step) + 1 : step;
      setCurrentStep(clamp(number, stepKeys.length));
    },
    [stepKeys],
  );

  const update = useCallback(
    (step, patch) => {
      const name = typeof step === "number" ? stepKeys[step - 1] : step;
      if (!stepKeys.includes(name)) return;
      setSteps((current) => {
        const next = typeof patch === "function" ? patch(current[name]) : patch;
        return { ...current, [name]: { ...current[name], ...next } };
      });
    },
    [stepKeys],
  );

  useEffect(() => {
    load();
  }, [load]);
  useEffect(() => {
    if (options.enabled === false || options.clearWhen) return;
    clearTimeout(timer.current);
    timer.current = setTimeout(save, options.debounceMs ?? 500);
    return () => clearTimeout(timer.current);
  }, [options.debounceMs, options.enabled, save]);
  useEffect(() => {
    if (options.clearWhen) clear();
  }, [clear, options.clearWhen]);

  return {
    canGoBack: currentStep > 1,
    canGoNext: currentStep < stepKeys.length,
    clear,
    currentStep,
    currentStepKey: stepKeys[currentStep - 1],
    data: Object.assign({}, ...Object.values(steps)),
    draft,
    goBack: () => goTo(currentStep - 1),
    goNext: () => goTo(currentStep + 1),
    goTo,
    load,
    reset() {
      clear();
      setCurrentStep(1);
      setSteps(clone(defaultsRef.current));
    },
    restore: () => apply(draft),
    restored,
    save,
    stepKeys,
    steps,
    update,
  };
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
