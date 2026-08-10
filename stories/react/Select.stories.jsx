import { useState } from "react";
import { expect, userEvent, within } from "storybook/test";
import Select from "../../registry/select/react/Select.jsx";

const options = [
  { value: "viewer", label: "Viewer" },
  { value: "editor", label: "Editor", disabled: true },
  { value: "administrator", label: "Administrator" },
];

function SelectExample() {
  const [value, setValue] = useState("viewer");

  return (
    <div className="grid w-80 gap-2">
      <label
        id="react-role-label"
        htmlFor="react-role"
        className="text-sm font-medium"
      >
        Member role
      </label>
      <Select
        id="react-role"
        aria-labelledby="react-role-label"
        value={value}
        onValueChange={setValue}
        name="role"
        options={options}
      />
      <p className="text-sm text-gray-500">Current value: {value}</p>
    </div>
  );
}

const meta = {
  title: "Components/Select",
  component: SelectExample,
  parameters: { layout: "centered", controls: { disable: true } },
};

export default meta;

export const KeyboardContract = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("combobox", { name: "Member role" });

    trigger.focus();
    await userEvent.keyboard("{ArrowDown}{ArrowDown}");
    await expect(trigger).toHaveTextContent("Viewer");
    await userEvent.keyboard("{Enter}");
    await expect(trigger).toHaveTextContent("Administrator");
    await expect(trigger).toHaveFocus();
  },
};
