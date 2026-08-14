import CardActions from "./CardActions.svelte";
import CardExample from "./CardExample.svelte";
import CardNavigation from "./CardNavigation.svelte";

const meta = {
  title: "Components/Card",
  component: CardExample,
  parameters: { layout: "centered" },
  args: {
    as: "article",
    title: "Production API",
    description: "Healthy in Lagos with three replicas.",
  },
  argTypes: {
    as: {
      control: "select",
      options: ["div", "article", "section", "aside"],
    },
    title: { control: "text" },
    description: { control: "text" },
  },
};

export default meta;

export const Playground = {};

export const Navigation = {
  parameters: { controls: { disable: true } },
  render: () => ({ Component: CardNavigation }),
};

export const ExplicitActions = {
  parameters: { controls: { disable: true } },
  render: () => ({ Component: CardActions }),
};
