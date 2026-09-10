import { expect, test } from "@rstest/core";
import { mount } from "@vue/test-utils";
import { nextTick } from "vue";
import { readFileSync } from "node:fs";
import { JSDOM } from "jsdom";
import { parse } from "@babel/parser";
import { compile } from "svelte/compiler";
import RichText from "../src/vue/rich-text/RichText.vue";

const source = (framework, filename) =>
  readFileSync(`registry/rich-text/${framework}/${filename}`, "utf8");
const field = (wrapper) => wrapper.get('[data-slot="rich-text-source"]');
const content = (wrapper) => wrapper.get('[data-slot="rich-text-content"]');
const settle = async () => {
  await new Promise((resolve) => setTimeout(resolve, 20));
  await nextTick();
};
async function create(props = {}, attrs = {}) {
  const form = document.createElement("form");
  document.body.append(form);
  const wrapper = mount(RichText, {
    attachTo: form,
    props: { format: "markdown", ...props },
    attrs: { name: "body", "aria-label": "Body", ...attrs },
  });
  await settle();
  return {
    wrapper,
    form,
    dispose() {
      wrapper.unmount();
      form.remove();
    },
  };
}

test("RichText registry includes application-owned sources and framework-specific dependencies", () => {
  const metadata = JSON.parse(
    readFileSync("registry/rich-text/registry.json", "utf8"),
  );
  expect(metadata.name).toBe("rich-text");
  expect(metadata.registryDependencies).toEqual(
    expect.arrayContaining(["popover", "icon-link", "icon-image"]),
  );
  for (const [framework, extension] of [
    ["vue", "vue"],
    ["react", "jsx"],
    ["svelte", "svelte"],
  ]) {
    const registry = metadata.frameworks[framework];
    expect(registry.files).toEqual([
      {
        source: `${framework}/RichText.${extension}`,
        target: `rich-text/RichText.${extension}`,
      },
      { source: `${framework}/rich-text.js`, target: "rich-text/rich-text.js" },
    ]);
    for (const dependency of [
      "@tiptap/core",
      "@tiptap/pm",
      "@tiptap/starter-kit",
      "@tiptap/extension-file-handler",
      "@tiptap/extension-image",
      "@tiptap/extension-placeholder",
      "@tiptap/markdown",
      "dompurify",
      "marked",
      "tailwind-merge",
    ]) {
      expect(registry.dependencies[dependency]).toBeTruthy();
    }
    expect(registry.dependencies["@tiptap/vue-3"]).toBe(
      framework === "vue" ? "^3.31.3" : undefined,
    );
    expect(registry.dependencies["@tiptap/react"]).toBe(
      framework === "react" ? "^3.31.3" : undefined,
    );
  }
});

test("RichText workbench matches the source installed into Vue applications", () => {
  for (const filename of ["RichText.vue", "rich-text.js"])
    expect(source("vue", filename)).toBe(
      readFileSync(`src/vue/rich-text/${filename}`, "utf8"),
    );
});

test("RichText React and Svelte adapters are valid native framework source", () => {
  expect(() =>
    parse(source("react", "RichText.jsx"), {
      sourceType: "module",
      plugins: ["jsx"],
    }),
  ).not.toThrow();
  const result = compile(source("svelte", "RichText.svelte"), {
    filename: "RichText.svelte",
    generate: false,
  });
  expect(
    result.warnings.map(({ code, start }) => ({ code, line: start?.line })),
  ).toEqual([]);
});

