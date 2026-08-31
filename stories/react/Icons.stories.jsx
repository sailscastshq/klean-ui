import { iconComponents, iconEntries, iconNames } from "./generated/icons.js";

const Rocket = iconComponents.Rocket;
const Trash = iconComponents.Trash;

const groupDefinitions = [
  {
    id: "shared",
    title: "Shared application language",
    entries: iconEntries.filter(
      ({ applications }) => applications.length === 2,
    ),
  },
  {
    id: "hagfish",
    title: "Hagfish application set",
    entries: iconEntries.filter(
      ({ applications }) =>
        applications.length === 1 && applications[0] === "hagfish",
    ),
  },
  {
    id: "slipway",
    title: "Slipway application set",
    entries: iconEntries.filter(
      ({ applications }) =>
        applications.length === 1 && applications[0] === "slipway",
    ),
  },
  {
    id: "signature",
    title: "Klean signature",
    entries: iconEntries.filter(
      ({ applications }) => applications.length === 0,
    ),
  },
];

const meta = {
  title: "Components/Icons",
  component: Rocket,
  parameters: { layout: "centered" },
  args: { icon: "Rocket", size: 24, color: "#111827", strokeWidth: 1.5 },
  argTypes: {
    icon: { control: "select", options: iconNames },
    size: { control: { type: "range", min: 12, max: 64, step: 1 } },
    color: { control: "color" },
    strokeWidth: { control: { type: "range", min: 1, max: 2.5, step: 0.25 } },
  },
};

export default meta;

export function Playground({ icon, size, color, strokeWidth }) {
  const Icon = iconComponents[icon];
  return (
    <div className="grid min-h-44 min-w-72 place-items-center rounded-3xl bg-gray-50 p-10 shadow-sm dark:bg-gray-950">
      <Icon style={{ color, fontSize: size }} strokeWidth={strokeWidth} />
    </div>
  );
}

export function ProofSet() {
  return (
    <main className="klean-story-canvas min-h-screen px-5 py-14 sm:px-8 lg:px-12 lg:py-20">
      <header className="max-w-3xl">
        <h1 className="text-balance text-4xl font-semibold tracking-tighter sm:text-5xl">
          The application vocabulary in native React.
        </h1>
        <p className="mt-5 max-w-2xl text-pretty text-base leading-7 text-klean-muted">
          Ninety-seven audited product concepts and Klean&apos;s redesigned
          Rocket, delivered as ordinary forwardRef SVG components.
        </p>
      </header>
      {groupDefinitions.map((group) => (
        <section key={group.id} className="mt-14 max-w-screen-2xl">
          <div className="flex items-baseline gap-4">
            <h2 className="text-2xl font-semibold tracking-tight">
              {group.title}
            </h2>
            <span className="text-sm tabular-nums text-klean-muted">
              {group.entries.length} icons
            </span>
          </div>
          <ul className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8">
            {group.entries.map(({ name, component: Icon, description }) => (
              <li
                key={name}
                title={description}
                className="grid min-w-0 justify-items-center gap-3 rounded-2xl bg-white px-3 py-5 text-center shadow-sm ring-1 ring-gray-950/5 dark:bg-gray-950 dark:ring-white/10"
              >
                <Icon className="size-6" />
                <p className="w-full truncate text-xs font-medium">{name}</p>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </main>
  );
}

ProofSet.parameters = { layout: "fullscreen", controls: { disable: true } };

export function Apps() {
  return (
    <main className="klean-story-canvas min-h-screen px-5 py-14 sm:px-8 lg:px-12 lg:py-20">
      <h1 className="text-balance text-4xl font-semibold tracking-tighter sm:text-5xl">
        Native React source. Product-owned expression.
      </h1>
      <div className="mt-12 grid max-w-5xl gap-10 lg:grid-cols-2">
        <section className="rounded-xl border-2 border-black bg-white p-6 shadow-[4px_4px_0_0_#000] dark:border-white dark:bg-gray-950 dark:shadow-[4px_4px_0_0_#fff]">
          <h2 className="font-semibold">Invoice actions</h2>
          <button
            type="button"
            className="mt-5 inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-lg border-2 border-red-600 px-4 text-sm font-medium text-red-600"
          >
            <Trash className="size-4" />
            Delete
          </button>
        </section>
        <section className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-950/5 dark:bg-gray-950 dark:ring-white/10">
          <h2 className="font-semibold">Deployment</h2>
          <p className="mt-5 flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
            <Rocket className="size-5" />
            Ready to launch
          </p>
        </section>
      </div>
    </main>
  );
}

Apps.parameters = { layout: "fullscreen", controls: { disable: true } };
