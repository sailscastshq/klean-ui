import { expect, test } from "@rstest/core";
import { mount } from "@vue/test-utils";
import { nextTick } from "vue";
import Combobox from "../src/vue/combobox/Combobox.vue";

const options = [
  { value: "slipway", label: "Slipway", description: "Deploy Sails apps" },
  { value: "retired", label: "Retired service", disabled: true },
  {
    value: "hagfish",
    label: "Hagfish",
    description: "Invoices and customers",
    keywords: ["billing"],
  },
];

async function settle() {
  await nextTick();
  await Promise.resolve();
  await nextTick();
}

function key(element, value) {
  const event = new KeyboardEvent("keydown", {
    key: value,
    bubbles: true,
    cancelable: true,
  });
  element.dispatchEvent(event);
  return event;
}

async function mountCombobox(props = {}, attrs = {}) {
  const host = document.createElement("div");
  document.body.append(host);
  const wrapper = mount(Combobox, {
    attachTo: host,
    props: { options, ...props },
    attrs,
  });
  await settle();
  return {
    wrapper,
    input: wrapper.get('[data-slot="combobox-input"]'),
    cleanup() {
      wrapper.unmount();
      host.remove();
    },
  };
}

test("uses an editable combobox with one owned listbox and typed form value", async () => {
  const { wrapper, input, cleanup } = await mountCombobox(
    {
      id: "project",
      defaultValue: "slipway",
      name: "project",
      required: true,
    },
    {
      "aria-labelledby": "project-label",
      "aria-describedby": "project-help",
    },
  );

  expect(input.element.tagName).toBe("INPUT");
  expect(input.attributes("role")).toBe("combobox");
  expect(input.attributes("aria-autocomplete")).toBe("list");
  expect(input.attributes("aria-expanded")).toBe("false");
  expect(input.attributes("popovertarget")).toBeUndefined();
  expect(input.attributes("popovertargetaction")).toBeUndefined();
  expect(input.attributes("aria-required")).toBe("true");
  expect(input.attributes("aria-labelledby")).toBe("project-label");
  expect(input.element.value).toBe("Slipway");
  expect(wrapper.get('input[type="hidden"]').attributes()).toMatchObject({
    name: "project",
    value: "slipway",
  });
  cleanup();
});

test("keeps focus on the input while filtering and selecting", async () => {
  const { wrapper, input, cleanup } = await mountCombobox({
    defaultValue: "slipway",
  });

  input.element.focus();
  await settle();
  expect(input.attributes("aria-expanded")).toBe("false");
  await input.trigger("click");
  await settle();
  expect(input.attributes("aria-expanded")).toBe("true");
  expect(document.activeElement).toBe(input.element);
  expect(wrapper.findAll('[role="listbox"]')).toHaveLength(1);

  await input.setValue("bill");
  await settle();
  expect(wrapper.findAll('[role="option"]')).toHaveLength(1);
  expect(wrapper.get('[role="option"]').text()).toContain("Hagfish");

  key(input.element, "ArrowDown");
  key(input.element, "Enter");
  await settle();

  expect(wrapper.emitted("update:modelValue")).toEqual([["hagfish"]]);
  expect(wrapper.emitted("change")[0][0]).toBe("hagfish");
  expect(input.element.value).toBe("Hagfish");
  expect(input.attributes("aria-expanded")).toBe("false");
  expect(document.activeElement).toBe(input.element);
  cleanup();
});

test("keyboard navigation skips disabled options and exposes the active descendant", async () => {
  const { wrapper, input, cleanup } = await mountCombobox();

  input.element.focus();
  await settle();
  key(input.element, "ArrowDown");
  await settle();
  key(input.element, "ArrowDown");
  await settle();

  expect(wrapper.get("[data-highlighted]").text()).toContain("Hagfish");
  expect(input.attributes("aria-activedescendant")).toBe(
    wrapper.get("[data-highlighted]").attributes("id"),
  );
  cleanup();
});

test("Escape abandons an unfinished query without changing the committed value", async () => {
  const { wrapper, input, cleanup } = await mountCombobox({
    defaultValue: "slipway",
  });

  input.element.focus();
  await input.setValue("hag");
  key(input.element, "Escape");
  await settle();

  expect(wrapper.emitted("change")).toBeUndefined();
  expect(input.element.value).toBe("Slipway");
  expect(input.attributes("aria-expanded")).toBe("false");
  expect(document.activeElement).toBe(input.element);
  cleanup();
});

test("Tab closes without trapping focus or committing the highlight", async () => {
  const { wrapper, input, cleanup } = await mountCombobox({
    defaultValue: "slipway",
  });

  input.element.focus();
  await settle();
  await input.trigger("click");
  await settle();
  const event = key(input.element, "Tab");
  await settle();

  expect(event.defaultPrevented).toBe(false);
  expect(wrapper.emitted("change")).toBeUndefined();
  expect(input.attributes("aria-expanded")).toBe("false");
  cleanup();
});

