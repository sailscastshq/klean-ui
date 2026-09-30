import { flagSource } from "../src/vue/flag/flags.js";
import Flag from "../src/vue/flag/Flag.vue";
export default {
  title: "Components/Flag",
  component: Flag,
  parameters: { layout: "centered" },
  args: { country: "NG", src: "", alt: "", class: "" },
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
    template: `<div class="flex items-center gap-4"><Flag country="NG" alt="Nigeria" class="w-5" /><Flag country="KE" alt="Kenya" class="w-6" /><Flag country="GH" alt="Ghana" class="w-8" /><Flag country="ZA" alt="South Africa" class="w-10" /><Flag country="US" alt="United States" class="w-12" /><Flag country="NG" alt="Nigeria" class="size-10 aspect-square rounded-full" /><Flag country="ZZ" alt="Unavailable" class="w-8">?</Flag></div>`,
  }),
};

export const Circle = {
  args: { alt: "Nigeria", class: "size-10 aspect-square rounded-full" },
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
