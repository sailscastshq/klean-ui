import { resolve } from "node:path";
import makeSynchronized from "make-synchronized";

const formatterCache = new Map();
const formatSource = makeSynchronized(
  new URL("./format-source-worker.js", import.meta.url),
);

export function createSourceFormatter(applicationRoot) {
  const root = resolve(applicationRoot);
  if (formatterCache.has(root)) return formatterCache.get(root);

  const sourceCache = new Map();
  const formatter = {
    format(source, targetPath) {
      const cacheKey = `${targetPath}\0${source}`;
      if (sourceCache.has(cacheKey)) return sourceCache.get(cacheKey);

      const formatted = formatSource({
        applicationRoot: root,
        source,
        targetPath,
      });
      sourceCache.set(cacheKey, formatted);
      return formatted;
    },

    equivalent(left, right, targetPath) {
      try {
        return this.format(left, targetPath) === this.format(right, targetPath);
      } catch {
        return false;
      }
    },
  };

  formatterCache.set(root, formatter);
  return formatter;
}
