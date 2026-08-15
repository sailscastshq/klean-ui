import AvatarExample from "./AvatarExample.svelte";
import AvatarRecipes from "./AvatarRecipes.svelte";

const meta = {
  title: "Components/Avatar",
  component: AvatarExample,
  parameters: { layout: "centered" },
  args: {
    image: true,
    alt: "Ada Okafor",
    fallback: "AO",
    class: "",
  },
  argTypes: {
    image: { control: "boolean" },
    alt: { control: "text" },
    fallback: { control: "text" },
    class: { control: "text" },
  },
};

export default meta;

export const Playground = {};

export const Apps = {
  parameters: { controls: { disable: true } },
  render: () => ({ Component: AvatarRecipes }),
};
