import { expect, test } from "@rstest/core";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { parse } from "@babel/parser";
import { compile } from "svelte/compiler";

function registrySource(framework, filename) {
  return readFileSync(
    resolve(`registry/button/${framework}/${filename}`),
    "utf8",
  );
}

test("keeps the Vue workbench and installable registry source identical", () => {
  expect(registrySource("vue", "Button.vue")).toBe(
    readFileSync(resolve("src/vue/button/Button.vue"), "utf8"),
  );
});

test("ships parseable framework-native React source", () => {
  const source = registrySource("react", "Button.jsx");

  expect(() =>
    parse(source, { sourceType: "module", plugins: ["jsx"] }),
  ).not.toThrow();
  expect(source).toContain('Component = "button"');
  expect(source).toContain("className={twMerge(BASE_CLASSES, className)}");
  expect(source).toContain("aria-disabled=");
});

test("ships compiler-valid Svelte 5 source", () => {
  const source = registrySource("svelte", "Button.svelte");
  const result = compile(source, {
    filename: "Button.svelte",
    generate: false,
  });

  expect(result.warnings).toEqual([]);
  expect(source).toContain('as = "button"');
  expect(source).toContain("class={twMerge(BASE_CLASSES, className)}");
  expect(source).toContain("<svelte:element");
});

test("keeps visual variants and product motion out of every registry source", () => {
  for (const [framework, filename] of [
    ["vue", "Button.vue"],
    ["react", "Button.jsx"],
    ["svelte", "Button.svelte"],
  ]) {
    const source = registrySource(framework, filename);

    expect(source).not.toMatch(/\bvariant\b/i);
    expect(source).not.toContain("active:translate");
    expect(source).not.toContain("active:scale");
    expect(source).toContain("active:bg-gray-700");
  }
});
