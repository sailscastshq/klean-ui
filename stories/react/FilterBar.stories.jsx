import { useState } from "react";
import FilterBar from "../../registry/filter-bar/react/FilterBar.jsx";

function FilterBarExample({ label, busy, className }) {
  const [filters, setFilters] = useState({ status: "running" });
  return (
    <div className="w-[min(48rem,calc(100vw-2rem))]">
      <FilterBar
        value={filters}
        onChange={setFilters}
        label={label}
        busy={busy}
        className={className}
      >
        {(filter) => (
          <>
            <label htmlFor="react-filter-status" className="sr-only">
              Status
            </label>
            <select
              id="react-filter-status"
              value={filter.draft.status ?? ""}
              className="min-h-11 cursor-pointer rounded-lg border border-gray-200 bg-white px-3 text-sm dark:border-gray-700 dark:bg-gray-950"
              onChange={(event) => filter.update("status", event.target.value)}
            >
              <option value="">Any status</option>
              <option value="running">Running</option>
              <option value="stopped">Stopped</option>
            </select>
            <button
              {...filter.applyProps}
              className="min-h-11 cursor-pointer rounded-lg bg-gray-950 px-4 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40 dark:bg-white dark:text-gray-950"
            >
              Apply
            </button>
            <button
              {...filter.cancelProps}
              className="min-h-11 cursor-pointer rounded-lg px-3 text-sm disabled:cursor-not-allowed disabled:opacity-40"
            >
              Cancel
            </button>
            {filter.entries.map(([key, value]) => (
              <button
                key={key}
                {...filter.removeProps(key)}
                className="min-h-9 cursor-pointer rounded-full bg-gray-100 px-3 text-sm dark:bg-gray-800"
              >
                {key}: {value} ×
              </button>
            ))}
          </>
        )}
      </FilterBar>
    </div>
  );
}

const meta = {
  title: "Components/Filter Bar",
  component: FilterBarExample,
  parameters: { layout: "centered" },
  args: {
    label: "Service filters",
    busy: false,
    className:
      "rounded-xl border border-gray-200 bg-white p-3 shadow-sm dark:border-gray-800 dark:bg-gray-950",
  },
  argTypes: {
    label: { control: "text" },
    busy: { control: "boolean" },
    className: { control: "text" },
  },
};

export default meta;
export const Playground = {};
