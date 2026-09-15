import AvatarGroup from "../../registry/avatar-group/react/AvatarGroup.jsx";
import { avatarGroupPeople } from "../shared/avatar-group-people.js";

function AvatarGroupExample({ max, total, avatarClassName, className }) {
  return (
    <AvatarGroup
      items={avatarGroupPeople}
      max={max}
      total={total}
      avatarClassName={avatarClassName}
      className={className}
      aria-label="Maintainers"
    />
  );
}

const meta = {
  title: "Components/AvatarGroup",
  component: AvatarGroupExample,
  parameters: { layout: "centered" },
  args: { max: 4, total: 42, avatarClassName: "", className: "" },
  argTypes: {
    max: { control: { type: "number", min: 0, max: 6 } },
    total: { control: { type: "number", min: 0 } },
    avatarClassName: { control: "text" },
    className: { control: "text" },
  },
};

export default meta;

export const Playground = {};

export const CustomOverflow = {
  parameters: { controls: { disable: true } },
  render: () => (
    <AvatarGroup
      items={avatarGroupPeople}
      max={3}
      total={9}
      aria-label="Team"
      renderOverflow={(count) => (
        <a
          href="#team"
          className="ml-3 self-center text-sm font-medium underline underline-offset-4"
        >
          and {count} others
        </a>
      )}
    />
  ),
};
