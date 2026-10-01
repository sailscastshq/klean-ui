import MultiSelect from "../../registry/multi-select/react/MultiSelect.jsx";
const options = [
  { value: "design", label: "Design" },
  { value: "engineering", label: "Engineering", disabled: true },
  { value: "support", label: "Support" },
  { value: "operations", label: "Operations" },
];
export default {
  title: "Components/MultiSelect",
  component: MultiSelect,
  parameters: { layout: "centered" },
  args: {
    options,
    defaultValue: ["design"],
    name: "teams",
    required: true,
    "aria-label": "Teams",
  },
  argTypes: {
    value: { control: false },
    defaultValue: { control: false },
    options: { control: false },
    className: { control: "text" },
  },
};
export const Playground = {
  render: (args) => (
    <form className="grid w-80 max-w-full gap-3">
      <MultiSelect {...args} />
      <button type="reset">Reset</button>
      <button type="submit">Submit</button>
    </form>
  ),
};
export const Empty = { ...Playground, args: { options: [], defaultValue: [] } };
export const Disabled = { ...Playground, args: { disabled: true } };

export const LongList = {
  ...Playground,
  args: {
    defaultValue: [],
    options: Array.from({ length: 60 }, (_, index) => ({
      value: String(index),
      label: `Option ${index + 1}`,
    })),
  },
};
