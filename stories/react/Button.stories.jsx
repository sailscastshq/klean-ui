import { expect, fn, userEvent, within } from "storybook/test";
import Button from "../../registry/button/react/Button.jsx";
import { contract } from "../shared/contract.js";

const meta = {
  title: "Components/Button",
  component: Button,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  args: {
    children: contract.buttonLabel,
    disabled: false,
    onClick: fn(),
  },
  argTypes: {
    children: { control: "text", name: "label" },
    disabled: { control: "boolean" },
    onClick: { table: { disable: true } },
  },
};

export default meta;

export const Playground = {
  play: async ({ args, canvasElement }) => {
    const button = within(canvasElement).getByRole("button", {
      name: args.children,
    });
    await expect(button).toHaveAttribute("type", "button");
    if (!args.disabled) {
      await userEvent.click(button);
      await expect(args.onClick).toHaveBeenCalled();
    }
  },
};
