import { parse } from "@babel/parser";
import { beforeEach, expect, test } from "@rstest/core";
import { mount } from "@vue/test-utils";
import { compile } from "svelte/compiler";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { defineComponent, nextTick, ref } from "vue";
import Sidebar from "../src/vue/sidebar/Sidebar.vue";

function registrySource(framework, filename) {
  return readFileSync(
    resolve(`registry/sidebar/${framework}/${filename}`),
    "utf8",
  );
}

async function settle() {
  await nextTick();
  await Promise.resolve();
  await nextTick();
}

async function mountSidebar(options = {}) {
  const wrapper = mount(Sidebar, {
    attachTo: document.body,
    props: {
      id: options.id ?? "project-sidebar",
      defaultOpen: options.defaultOpen ?? true,
      remember: options.remember ?? true,
      ...(options.props ?? {}),
    },
    attrs: {
      "aria-label": "Project navigation",
      class:
        options.class ??
        "w-56 border-r data-[state=closed]:w-0 data-[state=closed]:opacity-0",
    },
    slots: {
      default:
        '<nav aria-label="Workspace"><a href="#projects">Projects</a></nav>',
    },
  });
  await settle();
  return wrapper;
}

beforeEach(() => {
  window.localStorage.clear();
  document.body.innerHTML = "";
});

test("renders one native aside while the caller owns navigation and styling", async () => {
  const wrapper = await mountSidebar({ remember: false });
  const sidebar = wrapper.get('[data-slot="sidebar"]');

  expect(sidebar.element.tagName).toBe("ASIDE");
  expect(sidebar.attributes("id")).toBe("project-sidebar");
  expect(sidebar.attributes("aria-label")).toBe("Project navigation");
  expect(sidebar.attributes("data-state")).toBe("open");
  expect(sidebar.attributes("data-restored")).toBe("true");
  expect(sidebar.attributes("aria-hidden")).toBeUndefined();
  expect(sidebar.attributes("inert")).toBeUndefined();
  expect(sidebar.classes()).toEqual(
    expect.arrayContaining([
      "min-w-0",
      "shrink-0",
      "overflow-hidden",
      "w-56",
      "border-r",
      "data-[state=closed]:w-0",
    ]),
  );
  expect(sidebar.get("nav").attributes("aria-label")).toBe("Workspace");
  expect(sidebar.get("a").attributes("href")).toBe("#projects");

  wrapper.unmount();
});

test("remembers an uncontrolled choice by id and makes closed content inert", async () => {
  const first = await mountSidebar();

  first.vm.hide();
  await settle();
  expect(first.attributes("data-state")).toBe("closed");
  expect(first.attributes("aria-hidden")).toBe("true");
  expect(first.attributes("inert")).toBe("");
  expect(
    window.localStorage.getItem("klean:sidebar:project-sidebar:open"),
  ).toBe("false");
  first.unmount();

  const restored = await mountSidebar({ defaultOpen: true });
  expect(restored.attributes("data-state")).toBe("closed");
  expect(restored.attributes("data-restored")).toBe("true");

  restored.vm.show();
  await settle();
  expect(restored.attributes("data-state")).toBe("open");
  expect(
    window.localStorage.getItem("klean:sidebar:project-sidebar:open"),
  ).toBe("true");
  restored.unmount();
});

test("keeps a controlled caller authoritative while emitting requested state", async () => {
  const wrapper = await mountSidebar({
    props: { open: true },
  });

  wrapper.vm.hide();
  await settle();

  expect(wrapper.attributes("data-state")).toBe("open");
  expect(wrapper.emitted("update:open")?.at(-1)).toEqual([false]);
  expect(
    window.localStorage.getItem("klean:sidebar:project-sidebar:open"),
  ).toBe("false");

  await wrapper.setProps({ open: false });
  expect(wrapper.attributes("data-state")).toBe("closed");
  wrapper.unmount();
});

test("supports framework-native v-model without a separate storage adapter", async () => {
  window.localStorage.setItem("klean:sidebar:bound-sidebar:open", "false");
  const open = ref(undefined);
  const wrapper = mount(
    defineComponent({
      components: { Sidebar },
      setup() {
        return { open };
      },
      template: `
        <Sidebar id="bound-sidebar" v-model:open="open" class="w-60 data-[state=closed]:w-0">
          <nav aria-label="Bound navigation">Navigation</nav>
        </Sidebar>
      `,
    }),
    { attachTo: document.body },
  );
  await settle();

  expect(open.value).toBe(false);
  expect(wrapper.get('[data-slot="sidebar"]').attributes("data-state")).toBe(
    "closed",
  );
  wrapper.unmount();
});

test("synchronizes remembered uncontrolled state across application tabs", async () => {
  const wrapper = await mountSidebar();
  const event = new StorageEvent("storage", {
    key: "klean:sidebar:project-sidebar:open",
    newValue: "false",
    oldValue: "true",
    storageArea: window.localStorage,
  });

  window.dispatchEvent(event);
  await settle();
  expect(wrapper.attributes("data-state")).toBe("closed");
  expect(wrapper.emitted("update:open")?.at(-1)).toEqual([false]);

  wrapper.unmount();
});

test("degrades safely when remembering is disabled or stored data is malformed", async () => {
  window.localStorage.setItem("klean:sidebar:project-sidebar:open", "maybe");
  const malformed = await mountSidebar({ defaultOpen: false });
  expect(malformed.attributes("data-state")).toBe("closed");
  malformed.unmount();

  const transient = await mountSidebar({
    id: "transient-sidebar",
    remember: false,
  });
  transient.vm.hide();
  await settle();
  expect(
    window.localStorage.getItem("klean:sidebar:transient-sidebar:open"),
  ).toBeNull();
  transient.unmount();
});

test("lets caller Tailwind replace structural timing without visual configuration props", async () => {
  const wrapper = await mountSidebar({
    remember: false,
    class: "w-72 duration-500 ease-linear data-[state=closed]:w-0",
  });

  expect(wrapper.classes()).toContain("duration-500");
  expect(wrapper.classes()).toContain("ease-linear");
  expect(wrapper.classes()).not.toContain("duration-200");
  expect(wrapper.classes()).not.toContain("ease-out");
  wrapper.unmount();
});

test("ships equal compiler-valid, router-free framework source", () => {
  const vue = registrySource("vue", "Sidebar.vue");
  const react = registrySource("react", "Sidebar.jsx");
  const svelte = registrySource("svelte", "Sidebar.svelte");

  expect(vue).toBe(
    readFileSync(resolve("src/vue/sidebar/Sidebar.vue"), "utf8"),
  );
  expect(() =>
    parse(react, { sourceType: "module", plugins: ["jsx"] }),
  ).not.toThrow();
  expect(
    compile(svelte, { filename: "Sidebar.svelte", generate: false }).warnings,
  ).toEqual([]);

  for (const source of [vue, react, svelte]) {
    expect(source).toContain('data-slot="sidebar"');
    expect(source).toContain("localStorage");
    expect(source).toContain("tailwind-merge");
    expect(source).not.toMatch(
      /@inertia|router|navigate\(|permissions|workspace/,
    );
    expect(source).not.toMatch(/\bvariant\b|\btone\b/i);
  }
});
