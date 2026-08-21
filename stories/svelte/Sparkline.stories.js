import SparklineExample from "./SparklineExample.svelte";
import SparklineStates from "./SparklineStates.svelte";

const meta = {
  title: "Components/Sparkline",
  component: SparklineExample,
  parameters: { layout: "centered" },
  args: {
    label: "",
    class: "h-8 w-40 text-gray-950 dark:text-white",
  },
  argTypes: {
    label: { control: "text" },
    class: { control: "text" },
  },
};

export default meta;

export const Playground = {};

export const States = {
  render: () => ({ Component: SparklineStates }),
};
