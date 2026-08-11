import { useEffect, useState } from "react";
import { expect, userEvent, within } from "storybook/test";
import Switch from "../../registry/switch/react/Switch.jsx";
import { contract } from "../shared/contract.js";

function SwitchExample({
  label,
  description,
  defaultChecked,
  invalid,
  ...props
}) {
  const [checked, setChecked] = useState(Boolean(defaultChecked));

  useEffect(() => setChecked(Boolean(defaultChecked)), [defaultChecked]);

  return (
    <div className="w-[min(26rem,calc(100vw-2rem))] rounded-xl border border-gray-200 bg-white p-1 shadow-sm dark:border-gray-800 dark:bg-gray-950">
      <label className="flex min-h-16 cursor-pointer items-center justify-between gap-6 rounded-lg px-4 py-3 has-disabled:cursor-not-allowed">
        <span className="min-w-0">
          <span className="block text-sm font-medium">{label}</span>
          <span className="mt-1 block text-sm leading-5 text-gray-500">
            {description}
          </span>
        </span>
        <Switch
          {...props}
          checked={checked}
          aria-invalid={invalid || undefined}
          aria-describedby={invalid ? "react-switch-error" : undefined}
          onChange={(event) => setChecked(event.target.checked)}
        />
      </label>
      {invalid ? (
        <p
          id="react-switch-error"
          className="px-4 pb-3 text-sm text-red-600 dark:text-red-400"
        >
          This setting could not be saved.
        </p>
      ) : null}
    </div>
  );
}

const meta = {
  title: "Components/Switch",
  component: SwitchExample,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A native boolean switch with idiomatic React state and ordinary Tailwind styling.",
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
    className: "",
  },
  argTypes: {
    label: { control: "text" },
    description: { control: "text" },
    defaultChecked: { control: "boolean" },
    disabled: { control: "boolean" },
    required: { control: "boolean" },
    invalid: { control: "boolean" },
    className: { control: "text" },
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
    className:
      "h-5 w-9 bg-stone-300 after:size-4 checked:bg-emerald-600 checked:after:transform-[translate(1rem,-50%)] dark:bg-stone-700 dark:checked:bg-emerald-400",
  },
};
