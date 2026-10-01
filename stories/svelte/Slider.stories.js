import { expect, userEvent, within } from "storybook/test";
import SliderExample from "./SliderExample.svelte";

export default {
  title: "Components/Slider",
  component: SliderExample,
  parameters: { layout: "centered" },
};
export const Playground = {};
export const Keyboard = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole("slider", { name: "Rollout" });
    input.focus();
    await userEvent.keyboard("{PageUp}");
    await expect(input).toHaveValue("50");
    const minimum = canvas.getByRole("slider", { name: "Minimum budget" });
    minimum.focus();
    await userEvent.keyboard("{End}");
    await expect(minimum).toHaveValue("75");
    await userEvent.tab();
    await expect(
      canvas.getByRole("slider", { name: "Maximum budget" }),
    ).toHaveFocus();
    await userEvent.click(canvas.getByRole("button", { name: "Reset" }));
    await expect(input).toHaveValue("40");
    await expect(minimum).toHaveValue("20");
    await expect(
      canvas.getByRole("slider", { name: "Maximum budget" }),
    ).toHaveValue("80");
    await expect(
      canvas.getByRole("slider", { name: "Thinking effort" }),
    ).toHaveValue("2");
    await expect(
      canvas.getByRole("slider", { name: "Unavailable" }),
    ).toHaveValue("30");
  },
};
