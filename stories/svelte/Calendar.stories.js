import CalendarExample from "./CalendarExample.svelte";

const meta = {
  title: "Components/Calendar",
  component: CalendarExample,
  parameters: { layout: "centered" },
  args: {
    value: "2026-08-12",
    min: "2026-08-01",
    max: "2026-12-31",
    locale: "en-NG",
    disabled: false,
    readonly: false,
    class: "",
  },
};

export default meta;
export const Playground = {};
