import LoadingState from "../../registry/loading-state/react/LoadingState.jsx";
import Spinner from "../../registry/spinner/react/Spinner.jsx";

function LoadingStateExample({ label, className }) {
  return (
    <section
      aria-busy="true"
      aria-labelledby="react-loading-title"
      className="w-[min(42rem,calc(100vw-2rem))]"
    >
      <h2 id="react-loading-title" className="sr-only">
        Services
      </h2>
      <LoadingState className={className}>
        <Spinner className="size-6" />
        <span>{label}</span>
      </LoadingState>
    </section>
  );
}

const meta = {
  title: "Components/LoadingState",
  component: LoadingStateExample,
  parameters: { layout: "centered" },
  args: {
    label: "Loading services…",
    className: "",
  },
  argTypes: {
    label: { control: "text" },
    className: { control: "text" },
  },
};

export default meta;

export const Playground = {};

export const StaleContent = {
  render: () => (
    <section
      aria-busy="true"
      aria-labelledby="react-services-title"
      aria-describedby="react-services-status"
      className="w-[min(42rem,calc(100vw-2rem))] bg-white p-6 dark:bg-gray-950"
    >
      <div className="flex items-center justify-between gap-4 border-b border-gray-200 pb-4 dark:border-gray-800">
        <h2 id="react-services-title" className="font-semibold">
          Services
        </h2>
        <LoadingState
          id="react-services-status"
          className="min-h-0 w-auto flex-row justify-start gap-2 p-0 text-left text-sm text-gray-500 dark:text-gray-400"
        >
          <Spinner className="size-4" />
          Refreshing…
        </LoadingState>
      </div>
      <p className="py-6 text-sm text-gray-600 dark:text-gray-300">
        Existing content remains readable while fresh data loads.
      </p>
    </section>
  ),
};
