import Avatar from "../../registry/avatar/react/Avatar.jsx";
import { avatarImages } from "../shared/avatar-images.js";

function AvatarExample({ image, alt, fallback, className }) {
  return (
    <Avatar
      src={image ? avatarImages.ada : ""}
      alt={alt}
      className={className}
    >
      {fallback}
    </Avatar>
  );
}

const meta = {
  title: "Components/Avatar",
  component: AvatarExample,
  parameters: { layout: "centered" },
  args: {
    image: true,
    alt: "Ada Okafor",
    fallback: "AO",
    className: "",
  },
  argTypes: {
    image: { control: "boolean" },
    alt: { control: "text" },
    fallback: { control: "text" },
    className: { control: "text" },
  },
};

export default meta;

export const Playground = {};

export const Apps = {
  parameters: { layout: "centered", controls: { disable: true } },
  render: () => (
    <div className="grid w-[min(42rem,90vw)] gap-4 rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-950">
      <a
        href="#profile"
        className="flex items-center gap-3 rounded-lg p-2 no-underline hover:bg-gray-50 dark:hover:bg-gray-900"
      >
        <Avatar src={avatarImages.kelvin} alt="" className="size-11">
          KO
        </Avatar>
        <span>
          <strong className="block text-sm">Kelvin Omereshone</strong>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            Creator account
          </span>
        </span>
      </a>
      <button
        type="button"
        className="flex cursor-pointer items-center gap-3 rounded-lg border border-gray-200 px-3 py-2 text-left hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-900"
      >
        <Avatar src="" alt="" className="size-7 rounded-md bg-gray-950 text-xs text-white dark:bg-white dark:text-gray-950">
          SW
        </Avatar>
        <span className="text-sm font-medium">Slipway</span>
        <span aria-hidden="true" className="ml-auto">⌄</span>
      </button>
    </div>
  ),
};
