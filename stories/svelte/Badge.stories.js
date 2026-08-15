import BadgeExample from "./BadgeExample.svelte";
import BadgeRecipes from "./BadgeRecipes.svelte";

const meta = {
  title: "Components/Badge",
  component: BadgeExample,
  parameters: { layout: "centered" },
  args: { label: "Paid", class: "" },
  argTypes: {
    label: { control: "text" },
    class: { control: "text" },
  },
};

export default meta;

export const Playground = {};

export const Notifications = {
  parameters: { controls: { disable: true } },
  render: () => ({ Component: BadgeRecipes }),
};
