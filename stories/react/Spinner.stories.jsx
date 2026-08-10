import Spinner from "../../registry/spinner/react/Spinner.jsx";

function ProductLoader() {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden="true"
      data-product-loader=""
      className="h-5 w-5 animate-pulse"
    >
      <path
        d="M7 17C7 3 25 3 25 17ZM7 17C4 21 4 25 8 28M12 17C11 21 10 25 13 28M20 17C21 21 22 25 19 28M25 17C28 21 28 25 24 28"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="13" cy="11" r="1.8" fill="currentColor" />
      <circle cx="19" cy="11" r="1.8" fill="currentColor" />
    </svg>
  );
}

function SpinnerExample({ loading, label, className }) {
  return (
    <span
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className="inline-flex min-h-6 items-center gap-2 text-sm text-gray-700 dark:text-gray-200"
    >
      {loading ? (
        <>
          <Spinner className={className} />
          <span>{label}</span>
        </>
      ) : null}
    </span>
  );
}

const meta = {
  title: "Components/Spinner",
  component: SpinnerExample,
  parameters: { layout: "centered" },
  args: {
    loading: true,
    label: "Loading deployments…",
    className: "",
  },
  argTypes: {
    loading: { control: "boolean" },
    label: { control: "text" },
    className: { control: "text" },
  },
};

export default meta;

export const Playground = {};

export const PendingButton = {
  render: () => (
    <button
      type="button"
      disabled
      aria-busy="true"
      className="inline-flex min-h-10 cursor-not-allowed items-center gap-2 rounded-md bg-gray-950 px-4 text-sm font-medium text-white opacity-70 dark:bg-white dark:text-gray-950"
    >
      <Spinner>
        <ProductLoader />
      </Spinner>
      Deploying…
    </button>
  ),
};

export const ProductMark = {
  render: () => (
    <span role="status" className="inline-flex items-center gap-2 text-sm">
      <Spinner className="size-6 text-gray-950 dark:text-white">
        <ProductLoader />
      </Spinner>
      Loading with an application-owned mark…
    </span>
  ),
};
