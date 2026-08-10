import { expect, fn, userEvent, within } from "storybook/test";
import Slide from "../../registry/slide/react/Slide.jsx";

const meta = {
  title: "Components/Slide",
  component: Slide,
  parameters: { layout: "centered" },
  args: {
    children: "Slide to continue",
    disabled: false,
    pending: false,
    className: "w-64",
    onConfirm: fn(),
  },
  argTypes: {
    children: { control: "text", name: "label" },
    disabled: { control: "boolean" },
    pending: { control: "boolean" },
    className: { control: "text" },
    onConfirm: { table: { disable: true } },
  },
};

export default meta;

export const Playground = {
  parameters: {
    controls: {
      include: ["children", "disabled", "pending", "className"],
    },
  },
};

export const Keyboard = {
  parameters: { controls: { disable: true } },
  args: { children: "Confirm with Enter" },
  play: async ({ args, canvasElement }) => {
    const button = within(canvasElement).getByRole("button", {
      name: args.children,
    });
    button.focus();
    await userEvent.keyboard("{Enter}");
    await expect(args.onConfirm).toHaveBeenCalledTimes(1);
    await expect(button).toHaveFocus();
  },
};

export const Pending = {
  parameters: { controls: { disable: true } },
  args: { children: "Working…", pending: true },
};

export const Rtl = {
  name: "RTL",
  parameters: { controls: { disable: true } },
  args: { children: "اسحب للتأكيد", dir: "rtl" },
};
