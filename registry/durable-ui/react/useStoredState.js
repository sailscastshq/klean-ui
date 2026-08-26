import { useCallback, useEffect, useRef, useState } from "react";
import {
  readStored,
  removeStored,
  subscribeStored,
  writeStored,
} from "../core.js";

export function useStoredState(key, fallback, options = {}) {
  const [value, setValue] = useState(fallback);
  const [restored, setRestored] = useState(false);
  const syncing = useRef(false);
  const fallbackRef = useRef(fallback);
  const optionsRef = useRef(options);
  optionsRef.current = options;

  const read = useCallback(() => {
    syncing.current = true;
    setValue(readStored(key, fallbackRef.current, optionsRef.current).value);
    syncing.current = false;
    setRestored(true);
  }, [key]);

  useEffect(() => {
    read();
    return subscribeStored(key, read, optionsRef.current);
  }, [key, read]);

  useEffect(() => {
    if (restored && !syncing.current) {
      writeStored(key, value, fallbackRef.current, optionsRef.current);
    }
  }, [key, restored, value]);

  const reset = useCallback(() => {
    removeStored(key, optionsRef.current);
    syncing.current = true;
    setValue(fallbackRef.current);
    syncing.current = false;
  }, [key]);

  return [value, setValue, { reset, restored }];
}
