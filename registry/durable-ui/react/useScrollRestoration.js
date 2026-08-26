import { useCallback, useEffect, useRef, useState } from "react";
import { readScroll, writeScroll } from "../core.js";

export function useScrollRestoration(key, options = {}) {
  const [restored, setRestored] = useState(false);
  const optionsRef = useRef(options);
  const frame = useRef();
  optionsRef.current = options;

  const target = useCallback(() => {
    const candidate =
      typeof optionsRef.current.target === "function"
        ? optionsRef.current.target()
        : optionsRef.current.target;
    return candidate?.current ?? candidate ?? window;
  }, []);

  const capture = useCallback(() => {
    const node = target();
    writeScroll(
      key,
      {
        x: node === window ? window.scrollX : node.scrollLeft,
        y: node === window ? window.scrollY : node.scrollTop,
      },
      optionsRef.current,
    );
  }, [key, target]);

  const restore = useCallback(
    function restorePosition(attempt = 0) {
      const hasHash = Boolean(location.hash);
      const hashTarget = hasHash && document.querySelector(location.hash);
      if (hashTarget) hashTarget.scrollIntoView();
      else if (hasHash && attempt < (optionsRef.current.hashAttempts ?? 60)) {
        frame.current = requestAnimationFrame(() =>
          restorePosition(attempt + 1),
        );
        return;
      } else {
        const position = readScroll(key, optionsRef.current);
        if (position) target().scrollTo(position.x, position.y);
      }
      setRestored(true);
    },
    [key, target],
  );

  useEffect(() => {
    const previous = history.scrollRestoration;
    history.scrollRestoration = "manual";
    addEventListener("pagehide", capture);
    frame.current = requestAnimationFrame(() => {
      frame.current = requestAnimationFrame(() => restore());
    });
    return () => {
      cancelAnimationFrame(frame.current);
      capture();
      removeEventListener("pagehide", capture);
      history.scrollRestoration = previous;
    };
  }, [capture, restore]);

  return { capture, restore, restored };
}
