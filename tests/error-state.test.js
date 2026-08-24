import { parse } from "@babel/parser";
import { expect, test } from "@rstest/core";
import { mount } from "@vue/test-utils";
import { compile } from "svelte/compiler";
import { defineComponent, h, markRaw } from "vue";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import ErrorState from "../src/vue/error-state/ErrorState.vue";

function registrySource(framework, filename) {
  return readFileSync(
    resolve(`registry/error-state/${framework}/${filename}`),
    "utf8",
  );
}

test("renders one shallow failure layout without inventing announcement semantics", () => {
  const wrapper = mount(ErrorState, {
    attrs: { id: "services-error", "data-test": "services-error" },
    slots: {
      default:
        '<h2 id="services-error-title">Services could not load</h2><p>Slipway could not reach the deployment service.</p><button type="button">Try again</button>',
    },
  });

  expect(wrapper.element.tagName.toLowerCase()).toBe("div");
  expect(wrapper.attributes("data-slot")).toBe("error-state");
  expect(wrapper.attributes("id")).toBe("services-error");
  expect(wrapper.attributes("data-test")).toBe("services-error");
  expect(wrapper.attributes("role")).toBeUndefined();
  expect(wrapper.attributes("aria-live")).toBeUndefined();
  expect(wrapper.findAll('[data-slot="error-state"]')).toHaveLength(1);
  expect(wrapper.get("h2").text()).toBe("Services could not load");
  expect(wrapper.get("button").attributes("type")).toBe("button");
  expect(wrapper.vm.element).toBe(wrapper.element);
});

test("lets a dynamic caller opt into one native alert", () => {
  const wrapper = mount(ErrorState, {
    props: { as: "section" },
    attrs: {
      role: "alert",
      "aria-labelledby": "bridge-error-title",
    },
    slots: { default: '<h2 id="bridge-error-title">Bridge failed</h2>' },
  });

  expect(wrapper.element.tagName.toLowerCase()).toBe("section");
  expect(wrapper.attributes("role")).toBe("alert");
  expect(wrapper.attributes("aria-labelledby")).toBe("bridge-error-title");
});

test("keeps a framework component and its action behavior caller-owned", async () => {
  let clicks = 0;
  const LinkStub = defineComponent({
    inheritAttrs: false,
    setup(_, { attrs, slots }) {
      return () => h("a", attrs, slots.default?.());
    },
  });
  const wrapper = mount(ErrorState, {
    props: { as: markRaw(LinkStub) },
    attrs: {
      href: "/projects",
      onClick: () => {
        clicks += 1;
      },
    },
    slots: { default: "Return to projects" },
  });

  expect(wrapper.element.tagName.toLowerCase()).toBe("a");
  expect(wrapper.attributes("href")).toBe("/projects");
  await wrapper.trigger("click");
  expect(clicks).toBe(1);
});

test("lets caller Tailwind create a compact left-aligned region failure", () => {
  const wrapper = mount(ErrorState, {
    attrs: {
      class:
        "min-h-0 items-start gap-2 p-4 text-left text-sm text-red-700 dark:text-red-300",
    },
  });

  for (const className of [
    "min-h-0",
    "items-start",
    "gap-2",
    "p-4",
    "text-left",
    "text-sm",
    "text-red-700",
  ]) {
    expect(wrapper.classes()).toContain(className);
  }

  for (const className of [
    "min-h-48",
    "items-center",
    "gap-4",
    "p-6",
    "text-center",
    "text-gray-950",
  ]) {
    expect(wrapper.classes()).not.toContain(className);
  }
});

test("ships parseable framework-native ports without recovery or diagnostic ownership", () => {
  const vue = registrySource("vue", "ErrorState.vue");
  const react = registrySource("react", "ErrorState.jsx");
  const svelte = registrySource("svelte", "ErrorState.svelte");

  expect(vue).toBe(
    readFileSync(resolve("src/vue/error-state/ErrorState.vue"), "utf8"),
  );
  expect(() =>
    parse(react, { sourceType: "module", plugins: ["jsx"] }),
  ).not.toThrow();
  expect(
    compile(svelte, { filename: "ErrorState.svelte", generate: false })
      .warnings,
  ).toEqual([]);

  for (const source of [vue, react, svelte]) {
    expect(source).toContain('data-slot="error-state"');
    expect(source).toContain("tailwind-merge");
    expect(source).not.toMatch(
      /Error(?:Header|Media|Icon|Title|Description|Content|Actions|Details)/,
    );
    expect(source).not.toMatch(
      /\b(?:title|description|icon|media|actions|details|message|retry|cancel|variant|tone|size|compact|fullPage|loading|error)\s*(?::|=(?!=))/i,
    );
    expect(source).not.toMatch(/aria-live|role=["'](?:status|alert)["']/);
    expect(source).not.toMatch(
      /setTimeout|clearTimeout|fetch\(|axios|router\.|localStorage|sessionStorage|URLSearchParams|innerHTML/,
    );
  }
});
