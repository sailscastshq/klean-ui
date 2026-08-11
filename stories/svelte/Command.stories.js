import { expect, userEvent, within } from "storybook/test";
import CommandExample from "./CommandExample.svelte";
import CommandPaletteExample from "./CommandPaletteExample.svelte";

const meta = {
  title: "Components/Command",
  component: CommandExample,
  parameters: { layout: "centered", controls: { disable: true } },
};

export default meta;

export const KeyboardContract = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole("combobox", { name: "Search commands" });
    await userEvent.type(input, "metrics");
    await expect(
      canvas.getByRole("option", { name: /Go to Lookout/ }),
    ).toBeVisible();
    await userEvent.keyboard("{Enter}");
    await expect(canvas.getByText("Selected: Go to Lookout")).toBeVisible();
    await expect(input).toHaveFocus();
  },
};

export const Palette = {
  render: () => ({ Component: CommandPaletteExample }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("button", {
      name: /Open command palette/,
    });
    await userEvent.click(trigger);
    const input = canvas.getByRole("combobox", { name: "Search commands" });
    await expect(input).toHaveFocus();
    await userEvent.type(input, "deploy");
    await userEvent.keyboard("{Enter}");
    await expect(
      canvas.getByText("Selected: Deploy application"),
    ).toBeVisible();
    await expect(trigger).toHaveFocus();
  },
};
