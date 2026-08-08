import { expect, test } from "@rstest/core";
import { mount } from "@vue/test-utils";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { parse } from "@babel/parser";
import { compile } from "svelte/compiler";
import { nextTick } from "vue";
import Calendar from "../src/vue/calendar/Calendar.vue";
import {
  addMonths,
  calendarGrid,
  firstDayOfWeek,
  parseIsoDate,
} from "../src/vue/calendar/date.js";
import DatePicker from "../src/vue/date-picker/DatePicker.vue";
import DateRangePicker from "../src/vue/date-range-picker/DateRangePicker.vue";
import SchedulePicker from "../src/vue/schedule-picker/SchedulePicker.vue";
import {
  instantToWallClock,
  interpretSchedule,
} from "../src/vue/schedule-picker/schedule.js";

async function settle() {
  await nextTick();
  await Promise.resolve();
}

test("keeps date-only math exact across month and leap-year boundaries", () => {
  expect(parseIsoDate("2028-02-29")).toEqual({
    year: 2028,
    month: 2,
    day: 29,
  });
  expect(parseIsoDate("2027-02-29")).toBeUndefined();
  expect(addMonths("2028-01-31", 1)).toBe("2028-02-29");
  expect(addMonths("2027-01-31", 1)).toBe("2027-02-28");
  expect(calendarGrid("2026-08-01", 1)).toHaveLength(42);
});

test("uses locale week conventions without shipping English weekday tables", () => {
  expect(firstDayOfWeek("en-US")).toBe(0);
  expect(firstDayOfWeek("en-NG")).toBe(1);
});

test("Calendar exposes semantic grid navigation and commits available dates", async () => {
  const wrapper = mount(Calendar, {
    attachTo: document.body,
    props: {
      defaultValue: "2026-08-12",
      min: "2026-08-01",
      max: "2026-08-31",
    },
  });
  const grid = wrapper.get('[data-slot="calendar-grid"]');
  const selected = wrapper.get('[data-date="2026-08-12"]');

  expect(grid.attributes("role")).toBe("grid");
  expect(selected.attributes("aria-selected")).toBeUndefined();
  expect(selected.attributes("tabindex")).toBe("0");

  selected.element.focus();
  await selected.trigger("keydown", { key: "ArrowRight" });
  await settle();
  expect(document.activeElement.dataset.date).toBe("2026-08-13");

  await wrapper.get('[data-date="2026-08-14"]').trigger("click");
  expect(wrapper.emitted("update:modelValue").at(-1)).toEqual(["2026-08-14"]);
  wrapper.unmount();
});

test("DatePicker leaves an incomplete draft out of the value contract", async () => {
  const wrapper = mount(DatePicker, {
    attachTo: document.body,
    props: { defaultValue: "2026-08-12", name: "dueAt" },
  });
  const input = wrapper.get('input[name="dueAt"]');

  await input.setValue("2026-08-");
  expect(input.attributes("aria-invalid")).toBe("true");
  expect(wrapper.emitted("update:modelValue")).toBeUndefined();

  await input.setValue("2026-08-14");
  expect(wrapper.emitted("update:modelValue").at(-1)).toEqual(["2026-08-14"]);
  expect(input.attributes("name")).toBe("dueAt");
  wrapper.unmount();
});

test("natural scheduling resolves against the supplied IANA timezone", () => {
  const reference = new Date("2026-08-08T12:00:00.000Z");
  const lagos = interpretSchedule("tomorrow at 9am", {
    reference,
    locale: "en-NG",
    timeZone: "Africa/Lagos",
  });
  const newYork = interpretSchedule("tomorrow at 9am", {
    reference,
    locale: "en-US",
    timeZone: "America/New_York",
  });

  expect(lagos.state).toBe("proposal");
  expect(lagos.iso).toBe("2026-08-09T08:00:00.000Z");
  expect(newYork.iso).toBe("2026-08-09T13:00:00.000Z");
  expect(instantToWallClock(lagos.iso, "Africa/Lagos")).toEqual({
    date: "2026-08-09",
    time: "09:00",
  });
});

test("natural scheduling keeps relative durations exact in the chosen timezone", () => {
  const reference = new Date("2026-08-08T12:07:30.000Z");
  const fiveMinutes = interpretSchedule("in 5 minutes", {
    reference,
    locale: "en-NG",
    timeZone: "Africa/Lagos",
  });
  const oneHour = interpretSchedule("in one hour", {
    reference,
    locale: "en-NG",
    timeZone: "Africa/Lagos",
  });

  expect(fiveMinutes).toMatchObject({
    state: "proposal",
    date: "2026-08-08",
    time: "13:12",
    iso: "2026-08-08T12:12:30.000Z",
  });
  expect(oneHour).toMatchObject({
    state: "proposal",
    date: "2026-08-08",
    time: "14:07",
    iso: "2026-08-08T13:07:30.000Z",
  });
});

