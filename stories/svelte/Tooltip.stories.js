import { expect, userEvent, waitFor, within } from "storybook/test";
import TooltipExample from "./TooltipExample.svelte";
import TooltipSides from "./TooltipSides.svelte";

const meta = {
  title: "Components/Tooltip",
  component: TooltipExample,
  parameters: { layout: "centered" },
  args: {
    text: "Re-run query",
    placement: "top",
    class: "",
  },
  argTypes: {
    text: { control: "text" },
    placement: {
      control: "select",
      options: ["top", "right", "bottom", "left"],
    },
    class: { control: "text" },
  },
};

export default meta;

export const Playground = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("button", { name: "Re-run query" });
    trigger.focus();

    await waitFor(
      () => {
        const tooltip = canvasElement.ownerDocument.getElementById(
          trigger.getAttribute("aria-describedby"),
        );
        expect(tooltip).toHaveAttribute("data-state", "open");
      },
      { timeout: 1000 },
    );
    await userEvent.keyboard("{Escape}");
    await expect(trigger).toHaveFocus();
  },
};

export const Sides = {
  render: () => ({ Component: TooltipSides }),
};
