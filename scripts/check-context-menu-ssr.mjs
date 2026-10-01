import {
  mkdtempSync,
  readFileSync,
  writeFileSync,
  mkdirSync,
  symlinkSync,
  rmSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import ts from "typescript";
import { compile } from "svelte/compiler";
import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { render } from "svelte/server";
import assert from "node:assert/strict";

// Run outside browser/test DOM globals: importing or SSR must not touch document.
assert.equal(typeof document, "undefined");
const temporary = mkdtempSync(join(tmpdir(), "klean-context-ssr-"));
try {
  symlinkSync(resolve("node_modules"), join(temporary, "node_modules"));
  for (const [framework, extension] of [
    ["react", "jsx"],
    ["svelte", "svelte"],
  ]) {
    for (const [item, name] of [
      ["popover", "Popover"],
      ["menu", "Menu"],
      ["context-menu", "ContextMenu"],
    ]) {
      const filename = `registry/${item}/${framework}/${name}.${extension}`;
      const source = readFileSync(filename, "utf8");
      const code =
        framework === "react"
          ? ts.transpileModule(source, {
              fileName: filename,
              compilerOptions: {
                allowJs: true,
                jsx: ts.JsxEmit.ReactJSX,
                module: ts.ModuleKind.ESNext,
                target: ts.ScriptTarget.ES2022,
              },
            }).outputText
          : compile(source, { filename, generate: "server" }).js.code;
      const destination = join(temporary, framework, item);
      mkdirSync(destination, { recursive: true });
      writeFileSync(
        join(destination, `${name}.mjs`),
        code.replaceAll(`.${extension}"`, '.mjs"'),
      );
    }
    const { default: ContextMenu } = await import(
      pathToFileURL(join(temporary, framework, "context-menu/ContextMenu.mjs"))
    );
    const html =
      framework === "react"
        ? renderToString(
            createElement(
              ContextMenu,
              { target: "project", "aria-label": "Project actions" },
              createElement("button", {}, "Rename"),
            ),
          )
        : render(ContextMenu, {
            props: { target: "project", "aria-label": "Project actions" },
          }).body;
    assert.match(html, /role="menu"/);
    assert.match(html, /data-state="closed"/);
    assert.match(html, /Project actions/);
    console.log(
      `${framework}: closed ContextMenu SSR succeeds without document`,
    );
  }
} finally {
  rmSync(temporary, { recursive: true, force: true });
}
