import { expect, test } from "@rstest/core";
import { readFileSync } from "node:fs";
import {
  initialScheduleWallClock,
  instantToWallClock,
  interpretSchedule,
  roundedFutureWallClock,
  scheduleCalendarBounds,
  scheduleConstraint,
  timeFields,
  timeOptions,
  updateTimeField,
  wallClockToIso,
} from "../src/vue/schedule-picker/schedule.js";

const reference = new Date("2026-09-10T13:07:30.456Z");

test("empty historical pickers start inside their past bounds", () => {
  expect(
    initialScheduleWallClock("", {
      allowPast: true,
      max: "2020-03-01T02:35:00Z",
      reference,
      timeZone: "America/New_York",
    }),
  ).toEqual({ date: "2020-02-29", time: "21:35" });
  expect(
    initialScheduleWallClock("", {
      allowPast: true,
      min: "2020-01-01T00:00:00Z",
      max: "2020-12-31T23:59:00Z",
      reference,
      timeZone: "UTC",
    }),
  ).toEqual({ date: "2020-12-31", time: "23:59" });
});

test("empty future pickers start at their configured minimum or rounded default", () => {
  expect(
    initialScheduleWallClock(undefined, {
      min: "2026-12-04T10:35:00Z",
      reference,
      timeZone: "UTC",
    }),
  ).toEqual({ date: "2026-12-04", time: "10:35" });
  expect(
    initialScheduleWallClock("invalid", {
      reference,
      timeZone: "UTC",
      minuteStep: 30,
    }),
  ).toEqual({ date: "2026-09-10", time: "13:30" });
});

test("restored instants keep their selected month and time despite updated bounds", () => {
  const value = "2020-02-29T23:59:42.123Z";
  expect(
    initialScheduleWallClock(value, {
      min: "2026-12-01T00:00:00Z",
      max: "2026-12-31T00:00:00Z",
      reference,
      timeZone: "UTC",
    }),
  ).toEqual({ date: "2020-02-29", time: "23:59" });
  expect(
    initialScheduleWallClock(value, {
      allowPast: true,
      max: "2019-01-01T00:00:00Z",
      reference,
      timeZone: "Asia/Tokyo",
    }),
  ).toEqual({ date: "2020-03-01", time: "08:59" });
});

test("impossible initial ranges do not replace future scheduling with a past value", () => {
  const options = { max: "2020-02-29T14:35:00Z", reference, timeZone: "UTC" };
  const initial = initialScheduleWallClock("", options);
  expect(initial).toEqual({ date: "2026-09-10", time: "13:15" });
  expect(
    scheduleConstraint(
      wallClockToIso({ ...initial, timeZone: "UTC" }),
      options,
    ),
  ).toBe("max");
  expect(scheduleCalendarBounds(options)).toEqual({
    min: "2026-09-10",
    max: "2020-02-29",
  });
  expect(
    initialScheduleWallClock("", {
      allowPast: true,
      min: "2027-01-01T00:00:00Z",
      max: "2020-01-01T00:00:00Z",
      reference,
      timeZone: "UTC",
    }),
  ).toEqual({ date: "2026-09-10", time: "13:15" });
});

test("scheduling stays future-only unless historical dates are allowed", () => {
  expect(scheduleConstraint("2020-02-29T14:35:00Z", { reference })).toBe(
    "past",
  );
  expect(
    scheduleConstraint("2020-02-29T14:35:00Z", { allowPast: true, reference }),
  ).toBe("");
  expect(scheduleConstraint(reference, { reference })).toBe("past");
  expect(scheduleConstraint("2026-09-10T13:07:30.457Z", { reference })).toBe(
    "",
  );
});

test("scheduling rechecks the clock and inclusive caller bounds", () => {
  const value = "2026-09-10T13:10:00Z";
  expect(scheduleConstraint(value, { reference, min: value, max: value })).toBe(
    "",
  );
  expect(scheduleConstraint(value, { reference: "2026-09-10T13:11:00Z" })).toBe(
    "past",
  );
  expect(
    scheduleConstraint("2020-02-29T14:34:59.999Z", {
      allowPast: true,
      min: "2020-02-29T14:35:00Z",
    }),
  ).toBe("min");
  expect(
    scheduleConstraint("2020-02-29T14:35:00.001Z", {
      allowPast: true,
      max: "2020-02-29T14:35:00Z",
    }),
  ).toBe("max");
  expect(
    scheduleConstraint("2020-02-29T14:35:00Z", {
      allowPast: true,
      min: "2020-02-29T14:35:00Z",
      max: "2020-02-29T14:35:00Z",
    }),
  ).toBe("");
});

