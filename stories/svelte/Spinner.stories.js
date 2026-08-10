import SpinnerExample from "./SpinnerExample.svelte";
import SpinnerProductMarkExample from "./SpinnerProductMarkExample.svelte";

const meta = {
  title: "Components/Spinner",
  component: SpinnerExample,
  parameters: { layout: "centered" },
  args: {
    loading: true,
    label: "Loading deployments…",
    class: "",
  },
  argTypes: {
    loading: { control: "boolean" },
    label: { control: "text" },
    class: { control: "text" },
  },
};

export default meta;

export const Playground = {};

export const ProductMark = {
  render: () => ({ Component: SpinnerProductMarkExample }),
};
