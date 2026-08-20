import { expect, userEvent, within } from "storybook/test";
import SheetExample from "./SheetExample.svelte";
import { contract } from "../shared/contract.js";

const meta = {
  title: "Components/Sheet",
  component: SheetExample,
  parameters: { layout: "fullscreen", controls: { disable: true } },
};

export default meta;

export const NativeContract = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("button", { name: contract.sheetLabel });
    const sheet = canvasElement.querySelector(`#${contract.sheetId}`);

    await userEvent.click(trigger);
    await expect(sheet).toHaveAttribute("open");
    await expect(sheet).toHaveAttribute("data-state", "open");
    await userEvent.click(
      canvas.getByRole("button", { name: "Close project details" }),
    );
    await expect(sheet).not.toHaveAttribute("open");
    await expect(trigger).toHaveFocus();
  },
};
