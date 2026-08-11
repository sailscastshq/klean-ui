import { expect, userEvent, within } from "storybook/test";
import TabsExample from "./TabsExample.svelte";
import TabsNavigation from "./TabsNavigation.svelte";
import TabsWorkspace from "./TabsWorkspace.svelte";

const values = ["overview", "activity", "settings"];

const meta = {
  title: "Components/Tabs",
  component: TabsExample,
  parameters: { layout: "centered" },
  args: {
    initialValue: "overview",
    orientation: "horizontal",
    activation: "automatic",
  },
  argTypes: {
    initialValue: { control: "select", options: values },
    orientation: {
      control: "inline-radio",
      options: ["horizontal", "vertical"],
    },
    activation: {
      control: "inline-radio",
      options: ["automatic", "manual"],
    },
  },
};

export default meta;

export const Playground = {
  parameters: {
    controls: { include: ["initialValue", "orientation", "activation"] },
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const tabs = canvas.getAllByRole("tab");
    const activeIndex = values.indexOf(args.initialValue);

    await expect(tabs[activeIndex]).toHaveAttribute("aria-selected", "true");
    tabs[activeIndex].focus();
    await userEvent.keyboard(
      args.orientation === "vertical" ? "{ArrowDown}" : "{ArrowRight}",
    );
    const next = tabs[(activeIndex + 1) % tabs.length];
    await expect(next).toHaveFocus();
    if (args.activation === "manual") await userEvent.keyboard("{Enter}");
    await expect(next).toHaveAttribute("aria-selected", "true");
  },
};

export const Navigation = {
  render: () => ({ Component: TabsNavigation }),
  parameters: { controls: { disable: true } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const navigation = canvas.getByRole("navigation", {
      name: "Account settings",
    });
    const links = within(navigation).getAllByRole("link");

    await expect(links[0]).toHaveAttribute("aria-current", "page");
    await expect(links[0]).not.toHaveAttribute("role", "tab");
    await userEvent.click(links[1]);
    await expect(links[1]).toHaveAttribute("aria-current", "page");
  },
};

export const Workspace = {
  render: () => ({ Component: TabsWorkspace }),
  parameters: { controls: { disable: true } },
};
