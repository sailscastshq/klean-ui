import { expect, userEvent, within } from "storybook/test";
import ToastExample from "./ToastExample.svelte";

const positions = [
  "top-left",
  "top-center",
  "top-right",
  "bottom-left",
  "bottom-center",
  "bottom-right",
];
const directions = ["left", "right", "top", "bottom", "fade", "none"];

const meta = {
  title: "Svelte/Toast",
  component: ToastExample,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "The same provider-free Toast contract rendered with current Svelte 5 runes and snippets.",
      },
    },
  },
  args: {
    position: "top-right",
    from: "right",
    to: "right",
  },
  argTypes: {
    position: { control: "select", options: positions },
    from: { control: "select", options: directions },
    to: { control: "select", options: directions },
  },
};

export default meta;

export const Playground = {
  parameters: { controls: { include: ["position", "from", "to"] } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Show toast" }));
    await expect(canvas.getByText("Svelte notification")).toBeInTheDocument();
    await expect(
      canvasElement.querySelector('[data-slot="toast-viewport"]'),
    ).toHaveAttribute("aria-live", "polite");
  },
};

export const CustomContent = {
  name: "Custom content",
  args: { custom: true, position: "bottom-right" },
  parameters: { controls: { disable: true } },
};
