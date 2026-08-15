import { expect, test } from "@rstest/core";
import { mount } from "@vue/test-utils";
import { parse } from "@babel/parser";
import { compile } from "svelte/compiler";
import { defineComponent, nextTick } from "vue";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import Avatar from "../src/vue/avatar/Avatar.vue";

function registrySource(framework, filename) {
  return readFileSync(
    resolve(`registry/avatar/${framework}/${filename}`),
    "utf8",
  );
}

test("uses the native image element and forwards native image attributes", () => {
  const wrapper = mount(Avatar, {
    props: { src: "/avatars/ada.webp", alt: "Ada Okafor" },
    attrs: {
      id: "creator-avatar",
      loading: "lazy",
      decoding: "async",
      referrerpolicy: "no-referrer",
    },
    slots: { default: "AO" },
  });

  expect(wrapper.element.tagName.toLowerCase()).toBe("img");
  expect(wrapper.attributes("data-slot")).toBe("avatar");
  expect(wrapper.attributes("data-state")).toBe("image");
  expect(wrapper.attributes("src")).toBe("/avatars/ada.webp");
  expect(wrapper.attributes("alt")).toBe("Ada Okafor");
  expect(wrapper.attributes("loading")).toBe("lazy");
  expect(wrapper.attributes("decoding")).toBe("async");
  expect(wrapper.attributes("referrerpolicy")).toBe("no-referrer");
  expect(wrapper.text()).toBe("");
  expect(wrapper.vm.element).toBe(wrapper.element);
});

test("uses the fallback as one correctly named image when source is absent", () => {
  const wrapper = mount(Avatar, {
    props: { alt: "Ada Okafor" },
    attrs: { title: "Creator" },
    slots: { default: "AO" },
  });

  expect(wrapper.element.tagName.toLowerCase()).toBe("span");
  expect(wrapper.attributes("data-state")).toBe("fallback");
  expect(wrapper.attributes("role")).toBe("img");
  expect(wrapper.attributes("aria-label")).toBe("Ada Okafor");
  expect(wrapper.attributes("title")).toBe("Creator");
  expect(wrapper.text()).toBe("AO");
});

test("keeps a decorative fallback out of the accessibility tree", () => {
  const wrapper = mount(Avatar, {
    props: { alt: "" },
    slots: { default: "SW" },
  });

  expect(wrapper.attributes("aria-hidden")).toBe("true");
  expect(wrapper.attributes("role")).toBeUndefined();
  expect(wrapper.attributes("aria-label")).toBeUndefined();
});

test("honors deliberate caller fallback semantics", () => {
  const wrapper = mount(Avatar, {
    props: { alt: "Team logo" },
    attrs: { "aria-hidden": "true" },
    slots: { default: "SW" },
  });

  expect(wrapper.attributes("aria-hidden")).toBe("true");
  expect(wrapper.attributes("role")).toBeUndefined();
  expect(wrapper.attributes("aria-label")).toBeUndefined();
});

test("replaces a failed image and retries a changed source", async () => {
  let errors = 0;
  const wrapper = mount(Avatar, {
    props: { src: "/avatars/missing.webp", alt: "Ada Okafor" },
    attrs: {
      onError() {
        errors += 1;
      },
    },
    slots: { default: "AO" },
  });

  await wrapper.get("img").trigger("error");
  expect(errors).toBe(1);
  expect(wrapper.element.tagName.toLowerCase()).toBe("span");
  expect(wrapper.attributes("data-state")).toBe("fallback");
  expect(wrapper.text()).toBe("AO");

  await wrapper.setProps({ src: "/avatars/ada.webp" });
  await nextTick();
  expect(wrapper.element.tagName.toLowerCase()).toBe("img");
  expect(wrapper.attributes("src")).toBe("/avatars/ada.webp");
});