test("SchedulePicker commits a valid proposal on Enter", async () => {
  const wrapper = mount(SchedulePicker, {
    attachTo: document.body,
    props: { name: "publishAt", timeZone: "Africa/Lagos" },
  });
  const input = wrapper.get('input[type="text"]');

  await input.setValue("tomorrow at 9am");
  await settle();
  expect(wrapper.get('input[type="hidden"]').attributes("value")).toBe("");
  expect(
    wrapper.get('[data-slot="schedule-picker"]').attributes("data-state"),
  ).toBe("proposal");

  await input.trigger("keydown", { key: "Enter" });
  await settle();
  expect(wrapper.get('input[type="hidden"]').attributes("value")).toMatch(
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:00\.000Z$/,
  );
  expect(wrapper.emitted("update:modelValue")).toHaveLength(1);
  wrapper.unmount();
});

test("SchedulePicker commits on true composite blur but not internal focus movement", async () => {
  const wrapper = mount(SchedulePicker, {
    attachTo: document.body,
    props: { name: "publishAt", timeZone: "Africa/Lagos" },
  });
  const outside = document.createElement("button");
  document.body.append(outside);
  const input = wrapper.get('input[type="text"]');
  const trigger = wrapper.get('[data-slot="schedule-picker-button"]');

  await input.setValue("tomorrow at 9am");
  await input.trigger("focusout", { relatedTarget: trigger.element });
  await settle();
  expect(wrapper.get('input[type="hidden"]').attributes("value")).toBe("");

  await trigger.trigger("focusout", { relatedTarget: outside });
  await settle();
  expect(wrapper.get('input[type="hidden"]').attributes("value")).toMatch(
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:00\.000Z$/,
  );
  expect(wrapper.emitted("update:modelValue")).toHaveLength(1);

  outside.remove();
  wrapper.unmount();
});

test("SchedulePicker never commits an invalid draft on blur", async () => {
  const wrapper = mount(SchedulePicker, {
    attachTo: document.body,
    props: { name: "publishAt", timeZone: "Africa/Lagos" },
  });
  const input = wrapper.get('input[type="text"]');

  await input.setValue("sometime maybe");
  await input.trigger("focusout");
  await settle();

  expect(wrapper.get('input[type="hidden"]').attributes("value")).toBe("");
  expect(wrapper.emitted("update:modelValue")).toBeUndefined();
  expect(input.attributes("aria-invalid")).toBe("true");
  wrapper.unmount();
});

test("DateRangePicker orders an earlier second boundary and submits both names", async () => {
  const wrapper = mount(DateRangePicker, {
    attachTo: document.body,
    props: {
      defaultValue: { start: "2026-08-12", end: "" },
      name: "period",
    },
  });

  await wrapper.get('input[name="period[end]"]').trigger("click");
  await wrapper.get('[data-date="2026-08-08"]').trigger("click");
  await settle();

  expect(wrapper.emitted("update:modelValue").at(-1)).toEqual([
    { start: "2026-08-08", end: "2026-08-12" },
  ]);
  expect(wrapper.get('input[name="period[start]"]').attributes("name")).toBe(
    "period[start]",
  );
  expect(wrapper.get('input[name="period[end]"]').attributes("name")).toBe(
    "period[end]",
  );
  wrapper.unmount();
});

test("DateRangePicker keeps an inverted typed draft out of application state", async () => {
  const wrapper = mount(DateRangePicker, {
    attachTo: document.body,
    props: {
      defaultValue: { start: "2026-08-12", end: "2026-08-15" },
      name: "period",
    },
  });
  const end = wrapper.get('input[name="period[end]"]');

  await end.setValue("2026-08-08");
  await settle();

  expect(end.attributes("aria-invalid")).toBe("true");
  expect(end.element.validationMessage).toBe(
    "The end date must be on or after the start date.",
  );
  expect(wrapper.emitted("update:modelValue")).toBeUndefined();
  wrapper.unmount();
});

