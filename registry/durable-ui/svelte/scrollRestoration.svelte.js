import { readScroll, writeScroll } from "../core.js";

export function createScrollRestoration(key, options = {}) {
  let restored = $state(false);
  let frame;

  function target() {
    const candidate =
      typeof options.target === "function" ? options.target() : options.target;
    return candidate ?? window;
  }

  function capture() {
    const node = target();
    writeScroll(
      key,
      {
        x: node === window ? window.scrollX : node.scrollLeft,
        y: node === window ? window.scrollY : node.scrollTop,
      },
      options,
    );
  }

  function restore(attempt = 0) {
    const hasHash = Boolean(location.hash);
    const hashTarget = hasHash && document.querySelector(location.hash);
    if (hashTarget) hashTarget.scrollIntoView();
    else if (hasHash && attempt < (options.hashAttempts ?? 60)) {
      frame = requestAnimationFrame(() => restore(attempt + 1));
      return;
    } else {
      const position = readScroll(key, options);
      if (position) target().scrollTo(position.x, position.y);
    }
    restored = true;
  }

  $effect(() => {
    const previous = history.scrollRestoration;
    history.scrollRestoration = "manual";
    addEventListener("pagehide", capture);
    frame = requestAnimationFrame(() => {
      frame = requestAnimationFrame(() => restore());
    });
    return () => {
      cancelAnimationFrame(frame);
      capture();
      removeEventListener("pagehide", capture);
      history.scrollRestoration = previous;
    };
  });

  return {
    capture,
    restore,
    get restored() {
      return restored;
    },
  };
}
