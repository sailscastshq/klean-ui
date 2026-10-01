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
          "Native country image with a derived English country name when alt is omitted, local assets and custom src precedence. Tailwind owns size and circular cropping.",
      },
    },
  },
  argTypes: {
    country: { control: "text" },
    src: { control: "text" },
    alt: { control: "text" },
    class: { control: "text" },
  },
  args: { country: "NG", src: "", class: "" },
};
export const Playground = {};
export const Circle = { args: { class: "size-10 aspect-square rounded-full" } };
export const Missing = { args: { country: "ZZ", alt: "Unavailable" } };

export const Sizes = { render: () => ({ Component: FlagSizes }) };

export const CustomSource = {
  args: { country: "NG", src: flagSource("KE"), alt: "Kenya" },
};

export const Decorative = { args: { alt: "" } };
export const LabelOverride = { args: { alt: "Based in Nigeria" } };
export const InvalidCountry = { args: { country: "ZZ" } };
export const CustomSourceWithoutCountry = {
  args: { country: "", src: flagSource("KE"), alt: "Kenya" },
};
export const UnknownCustomSource = {
  args: { country: "", src: flagSource("KE") },
};
export const FailedSource = { args: { src: "data:image/png;base64,broken" } };
