import RowActionsExample from "./RowActionsExample.svelte";

const meta = {
  title: "Components/RowActions",
  component: RowActionsExample,
  parameters: { layout: "centered" },
  args: { label: "Actions for api", busy: false, class: "" },
  argTypes: {
    label: { control: "text" },
    busy: { control: "boolean" },
    class: { control: "text" },
  },
};

export default meta;

export const Playground = {};
