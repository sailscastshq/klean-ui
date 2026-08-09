import { expect, userEvent, within } from "storybook/test";
import CheckboxExample from "./CheckboxExample.svelte";
import { contract } from "../shared/contract.js";

const meta = {
  title: "Components/Checkbox",
  component: CheckboxExample,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  args: {
    label: contract.checkboxLabel,
    defaultChecked: false,
    indeterminate: false,
    disabled: false,
  },
  argTypes: {
    label: { control: "text" },
    defaultChecked: { control: "boolean" },
    indeterminate: { control: "boolean" },
    disabled: { control: "boolean" },
  },
};

export default meta;

export const Playground = {
  play: async ({ canvasElement, args }) => {
    const checkbox = within(canvasElement).getByRole("checkbox");
    if (!args.disabled) {
      const previous = checkbox.checked;
      await userEvent.click(checkbox);
      await expect(checkbox.checked).toBe(!previous);
      await expect(checkbox).toHaveFocus();
    }
  },
};

export const Mixed = {
  args: {
    label: "Select all deployments",
    defaultChecked: false,
    indeterminate: true,
  },
};
