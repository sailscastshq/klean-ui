import { expect, test } from "@rstest/core";
import { mount } from "@vue/test-utils";
import { nextTick } from "vue";
import Slider from "../src/vue/slider/Slider.vue";
import {
  moveSlider,
  sliderBounds,
  sliderValue,
} from "../src/vue/slider/slider.js";

test("normalizes decimal steps, reversed ranges, gaps and non-divisible bounds", () => {
  const bounds = sliderBounds(-1, 1, 0.1, 2);
  expect(sliderValue(0.26, bounds)).toBe(0.3);
  expect(sliderValue([0.8, -0.4], bounds)).toEqual([-0.4, 0.8]);
  expect(moveSlider([-0.4, 0.8], 0, 1, bounds)).toEqual([0.6, 0.8]);
  expect(sliderBounds(0, 10, 3).max).toBe(9);
  expect(sliderValue([9, 9], sliderBounds(0, 10, 1, 2))).toEqual([8, 10]);
  expect(sliderValue(0.126, sliderBounds(0, 1, "any"))).toBe(0.126);
  expect(sliderBounds(0, 100, "invalid").step).toBe(1);
});

test("uses native inputs, stable endpoint labels and dependent accessible limits", async () => {
  const wrapper = mount(Slider, {
    props: {
      modelValue: [20, 80],
      minStepsBetween: 5,
      labels: ["Minimum price", "Maximum price"],
      name: "price",
    },
    attrs: { "aria-label": "Price range" },
  });
  const inputs = wrapper.findAll('input[type="range"]');
  expect(inputs).toHaveLength(2);
  expect(inputs[0].attributes("aria-label")).toBe("Minimum price");
  expect(inputs[1].attributes("aria-valuemin")).toBe("25");
  expect(inputs[0].attributes("aria-valuemax")).toBe("75");
  expect(inputs.map((input) => input.attributes("name"))).toEqual([
    "price",
    "price",
  ]);
  await inputs[0].setValue(99);
  expect(wrapper.emitted("update:modelValue").at(-1)).toEqual([[75, 80]]);
  wrapper.unmount();
});

test("supports larger keyboard steps and native disabled state", async () => {
  const wrapper = mount(Slider, {
    props: { modelValue: 30, bigStep: 20 },
    attrs: { "aria-label": "Rollout" },
  });
  await wrapper
    .get("input")
    .trigger("keydown", { key: "ArrowRight", shiftKey: true });
  expect(wrapper.emitted("update:modelValue").at(-1)).toEqual([50]);
  expect(wrapper.emitted("commit").at(-1)).toEqual([50]);
  await wrapper.setProps({ disabled: true });
  expect(wrapper.get("input").element.disabled).toBe(true);
  wrapper.unmount();
});

test("keeps the group label separate from the two endpoint names", () => {
  const wrapper = mount(Slider, {
    props: { modelValue: [10, 80] },
    attrs: {
      "aria-labelledby": "budget-label",
      "aria-describedby": "budget-help",
    },
  });
  expect(wrapper.attributes("aria-labelledby")).toBe("budget-label");
  for (const input of wrapper.findAll("input")) {
    expect(input.attributes("aria-labelledby")).toBeUndefined();
    expect(input.attributes("aria-describedby")).toBe("budget-help");
  }
  wrapper.unmount();
});

test("does not leave a rejected controlled value on the native input", async () => {
  const wrapper = mount(Slider, { props: { modelValue: 30 } });
  await wrapper.get("input").setValue(80);
  expect(wrapper.emitted("update:modelValue").at(-1)).toEqual([80]);
  await nextTick();
  expect(wrapper.get("input").element.value).toBe("30");
  wrapper.unmount();
});

