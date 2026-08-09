import { expect, test } from "@rstest/core";
import { mount } from "@vue/test-utils";
import { defineComponent, nextTick, ref } from "vue";
import Switch from "../src/vue/switch/Switch.vue";

const BooleanFixture = defineComponent({
  components: { Switch },
  setup() {
    const enabled = ref(false);
    return { enabled };
  },
  template: `
    <label for="release-switch" class="flex min-h-11 cursor-pointer items-center gap-3">
      <span>Enable preview releases</span>
      <Switch id="release-switch" v-model="enabled" name="previewReleases" />
    </label>
  `,
});

test("renders one native checkbox with switch semantics", () => {
  const wrapper = mount(BooleanFixture);
  const control = wrapper.find("input");

  expect(control.attributes("type")).toBe("checkbox");
  expect(control.attributes("role")).toBe("switch");
  expect(control.attributes("data-slot")).toBe("switch");
  expect(control.attributes("aria-checked")).toBeUndefined();
  expect(wrapper.findAll("input")).toHaveLength(1);
  expect(Switch.props.modelValue.type).toBe(Boolean);
  expect(Switch.props).not.toHaveProperty("variant");
  expect(Switch.props).not.toHaveProperty("size");
  expect(Switch.props).not.toHaveProperty("tone");
});

test("uses ordinary boolean v-model and native change behavior", async () => {
  const wrapper = mount(BooleanFixture);
  const control = wrapper.find("input");

  expect(wrapper.vm.enabled).toBe(false);
  expect(control.attributes("data-state")).toBe("unchecked");

  await control.setValue(true);

  expect(wrapper.vm.enabled).toBe(true);
  expect(control.attributes("data-state")).toBe("checked");
});

test("the associated label toggles the native control", async () => {
  const wrapper = mount(BooleanFixture, { attachTo: document.body });
  const control = wrapper.find("input");

  await wrapper.find("label").trigger("click");
  await nextTick();

  expect(wrapper.vm.enabled).toBe(true);
  expect(control.element.checked).toBe(true);
  wrapper.unmount();
});

test("forwards form and accessibility attributes while caller Tailwind wins", () => {
  const wrapper = mount(Switch, {
    props: { modelValue: true },
    attrs: {
      id: "webhook-switch",
      name: "webhookEnabled",
      value: "yes",
      disabled: true,
      required: true,
      "aria-invalid": "true",
      "aria-describedby": "webhook-error",
      "aria-checked": "false",
      role: "checkbox",
      type: "radio",
      class:
        "h-5 w-9 bg-amber-300 checked:bg-emerald-700 checked:after:[transform:translateX(1rem)]",
    },
  });

  expect(wrapper.attributes("id")).toBe("webhook-switch");
  expect(wrapper.attributes("name")).toBe("webhookEnabled");
  expect(wrapper.attributes("value")).toBe("yes");
  expect(wrapper.attributes("disabled")).toBe("");
  expect(wrapper.attributes("required")).toBe("");
  expect(wrapper.attributes("aria-describedby")).toBe("webhook-error");
  expect(wrapper.attributes("aria-checked")).toBeUndefined();
  expect(wrapper.attributes("role")).toBe("switch");
  expect(wrapper.attributes("type")).toBe("checkbox");
  expect(wrapper.attributes("data-disabled")).toBe("");
  expect(wrapper.attributes("data-invalid")).toBe("");
  expect(wrapper.classes()).toContain("h-5");
  expect(wrapper.classes()).toContain("w-9");
  expect(wrapper.classes()).toContain("bg-amber-300");
  expect(wrapper.classes()).toContain("checked:bg-emerald-700");
  expect(wrapper.classes()).toContain(
    "checked:after:[transform:translateX(1rem)]",
  );
  expect(wrapper.classes()).not.toContain("h-6");
  expect(wrapper.classes()).not.toContain("w-11");
  expect(wrapper.classes()).not.toContain("bg-gray-300");
  expect(wrapper.classes()).not.toContain("checked:bg-gray-950");
  expect(wrapper.classes()).not.toContain(
    "checked:after:[transform:translateX(1.25rem)]",
  );
});

test("keeps native form reset and the Vue model in agreement", async () => {
  const fixture = defineComponent({
    components: { Switch },
    setup() {
      const enabled = ref(true);
      return { enabled };
    },
    template: `
      <form>
        <Switch v-model="enabled" name="enabled" aria-label="Enabled" />
      </form>
    `,
  });
  const wrapper = mount(fixture);
  const control = wrapper.find("input");

  await control.setValue(false);
  expect(wrapper.vm.enabled).toBe(false);

  wrapper.find("form").element.reset();
  await Promise.resolve();
  await nextTick();

  expect(wrapper.vm.enabled).toBe(true);
  expect(control.element.checked).toBe(true);
  expect(control.attributes("data-state")).toBe("checked");
});
