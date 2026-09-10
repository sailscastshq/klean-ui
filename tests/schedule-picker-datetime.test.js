import { expect, test } from "@rstest/core";
import { mount } from "@vue/test-utils";
import { nextTick } from "vue";
import SchedulePicker from "../src/vue/schedule-picker/SchedulePicker.vue";

const exact = "2020-02-29T14:35:27.123Z";
const slot = (name) => `[data-slot="schedule-picker-${name}"]`;
const create = (props = {}) =>
  mount(SchedulePicker, {
    attachTo: document.body,
    props: { name: "occurredAt", timeZone: "UTC", locale: "en-US", ...props },
  });
const value = (wrapper) => wrapper.get('input[type="hidden"]').element.value;

test("an empty bounded historical picker opens in its allowed period", () => {
  const wrapper = create({
    allowPast: true,
    min: "2020-02-01T00:00:00Z",
    max: "2020-02-29T23:59:00Z",
  });
  expect(wrapper.find('[data-date="2020-02-29"]').exists()).toBe(true);
  expect(value(wrapper)).toBe("");
  wrapper.unmount();
});

test("disabled values are omitted from FormData while readonly values remain", () => {
  for (const disabled of [true, false]) {
    const wrapper = create({
      allowPast: true,
      defaultValue: exact,
      disabled,
      readonly: !disabled,
    });
    const form = document.createElement("form");
    form.append(wrapper.element);
    expect(new FormData(form).get("occurredAt")).toBe(disabled ? null : exact);
    wrapper.unmount();
    form.remove();
  }
});

test("historical input requires allowPast, not merely a min in the past", async () => {
  for (const allowPast of [false, true]) {
    const wrapper = create({ allowPast, min: "2010-01-01T00:00:00Z" });
    const input = wrapper.get('input[type="text"]');
    await input.setValue("February 29, 2020 at 2:35pm");
    await input.trigger("keydown", { key: "Enter" });
    expect(value(wrapper)).toBe(allowPast ? "2020-02-29T14:35:00.000Z" : "");
    expect(input.attributes("aria-invalid")).toBe(
      allowPast ? undefined : "true",
    );
    wrapper.unmount();
  }
});

test("an incomplete edit cannot submit the old timestamp on Enter", async () => {
  const wrapper = create({ allowPast: true, defaultValue: exact });
  const input = wrapper.get('input[type="text"]');
  await input.setValue("February 28, 2020");
  expect(input.element.checkValidity()).toBe(false);
  const event = new KeyboardEvent("keydown", {
    key: "Enter",
    bubbles: true,
    cancelable: true,
  });
  input.element.dispatchEvent(event);
  await nextTick();
  expect(event.defaultPrevented).toBe(true);
  expect(input.attributes("aria-invalid")).toBe("true");
  expect(value(wrapper)).toBe(exact);
  expect(wrapper.emitted("update:modelValue")).toBeUndefined();
  wrapper.unmount();
});

test("an empty picker uses asynchronously supplied historical limits on open", async () => {
  const wrapper = create({ allowPast: true });
  await wrapper.setProps({
    min: "2020-02-01T00:00:00Z",
    max: "2020-02-29T23:59:00Z",
  });
  wrapper.vm.open();
  await nextTick();
  await nextTick();
  expect(wrapper.find('[data-date="2020-02-29"]').exists()).toBe(true);
  expect(value(wrapper)).toBe("");
  wrapper.unmount();
});

test("opening and leaving an unchanged historical timestamp preserves precision", async () => {
  const wrapper = create({ allowPast: true, defaultValue: exact });
  wrapper.vm.open();
  await nextTick();
  await wrapper.get('input[type="text"]').trigger("focusout");
  expect(value(wrapper)).toBe(exact);
  expect(wrapper.emitted("update:modelValue")).toBeUndefined();
  expect(wrapper.get(slot("hour")).element.value).toBe("2");
  expect(wrapper.get(slot("minute")).element.value).toBe("35");
  expect(wrapper.get(slot("period")).element.value).toBe("pm");
  expect(wrapper.get(slot("time-zone")).text()).toBe("UTC");
  wrapper.unmount();
});

