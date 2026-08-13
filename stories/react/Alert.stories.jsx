import Alert from "../../registry/alert/react/Alert.jsx";

function AlertExample({ as, role, heading, message, className }) {
  return (
    <Alert
      as={as}
      role={role || undefined}
      className={`max-w-xl ${className}`}
    >
      <h2 className="font-medium">{heading}</h2>
      <p className="mt-1 leading-6 text-gray-600 dark:text-gray-300">
        {message}
      </p>
    </Alert>
  );
}

const meta = {
  title: "Components/Alert",
  component: AlertExample,
  parameters: { layout: "centered" },
  args: {
    as: "div",
    role: "",
    heading: "Changes are saved automatically",
    message: "You can leave this page and return whenever you are ready.",
    className: "",
  },
  argTypes: {
    as: { control: "select", options: ["div", "section", "aside"] },
    role: { control: "select", options: ["", "note", "status", "alert"] },
    heading: { control: "text" },
    message: { control: "text" },
    className: { control: "text" },
  },
};

export default meta;

export const Playground = {};

export const Checklist = {
  render: () => (
    <Alert
      as="section"
      role="note"
      aria-labelledby="react-checklist-title"
      className="max-w-2xl border border-amber-200 bg-amber-50/50 p-0 text-gray-950 dark:border-amber-900/50 dark:bg-amber-950/20 dark:text-white"
    >
      <header className="px-4 py-3">
        <h2
          id="react-checklist-title"
          className="text-sm font-medium text-amber-900 dark:text-amber-200"
        >
          Deployment checklist
        </h2>
      </header>
      <ul className="border-t border-amber-200/60 dark:border-amber-900/40">
        <li className="flex items-center justify-between gap-4 px-4 py-3">
          <span>SESSION_SECRET is missing</span>
          <button type="button" className="cursor-pointer font-medium underline">
            Generate
          </button>
        </li>
      </ul>
    </Alert>
  ),
};
