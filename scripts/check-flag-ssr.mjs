// Prove the same alt contract from each installed framework source on a server.
import assert from "node:assert/strict";
import { readFileSync, writeFileSync, rmSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { parse, compileScript } from "@vue/compiler-sfc";
import { createSSRApp } from "vue";
import { renderToString } from "vue/server-renderer";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { compile } from "svelte/compiler";
import { render } from "svelte/server";
import ts from "typescript";
import { Window } from "happy-dom";
const helper = pathToFileURL(resolve("registry/flag/shared/flags.js")).href;
const sources = {
  vue: (() => {
    const { descriptor } = parse(
      readFileSync("registry/flag/vue/Flag.vue", "utf8"),
    );
    return compileScript(descriptor, {
      id: "flag-ssr",
      inlineTemplate: true,
      templateOptions: { ssr: true },
    }).content;
  })(),
  react: ts.transpileModule(
    readFileSync("registry/flag/react/Flag.jsx", "utf8"),
    {
      compilerOptions: {
        jsx: ts.JsxEmit.ReactJSX,
        module: ts.ModuleKind.ESNext,
        target: ts.ScriptTarget.ES2022,
      },
    },
  ).outputText,
  svelte: compile(readFileSync("registry/flag/svelte/Flag.svelte", "utf8"), {
    generate: "server",
    filename: "Flag.svelte",
  }).js.code,
};
const cases = [
  [{ country: " ng " }, "Nigeria"],
  [{ country: "NG", alt: "" }, ""],
  [{ country: "NG", alt: "Based in Nigeria" }, "Based in Nigeria"],
  [{ country: "KE" }, "Kenya"],
  [{ country: "NG", src: "/custom.svg" }, ""],
  [{ src: "/custom.svg" }, ""],
  [{ country: "NG", src: "/custom.svg", alt: "Organization" }, "Organization"],
  [{ src: "/custom.svg", alt: "" }, ""],
];
const temporary = [];
try {
  for (const [framework, source] of Object.entries(sources)) {
    const path = resolve(`.flag-ssr-${framework}.mjs`);
    temporary.push(path);
    writeFileSync(path, source.replace("../shared/flags.js", helper));
    const Component = (await import(pathToFileURL(path))).default;
    const html = async (props) =>
      framework === "vue"
        ? await renderToString(createSSRApp(Component, props))
        : framework === "react"
          ? renderToStaticMarkup(createElement(Component, props))
          : render(Component, { props }).body;
    for (const [props, alt] of cases) {
      const document = new Window().document;
      document.body.innerHTML = await html(props);
      assert.equal(
        document.querySelector("img").getAttribute("alt"),
        alt,
        `${framework} ${JSON.stringify(props)}`,
      );
    }
    for (const country of ["", "ZZ", "USA"]) {
      const output = await html({ country });
      assert.match(output, /data-state="fallback"/);
      assert.match(output, /aria-hidden="true"/);
      assert.doesNotMatch(output, /aria-label/);
    }
    const fallback = await html({ country: "ZZ", alt: "Unavailable" });
    assert.match(fallback, /aria-label="Unavailable"/);
    console.log(
      `${framework}: SSR omitted/empty/string/custom source/invalid contracts passed`,
    );
  }
} finally {
  for (const path of temporary) rmSync(path, { force: true });
}
