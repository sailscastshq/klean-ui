import { expect, test } from "@rstest/core";
import { mount } from "@vue/test-utils";
import { parse } from "@babel/parser";
import { compile } from "svelte/compiler";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import Breadcrumb from "../src/vue/breadcrumb/Breadcrumb.vue";

const ITEMS = [
  { label: "Projects", href: "/" },
  { label: "Slipway", href: "/projects/slipway" },
  { label: "Production", href: "/projects/slipway/environments/production" },
  { label: "API", href: "/projects/slipway/environments/production/apps/api" },
  { label: "Settings", href: "/this-destination-is-ignored" },
];

function registrySource(framework, filename) {
  return readFileSync(
    resolve(`registry/breadcrumb/${framework}/${filename}`),
    "utf8",
  );
}

test("renders one labelled location hierarchy with a truthful current page", () => {
  const wrapper = mount(Breadcrumb, { props: { items: ITEMS } });

  expect(wrapper.element.tagName).toBe("NAV");
  expect(wrapper.attributes("aria-label")).toBe("Breadcrumb");
  expect(wrapper.findAll(":scope > ol")).toHaveLength(1);
  expect(wrapper.findAll('[data-slot="item"]')).toHaveLength(5);

  const current = wrapper.get('[data-slot="current"]');
  expect(current.element.tagName).toBe("SPAN");
  expect(current.attributes("aria-current")).toBe("page");
  expect(current.attributes("href")).toBeUndefined();
  expect(current.text()).toBe("Settings");
  expect(wrapper.findAll('[aria-current="page"]')).toHaveLength(1);
});

test("uses real framework links for ancestors and plain text when no destination exists", () => {
  const wrapper = mount(Breadcrumb, {
    props: {
      items: [
        { label: "Projects", href: "/projects" },
        { label: "Archive" },
        { label: "Invoice 1042" },
      ],
    },
  });

  const link = wrapper.get('[data-slot="link"]');
  expect(link.element.tagName).toBe("A");
  expect(link.attributes("href")).toBe("/projects");
  expect(link.classes()).toContain("cursor-pointer");

  const label = wrapper.get('[data-slot="label"]');
  expect(label.element.tagName).toBe("SPAN");
  expect(label.attributes("href")).toBeUndefined();
});

test("condenses deep trails from the same semantic list", () => {
  const wrapper = mount(Breadcrumb, { props: { items: ITEMS } });

  expect(wrapper.findAll("nav")).toHaveLength(1);
  expect(wrapper.findAll("ol")).toHaveLength(1);
  expect(wrapper.findAll('[data-slot="ellipsis"]')).toHaveLength(1);
  expect(wrapper.get('[data-slot="ellipsis"]').text()).toContain(
    "Collapsed breadcrumb items",
  );
  expect(wrapper.get('[data-slot="ellipsis"]').classes()).toContain(
    "@lg:hidden",
  );

  for (const index of [1, 2]) {
    const item = wrapper.get(`[data-slot="item"][data-index="${index}"]`);
    expect(item.classes()).toContain("hidden");
    expect(item.classes()).toContain("@lg:flex");
  }

  expect(
    wrapper.get('[data-slot="item"][data-index="0"]').classes(),
  ).not.toContain("hidden");
  expect(
    wrapper.get('[data-slot="item"][data-index="3"]').classes(),
  ).not.toContain("hidden");
});

test("keeps separators decorative and forwards ordinary nav attributes", () => {
  const wrapper = mount(Breadcrumb, {
    props: {
      items: [
        { label: "Projects", href: "/" },
        { label: "Settings", title: "Project settings" },
      ],
    },
    attrs: {
      "aria-label": "Project location",
      "data-test": "project-breadcrumb",
      class: "min-w-full text-base",
    },
  });

  expect(wrapper.attributes("aria-label")).toBe("Project location");
  expect(wrapper.attributes("data-test")).toBe("project-breadcrumb");
  expect(wrapper.classes()).toContain("min-w-full");
  expect(wrapper.classes()).not.toContain("min-w-0");
  expect(wrapper.get('[data-slot="current"]').attributes("title")).toBe(
    "Project settings",
  );

  for (const separator of wrapper.findAll('[data-slot="separator"]')) {
    expect(separator.attributes("aria-hidden")).toBe("true");
  }
});

test("renders nothing for an empty trail and keeps the API lean", () => {
  const wrapper = mount(Breadcrumb, { props: { items: [] } });
  expect(wrapper.html()).toBe("<!--v-if-->");

  const props = Breadcrumb.props ?? {};
  expect(Object.keys(props)).toEqual(["items"]);
  for (const name of [
    "variant",
    "separator",
    "collapsed",
    "maxItems",
    "link",
    "linkAs",
  ]) {
    expect(props).not.toHaveProperty(name);
  }
});

test("ships equivalent framework-native registry source", () => {
  expect(registrySource("vue", "Breadcrumb.vue")).toBe(
    readFileSync(resolve("src/vue/breadcrumb/Breadcrumb.vue"), "utf8"),
  );

  expect(() =>
    parse(registrySource("react", "Breadcrumb.jsx"), {
      sourceType: "module",
      plugins: ["jsx"],
    }),
  ).not.toThrow();

  const result = compile(registrySource("svelte", "Breadcrumb.svelte"), {
    filename: "Breadcrumb.svelte",
    generate: false,
  });
  expect(result.warnings).toEqual([]);
});

test("keeps the durable link, semantic, and class-first contract everywhere", () => {
  for (const [framework, filename, adapter] of [
    ["vue", "Breadcrumb.vue", "@inertiajs/vue3"],
    ["react", "Breadcrumb.jsx", "@inertiajs/react"],
    ["svelte", "Breadcrumb.svelte", "@inertiajs/svelte"],
  ]) {
    const source = registrySource(framework, filename);

    expect(source).toContain(adapter);
    expect(source).toContain('data-slot="breadcrumb"');
    expect(source).toContain('data-slot="current"');
    expect(source).toContain('aria-current="page"');
    expect(source).toContain("@container");
    expect(source).toContain("@lg:flex");
    expect(source).not.toMatch(/localStorage|sessionStorage|ResizeObserver/);
    expect(source).not.toMatch(
      /\b(?:variant|separator|maxItems|collapseAt|linkAs)\s*(?::|=)/,
    );
  }
});
