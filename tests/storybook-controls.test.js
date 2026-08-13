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
import {
  Apps as SpinnerApps,
  Playground as SpinnerPlayground,
  Semantics as SpinnerSemantics,
} from "../stories/Spinner.stories.js";
import {
  Playground as TooltipPlayground,
  Products as TooltipProducts,
} from "../stories/Tooltip.stories.js";
import { Products as SelectProducts } from "../stories/Select.stories.js";
import {
  Navigation as TabsNavigation,
  Overflow as TabsOverflow,
  Playground as TabsPlayground,
  Workspace as TabsWorkspace,
} from "../stories/Tabs.stories.js";
import {
  Apps as PaginationApps,
  Narrow as PaginationNarrow,
  Playground as PaginationPlayground,
  States as PaginationStates,
} from "../stories/Pagination.stories.js";
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
  expect(appsTemplate).toContain("has-checked");
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

test("keeps Spinner controls contextual and its recipes truthful", () => {
  expect(SpinnerPlayground.parameters.controls.include).toEqual([
    "loading",
    "label",
    "class",
  ]);
  expect(SpinnerPlayground.play).toBeTypeOf("function");

  const semanticsTemplate = SpinnerSemantics.render().template;
  const appsTemplate = SpinnerApps.render().template;
  expect(semanticsTemplate).toContain('role="status"');
  expect(semanticsTemplate).toContain('aria-busy="true"');
  expect(semanticsTemplate).toContain("ProductLoader");
  expect(appsTemplate).toContain("Slipway / Deployment action");
  expect(appsTemplate).toContain("<ProductLoader />");
  expect(appsTemplate).toContain("Hagfish / Invoice action");
  expect(appsTemplate).toContain("Existing rows remain readable");
});

test("keeps Tooltip controls terse and proves independent product styling", () => {
  expect(TooltipPlayground.parameters.controls.include).toEqual([
    "text",
    "placement",
    "class",
  ]);
  expect(TooltipPlayground.play).toBeTypeOf("function");

  const productsTemplate = TooltipProducts.render().template;
  expect(productsTemplate).toContain("Slipway / query toolbar");
  expect(productsTemplate).toContain("Hagfish / invoice action");
  expect(productsTemplate).toContain('aria-label="Re-run query"');
  expect(productsTemplate).not.toContain("tooltip-arrow]:hidden");
  expect(productsTemplate).not.toContain("interestfor");
});

test("keeps Tabs controls behavioral and its dynamic actions outside the tablist", () => {
  expect(TabsPlayground.parameters.controls.include).toEqual([
    "active",
    "orientation",
    "activation",
  ]);
  expect(TabsPlayground.play).toBeTypeOf("function");
  expect(TabsNavigation.play).toBeTypeOf("function");
  expect(TabsWorkspace.play).toBeTypeOf("function");

  const navigationTemplate = TabsNavigation.render().template;
  const workspaceTemplate = TabsWorkspace.render().template;
  const overflowTemplate = TabsOverflow.render().template;
  const playgroundClasses = TabsPlayground.render({}).setup().tabClass;
  expect(playgroundClasses).toContain("cursor-pointer");
  expect(playgroundClasses).toContain("disabled:cursor-not-allowed");
  expect(navigationTemplate).toContain("BoringStackLink");
  expect(navigationTemplate).toContain('as="nav"');
  expect(navigationTemplate).not.toContain("<nav");
  expect(navigationTemplate).toContain('data-value="section.value"');
  expect(navigationTemplate).toContain("data-[state=active]");
  expect(navigationTemplate).not.toContain('role="tab"');
  expect(workspaceTemplate).toContain("Slipway-shaped workspace");
  expect(workspaceTemplate).toContain("pointer-events-none absolute");
  expect(workspaceTemplate).toContain(
    "pointer-events-auto grid size-9 cursor-pointer",
  );
  expect(workspaceTemplate).toContain("shrink-0 cursor-pointer truncate");
  expect(workspaceTemplate).not.toContain("Hagfish");
  expect(overflowTemplate).toContain("overflow-x-auto");
  expect(overflowTemplate).toContain("shrink-0 cursor-pointer");
  expect(overflowTemplate).toContain("data-value");
});

test("keeps Pagination controls server-sized and proves app-owned styling", () => {
  expect(PaginationPlayground.parameters.controls.include).toEqual([
    "page",
    "pages",
  ]);
  expect(PaginationPlayground.play).toBeTypeOf("function");

  const statesTemplate = PaginationStates.render().template;
  const appsTemplate = PaginationApps.render().template;
  const narrowTemplate = PaginationNarrow.render().template;

  expect(statesTemplate).toContain("Edges tell the truth");
  expect(statesTemplate).toContain(':pages="36"');
  expect(statesTemplate).toContain(':pages="1"');
  expect(appsTemplate).toContain("Slipway / Bridge resources");
  expect(appsTemplate).toContain("Hagfish / invoice archive");
  expect(appsTemplate).toContain(":only=\"['records', 'pagination', 'filters']\"");
  expect(appsTemplate).toContain("**:data-[slot=page]:rounded-none");
  expect(narrowTemplate).toContain(':pages="100"');
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
