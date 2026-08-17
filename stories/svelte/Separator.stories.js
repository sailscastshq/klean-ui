import SeparatorBoundaries from "./SeparatorBoundaries.svelte";
import SeparatorExample from "./SeparatorExample.svelte";

const meta = {
  title: "Components/Separator",
  component: SeparatorExample,
  parameters: { layout: "centered" },
  args: { orientation: "horizontal", class: "" },
  argTypes: {
    orientation: {
      control: "inline-radio",
      options: ["horizontal", "vertical"],
    },
    class: { control: "text" },
  },
};

export default meta;

export const Playground = {};

export const Boundaries = {
  parameters: { controls: { disable: true } },
  render: () => ({ Component: SeparatorBoundaries }),
};
