import { expect, test } from "@rstest/core";
import { mount } from "@vue/test-utils";
import Chips from "../src/vue/chips/Chips.vue";

test("adds without submitting, reports duplicates, and preserves accessible input attributes", async () => {
  const wrapper = mount(Chips, {
    props: { modelValue: ["5"] },
    attrs: { id: "amounts", "aria-label": "Amounts" },
  });
  const input = wrapper.find("input");
  await input.setValue("5");
  const event = new KeyboardEvent("keydown", {
    key: "Enter",
    cancelable: true,
    bubbles: true,
  });
  input.element.dispatchEvent(event);
  await wrapper.vm.$nextTick();
  expect(event.defaultPrevented).toBe(true);
  expect(wrapper.find('[role="alert"]').text()).toContain("already added");
  expect(input.element.checkValidity()).toBe(false);
  await input.setValue("10");
  await input.trigger("keydown", { key: "Enter" });
  expect(wrapper.emitted("update:modelValue")[0][0]).toEqual(["5", "10"]);
  expect(input.attributes("id")).toBe("amounts");
  expect(input.element.checkValidity()).toBe(true);
  wrapper.unmount();
});

test("readonly values cannot be removed or added", async () => {
  const wrapper = mount(Chips, {
    props: { modelValue: ["5"], readonly: true },
  });
  expect(wrapper.find("button").exists()).toBe(false);
  await wrapper.find("input").setValue("10");
  await wrapper.find("input").trigger("keydown", { key: "Enter" });
  expect(wrapper.emitted("update:modelValue")).toBeUndefined();
  wrapper.unmount();
});
