import Flag from "../../registry/flag/react/Flag.jsx";
export default {
  title: "Components/Flag",
  component: Flag,
  parameters: { layout: "centered" },
  args: { country: "NG", alt: "Nigeria", className: "" },
};
export const Playground = {};
export const Circle = {
  args: { className: "size-10 aspect-square rounded-full" },
};
export const Missing = {
  args: { country: "ZZ", alt: "Unavailable", children: "?" },
};
