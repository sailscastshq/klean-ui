import { expect, test } from "@rstest/core";
import inputMeta, {
  Playground as InputPlayground,
} from "../stories/Input.stories.js";
import textareaMeta, {
  Playground as TextareaPlayground,
} from "../stories/Textarea.stories.js";
import {
  Apps as CheckboxApps,
  Playground as CheckboxPlayground,
  States as CheckboxStates,
} from "../stories/Checkbox.stories.js";
import {
  Apps as SwitchApps,
  Playground as SwitchPlayground,
  States as SwitchStates,
} from "../stories/Switch.stories.js";
import {
  Apps as RadioApps,
  Playground as RadioPlayground,
  States as RadioStates,
} from "../stories/Radio.stories.js";
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

test("keeps Checkbox controls useful and its recipes semantic", () => {
  expect(CheckboxPlayground.parameters.controls.include).toEqual([
    "label",
    "checked",
    "indeterminate",
    "disabled",
    "required",
    "class",
  ]);
  expect(CheckboxPlayground.play).toBeTypeOf("function");

  const statesTemplate = CheckboxStates.render().template;
  const appsTemplate = CheckboxApps.render().template;
  expect(statesTemplate).toContain("<fieldset");
  expect(statesTemplate).toContain("<legend");
  expect(statesTemplate).toContain(':indeterminate="partial"');
  expect(appsTemplate).toContain("Slipway / Logs");
  expect(appsTemplate).toContain("Hagfish / Sign in");
  expect(appsTemplate).toContain("text-red-600");
  expect(appsTemplate).toContain('class="sr-only"');
});

test("keeps Switch controls boolean-sized and its saving recipe durable", () => {
  expect(SwitchPlayground.parameters.controls.include).toEqual([
    "label",
    "description",
    "checked",
    "disabled",
    "required",
    "invalid",
    "class",
  ]);
  expect(SwitchPlayground.play).toBeTypeOf("function");

  const statesTemplate = SwitchStates.render().template;
  const appsTemplate = SwitchApps.render().template;
  expect(statesTemplate).toContain("min-h-20");
  expect(statesTemplate).toContain("checked:bg-emerald-600");
  expect(statesTemplate).toContain('aria-invalid="true"');
  expect(appsTemplate).toContain("Release flag");
  expect(appsTemplate).toContain("Durable optimistic setting");
  expect(SwitchApps.render().setup.toString()).toContain(
    "previous setting was restored",
  );
  expect(appsTemplate).toContain(':disabled="saving"');
  expect(appsTemplate).not.toContain("Hagfish");
});

test("keeps Radio controls scalar-sized and its recipes semantic", () => {
  expect(RadioPlayground.parameters.controls.include).toEqual([
    "legend",
    "selected",
    "disabled",
    "required",
    "invalid",
    "class",
  ]);
  expect(RadioPlayground.play).toBeTypeOf("function");

  const statesTemplate = RadioStates.render().template;
  const appsTemplate = RadioApps.render().template;
  expect(statesTemplate).toContain("<fieldset");
  expect(statesTemplate).toContain("<legend");
  expect(statesTemplate).toContain('aria-invalid="true"');
  expect(appsTemplate).toContain("Slipway recipes");
  expect(appsTemplate).toContain('class="sr-only"');
  expect(appsTemplate).toContain("has-[:checked]");
  expect(appsTemplate).not.toContain("Hagfish");
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
