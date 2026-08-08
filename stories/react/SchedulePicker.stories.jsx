import { useState } from "react";
import SchedulePicker from "../../registry/schedule-picker/react/SchedulePicker.jsx";

const meta = {
  title: "Components/Schedule Picker",
  component: SchedulePicker,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  args: {
    name: "publishAt",
    timeZone: "Africa/Lagos",
    minuteStep: 15,
    required: true,
    disabled: false,
    readOnly: false,
    className: "w-[min(34rem,calc(100vw-2rem))]",
  },
};

export default meta;

export const Playground = {
  render: (args) => {
    const [value, setValue] = useState("");
    return (
      <div className="grid gap-2">
        <label htmlFor="react-schedule-picker" className="text-sm font-medium">
          Publish at
        </label>
        <SchedulePicker
          {...args}
          id="react-schedule-picker"
          value={value}
          onValueChange={setValue}
        />
        <output className="break-all font-mono text-xs text-gray-500">
          {value || "No committed instant yet"}
        </output>
        <button
          type="button"
          className="mt-2 min-h-11 justify-self-start rounded-md border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-950"
        >
          Continue
        </button>
      </div>
    );
  },
};
