import FlagSizes from "./FlagSizes.svelte";
import { flagSource } from "../../registry/flag/shared/flags.js";
import Flag from "../../registry/flag/svelte/Flag.svelte";
export default {
  title: "Components/Flag",
  component: Flag,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Native country image with decorative alt by default, local assets and custom src precedence. Tailwind owns size and circular cropping.",
      },
    },
  },
  argTypes: {
    country: { control: "text" },
    src: { control: "text" },
    alt: { control: "text" },
    class: { control: "text" },
  },
  args: { country: "NG", src: "", alt: "", class: "" },
};
export const Playground = {};
export const Circle = { args: { class: "size-10 aspect-square rounded-full" } };
export const Missing = { args: { country: "ZZ", alt: "Unavailable" } };

export const Sizes = { render: () => ({ Component: FlagSizes }) };

export const CustomSource = {
  args: { country: "NG", src: flagSource("KE"), alt: "Kenya" },
};
