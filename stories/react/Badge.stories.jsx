import Badge from "../../registry/badge/react/Badge.jsx";

function BadgeExample({ label, className }) {
  return <Badge className={className}>{label}</Badge>;
}

const meta = {
  title: "Components/Badge",
  component: BadgeExample,
  parameters: { layout: "centered" },
  args: { label: "Paid", className: "" },
  argTypes: {
    label: { control: "text" },
    className: { control: "text" },
  },
};

export default meta;

export const Playground = {};

export const Notifications = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex items-center gap-8">
      <Badge className="bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200">
        <span
          aria-hidden="true"
          className="size-1.5 rounded-full bg-emerald-500"
        />
        Healthy
      </Badge>
      <button
        type="button"
        aria-label="Notifications, 3 unread"
        className="relative size-11 cursor-pointer rounded-full bg-gray-950 text-white dark:bg-white dark:text-gray-950"
      >
        <span aria-hidden="true">◎</span>
        <Badge
          aria-hidden="true"
          className="absolute -right-1 -top-1 min-w-5 justify-center border-white bg-red-600 px-1 text-[10px] text-white dark:border-gray-950 dark:bg-red-500"
        >
          3
        </Badge>
      </button>
    </div>
  ),
};
