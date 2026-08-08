import { expect, userEvent, within } from "storybook/test";
import ComboboxExample from "./ComboboxExample.svelte";

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
