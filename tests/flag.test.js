import { expect, test } from "@rstest/core";
import { mount } from "@vue/test-utils";
import { readFileSync } from "node:fs";
import { parse } from "@babel/parser";
import { compile } from "svelte/compiler";
import Flag from "../src/vue/flag/Flag.vue";
import { countries, flagSource } from "../src/vue/flag/flags.js";

test("uses a fixed local registry and normalizes only two-letter codes", () => {
  expect(countries.length).toBe(257);
  expect(flagSource(" ng ")).toBe(flagSource("NG"));
  expect(flagSource("US")).toMatch(/^data:image\/svg\+xml;base64,/);
  for (const code of ["", "ZZ", "USA", "__proto__", null, 12])
    expect(flagSource(code)).toBe("");
  expect(flagSource("NG", "/custom.svg")).toBe("/custom.svg");
});

test("is decorative by default and caller Tailwind controls geometry", () => {
  const wrapper = mount(Flag, {
    props: { country: "ng" },
    attrs: { class: "w-12 aspect-square rounded-full", loading: "lazy" },
  });
  expect(wrapper.attributes("alt")).toBe("");
  expect(wrapper.attributes("loading")).toBe("lazy");
  expect(wrapper.classes()).toContain("w-12");
  expect(wrapper.classes()).not.toContain("w-6");
  expect(wrapper.classes()).toContain("aspect-square");
  expect(wrapper.classes()).not.toContain("aspect-3/2");
});

test("missing, invalid, and failed flags have accessible fallback and recover on source change", async () => {
  let errors = 0;
  const wrapper = mount(Flag, {
    props: { country: "ZZ", alt: "Country unavailable" },
    attrs: { onError: () => errors++ },
    slots: { default: "?" },
  });
  expect(wrapper.attributes("role")).toBe("img");
  expect(wrapper.attributes("aria-label")).toBe("Country unavailable");
  await wrapper.setProps({ country: "NG" });
  await wrapper.get("img").trigger("error");
  expect(errors).toBe(1);
  expect(wrapper.attributes("data-state")).toBe("fallback");
  await wrapper.setProps({ country: "KE", alt: "" });
  expect(wrapper.find("img").exists()).toBe(true);
  await wrapper.setProps({ country: "ZZ" });
  expect(wrapper.attributes("aria-hidden")).toBe("true");
});

test("custom source takes precedence and remains caller-owned", () => {
  const wrapper = mount(Flag, {
    props: { country: "NG", src: "/my-flag.svg", alt: "My organization" },
  });
  expect(wrapper.attributes("src")).toBe("/my-flag.svg");
  expect(wrapper.attributes("alt")).toBe("My organization");
});

test("ships valid framework-native sources and carries the asset license", () => {
  parse(readFileSync("registry/flag/react/Flag.jsx", "utf8"), {
    sourceType: "module",
    plugins: ["jsx"],
  });
  expect(
    compile(readFileSync("registry/flag/svelte/Flag.svelte", "utf8"), {
      filename: "Flag.svelte",
      generate: false,
    }).warnings,
  ).toEqual([]);
  const helper = readFileSync("registry/flag/shared/flags.js", "utf8");
  expect(helper).toContain("Copyright (c) 2020 @catamphetamine");
  expect(helper).toContain("THE SOFTWARE IS PROVIDED 'AS IS'");
  expect(helper).toBe(readFileSync("src/vue/flag/flags.js", "utf8"));
  expect(
    readFileSync("registry/flag/vue/Flag.vue", "utf8").replace(
      "../shared/flags.js",
      "./flags.js",
    ),
  ).toBe(readFileSync("src/vue/flag/Flag.vue", "utf8"));
});
