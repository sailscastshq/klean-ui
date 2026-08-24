import { useEffect, useState } from "react";
import BulkActions from "../../registry/bulk-actions/react/BulkActions.jsx";

function Example({ count, label, busy, clearLabel, className }) {
  const [selectedCount, setSelectedCount] = useState(count);

  useEffect(() => setSelectedCount(count), [count]);

  return (
    <div className="w-[min(42rem,calc(100vw-2rem))]">
      <label className="mb-3 flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
        <input
          data-bulk-actions-focus
          type="checkbox"
          checked={selectedCount > 0}
          readOnly
          className="size-4"
        />
        Select all services on this page
      </label>
      <BulkActions
        count={selectedCount}
        label={label}
        busy={busy}
        clearLabel={clearLabel}
        className={className}
        onClear={() => setSelectedCount(0)}
      >
        <button
          type="button"
          disabled={busy}
          className="min-h-9 cursor-pointer rounded-md bg-gray-950 px-3 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-gray-950"
        >
          Export
        </button>
      </BulkActions>
    </div>
  );
}

const meta = {
  title: "Components/BulkActions",
  component: Example,
  parameters: { layout: "centered" },
  args: {
    count: 3,
    label: "Actions for selected services",
    busy: false,
    clearLabel: "Clear selection",
    className: "",
  },
  argTypes: {
    count: { control: { type: "number", min: 0, step: 1 } },
    label: { control: "text" },
    busy: { control: "boolean" },
    clearLabel: { control: "text" },
    className: { control: "text" },
  },
};

export default meta;

export const Playground = {};
