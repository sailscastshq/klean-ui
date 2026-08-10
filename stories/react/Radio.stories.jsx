import { useEffect, useState } from "react";
import { expect, userEvent, within } from "storybook/test";
import Radio from "../../registry/radio/react/Radio.jsx";
import { contract } from "../shared/contract.js";

function RadioExample({ selected: initialSelected, disabled }) {
  const [selected, setSelected] = useState(initialSelected);

  useEffect(() => setSelected(initialSelected), [initialSelected]);

  return (
    <fieldset className="w-96 max-w-[calc(100vw-2rem)]">
      <legend className="text-sm font-semibold">{contract.radioLegend}</legend>
      <div className="mt-3 space-y-2">
        {contract.radioOptions.map((label) => {
          const value = label.toLowerCase();
          return (
            <label
              key={value}
              className="flex min-h-14 cursor-pointer items-center gap-3 rounded-lg border border-gray-200 bg-white px-4 py-3 has-[:checked]:border-gray-950 dark:border-gray-800 dark:bg-gray-950 dark:has-[:checked]:border-white"
            >
              <Radio
                name="react-region"
                value={value}
                checked={selected === value}
                disabled={disabled}
                onChange={(event) => setSelected(event.target.value)}
              />
              <span className="text-sm font-medium">{label}</span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

const meta = {
  title: "Components/Radio",
  component: RadioExample,
  parameters: { layout: "centered" },
  args: { selected: "lagos", disabled: false },
  argTypes: {
    selected: {
      control: "select",
      options: contract.radioOptions.map((option) => option.toLowerCase()),
    },
    disabled: { control: "boolean" },
  },
};

export default meta;

export const Playground = {
  play: async ({ canvasElement, args }) => {
    const radios = within(canvasElement).getAllByRole("radio");
    const current = radios.find((radio) => radio.checked);
    await expect(current.value).toBe(args.selected);

    if (!args.disabled) {
      const next = radios.find((radio) => radio !== current);
      await userEvent.click(next);
      await expect(next.checked).toBe(true);
      await expect(radios.filter((radio) => radio.checked)).toHaveLength(1);
    }
  },
};

export const Form = {
  render: () => (
    <form className="w-80 max-w-[calc(100vw-2rem)]">
      <fieldset>
        <legend className="text-sm font-semibold">Deployment region</legend>
        <div className="mt-3 space-y-3">
          {contract.radioOptions.map((label, index) => (
            <label
              key={label}
              className="flex cursor-pointer items-center gap-3 text-sm"
            >
              <Radio
                name="react-form-region"
                value={label.toLowerCase()}
                defaultChecked={index === 1}
              />
              {label}
            </label>
          ))}
        </div>
      </fieldset>
      <button
        type="reset"
        className="mt-5 min-h-11 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium dark:border-gray-700"
      >
        Reset
      </button>
    </form>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const virginia = canvas.getByRole("radio", { name: "Virginia" });
    await userEvent.click(virginia);
    await expect(virginia.checked).toBe(true);

    await userEvent.click(canvas.getByRole("button", { name: "Reset" }));
    await expect(canvas.getByRole("radio", { name: "Lagos" }).checked).toBe(
      true,
    );
  },
};

export const Card = {
  render: () => {
    const [scope, setScope] = useState("project");
    return (
      <fieldset className="w-96 max-w-[calc(100vw-2rem)]">
        <legend className="text-sm font-semibold">Visibility</legend>
        <div className="mt-3 grid grid-cols-2 gap-2">
          {["personal", "project"].map((value) => (
            <label
              key={value}
              className="cursor-pointer rounded-lg border border-gray-200 px-3 py-3 capitalize has-[:checked]:border-gray-950 has-[:checked]:bg-gray-50 dark:border-gray-800 dark:has-[:checked]:border-white dark:has-[:checked]:bg-gray-900"
            >
              <Radio
                className="sr-only"
                name="react-scope"
                value={value}
                checked={scope === value}
                onChange={(event) => setScope(event.target.value)}
              />
              <span className="text-sm font-medium">{value}</span>
            </label>
          ))}
        </div>
      </fieldset>
    );
  },
};
