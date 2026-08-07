import { expect, fn, userEvent, within } from "storybook/test";
import SlideExample from "./SlideExample.svelte";

const meta = {
  title: "Components/Slide",
  component: SlideExample,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  args: {
    label: "Slide to continue",
    disabled: false,
    pending: false,
    class: "w-64",
    onconfirm: fn(),
  },
  argTypes: {
    label: { control: "text" },
    disabled: { control: "boolean" },
    pending: { control: "boolean" },
    class: { control: "text" },
    onconfirm: { table: { disable: true } },
  },
};

export default meta;

export const Playground = {
  parameters: {
    controls: { include: ["label", "disabled", "pending", "class"] },
  },
};

export const Keyboard = {
  parameters: { controls: { disable: true } },
  args: { label: "Confirm with Enter" },
  play: async ({ args, canvasElement }) => {
    const button = within(canvasElement).getByRole("button", {
      name: args.label,
    });
    button.focus();
    await userEvent.keyboard("{Enter}");
    await expect(args.onconfirm).toHaveBeenCalledTimes(1);
    await expect(button).toHaveFocus();
  },
};

export const Pending = {
  parameters: { controls: { disable: true } },
  args: { label: "Working…", pending: true },
};

export const Rtl = {
  name: "RTL",
  parameters: { controls: { disable: true } },
  args: { label: "اسحب للتأكيد", dir: "rtl" },
};
