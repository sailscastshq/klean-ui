import IconsExample from "./IconsExample.svelte";
import { iconNames } from "./generated/icons.js";

const meta = {
  title: "Components/Icons",
  component: IconsExample,
  parameters: { layout: "centered" },
  args: { icon: "Rocket", size: 24, color: "#111827", strokeWidth: 1.5 },
  argTypes: {
    icon: { control: "select", options: iconNames },
    size: { control: { type: "range", min: 12, max: 64, step: 1 } },
    color: { control: "color" },
    strokeWidth: { control: { type: "range", min: 1, max: 2.5, step: 0.25 } },
  },
};

export default meta;

export const Playground = {};

export const ProofSet = {
  args: { mode: "proof" },
  parameters: { layout: "fullscreen", controls: { disable: true } },
};

export const Apps = {
  args: { mode: "apps" },
  parameters: { layout: "fullscreen", controls: { disable: true } },
};
