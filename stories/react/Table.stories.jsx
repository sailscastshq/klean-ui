import Table from "../../registry/table/react/Table.jsx";

const rows = [
  { service: "api", status: "Healthy", memory: "384 MB" },
  { service: "worker", status: "Deploying", memory: "192 MB" },
];

function TableExample({ caption, className }) {
  return (
    <div className="w-[min(92vw,42rem)] overflow-x-auto rounded-lg border border-gray-200">
      <Table className={className}>
        <caption className="caption-top px-4 py-3 text-left text-base font-semibold">
          {caption}
        </caption>
        <thead className="bg-gray-50 text-xs uppercase tracking-wider text-gray-600">
          <tr>
            <th scope="col" className="px-4 py-3 font-medium">
              Service
            </th>
            <th scope="col" className="px-4 py-3 font-medium">
              Status
            </th>
            <th scope="col" className="px-4 py-3 text-right font-medium">
              Memory
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {rows.map((row) => (
            <tr key={row.service}>
              <th scope="row" className="px-4 py-3 font-mono font-medium">
                {row.service}
              </th>
              <td className="px-4 py-3">{row.status}</td>
              <td className="px-4 py-3 text-right tabular-nums">
                {row.memory}
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
}

const meta = {
  title: "Components/Table",
  component: TableExample,
  parameters: { layout: "centered" },
  args: {
    caption: "Production services",
    className: "min-w-lg",
  },
  argTypes: {
    caption: { control: "text" },
    className: { control: "text" },
  },
};

export default meta;

export const Playground = {};
