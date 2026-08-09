import { expect, userEvent, within } from "storybook/test";
import SwitchExample from "./SwitchExample.svelte";
import { contract } from "../shared/contract.js";

const meta = {
  title: "Components/Switch",
  component: SwitchExample,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A native boolean switch with idiomatic Svelte 5 binding and ordinary Tailwind styling.",
      },
    },
  },
  args: {
    label: contract.switchLabel,
    description:
      "New releases become available to preview as soon as they build.",
    defaultChecked: false,
    disabled: false,
    required: false,
    invalid: false,
    class: "",
  },
  argTypes: {
    label: { control: "text" },
    description: { control: "text" },
    defaultChecked: { control: "boolean" },
    disabled: { control: "boolean" },
    required: { control: "boolean" },
    invalid: { control: "boolean" },
    class: { control: "text" },
  },
};

export default meta;

export const Playground = {
  play: async ({ canvasElement, args }) => {
    const control = within(canvasElement).getByRole("switch");
    await expect(control).not.toHaveAttribute("aria-checked");
    if (!args.disabled) {
      const previous = control.checked;
      await userEvent.click(control);
      await expect(control.checked).toBe(!previous);
      await userEvent.keyboard(" ");
      await expect(control.checked).toBe(previous);
    }
  },
};

export const Styled = {
  args: {
    label: "Automatic deploys",
    description: "Deploy the main branch after every successful build.",
    defaultChecked: true,
    class:
      "h-5 w-9 bg-stone-300 after:size-4 checked:bg-emerald-600 checked:after:[transform:translate(1rem,-50%)] dark:bg-stone-700 dark:checked:bg-emerald-400",
  },
};
