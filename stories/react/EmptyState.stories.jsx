import { Link } from "@inertiajs/react";
import EmptyState from "../../registry/empty-state/react/EmptyState.jsx";

function EmptyStateExample({ as, title, description }) {
  return (
    <EmptyState
      as={as}
      aria-labelledby="react-empty-title"
      className="w-[min(42rem,calc(100vw-2rem))] rounded-lg border border-gray-200 dark:border-gray-800"
    >
      <span
        aria-hidden="true"
        className="grid size-12 place-items-center rounded-lg bg-gray-100 text-2xl dark:bg-gray-800"
      >
        ＋
      </span>
      <div className="max-w-md">
        <h2 id="react-empty-title" className="text-lg font-semibold">
          {title}
        </h2>
        <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-300">
          {description}
        </p>
      </div>
      <Link
        href="#react-create-project"
        onClick={(event) => event.preventDefault()}
        className="inline-flex min-h-10 items-center rounded-md bg-gray-950 px-4 text-sm font-medium text-white no-underline hover:bg-gray-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-950 dark:bg-white dark:text-gray-950 dark:hover:bg-gray-200 dark:focus-visible:outline-white"
      >
        Create project
      </Link>
    </EmptyState>
  );
}

const meta = {
  title: "Components/EmptyState",
  component: EmptyStateExample,
  parameters: { layout: "centered" },
  args: {
    as: "section",
    title: "No projects yet",
    description: "Create your first project to deploy an application.",
  },
  argTypes: {
    as: {
      control: "select",
      options: ["div", "section", "article"],
    },
    title: { control: "text" },
    description: { control: "text" },
  },
};

export default meta;

export const Playground = {};