test("debounces application-owned remote search and clears replaced work", async () => {
  const { wrapper, input, cleanup } = await mountCombobox({ searchDelay: 10 });

  input.element.focus();
  await input.setValue("s");
  await input.setValue("sl");
  await input.setValue("sli");
  await new Promise((resolve) => setTimeout(resolve, 20));

  expect(wrapper.emitted("search")).toEqual([["sli"]]);
  cleanup();
});

test("requests an initial remote page with an empty query when opened", async () => {
  const { wrapper, input, cleanup } = await mountCombobox({ searchDelay: 10 });

  await input.trigger("click");
  await new Promise((resolve) => setTimeout(resolve, 20));

  expect(wrapper.emitted("search")).toEqual([[""]]);
  cleanup();
});

test("keeps useful results present alongside loading and error status", async () => {
  const { wrapper, input, cleanup } = await mountCombobox({
    loading: true,
    error: "Could not refresh repositories.",
  });

  await input.trigger("click");
  await settle();

  expect(wrapper.findAll('[role="option"]')).toHaveLength(3);
  expect(wrapper.get('[data-slot="combobox-loading"]').attributes("role")).toBe(
    "status",
  );
  expect(wrapper.get('[data-slot="combobox-error"]').text()).toContain(
    "Could not refresh repositories.",
  );
  cleanup();
});

test("caller Tailwind wins on the visible input", async () => {
  const { input, cleanup } = await mountCombobox(
    {},
    { class: "rounded-none border-2 bg-amber-50", "aria-invalid": "true" },
  );

  expect(input.classes()).toContain("rounded-none");
  expect(input.classes()).toContain("border-2");
  expect(input.classes()).toContain("bg-amber-50");
  expect(input.classes()).not.toContain("rounded-md");
  expect(input.attributes("aria-invalid")).toBe("true");
  cleanup();
});

test("local filtering stays on by default and can yield to application matching", async () => {
  const { wrapper, input, cleanup } = await mountCombobox({
    options: [{ value: 42, label: "Automobile" }],
  });
  await input.setValue("car");
  await settle();
  expect(wrapper.findAll('[role="option"]')).toHaveLength(0);
  await wrapper.setProps({ filter: false });
  await settle();
  expect(wrapper.get('[role="option"]').text()).toContain("Automobile");
  expect(input.attributes("filter")).toBeUndefined();
  await wrapper.setProps({ filter: true });
  await settle();
  expect(wrapper.findAll('[role="option"]')).toHaveLength(0);
  expect(wrapper.emitted("change")).toBeUndefined();
  cleanup();
});

test("application matches retain ranking, skip disabled choices and commit typed values", async () => {
  const { wrapper, input, cleanup } = await mountCombobox({
    filter: false,
    name: "vehicle",
    searchDelay: 10,
    options: [{ value: "waiting", label: "Previous result" }],
  });
  input.element.focus();
  await input.setValue("car");
  await wrapper.setProps({
    options: [
      { value: "archived", label: "Archived vehicle", disabled: true },
      { value: 42, label: "Automobile" },
      { value: 7, label: "Motor vehicle" },
    ],
  });
  await settle();
  expect(
    wrapper.findAll('[role="option"]').map((option) => option.text()),
  ).toEqual(["Archived vehicle", "Automobile", "Motor vehicle"]);
  await new Promise((resolve) => setTimeout(resolve, 20));
  expect(wrapper.emitted("search").at(-1)).toEqual(["car"]);
  expect(wrapper.emitted("change")).toBeUndefined();
  key(input.element, "Home");
  key(input.element, "Enter");
  await settle();
  expect(wrapper.emitted("update:modelValue")).toEqual([[42]]);
  expect(wrapper.get('input[type="hidden"]').element.value).toBe("42");
  expect(input.element.value).toBe("Automobile");
  expect(document.activeElement).toBe(input.element);
  cleanup();
});

test("controlled query and value stay authoritative with application matches", async () => {
  const { wrapper, input, cleanup } = await mountCombobox({
    filter: false,
    query: "car",
    modelValue: 7,
    defaultOpen: true,
    options: [
      { value: 42, label: "Automobile" },
      { value: 7, label: "Motor vehicle" },
    ],
  });
  expect(wrapper.findAll('[role="option"]')).toHaveLength(2);
  key(input.element, "Home");
  key(input.element, "Enter");
  await settle();
  expect(wrapper.emitted("update:modelValue")).toEqual([[42]]);
  expect(wrapper.find('input[type="hidden"]').exists()).toBe(false);
  expect(input.element.value).toBe("Motor vehicle");
  cleanup();
});
