import { getContext, setContext } from "svelte";

const FIELD_CONTEXT_KEY = Symbol.for("klean-ui.field");

export function getFieldContext() {
  return getContext(FIELD_CONTEXT_KEY);
}

export function setFieldContext(context) {
  return setContext(FIELD_CONTEXT_KEY, context);
}

export function mergeDescribedBy(...values) {
  const ids = values
    .flatMap((value) => (value ? String(value).trim().split(/\s+/) : []))
    .filter(Boolean);

  return [...new Set(ids)].join(" ") || undefined;
}
