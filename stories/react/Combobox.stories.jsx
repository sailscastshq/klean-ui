import { useState } from "react";
import { expect, userEvent, within } from "storybook/test";
import Combobox from "../../registry/combobox/react/Combobox.jsx";

const options = [
  {
    value: "slipway",
    label: "Slipway",
    description: "Deploy Sails applications",
  },
  { value: "retired", label: "Retired service", disabled: true },
  {
    value: "hagfish",
    label: "Hagfish",
    description: "Invoices and customers",
    keywords: ["billing"],
  },
];

function ComboboxExample() {
  const [value, setValue] = useState("slipway");

  return (
    <div className="grid w-80 gap-2">
      <label htmlFor="react-project" className="text-sm font-medium">
        Project
      </label>
      <Combobox
        id="react-project"
        value={value}
        onValueChange={setValue}
        name="project"
        options={options}
      />
      <p className="text-sm text-gray-500">Committed value: {value}</p>
    </div>
  );
}

const meta = {
  title: "Components/Combobox",
  component: ComboboxExample,
  tags: ["autodocs"],
  parameters: { layout: "centered", controls: { disable: true } },
};

export default meta;

export const KeyboardContract = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole("combobox", { name: "Project" });

    await userEvent.click(input);
    await userEvent.type(input, "bill");
    await expect(canvas.getByRole("option", { name: /Hagfish/ })).toBeVisible();
    await userEvent.keyboard("{ArrowDown}{Enter}");
    await expect(input).toHaveValue("Hagfish");
    await expect(input).toHaveFocus();
  },
};
