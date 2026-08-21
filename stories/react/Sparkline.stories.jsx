import Sparkline from "../../registry/sparkline/react/Sparkline.jsx";

const activity = [
  { label: "12:00", value: 12 },
  { label: "12:10", value: 18 },
  { label: "12:20", value: 15 },
  { label: "12:30", value: 32 },
  { label: "12:40", value: 28 },
  { label: "12:50", value: 44 },
  { label: "13:00", value: 36 },
];

function SparklineExample({ label, className }) {
  return (
    <div className="flex items-end gap-4 rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-950">
      <div>
        <p className="text-xs text-gray-500 dark:text-gray-400">Requests</p>
        <p className="mt-1 text-3xl font-semibold tabular-nums">2,418</p>
      </div>
      <Sparkline
        data={activity}
        label={label || undefined}
        className={className}
      />
    </div>
  );
}

const meta = {
  title: "Components/Sparkline",
  component: SparklineExample,
  parameters: { layout: "centered" },
  args: {
    label: "",
    className: "h-8 w-40 text-gray-950 dark:text-white",
  },
  argTypes: {
    label: { control: "text" },
    className: { control: "text" },
  },
};

export default meta;

export const Playground = {};

export const States = {
  render: () => (
    <div className="grid gap-5 sm:grid-cols-2">
      <Sparkline data={activity} className="h-10 w-64" />
      <Sparkline
        data={[{ label: "Now", value: 7 }]}
        label="One sample: 7"
        className="h-10 w-64 text-violet-700 dark:text-violet-300"
      />
    </div>
  ),
};
