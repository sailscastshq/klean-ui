import { readFileSync } from "node:fs";
import { expect, test } from "@rstest/core";
import vueMeta, {
  Convention as VueConvention,
} from "../stories/Theming.stories.js";

const root = new URL("..", import.meta.url);

function read(path) {
  return readFileSync(new URL(path, root), "utf8");
}

test("proves the same zero-configuration theming contract in every framework", () => {
  expect(vueMeta.title).toBe("Klean UI/Theming");
  expect(vueMeta.parameters.controls.disable).toBe(true);
  expect(vueMeta.parameters.docs.description.component).toContain(
    "Theme in CSS. Style with Tailwind.",
  );
  expect(VueConvention.name).toBe("Zero configuration");
  expect(VueConvention.play).toBeTypeOf("function");

  for (const path of [
    "stories/react/Theming.stories.jsx",
    "stories/svelte/Theming.stories.js",
  ]) {
    const source = read(path);
    expect(source).toContain("Klean UI/Theming");
    expect(source).toContain("Zero configuration");
    expect(source).toContain("controls: { disable: true }");
    expect(source).toContain("Theme in CSS. Style with Tailwind.");
    expect(source).toContain("play: async");
  }
});

test("keeps theme state in CSS and outside component APIs", () => {
  const stylesheet = read("src/styles.css");

  expect(stylesheet).toContain("@theme inline");
  expect(stylesheet).toContain("--color-app-canvas: var(--app-canvas)");
  expect(stylesheet).toContain('[data-mode="light"]');
  expect(stylesheet).toContain('[data-mode="dark"]');
  expect(stylesheet).toContain("color-scheme: light");
  expect(stylesheet).toContain("color-scheme: dark");
});

test("keeps visual choice in Tailwind and repeated concepts in app source", () => {
  const sources = [
    read("stories/Theming.stories.js"),
    read("stories/react/Theming.stories.jsx"),
    read("stories/svelte/ThemingExample.svelte"),
  ];

  for (const source of sources) {
    expect(source).toContain("rounded-none bg-emerald-700");
    expect(source).toContain("bg-app-brand text-app-on-brand");
    expect(source).toContain('data-mode="light"');
    expect(source).toContain('data-mode="dark"');
    expect(source).toContain("forced-colors:border-[ButtonText]");
    expect(source).not.toMatch(/(?:variant|theme|appearance|tone|color)=/);
  }

  expect(read("stories/Theming.stories.js")).toContain("ProductButton");
  expect(read("stories/react/Theming.stories.jsx")).toContain(
    "function ProductButton",
  );
  expect(read("stories/svelte/ThemingExample.svelte")).toContain(
    "ThemingProductButton.svelte",
  );
});