test("invalid values reject while omitted and invalid bounds do not create limits", () => {
  for (const value of [undefined, null, "", "not a date"]) {
    expect(scheduleConstraint(value, { allowPast: true })).toBe("invalid");
  }
  for (const bound of [undefined, null, "", "not a date"]) {
    expect(
      scheduleConstraint("2020-02-29T14:35:00Z", {
        allowPast: true,
        min: bound,
        max: bound,
      }),
    ).toBe("");
    expect(
      scheduleCalendarBounds({ allowPast: true, min: bound, max: bound }),
    ).toEqual({ min: undefined, max: undefined });
  }
});

test("calendar bounds use the selected timezone and the effective lower instant", () => {
  expect(
    scheduleCalendarBounds({
      reference: "2026-09-10T23:59:59.999Z",
      timeZone: "UTC",
    }),
  ).toEqual({ min: "2026-09-11", max: undefined });
  expect(
    scheduleCalendarBounds({
      reference,
      min: "2020-01-01T00:00:00Z",
      timeZone: "Pacific/Kiritimati",
    }),
  ).toEqual({ min: "2026-09-11", max: undefined });
  expect(
    scheduleCalendarBounds({
      allowPast: true,
      min: "2020-03-01T02:00:00Z",
      max: "2020-03-02T02:00:00Z",
      timeZone: "America/New_York",
    }),
  ).toEqual({ min: "2020-02-29", max: "2020-03-01" });
  expect(
    scheduleCalendarBounds({
      reference,
      min: "2026-10-01T00:00:00Z",
      timeZone: "UTC",
    }).min,
  ).toBe("2026-10-01");
});

test("Intl chooses twelve-hour or twenty-four-hour fields without losing noon or midnight", () => {
  const midnight = timeFields("00:05", "en-US");
  expect(midnight).toMatchObject({
    hour: "12",
    minute: "05",
    period: "am",
    hour12: true,
    periods: [
      { value: "am", label: "AM" },
      { value: "pm", label: "PM" },
    ],
  });
  expect(midnight.hours).toHaveLength(12);
  expect(midnight.hours.map(({ value }) => value)).toEqual(
    Array.from({ length: 12 }, (_, index) => String(index + 1)),
  );
  expect(timeFields("12:05", "en-US")).toMatchObject({
    hour: "12",
    period: "pm",
  });
  expect(timeFields("23:59", "en-GB")).toMatchObject({
    hour: "23",
    minute: "59",
    hour12: false,
  });
  expect(timeFields("00:00", "en-GB").hours).toHaveLength(24);
  expect(timeFields("00:00", "en-GB").hours[0]).toEqual({
    value: "0",
    label: "00",
  });
});

test("time selectors preserve the other fields and convert AM/PM correctly", () => {
  expect(updateTimeField("00:05", "period", "pm", "en-US")).toBe("12:05");
  expect(updateTimeField("12:05", "period", "am", "en-US")).toBe("00:05");
  expect(updateTimeField("23:35", "hour", "12", "en-US")).toBe("12:35");
  expect(updateTimeField("11:35", "hour", "12", "en-US")).toBe("00:35");
  expect(updateTimeField("14:35", "minute", "7", "en-US")).toBe("14:07");
  expect(updateTimeField("14:35", "hour", "0", "en-GB")).toBe("00:35");
  expect(updateTimeField("14:35", "hour", "23", "en-GB")).toBe("23:35");
});

test("invalid minute steps retain usable quarter-hour choices and initial times", () => {
  for (const step of [NaN, Infinity, "not a number"]) {
    expect(timeOptions(step)).toHaveLength(96);
    expect(timeOptions(step).slice(0, 2)).toEqual(["00:00", "00:15"]);
    expect(roundedFutureWallClock(reference, "UTC", step)).toEqual({
      date: "2026-09-10",
      time: "13:15",
    });
  }
});

