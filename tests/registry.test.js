import { expect, test } from "@rstest/core";
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { parse } from "@babel/parser";
import { compile } from "svelte/compiler";

test("keeps registry lineage synchronized with every framework source", () => {
  const result = spawnSync(
    process.execPath,
    ["scripts/update-registry-lineage.mjs", "--check"],
    { cwd: process.cwd(), encoding: "utf8" },
  );

  expect(result.status).toBe(0);
  expect(result.stdout).toContain(
    "Registry lineage matches every current source.",
  );
});

function registrySource(framework, filename, item = "button") {
  return readFileSync(
    resolve(`registry/${item}/${framework}/${filename}`),
    "utf8",
  );
}

test("keeps the Vue workbench and installable registry source identical", () => {
  expect(registrySource("vue", "Button.vue")).toBe(
    readFileSync(resolve("src/vue/button/Button.vue"), "utf8"),
  );
});

test("ships parseable framework-native React source", () => {
  const source = registrySource("react", "Button.jsx");

  expect(() =>
    parse(source, { sourceType: "module", plugins: ["jsx"] }),
  ).not.toThrow();
  expect(source).toContain('Component = "button"');
  expect(source).toContain("className={twMerge(BASE_CLASSES, className)}");
  expect(source).toContain("aria-disabled=");
});

test("ships compiler-valid Svelte 5 source", () => {
  const source = registrySource("svelte", "Button.svelte");
  const result = compile(source, {
    filename: "Button.svelte",
    generate: false,
  });

  expect(result.warnings).toEqual([]);
  expect(source).toContain('as = "button"');
  expect(source).toContain("class={twMerge(BASE_CLASSES, className)}");
  expect(source).toContain("<svelte:element");
});

test("keeps visual variants and product motion out of every registry source", () => {
  for (const [framework, filename] of [
    ["vue", "Button.vue"],
    ["react", "Button.jsx"],
    ["svelte", "Button.svelte"],
  ]) {
    const source = registrySource(framework, filename);

    expect(source).not.toMatch(/\bvariant\b/i);
    expect(source).not.toContain("active:translate");
    expect(source).not.toContain("active:scale");
    expect(source).toContain("active:bg-gray-700");
  }
});

test("keeps every Vue form-control source identical to its registry source", () => {
  for (const [item, sourcePath, filename] of [
    ["input", "src/vue/input/Input.vue", "Input.vue"],
    ["textarea", "src/vue/textarea/Textarea.vue", "Textarea.vue"],
    ["checkbox", "src/vue/checkbox/Checkbox.vue", "Checkbox.vue"],
    ["radio", "src/vue/radio/Radio.vue", "Radio.vue"],
    ["switch", "src/vue/switch/Switch.vue", "Switch.vue"],
  ]) {
    expect(registrySource("vue", filename, item)).toBe(
      readFileSync(resolve(sourcePath), "utf8"),
    );
  }
});

test("ships parseable framework-native React form source", () => {
  for (const [item, filename] of [
    ["input", "Input.jsx"],
    ["textarea", "Textarea.jsx"],
    ["checkbox", "Checkbox.jsx"],
    ["radio", "Radio.jsx"],
    ["switch", "Switch.jsx"],
  ]) {
    expect(() =>
      parse(registrySource("react", filename, item), {
        sourceType: "module",
        plugins: ["jsx"],
      }),
    ).not.toThrow();
  }
});

test("ships compiler-valid Svelte 5 form source", () => {
  for (const [item, filename] of [
    ["input", "Input.svelte"],
    ["textarea", "Textarea.svelte"],
    ["checkbox", "Checkbox.svelte"],
    ["radio", "Radio.svelte"],
    ["switch", "Switch.svelte"],
  ]) {
    const result = compile(registrySource("svelte", filename, item), {
      filename,
      generate: false,
    });

    expect(result.warnings).toEqual([]);
  }
});

