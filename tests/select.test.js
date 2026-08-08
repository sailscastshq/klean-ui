import { expect, test } from "@rstest/core";
import { mount } from "@vue/test-utils";
import { nextTick } from "vue";
import Select from "../src/vue/select/Select.vue";

const options = [
  { value: "viewer", label: "Viewer" },
  { value: "editor", label: "Editor", disabled: true },
  { value: "administrator", label: "Administrator" },
];

async function settle() {
  await nextTick();
  await Promise.resolve();
  await nextTick();
}

function key(element, value, init = {}) {
  element.dispatchEvent(
    new KeyboardEvent("keydown", {
      key: value,
      bubbles: true,
      cancelable: true,
      ...init,
    }),
  );
}

async function mountSelect(props = {}, attrs = {}) {
  const host = document.createElement("div");
  document.body.append(host);
  const wrapper = mount(Select, {
    attachTo: host,
    props: { options, ...props },
    attrs,
  });
  await settle();

  return {
    wrapper,
    trigger: wrapper.get('[data-slot="select-trigger"]'),
    cleanup() {
      wrapper.unmount();
      host.remove();
    },
  };
}

test("exposes one labelled select-only combobox and typed form value", async () => {
  const { wrapper, trigger, cleanup } = await mountSelect(
    {
      id: "member-role",
      defaultValue: 2,
      name: "role",
      required: true,
      options: [
        { value: 1, label: "Viewer" },
        { value: 2, label: "Editor" },
        { value: 3, label: "Administrator" },
      ],
    },
    {
      "aria-labelledby": "member-role-label",
      "aria-describedby": "member-role-help",
    },
  );

  expect(trigger.element.tagName).toBe("BUTTON");
  expect(trigger.attributes("role")).toBe("combobox");
  expect(trigger.attributes("aria-haspopup")).toBe("listbox");
  expect(trigger.attributes("aria-expanded")).toBe("false");
  expect(trigger.attributes("aria-required")).toBe("true");
  expect(trigger.attributes("aria-labelledby")).toBe("member-role-label");
  expect(trigger.attributes("aria-describedby")).toBe("member-role-help");
  expect(trigger.text()).toContain("Editor");
  expect(wrapper.get('input[type="hidden"]').attributes()).toMatchObject({
    name: "role",
    value: "2",
  });
  cleanup();
});

test("opens with the selected option highlighted without committing", async () => {
  const { wrapper, trigger, cleanup } = await mountSelect({
    defaultValue: "viewer",
  });

  trigger.element.focus();
  key(trigger.element, "ArrowDown");
  await settle();

  expect(trigger.attributes("aria-expanded")).toBe("true");
  expect(wrapper.get('[role="listbox"]').exists()).toBe(true);
  expect(wrapper.get("[data-highlighted]").text()).toContain("Viewer");
  expect(wrapper.emitted("change")).toBeUndefined();
  cleanup();
});

test("keyboard navigation skips disabled options and commits exactly once", async () => {
  const { wrapper, trigger, cleanup } = await mountSelect({
    defaultValue: "viewer",
  });

  trigger.element.focus();
  key(trigger.element, "ArrowDown");
  await settle();
  key(trigger.element, "ArrowDown");
  await settle();

  expect(wrapper.get("[data-highlighted]").text()).toContain("Administrator");
  expect(wrapper.emitted("change")).toBeUndefined();

  key(trigger.element, "Enter");
  await settle();

  expect(wrapper.emitted("update:modelValue")).toEqual([["administrator"]]);
  expect(wrapper.emitted("change")).toHaveLength(1);
  expect(wrapper.emitted("change")[0][0]).toBe("administrator");
  expect(trigger.attributes("aria-expanded")).toBe("false");
  expect(document.activeElement).toBe(trigger.element);
  cleanup();
});

test("Escape cancels navigation and restores trigger focus", async () => {
  const { wrapper, trigger, cleanup } = await mountSelect({
    defaultValue: "viewer",
  });

  trigger.element.focus();
  key(trigger.element, "ArrowDown");
  await settle();
  key(trigger.element, "End");
  key(trigger.element, "Escape");
  await settle();

  expect(wrapper.emitted("change")).toBeUndefined();
  expect(trigger.text()).toContain("Viewer");
  expect(trigger.attributes("aria-expanded")).toBe("false");
  expect(document.activeElement).toBe(trigger.element);
  cleanup();
});

test("closed typeahead preserves boolean values and selects immediately", async () => {
  const { wrapper, trigger, cleanup } = await mountSelect({
    name: "active",
    options: [
      { value: true, label: "Active" },
      { value: false, label: "Paused" },
    ],
  });

  key(trigger.element, "p");
  await settle();

  expect(wrapper.emitted("update:modelValue")).toEqual([[false]]);
  expect(wrapper.get('input[name="active"]').attributes("value")).toBe("false");
  expect(trigger.text()).toContain("Paused");
  cleanup();
});

test("dynamic options clear stale visual selection and retarget highlight", async () => {
  const { wrapper, trigger, cleanup } = await mountSelect({
    defaultValue: "viewer",
  });

  await wrapper.setProps({
    options: [
      { value: "administrator", label: "Administrator" },
      { value: "owner", label: "Owner" },
    ],
  });
  await settle();

  expect(trigger.text()).toContain("Select an option");
  expect(wrapper.find("[data-selected]").exists()).toBe(false);

  key(trigger.element, "ArrowDown");
  await settle();
  expect(wrapper.get("[data-highlighted]").text()).toContain("Administrator");
  cleanup();
});

test("grouped options retain one listbox and honest group semantics", async () => {
  const { wrapper, trigger, cleanup } = await mountSelect({
    options: [
      { value: "lagos", label: "Lagos", group: "Nigeria" },
      { value: "abuja", label: "Abuja", group: "Nigeria" },
      { value: "accra", label: "Accra", group: "Ghana" },
    ],
  });

  key(trigger.element, "ArrowDown");
  await settle();

  expect(wrapper.findAll('[role="listbox"]')).toHaveLength(1);
  expect(
    wrapper
      .findAll('[role="group"]')
      .map((group) => group.attributes("aria-label")),
  ).toEqual(["Nigeria", "Ghana"]);
  expect(wrapper.findAll('[role="option"]')).toHaveLength(3);
  cleanup();
});

test("caller Tailwind wins on the visible trigger and invalid state is native", async () => {
  const { wrapper, trigger, cleanup } = await mountSelect(
    {},
    {
      class: "rounded-none border-2 bg-amber-50",
      "aria-invalid": "true",
    },
  );

  expect(trigger.classes()).toContain("rounded-none");
  expect(trigger.classes()).toContain("border-2");
  expect(trigger.classes()).toContain("bg-amber-50");
  expect(trigger.classes()).not.toContain("rounded-md");
  expect(trigger.attributes("aria-invalid")).toBe("true");
  expect(wrapper.get('[data-slot="select"]').attributes()).toHaveProperty(
    "data-invalid",
  );
  cleanup();
});

test("an uncontrolled form reset restores the default value", async () => {
  const form = document.createElement("form");
  document.body.append(form);
  const wrapper = mount(Select, {
    attachTo: form,
    props: {
      options,
      defaultValue: "viewer",
      name: "role",
    },
  });
  await settle();
  const trigger = wrapper.get('[data-slot="select-trigger"]');

  key(trigger.element, "a");
  await settle();
  expect(trigger.text()).toContain("Administrator");

  form.reset();
  await settle();
  expect(trigger.text()).toContain("Viewer");
  expect(wrapper.get('input[name="role"]').attributes("value")).toBe("viewer");

  wrapper.unmount();
  form.remove();
});
