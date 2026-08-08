import SchedulePickerExample from "./SchedulePickerExample.svelte";

const meta = {
  title: "Components/Schedule Picker",
  component: SchedulePickerExample,
  tags: ["autodocs"],
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