test("time selectors refuse out-of-range or incomplete fields", () => {
  for (const [part, value, locale] of [
    ["hour", "0", "en-US"],
    ["hour", "13", "en-US"],
    ["hour", "24", "en-GB"],
    ["hour", "-1", "en-GB"],
    ["minute", "60", "en-US"],
    ["minute", "", "en-US"],
    ["minute", "1.5", "en-US"],
    ["period", "noon", "en-US"],
    ["period", "pm", "en-GB"],
    ["unknown", "1", "en-US"],
  ]) {
    expect(updateTimeField("14:35", part, value, locale)).toBe("14:35");
  }
  expect(updateTimeField("invalid", "hour", "2", "en-US")).toBe("invalid");
});

test("historical natural language preserves exact relative instants", () => {
  expect(
    interpretSchedule("2 hours ago", {
      reference,
      timeZone: "UTC",
      allowPast: true,
    }),
  ).toMatchObject({
    state: "proposal",
    iso: "2026-09-10T11:07:30.456Z",
    date: "2026-09-10",
    time: "11:07",
  });
  expect(
    interpretSchedule("February 29, 2020 at 2:35pm", {
      reference,
      timeZone: "UTC",
      allowPast: true,
    }),
  ).toMatchObject({ state: "proposal", iso: "2020-02-29T14:35:00.000Z" });
  expect(
    interpretSchedule("in 5 minutes", { reference, timeZone: "UTC" }),
  ).toMatchObject({ state: "proposal", iso: "2026-09-10T13:12:30.456Z" });
});

test("historical weekday inference does not always jump to the following week", () => {
  const options = { reference, timeZone: "UTC" };
  expect(interpretSchedule("Monday at 9am", options).iso).toBe(
    "2026-09-14T09:00:00.000Z",
  );
  expect(
    interpretSchedule("Monday at 9am", { ...options, allowPast: true }).iso,
  ).toBe("2026-09-07T09:00:00.000Z");
});

test("explicit offsets expose the actual instant in the selected timezone", () => {
  const proposal = interpretSchedule("September 10, 2026 at 11:30pm PST", {
    reference,
    timeZone: "UTC",
    allowPast: true,
  });
  expect(proposal).toMatchObject({
    state: "proposal",
    iso: "2026-09-11T07:30:00.000Z",
    date: "2026-09-11",
    time: "07:30",
  });
  expect(instantToWallClock(proposal.iso, "UTC")).toEqual({
    date: proposal.date,
    time: proposal.time,
  });
});

test("relative hours cross daylight-saving changes as elapsed time", () => {
  expect(
    interpretSchedule("2 hours ago", {
      reference: "2026-03-08T07:30:00Z",
      timeZone: "America/New_York",
      allowPast: true,
    }),
  ).toMatchObject({
    state: "proposal",
    iso: "2026-03-08T05:30:00.000Z",
    date: "2026-03-08",
    time: "00:30",
  });
  expect(
    interpretSchedule("in 2 hours", {
      reference: "2026-03-08T06:30:00Z",
      timeZone: "America/New_York",
    }),
  ).toMatchObject({
    state: "proposal",
    iso: "2026-03-08T08:30:00.000Z",
    date: "2026-03-08",
    time: "04:30",
  });
});

test("nonexistent daylight-saving times reject instead of silently shifting", () => {
  expect(
    wallClockToIso({
      date: "2026-03-08",
      time: "02:30",
      timeZone: "America/New_York",
    }),
  ).toBeUndefined();
  expect(
    interpretSchedule("March 8, 2026 at 2:30 am", {
      reference,
      timeZone: "America/New_York",
      allowPast: true,
    }),
  ).toEqual({ state: "invalid" });
  expect(
    wallClockToIso({
      date: "2026-03-08",
      time: "03:30",
      timeZone: "America/New_York",
    }),
  ).toBe("2026-03-08T07:30:00.000Z");
});

test("ambiguous daylight-saving times retain the earlier occurrence unless an offset is explicit", () => {
  expect(
    wallClockToIso({
      date: "2026-11-01",
      time: "01:30",
      timeZone: "America/New_York",
    }),
  ).toBe("2026-11-01T05:30:00.000Z");
  expect(
    wallClockToIso({
      date: "2026-11-01",
      time: "01:30",
      timeZone: "America/New_York",
      timezoneOffset: -300,
    }),
  ).toBe("2026-11-01T06:30:00.000Z");
});

test("all framework copies share the tested scheduling helpers", () => {
  const tested = readFileSync("src/vue/schedule-picker/schedule.js", "utf8");
  for (const framework of ["vue", "react", "svelte"]) {
    expect(
      readFileSync(`registry/schedule-picker/${framework}/schedule.js`, "utf8"),
    ).toBe(tested);
  }
});