test("keeps image-only attributes off the fallback element", async () => {
  const wrapper = mount(Avatar, {
    props: { src: "/avatars/missing.webp", alt: "Ada Okafor" },
    attrs: {
      loading: "lazy",
      decoding: "async",
      sizes: "40px",
      srcset: "/avatar@2x.webp 2x",
    },
    slots: { default: "AO" },
  });

  await wrapper.get("img").trigger("error");
  for (const attribute of ["loading", "decoding", "sizes", "srcset"]) {
    expect(wrapper.attributes(attribute)).toBeUndefined();
  }
});

test("lets caller Tailwind replace the entire neutral visual default", () => {
  const wrapper = mount(Avatar, {
    props: { alt: "Hagfish creator" },
    attrs: {
      class:
        "size-6 rounded-none bg-black object-contain text-[10px] font-bold text-white ring-2 ring-black dark:bg-white dark:text-black",
    },
    slots: { default: "HF" },
  });

  for (const className of [
    "size-6",
    "rounded-none",
    "bg-black",
    "object-contain",
    "text-[10px]",
    "font-bold",
    "text-white",
    "ring-2",
    "ring-black",
  ]) {
    expect(wrapper.classes()).toContain(className);
  }

  for (const className of [
    "size-10",
    "rounded-full",
    "bg-gray-100",
    "object-cover",
    "text-sm",
    "font-medium",
    "text-gray-700",
  ]) {
    expect(wrapper.classes()).not.toContain(className);
  }
});

test("keeps buttons and links as the interactive owners", () => {
  const IdentityLink = defineComponent({
    components: { Avatar },
    template: `
      <a href="/settings/profile" class="flex items-center gap-2">
        <Avatar src="/avatars/ada.webp" alt="">AO</Avatar>
        <span>Ada Okafor</span>
      </a>
    `,
  });
  const wrapper = mount(IdentityLink);

  expect(wrapper.get("a").attributes("href")).toBe("/settings/profile");
  expect(wrapper.getComponent(Avatar).attributes("tabindex")).toBeUndefined();
  expect(wrapper.getComponent(Avatar).attributes("role")).toBeUndefined();
});

test("ships equivalent parseable framework-native source", () => {
  expect(registrySource("vue", "Avatar.vue")).toBe(
    readFileSync(resolve("src/vue/avatar/Avatar.vue"), "utf8"),
  );

  expect(() =>
    parse(registrySource("react", "Avatar.jsx"), {
      sourceType: "module",
      plugins: ["jsx"],
    }),
  ).not.toThrow();
  expect(registrySource("react", "Avatar.jsx")).toContain("useEffect");

  const result = compile(registrySource("svelte", "Avatar.svelte"), {
    filename: "Avatar.svelte",
    generate: false,
  });
  expect(result.warnings).toEqual([]);
  expect(registrySource("svelte", "Avatar.svelte")).toContain("$effect");
});

test("stays one component without visual variants or application state", () => {
  expect(Avatar.props.alt.required).toBe(true);
  for (const name of [
    "variant",
    "tone",
    "color",
    "size",
    "shape",
    "radius",
    "status",
    "presence",
    "fallback",
    "delayMs",
    "as",
  ]) {
    expect(Avatar.props).not.toHaveProperty(name);
  }

  for (const [framework, filename] of [
    ["vue", "Avatar.vue"],
    ["react", "Avatar.jsx"],
    ["svelte", "Avatar.svelte"],
  ]) {
    const source = registrySource(framework, filename);
    expect(source).toContain('data-slot="avatar"');
    expect(source).toContain('data-state="image"');
    expect(source).toContain('data-state="fallback"');
    expect(source).toContain("tailwind-merge");
    expect(source).not.toMatch(/Avatar(?:Root|Image|Fallback|Badge|Group)/);
    expect(source).not.toMatch(
      /\b(?:variant|tone|color|size|shape|radius|status|presence|delayMs|as)\s*(?::|=(?!=))/i,
    );
    expect(source).not.toMatch(/localStorage|sessionStorage|URLSearchParams/);
    expect(source).not.toMatch(/@radix-ui|base-ui|primevue|bits-ui|reka-ui/);
  }
});
