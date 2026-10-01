import {
  mkdtempSync,
  readFileSync,
  writeFileSync,
  symlinkSync,
  rmSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { resolve, join } from "node:path";
import { pathToFileURL } from "node:url";
import { compile } from "svelte/compiler";
import { render } from "svelte/server";
import ts from "typescript";
import { createElement } from "react";
import { renderToString } from "react-dom/server";
const temp = mkdtempSync(join(tmpdir(), "klean-multi-select-ssr-"));
try {
  symlinkSync(resolve("node_modules"), join(temp, "node_modules"));
  for (const name of ["Popover", "MultiSelect"]) {
    const item = name === "Popover" ? "popover" : "multi-select";
    const svelteSource = readFileSync(
      `registry/${item}/svelte/${name}.svelte`,
      "utf8",
    );
    writeFileSync(
      join(temp, `${name}.svelte.mjs`),
      compile(svelteSource, {
        generate: "server",
        filename: `${name}.svelte`,
      }).js.code.replace("../popover/Popover.svelte", "./Popover.svelte.mjs"),
    );
    const reactSource = readFileSync(
      `registry/${item}/react/${name}.jsx`,
      "utf8",
    );
    writeFileSync(
      join(temp, `${name}.react.mjs`),
      ts
        .transpileModule(reactSource, {
          compilerOptions: {
            jsx: ts.JsxEmit.ReactJSX,
            module: ts.ModuleKind.ESNext,
            target: ts.ScriptTarget.ESNext,
          },
        })
        .outputText.replace("../popover/Popover.jsx", "./Popover.react.mjs"),
    );
  }
  const props = {
    options: [
      { value: "a", label: "Alpha" },
      { value: "b", label: "Beta" },
    ],
    defaultValue: ["b"],
    name: "teams",
    required: true,
    "aria-label": "Teams",
  };
  const { default: ReactMultiSelect } = await import(
    pathToFileURL(join(temp, "MultiSelect.react.mjs"))
  );
  const reactHtml = renderToString(createElement(ReactMultiSelect, props));
  const { default: SvelteMultiSelect } = await import(
    pathToFileURL(join(temp, "MultiSelect.svelte.mjs"))
  );
  const svelteHtml = render(SvelteMultiSelect, { props }).body;
  for (const [framework, html] of [
    ["React", reactHtml],
    ["Svelte", svelteHtml],
  ]) {
    if (
      !html.includes('aria-multiselectable="true"') ||
      !html.includes('value="b" selected') ||
      !html.includes('aria-required="true"')
    )
      throw new Error(`${framework} SSR contract failed`);
    console.log(
      `${framework} SSR fixed selection, required and multi-listbox passed`,
    );
  }
} finally {
  rmSync(temp, { recursive: true, force: true });
}
