import { expect, test } from "@rstest/core";
import { mount } from "@vue/test-utils";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { parse } from "@babel/parser";
import { compile } from "svelte/compiler";
import Alert from "../src/vue/alert/Alert.vue";

function registrySource(framework, filename) {
  return readFileSync(resolve(`registry/alert/${framework}/${filename}`), "utf8");
}

test("renders a shallow, silent notice surface by default", () => {
  const wrapper = mount(Alert, {
    slots: {
      default: "<p>Changes are saved automatically.</p>",
    },
  });

  expect(wrapper.element.tagName.toLowerCase()).toBe("div");
  expect(wrapper.attributes("data-slot")).toBe("alert");
  expect(wrapper.attributes("role")).toBeUndefined();
  expect(wrapper.attributes("aria-live")).toBeUndefined();
  expect(wrapper.findAll('[data-slot="alert"]')).toHaveLength(1);
  expect(wrapper.get("p").text()).toBe("Changes are saved automatically.");
});

test("lets the application choose the native container and accessibility semantics", () => {
  const wrapper = mount(Alert, {
    props: { as: "section" },
    attrs: {
      id: "deployment-warning",
      role: "alert",
      "aria-labelledby": "deployment-warning-title",
      "aria-describedby": "deployment-warning-copy",
    },
    slots: {
      default: `
        <h2 id="deployment-warning-title">Deployment failed</h2>
        <p id="deployment-warning-copy">The server could not be reached.</p>
        <button type="button">Try again</button>
      `,
    },
  });

  expect(wrapper.element.tagName.toLowerCase()).toBe("section");
  expect(wrapper.attributes("id")).toBe("deployment-warning");
  expect(wrapper.attributes("role")).toBe("alert");
  expect(wrapper.attributes("aria-labelledby")).toBe("deployment-warning-title");
  expect(wrapper.attributes("aria-describedby")).toBe("deployment-warning-copy");
  expect(wrapper.findAll("h2")).toHaveLength(1);
  expect(wrapper.findAll("p")).toHaveLength(1);
  expect(wrapper.get("button").attributes("type")).toBe("button");
});

test("keeps checklist anatomy native and application owned", () => {
  const wrapper = mount(Alert, {
    props: { as: "section" },
    slots: {
      default: `
        <h2>Deployment checklist</h2>
        <ul>
          <li><strong>SESSION_SECRET is missing</strong><button type="button">Generate</button></li>
          <li><strong>PostgreSQL is not attached</strong><a href="/services">Add service</a></li>
        </ul>
      `,
    },
  });

  expect(wrapper.findAll("ul")).toHaveLength(1);
  expect(wrapper.findAll("li")).toHaveLength(2);
  expect(wrapper.findAll("button")).toHaveLength(1);
  expect(wrapper.get("a").attributes("href")).toBe("/services");
  expect(wrapper.find('[data-slot="alert-item"]').exists()).toBe(false);
});

test("lets caller Tailwind classes replace every neutral visual default", () => {
  const wrapper = mount(Alert, {
    attrs: {
      class:
        "rounded-none border-2 border-black bg-amber-50 p-6 text-base text-black shadow-[4px_4px_0_0_#000] dark:bg-amber-50 dark:text-black",
    },
  });

  expect(wrapper.classes()).toContain("rounded-none");
  expect(wrapper.classes()).toContain("bg-amber-50");
  expect(wrapper.classes()).toContain("p-6");
  expect(wrapper.classes()).toContain("text-base");
  expect(wrapper.classes()).toContain("text-black");
  expect(wrapper.classes()).not.toContain("rounded-md");
  expect(wrapper.classes()).not.toContain("bg-gray-100");
  expect(wrapper.classes()).not.toContain("p-4");
  expect(wrapper.classes()).not.toContain("text-sm");
});

test("ships equivalent parseable framework-native source", () => {
  expect(registrySource("vue", "Alert.vue")).toBe(
    readFileSync(resolve("src/vue/alert/Alert.vue"), "utf8"),
  );

  expect(() =>
    parse(registrySource("react", "Alert.jsx"), {
      sourceType: "module",
      plugins: ["jsx"],
    }),
  ).not.toThrow();

  const result = compile(registrySource("svelte", "Alert.svelte"), {
    filename: "Alert.svelte",
    generate: false,
  });

  expect(result.warnings).toEqual([]);
});

test("does not expose visual meaning or verbose anatomy APIs", () => {
  const props = Alert.props ?? {};

  expect(props).toHaveProperty("as");
  for (const name of [
    "variant",
    "severity",
    "tone",
    "status",
    "color",
    "icon",
    "dismissible",
  ]) {
    expect(props).not.toHaveProperty(name);
  }

  for (const [framework, filename] of [
    ["vue", "Alert.vue"],
    ["react", "Alert.jsx"],
    ["svelte", "Alert.svelte"],
  ]) {
    const source = registrySource(framework, filename);

    expect(source).toContain('data-slot="alert"');
    expect(source).toContain("tailwind-merge");
    expect(source).not.toMatch(/AlertTitle|AlertDescription|AlertItem/);
    expect(source).not.toMatch(/role=["'](?:alert|status|note)["']/);
    expect(source).not.toMatch(/aria-live=/);
    expect(source).not.toMatch(/\b(?:variant|severity|tone|status|color|icon|dismissible)\s*(?::|=(?!=))/i);
    expect(source).not.toMatch(/localStorage|sessionStorage|URLSearchParams/);
  }
});
