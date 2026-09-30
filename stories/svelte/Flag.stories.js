import Flag from "../../registry/flag/svelte/Flag.svelte";
export default {
  title: "Components/Flag",
  component: Flag,
  parameters: { layout: "centered" },
  args: { country: "NG", alt: "Nigeria", class: "" },
};
export const Playground = {};
export const Circle = { args: { class: "size-10 aspect-square rounded-full" } };
export const Missing = { args: { country: "ZZ", alt: "Unavailable" } };
