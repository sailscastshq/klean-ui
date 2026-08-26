import { expect, within } from "storybook/test";
import ThemingExample from "./ThemingExample.svelte";

const meta = {
  title: "Klean UI/Theming",
  component: ThemingExample,
  parameters: {
    layout: "fullscreen",
    controls: { disable: true },
    docs: {
      description: {
        component:
          "Theme in CSS. Style with Tailwind. Put only user-selected mode on the document. Klean adds no provider, theme object, preset, visual variant, or configuration file.",
      },
    },
  },
};

export default meta;

export const Convention = {
  name: "Zero configuration",
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getAllByRole("button")).toHaveLength(5);
    await expect(
      canvas.getByRole("region", { name: "Light mode proof" }),
    ).toHaveAttribute("data-mode", "light");
    await expect(
      canvas.getByRole("region", { name: "Dark mode proof" }),
    ).toHaveAttribute("data-mode", "dark");
  },
};
