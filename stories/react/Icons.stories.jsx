import Bell from "../../registry/icon-bell/react/Bell.jsx";
import Calendar from "../../registry/icon-calendar/react/Calendar.jsx";
import CheckCircle from "../../registry/icon-check-circle/react/CheckCircle.jsx";
import ChevronRight from "../../registry/icon-chevron-right/react/ChevronRight.jsx";
import Copy from "../../registry/icon-copy/react/Copy.jsx";
import Folder from "../../registry/icon-folder/react/Folder.jsx";
import Rocket from "../../registry/icon-rocket/react/Rocket.jsx";
import Search from "../../registry/icon-search/react/Search.jsx";
import Server from "../../registry/icon-server/react/Server.jsx";
import Trash from "../../registry/icon-trash/react/Trash.jsx";
import User from "../../registry/icon-user/react/User.jsx";
import X from "../../registry/icon-x/react/X.jsx";

const iconComponents = {
  Trash,
  Search,
  Calendar,
  CheckCircle,
  X,
  ChevronRight,
  Copy,
  User,
  Folder,
  Server,
  Bell,
  Rocket,
};

const iconEntries = Object.entries(iconComponents);

const meta = {
  title: "Components/Icons",
  component: Rocket,
  parameters: { layout: "centered" },
  args: { icon: "Rocket", size: 24, color: "#111827", strokeWidth: 1.5 },
  argTypes: {
    icon: { control: "select", options: Object.keys(iconComponents) },
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
          Twelve marks. One quiet voice.
        </h1>
        <p className="mt-5 max-w-2xl text-pretty text-base leading-7 text-klean-muted">
          React receives ordinary forwardRef SVG components with the same Klean
          geometry and caller-owned visual surface.
        </p>
      </header>
      <ul className="mt-12 grid max-w-7xl grid-cols-2 gap-x-5 gap-y-8 sm:grid-cols-3 lg:grid-cols-6">
        {iconEntries.map(([name, Icon]) => (
          <li key={name} className="space-y-3">
            <div className="grid aspect-square max-w-32 place-items-center rounded-3xl bg-white text-gray-950 shadow-sm ring-1 ring-gray-950/5 dark:bg-gray-950 dark:text-white dark:ring-white/10">
              <Icon className="size-6" />
            </div>
            <p className="text-sm font-medium">{name}</p>
          </li>
        ))}
      </ul>
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
