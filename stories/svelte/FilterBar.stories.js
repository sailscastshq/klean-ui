import FilterBarExample from "./FilterBarExample.svelte";

const meta = {
  title: "Components/Filter Bar",
  component: FilterBarExample,
  parameters: { layout: "centered" },
  args: {
    label: "Service filters",
    busy: false,
    class:
      "rounded-xl border border-gray-200 bg-white p-3 shadow-sm dark:border-gray-800 dark:bg-gray-950",
  },
  argTypes: {
    label: { control: "text" },
    busy: { control: "boolean" },
    class: { control: "text" },
  },
};

export default meta;
export const Playground = {};
