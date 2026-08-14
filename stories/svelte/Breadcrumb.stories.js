import BreadcrumbExample from "./BreadcrumbExample.svelte";
import { contract } from "../shared/contract.js";

const items = contract.breadcrumbItems;

const meta = {
  title: "Components/Breadcrumb",
  component: BreadcrumbExample,
  parameters: { layout: "centered" },
  args: { items },
  argTypes: { items: { control: "object" } },
};

export default meta;

export const Playground = {
  parameters: { controls: { include: ["items"] } },
};
