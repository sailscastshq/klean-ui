import { useEffect, useState } from "react";
import Pagination from "../../registry/pagination/react/Pagination.jsx";

function PaginationExample({ page, pages }) {
  const [current, setCurrent] = useState(page);

  useEffect(() => setCurrent(page), [page]);

  function navigate(event) {
    const link = event.target.closest?.("a[data-page]");
    if (!link) return;
    event.preventDefault();
    setCurrent(Number(link.dataset.page));
  }

  return (
    <div className="w-[min(92vw,46rem)]" onClickCapture={navigate}>
      <Pagination page={current} pages={pages} />
    </div>
  );
}

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