test("DateRangePicker anchors to the active field and returns focus on Escape", async () => {
  const wrapper = mount(DateRangePicker, {
    attachTo: document.body,
    props: {
      defaultValue: { start: "2026-08-08", end: "2026-08-12" },
      name: "period",
    },
  });
  const start = wrapper.get('input[name="period[start]"]');
  const end = wrapper.get('input[name="period[end]"]');

  end.element.focus();
  await end.trigger("click");
  await settle();

  expect(end.attributes("aria-expanded")).toBe("true");
  expect(start.attributes("aria-expanded")).toBe("false");
  expect(
    wrapper.get('[data-slot="date-range-popover"]').attributes("data-state"),
  ).toBe("open");

  document.dispatchEvent(
    new KeyboardEvent("keydown", { key: "Escape", bubbles: true }),
  );
  await settle();

  expect(end.attributes("aria-expanded")).toBe("false");
  expect(document.activeElement).toBe(end.element);
  wrapper.unmount();
});

test("DateRangePicker accepts an inclusive same-day range", async () => {
  const wrapper = mount(DateRangePicker, {
    attachTo: document.body,
    props: {
      defaultValue: { start: "2026-08-12", end: "" },
      name: "stay",
    },
  });

  await wrapper.get('input[name="stay[end]"]').trigger("click");
  await wrapper.get('[data-date="2026-08-12"]').trigger("click");
  await settle();

  expect(wrapper.emitted("update:modelValue").at(-1)).toEqual([
    { start: "2026-08-12", end: "2026-08-12" },
  ]);
  wrapper.unmount();
});

test("DateRangePicker prevents a contiguous range from crossing unavailable dates", async () => {
  const wrapper = mount(DateRangePicker, {
    attachTo: document.body,
    props: {
      defaultValue: { start: "2026-08-08", end: "" },
      name: "stay",
      unavailable: (date) => date === "2026-08-10",
    },
  });
  const end = wrapper.get('input[name="stay[end]"]');

  await end.trigger("click");
  await settle();
  expect(
    wrapper.get('[data-date="2026-08-09"]').attributes("disabled"),
  ).toBeUndefined();
  expect(wrapper.get('[data-date="2026-08-10"]').attributes("disabled")).toBe(
    "",
  );
  expect(wrapper.get('[data-date="2026-08-12"]').attributes("disabled")).toBe(
    "",
  );

  await end.setValue("2026-08-12");
  await settle();

  expect(end.attributes("aria-invalid")).toBe("true");
  expect(end.element.validationMessage).toBe(
    "The range cannot include an unavailable date.",
  );
  expect(wrapper.emitted("update:modelValue")).toBeUndefined();
  wrapper.unmount();
});

test("DateRangePicker never commits an end without a start", async () => {
  const wrapper = mount(DateRangePicker, {
    attachTo: document.body,
    props: {
      defaultValue: { start: "2026-08-08", end: "2026-08-12" },
      name: "period",
    },
  });
  const start = wrapper.get('input[name="period[start]"]');
  const end = wrapper.get('input[name="period[end]"]');

  await start.setValue("");
  await settle();

  expect(wrapper.emitted("update:modelValue").at(-1)).toEqual([
    { start: "", end: "" },
  ]);
  expect(end.element.value).toBe("");

  await end.setValue("2026-08-12");
  await settle();

  expect(wrapper.emitted("update:modelValue")).toHaveLength(1);
  expect(end.attributes("aria-invalid")).toBe("true");
  expect(end.element.validationMessage).toBe(
    "Choose a start date before the end date.",
  );
  wrapper.unmount();
});

test("DateRangePicker respects controlled visibility and field state", async () => {
  const wrapper = mount(DateRangePicker, {
    attachTo: document.body,
    props: {
      modelValue: { start: "2026-08-08", end: "2026-08-12" },
      name: "period",
      open: false,
    },
  });
  const end = wrapper.get('input[name="period[end]"]');

  await end.trigger("click");
  await settle();
  expect(wrapper.emitted("update:open").at(-1)).toEqual([true]);
  expect(end.attributes("aria-expanded")).toBe("false");
  expect(
    wrapper.get('[data-slot="date-range-popover"]').attributes("data-state"),
  ).toBe("closed");

  await wrapper.setProps({ open: true });
  await settle();
  expect(end.attributes("aria-expanded")).toBe("true");
  expect(
    wrapper.get('[data-slot="date-range-popover"]').attributes("data-state"),
  ).toBe("open");
  wrapper.unmount();

  const readonlyWrapper = mount(DateRangePicker, {
    attachTo: document.body,
    props: {
      defaultValue: { start: "2026-08-08", end: "2026-08-12" },
      readonly: true,
    },
  });
  await readonlyWrapper.findAll("input")[0].trigger("click");
  await settle();
  expect(
    readonlyWrapper
      .get('[data-slot="date-range-popover"]')
      .attributes("data-state"),
  ).toBe("closed");
  readonlyWrapper.unmount();
});

