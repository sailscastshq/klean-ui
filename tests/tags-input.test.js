import { expect, test } from "@rstest/core";
import { mount } from "@vue/test-utils";
import { defineComponent, nextTick, ref } from "vue";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { parse } from "@babel/parser";
import { compile } from "svelte/compiler";
import TagsInput from "../src/vue/tags-input/TagsInput.vue";

async function settle() {
  await nextTick();
  await Promise.resolve();
  await nextTick();
}

async function mountTags({
  tags = [],
  draft = "",
  props = {},
  attrs = {},
} = {}) {
  const host = document.createElement("div");
  document.body.append(host);
  const state = {
    tags: ref([...tags]),
    draft: ref(draft),
  };
  const Harness = defineComponent({
    components: { TagsInput },
    setup() {
      return { ...state, attrs, props };
    },
    template: `
      <form>
        <label for="tags-test">Tags</label>
        <TagsInput
          id="tags-test"
          v-model="tags"
          v-model:draft="draft"
          v-bind="{ ...props, ...attrs }"
        />
        <button type="reset">Reset</button>
      </form>
    `,
  });
  const wrapper = mount(Harness, { attachTo: host });
  await settle();

  return {
    wrapper,
    component: wrapper.getComponent(TagsInput),
    input: wrapper.get('[data-part="input"]'),
    state,
    cleanup() {
      wrapper.unmount();
      host.remove();
    },
  };
}

function paste(element, text) {
  const event = new Event("paste", { bubbles: true, cancelable: true });
  Object.defineProperty(event, "clipboardData", {
    value: { getData: () => text },
  });
  element.dispatchEvent(event);
}

test("commits on Enter, comma, and blur while keeping caller-owned state", async () => {
  const { input, state, cleanup } = await mountTags();

  await input.setValue("billing");
  await input.trigger("keydown", { key: "Enter" });
  await settle();
  expect(state.tags.value).toEqual(["billing"]);
  expect(state.draft.value).toBe("");

  await input.setValue("invoice");
  await input.trigger("keydown", { key: "," });
  await settle();
  expect(state.tags.value).toEqual(["billing", "invoice"]);

  await input.setValue("paid");
  await input.trigger("blur");
  await settle();
  expect(state.tags.value).toEqual(["billing", "invoice", "paid"]);
  cleanup();
});

test("bulk paste adds valid tags once and preserves rejected text", async () => {
  const { wrapper, input, state, cleanup } = await mountTags({
    tags: ["billing"],
    props: {
      max: 4,
      normalize: (tag) => tag.trim().toLowerCase(),
      validate: (tag) => tag !== "private" || "Private is reserved.",
    },
  });

  paste(input.element, "INVOICE, billing, private, paid");
  await settle();

  expect(state.tags.value).toEqual(["billing", "invoice", "paid"]);
  expect(state.draft.value).toBe("billing, private");
  expect(wrapper.text()).toContain("Private is reserved.");
  cleanup();
});

test("uses repeated native form values without submitting the pending draft", async () => {
  const { wrapper, input, cleanup } = await mountTags({
    tags: ["billing", "paid"],
    draft: "unfinished",
    props: { name: "tags", required: true },
  });
  const data = new FormData(wrapper.get("form").element);

  expect(data.getAll("tags")).toEqual(["billing", "paid"]);
  expect(input.attributes("required")).toBeUndefined();
  cleanup();
});

test("supports an explicit external native form owner", async () => {
  const owner = document.createElement("form");
  owner.id = "external-form";
  document.body.append(owner);
  const { state, cleanup } = await mountTags({
    tags: ["billing", "paid"],
    props: { name: "tags", form: "external-form" },
  });

  expect(new FormData(owner).getAll("tags")).toEqual(state.tags.value);
  cleanup();
  owner.remove();
});

test("required is carried by the real text field until one tag exists", async () => {
  const { input, cleanup } = await mountTags({ props: { required: true } });
  expect(input.attributes()).toHaveProperty("required");
  cleanup();
});

test("keyboard removal restores focus to the next logical control", async () => {
  const { wrapper, state, cleanup } = await mountTags({
    tags: ["one", "two", "three"],
  });
  const buttons = wrapper.findAll('[data-part="remove"]');
  buttons[1].element.focus();
  await buttons[1].trigger("keydown", { key: "Delete" });
  await settle();

  expect(state.tags.value).toEqual(["one", "three"]);
  expect(document.activeElement).toBe(
    wrapper.findAll('[data-part="remove"]')[1].element,
  );
  cleanup();
});

