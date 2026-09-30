import { flagSource } from "../../registry/flag/shared/flags.js";
import Flag from "../../registry/flag/react/Flag.jsx";
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
    className: { control: "text" },
  },
  args: { country: "NG", src: "", alt: "", className: "" },
};
export const Playground = {};
export const Circle = {
  args: { className: "size-10 aspect-square rounded-full" },
};
export const Missing = {
  args: { country: "ZZ", alt: "Unavailable", children: "?" },
};

export const Sizes = {
  render: () => (
    <div className="flex items-center gap-4">
      {["w-5", "w-6", "w-8", "w-10", "w-12"].map((className) => (
        <Flag
          key={className}
          country="NG"
          alt="Nigeria"
          className={className}
        />
      ))}
    </div>
  ),
};

export const CustomSource = {
  args: { country: "NG", src: flagSource("KE"), alt: "Kenya" },
};
