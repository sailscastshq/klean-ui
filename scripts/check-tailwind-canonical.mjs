import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { dirname, extname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { Scanner } from "@tailwindcss/oxide";
import { __unstable__loadDesignSystem } from "tailwindcss";

const require = createRequire(import.meta.url);
const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const sourceDirectories = ["src", "registry", "stories"];

async function loadStylesheet(id, base) {
  const path =
    id === "tailwindcss"
      ? require.resolve("tailwindcss/index.css")
      : resolve(base, id);

  return {
    path,
    base: dirname(path),
    content: await readFile(path, "utf8"),
  };
}

function position(content, offset) {
  const before = content.slice(0, offset);
  const lines = before.split("\n");
  return { line: lines.length, column: lines.at(-1).length + 1 };
}

export async function auditCanonicalClasses(
  root = projectRoot,
  {
    stylesheetRoot = root,
    sources = sourceDirectories.map((directory) => `${directory}/**/*`),
  } = {},
) {
  const css = await readFile(
    resolve(stylesheetRoot, "src/styles.css"),
    "utf8",
  );
  const designSystem = await __unstable__loadDesignSystem(css, {
    base: stylesheetRoot,
    loadStylesheet,
  });
  const scanner = new Scanner({
    sources: sources.map((pattern) => ({
      base: root,
      pattern,
      negated: false,
    })),
  });

  scanner.scan();
  const violations = [];

  for (const file of scanner.files) {
    const content = await readFile(file, "utf8");
    const extension = extname(file).slice(1);
    const candidates = scanner.getCandidatesWithPositions({
      content,
      extension,
    });

    for (const { candidate, position: offset } of candidates) {
      const canonical = designSystem.canonicalizeCandidates([candidate], {
        rem: 16,
      })[0];
      if (!canonical || canonical === candidate) continue;

      violations.push({
        file: file.slice(root.length + 1),
        ...position(content, offset),
        candidate,
        canonical,
      });
    }
  }

  return violations.sort(
    (a, b) =>
      a.file.localeCompare(b.file) ||
      a.line - b.line ||
      a.column - b.column ||
      a.candidate.localeCompare(b.candidate),
  );
}

async function main() {
  const violations = await auditCanonicalClasses();
  if (!violations.length) {
    console.log("All component Tailwind classes are canonical.");
    return;
  }

  for (const violation of violations) {
    console.error(
      `${violation.file}:${violation.line}:${violation.column} ${violation.candidate} -> ${violation.canonical}`,
    );
  }
  console.error(`Found ${violations.length} non-canonical Tailwind classes.`);
  process.exitCode = 1;
}

if (process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url) {
  await main();
}
