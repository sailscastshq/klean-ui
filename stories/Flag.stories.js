import { flagSource } from "../src/vue/flag/flags.js";
import Flag from "../src/vue/flag/Flag.vue";
export default {
  title: "Components/Flag",
  component: Flag,
  parameters: { layout: "centered" },
  args: { country: "NG", src: "", class: "" },
  argTypes: {
    country: { control: "text" },
    src: { control: "text" },
    alt: { control: "text" },
    class: { control: "text" },
  },
};
export const Playground = {};
export const Sizes = {
  render: () => ({
    components: { Flag },
    template: `<div class="flex items-center gap-4"><Flag country="NG" class="w-5" /><Flag country="KE" class="w-6" /><Flag country="GH" class="w-8" /><Flag country="ZA" class="w-10" /><Flag country="US" class="w-12" /><Flag country="NG" class="size-10 aspect-square rounded-full" /><Flag country="ZZ" alt="Unavailable" class="w-8">?</Flag></div>`,
  }),
};

export const Circle = {
  args: { class: "size-10 aspect-square rounded-full" },
};
export const Missing = {
  args: { country: "ZZ", alt: "Unavailable" },
  render: (args) => ({
    components: { Flag },
    setup: () => ({ args }),
    template: `<Flag v-bind="args">?</Flag>`,
  }),
};

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
