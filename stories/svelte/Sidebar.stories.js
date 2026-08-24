import SidebarExample from "./SidebarExample.svelte";
import SidebarRecipes from "./SidebarRecipes.svelte";

const meta = {
  title: "Components/Sidebar",
  component: SidebarExample,
  parameters: { layout: "fullscreen" },
  args: {
    defaultOpen: true,
    remember: false,
    class: "w-64 data-[state=closed]:w-0 data-[state=closed]:opacity-0",
  },
  argTypes: {
    defaultOpen: { control: "boolean" },
    remember: { control: "boolean" },
    class: { control: "text" },
  },
};

export default meta;

export const Playground = {};

export const Slipway = {
  parameters: { controls: { disable: true } },
  render: () => ({ Component: SidebarRecipes }),
};
