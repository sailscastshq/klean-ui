import { parse } from "@babel/parser";
import { expect, test } from "@rstest/core";
import { mount } from "@vue/test-utils";
import { compile } from "svelte/compiler";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import LoadingState from "../src/vue/loading-state/LoadingState.vue";

function registrySource(framework, filename) {
  return readFileSync(
    resolve(`registry/loading-state/${framework}/${filename}`),
    "utf8",
  );
}

test("renders one polite atomic status with caller-owned useful copy", () => {
  const wrapper = mount(LoadingState, {
    attrs: { id: "services-loading", "data-test": "services-loading" },
    slots: {
      default:
        '<span aria-hidden="true" data-test="mark">◌</span><span>Loading services</span>',
    },
  });

  expect(wrapper.element.tagName.toLowerCase()).toBe("div");
  expect(wrapper.attributes("role")).toBe("status");
  expect(wrapper.attributes("aria-live")).toBe("polite");
  expect(wrapper.attributes("aria-atomic")).toBe("true");
  expect(wrapper.attributes("data-slot")).toBe("loading-state");
  expect(wrapper.attributes("id")).toBe("services-loading");
  expect(wrapper.attributes("data-test")).toBe("services-loading");
  expect(wrapper.text()).toBe("◌Loading services");
  expect(wrapper.vm.element).toBe(wrapper.element);
});

test("keeps status semantics fixed when callers pass conflicting attributes", () => {
  const wrapper = mount(LoadingState, {
    attrs: {
      role: "alert",
      "aria-live": "assertive",
      "aria-atomic": "false",
      "data-slot": "other",
    },
  });

  expect(wrapper.attributes("role")).toBe("status");
  expect(wrapper.attributes("aria-live")).toBe("polite");
  expect(wrapper.attributes("aria-atomic")).toBe("true");
  expect(wrapper.attributes("data-slot")).toBe("loading-state");
});

test("lets caller Tailwind create a compact stale-content status", () => {
  const wrapper = mount(LoadingState, {
    attrs: {
      class:
        "min-h-0 flex-row items-start justify-start gap-2 p-0 text-left text-sm text-gray-500 dark:text-gray-400",
    },
  });

  for (const className of [
    "min-h-0",
    "flex-row",
    "items-start",
    "justify-start",
    "gap-2",
    "p-0",
    "text-left",
    "text-sm",
    "text-gray-500",
  ]) {
    expect(wrapper.classes()).toContain(className);
  }

  for (const className of [
    "min-h-32",
    "flex-col",
    "items-center",
    "justify-center",
    "gap-3",
    "p-6",
    "text-center",
    "text-gray-600",
  ]) {
    expect(wrapper.classes()).not.toContain(className);
  }
});

test("ships parseable framework-native ports without request ownership", () => {
  const vue = registrySource("vue", "LoadingState.vue");
  const react = registrySource("react", "LoadingState.jsx");
  const svelte = registrySource("svelte", "LoadingState.svelte");

  expect(vue).toBe(
    readFileSync(resolve("src/vue/loading-state/LoadingState.vue"), "utf8"),
  );
  expect(() =>
    parse(react, { sourceType: "module", plugins: ["jsx"] }),
  ).not.toThrow();
  expect(
    compile(svelte, { filename: "LoadingState.svelte", generate: false })
      .warnings,
  ).toEqual([]);

  for (const source of [vue, react, svelte]) {
    expect(source).toContain('data-slot="loading-state"');
    expect(source).toContain('role="status"');
    expect(source).toContain('aria-live="polite"');
    expect(source).toContain('aria-atomic="true"');
    expect(source).toContain("tailwind-merge");
    expect(source).not.toMatch(
      /Loading(?:Header|Title|Description|Skeleton|Content|Media|Actions)/,
    );
    expect(source).not.toMatch(
      /\b(?:loading|delay|promise|skeleton|title|description|variant|tone|size|compact|fullPage|retry|cancel)\s*(?::|=(?!=))/i,
    );
    expect(source).not.toMatch(
      /setTimeout|clearTimeout|fetch\(|axios|router\.|localStorage|sessionStorage|URLSearchParams/,
    );
  }
});
