import { useState } from "react";
import DateRangePicker from "../../registry/date-range-picker/react/DateRangePicker.jsx";

const meta = {
  title: "Components/Date Range Picker",
  component: DateRangePicker,
  parameters: { layout: "centered" },
  args: {
    name: "period",
    label: "Report period",
    min: "2026-01-01",
    max: "2026-12-31",
    required: true,
    disabled: false,
    readOnly: false,
    className: "w-[min(38rem,calc(100vw-2rem))]",
  },
};

export default meta;

export const Playground = {
  render: (args) => {
    const [value, setValue] = useState({
      start: "2026-08-08",
      end: "2026-08-12",
    });
    return <DateRangePicker {...args} value={value} onValueChange={setValue} />;
  },
};
