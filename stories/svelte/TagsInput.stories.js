import TagsInputDurable from "./TagsInputDurable.svelte";
import TagsInputExample from "./TagsInputExample.svelte";

const meta = {
  title: "Components/Tags Input",
  component: TagsInputExample,
  parameters: { layout: "centered" },
  args: {
    placeholder: "Add a tag",
    disabled: false,
    readonly: false,
    max: 5,
    class: "",
  },
  argTypes: {
    placeholder: { control: "text" },
    disabled: { control: "boolean" },
    readonly: { control: "boolean" },
    max: { control: { type: "number", min: 1, max: 12 } },
    class: { control: "text" },
  },
};

export default meta;
export const Playground = {};
export const DurableDraft = {
  parameters: { controls: { disable: true } },
  render: () => ({ Component: TagsInputDurable }),
};
