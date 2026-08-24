import EmptyStateExample from "./EmptyStateExample.svelte";

const meta = {
  title: "Components/EmptyState",
  component: EmptyStateExample,
  parameters: { layout: "centered" },
  args: {
    as: "section",
    title: "No projects yet",
    description: "Create your first project to deploy an application.",
  },
  argTypes: {
    as: {
      control: "select",
      options: ["div", "section", "article"],
    },
    title: { control: "text" },
    description: { control: "text" },
  },
};

export default meta;

export const Playground = {};
