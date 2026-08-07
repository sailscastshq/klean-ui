import { expect, test } from "@rstest/core";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { parse } from "@babel/parser";
import { compile } from "svelte/compiler";

function registrySource(framework, filename, item = "button") {
  return readFileSync(
    resolve(`registry/${item}/${framework}/${filename}`),
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

test("keeps every Vue form-control source identical to its registry source", () => {
  for (const [item, sourcePath, filename] of [
    ["input", "src/vue/input/Input.vue", "Input.vue"],
    ["textarea", "src/vue/textarea/Textarea.vue", "Textarea.vue"],
  ]) {
    expect(registrySource("vue", filename, item)).toBe(
      readFileSync(resolve(sourcePath), "utf8"),
    );
  }
});

test("ships parseable framework-native React form source", () => {
  for (const [item, filename] of [
    ["input", "Input.jsx"],
    ["textarea", "Textarea.jsx"],
  ]) {
    expect(() =>
      parse(registrySource("react", filename, item), {
        sourceType: "module",
        plugins: ["jsx"],
      }),
    ).not.toThrow();
  }
});

test("ships compiler-valid Svelte 5 form source", () => {
  for (const [item, filename] of [
    ["input", "Input.svelte"],
    ["textarea", "Textarea.svelte"],
  ]) {
    const result = compile(registrySource("svelte", filename, item), {
      filename,
      generate: false,
    });

    expect(result.warnings).toEqual([]);
  }
});

test("keeps form controls native and free of hidden field APIs", () => {
  for (const [item, framework, filename] of [
    ["input", "vue", "Input.vue"],
    ["textarea", "vue", "Textarea.vue"],
    ["input", "react", "Input.jsx"],
    ["textarea", "react", "Textarea.jsx"],
    ["input", "svelte", "Input.svelte"],
    ["textarea", "svelte", "Textarea.svelte"],
  ]) {
    const source = registrySource(framework, filename, item);
    expect(source).not.toMatch(/\bvariant\b/i);
    expect(source).not.toMatch(/\borientation\b/i);
    expect(source).not.toMatch(/field-context/i);
    expect(source).not.toMatch(/useFieldContext|getFieldContext/i);
  }
});

test("keeps the Vue Popover workbench and registry source identical", () => {
  expect(registrySource("vue", "Popover.vue", "popover")).toBe(
    readFileSync(resolve("src/vue/popover/Popover.vue"), "utf8"),
  );
});

test("ships compiler-valid framework-native Popover source", () => {
  const reactSource = registrySource("react", "Popover.jsx", "popover");
  expect(() =>
    parse(reactSource, { sourceType: "module", plugins: ["jsx"] }),
  ).not.toThrow();

  const svelteSource = registrySource("svelte", "Popover.svelte", "popover");
  const result = compile(svelteSource, {
    filename: "Popover.svelte",
    generate: false,
  });

  expect(result.warnings).toEqual([]);
});

test("keeps Popover semantic, class-first, and ephemeral", () => {
  for (const [framework, filename] of [
    ["vue", "Popover.vue"],
    ["react", "Popover.jsx"],
    ["svelte", "Popover.svelte"],
  ]) {
    const source = registrySource(framework, filename, "popover");

    expect(source).toContain("@floating-ui/dom");
    expect(source).toContain('popover="auto"');
    expect(source).toContain("aria-expanded");
    expect(source).toContain("bottom-start");
    expect(source).not.toMatch(/localStorage|sessionStorage|URLSearchParams/);
    expect(source).not.toMatch(/\bvariant\b/i);
    expect(source).not.toMatch(/role=["'](?:menu|dialog)["']/);
  }
});

test("keeps the Vue Menu workbench and installable registry source identical", () => {
  expect(registrySource("vue", "Menu.vue", "menu")).toBe(
    readFileSync(resolve("src/vue/menu/Menu.vue"), "utf8"),
  );
});

test("ships compiler-valid framework-native Menu source", () => {
  const reactSource = registrySource("react", "Menu.jsx", "menu");
  expect(() =>
    parse(reactSource, { sourceType: "module", plugins: ["jsx"] }),
  ).not.toThrow();

  const svelteSource = registrySource("svelte", "Menu.svelte", "menu");
  const result = compile(svelteSource, {
    filename: "Menu.svelte",
    generate: false,
  });

  expect(result.warnings).toEqual([]);
});

test("keeps Menu semantic, class-first, ephemeral, and motion-free", () => {
  for (const [framework, filename] of [
    ["vue", "Menu.vue"],
    ["react", "Menu.jsx"],
    ["svelte", "Menu.svelte"],
  ]) {
    const source = registrySource(framework, filename, "menu");

    expect(source).toContain("../popover/Popover");
    expect(source).toContain("menuitem");
    expect(source).toContain("aria-haspopup");
    expect(source).toContain("typeahead");
    expect(source).not.toMatch(/localStorage|sessionStorage|URLSearchParams/);
    expect(source).not.toMatch(/\bvariant\b/i);
    expect(source).not.toMatch(/transition|animate|duration-/);
    expect(source).not.toMatch(/MenuTrigger|MenuItem/);
    expect(source).toContain("TABBABLE_SELECTOR");
    expect(source).toContain("adjacentTabStop");
    expect(source).toMatch(/event\.key === ["']Tab["']/);
  }
});

test("keeps the Vue Dialog workbench and installable source identical", () => {
  expect(registrySource("vue", "Dialog.vue", "dialog")).toBe(
    readFileSync(resolve("src/vue/dialog/Dialog.vue"), "utf8"),
  );
});

test("ships compiler-valid framework-native Dialog source", () => {
  const reactSource = registrySource("react", "Dialog.jsx", "dialog");
  expect(() =>
    parse(reactSource, { sourceType: "module", plugins: ["jsx"] }),
  ).not.toThrow();

  const svelteSource = registrySource("svelte", "Dialog.svelte", "dialog");
  const result = compile(svelteSource, {
    filename: "Dialog.svelte",
    generate: false,
  });

  expect(result.warnings).toEqual([]);
});

test("keeps Dialog native, class-first, durable, and free of product APIs", () => {
  for (const [framework, filename] of [
    ["vue", "Dialog.vue"],
    ["react", "Dialog.jsx"],
    ["svelte", "Dialog.svelte"],
  ]) {
    const source = registrySource(framework, filename, "dialog");

    expect(source).toMatch(/<dialog/);
    expect(source).toContain("showModal");
    expect(source).toContain("requestClose");
    expect(source).toContain("commandfor");
    expect(source).toContain("closedby");
    expect(source).toContain('data-slot="dialog"');
    expect(source).toContain("tailwind-merge");
    expect(source).not.toMatch(/localStorage|sessionStorage|URLSearchParams/);
    expect(source).not.toMatch(/\bvariant\b|\btone\b|\bsize\b/i);
    expect(source).not.toMatch(/ConfirmDialog|DialogTrigger|DialogTitle/);
    expect(source).not.toMatch(/role=["']dialog["']/);
    expect(source).not.toMatch(/FOCUSABLE|focusTrap|tabIndex.*-1/);
    expect(source).not.toMatch(/Teleport|createPortal/);
    expect(source).not.toMatch(/transition|animate|duration-/);
  }
});
