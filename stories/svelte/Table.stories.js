import TableExample from "./TableExample.svelte";

const meta = {
  title: "Components/Table",
  component: TableExample,
  parameters: { layout: "centered" },
  args: {
    caption: "Production services",
    class: "min-w-lg",
  },
  argTypes: {
    caption: { control: "text" },
    class: { control: "text" },
  },
};

export default meta;

export const Playground = {};
