import { expect, userEvent, within } from "storybook/test";
import ComboboxExample from "./ComboboxExample.svelte";
import ComboboxApplicationMatches from "./ComboboxApplicationMatches.svelte";

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

export const ApplicationMatches = {
  name: "Application matches",
  args: { filter: false },
  argTypes: { filter: { control: "boolean" } },
  parameters: { controls: { disable: false, include: ["filter"] } },
  render: (args) => ({ Component: ComboboxApplicationMatches, props: args }),
};
