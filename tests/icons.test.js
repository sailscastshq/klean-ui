import { expect, test } from "@rstest/core";
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { parse } from "@babel/parser";
import { compile } from "svelte/compiler";
import { mount } from "@vue/test-utils";
import Trash from "../src/vue/icons/Trash.vue";

const metadata = JSON.parse(
  readFileSync(resolve("icons/metadata.json"), "utf8"),
);

function kebabCase(value) {
  return value
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/([A-Z])([A-Z][a-z])/g, "$1-$2")
    .toLowerCase();
}

test("keeps the complete proving-app vocabulary generated from canonical geometry", () => {
  const names = metadata.icons.map(({ name }) => name);
  const applicationIcons = metadata.icons.filter(
    ({ applications }) => applications.length,
  );
  const hagfishIcons = applicationIcons.filter(({ applications }) =>
    applications.includes("hagfish"),
  );
  const slipwayIcons = applicationIcons.filter(({ applications }) =>
    applications.includes("slipway"),
  );
  const sharedIcons = applicationIcons.filter(
    ({ applications }) => applications.length === 2,
  );

  expect(names).toHaveLength(98);
  expect(new Set(names).size).toBe(98);
  expect(applicationIcons).toHaveLength(97);
  expect(hagfishIcons).toHaveLength(64);
  expect(slipwayIcons).toHaveLength(71);
  expect(sharedIcons).toHaveLength(38);
  expect(
    metadata.icons.find(({ name }) => name === "Rocket").applications,
  ).toEqual([]);
  expect(names).toContain("ArrowRight");
  expect(names).toContain("Fingerprint");
  expect(names).toContain("Terminal");

  const result = spawnSync(
    process.execPath,
    ["scripts/generate-icons.mjs", "--check"],
    { cwd: process.cwd(), encoding: "utf8" },
  );

  expect(result.status).toBe(0);
  expect(result.stdout).toContain("Generated icon source is current.");
});

test("ships one dependency-free registry item per icon in every framework", () => {
  for (const icon of metadata.icons) {
    const registryName = `icon-${kebabCase(icon.name)}`;
    const manifest = JSON.parse(
      readFileSync(resolve(`registry/${registryName}/registry.json`), "utf8"),
    );

    expect(manifest.name).toBe(registryName);
    expect(manifest.kind).toBe("icon");

    for (const framework of ["vue", "react", "svelte"]) {
      expect(manifest.frameworks[framework].dependencies).toEqual({});
      expect(manifest.frameworks[framework].target).toMatch(
        new RegExp(`^icons/${icon.name}\\.(?:vue|jsx|svelte)$`),
      );
      expect(
        existsSync(
          resolve(
            `registry/${registryName}/${manifest.frameworks[framework].source}`,
          ),
        ),
      ).toBe(true);
    }
  }

  expect(existsSync(resolve("src/vue/icons/index.js"))).toBe(false);
});

test("keeps generated source idiomatic, parseable, and visually caller-owned", () => {
  for (const icon of metadata.icons) {
    const registryName = `icon-${kebabCase(icon.name)}`;
    const vue = readFileSync(
      resolve(`registry/${registryName}/vue/${icon.name}.vue`),
      "utf8",
    );
    const react = readFileSync(
      resolve(`registry/${registryName}/react/${icon.name}.jsx`),
      "utf8",
    );
    const svelte = readFileSync(
      resolve(`registry/${registryName}/svelte/${icon.name}.svelte`),
      "utf8",
    );

    expect(() =>
      parse(react, { sourceType: "module", plugins: ["jsx"] }),
    ).not.toThrow();
    expect(
      compile(svelte, {
        filename: `${icon.name}.svelte`,
        generate: false,
      }).warnings,
    ).toEqual([]);

    for (const source of [vue, react, svelte]) {
      expect(source).toContain('viewBox="0 0 24 24"');
      expect(source).toContain('stroke="currentColor"');
      expect(source).toContain('aria-hidden="true"');
      expect(source).toContain('focusable="false"');
      expect(source).toContain('data-slot="icon"');
      expect(source).not.toMatch(/\b(?:size|tone|weight|variant)\s*(?:=|:)/i);
      expect(source).not.toMatch(/#[0-9a-f]{3,8}|\b(?:rgb|hsl)a?\(/i);
      expect(source).not.toContain("tailwind-merge");
    }
  }
});

test("forwards native SVG customization while staying decorative by default", () => {
  const wrapper = mount(Trash, {
    attrs: {
      class: "size-7 text-red-600 stroke-2",
      "stroke-width": "2",
      "aria-hidden": "false",
      "aria-label": "Discarded items",
    },
  });

  const svg = wrapper.get("svg");
  expect(svg.attributes("class")).toContain("size-7");
  expect(svg.attributes("class")).toContain("text-red-600");
  expect(svg.attributes("stroke-width")).toBe("2");
  expect(svg.attributes("aria-hidden")).toBe("false");
  expect(svg.attributes("aria-label")).toBe("Discarded items");
});
