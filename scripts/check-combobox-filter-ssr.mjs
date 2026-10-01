import assert from "node:assert/strict";
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
import { parse, compileScript } from "@vue/compiler-sfc";
import { createSSRApp } from "vue";
import { renderToString } from "vue/server-renderer";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { compile } from "svelte/compiler";
import { render } from "svelte/server";
import ts from "typescript";

const temp = mkdtempSync(join(tmpdir(), "klean-combobox-filter-ssr-"));
try {
  symlinkSync(resolve("node_modules"), join(temp, "node_modules"));
  for (const framework of ["vue", "react", "svelte"]) {
    const extension = { vue: "vue", react: "jsx", svelte: "svelte" }[framework];
    for (const [item, name] of [
      ["popover", "Popover"],
      ["combobox", "Combobox"],
    ]) {
      const source = readFileSync(
        `registry/${item}/${framework}/${name}.${extension}`,
        "utf8",
      );
      let code;
      if (framework === "vue") {
        const { descriptor } = parse(source);
        code = compileScript(descriptor, {
          id: `${item}-ssr`,
          inlineTemplate: true,
          templateOptions: { ssr: true },
        }).content;
      } else if (framework === "react") {
        code = ts.transpileModule(source, {
          compilerOptions: {
            jsx: ts.JsxEmit.ReactJSX,
            module: ts.ModuleKind.ESNext,
            target: ts.ScriptTarget.ES2022,
          },
        }).outputText;
      } else {
        code = compile(source, {
          generate: "server",
          filename: `${name}.svelte`,
        }).js.code;
      }
      writeFileSync(
        join(temp, `${name}.${framework}.mjs`),
        code.replace(
          `../popover/Popover.${extension}`,
          `./Popover.${framework}.mjs`,
        ),
      );
    }
    const { default: Component } = await import(
      pathToFileURL(join(temp, `Combobox.${framework}.mjs`))
    );
    const props = {
      options: [
        { value: 42, label: "Automobile" },
        { value: 7, label: "Motor vehicle" },
      ],
      defaultQuery: "car",
      defaultOpen: true,
      "aria-label": "Vehicle",
    };
    const html = async (props) =>
      framework === "vue"
        ? renderToString(createSSRApp(Component, props))
        : framework === "react"
          ? renderToStaticMarkup(createElement(Component, props))
          : render(Component, { props }).body;
    const local = await html(props);
    assert(!local.includes("Automobile"));
    const matched = await html({ ...props, filter: false });
    assert(matched.includes("Automobile"));
    assert(matched.indexOf("Automobile") < matched.indexOf("Motor vehicle"));
    assert(!/\sfilter=/.test(matched));
    console.log(
      `${framework}: SSR default filtering and application-ranked matches passed`,
    );
  }
} finally {
  rmSync(temp, { recursive: true, force: true });
}
