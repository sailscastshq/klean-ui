import { useState } from "react";
import DatePicker from "../../registry/date-picker/react/DatePicker.jsx";

const meta = {
  title: "Components/Date Picker",
  component: DatePicker,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  args: {
    defaultValue: "2026-08-12",
    min: "2026-08-01",
    name: "dueAt",
    required: true,
    disabled: false,
    readOnly: false,
    className: "w-72",
  },
};

export default meta;

export const Playground = {
  render: (args) => {
    const [value, setValue] = useState(args.defaultValue);
    return (
      <div className="grid gap-2">
        <label htmlFor="react-date-picker" className="text-sm font-medium">
          Due date
        </label>
        <DatePicker
          {...args}
          id="react-date-picker"
          value={value}
          onValueChange={setValue}
        />
      </div>
    );
  },
};