function mountedSlider(props = {}, attrs = {}) {
  let wrapper;
  wrapper = mount(Slider, {
    props: {
      modelValue: 30,
      ...props,
      "onUpdate:modelValue": (next) => wrapper.setProps({ modelValue: next }),
    },
    attrs,
    attachTo: document.body,
  });
  const captured = new Set();
  wrapper.element.getBoundingClientRect = () => ({ left: 0, width: 200 });
  wrapper.element.setPointerCapture = (id) => captured.add(id);
  wrapper.element.hasPointerCapture = (id) => captured.has(id);
  wrapper.element.releasePointerCapture = (id) => captured.delete(id);
  return wrapper;
}

const pointer = (type, x) =>
  new PointerEvent(type, {
    bubbles: true,
    cancelable: true,
    button: 0,
    pointerId: 1,
    isPrimary: true,
    clientX: x,
  });

test("pointer positions follow the rendered custom thumb size", async () => {
  const wrapper = mountedSlider({}, { class: "[--thumb-size:3.5rem]" });
  wrapper.get(".invisible").element.getBoundingClientRect = () => ({
    width: 56,
  });
  wrapper.element.dispatchEvent(pointer("pointerdown", 64));
  wrapper.element.dispatchEvent(pointer("pointerup", 64));
  await nextTick();
  expect(wrapper.props("modelValue")).toBe(25);
  expect(wrapper.emitted("commit")).toEqual([[25]]);
  wrapper.unmount();
});

test("selects the nearest thumb and cancels without committing", async () => {
  const wrapper = mountedSlider({ modelValue: [20, 80], minStepsBetween: 10 });
  wrapper.element.dispatchEvent(pointer("pointerdown", 46));
  wrapper.element.dispatchEvent(pointer("pointermove", 190));
  await nextTick();
  expect(wrapper.props("modelValue")).toEqual([70, 80]);
  wrapper.element.dispatchEvent(pointer("pointercancel", 190));
  await nextTick();
  expect(wrapper.props("modelValue")).toEqual([20, 80]);
  expect(wrapper.emitted("commit")).toBeUndefined();
  wrapper.unmount();
});

test("commits a completed pointer gesture once", async () => {
  const wrapper = mountedSlider();
  wrapper.element.dispatchEvent(pointer("pointerdown", 100));
  wrapper.element.dispatchEvent(pointer("pointermove", 154));
  wrapper.element.dispatchEvent(pointer("pointerup", 154));
  wrapper.element.dispatchEvent(pointer("lostpointercapture", 154));
  await nextTick();
  expect(wrapper.props("modelValue")).toBe(80);
  expect(wrapper.emitted("commit")).toEqual([[80]]);
  wrapper.unmount();
});

test("submits both endpoints and resets an externally associated native form", async () => {
  const form = document.createElement("form");
  form.id = "slider-test-form";
  document.body.append(form);
  const wrapper = mountedSlider(
    { modelValue: [20, 80], name: ["minimum", "maximum"] },
    { form: form.id },
  );
  await wrapper.get("input").setValue(30);
  expect(new FormData(form).get("minimum")).toBe("30");
  expect(new FormData(form).get("maximum")).toBe("80");
  form.reset();
  await nextTick();
  await nextTick();
  expect(wrapper.props("modelValue")).toEqual([20, 80]);
  wrapper.unmount();
  form.remove();
});

test("ignores a prevented form reset", async () => {
  const form = document.createElement("form");
  form.id = "prevented-slider-form";
  form.addEventListener("reset", (event) => event.preventDefault());
  document.body.append(form);
  const wrapper = mountedSlider({}, { form: form.id });
  await wrapper.get("input").setValue(60);
  form.reset();
  await nextTick();
  expect(wrapper.props("modelValue")).toBe(60);
  wrapper.unmount();
  form.remove();
});

test("degenerate bounds disable the native input instead of dividing by zero", () => {
  const wrapper = mount(Slider, {
    props: { min: 10, max: 10, modelValue: 12 },
  });
  expect(wrapper.get("input").element.disabled).toBe(true);
  expect(wrapper.get("input").element.value).toBe("10");
  expect(
    wrapper.get('[data-slot="slider-fill"]').attributes("style"),
  ).toContain("width: 0%");
  wrapper.unmount();
});