test("DateRangePicker applies min and max to both range boundaries", async () => {
  const wrapper = mount(DateRangePicker, {
    attachTo: document.body,
    props: {
      defaultValue: { start: "2026-08-08", end: "" },
      min: "2026-08-08",
      max: "2026-08-12",
    },
  });

  await wrapper.findAll("input")[1].trigger("click");
  await settle();
  expect(wrapper.get('[data-date="2026-08-07"]').attributes("disabled")).toBe(
    "",
  );
  expect(
    wrapper.get('[data-date="2026-08-08"]').attributes("disabled"),
  ).toBeUndefined();
  expect(
    wrapper.get('[data-date="2026-08-12"]').attributes("disabled"),
  ).toBeUndefined();
  expect(wrapper.get('[data-date="2026-08-13"]').attributes("disabled")).toBe(
    "",
  );
  wrapper.unmount();
});

test("ships matching Vue sources and compiler-valid React and Svelte sources", () => {
  for (const [item, source, filename] of [
    ["calendar", "src/vue/calendar/Calendar.vue", "Calendar.vue"],
    ["date-picker", "src/vue/date-picker/DatePicker.vue", "DatePicker.vue"],
    [
      "date-range-picker",
      "src/vue/date-range-picker/DateRangePicker.vue",
      "DateRangePicker.vue",
    ],
    [
      "schedule-picker",
      "src/vue/schedule-picker/SchedulePicker.vue",
      "SchedulePicker.vue",
    ],
  ]) {
    expect(
      readFileSync(resolve(`registry/${item}/vue/${filename}`), "utf8"),
    ).toBe(readFileSync(resolve(source), "utf8"));
  }

  for (const [item, filename] of [
    ["calendar", "Calendar.jsx"],
    ["date-picker", "DatePicker.jsx"],
    ["date-range-picker", "DateRangePicker.jsx"],
    ["schedule-picker", "SchedulePicker.jsx"],
  ]) {
    expect(() =>
      parse(
        readFileSync(resolve(`registry/${item}/react/${filename}`), "utf8"),
        {
          sourceType: "module",
          plugins: ["jsx"],
        },
      ),
    ).not.toThrow();
  }

  for (const [item, filename] of [
    ["calendar", "Calendar.svelte"],
    ["date-picker", "DatePicker.svelte"],
    ["date-range-picker", "DateRangePicker.svelte"],
    ["schedule-picker", "SchedulePicker.svelte"],
  ]) {
    const result = compile(
      readFileSync(resolve(`registry/${item}/svelte/${filename}`), "utf8"),
      { filename, generate: false },
    );
    expect(result.warnings).toEqual([]);
  }
});

test("every component docs page guides the next component choice", () => {
  const componentDocs = [
    "Button.mdx",
    "Calendar.mdx",
    "DatePicker.mdx",
    "DateRangePicker.mdx",
    "Dialog.mdx",
    "Input.mdx",
    "Menu.mdx",
    "Popover.mdx",
    "SchedulePicker.mdx",
    "Slide.mdx",
    "Textarea.mdx",
    "Toast.mdx",
  ];

  for (const filename of componentDocs) {
    const source = readFileSync(resolve(`stories/${filename}`), "utf8");
    expect(source).toContain("## Related components");
  }

  for (const filename of [
    "Calendar.mdx",
    "DatePicker.mdx",
    "DateRangePicker.mdx",
    "SchedulePicker.mdx",
  ]) {
    const source = readFileSync(resolve(`stories/${filename}`), "utf8");
    expect(source).toContain("## When to use");
    expect(source).toContain("## When not to use");
  }

  for (const filename of [
    "Calendar.mdx",
    "DatePicker.mdx",
    "DateRangePicker.mdx",
  ]) {
    expect(readFileSync(resolve(`stories/${filename}`), "utf8")).toContain(
      "date-only `YYYY-MM-DD`",
    );
  }

  expect(readFileSync(resolve("stories/SchedulePicker.mdx"), "utf8")).toContain(
    "exact ISO instant",
  );

  for (const filename of [
    "button.md",
    "calendar.md",
    "date-picker.md",
    "date-range-picker.md",
    "dialog.md",
    "menu.md",
    "popover.md",
    "schedule-picker.md",
    "slide.md",
    "toast.md",
  ]) {
    expect(readFileSync(resolve(`docs/${filename}`), "utf8")).toContain(
      "## Related components",
    );
  }
});
