import { expect, userEvent, within } from "storybook/test";
import DialogExample from "./DialogExample.svelte";
import { contract } from "../shared/contract.js";

const meta = {
  title: "Components/Dialog",
  component: DialogExample,
  parameters: { layout: "centered", controls: { disable: true } },
};

export default meta;

export const NativeContract = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("button", { name: contract.dialogLabel });
    const dialog = canvasElement.querySelector(`#${contract.dialogId}`);

    await userEvent.click(trigger);
    await expect(dialog).toHaveAttribute("open");
    await expect(dialog).toHaveAttribute("data-state", "open");
    await expect(canvas.getByRole("button", { name: "Cancel" })).toHaveFocus();
    dialog.requestClose();
    await expect(dialog).not.toHaveAttribute("open");
    await expect(trigger).toHaveFocus();
  },
};
