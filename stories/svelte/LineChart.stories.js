import LineChartExample from "./LineChartExample.svelte";
import LineChartRecipes from "./LineChartRecipes.svelte";
import LineChartStates from "./LineChartStates.svelte";

const meta = {
  title: "Components/LineChart",
  component: LineChartExample,
  parameters: { layout: "centered" },
  args: {
    caption: "Signups — last 7 days",
    emptyLabel: "No data",
    class: "w-[min(90vw,42rem)]",
  },
  argTypes: {
    caption: { control: "text" },
    emptyLabel: { control: "text" },
    class: { control: "text" },
  },
};

export default meta;

export const Playground = {};

export const Apps = {
  render: () => ({ Component: LineChartRecipes }),
};

export const DataStates = {
  render: () => ({ Component: LineChartStates }),
};
