import { useRef, useState } from "react";
import { expect, userEvent, within } from "storybook/test";
import Sidebar from "../../registry/sidebar/react/Sidebar.jsx";

const links = ["Projects", "Deployments", "Lookout", "Settings"];

function Navigation({ active = "Projects" }) {
  return (
    <nav aria-label="Workspace" className="flex-1 px-3 py-3">
      <ul className="grid gap-1 text-sm">
        {links.map((label) => (
          <li key={label}>
            <a
              href={`#${label.toLowerCase()}`}
              aria-current={active === label ? "page" : undefined}
              className={`flex min-h-11 cursor-pointer items-center gap-3 rounded-lg px-3 py-2 no-underline transition-colors ${
                active === label
                  ? "bg-gray-200 font-medium text-gray-950 dark:bg-gray-800 dark:text-white"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-950 dark:text-gray-400 dark:hover:bg-gray-900 dark:hover:text-white"
              }`}
            >
              <span aria-hidden="true" className="text-xs">
                ◫
              </span>
              {label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

function Example({ defaultOpen, remember, className }) {
  const sidebar = useRef(null);
  const [open, setOpen] = useState(undefined);

  return (
    <div className="flex min-h-136 overflow-hidden bg-white text-gray-950 dark:bg-gray-950 dark:text-white">
      <Sidebar
        ref={sidebar}
        id="react-playground-sidebar"
        defaultOpen={defaultOpen}
        remember={remember}
        onOpenChange={setOpen}
        aria-label="Project navigation"
        className={`border-r border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-950 ${className}`}
      >
        <div className="flex h-full w-64 flex-col">
          <div className="flex min-h-16 items-center gap-3 px-4">
            <span className="grid size-8 place-items-center rounded-lg bg-gray-950 text-xs font-semibold text-white dark:bg-white dark:text-gray-950">
              K
            </span>
            <strong className="text-sm">Klean workspace</strong>
          </div>
          <Navigation />
        </div>
      </Sidebar>
      <main className="min-w-0 flex-1 px-5 py-8 sm:px-8">
        <button
          type="button"
          aria-controls="react-playground-sidebar"
          aria-expanded={Boolean(open)}
          className="inline-flex min-h-11 cursor-pointer items-center rounded-lg bg-gray-950 px-4 text-sm font-medium text-white hover:bg-gray-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-950 dark:bg-white dark:text-gray-950 dark:hover:bg-gray-200 dark:focus-visible:outline-white"
          onClick={() => sidebar.current?.toggle()}
        >
          {open ? "Hide navigation" : "Show navigation"}
        </button>
        <h1 className="mt-12 text-4xl font-semibold tracking-[-0.04em]">
          Native React source. The same contract.
        </h1>
        <p className="mt-4 max-w-xl text-sm leading-6 text-gray-600 dark:text-gray-400">
          No provider, router adapter, item schema, or visual variant is
          required.
        </p>
      </main>
    </div>
  );
}

const meta = {
  title: "Components/Sidebar",
  component: Example,
  parameters: { layout: "fullscreen" },
  args: {
    defaultOpen: true,
    remember: false,
    className: "w-64 data-[state=closed]:w-0 data-[state=closed]:opacity-0",
  },
  argTypes: {
    defaultOpen: { control: "boolean" },
    remember: { control: "boolean" },
    className: { control: "text" },
  },
};

export default meta;

export const Playground = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = await canvas.findByRole("button", {
      name: "Hide navigation",
    });
    const sidebar = canvasElement.querySelector('[data-slot="sidebar"]');

    await userEvent.click(trigger);
    await expect(sidebar).toHaveAttribute("data-state", "closed");
    await expect(sidebar).toHaveAttribute("inert");
  },
};

export const Slipway = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex min-h-152 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl dark:border-gray-800 dark:bg-gray-950">
      <Sidebar
        id="react-slipway-sidebar"
        remember={false}
        aria-label="Slipway navigation"
        className="w-60 border-r border-gray-200 bg-gray-50 data-[state=closed]:w-0 dark:border-gray-800 dark:bg-gray-950"
      >
        <div className="flex h-full w-60 flex-col">
          <header className="flex min-h-16 items-center gap-3 px-4">
            <span className="grid size-8 place-items-center rounded-lg bg-gray-950 text-xs font-bold text-white dark:bg-white dark:text-gray-950">
              S
            </span>
            <strong className="text-sm">Slipway Labs</strong>
          </header>
          <Navigation />
        </div>
      </Sidebar>
      <main className="min-w-0 flex-1 p-8">
        <p className="text-sm text-gray-500">Projects / Sailscasts API</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">Services</h1>
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {["web", "worker"].map((service) => (
            <article
              key={service}
              className="rounded-xl border border-gray-200 p-5 dark:border-gray-800"
            >
              <div className="flex items-center justify-between">
                <h2 className="font-medium">{service}</h2>
                <span className="size-2 rounded-full bg-emerald-500">
                  <span className="sr-only">Running</span>
                </span>
              </div>
              <p className="mt-5 font-mono text-xs text-gray-500">
                fra · node 24 · main
              </p>
            </article>
          ))}
        </div>
      </main>
    </div>
  ),
};
