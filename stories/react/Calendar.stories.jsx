import { useState } from "react";
import Calendar from "../../registry/calendar/react/Calendar.jsx";

const meta = {
  title: "Components/Calendar",
  component: Calendar,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  args: {
    defaultValue: "2026-08-12",
    min: "2026-08-01",
    max: "2026-12-31",
    locale: "en-NG",
    disabled: false,
    readOnly: false,
    className: "",
  },
};

export default meta;

export const Playground = {
  render: (args) => {
    const [value, setValue] = useState(args.defaultValue);
    return <Calendar {...args} value={value} onValueChange={setValue} />;
  },
};
