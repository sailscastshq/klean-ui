import AvatarGroupExample from "./AvatarGroupExample.svelte";
import AvatarGroupRecipes from "./AvatarGroupRecipes.svelte";

const meta = {
  title: "Components/AvatarGroup",
  component: AvatarGroupExample,
  parameters: { layout: "centered" },
  args: { max: 4, total: 42, avatarClass: "", class: "" },
  argTypes: {
    max: { control: { type: "number", min: 0, max: 6 } },
    total: { control: { type: "number", min: 0 } },
    avatarClass: { control: "text" },
    class: { control: "text" },
  },
};

export default meta;

export const Playground = {};

export const CustomOverflow = {
  parameters: { controls: { disable: true } },
  render: () => ({ Component: AvatarGroupRecipes }),
};