test("keeps form controls native and free of hidden field APIs", () => {
  for (const [item, framework, filename] of [
    ["input", "vue", "Input.vue"],
    ["textarea", "vue", "Textarea.vue"],
    ["input", "react", "Input.jsx"],
    ["textarea", "react", "Textarea.jsx"],
    ["input", "svelte", "Input.svelte"],
    ["textarea", "svelte", "Textarea.svelte"],
    ["checkbox", "vue", "Checkbox.vue"],
    ["checkbox", "react", "Checkbox.jsx"],
    ["checkbox", "svelte", "Checkbox.svelte"],
    ["radio", "vue", "Radio.vue"],
    ["radio", "react", "Radio.jsx"],
    ["radio", "svelte", "Radio.svelte"],
    ["switch", "vue", "Switch.vue"],
    ["switch", "react", "Switch.jsx"],
    ["switch", "svelte", "Switch.svelte"],
  ]) {
    const source = registrySource(framework, filename, item);
    expect(source).not.toMatch(/\bvariant\b/i);
    expect(source).not.toMatch(/\borientation\b/i);
    expect(source).not.toMatch(/field-context/i);
    expect(source).not.toMatch(/useFieldContext|getFieldContext/i);
  }
});

test("keeps Checkbox native, mixed-state capable, and class-first", () => {
  for (const [framework, filename] of [
    ["vue", "Checkbox.vue"],
    ["react", "Checkbox.jsx"],
    ["svelte", "Checkbox.svelte"],
  ]) {
    const source = registrySource(framework, filename, "checkbox");

    expect(source).toMatch(/type=["']checkbox["']/);
    expect(source).toContain(".indeterminate");
    expect(source).toContain('data-slot="checkbox"');
    expect(source).toContain("data-state");
    expect(source).toContain("tailwind-merge");
    expect(source).not.toMatch(/role=["']checkbox["']/);
    expect(source).not.toContain("aria-checked");
    expect(source).not.toMatch(/CheckboxIndicator|CheckboxGroup/);
    expect(source).not.toMatch(/\b(?:variant|tone|size)\s*(?::|=(?!=))/i);
    expect(source).not.toMatch(/keydown|keyup|Spacebar/);
  }
});

test("keeps Radio native, group-free, class-first, and browser-operated", () => {
  for (const [framework, filename] of [
    ["vue", "Radio.vue"],
    ["react", "Radio.jsx"],
    ["svelte", "Radio.svelte"],
  ]) {
    const source = registrySource(framework, filename, "radio");

    expect(source).toMatch(/type=["']radio["']/);
    expect(source).toContain('data-slot="radio"');
    expect(source).toContain("data-state");
    expect(source).toContain("tailwind-merge");
    expect(source).toContain("appearance-auto");
    expect(source).toContain("accent-current");
    expect(source).not.toMatch(/role=["']radio["']/);
    expect(source).not.toContain("aria-checked");
    expect(source).not.toMatch(/RadioGroup|RadioIndicator|RadioItem/);
    expect(source).not.toMatch(/\b(?:variant|tone|size)\s*(?::|=(?!=))/i);
    expect(source).not.toMatch(/keydown|keyup|ArrowUp|ArrowDown/);
    expect(source).not.toMatch(/localStorage|sessionStorage|URLSearchParams/);
  }
});

test("keeps Switch native, boolean-only, class-first, and browser-operated", () => {
  for (const [framework, filename] of [
    ["vue", "Switch.vue"],
    ["react", "Switch.jsx"],
    ["svelte", "Switch.svelte"],
  ]) {
    const source = registrySource(framework, filename, "switch");

    expect(source).toMatch(/type=["']checkbox["']/);
    expect(source).toMatch(/role=["']switch["']/);
    expect(source).toContain('data-slot="switch"');
    expect(source).toContain("data-state");
    expect(source).toContain("tailwind-merge");
    expect(source).toContain("after:content-['']");
    expect(source).toContain("motion-reduce:after:duration-100");
    expect(source).not.toMatch(/SwitchThumb|SwitchTrack|SwitchGroup/);
    expect(source).not.toMatch(/\b(?:variant|tone|size)\s*(?::|=(?!=))/i);
    expect(source).not.toMatch(/keydown|keyup|Spacebar|Enter/);
    expect(source).not.toMatch(/localStorage|sessionStorage|URLSearchParams/);
  }
});

test("keeps the Vue Popover workbench and registry source identical", () => {
  expect(registrySource("vue", "Popover.vue", "popover")).toBe(
    readFileSync(resolve("src/vue/popover/Popover.vue"), "utf8"),
  );
});

test("keeps the Vue Tooltip workbench and registry source identical", () => {
  expect(registrySource("vue", "Tooltip.vue", "tooltip")).toBe(
    readFileSync(resolve("src/vue/tooltip/Tooltip.vue"), "utf8"),
  );
});

test("ships compiler-valid framework-native Tooltip source", () => {
  const reactSource = registrySource("react", "Tooltip.jsx", "tooltip");
  expect(() =>
    parse(reactSource, { sourceType: "module", plugins: ["jsx"] }),
  ).not.toThrow();

  const svelteSource = registrySource("svelte", "Tooltip.svelte", "tooltip");
  const result = compile(svelteSource, {
    filename: "Tooltip.svelte",
    generate: false,
  });

  expect(result.warnings).toEqual([]);
});

test("keeps Tooltip wrapper-clean, class-first, semantic, and ephemeral", () => {
  for (const [framework, filename] of [
    ["vue", "Tooltip.vue"],
    ["react", "Tooltip.jsx"],
    ["svelte", "Tooltip.svelte"],
  ]) {
    const source = registrySource(framework, filename, "tooltip");

    expect(source).toContain("@floating-ui/dom");
    expect(source).toMatch(/popover=["']hint["']/);
    expect(source).toMatch(/role=["']tooltip["']/);
    expect(source).toContain("aria-describedby");
    expect(source).toMatch(/class(?:Name)?=["']contents["']/);
    expect(source).toContain('data-slot="tooltip-arrow"');
    expect(source).toContain("ARROW_CLIP_PATHS");
    expect(source).toContain("ARROW_OVERHANG");
    expect(source).toContain("floatingArrow");
    expect(source).toContain("overflow-visible");
    expect(source).toContain("bg-gray-950");
    expect(source).toContain("text-white");
    expect(source).toContain("dark:bg-white");
    expect(source).toContain("dark:text-gray-950");
    expect(source).toContain("bg-inherit");
    expect(source).not.toMatch(/interestfor|interestForElement/);
    expect(source).not.toMatch(/TooltipTrigger|TooltipContent|TooltipProvider/);
    expect(source).not.toMatch(/localStorage|sessionStorage|URLSearchParams/);
    expect(source).not.toMatch(/\bvariant\b/i);
  }
});

test("keeps the Vue Tabs workbench and installable source identical", () => {
  expect(registrySource("vue", "Tabs.vue", "tabs")).toBe(
    readFileSync(resolve("src/vue/tabs/Tabs.vue"), "utf8"),
  );
});

test("ships compiler-valid framework-native Tabs source", () => {
  const reactSource = registrySource("react", "Tabs.jsx", "tabs");
  expect(() =>
    parse(reactSource, { sourceType: "module", plugins: ["jsx"] }),
  ).not.toThrow();

  const svelteSource = registrySource("svelte", "Tabs.svelte", "tabs");
  const result = compile(svelteSource, {
    filename: "Tabs.svelte",
    generate: false,
  });

  expect(result.warnings).toEqual([]);
});

test("keeps Tabs semantic, durable, class-first, and app-state agnostic", () => {
  for (const [framework, filename] of [
    ["vue", "Tabs.vue"],
    ["react", "Tabs.jsx"],
    ["svelte", "Tabs.svelte"],
  ]) {
    const source = registrySource(framework, filename, "tabs");

    expect(source).toContain('role", "tablist"');
    expect(source).toContain('role", "tab"');
    expect(source).toContain('role", "tabpanel"');
    expect(source).toContain("aria-selected");
    expect(source).toContain("aria-controls");
    expect(source).toContain("aria-labelledby");
    expect(source).toContain("a[href][data-value]");
    expect(source).toContain("aria-current");
    expect(source).toContain('"navigation"');
    expect(source).toContain('"panels"');
    expect(source).toContain('"nav"');
    expect(source).toContain("MutationObserver");
    expect(source).toContain("scrollIntoView");
    expect(source).toContain("tailwind-merge");
    expect(source).not.toMatch(/TabsList|TabsTrigger|TabsContent|TabsProvider/);
    expect(source).not.toMatch(/localStorage|sessionStorage|URLSearchParams/);
    expect(source).not.toMatch(/\b(?:variant|tone|size)\s*(?::|=(?!=))/i);
  }
});

test("ships compiler-valid framework-native Popover source", () => {
  const reactSource = registrySource("react", "Popover.jsx", "popover");
  expect(() =>
    parse(reactSource, { sourceType: "module", plugins: ["jsx"] }),
  ).not.toThrow();

  const svelteSource = registrySource("svelte", "Popover.svelte", "popover");
  const result = compile(svelteSource, {
    filename: "Popover.svelte",
    generate: false,
  });

  expect(result.warnings).toEqual([]);
});

test("keeps Popover semantic, class-first, and ephemeral", () => {
  for (const [framework, filename] of [
    ["vue", "Popover.vue"],
    ["react", "Popover.jsx"],
    ["svelte", "Popover.svelte"],
  ]) {
    const source = registrySource(framework, filename, "popover");

    expect(source).toContain("@floating-ui/dom");
    expect(source).toContain('popover="auto"');
    expect(source).toContain("aria-expanded");
    expect(source).toContain("bottom-start");
    expect(source).not.toMatch(/localStorage|sessionStorage|URLSearchParams/);
    expect(source).not.toMatch(/\bvariant\b/i);
    expect(source).not.toMatch(/role=["'](?:menu|dialog)["']/);
  }
});

test("keeps the Vue Menu workbench and installable registry source identical", () => {
  expect(registrySource("vue", "Menu.vue", "menu")).toBe(
    readFileSync(resolve("src/vue/menu/Menu.vue"), "utf8"),
  );
});

test("ships compiler-valid framework-native Menu source", () => {
  const reactSource = registrySource("react", "Menu.jsx", "menu");
  expect(() =>
    parse(reactSource, { sourceType: "module", plugins: ["jsx"] }),
  ).not.toThrow();

  const svelteSource = registrySource("svelte", "Menu.svelte", "menu");
  const result = compile(svelteSource, {
    filename: "Menu.svelte",
    generate: false,
  });

  expect(result.warnings).toEqual([]);
});

test("keeps Menu semantic, class-first, ephemeral, and motion-free", () => {
  for (const [framework, filename] of [
    ["vue", "Menu.vue"],
    ["react", "Menu.jsx"],
    ["svelte", "Menu.svelte"],
  ]) {
    const source = registrySource(framework, filename, "menu");

    expect(source).toContain("../popover/Popover");
    expect(source).toContain("menuitem");
    expect(source).toContain("aria-haspopup");
    expect(source).toContain("typeahead");
    expect(source).not.toMatch(/localStorage|sessionStorage|URLSearchParams/);
    expect(source).not.toMatch(/\bvariant\b/i);
    expect(source).not.toMatch(/transition|animate|duration-/);
    expect(source).not.toMatch(/MenuTrigger|MenuItem/);
    expect(source).toContain("TABBABLE_SELECTOR");
    expect(source).toContain("adjacentTabStop");
    expect(source).toMatch(/event\.key === ["']Tab["']/);
  }
});

test("keeps the Vue Select workbench and installable source identical", () => {
  expect(registrySource("vue", "Select.vue", "select")).toBe(
    readFileSync(resolve("src/vue/select/Select.vue"), "utf8"),
  );
});

test("ships compiler-valid framework-native Select source", () => {
  const reactSource = registrySource("react", "Select.jsx", "select");
  expect(() =>
    parse(reactSource, { sourceType: "module", plugins: ["jsx"] }),
  ).not.toThrow();

  const svelteSource = registrySource("svelte", "Select.svelte", "select");
  const result = compile(svelteSource, {
    filename: "Select.svelte",
    generate: false,
  });

  expect(result.warnings).toEqual([]);
});

test("keeps Select typed, native-first, class-first, and ephemeral", () => {
  for (const [framework, filename] of [
    ["vue", "Select.vue"],
    ["react", "Select.jsx"],
    ["svelte", "Select.svelte"],
  ]) {
    const source = registrySource(framework, filename, "select");

    expect(source).toContain("../popover/Popover");
    expect(source).toContain('role="combobox"');
    expect(source).toContain('role="listbox"');
    expect(source).toContain('role="option"');
    expect(source).toContain("aria-activedescendant");
    expect(source).toContain("typeahead");
    expect(source).toContain('type="hidden"');
    expect(source).toContain('data-slot="select-trigger"');
    expect(source).not.toMatch(/localStorage|sessionStorage|URLSearchParams/);
    expect(source).not.toMatch(/\b(?:variant|tone|size)\s*(?::|=(?!=))/i);
    expect(source).not.toMatch(/searchable|SelectTrigger|SelectItem/);
    expect(source).not.toMatch(/transition-transform|animate-/);
  }
});

test("keeps the Vue Combobox workbench and installable source identical", () => {
  expect(registrySource("vue", "Combobox.vue", "combobox")).toBe(
    readFileSync(resolve("src/vue/combobox/Combobox.vue"), "utf8"),
  );
});

test("ships compiler-valid framework-native Combobox source", () => {
  const reactSource = registrySource("react", "Combobox.jsx", "combobox");
  expect(() =>
    parse(reactSource, { sourceType: "module", plugins: ["jsx"] }),
  ).not.toThrow();

  const svelteSource = registrySource("svelte", "Combobox.svelte", "combobox");
  const result = compile(svelteSource, {
    filename: "Combobox.svelte",
    generate: false,
  });

  expect(result.warnings).toEqual([]);
});

test("keeps Combobox editable, native-first, durable, and class-first", () => {
  for (const [framework, filename] of [
    ["vue", "Combobox.vue"],
    ["react", "Combobox.jsx"],
    ["svelte", "Combobox.svelte"],
  ]) {
    const source = registrySource(framework, filename, "combobox");

    expect(source).toContain("../popover/Popover");
    expect(source).toContain('role="combobox"');
    expect(source).toContain('aria-autocomplete="list"');
    expect(source).toContain('role="listbox"');
    expect(source).toContain('role="option"');
    expect(source).toContain("aria-activedescendant");
    expect(source).toContain("searchDelay");
    expect(source).toContain("clearTimeout");
    expect(source).toContain('type="hidden"');
    expect(source).toContain('data-slot="combobox-input"');
    expect(source).not.toMatch(/localStorage|sessionStorage|URLSearchParams/);
    expect(source).not.toMatch(/searchUrl|fetch\(/);
    expect(source).not.toMatch(/\b(?:variant|tone|size)\s*(?::|=(?!=))/i);
    expect(source).not.toMatch(/ComboboxTrigger|ComboboxItem/);
    expect(source).not.toMatch(/transition-transform/);
  }
});

test("keeps the Vue Dialog workbench and installable source identical", () => {
  expect(registrySource("vue", "Dialog.vue", "dialog")).toBe(
    readFileSync(resolve("src/vue/dialog/Dialog.vue"), "utf8"),
  );
});

test("ships compiler-valid framework-native Dialog source", () => {
  const reactSource = registrySource("react", "Dialog.jsx", "dialog");
  expect(() =>
    parse(reactSource, { sourceType: "module", plugins: ["jsx"] }),
  ).not.toThrow();

  const svelteSource = registrySource("svelte", "Dialog.svelte", "dialog");
  const result = compile(svelteSource, {
    filename: "Dialog.svelte",
    generate: false,
  });

  expect(result.warnings).toEqual([]);
});

test("keeps Dialog native, class-first, durable, and free of product APIs", () => {
  for (const [framework, filename] of [
    ["vue", "Dialog.vue"],
    ["react", "Dialog.jsx"],
    ["svelte", "Dialog.svelte"],
  ]) {
    const source = registrySource(framework, filename, "dialog");

    expect(source).toMatch(/<dialog/);
    expect(source).toContain("showModal");
    expect(source).toContain("requestClose");
    expect(source).toContain("document.activeElement");
    expect(source).toContain("element.contains(candidate)");
    expect(source).toContain("commandfor");
    expect(source).toContain("closedby");
    expect(source).toContain('data-slot="dialog"');
    expect(source).toContain("tailwind-merge");
    expect(source).not.toMatch(/localStorage|sessionStorage|URLSearchParams/);
    expect(source).not.toMatch(/\bvariant\b|\btone\b|\bsize\b/i);
    expect(source).not.toMatch(/ConfirmDialog|DialogTrigger|DialogTitle/);
    expect(source).not.toMatch(/role=["']dialog["']/);
    expect(source).not.toMatch(/FOCUSABLE|focusTrap|tabIndex.*-1/);
    expect(source).not.toMatch(/Teleport|createPortal/);
    expect(source).not.toMatch(/transition|animate|duration-/);
  }
});

test("keeps the Vue Slide workbench and installable source identical", () => {
  expect(registrySource("vue", "Slide.vue", "slide")).toBe(
    readFileSync(resolve("src/vue/slide/Slide.vue"), "utf8"),
  );
});

test("keeps the Vue Spinner workbench and installable source identical", () => {
  expect(registrySource("vue", "Spinner.vue", "spinner")).toBe(
    readFileSync(resolve("src/vue/spinner/Spinner.vue"), "utf8"),
  );
});

test("ships compiler-valid framework-native Spinner source", () => {
  const reactSource = registrySource("react", "Spinner.jsx", "spinner");
  expect(() =>
    parse(reactSource, { sourceType: "module", plugins: ["jsx"] }),
  ).not.toThrow();

  const svelteSource = registrySource("svelte", "Spinner.svelte", "spinner");
  const result = compile(svelteSource, {
    filename: "Spinner.svelte",
    generate: false,
  });

  expect(result.warnings).toEqual([]);
});

test("keeps Spinner decorative, class-first, reduced-motion-safe, and ephemeral", () => {
  for (const [framework, filename] of [
    ["vue", "Spinner.vue"],
    ["react", "Spinner.jsx"],
    ["svelte", "Spinner.svelte"],
  ]) {
    const source = registrySource(framework, filename, "spinner");

    expect(source).toMatch(/<span/);
    expect(source).toMatch(/<svg/);
    expect(source).toContain('data-slot="spinner"');
    expect(source).toContain('data-slot="spinner-mark"');
    expect(source).toContain('aria-hidden="true"');
    expect(source).toContain('focusable="false"');
    expect(source).toContain("currentColor");
    expect(source).toContain("animate-spin");
    expect(source).toContain("motion-reduce:animate-none");
    expect(source).toContain("*:size-full");
    expect(source).toContain("tailwind-merge");
    expect(source).not.toMatch(/role=["']status["']/);
    expect(source).not.toMatch(/aria-live|aria-busy/);
    expect(source).not.toMatch(/localStorage|sessionStorage|URLSearchParams/);
    expect(source).not.toMatch(
      /\b(?:variant|tone|speed|loading)\s*(?::|=(?!=))/i,
    );
    expect(source).not.toMatch(/setTimeout|requestAnimationFrame/);
  }
});

test("ships compiler-valid framework-native Slide source", () => {
  const reactSource = registrySource("react", "Slide.jsx", "slide");
  expect(() =>
    parse(reactSource, { sourceType: "module", plugins: ["jsx"] }),
  ).not.toThrow();

  const svelteSource = registrySource("svelte", "Slide.svelte", "slide");
  const result = compile(svelteSource, {
    filename: "Slide.svelte",
    generate: false,
  });

  expect(result.warnings).toEqual([]);
});

test("keeps Slide a native-button enhancement with ordinary styling", () => {
  for (const [framework, filename] of [
    ["vue", "Slide.vue"],
    ["react", "Slide.jsx"],
    ["svelte", "Slide.svelte"],
  ]) {
    const source = registrySource(framework, filename, "slide");

    expect(source).toMatch(/<button/);
    expect(source).toContain('type="button"');
    expect(source).toContain("PointerCapture");
    expect(source).toContain("ResizeObserver");
    expect(source).toContain("CONFIRM_THRESHOLD = 0.85");
    expect(source).toContain('data-slot="slide-status"');
    expect(source).toContain("aria-disabled");
    expect(source).toContain("motion-reduce:transition-none");
    expect(source).not.toMatch(/localStorage|sessionStorage|URLSearchParams/);
    expect(source).not.toMatch(/role=["']slider["']/);
    expect(source).not.toMatch(/\bvariant\s*[=:]|\btone\s*[=:]/i);
    expect(source).not.toMatch(/deploy|production|environmentName/i);
    expect(source).not.toMatch(/\bfillClass\b|\bthumbClass\b|\btrackClass\b/i);
    expect(source).not.toMatch(
      /mousedown|touchstart|document\.addEventListener/,
    );
    expect(source).not.toMatch(/vibrat|confetti|sound/i);
    expect(source).not.toMatch(/disabled=\{?disabled \|\| pending/);
  }
});

test("gives every Slide port idiomatic product-owned thumb content", () => {
  const vue = registrySource("vue", "Slide.vue", "slide");
  const react = registrySource("react", "Slide.jsx", "slide");
  const svelte = registrySource("svelte", "Slide.svelte", "slide");

  expect(vue).toContain('<slot name="thumb"');
  expect(vue).toContain(':progress="progressState"');
  expect(react).toContain("thumb({ pending, progress: progressState })");
  expect(svelte).toContain("thumb({ pending, progress: progressState })");

  for (const source of [vue, react, svelte]) {
    expect(source).toContain('data-slot="slide-thumb"');
    expect(source).toMatch(/class(?:Name)?="size-4 rtl:rotate-180"/);
  }
});

test("ships compiler-valid Toast source for Vue, React, and Svelte", () => {
  const reactSource = registrySource("react", "Toast.jsx", "toast");
  expect(() =>
    parse(reactSource, { sourceType: "module", plugins: ["jsx"] }),
  ).not.toThrow();

  const svelteSource = registrySource("svelte", "Toast.svelte", "toast");
  const result = compile(svelteSource, {
    filename: "Toast.svelte",
    generate: false,
  });

  expect(result.warnings).toEqual([]);
  expect(registrySource("vue", "Toast.vue", "toast")).toContain(
    'data-slot="toast-viewport"',
  );
  expect(
    registrySource("vue", "Toast.vue", "toast").replace(
      'from "../toast.js"',
      'from "./toast.js"',
    ),
  ).toBe(readFileSync(resolve("src/vue/toast/Toast.vue"), "utf8"));
  expect(readFileSync(resolve("registry/toast/toast.js"), "utf8")).toBe(
    readFileSync(resolve("src/vue/toast/toast.js"), "utf8"),
  );
});

test("keeps Toast provider-free, class-first, and durable", () => {
  const controller = readFileSync(resolve("registry/toast/toast.js"), "utf8");

  expect(controller).toContain("export function createToast");
  expect(controller).toContain("export const toast");
  expect(controller).toContain("pauseAll");
  expect(controller).toContain("remaining");
  expect(controller).not.toMatch(
    /Provider|Context|localStorage|sessionStorage/,
  );

  for (const [framework, filename] of [
    ["vue", "Toast.vue"],
    ["react", "Toast.jsx"],
    ["svelte", "Toast.svelte"],
  ]) {
    const source = registrySource(framework, filename, "toast");

    expect(source).toContain("prefers-reduced-motion: reduce");
    expect(source).toContain("aria-live");
    expect(source).toContain("--klean-toast-enter-x");
    expect(source).toContain(
      "const NEARBY_DURATION = { enter: 300, leave: 200 }",
    );
    expect(source).toContain(
      "const CROSS_VIEWPORT_DURATION = { enter: 450, leave: 320 }",
    );
    expect(source).toContain('data-slot="toast-action"');
    expect(source).toContain("ease-out");
    expect(source).toContain("ease-in");
    expect(source).not.toContain("toast-counter");
    expect(source).not.toMatch(/overshoot|bounce/i);
    expect(source).not.toMatch(/ToastProvider|ToastTitle|ToastDescription/);
    expect(source).not.toMatch(/\bvariant\b|\btone\b/i);
    expect(source).not.toMatch(/success.*(?:green|emerald)|error.*red/i);
  }
});

test("keeps the Vue Command workbench identical to its installable source", () => {
  expect(registrySource("vue", "Command.vue", "command")).toBe(
    readFileSync(resolve("src/vue/command/Command.vue"), "utf8"),
  );
});

test("ships compiler-valid framework-native Command source", () => {
  const reactSource = registrySource("react", "Command.jsx", "command");
  expect(() =>
    parse(reactSource, { sourceType: "module", plugins: ["jsx"] }),
  ).not.toThrow();

  expect(registrySource("vue", "Command.vue", "command")).toContain(
    "<template>",
  );

  const result = compile(
    registrySource("svelte", "Command.svelte", "command"),
    { filename: "Command.svelte", generate: false },
  );
  expect(result.warnings).toEqual([]);
});

test("keeps Command accessible, app-owned, class-first, and ephemeral", () => {
  for (const [framework, filename] of [
    ["vue", "Command.vue"],
    ["react", "Command.jsx"],
    ["svelte", "Command.svelte"],
  ]) {
    const source = registrySource(framework, filename, "command");

    expect(source).toContain("defaultFilter");
    expect(source).toContain("activeEntry");
    expect(source).toContain("commands");
    expect(source).toContain("groups");
    expect(source).toContain("isComposing");
    expect(source).toContain("scrollIntoView");
    expect(source).toContain("tailwind-merge");
    expect(source).not.toMatch(/localStorage|sessionStorage|URLSearchParams/);
    expect(source).not.toMatch(/router|navigate|fetch\(|Provider.*Command/);
    expect(source).not.toMatch(/\bvariant\b|\btone\b|\bsize\b/i);
    expect(source).not.toMatch(/fuse\.js|cmdk|radix|bits-ui/i);
  }

  for (const [framework, filename] of [
    ["vue", "Command.vue"],
    ["react", "Command.jsx"],
    ["svelte", "Command.svelte"],
  ]) {
    const source = registrySource(framework, filename, "command");
    expect(source).toContain('role="combobox"');
    expect(source).toContain("aria-activedescendant");
  }

  for (const [framework, filename] of [
    ["vue", "Command.vue"],
    ["react", "Command.jsx"],
    ["svelte", "Command.svelte"],
  ]) {
    const source = registrySource(framework, filename, "command");
    expect(source).toContain('role="option"');
    expect(source).toContain("cursor-pointer");
    expect(source).toContain("aria-disabled");
    expect(source).toContain('role="status"');
    expect(source).toContain('aria-atomic="true"');
    const beforeMarker =
      framework === "vue"
        ? '<slot name="before" />'
        : framework === "react"
          ? "{before}"
          : "{@render before?.()}";
    expect(source.indexOf(beforeMarker)).toBeLessThan(
      source.indexOf('role="listbox"'),
    );
  }
});
