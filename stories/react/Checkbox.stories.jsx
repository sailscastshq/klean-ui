import { useEffect, useState } from "react";
import { expect, userEvent, within } from "storybook/test";
import Checkbox from "../../registry/checkbox/react/Checkbox.jsx";
import { contract } from "../shared/contract.js";

function CheckboxExample({ label, defaultChecked, ...props }) {
  const [checked, setChecked] = useState(Boolean(defaultChecked));

  useEffect(() => setChecked(Boolean(defaultChecked)), [defaultChecked]);

  return (
    <label className="flex w-80 cursor-pointer items-start gap-3 rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-950">
      <Checkbox
        {...props}
        checked={checked}
        onChange={(event) => setChecked(event.target.checked)}
      />
      <span>
        <span className="block text-sm font-medium">{label}</span>
        <span className="mt-1 block text-sm text-gray-500">
          Uses native checked and onChange.
        </span>
      </span>
    </label>
  );
}

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
