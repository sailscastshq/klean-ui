import Breadcrumb from "../../registry/breadcrumb/react/Breadcrumb.jsx";
import { contract } from "../shared/contract.js";

const items = contract.breadcrumbItems;

function BreadcrumbExample({ items }) {
  function stopNavigation(event) {
    if (event.target.closest?.("a")) event.preventDefault();
  }

  return (
    <div
      className="w-[min(90vw,48rem)]"
      onClickCapture={stopNavigation}
    >
      <Breadcrumb items={items} />
    </div>
  );
}

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
