import { parse } from "@babel/parser";
import { expect, test } from "@rstest/core";
import { mount } from "@vue/test-utils";
import { compile } from "svelte/compiler";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import Table from "../src/vue/table/Table.vue";

function registrySource(framework, filename) {
  return readFileSync(
    resolve(`registry/table/${framework}/${filename}`),
    "utf8",
  );
}

test("renders one native table with application-owned anatomy", () => {
  const wrapper = mount(Table, {
    attrs: {
      id: "query-results",
      "aria-describedby": "query-help",
    },
    slots: {
      default: `
        <caption>Query results</caption>
        <thead><tr><th scope="col">Name</th><th scope="col">Status</th></tr></thead>
        <tbody><tr><th scope="row">api</th><td><a href="/apps/api">Healthy</a></td></tr></tbody>
      `,
    },
  });

  expect(wrapper.element.tagName.toLowerCase()).toBe("table");
  expect(wrapper.attributes("data-slot")).toBe("table");
  expect(wrapper.attributes("id")).toBe("query-results");
  expect(wrapper.attributes("aria-describedby")).toBe("query-help");
  expect(wrapper.findAll('[data-slot="table"]')).toHaveLength(1);
  expect(wrapper.get("caption").text()).toBe("Query results");
  expect(wrapper.findAll("thead")).toHaveLength(1);
  expect(wrapper.findAll("tbody")).toHaveLength(1);
  expect(wrapper.findAll("tr")).toHaveLength(2);
  expect(wrapper.findAll('th[scope="col"]')).toHaveLength(2);
  expect(wrapper.get('th[scope="row"]').text()).toBe("api");
  expect(wrapper.get("a").attributes("href")).toBe("/apps/api");
});

test("merges caller classes last on the native table", () => {
  const wrapper = mount(Table, {
    attrs: {
      class:
        "w-auto border-separate text-right text-base text-red-900 dark:text-red-100",
    },
  });

  expect(wrapper.classes()).toContain("w-auto");
  expect(wrapper.classes()).toContain("border-separate");
  expect(wrapper.classes()).toContain("text-right");
  expect(wrapper.classes()).toContain("text-base");
  expect(wrapper.classes()).toContain("text-red-900");
  expect(wrapper.classes()).not.toContain("w-full");
  expect(wrapper.classes()).not.toContain("border-collapse");
  expect(wrapper.classes()).not.toContain("text-left");
  expect(wrapper.classes()).not.toContain("text-sm");
  expect(wrapper.classes()).not.toContain("text-gray-950");
});

test("exposes the real table element without a wrapper", () => {
  const wrapper = mount(Table);

  expect(wrapper.vm.element).toBe(wrapper.element);
  expect(wrapper.element.parentElement?.querySelectorAll("table")).toHaveLength(
    1,
  );
});

test("ships equivalent parseable framework-native source", () => {
  expect(registrySource("vue", "Table.vue")).toBe(
    readFileSync(resolve("src/vue/table/Table.vue"), "utf8"),
  );

  expect(() =>
    parse(registrySource("react", "Table.jsx"), {
      sourceType: "module",
      plugins: ["jsx"],
    }),
  ).not.toThrow();

  const result = compile(registrySource("svelte", "Table.svelte"), {
    filename: "Table.svelte",
    generate: false,
  });

  expect(result.warnings).toEqual([]);
});

test("does not absorb DataTable state or repeat native anatomy", () => {
  for (const [framework, filename] of [
    ["vue", "Table.vue"],
    ["react", "Table.jsx"],
    ["svelte", "Table.svelte"],
  ]) {
    const source = registrySource(framework, filename);

    expect(source).toContain('data-slot="table"');
    expect(source).toContain("tailwind-merge");
    expect(source).not.toMatch(
      /TableHead|TableBody|TableRow|TableCell|TableCaption/,
    );
    expect(source).not.toMatch(
      /\b(?:variant|density|columns|sorting|filtering|pagination|selection)\b/i,
    );
    expect(source).not.toMatch(/localStorage|sessionStorage|URLSearchParams/);
  }
});
