import { expect, test } from "@rstest/core";
import { mount } from "@vue/test-utils";
import { parse } from "@babel/parser";
import { compile } from "svelte/compiler";
import { h } from "vue";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import AvatarGroup from "../src/vue/avatar-group/AvatarGroup.vue";

const people = [
  { src: "/ada.webp", alt: "Ada Okafor" },
  { src: "", alt: "Bayo Adeyemi" },
  { src: "/chi.webp", alt: "Chinedu Eze", fallback: "CE" },
  { src: "/dami.webp", alt: "Dami Bello" },
  { src: "/efe.webp", alt: "Efe Ighodaro" },
  { src: "/folake.webp", alt: "Folake Ade" },
];

function registrySource(framework, filename) {
  return readFileSync(
    resolve(`registry/avatar-group/${framework}/${filename}`),
    "utf8",
  );
}

test("renders every item as an Avatar inside a named group", () => {
  const wrapper = mount(AvatarGroup, {
    props: { items: people.slice(0, 3) },
    attrs: { "aria-label": "Maintainers", id: "maintainers" },
  });

  expect(wrapper.attributes("role")).toBe("group");
  expect(wrapper.attributes("data-slot")).toBe("avatar-group");
  expect(wrapper.attributes("aria-label")).toBe("Maintainers");
  expect(wrapper.attributes("id")).toBe("maintainers");
  expect(wrapper.findAll('[data-slot="avatar"]')).toHaveLength(3);
  expect(wrapper.find('[data-slot="avatar-group-overflow"]').exists()).toBe(
    false,
  );
});

test("falls back to initials, or the caller's fallback, when an image is missing", () => {
  const wrapper = mount(AvatarGroup, {
    props: { items: [{ src: "", alt: "Bayo Adeyemi" }, { alt: "Chinedu Eze", fallback: "CE" }] },
  });

  const fallbacks = wrapper.findAll('[data-state="fallback"]');
  expect(fallbacks.map((node) => node.text())).toEqual(["BA", "CE"]);
});

test("shows the first max items and counts the rest", () => {
  const wrapper = mount(AvatarGroup, { props: { items: people, max: 4 } });

  expect(wrapper.findAll('[data-slot="avatar"]')).toHaveLength(4);
  const overflow = wrapper.find('[data-slot="avatar-group-overflow"]');
  expect(overflow.text()).toBe("+2");
  expect(overflow.attributes("role")).toBe("img");
  expect(overflow.attributes("aria-label")).toBe("2 more");
});

test("counts against the aggregate total when items is a partial list", () => {
  const wrapper = mount(AvatarGroup, {
    props: { items: people, max: 5, total: 42 },
  });

  expect(wrapper.findAll('[data-slot="avatar"]')).toHaveLength(5);
  expect(wrapper.find('[data-slot="avatar-group-overflow"]').text()).toBe(
    "+37",
  );
});

test("never shows a negative or zero overflow", () => {
  const smallTotal = mount(AvatarGroup, {
    props: { items: people, max: 3, total: 2 },
  });
  expect(smallTotal.findAll('[data-slot="avatar"]')).toHaveLength(3);
  expect(
    smallTotal.find('[data-slot="avatar-group-overflow"]').exists(),
  ).toBe(false);

  const everyone = mount(AvatarGroup, { props: { items: people, max: 10 } });
  expect(
    everyone.find('[data-slot="avatar-group-overflow"]').exists(),
  ).toBe(false);
});

test("merges caller classes onto the root, avatars, and overflow", () => {
  const wrapper = mount(AvatarGroup, {
    props: {
      items: people,
      max: 1,
      avatarClass: "size-8 ring-4",
      overflowClass: "size-8 bg-gray-950 text-white",
    },
    attrs: { class: "-space-x-3" },
  });

  expect(wrapper.classes()).toContain("-space-x-3");
  expect(wrapper.classes()).not.toContain("-space-x-2");
  const avatar = wrapper.find('[data-slot="avatar"]');
  expect(avatar.classes()).toContain("size-8");
  expect(avatar.classes()).toContain("ring-4");
  expect(avatar.classes()).not.toContain("ring-2");
  const overflow = wrapper.find('[data-slot="avatar-group-overflow"]');
  expect(overflow.classes()).toContain("bg-gray-950");
  expect(overflow.classes()).not.toContain("bg-gray-100");
});

test("lets the caller render items and the overflow", () => {
  const wrapper = mount(AvatarGroup, {
    props: { items: people, max: 2, total: 9 },
    slots: {
      item: ({ item, index }) => h("a", { href: `/m/${index}` }, item.alt),
      overflow: ({ count }) => h("a", { href: "/maintainers" }, `${count} others`),
    },
  });

  expect(wrapper.findAll("a").map((node) => node.text())).toEqual([
    "Ada Okafor",
    "Bayo Adeyemi",
    "7 others",
  ]);
});

test("keeps the Vue workbench and installable registry source identical", () => {
  expect(registrySource("vue", "AvatarGroup.vue")).toBe(
    readFileSync(resolve("src/vue/avatar-group/AvatarGroup.vue"), "utf8"),
  );
});

test("ships parseable framework-native React source", () => {
  const source = registrySource("react", "AvatarGroup.jsx");

  expect(() =>
    parse(source, { sourceType: "module", plugins: ["jsx"] }),
  ).not.toThrow();
  expect(source).toContain('import Avatar from "../avatar/Avatar.jsx"');
  expect(source).toContain('role="group"');
  expect(source).toContain("renderOverflow(hidden)");
});

test("ships compiler-valid Svelte 5 source", () => {
  const source = registrySource("svelte", "AvatarGroup.svelte");
  const result = compile(source, {
    filename: "AvatarGroup.svelte",
    generate: false,
  });

  expect(result.warnings).toEqual([]);
  expect(source).toContain('import Avatar from "../avatar/Avatar.svelte"');
  expect(source).toContain("{@render overflow(hidden)}");
});
