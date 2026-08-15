import { expect, test } from "@rstest/core";
import { mount } from "@vue/test-utils";
import { parse } from "@babel/parser";
import { compile } from "svelte/compiler";
import { defineComponent } from "vue";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import Badge from "../src/vue/badge/Badge.vue";

function registrySource(framework, filename) {
  return readFileSync(
    resolve(`registry/badge/${framework}/${filename}`),
    "utf8",
  );
}

test("renders one static inline metadata span by default", () => {
  const wrapper = mount(Badge, {
    attrs: { id: "invoice-status", title: "Invoice status" },
    slots: { default: "Paid" },
  });

  expect(wrapper.element.tagName.toLowerCase()).toBe("span");
  expect(wrapper.attributes("data-slot")).toBe("badge");
  expect(wrapper.attributes("id")).toBe("invoice-status");
  expect(wrapper.attributes("title")).toBe("Invoice status");
  expect(wrapper.text()).toBe("Paid");
  expect(wrapper.attributes("role")).toBeUndefined();
  expect(wrapper.attributes("aria-live")).toBeUndefined();
  expect(wrapper.attributes("tabindex")).toBeUndefined();
  expect(wrapper.findAll('[data-slot="badge"]')).toHaveLength(1);
  expect(wrapper.vm.element).toBe(wrapper.element);
});

test("keeps a notification button as the interactive semantic owner", () => {
  const Notification = defineComponent({
    components: { Badge },
    template: `
      <button type="button" aria-label="Notifications, 3 unread" class="relative">
        <svg aria-hidden="true" viewBox="0 0 24 24"></svg>
        <Badge aria-hidden="true">3</Badge>
      </button>
    `,
  });
  const wrapper = mount(Notification);
  const button = wrapper.get("button");
  const badge = wrapper.getComponent(Badge);

  expect(button.attributes("type")).toBe("button");
  expect(button.attributes("aria-label")).toBe("Notifications, 3 unread");
  expect(badge.element.tagName.toLowerCase()).toBe("span");
  expect(badge.attributes("aria-hidden")).toBe("true");
  expect(badge.attributes("role")).toBeUndefined();
});

test("allows deliberate live status semantics through ordinary attributes", () => {
  const wrapper = mount(Badge, {
    attrs: { role: "status", "aria-live": "polite", "aria-atomic": "true" },
    slots: { default: "Deployment complete" },
  });

  expect(wrapper.attributes("role")).toBe("status");
  expect(wrapper.attributes("aria-live")).toBe("polite");
  expect(wrapper.attributes("aria-atomic")).toBe("true");
});

test("supports visible text with screen-reader-only context", () => {
  const wrapper = mount(Badge, {
    slots: {
      default: '3 <span class="sr-only">unread notifications</span>',
    },
  });

  expect(wrapper.text()).toContain("3");
  expect(wrapper.get(".sr-only").text()).toBe("unread notifications");
});

test("lets caller Tailwind classes replace every neutral visual default", () => {
  const wrapper = mount(Badge, {
    attrs: {
      class:
        "gap-1 rounded-none border-black bg-black px-3 py-1 text-[10px] font-bold text-white uppercase tracking-[0.18em] dark:bg-white dark:text-black",
    },
  });

  for (const className of [
    "gap-1",
    "rounded-none",
    "border-black",
    "bg-black",
    "px-3",
    "py-1",
    "text-[10px]",
    "font-bold",
    "text-white",
    "uppercase",
    "tracking-[0.18em]",
  ]) {
    expect(wrapper.classes()).toContain(className);
  }

  for (const className of [
    "gap-1.5",
    "rounded-full",
    "border-transparent",
    "bg-gray-100",
    "px-2",
    "py-0.5",
    "text-xs",
    "font-medium",
    "text-gray-700",
  ]) {
    expect(wrapper.classes()).not.toContain(className);
  }
});

test("ships equivalent parseable framework-native source", () => {
  expect(registrySource("vue", "Badge.vue")).toBe(
    readFileSync(resolve("src/vue/badge/Badge.vue"), "utf8"),
  );

  expect(() =>
    parse(registrySource("react", "Badge.jsx"), {
      sourceType: "module",
      plugins: ["jsx"],
    }),
  ).not.toThrow();

  const result = compile(registrySource("svelte", "Badge.svelte"), {
    filename: "Badge.svelte",
    generate: false,
  });

  expect(result.warnings).toEqual([]);
});

test("does not expose polymorphism, interaction, variants, or durability", () => {
  const props = Badge.props ?? {};

  expect(props).not.toHaveProperty("as");
  for (const name of [
    "variant",
    "severity",
    "tone",
    "status",
    "color",
    "size",
    "pill",
    "removable",
  ]) {
    expect(props).not.toHaveProperty(name);
  }

  for (const [framework, filename] of [
    ["vue", "Badge.vue"],
    ["react", "Badge.jsx"],
    ["svelte", "Badge.svelte"],
  ]) {
    const source = registrySource(framework, filename);

    expect(source).toContain('data-slot="badge"');
    expect(source).toContain("tailwind-merge");
    expect(source).not.toMatch(/\bas\s*(?::|=(?!=))/);
    expect(source).not.toMatch(/<a\b|<button\b|onClick=|@click=|onclick=/i);
    expect(source).not.toMatch(/role=["']status["']|aria-live=/);
    expect(source).not.toMatch(
      /\b(?:variant|severity|tone|status|color|size|pill|removable)\s*(?::|=(?!=))/i,
    );
    expect(source).not.toMatch(/localStorage|sessionStorage|URLSearchParams/);
  }
});
