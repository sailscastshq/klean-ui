import { expect, test } from "@rstest/core";
import { mount } from "@vue/test-utils";
import { router } from "@inertiajs/vue3";
import { parse } from "@babel/parser";
import { compile } from "svelte/compiler";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import Pagination from "../src/vue/pagination/Pagination.vue";

function registrySource(framework, filename) {
  return readFileSync(
    resolve(`registry/pagination/${framework}/${filename}`),
    "utf8",
  );
}

function setUrl(url) {
  window.history.replaceState({}, "", url);
}

test("renders labelled native navigation and truthful page state", () => {
  setUrl("/projects?search=mail&page=4&sort=updated#results");
  const wrapper = mount(Pagination, { props: { page: 4, pages: 12 } });

  expect(wrapper.element.tagName).toBe("NAV");
  expect(wrapper.attributes("aria-label")).toBe("Pagination");
  expect(wrapper.findAll(":scope > ul")).toHaveLength(1);
  expect(wrapper.findAll("li").length).toBeGreaterThan(3);

  const current = wrapper.get('[data-slot="page"][data-page="4"]');
  expect(current.element.tagName).toBe("A");
  expect(current.attributes("aria-current")).toBe("page");
  expect(current.attributes("aria-label")).toBe("Page 4, current page");
  expect(current.classes()).toContain("cursor-pointer");
});

test("preserves the current URL while changing only page", () => {
  setUrl("/projects?search=mail&page=4&sort=updated#results");
  const wrapper = mount(Pagination, { props: { page: 4, pages: 12 } });

  expect(wrapper.get('[data-slot="previous"]').attributes("href")).toBe(
    "/projects?search=mail&page=3&sort=updated#results",
  );
  expect(wrapper.get('[data-slot="next"]').attributes("href")).toBe(
    "/projects?search=mail&page=5&sort=updated#results",
  );
  expect(
    wrapper.get('[data-slot="page"][data-page="1"]').attributes("href"),
  ).toBe("/projects?search=mail&sort=updated#results");
});

test("uses unavailable edge semantics without fake links", () => {
  setUrl("/audit-log?q=deploy");
  const first = mount(Pagination, { props: { page: 1, pages: 3 } });
  const previous = first.get('[data-slot="previous"]');

  expect(previous.element.tagName).toBe("SPAN");
  expect(previous.attributes("aria-disabled")).toBe("true");
  expect(previous.attributes("href")).toBeUndefined();
  expect(first.get('[data-slot="next"]').element.tagName).toBe("A");

  const last = mount(Pagination, { props: { page: 3, pages: 3 } });
  const next = last.get('[data-slot="next"]');
  expect(next.element.tagName).toBe("SPAN");
  expect(next.attributes("aria-disabled")).toBe("true");
  expect(next.attributes("href")).toBeUndefined();
});

test("recovers focus after the activated edge link disappears", async () => {
  setUrl("/projects?page=4");
  const visit = router.visit;
  router.visit = (_href, options) => options.onStart?.({});
  const wrapper = mount(Pagination, {
    attachTo: document.body,
    props: { page: 4, pages: 5 },
  });

  try {
    const next = wrapper.get('[data-slot="next"]');
    next.element.focus();
    await next.trigger("click", { button: 0 });
    await wrapper.setProps({ page: 5 });
    document.dispatchEvent(new CustomEvent("inertia:navigate"));
    await wrapper.vm.$nextTick();
    await Promise.resolve();

    expect(document.activeElement).toBe(
      wrapper.get('[data-slot="page"][data-page="5"]').element,
    );
    expect(wrapper.attributes("aria-busy")).toBeUndefined();
  } finally {
    wrapper.unmount();
    router.visit = visit;
  }
});

test("keeps mobile compact and desktop page discovery automatic", () => {
  setUrl("/logs?page=50");
  const wrapper = mount(Pagination, { props: { page: 50, pages: 100 } });

  expect(wrapper.get('[data-slot="summary"]').text()).toBe("Page 50 of 100");
  expect(wrapper.get('[data-slot="summary"]').attributes("aria-current")).toBe(
    "page",
  );
  expect(wrapper.findAll('[data-slot="ellipsis"]')).toHaveLength(2);
  expect(
    wrapper
      .findAll('[data-slot="page"]')
      .map((link) => Number(link.attributes("data-page"))),
  ).toEqual([1, 49, 50, 51, 100]);
});

test("hides pagination when navigation has no destination", () => {
  setUrl("/projects");
  const wrapper = mount(Pagination, { props: { page: 1, pages: 1 } });

  expect(wrapper.html()).toBe("<!--v-if-->");
  expect(wrapper.find('[data-slot="pagination"]').exists()).toBe(false);
});

test("keeps the common API lean and forwards ordinary nav attributes", () => {
  setUrl("/projects?page=2");
  const wrapper = mount(Pagination, {
    props: { page: 2, pages: 4, only: ["projects", "pagination"] },
    attrs: {
      "aria-label": "Project pages",
      "data-test": "project-pagination",
      class: "max-w-xl",
    },
  });

  expect(wrapper.attributes("aria-label")).toBe("Project pages");
  expect(wrapper.attributes("data-test")).toBe("project-pagination");
  expect(wrapper.classes()).toContain("max-w-xl");

  const props = Pagination.props ?? {};
  expect(Object.keys(props).sort()).toEqual(["only", "page", "pages"]);
  for (const name of [
    "variant",
    "size",
    "items",
    "href",
    "link",
    "linkAs",
    "siblingCount",
  ]) {
    expect(props).not.toHaveProperty(name);
  }
});

test("ships equivalent framework-native registry source", () => {
  expect(registrySource("vue", "Pagination.vue")).toBe(
    readFileSync(resolve("src/vue/pagination/Pagination.vue"), "utf8"),
  );

  expect(() =>
    parse(registrySource("react", "Pagination.jsx"), {
      sourceType: "module",
      plugins: ["jsx"],
    }),
  ).not.toThrow();

  const result = compile(registrySource("svelte", "Pagination.svelte"), {
    filename: "Pagination.svelte",
    generate: false,
  });
  expect(result.warnings).toEqual([]);
});

test("keeps the durable Link and URL contract in every framework", () => {
  for (const [framework, filename, adapter] of [
    ["vue", "Pagination.vue", "@inertiajs/vue3"],
    ["react", "Pagination.jsx", "@inertiajs/react"],
    ["svelte", "Pagination.svelte", "@inertiajs/svelte"],
  ]) {
    const source = registrySource(framework, filename);

    expect(source).toContain(adapter);
    expect(source).toContain("preserveScroll");
    expect(source).toContain("preserveState");
    expect(source).toContain("searchParams.delete");
    expect(source).toContain('data-slot="pagination"');
    expect(source).toContain('data-slot="page"');
    expect(source).toContain('aria-current="page"');
    expect(source).not.toMatch(/localStorage|sessionStorage/);
    expect(source).not.toMatch(
      /\b(?:variant|size|siblingCount|hrefBuilder)\s*(?::|=)/,
    );
  }
});
