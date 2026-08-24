import ErrorStateExample from "./ErrorStateExample.svelte";

const meta = {
  title: "Components/ErrorState",
  component: ErrorStateExample,
  parameters: { layout: "centered" },
  args: {
    as: "section",
    title: "Services could not load",
    description: "Slipway could not reach the deployment service.",
  },
  argTypes: {
    as: { control: "select", options: ["div", "section", "article"] },
    title: { control: "text" },
    description: { control: "text" },
  },
};

export default meta;

export const Playground = {};