test("Done closes an unchanged valid timestamp without emitting or losing precision", async () => {
  const wrapper = create({ allowPast: true, defaultValue: exact });
  wrapper.vm.open();
  await nextTick();
  await nextTick();
  expect(wrapper.get(slot("popover")).attributes("data-state")).toBe("open");
  const done = wrapper.get(slot("confirm"));
  expect(done.text()).toBe("Done");
  expect(done.attributes("disabled")).toBeUndefined();
  await done.trigger("click");
  await nextTick();
  expect(wrapper.get(slot("popover")).attributes("data-state")).toBe("closed");
  expect(value(wrapper)).toBe(exact);
  expect(wrapper.emitted("update:modelValue")).toBeUndefined();
  expect(wrapper.emitted("change")).toBeUndefined();
  expect(wrapper.emitted("update:open").at(-1)).toEqual([false]);
  wrapper.unmount();
});

test("Done rechecks an unchanged future timestamp and keeps expired values open with an error", async () => {
  const originalNow = Date.now;
  const future = new Date(originalNow() + 5 * 60 * 1000).toISOString();
  const wrapper = create({ defaultValue: future });
  try {
    wrapper.vm.open();
    await nextTick();
    await nextTick();
    const done = wrapper.get(slot("confirm"));
    expect(done.attributes("disabled")).toBeUndefined();
    Date.now = () => originalNow() + 60 * 60 * 1000;
    await done.trigger("click");
    await nextTick();
    expect(wrapper.get(slot("popover")).attributes("data-state")).toBe("open");
    expect(wrapper.get('input[type="text"]').attributes("aria-invalid")).toBe(
      "true",
    );
    expect(wrapper.get('input[type="text"]').element.checkValidity()).toBe(
      false,
    );
    expect(wrapper.get(slot("status")).text()).toContain(
      "Choose a time in the future.",
    );
    expect(done.attributes("disabled")).toBe("");
    expect(value(wrapper)).toBe(future);
    expect(wrapper.emitted("update:modelValue")).toBeUndefined();
    expect(wrapper.emitted("change")).toBeUndefined();
    expect(wrapper.emitted("update:open").at(-1)).toEqual([true]);
  } finally {
    Date.now = originalNow;
    wrapper.unmount();
  }
});

test("native time controls handle midnight and noon, and only commit on composite blur", async () => {
  const wrapper = create({ allowPast: true, defaultValue: exact });
  const hour = wrapper.get(slot("hour"));
  const minute = wrapper.get(slot("minute"));
  const period = wrapper.get(slot("period"));
  await hour.setValue("12");
  await hour.trigger("focusout", { relatedTarget: minute.element });
  await minute.setValue("00");
  await period.setValue("am");
  expect(value(wrapper)).toBe(exact);
  await period.trigger("focusout");
  expect(value(wrapper)).toBe("2020-02-29T00:00:00.000Z");
  await period.setValue("pm");
  await wrapper.get(slot("confirm")).trigger("click");
  expect(value(wrapper)).toBe("2020-02-29T12:00:00.000Z");
  wrapper.unmount();
});

test("24-hour controls follow locale and timezone changes without changing the instant", async () => {
  const wrapper = create({ allowPast: true, defaultValue: exact });
  await wrapper.setProps({ locale: "en-GB", timeZone: "Asia/Tokyo" });
  expect(wrapper.find(slot("period")).exists()).toBe(false);
  expect(wrapper.get(slot("hour")).element.value).toBe("23");
  expect(wrapper.get(slot("time-zone")).text()).toBe("Asia/Tokyo");
  expect(value(wrapper)).toBe(exact);
  await wrapper.get(slot("hour")).setValue("0");
  await wrapper.get(slot("confirm")).trigger("click");
  expect(value(wrapper)).toBe("2020-02-28T15:35:00.000Z");
  wrapper.unmount();
});