test("empty Backspace removes the last tag and keeps focus in the field", async () => {
  const { input, state, cleanup } = await mountTags({ tags: ["one", "two"] });
  input.element.focus();
  await input.trigger("keydown", { key: "Backspace" });
  await settle();

  expect(state.tags.value).toEqual(["one"]);
  expect(document.activeElement).toBe(input.element);
  cleanup();
});

test("IME composition does not commit an unfinished value", async () => {
  const { input, state, cleanup } = await mountTags();
  await input.setValue("東京");
  await input.trigger("compositionstart");
  await input.trigger("keydown", { key: "Enter", isComposing: true });
  await settle();

  expect(state.tags.value).toEqual([]);
  expect(state.draft.value).toBe("東京");
  cleanup();
});

test("native form reset restores committed tags and unfinished draft", async () => {
  const { wrapper, input, state, cleanup } = await mountTags({
    tags: ["original"],
    draft: "pending",
  });
  await input.setValue("new");
  await input.trigger("keydown", { key: "Enter" });
  await settle();
  expect(state.tags.value).toEqual(["original", "new"]);

  wrapper.get('button[type="reset"]').element.click();
  await settle();
  expect(state.tags.value).toEqual(["original"]);
  expect(state.draft.value).toBe("pending");
  cleanup();
});

test("caller Tailwind wins and stable parts expose internal styling", async () => {
  const { wrapper, cleanup } = await mountTags({
    tags: ["billing"],
    attrs: {
      class: "rounded-none border-2",
      "aria-invalid": "true",
    },
  });
  const root = wrapper.get('[data-slot="tags-input"]');

  expect(root.classes()).toContain("rounded-none");
  expect(root.classes()).toContain("border-2");
  expect(root.classes()).not.toContain("rounded-md");
  expect(root.attributes()).toHaveProperty("data-invalid");
  expect(wrapper.get('[data-part="tag"]').exists()).toBe(true);
  expect(wrapper.get('[data-part="remove"]').element.tagName).toBe("BUTTON");
  cleanup();
});

test("read-only tags remain visible and submit without removal controls", async () => {
  const { wrapper, input, cleanup } = await mountTags({
    tags: ["verified"],
    props: { readonly: true, name: "tags" },
  });

  expect(wrapper.find('[data-part="remove"]').exists()).toBe(false);
  expect(input.attributes()).toHaveProperty("readonly");
  expect(new FormData(wrapper.get("form").element).getAll("tags")).toEqual([
    "verified",
  ]);
  cleanup();
});

test("ships identical Vue workbench source and valid React and Svelte ports", () => {
  const registryVue = readFileSync(
    resolve("registry/tags-input/vue/TagsInput.vue"),
    "utf8",
  );
  expect(registryVue).toBe(
    readFileSync(resolve("src/vue/tags-input/TagsInput.vue"), "utf8"),
  );

  const react = readFileSync(
    resolve("registry/tags-input/react/TagsInput.jsx"),
    "utf8",
  );
  expect(() =>
    parse(react, { sourceType: "module", plugins: ["jsx"] }),
  ).not.toThrow();

  const svelte = readFileSync(
    resolve("registry/tags-input/svelte/TagsInput.svelte"),
    "utf8",
  );
  expect(
    compile(svelte, { filename: "TagsInput.svelte", generate: false }).warnings,
  ).toEqual([]);
});

test("keeps durability caller-owned and avoids configuration-heavy anatomy", () => {
  for (const [framework, filename] of [
    ["vue", "TagsInput.vue"],
    ["react", "TagsInput.jsx"],
    ["svelte", "TagsInput.svelte"],
  ]) {
    const source = readFileSync(
      resolve(`registry/tags-input/${framework}/${filename}`),
      "utf8",
    );
    expect(source).not.toMatch(/localStorage|sessionStorage|URLSearchParams/);
    expect(source).not.toMatch(/TagsInput(?:Item|Remove|Input|List)/);
    expect(source).not.toMatch(/addOnPaste|addOnBlur|allowDuplicates/);
    expect(source).not.toMatch(/\bvariant\b/i);
    expect(source).toContain("data-part");
  }
});