test("all RichText adapters preserve source and expose native form and styling boundaries", () => {
  for (const [framework, filename] of [
    ["vue", "RichText.vue"],
    ["react", "RichText.jsx"],
    ["svelte", "RichText.svelte"],
  ]) {
    const component = source(framework, filename);
    expect(component).toContain("<textarea");
    expect(component).toContain('data-slot="rich-text"');
    expect(component).toContain('data-slot="rich-text-source"');
    expect(component).toMatch(
      /["']?data-slot["']?\s*[:=]\s*["']rich-text-content["']/,
    );
    expect(component.includes("htmlRoundTripMatches")).toBe(true);
    expect(component).toContain("roundTripMatches");
    expect(component).toContain("setCustomValidity");
    expect(component).toContain("tailwind-merge");
    expect(component).not.toMatch(
      /localStorage|sessionStorage|document\.execCommand|v-html|dangerouslySetInnerHTML|\{@html/,
    );
  }
});

test("mounting supported Markdown preserves its exact stored source without emitting", async () => {
  const original = "\uFEFF\r\n# Release\r\n\r\nA **bold** update.\r\n";
  const fixture = await create({ modelValue: original });
  try {
    expect(fixture.wrapper.attributes("data-mode")).toBe("visual");
    expect(field(fixture.wrapper).element.value).toBe(original);
    expect(fixture.wrapper.emitted("update:modelValue")).toBeUndefined();
    expect(content(fixture.wrapper).attributes("role")).toBe("textbox");
    expect(content(fixture.wrapper).attributes("aria-label")).toBe("Body");
    expect(content(fixture.wrapper).attributes("aria-multiline")).toBe("true");
    expect(new FormData(fixture.form).get("body")).toBe(original);
  } finally {
    fixture.dispose();
  }
});

test("actual editor edits emit Markdown and keep the native submission value synchronized", async () => {
  const fixture = await create({ modelValue: "A note" });
  try {
    const editor = fixture.wrapper.vm.editor;
    editor.commands.insertContentAt(
      editor.state.doc.content.size - 1,
      " today",
    );
    await nextTick();
    expect(field(fixture.wrapper).element.value).toBe("A note today");
    expect(fixture.wrapper.emitted("update:modelValue").at(-1)).toEqual([
      "A note today",
    ]);
    expect(new FormData(fixture.form).get("body")).toBe("A note today");
  } finally {
    fixture.dispose();
  }
});

test("unsupported Markdown stays intact in source mode and cannot be switched into a lossy editor", async () => {
  const original = "| Name | Value |\n| --- | --- |\n| Keep | Everything |";
  const fixture = await create({ modelValue: original });
  try {
    expect(fixture.wrapper.attributes("data-mode")).toBe("source");
    expect(field(fixture.wrapper).element.value).toBe(original);
    expect(
      fixture.wrapper.get('[data-slot="rich-text-warning"]').text(),
    ).toContain("tables");
    await fixture.wrapper.vm.setMode("visual");
    expect(fixture.wrapper.attributes("data-mode")).toBe("source");
    expect(fixture.wrapper.emitted("update:modelValue")).toBeUndefined();
    await field(fixture.wrapper).setValue("# Supported now");
    await fixture.wrapper.vm.setMode("visual");
    expect(fixture.wrapper.attributes("data-mode")).toBe("visual");
    expect(content(fixture.wrapper).text()).toBe("Supported now");
  } finally {
    fixture.dispose();
  }
});

test("source editing emits ordinary strings and supports switching back to visual editing", async () => {
  const fixture = await create({ modelValue: "Original" });
  try {
    await fixture.wrapper.vm.setMode("source");
    await field(fixture.wrapper).setValue("**Changed** source");
    expect(fixture.wrapper.emitted("update:modelValue").at(-1)).toEqual([
      "**Changed** source",
    ]);
    expect(new FormData(fixture.form).get("body")).toBe("**Changed** source");
    await fixture.wrapper.vm.setMode("visual");
    expect(content(fixture.wrapper).get("strong").text()).toBe("Changed");
    expect(field(fixture.wrapper).element.value).toBe("**Changed** source");
  } finally {
    fixture.dispose();
  }
});

test("external model updates replace content without creating user-change events", async () => {
  const fixture = await create({ modelValue: "Original" });
  try {
    await fixture.wrapper.setProps({ modelValue: "# Server restored" });
    await nextTick();
    expect(content(fixture.wrapper).get("h1").text()).toBe("Server restored");
    expect(new FormData(fixture.form).get("body")).toBe("# Server restored");
    expect(fixture.wrapper.emitted("update:modelValue")).toBeUndefined();
  } finally {
    fixture.dispose();
  }
});

test("editor ARIA attributes omit absent values and remove stale validation state", async () => {
  const fixture = await create({ modelValue: "A note" });
  try {
    const node = content(fixture.wrapper).element;
    expect(
      [...node.attributes].some(({ value }) => value === "undefined"),
    ).toBe(false);
    await fixture.wrapper.setProps({ required: true });
    expect(node.getAttribute("aria-required")).toBe("true");
    await fixture.wrapper.setProps({ required: false });
    expect(node.hasAttribute("aria-required")).toBe(false);
    expect(node.hasAttribute("aria-labelledby")).toBe(false);
    expect(node.hasAttribute("aria-describedby")).toBe(false);
  } finally {
    fixture.dispose();
  }
});

test("initial content is not an undoable user edit", async () => {
  const fixture = await create({ modelValue: "Existing document" });
  try {
    expect(fixture.wrapper.vm.editor.can().undo()).toBe(false);
    expect(
      fixture.wrapper.get('button[aria-label="Undo"]').attributes("disabled"),
    ).toBe("");
  } finally {
    fixture.dispose();
  }
});

test("replacing a document clears its previous record's undo history", async () => {
  const fixture = await create({ modelValue: "First record" });
  try {
    const editor = fixture.wrapper.vm.editor;
    editor.commands.insertContentAt(
      editor.state.doc.content.size - 1,
      " edited",
    );
    await nextTick();
    expect(editor.can().undo()).toBe(true);
    await fixture.wrapper.setProps({ modelValue: "Second record" });
    await nextTick();
    expect(editor.can().undo()).toBe(false);
    editor.commands.undo();
    await nextTick();
    expect(field(fixture.wrapper).element.value).toBe("Second record");
    expect(content(fixture.wrapper).text()).toBe("Second record");
  } finally {
    fixture.dispose();
  }
});

test("source composition is not committed prematurely and external replacements wait for it", async () => {
  const fixture = await create({ modelValue: "Original" });
  try {
    await fixture.wrapper.vm.setMode("source");
    const input = field(fixture.wrapper);
    await input.trigger("compositionstart");
    input.element.value = "Composing";
    await input.trigger("input", { isComposing: true });
    expect(fixture.wrapper.emitted("update:modelValue")).toBeUndefined();
    await fixture.wrapper.setProps({ modelValue: "Remote replacement" });
    expect(input.element.value).toBe("Composing");
    await input.trigger("compositionend");
    await nextTick();
    expect(input.element.value).toBe("Remote replacement");
    expect(new FormData(fixture.form).get("body")).toBe("Remote replacement");
  } finally {
    fixture.dispose();
  }
});

test("disabled fields are excluded from forms while readonly values remain submitted", async () => {
  for (const disabled of [true, false]) {
    const fixture = await create({
      modelValue: "Keep this",
      disabled,
      readonly: !disabled,
    });
    try {
      expect(field(fixture.wrapper).element.disabled).toBe(disabled);
      // happy-dom incorrectly includes disabled textareas in FormData.
      const { window } = new JSDOM(fixture.form.outerHTML);
      window.document.querySelector('[data-slot="rich-text-source"]').value =
        field(fixture.wrapper).element.value;
      expect(
        new window.FormData(window.document.querySelector("form")).get("body"),
      ).toBe(disabled ? null : "Keep this");
      window.close();
      expect(content(fixture.wrapper).attributes("contenteditable")).toBe(
        "false",
      );
      expect(
        content(fixture.wrapper).attributes(
          disabled ? "aria-disabled" : "aria-readonly",
        ),
      ).toBe("true");
      expect(
        fixture.wrapper.get('button[aria-label="Bold"]').attributes("disabled"),
      ).toBe("");
      expect(fixture.wrapper.vm.checkValidity()).toBe(true);
    } finally {
      fixture.dispose();
    }
  }
});

test("required validation uses the native field and moves focus to the visual editor", async () => {
  const fixture = await create({ modelValue: "", required: true });
  try {
    expect(fixture.wrapper.vm.checkValidity()).toBe(false);
    await nextTick();
    expect(
      fixture.wrapper.get('[data-slot="rich-text-error"]').text(),
    ).toContain("Please fill out");
    expect(document.activeElement).toBe(content(fixture.wrapper).element);
    fixture.wrapper.vm.editor.commands.insertContent("Ready");
    await nextTick();
    expect(fixture.wrapper.vm.checkValidity()).toBe(true);
    expect(new FormData(fixture.form).get("body")).toBe("Ready");
  } finally {
    fixture.dispose();
  }
});

test("native form reset restores the original value and keeps controlled callers informed", async () => {
  const fixture = await create({ modelValue: "Original" });
  try {
    await fixture.wrapper.vm.setMode("source");
    await field(fixture.wrapper).setValue("Changed");
    fixture.form.reset();
    await settle();
    expect(field(fixture.wrapper).element.value).toBe("Original");
    expect(new FormData(fixture.form).get("body")).toBe("Original");
    expect(fixture.wrapper.emitted("update:modelValue").at(-1)).toEqual([
      "Original",
    ]);
    expect(fixture.wrapper.attributes("data-mode")).toBe("visual");
  } finally {
    fixture.dispose();
  }
});

test("cancelled resets do not discard the current source", async () => {
  const fixture = await create({ modelValue: "Original" });
  try {
    await fixture.wrapper.vm.setMode("source");
    await field(fixture.wrapper).setValue("Keep my draft");
    fixture.form.addEventListener("reset", (event) => event.preventDefault());
    // happy-dom ignores reset cancellation; exercise our event handler directly.
    fixture.form.dispatchEvent(
      new Event("reset", { cancelable: true, bubbles: true }),
    );
    await settle();
    expect(field(fixture.wrapper).element.value).toBe("Keep my draft");
  } finally {
    fixture.dispose();
  }
});

test("caller styling remains on the root while normal field attributes stay native", async () => {
  const fixture = await create(
    { modelValue: "Text" },
    {
      id: "description",
      class: "rounded-none border-0",
      autocomplete: "off",
      "data-context": "invoice",
    },
  );
  try {
    expect(fixture.wrapper.classes()).toContain("rounded-none");
    expect(fixture.wrapper.classes()).not.toContain("rounded-xl");
    expect(field(fixture.wrapper).attributes("id")).toBe("description");
    expect(field(fixture.wrapper).attributes("autocomplete")).toBe("off");
    expect(field(fixture.wrapper).attributes("data-context")).toBe("invoice");
  } finally {
    fixture.dispose();
  }
});

test("image uploads use the caller callback and insert its canonical URL without stealing focus", async () => {
  const calls = [];
  const fixture = await create({
    modelValue: "Draft",
    upload: async (file, options) => {
      calls.push({ file, options });
      return { src: "/uploads/diagram.png", alt: "A diagram" };
    },
  });
  try {
    const editor = fixture.wrapper.vm.editor;
    const file = new File(["image"], "diagram.png", { type: "image/png" });
    const fileHandler = editor.extensionManager.extensions.find(
      (extension) => extension.name === "fileHandler",
    );
    const activeElement = document.activeElement;
    await fileHandler.options.onPaste(editor, [file]);
    await nextTick();
    expect(calls).toHaveLength(1);
    expect(calls[0].file).toBe(file);
    expect(calls[0].options.signal.aborted).toBe(false);
    expect(field(fixture.wrapper).element.value).toContain(
      "![A diagram](/uploads/diagram.png)",
    );
    expect(document.activeElement).toBe(activeElement);
  } finally {
    fixture.dispose();
  }
});

test("a late image upload cannot overwrite a replaced document", async () => {
  let finishUpload;
  let signal;
  const fixture = await create({
    modelValue: "Original",
    upload: (_file, options) => {
      signal = options.signal;
      return new Promise((resolve) => {
        finishUpload = resolve;
      });
    },
  });
  try {
    const editor = fixture.wrapper.vm.editor;
    const fileHandler = editor.extensionManager.extensions.find(
      (extension) => extension.name === "fileHandler",
    );
    const pending = fileHandler.options.onPaste(editor, [
      new File(["image"], "diagram.png", { type: "image/png" }),
    ]);
    await fixture.wrapper.setProps({ modelValue: "Replacement document" });
    expect(signal.aborted).toBe(true);
    finishUpload({ src: "/uploads/stale.png", alt: "Stale image" });
    await pending;
    await nextTick();
    expect(field(fixture.wrapper).element.value).toBe("Replacement document");
    expect(fixture.wrapper.emitted("update:modelValue")).toBeUndefined();
  } finally {
    fixture.dispose();
  }
});

test("formatting toolbar is one tab stop with arrow, Home, and End navigation", async () => {
  const fixture = await create({ modelValue: "Text" });
  try {
    const toolbar = fixture.wrapper.get('[role="toolbar"]');
    expect(toolbar.findAll('button[tabindex="0"]')).toHaveLength(1);
    const heading = toolbar.get('button[aria-label="Heading"]');
    heading.element.focus();
    await heading.trigger("keydown", { key: "ArrowRight" });
    expect(document.activeElement).toBe(
      toolbar.get('button[aria-label="Bold"]').element,
    );
    await toolbar
      .get('button[aria-label="Bold"]')
      .trigger("keydown", { key: "Home" });
    expect(document.activeElement).toBe(heading.element);
    await heading.trigger("keydown", { key: "End" });
    const lastEnabled = toolbar.findAll("button:not(:disabled)").at(-1);
    expect(document.activeElement).toBe(lastEnabled.element);
    await lastEnabled.trigger("keydown", { key: "Escape" });
    expect(document.activeElement).toBe(content(fixture.wrapper).element);
  } finally {
    fixture.dispose();
  }
});
