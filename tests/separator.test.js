import { expect, test } from "@rstest/core";
import { mount } from "@vue/test-utils";
import { parse } from "@babel/parser";
import { compile } from "svelte/compiler";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import Separator from "../src/vue/separator/Separator.vue";

function registrySource(framework, filename) {
  return readFileSync(
    resolve(`registry/separator/${framework}/${filename}`),
    "utf8",
  );
}

test("renders one native horizontal thematic break by default", () => {
  const wrapper = mount(Separator, {
    attrs: { id: "account-boundary", title: "Account boundary" },
  });

  expect(wrapper.element.tagName.toLowerCase()).toBe("hr");
  expect(wrapper.attributes("data-slot")).toBe("separator");
  expect(wrapper.attributes("data-orientation")).toBe("horizontal");
  expect(wrapper.attributes("id")).toBe("account-boundary");
  expect(wrapper.attributes("title")).toBe("Account boundary");
  expect(wrapper.attributes("role")).toBeUndefined();
  expect(wrapper.attributes("aria-orientation")).toBeUndefined();
  expect(wrapper.vm.element).toBe(wrapper.element);
});

test("uses explicit separator semantics for a vertical boundary", () => {
  const wrapper = mount(Separator, {
    props: { orientation: "vertical" },
    attrs: { role: "presentation", "aria-orientation": "horizontal" },
  });

  expect(wrapper.element.tagName.toLowerCase()).toBe("div");
  expect(wrapper.attributes("role")).toBe("separator");
  expect(wrapper.attributes("aria-orientation")).toBe("vertical");
  expect(wrapper.attributes("data-orientation")).toBe("vertical");
  expect(wrapper.classes()).toContain("w-px");
  expect(wrapper.classes()).toContain("self-stretch");
});

test("keeps decorative use an ordinary accessibility attribute", () => {
  const wrapper = mount(Separator, {
    attrs: { "aria-hidden": "true" },
  });

  expect(wrapper.attributes("aria-hidden")).toBe("true");
  expect(wrapper.element.tagName.toLowerCase()).toBe("hr");
});

test("lets caller Tailwind replace dimension, alignment, and color defaults", () => {
  const wrapper = mount(Separator, {
    attrs: {
      class: "h-2 w-24 bg-black dark:bg-white",
    },
  });

  for (const className of ["h-2", "w-24", "bg-black", "dark:bg-white"]) {
    expect(wrapper.classes()).toContain(className);
  }
  for (const className of [
    "h-px",
    "w-full",
    "bg-gray-200",
    "dark:bg-gray-800",
  ]) {
    expect(wrapper.classes()).not.toContain(className);
  }

  const vertical = mount(Separator, {
    props: { orientation: "vertical" },
    attrs: { class: "h-8 w-2 self-center bg-black dark:bg-white" },
  });

  for (const className of ["h-8", "w-2", "self-center", "bg-black"]) {
    expect(vertical.classes()).toContain(className);
  }
  for (const className of ["w-px", "self-stretch", "bg-gray-200"]) {
    expect(vertical.classes()).not.toContain(className);
  }
});

test("ships equivalent parseable framework-native source", () => {
  expect(registrySource("vue", "Separator.vue")).toBe(
    readFileSync(resolve("src/vue/separator/Separator.vue"), "utf8"),
  );

  expect(() =>
    parse(registrySource("react", "Separator.jsx"), {
      sourceType: "module",
      plugins: ["jsx"],
    }),
  ).not.toThrow();

  const result = compile(registrySource("svelte", "Separator.svelte"), {
    filename: "Separator.svelte",
    generate: false,
  });

  expect(result.warnings).toEqual([]);
});

test("keeps Separator native-first, class-first, static, and variant-free", () => {
  const props = Separator.props ?? {};

  expect(props).toHaveProperty("orientation");
  for (const name of [
    "as",
    "variant",
    "tone",
    "color",
    "size",
    "thickness",
    "decorative",
  ]) {
    expect(props).not.toHaveProperty(name);
  }

  for (const [framework, filename] of [
    ["vue", "Separator.vue"],
    ["react", "Separator.jsx"],
    ["svelte", "Separator.svelte"],
  ]) {
    const source = registrySource(framework, filename);

    expect(source).toContain('data-slot="separator"');
    expect(source).toContain("data-orientation");
    expect(source).toContain("tailwind-merge");
    expect(source).toMatch(/["'<]hr/);
    expect(source).toMatch(/["']separator["']/);
    expect(source).toContain("aria-orientation");
    expect(source).not.toMatch(
      /\b(?:variant|tone|color|size|thickness|decorative)\s*(?::|=(?!=))/i,
    );
    expect(source).not.toMatch(/localStorage|sessionStorage|URLSearchParams/);
    expect(source).not.toMatch(/onClick=|@click=|onclick=|keydown|keyup/i);
  }
});
