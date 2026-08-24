import BulkActionsExample from "./BulkActionsExample.svelte";

const meta = {
  title: "Components/BulkActions",
  component: BulkActionsExample,
  parameters: { layout: "centered" },
  args: {
    count: 3,
    label: "Actions for selected services",
    busy: false,
    clearLabel: "Clear selection",
    class: "",
  },
  argTypes: {
    count: { control: { type: "number", min: 0, step: 1 } },
    label: { control: "text" },
    busy: { control: "boolean" },
    clearLabel: { control: "text" },
    class: { control: "text" },
  },
};

export default meta;

export const Playground = {};
