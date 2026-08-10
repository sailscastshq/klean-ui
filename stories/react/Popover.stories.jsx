import { expect, userEvent, within } from "storybook/test";
import Button from "../../registry/button/react/Button.jsx";
import Popover from "../../registry/popover/react/Popover.jsx";
import { contract } from "../shared/contract.js";

function PopoverExample() {
  return (
    <div>
      <Button popoverTarget={contract.popoverId}>
        {contract.popoverLabel}
      </Button>
      <Popover id={contract.popoverId} className="w-72">
        {({ close }) => (
          <section aria-labelledby="react-filter-title">
            <h2 id="react-filter-title" className="font-semibold">
              Visible records
            </h2>
            <p className="mt-1 text-sm leading-6 text-gray-600">
              The browser owns the popover layer; Klean adds durable
              positioning.
            </p>
            <Button onClick={close} className="mt-4 w-full">
              Done
            </Button>
          </section>
        )}
      </Popover>
    </div>
  );
}

const meta = {
  title: "Components/Popover",
  component: PopoverExample,
  parameters: { layout: "centered", controls: { disable: true } },
};

export default meta;

export const NativeInteraction = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("button", { name: contract.popoverLabel });
    const popover = canvasElement.querySelector(`#${contract.popoverId}`);

    await userEvent.click(trigger);
    await expect(popover).toHaveAttribute("data-state", "open");
    await expect(popover.style.left).toMatch(/px$/);
    await expect(popover.style.top).toMatch(/px$/);
    await userEvent.keyboard("{Escape}");
    await expect(popover).toHaveAttribute("data-state", "closed");
    await expect(trigger).toHaveFocus();
  },
};
