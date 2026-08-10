import { expect, userEvent, within } from "storybook/test";
import Input from "../../registry/input/react/Input.jsx";
import { contract } from "../shared/contract.js";

function InputExample({ invalid = false }) {
  const errorId = invalid ? "react-project-name-error" : undefined;

  return (
    <div className="w-80">
      <label htmlFor="react-project-name" className="mb-2 block font-medium">
        {contract.inputLabel}
      </label>
      <Input
        id="react-project-name"
        aria-invalid={invalid || undefined}
        aria-describedby={errorId}
        placeholder="Billing portal"
      />
      {invalid ? (
        <p id={errorId} className="mt-2 text-sm text-red-700">
          {contract.inputError}
        </p>
      ) : null}
    </div>
  );
}

const meta = {
  title: "Components/Input",
  component: InputExample,
  parameters: { layout: "centered" },
  args: { invalid: false },
  argTypes: { invalid: { control: "boolean" } },
};

export default meta;

export const Playground = {
  play: async ({ canvasElement }) => {
    const input = within(canvasElement).getByLabelText(contract.inputLabel);
    await userEvent.type(input, "Slipway");
    await expect(input).toHaveValue("Slipway");
  },
};
