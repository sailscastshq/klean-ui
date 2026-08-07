import { useState } from "react";
import { expect, userEvent, within } from "storybook/test";
import Button from "../../registry/button/react/Button.jsx";
import Dialog from "../../registry/dialog/react/Dialog.jsx";
import { contract } from "../shared/contract.js";

function DialogExample() {
  const [open, setOpen] = useState(false);

  return (
    <div className="grid justify-items-start gap-3">
      <p className="text-sm text-gray-600" aria-live="polite">
        Dialog is {open ? "open" : "closed"}
      </p>
      <Button commandfor={contract.dialogId} command="show-modal">
        {contract.dialogLabel}
      </Button>
      <Dialog
        id={contract.dialogId}
        open={open}
        onOpenChange={setOpen}
        aria-labelledby="react-dialog-title"
        aria-describedby="react-dialog-description"
      >
        <h2 id="react-dialog-title" className="text-xl font-semibold">
          {contract.dialogTitle}
        </h2>
        <p
          id="react-dialog-description"
          className="mt-2 text-sm leading-6 text-gray-600"
        >
          The browser owns modal behavior; the application owns this message and
          every action.
        </p>
        <form
          method="dialog"
          className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end"
        >
          <Button
            type="submit"
            value="cancel"
            autoFocus
            className="bg-white text-gray-950 ring-1 ring-inset ring-gray-300 hover:bg-gray-100"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            value="delete"
            className="bg-red-700 hover:bg-red-800 active:bg-red-900"
          >
            Delete project
          </Button>
        </form>
      </Dialog>
    </div>
  );
}

const meta = {
  title: "Components/Dialog",
  component: DialogExample,
  tags: ["autodocs"],
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
