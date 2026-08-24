import LoadingStateExample from "./LoadingStateExample.svelte";

const meta = {
  title: "Components/LoadingState",
  component: LoadingStateExample,
  parameters: { layout: "centered" },
  args: {
    label: "Loading services…",
    class: "",
  },
  argTypes: {
    label: { control: "text" },
    class: { control: "text" },
  },
};

export default meta;

export const Playground = {};

export const Compact = {
  args: {
    label: "Refreshing…",
    class:
      "min-h-0 w-auto flex-row justify-start gap-2 p-0 text-left text-sm text-gray-500 dark:text-gray-400",
  },
};
