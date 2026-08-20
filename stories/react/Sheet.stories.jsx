import { useState } from "react";
import { expect, userEvent, within } from "storybook/test";
import Button from "../../registry/button/react/Button.jsx";
import Sheet from "../../registry/sheet/react/Sheet.jsx";
import { contract } from "../shared/contract.js";

function SheetExample() {
  const [open, setOpen] = useState(false);

  return (
    <main className="klean-story-canvas grid min-h-128 place-items-center px-5 py-12">
      <Button commandfor={contract.sheetId} command="show-modal">
        {contract.sheetLabel}
      </Button>
      <Sheet
        id={contract.sheetId}
        open={open}
        onOpenChange={setOpen}
        aria-labelledby="react-sheet-title"
      >
        <article className="grid h-full grid-rows-[auto_minmax(0,1fr)_auto]">
          <header className="flex items-center justify-between border-b border-gray-200 px-5 py-5">
            <h2 id="react-sheet-title" className="text-xl font-semibold">
              {contract.sheetTitle}
            </h2>
            <Button
              commandfor={contract.sheetId}
              command="request-close"
              autoFocus
              aria-label="Close project details"
              className="min-h-11 min-w-11 bg-transparent p-0 text-gray-600 hover:bg-gray-100"
            >
              <span aria-hidden="true" className="text-xl leading-none">×</span>
            </Button>
          </header>
          <div className="overflow-y-auto px-5 py-6 text-sm text-gray-600">
            Framework-native state observes the same native dialog.
          </div>
          <form method="dialog" className="border-t border-gray-200 p-5">
            <Button type="submit" value="done" className="w-full">Done</Button>
          </form>
        </article>
      </Sheet>
    </main>
  );
}

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
