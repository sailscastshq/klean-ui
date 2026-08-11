import { useEffect, useState } from "react";
import { expect, userEvent, within } from "storybook/test";
import Tabs from "../../registry/tabs/react/Tabs.jsx";

const values = ["overview", "activity", "settings"];
const tabClass = [
  "min-h-11 shrink-0 cursor-pointer border-b-2 border-transparent px-1 py-2 text-sm font-medium text-gray-500 outline-none",
  "hover:text-gray-950 focus-visible:ring-2 focus-visible:ring-gray-950 focus-visible:ring-offset-2",
  "data-[state=active]:border-gray-950 data-[state=active]:text-gray-950",
  "disabled:cursor-not-allowed disabled:opacity-40 dark:text-gray-400 dark:hover:text-white dark:focus-visible:ring-white dark:data-[state=active]:border-white dark:data-[state=active]:text-white",
].join(" ");

function TabsExample({ initialValue, orientation, activation }) {
  const [active, setActive] = useState(initialValue);
  useEffect(() => setActive(initialValue), [initialValue]);

  return (
    <Tabs
      value={active}
      onValueChange={setActive}
      aria-label="Project sections"
      orientation={orientation}
      activation={activation}
      className="w-[min(38rem,calc(100vw-2rem))] text-gray-950 dark:text-white"
    >
      <div
        className={
          orientation === "vertical"
            ? "flex w-36 flex-col items-stretch gap-1 border-r border-gray-200 pr-3 dark:border-gray-800"
            : "flex gap-6 overflow-x-auto border-b border-gray-200 dark:border-gray-800"
        }
      >
        {values.map((item) => (
          <button
            key={item}
            type="button"
            data-value={item}
            className={`${tabClass} ${
              orientation === "vertical"
                ? "justify-start border-b-0 border-l-2 px-3 text-left data-[state=active]:border-l-gray-950 dark:data-[state=active]:border-l-white"
                : ""
            }`}
          >
            {item[0].toUpperCase() + item.slice(1)}
          </button>
        ))}
      </div>
      <section
        data-value="overview"
        className="min-h-36 py-6 outline-none focus-visible:ring-2"
      >
        <h2 className="text-lg font-semibold">Project overview</h2>
        <p className="mt-2 text-sm leading-6 text-gray-500">
          Health, ownership, and the next deploy in one instant panel.
        </p>
      </section>
      <section
        data-value="activity"
        className="min-h-36 py-6 outline-none focus-visible:ring-2"
      >
        <h2 className="text-lg font-semibold">Recent activity</h2>
        <p className="mt-2 text-sm leading-6 text-gray-500">
          Seven deployments completed this week.
        </p>
      </section>
      <section
        data-value="settings"
        className="min-h-36 py-6 outline-none focus-visible:ring-2"
      >
        <h2 className="text-lg font-semibold">Project settings</h2>
        <p className="mt-2 text-sm leading-6 text-gray-500">
          Configuration remains ordinary application markup.
        </p>
      </section>
    </Tabs>
  );
}

const meta = {
  title: "Components/Tabs",
  component: TabsExample,
  parameters: { layout: "centered" },
  args: {
    initialValue: "overview",
    orientation: "horizontal",
    activation: "automatic",
  },
  argTypes: {
    initialValue: { control: "select", options: values },
    orientation: {
      control: "inline-radio",
      options: ["horizontal", "vertical"],
    },
    activation: {
      control: "inline-radio",
      options: ["automatic", "manual"],
    },
  },
};

export default meta;

export const Playground = {
  parameters: {
    controls: { include: ["initialValue", "orientation", "activation"] },
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const tabs = canvas.getAllByRole("tab");
    const activeIndex = values.indexOf(args.initialValue);

    await expect(tabs[activeIndex]).toHaveAttribute("aria-selected", "true");
    tabs[activeIndex].focus();
    await userEvent.keyboard(
      args.orientation === "vertical" ? "{ArrowDown}" : "{ArrowRight}",
    );
    const next = tabs[(activeIndex + 1) % tabs.length];
    await expect(next).toHaveFocus();
    if (args.activation === "manual") await userEvent.keyboard("{Enter}");
    await expect(next).toHaveAttribute("aria-selected", "true");
  },
};

function DynamicWorkspace() {
  const [active, setActive] = useState("customers");
  const [openTabs, setOpenTabs] = useState([
    "schema.sql",
    "customers",
    "invoices",
    "deploys",
  ]);

  return (
    <Tabs
      value={active}
      onValueChange={setActive}
      aria-label="Open workspace results"
      className="relative w-[min(46rem,calc(100vw-2rem))] border border-gray-300 bg-white shadow-[5px_5px_0_#111] dark:border-gray-700 dark:bg-gray-950 dark:shadow-[5px_5px_0_#fff]"
    >
      <div className="flex max-w-full overflow-x-auto border-b border-gray-300 dark:border-gray-700">
        {openTabs.map((label) => (
          <button
            key={label}
            type="button"
            data-value={label}
            className="min-h-11 w-36 shrink-0 cursor-pointer truncate border-r border-gray-300 px-4 pr-10 text-left font-mono text-xs text-gray-600 outline-none focus-visible:ring-2 focus-visible:ring-inset data-[state=active]:bg-gray-950 data-[state=active]:text-white dark:border-gray-700 dark:text-gray-400 dark:data-[state=active]:bg-white dark:data-[state=active]:text-gray-950"
          >
            {label}
          </button>
        ))}
      </div>
      <div className="pointer-events-none absolute left-0 top-0 flex">
        {openTabs.map((label) => (
          <span
            key={label}
            className="flex min-h-11 w-36 shrink-0 items-center justify-end pr-1"
          >
            <button
              type="button"
              aria-label={`Close ${label}`}
              className={`pointer-events-auto grid size-9 cursor-pointer place-items-center outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-red-600 ${
                active === label
                  ? "text-gray-300 hover:text-white dark:text-gray-600 dark:hover:text-black"
                  : "text-gray-600 hover:bg-red-50 hover:text-red-700 dark:text-gray-400 dark:hover:bg-red-950/30"
              }`}
              onClick={() =>
                setOpenTabs((items) => items.filter((item) => item !== label))
              }
            >
              ×
            </button>
          </span>
        ))}
      </div>
      {openTabs.map((label) => (
        <div
          key={label}
          data-value={label}
          className="min-h-48 p-6 font-mono text-sm outline-none focus-visible:ring-2 focus-visible:ring-inset"
        >
          {label}
        </div>
      ))}
    </Tabs>
  );
}

export const Workspace = {
  render: () => <DynamicWorkspace />,
  parameters: { controls: { disable: true } },
};
