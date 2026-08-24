import { useState } from "react";
import RowActions from "../../registry/row-actions/react/RowActions.jsx";

function Example({ label, busy, className }) {
  const [notice, setNotice] = useState("No action yet");

  return (
    <div className="w-[min(34rem,calc(100vw-2rem))]">
      <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-950">
        <div>
          <a
            href="#api"
            className="font-medium text-gray-950 no-underline hover:underline dark:text-white"
          >
            api
          </a>
          <p className="mt-1 text-sm text-gray-500">Healthy · fra1</p>
        </div>
        <RowActions
          label={label}
          busy={busy}
          className={className}
          menu={
            <>
              <a
                href="#settings"
                className="block rounded-sm px-3 py-2 text-sm text-gray-700 no-underline hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800"
              >
                Settings
              </a>
              <button
                type="button"
                className="block w-full cursor-pointer rounded-sm px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800"
                onClick={() => setNotice("Redeploy requested")}
              >
                Redeploy
              </button>
              <button
                type="button"
                className="block w-full cursor-pointer rounded-sm px-3 py-2 text-left text-sm text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40"
                onClick={() => setNotice("Delete confirmation requested")}
              >
                Delete service
              </button>
            </>
          }
        >
          <a
            href="#logs"
            className="inline-flex min-h-9 items-center rounded-md px-3 text-sm font-medium text-gray-700 no-underline hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800"
          >
            Logs
          </a>
        </RowActions>
      </div>
      <p className="mt-3 text-sm text-gray-500" aria-live="polite">
        {notice}
      </p>
    </div>
  );
}

const meta = {
  title: "Components/RowActions",
  component: Example,
  parameters: { layout: "centered" },
  args: { label: "Actions for api", busy: false, className: "" },
  argTypes: {
    label: { control: "text" },
    busy: { control: "boolean" },
    className: { control: "text" },
  },
};

export default meta;

export const Playground = {};
