import { createContext, useContext } from "react";

export const FieldContext = createContext(null);

export function useFieldContext() {
  return useContext(FieldContext);
}

export function mergeDescribedBy(...values) {
  const ids = values
    .flatMap((value) => (value ? String(value).trim().split(/\s+/) : []))
    .filter(Boolean);

  return [...new Set(ids)].join(" ") || undefined;
}
