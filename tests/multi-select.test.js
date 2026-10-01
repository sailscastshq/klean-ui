import { expect, test } from "@rstest/core";
import { mount } from "@vue/test-utils";
import { nextTick, createSSRApp, h } from "vue";
import { renderToString } from "@vue/server-renderer";
import MultiSelect from "../src/vue/multi-select/MultiSelect.vue";
const options = [
  { value: "a", label: "Alpha" },
  { value: "b", label: "Beta", disabled: true },
  { value: "c", label: "Charlie" },
];
const settle = async () => {
  await nextTick();
  await Promise.resolve();
  await nextTick();
};
function key(node, key) {
  node.dispatchEvent(
    new KeyboardEvent("keydown", { key, bubbles: true, cancelable: true }),
  );
}
async function fixture(props = {}) {
  const form = document.createElement("form");
  document.body.append(form);
  const wrapper = mount(MultiSelect, {
    attachTo: form,
    props: { options, name: "teams", ...props },
    attrs: { "aria-label": "Teams" },
  });
  await settle();
  return {
    wrapper,
    form,
    button: wrapper.get("button").element,
    cleanup: () => {
      wrapper.unmount();
      form.remove();
    },
  };
}
test("toggles fixed typed choices without closing, skips disabled and never duplicates", async () => {
  const f = await fixture();
  key(f.button, "ArrowDown");
  await settle();
  key(f.button, " ");
  await settle();
  expect(
    f.wrapper.get('[role="listbox"]').attributes("aria-multiselectable"),
  ).toBe("true");
  expect(f.button.getAttribute("aria-expanded")).toBe("true");
  expect(new FormData(f.form).getAll("teams")).toEqual(["a"]);
  key(f.button, "ArrowDown");
  await settle();
  key(f.button, "Enter");
  await settle();
  expect(f.wrapper.emitted("change").at(-1)[0]).toEqual(["a", "c"]);
  key(f.button, "Enter");
  await settle();
  expect(new FormData(f.form).getAll("teams")).toEqual(["a"]);
  key(f.button, "Escape");
  await settle();
  expect(f.button.getAttribute("aria-expanded")).toBe("false");
  f.cleanup();
});
test("controlled arrays emit next value but preserve authoritative state", async () => {
  const f = await fixture({ modelValue: ["a"] });
  key(f.button, "ArrowDown");
  await settle();
  key(f.button, "End");
  await settle();
  key(f.button, " ");
  await settle();
  expect(f.wrapper.emitted("update:modelValue").at(-1)[0]).toEqual(["a", "c"]);
  expect(new FormData(f.form).getAll("teams")).toEqual(["a"]);
  await f.wrapper.setProps({ modelValue: ["c"] });
  expect(f.button.textContent).toContain("Charlie");
  f.cleanup();
});
test("native reset restores default array, disabled contributes no form entries", async () => {
  const f = await fixture({ defaultValue: ["c"] });
  key(f.button, "ArrowDown");
  await settle();
  key(f.button, "Home");
  await settle();
  key(f.button, " ");
  await settle();
  f.form.reset();
  await settle();
  expect(new FormData(f.form).getAll("teams")).toEqual(["c"]);
  await f.wrapper.setProps({ disabled: true });
  expect(f.wrapper.get("select").element.disabled).toBe(true);
  expect(f.button.disabled).toBe(true);
  f.cleanup();
});
test("empty required selection uses native validation and visible invalid focus", async () => {
  const f = await fixture({ required: true, options: [] });
  const native = f.wrapper.get("select").element;
  expect(native.required).toBe(true);
  expect(native.getAttribute("aria-hidden")).toBe("true");
  native.dispatchEvent(new Event("invalid", { cancelable: true }));
  await settle();
  expect(document.activeElement).toBe(f.button);
  expect(f.button.getAttribute("aria-invalid")).toBe("true");
  expect(f.button.textContent).toContain("Select options");
  f.cleanup();
});
test("SSR contains selected fixed choices and no browser-only access", async () => {
  const html = await renderToString(
    createSSRApp({
      render: () =>
        h(MultiSelect, {
          options,
          defaultValue: ["c"],
          name: "teams",
          "aria-label": "Teams",
        }),
    }),
  );
  expect(html).toContain('aria-multiselectable="true"');
  expect(html).toContain("multiple");
  expect(html).toContain('value="c" selected');
  expect(html).toContain('aria-expanded="false"');
});

test("keyboard order follows interleaved groups as rendered and disabled closes an open popup", async () => {
  const f = await fixture({
    options: [
      { value: "a", label: "Alpha" },
      { value: "b", label: "Beta", group: "Grouped" },
      { value: "c", label: "Charlie" },
    ],
  });
  key(f.button, "ArrowDown");
  await settle();
  key(f.button, "ArrowDown");
  await settle();
  expect(f.button.getAttribute("aria-activedescendant")).toContain("option-2");
  await f.wrapper.setProps({ disabled: true });
  await settle();
  expect(f.button.getAttribute("aria-expanded")).toBe("false");
  f.cleanup();
});