test("inclusive bounds agree across calendar, native time controls and typed input", async () => {
  const wrapper = create({
    allowPast: true,
    defaultValue: "2020-02-29T14:30:00Z",
    min: "2020-02-29T14:00:00Z",
    max: "2020-02-29T15:00:00Z",
  });
  expect(wrapper.get('[data-date="2020-02-28"]').attributes("disabled")).toBe(
    "",
  );
  expect(wrapper.get('[data-date="2020-03-01"]').attributes("disabled")).toBe(
    "",
  );
  await wrapper.get(slot("hour")).setValue("3");
  expect(wrapper.get(slot("confirm")).attributes("disabled")).toBe("");
  expect(wrapper.get('input[type="text"]').element.checkValidity()).toBe(false);
  await wrapper.get(slot("minute")).setValue("00");
  await wrapper.get(slot("confirm")).trigger("click");
  expect(value(wrapper)).toBe("2020-02-29T15:00:00.000Z");
  const input = wrapper.get('input[type="text"]');
  await input.setValue("February 29, 2020 at 2pm");
  await input.trigger("keydown", { key: "Enter" });
  expect(value(wrapper)).toBe("2020-02-29T14:00:00.000Z");
  await wrapper.setProps({ min: "2020-02-29T14:30:00Z" });
  await nextTick();
  expect(input.element.checkValidity()).toBe(false);
  wrapper.unmount();
});

test("commit revalidates a future proposal against the current clock", async () => {
  const wrapper = create();
  const input = wrapper.get('input[type="text"]');
  await input.setValue("in five minutes");
  expect(wrapper.get(slot("confirm")).attributes("disabled")).toBeUndefined();
  const originalNow = Date.now;
  try {
    Date.now = () => originalNow() + 60 * 60 * 1000;
    await input.trigger("keydown", { key: "Enter" });
    expect(value(wrapper)).toBe("");
    expect(input.attributes("aria-invalid")).toBe("true");
  } finally {
    Date.now = originalNow;
    wrapper.unmount();
  }
});

test("readonly and disabled pickers disable every native time control", () => {
  for (const state of ["readonly", "disabled"]) {
    const wrapper = create({
      allowPast: true,
      defaultValue: exact,
      [state]: true,
    });
    const fields = wrapper.findAll("select");
    expect(fields).toHaveLength(3);
    for (const field of fields) {
      expect(field.attributes("disabled")).toBe("");
    }
    wrapper.unmount();
  }
});

test("every minute remains editable independently of initial rounding", async () => {
  const wrapper = create({
    allowPast: true,
    defaultValue: exact,
    minuteStep: 30,
  });
  const minute = wrapper.get(slot("minute"));
  expect(minute.element.value).toBe("35");
  expect(
    minute.findAll("option").map((option) => option.element.value),
  ).toEqual(
    Array.from({ length: 60 }, (_, index) => String(index).padStart(2, "0")),
  );
  await minute.setValue("37");
  await wrapper.get(slot("confirm")).trigger("click");
  expect(value(wrapper)).toBe("2020-02-29T14:37:00.000Z");
  wrapper.unmount();
});

test("one integrated time control retains accessible segments without a duplicate list", () => {
  const wrapper = create({ allowPast: true, defaultValue: exact });
  const fields = wrapper.get(slot("time-fields"));
  expect(fields.findAll("select")).toHaveLength(3);
  expect(wrapper.find('[role="listbox"]').exists()).toBe(false);
  expect(wrapper.find("[data-time]").exists()).toBe(false);
  for (const [name, expectedLabel] of [
    ["hour", "Hour"],
    ["minute", "Minute"],
    ["period", "Period"],
  ]) {
    const control = wrapper.get(slot(name)).element;
    const label =
      control.getAttribute("aria-label") ||
      [...control.labels].map((element) => element.textContent).join(" ");
    expect(label).toContain(expectedLabel);
  }
  expect(wrapper.get(slot("time-zone")).text()).toBe("UTC");
  wrapper.unmount();
});

test("reselecting an unchanged time segment retains exact timestamp precision", async () => {
  const wrapper = create({ allowPast: true, defaultValue: exact });
  await wrapper.get(slot("minute")).trigger("change");
  await wrapper.get(slot("confirm")).trigger("click");
  expect(value(wrapper)).toBe(exact);
  wrapper.unmount();
});
