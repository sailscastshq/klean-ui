import { useMemo, useState } from "react";
import Checkbox from "../../registry/checkbox/react/Checkbox.jsx";
import DataTable from "../../registry/data-table/react/DataTable.jsx";

const services = [
  {
    id: 1,
    service: "api",
    owner: "Platform",
    status: "Healthy",
    region: "fra1",
  },
  {
    id: 2,
    service: "worker",
    owner: "Billing",
    status: "Deploying",
    region: "iad1",
  },
  {
    id: 3,
    service: "mail",
    owner: "Growth",
    status: "Attention",
    region: "sin1",
  },
];

function BridgeTable({ busy = false, className, tableClassName }) {
  const [selected, setSelected] = useState([]);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("service ASC");
  const rows = useMemo(() => {
    const query = search.trim().toLowerCase();
    const filtered = services.filter((row) =>
      [row.service, row.owner, row.status, row.region]
        .join(" ")
        .toLowerCase()
        .includes(query),
    );
    const [field, direction] = sort.split(" ");
    return filtered.toSorted((left, right) => {
      const result = String(left[field]).localeCompare(String(right[field]));
      return direction === "ASC" ? result : -result;
    });
  }, [search, sort]);

  function ariaSort(field) {
    const [active, direction] = sort.split(" ");
    if (active !== field) return undefined;
    return direction === "ASC" ? "ascending" : "descending";
  }

  function toggleSort(field) {
    const [active, direction] = sort.split(" ");
    setSort(
      `${field} ${active === field && direction === "ASC" ? "DESC" : "ASC"}`,
    );
  }

  return (
    <section className="min-h-svh bg-gray-950 px-4 py-12 text-white sm:px-8">
      <div className="mx-auto max-w-5xl">
        <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">
              Bridge services
            </h1>
            <p className="mt-2 text-sm text-gray-400">
              Native rows, durable server intent, application-owned cells.
            </p>
          </div>
          <a
            href="#new"
            className="inline-flex min-h-11 items-center justify-center rounded-md bg-white px-4 text-sm font-medium text-gray-950 no-underline"
          >
            New service
          </a>
        </header>

        <div className="mt-8 flex flex-col gap-3 border-y border-gray-800 py-4 sm:flex-row sm:items-center sm:justify-between">
          <input
            value={search}
            onChange={(event) => setSearch(event.currentTarget.value)}
            type="search"
            aria-label="Search services"
            placeholder="Search services..."
            className="min-h-11 rounded-md border border-gray-700 bg-gray-900 px-3 text-base text-white outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:w-72"
          />
          <span className="text-sm text-gray-400">
            {selected.length ? `${selected.length} selected · ` : ""}
            {rows.length} records
          </span>
        </div>

        <DataTable
          rows={rows}
          selected={selected}
          onSelectedChange={setSelected}
          busy={busy}
          className={className}
          tableClassName={tableClassName}
        >
          {(table) => (
            <>
              <caption className="sr-only">Bridge service records</caption>
              <thead className="border-b border-gray-800 bg-gray-900 text-xs text-gray-400">
                <tr>
                  <th scope="col" className="w-12 px-4 py-3">
                    <Checkbox
                      {...table.pageSelection(
                        "Select all services on this page",
                      )}
                      className="text-white focus-visible:outline-white"
                    />
                  </th>
                  <th
                    scope="col"
                    aria-sort={ariaSort("service")}
                    className="px-4 py-3 text-left font-medium"
                  >
                    <button
                      type="button"
                      className="cursor-pointer hover:text-white"
                      onClick={() => toggleSort("service")}
                    >
                      Service ↕
                    </button>
                  </th>
                  <th scope="col" className="px-4 py-3 text-left font-medium">
                    Owner
                  </th>
                  <th
                    scope="col"
                    aria-sort={ariaSort("status")}
                    className="px-4 py-3 text-left font-medium"
                  >
                    <button
                      type="button"
                      className="cursor-pointer hover:text-white"
                      onClick={() => toggleSort("status")}
                    >
                      Status ↕
                    </button>
                  </th>
                  <th scope="col" className="px-4 py-3 text-left font-medium">
                    Region
                  </th>
                  <th scope="col" className="w-16 px-4 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-900 bg-gray-950">
                {rows.length ? (
                  rows.map((row) => (
                    <tr key={row.id} className="hover:bg-white/5">
                      <td className="px-4 py-3">
                        <Checkbox
                          {...table.rowSelection(row, `Select ${row.service}`)}
                          className="text-white focus-visible:outline-white"
                        />
                      </td>
                      <th
                        scope="row"
                        className="px-4 py-3 text-left font-medium"
                      >
                        <a
                          href={`#${row.id}`}
                          className="text-white no-underline hover:underline"
                        >
                          {row.service}
                        </a>
                      </th>
                      <td className="px-4 py-3 text-gray-300">{row.owner}</td>
                      <td className="px-4 py-3">{row.status}</td>
                      <td className="px-4 py-3 font-mono text-xs text-gray-400">
                        {row.region}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <a
                          href={`#actions-${row.id}`}
                          aria-label={`Actions for ${row.service}`}
                          className="inline-grid size-10 place-items-center text-gray-400 no-underline"
                        >
                          ⋯
                        </a>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-16 text-center text-sm text-gray-400"
                    >
                      No matching services.
                    </td>
                  </tr>
                )}
              </tbody>
            </>
          )}
        </DataTable>
      </div>
    </section>
  );
}

const meta = {
  title: "Components/DataTable",
  component: BridgeTable,
  parameters: { layout: "fullscreen" },
  args: {
    busy: false,
    className: "border-x border-b border-gray-800",
    tableClassName: "min-w-180 text-gray-100 dark:text-gray-100",
  },
  argTypes: {
    busy: { control: "boolean" },
    className: { control: "text" },
    tableClassName: { control: "text" },
  },
};

export default meta;

export const Playground = {};
export const Bridge = { parameters: { controls: { disable: true } } };
