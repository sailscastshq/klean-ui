import SchedulePickerExample from "./SchedulePickerExample.svelte";

const meta = {
  title: "Components/Schedule Picker",
  component: SchedulePickerExample,
  parameters: { layout: "centered" },
  args: {
    name: "publishAt",
    timeZone: "Africa/Lagos",
    minuteStep: 15,
    required: true,
    disabled: false,
    readonly: false,
    class: "w-[min(34rem,calc(100vw-2rem))]",
  },
};

export default meta;
export const Playground = {};

export const HistoricalRecord = {
  args: {
    allowPast: true,
    defaultValue: "2020-02-29T14:35:27.123Z",
    name: "occurredAt",
    timeZone: "UTC",
    locale: "en-US",
    class: "w-[min(34rem,calc(100vw-2rem))] **:data-[slot=input]:border-dashed",
  },
};

export const BoundedPeriod = {
  args: {
    allowPast: true,
    defaultValue: "2020-02-29T14:35:00Z",
    name: "occurredAt",
    timeZone: "UTC",
    locale: "en-GB",
    min: "2020-02-01T00:00:00Z",
    max: "2020-03-01T00:00:00Z",
  },
};
