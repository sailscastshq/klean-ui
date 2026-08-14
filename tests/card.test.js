import { expect, test } from "@rstest/core";
import { mount } from "@vue/test-utils";
import { parse } from "@babel/parser";
import { compile } from "svelte/compiler";
import { defineComponent, h, markRaw } from "vue";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import Card from "../src/vue/card/Card.vue";

function registrySource(framework, filename) {
  return readFileSync(
    resolve(`registry/card/${framework}/${filename}`),
    "utf8",
  );
}

test("renders one shallow, semantically neutral surface by default", () => {
  const wrapper = mount(Card, {
    attrs: { id: "account-summary", "data-test": "summary" },
    slots: {
      default: "<h2>Account summary</h2><p>Three active projects.</p>",
    },
  });

  expect(wrapper.element.tagName.toLowerCase()).toBe("div");
  expect(wrapper.attributes("data-slot")).toBe("card");
  expect(wrapper.attributes("id")).toBe("account-summary");
  expect(wrapper.attributes("data-test")).toBe("summary");
  expect(wrapper.findAll('[data-slot="card"]')).toHaveLength(1);
  expect(wrapper.findAll("h2")).toHaveLength(1);
  expect(wrapper.findAll("p")).toHaveLength(1);
  expect(wrapper.vm.element).toBe(wrapper.element);
});

test("lets the application choose a truthful native element", () => {
  const article = mount(Card, {
    props: { as: "article" },
    attrs: { "aria-labelledby": "invoice-card-title" },
    slots: { default: '<h2 id="invoice-card-title">Invoice INV-1042</h2>' },
  });

  expect(article.element.tagName.toLowerCase()).toBe("article");
  expect(article.attributes("aria-labelledby")).toBe("invoice-card-title");
  expect(article.attributes("role")).toBeUndefined();
});

test("keeps navigation as a real anchor and forwards its destination and event", async () => {
  let clicks = 0;
  const wrapper = mount(Card, {
    props: { as: "a" },
    attrs: {
      href: "/invoices/INV-1042",
      target: "_blank",
      rel: "noreferrer",
      onClick: () => {
        clicks += 1;
      },
    },
    slots: { default: "Invoice INV-1042" },
  });

  expect(wrapper.element.tagName.toLowerCase()).toBe("a");
  expect(wrapper.attributes("href")).toBe("/invoices/INV-1042");
  expect(wrapper.attributes("target")).toBe("_blank");
  expect(wrapper.attributes("rel")).toBe("noreferrer");
  expect(wrapper.attributes("tabindex")).toBeUndefined();

  await wrapper.trigger("click");
  expect(clicks).toBe(1);
});

test("accepts a framework component without inventing a link adapter", () => {
  const LinkStub = defineComponent({
    inheritAttrs: false,
    setup(_, { attrs, slots }) {
      return () => h("a", attrs, slots.default?.());
    },
  });
  const wrapper = mount(Card, {
    props: { as: markRaw(LinkStub) },
    attrs: { href: "/projects/slipway", "data-prefetch": "hover" },
    slots: { default: "Slipway" },
  });

  expect(wrapper.element.tagName.toLowerCase()).toBe("a");
  expect(wrapper.attributes("href")).toBe("/projects/slipway");
  expect(wrapper.attributes("data-prefetch")).toBe("hover");
  expect(wrapper.attributes("data-slot")).toBe("card");
});

test("lets caller Tailwind own every visual decision", () => {
  const wrapper = mount(Card, {
    attrs: {
      class:
        "rounded-none border-2 border-black bg-amber-50 p-8 text-base text-black shadow-[5px_5px_0_0_#000] dark:border-white dark:bg-black dark:text-white",
    },
  });

  for (const className of [
    "rounded-none",
    "border-2",
    "border-black",
    "bg-amber-50",
    "p-8",
    "text-base",
    "text-black",
    "shadow-[5px_5px_0_0_#000]",
  ]) {
    expect(wrapper.classes()).toContain(className);
  }

  for (const className of [
    "rounded-lg",
    "border-gray-200",
    "bg-white",
    "p-5",
    "text-gray-950",
  ]) {
    expect(wrapper.classes()).not.toContain(className);
  }
});

test("ships equivalent parseable framework-native source", () => {
  expect(registrySource("vue", "Card.vue")).toBe(
    readFileSync(resolve("src/vue/card/Card.vue"), "utf8"),
  );

  expect(() =>
    parse(registrySource("react", "Card.jsx"), {
      sourceType: "module",
      plugins: ["jsx"],
    }),
  ).not.toThrow();

  const result = compile(registrySource("svelte", "Card.svelte"), {
    filename: "Card.svelte",
    generate: false,
  });

  expect(result.warnings).toEqual([]);
});

test("keeps anatomy, visual variants, interaction, and persistence out of Card", () => {
  for (const [framework, filename] of [
    ["vue", "Card.vue"],
    ["react", "Card.jsx"],
    ["svelte", "Card.svelte"],
  ]) {
    const source = registrySource(framework, filename);

    expect(source).toContain('data-slot="card"');
    expect(source).toContain("tailwind-merge");
    expect(source).not.toMatch(
      /CardHeader|CardTitle|CardDescription|CardContent|CardFooter/,
    );
    expect(source).not.toMatch(
      /\b(?:variant|tone|interactive|clickable|shadow|radius|padding|size|header|status)\s*(?::|=(?!=))/i,
    );
    expect(source).not.toMatch(/localStorage|sessionStorage|URLSearchParams/);
    expect(source).not.toMatch(
      /onClick=.*(?:navigate|router)|@click=.*(?:navigate|router)/,
    );
  }
});
