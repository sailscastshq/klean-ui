import DateRangePickerExample from "./DateRangePickerExample.svelte";

const meta = {
  title: "Components/Date Range Picker",
  component: DateRangePickerExample,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  args: {
    name: "period",
    label: "Report period",
    min: "2026-01-01",
    max: "2026-12-31",
    required: true,
    disabled: false,
    readonly: false,
    class: "w-[min(38rem,calc(100vw-2rem))]",
  },
};

export default meta;
export const Playground = {};
