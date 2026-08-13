import PaginationExample from "./PaginationExample.svelte";

const meta = {
  title: "Components/Pagination",
  component: PaginationExample,
  parameters: { layout: "centered" },
  args: { page: 4, pages: 12 },
  argTypes: {
    page: { control: { type: "number", min: 1, step: 1 } },
    pages: { control: { type: "number", min: 1, step: 1 } },
  },
};

export default meta;

export const Playground = {};
