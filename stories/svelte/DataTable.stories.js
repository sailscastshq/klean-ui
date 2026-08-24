import DataTableExample from "./DataTableExample.svelte";

const meta = {
  title: "Components/DataTable",
  component: DataTableExample,
  parameters: { layout: "fullscreen" },
  args: {
    busy: false,
    class: "border-x border-b border-gray-800",
    tableClass: "min-w-180 text-gray-100 dark:text-gray-100",
  },
  argTypes: {
    busy: { control: "boolean" },
    class: { control: "text" },
    tableClass: { control: "text" },
  },
};

export default meta;

export const Playground = {};
export const Bridge = { parameters: { controls: { disable: true } } };
