import { expect, test } from "@rstest/core";
import inputMeta, {
  Playground as InputPlayground,
} from "../stories/Input.stories.js";
import textareaMeta, {
  Playground as TextareaPlayground,
} from "../stories/Textarea.stories.js";
import { Playground as PopoverPlayground } from "../stories/Popover.stories.js";
import {
  Playground as MenuPlayground,
  Products as MenuProducts,
  Semantics as MenuSemantics,
} from "../stories/Menu.stories.js";
import {
  Motion as ToastMotion,
  Playground as ToastPlayground,
  ReducedMotion as ToastReducedMotion,
} from "../stories/Toast.stories.js";
import { Playground as SlidePlayground } from "../stories/Slide.stories.js";
import { Products as SelectProducts } from "../stories/Select.stories.js";
import { readFileSync } from "node:fs";

const usefulControls = [
  "label",
  "help",
  "error",
  "placeholder",
  "disabled",
  "required",
];

test("keeps form playground controls focused on useful visible state", () => {
  expect(InputPlayground.parameters.controls.include).toEqual(usefulControls);
  expect(TextareaPlayground.parameters.controls.include).toEqual(
    usefulControls,
  );
});

test("keeps story composition out of the component-level API", () => {
  for (const meta of [inputMeta, textareaMeta]) {
    expect(meta.args).not.toHaveProperty("label");
    expect(meta.args).not.toHaveProperty("help");
    expect(meta.args).not.toHaveProperty("error");
  }
});

test("keeps Popover controls behavioral and composition-sized", () => {
  expect(PopoverPlayground.parameters.controls.include).toEqual([
    "label",
    "placement",
    "offset",
    "disabled",
    "class",
  ]);
});

test("keeps Menu controls behavioral and composition-sized", () => {
  expect(MenuPlayground.parameters.controls.include).toEqual([
    "label",
    "placement",
    "offset",
    "disabled",
    "class",
  ]);
  expect(MenuPlayground.play).toBeTypeOf("function");
});

test("keeps Slide controls limited to caller-owned action state", () => {
  expect(SlidePlayground.parameters.controls.include).toEqual([
    "label",
    "disabled",
    "pending",
    "class",
  ]);
});

test("makes Menu recipe cursor and Tab affordances explicit", () => {
  const semanticsStory = MenuSemantics.render();
  const semanticsClasses = semanticsStory.setup();
  const productsTemplate = MenuProducts.render().template;

  expect(semanticsClasses.itemClass).toContain("cursor-pointer");
  expect(semanticsClasses.itemClass).toContain("disabled:cursor-not-allowed");
  expect(semanticsClasses.dangerClass).toContain("cursor-pointer");
  expect(productsTemplate).toContain("cursor-pointer");
  expect(productsTemplate).toContain("cursor-not-allowed");
  expect(MenuSemantics.play).toBeTypeOf("function");
});

test("grounds the Select source-app recipe in Slipway instead of inventing Hagfish UI", () => {
  const productsTemplate = SelectProducts.render().template;

  expect(productsTemplate).toContain("Slipway / Bearing feedback");
  expect(productsTemplate).toContain("min-h-10 w-auto max-w-[16rem]");
  expect(productsTemplate).toContain("rounded-lg border-0 bg-gray-100");
  expect(productsTemplate).toContain("rounded-xl");
  expect(productsTemplate).toContain("shadow-gray-950/10");
  expect(productsTemplate).not.toContain("Hagfish");
  expect(productsTemplate).not.toContain("Invoice status");
  expect(productsTemplate).not.toContain("shadow-[4px_4px_0_0_#000]");
});

test("keeps full and reduced Toast motion independently reviewable", () => {
  const css = readFileSync("stories/shared/storybook.css", "utf8");

  expect(ToastPlayground.render({}).template).toContain(
    "klean-toast-motion-preview",
  );
  expect(ToastMotion.render().template).toContain("klean-toast-motion-preview");
  expect(ToastReducedMotion.render().template).toContain(
    "klean-toast-reduced-motion-preview",
  );
  expect(css).toContain(
    "animation-duration: var(--klean-toast-enter-duration) !important",
  );
  expect(css).toContain(
    "animation-duration: var(--klean-toast-leave-duration) !important",
  );
  expect(css).toContain("animation-duration: 1ms !important");
});
