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

function ApplicationMatchesExample({ filter = false }) {
  const [value, setValue] = useState();
  const results = [
    { value: "archived", label: "Archived vehicle", disabled: true },
    { value: 42, label: "Automobile" },
    { value: 7, label: "Motor vehicle" },
  ];
  return (
    <form
      className="grid w-[min(24rem,calc(100vw-2rem))] gap-2"
      onSubmit={(event) => event.preventDefault()}
    >
      <label htmlFor="matched-vehicle" className="text-sm font-medium">
        Vehicle
      </label>
      <Combobox
        id="matched-vehicle"
        value={value}
        onValueChange={setValue}
        name="vehicle"
        options={results}
        filter={filter}
      />
      <p className="text-sm text-gray-500 dark:text-gray-400">
        Type car, then choose Automobile. Results retain their application
        order.
      </p>
      <output className="text-sm">Committed value: {value ?? "none"}</output>
      <button
        type="button"
        className="min-h-11 rounded-md border border-gray-300 px-3 text-sm dark:border-gray-700"
      >
        After combobox
      </button>
    </form>
  );
}

export const ApplicationMatches = {
  name: "Application matches",
  args: { filter: false },
  argTypes: { filter: { control: "boolean" } },
  parameters: { controls: { disable: false, include: ["filter"] } },
  render: (args) => <ApplicationMatchesExample {...args} />,
};
