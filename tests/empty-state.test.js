import { parse } from "@babel/parser";
import { expect, test } from "@rstest/core";
import { mount } from "@vue/test-utils";
import { compile } from "svelte/compiler";
import { defineComponent, h, markRaw } from "vue";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import EmptyState from "../src/vue/empty-state/EmptyState.vue";

function registrySource(framework, filename) {
  return readFileSync(
    resolve(`registry/empty-state/${framework}/${filename}`),
    "utf8",
  );
}

test("renders one shallow neutral layout with caller semantic markup", () => {
  const wrapper = mount(EmptyState, {
    attrs: { id: "projects-empty", "data-test": "projects-empty" },
    slots: {
      default:
        '<h2 id="projects-empty-title">No projects yet</h2><p>Create your first project.</p><a href="/projects/new">Create project</a>',
    },
  });

  expect(wrapper.element.tagName.toLowerCase()).toBe("div");
  expect(wrapper.attributes("data-slot")).toBe("empty-state");
  expect(wrapper.attributes("id")).toBe("projects-empty");
  expect(wrapper.attributes("data-test")).toBe("projects-empty");
  expect(wrapper.attributes("role")).toBeUndefined();
  expect(wrapper.attributes("aria-live")).toBeUndefined();
  expect(wrapper.findAll('[data-slot="empty-state"]')).toHaveLength(1);
  expect(wrapper.get("h2").text()).toBe("No projects yet");
  expect(wrapper.get("a").attributes("href")).toBe("/projects/new");
  expect(wrapper.vm.element).toBe(wrapper.element);
});

test("lets the caller choose and name a truthful native section", () => {
  const wrapper = mount(EmptyState, {
    props: { as: "section" },
    attrs: { "aria-labelledby": "clients-empty-title" },
    slots: { default: '<h2 id="clients-empty-title">No clients yet</h2>' },
  });

  expect(wrapper.element.tagName.toLowerCase()).toBe("section");
  expect(wrapper.attributes("aria-labelledby")).toBe("clients-empty-title");
  expect(wrapper.attributes("role")).toBeUndefined();
});

test("accepts a framework component without adapting its navigation", async () => {
  let clicks = 0;
  const LinkStub = defineComponent({
    inheritAttrs: false,
    setup(_, { attrs, slots }) {
      return () => h("a", attrs, slots.default?.());
    },
  });
  const wrapper = mount(EmptyState, {
    props: { as: markRaw(LinkStub) },
    attrs: {
      href: "/projects/new",
      onClick: () => {
        clicks += 1;
      },
    },
    slots: { default: "Create project" },
  });

  expect(wrapper.element.tagName.toLowerCase()).toBe("a");
  expect(wrapper.attributes("href")).toBe("/projects/new");
  await wrapper.trigger("click");
  expect(clicks).toBe(1);
});

test("lets caller Tailwind turn the same block into a compact table state", () => {
  const wrapper = mount(EmptyState, {
    attrs: {
      class:
        "min-h-0 items-start gap-2 p-4 text-left text-sm text-gray-500 dark:text-gray-400",
    },
  });

  for (const className of [
    "min-h-0",
    "items-start",
    "gap-2",
    "p-4",
    "text-left",
    "text-sm",
    "text-gray-500",
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

test("ships parseable framework-native ports with the same shallow contract", () => {
  const vue = registrySource("vue", "EmptyState.vue");
  const react = registrySource("react", "EmptyState.jsx");
  const svelte = registrySource("svelte", "EmptyState.svelte");

  expect(vue).toBe(
    readFileSync(resolve("src/vue/empty-state/EmptyState.vue"), "utf8"),
  );
  expect(() =>
    parse(react, { sourceType: "module", plugins: ["jsx"] }),
  ).not.toThrow();
  expect(
    compile(svelte, { filename: "EmptyState.svelte", generate: false })
      .warnings,
  ).toEqual([]);

  for (const source of [vue, react, svelte]) {
    expect(source).toContain('data-slot="empty-state"');
    expect(source).toContain("tailwind-merge");
    expect(source).not.toMatch(
      /Empty(?:Header|Media|Icon|Title|Description|Content|Actions)/,
    );
    expect(source).not.toMatch(
      /\b(?:title|description|icon|media|actions|variant|tone|size|compact|fullPage|loading|error|empty)\s*(?::|=(?!=))/i,
    );
    expect(source).not.toMatch(/aria-live|role=["'](?:status|alert)["']/);
    expect(source).not.toMatch(/localStorage|sessionStorage|URLSearchParams/);
  }
});
