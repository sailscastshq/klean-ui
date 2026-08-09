import { expect, test } from "@rstest/core";
import { mount } from "@vue/test-utils";
import { defineComponent, nextTick, ref } from "vue";
import Checkbox from "../src/vue/checkbox/Checkbox.vue";

const BooleanFixture = defineComponent({
  components: { Checkbox },
  setup() {
    const accepted = ref(false);
    return { accepted };
  },
  template: `
    <label for="terms" class="flex cursor-pointer items-center gap-2">
      <Checkbox id="terms" v-model="accepted" name="terms" required />
      Accept the terms
    </label>
  `,
});

test("renders one native checkbox with browser-owned interaction semantics", () => {
  const wrapper = mount(BooleanFixture);
  const checkbox = wrapper.find("input");

  expect(checkbox.attributes("type")).toBe("checkbox");
  expect(checkbox.attributes("data-slot")).toBe("checkbox");
  expect(checkbox.attributes("required")).toBe("");
  expect(checkbox.attributes("role")).toBeUndefined();
  expect(checkbox.attributes("aria-checked")).toBeUndefined();
  expect(Checkbox.props).not.toHaveProperty("variant");
  expect(Checkbox.props).not.toHaveProperty("size");
  expect(Checkbox.props).not.toHaveProperty("tone");
});

test("uses ordinary Vue v-model for boolean state", async () => {
  const wrapper = mount(BooleanFixture);
  const checkbox = wrapper.find("input");

  expect(wrapper.vm.accepted).toBe(false);
  expect(checkbox.attributes("data-state")).toBe("unchecked");

  await checkbox.setValue(true);

  expect(wrapper.vm.accepted).toBe(true);
  expect(checkbox.attributes("data-state")).toBe("checked");
});

test("preserves Vue collection membership and true/false values", async () => {
  const fixture = defineComponent({
    components: { Checkbox },
    setup() {
      const channels = ref(["email"]);
      const decision = ref("no");
      return { channels, decision };
    },
    template: `
      <div>
        <Checkbox v-model="channels" value="email" aria-label="Email" />
        <Checkbox v-model="channels" value="slack" aria-label="Slack" />
        <Checkbox
          v-model="decision"
          true-value="yes"
          false-value="no"
          aria-label="Decision"
        />
      </div>
    `,
  });
  const wrapper = mount(fixture);
  const [email, slack, decision] = wrapper.findAll("input");

  expect(email.element.checked).toBe(true);
  expect(slack.element.checked).toBe(false);
  expect(decision.element.checked).toBe(false);

  await slack.setValue(true);
  await email.setValue(false);
  await decision.setValue(true);

  expect(wrapper.vm.channels).toEqual(["slack"]);
  expect(wrapper.vm.decision).toBe("yes");
});

test("preserves Vue Set membership", async () => {
  const fixture = defineComponent({
    components: { Checkbox },
    setup() {
      const channels = ref(new Set(["email"]));
      return { channels };
    },
    template: `
      <div>
        <Checkbox v-model="channels" value="email" aria-label="Email" />
        <Checkbox v-model="channels" value="slack" aria-label="Slack" />
      </div>
    `,
  });
  const wrapper = mount(fixture);
  const [email, slack] = wrapper.findAll("input");

  await slack.setValue(true);
  await email.setValue(false);

  expect(wrapper.vm.channels).toEqual(new Set(["slack"]));
});

test("uses the native indeterminate property and mixed accessibility mapping", async () => {
  const wrapper = mount(Checkbox, {
    props: { modelValue: true, indeterminate: true },
    attrs: { "aria-label": "Select all rows" },
  });

  expect(wrapper.element.indeterminate).toBe(true);
  expect(wrapper.attributes("data-state")).toBe("indeterminate");
  expect(wrapper.attributes("aria-checked")).toBeUndefined();

  await wrapper.setProps({ indeterminate: false });

  expect(wrapper.element.indeterminate).toBe(false);
  expect(wrapper.attributes("data-state")).toBe("checked");
});

test("forwards native form and accessibility attributes while caller classes win", () => {
  const wrapper = mount(Checkbox, {
    attrs: {
      id: "purge-data",
      name: "purgeData",
      value: "yes",
      disabled: true,
      required: true,
      "aria-invalid": "true",
      "aria-describedby": "purge-data-error",
      class: "size-5 text-red-600 focus-visible:outline-red-600",
    },
  });

  expect(wrapper.attributes("id")).toBe("purge-data");
  expect(wrapper.attributes("name")).toBe("purgeData");
  expect(wrapper.attributes("value")).toBe("yes");
  expect(wrapper.attributes("disabled")).toBe("");
  expect(wrapper.attributes("required")).toBe("");
  expect(wrapper.attributes("aria-describedby")).toBe("purge-data-error");
  expect(wrapper.attributes("data-disabled")).toBe("");
  expect(wrapper.attributes("data-invalid")).toBe("");
  expect(wrapper.classes()).toContain("size-5");
  expect(wrapper.classes()).toContain("text-red-600");
  expect(wrapper.classes()).not.toContain("size-4");
  expect(wrapper.classes()).not.toContain("text-gray-950");
});

test("keeps native form reset and the Vue model in agreement", async () => {
  const fixture = defineComponent({
    components: { Checkbox },
    setup() {
      const selected = ref(true);
      return { selected };
    },
    template: `
      <form>
        <Checkbox v-model="selected" name="selected" aria-label="Selected" />
      </form>
    `,
  });
  const wrapper = mount(fixture);
  const checkbox = wrapper.find("input");

  await checkbox.setValue(false);
  expect(wrapper.vm.selected).toBe(false);

  wrapper.find("form").element.reset();
  await Promise.resolve();
  await nextTick();

  expect(wrapper.vm.selected).toBe(true);
  expect(checkbox.element.checked).toBe(true);
  expect(checkbox.attributes("data-state")).toBe("checked");
});
