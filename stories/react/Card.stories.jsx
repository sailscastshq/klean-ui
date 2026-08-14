import { Link } from "@inertiajs/react";
import Card from "../../registry/card/react/Card.jsx";

function CardExample({ as, title, description }) {
  return (
    <Card as={as} className="w-[min(88vw,28rem)]">
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="mt-2 leading-6 text-gray-600 dark:text-gray-300">
        {description}
      </p>
    </Card>
  );
}

const meta = {
  title: "Components/Card",
  component: CardExample,
  parameters: { layout: "centered" },
  args: {
    as: "article",
    title: "Production API",
    description: "Healthy in Lagos with three replicas.",
  },
  argTypes: {
    as: {
      control: "select",
      options: ["div", "article", "section", "aside"],
    },
    title: { control: "text" },
    description: { control: "text" },
  },
};

export default meta;

export const Playground = {};

export const Navigation = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="grid w-[min(90vw,46rem)] gap-4 sm:grid-cols-2">
      <Card
        as="a"
        href="#native-react-card"
        onClick={(event) => event.preventDefault()}
        className="block cursor-pointer no-underline transition-colors hover:bg-gray-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-950 dark:hover:bg-gray-900 dark:focus-visible:outline-white"
      >
        <h2 className="font-semibold">Native anchor</h2>
        <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-300">
          Browser navigation remains browser navigation.
        </p>
      </Card>

      <Card
        as={Link}
        href="#inertia-react-card"
        onClick={(event) => event.preventDefault()}
        className="block cursor-pointer no-underline transition-colors hover:bg-gray-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-950 dark:hover:bg-gray-900 dark:focus-visible:outline-white"
      >
        <h2 className="font-semibold">Boring Stack Link</h2>
        <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-300">
          Pass React&apos;s Inertia Link directly through <code>as</code>.
        </p>
      </Card>
    </div>
  ),
};

export const ExplicitActions = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Card
      as="article"
      aria-labelledby="react-revenue-title"
      className="w-[min(90vw,28rem)] rounded-lg border-2 border-black bg-black p-6 text-white shadow-[4px_4px_0_0_rgba(0,0,0,0.3)] dark:border-white dark:bg-white dark:text-black"
    >
      <header className="flex items-start justify-between gap-4">
        <h2
          id="react-revenue-title"
          className="text-sm font-medium text-white/60 dark:text-black/60"
        >
          Revenue
        </h2>
        <button
          type="button"
          className="cursor-pointer rounded border border-white/20 px-2.5 py-1 text-xs dark:border-black/20"
        >
          USD ↔
        </button>
      </header>
      <Link
        href="#react-paid-invoices"
        onClick={(event) => event.preventDefault()}
        className="mt-10 block text-4xl font-bold leading-none tracking-tight text-white no-underline tabular-nums dark:text-black"
      >
        $128,420.00
      </Link>
    </Card>
  ),
};
