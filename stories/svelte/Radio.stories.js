import { expect, userEvent, within } from "storybook/test";
import RadioCardExample from "./RadioCardExample.svelte";
import RadioExample from "./RadioExample.svelte";
import RadioFormExample from "./RadioFormExample.svelte";
import { contract } from "../shared/contract.js";

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
  render: () => ({ Component: RadioFormExample }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const virginia = canvas.getByRole("radio", { name: "Virginia" });
    await userEvent.click(virginia);
    await expect(virginia.checked).toBe(true);

    await userEvent.click(canvas.getByRole("button", { name: "Reset" }));
    await expect(canvas.getByRole("radio", { name: "Lagos" }).checked).toBe(
      true,
    );
    await expect(canvas.getByText("lagos")).toBeInTheDocument();
  },
};

export const Card = { render: () => ({ Component: RadioCardExample }) };
