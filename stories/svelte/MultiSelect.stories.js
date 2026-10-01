import MultiSelectExample from "./MultiSelectExample.svelte";
export default {
  title: "Components/MultiSelect",
  component: MultiSelectExample,
  parameters: { layout: "centered", controls: { disable: true } },
};
export const Playground = {};
export const Empty = { args: { options: [], defaultValue: [] } };
export const Disabled = { args: { disabled: true } };

export const LongList = {
  args: {
    defaultValue: [],
    options: Array.from({ length: 60 }, (_, index) => ({
      value: String(index),
      label: `Option ${index + 1}`,
    })),
  },
};
