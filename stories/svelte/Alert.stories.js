import AlertExample from "./AlertExample.svelte";
import AlertChecklist from "./AlertChecklist.svelte";

const meta = {
  title: "Components/Alert",
  component: AlertExample,
  parameters: { layout: "centered" },
  args: {
    as: "div",
    role: "",
    heading: "Changes are saved automatically",
    message: "You can leave this page and return whenever you are ready.",
    class: "max-w-xl",
  },
  argTypes: {
    as: { control: "select", options: ["div", "section", "aside"] },
    role: { control: "select", options: ["", "note", "status", "alert"] },
    heading: { control: "text" },
    message: { control: "text" },
    class: { control: "text" },
  },
};

export default meta;

export const Playground = {};

export const Checklist = {
  render: () => ({ Component: AlertChecklist }),
};
