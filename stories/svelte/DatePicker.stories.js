import DatePickerExample from "./DatePickerExample.svelte";

const meta = {
  title: "Components/Date Picker",
  component: DatePickerExample,
  parameters: { layout: "centered" },
  args: {
    value: "2026-08-12",
    name: "dueAt",
    min: "2026-08-01",
    required: true,
    disabled: false,
    readonly: false,
    class: "w-72",
  },
};

export default meta;
export const Playground = {};
