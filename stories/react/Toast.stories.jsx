import { useEffect, useMemo, useState } from "react";
import { expect, userEvent, within } from "storybook/test";
import Toast from "../../registry/toast/react/Toast.jsx";
import { createToast } from "../../registry/toast/toast.js";

const positions = [
  "top-left",
  "top-center",
  "top-right",
  "bottom-left",
  "bottom-center",
  "bottom-right",
];
const directions = ["left", "right", "top", "bottom", "fade", "none"];

const meta = {
  title: "React/Toast",
  component: Toast,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "The same provider-free Toast contract rendered natively in React.",
      },
    },
  },
  args: {
    position: "top-right",
    from: "right",
    to: "right",
  },
  argTypes: {
    position: { control: "select", options: positions },
    from: { control: "select", options: directions },
    to: { control: "select", options: directions },
  },
};

export default meta;

function Demo(args) {
  const notifications = useMemo(() => createToast(), []);
  useEffect(() => () => notifications.destroy(), [notifications]);

  return (
    <div className="klean-toast-motion-preview grid justify-items-center gap-3">
      <button
        type="button"
        className="min-h-11 cursor-pointer rounded-md bg-gray-950 px-4 py-2 font-medium text-white hover:bg-gray-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-950 focus-visible:ring-offset-2"
        onClick={() =>
          notifications({
            title: "React notification",
            message: "The controller contract is shared, not wrapped.",
          })
        }
      >
        Show toast
      </button>
      <p className="text-sm text-gray-500">React 19 renderer</p>
      <Toast controller={notifications} {...args} />
    </div>
  );
}

export const Playground = {
  parameters: { controls: { include: ["position", "from", "to"] } },
  render: (args) => <Demo {...args} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Show toast" }));
    await expect(canvas.getByText("React notification")).toBeInTheDocument();
    await expect(
      canvasElement.querySelector('[data-slot="toast-viewport"]'),
    ).toHaveAttribute("aria-live", "polite");
  },
};

function MotionDemo({ reduced = false }) {
  const notifications = useMemo(() => createToast({ duration: 2600 }), []);
  const [from, setFrom] = useState("right");
  const [to, setTo] = useState("right");
  useEffect(() => () => notifications.destroy(), [notifications]);

  function show(nextFrom, nextTo = nextFrom) {
    setFrom(nextFrom);
    setTo(nextTo);
    notifications({
      title: `${nextFrom} in · ${nextTo} out`,
      message: reduced
        ? "Movement is reduced to a near-instant state change."
        : "340ms overshoot in, a quiet 240ms exit.",
    });
  }

  return (
    <div
      className={`${reduced ? "klean-toast-reduced-motion-preview" : "klean-toast-motion-preview"} flex max-w-lg flex-wrap justify-center gap-2`}
    >
      {(reduced ? ["right"] : ["right", "left", "top", "bottom", "fade"]).map(
        (direction) => (
          <button
            key={direction}
            type="button"
            className="min-h-10 cursor-pointer rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium capitalize hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-950"
            onClick={() => show(direction)}
          >
            {reduced ? "Show reduced-motion toast" : direction}
          </button>
        ),
      )}
      {!reduced ? (
        <button
          type="button"
          className="min-h-10 cursor-pointer rounded-md bg-gray-950 px-3 py-2 text-sm font-medium text-white hover:bg-gray-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-950"
          onClick={() => show("right", "left")}
        >
          Cross the screen
        </button>
      ) : null}
      <Toast controller={notifications} from={from} to={to} />
    </div>
  );
}

export const Motion = {
  name: "Motion",
  parameters: { controls: { disable: true } },
  render: () => <MotionDemo />,
};

export const ReducedMotion = {
  name: "Reduced motion",
  parameters: { controls: { disable: true } },
  render: () => <MotionDemo reduced />,
};

function CustomDemo() {
  const notifications = useMemo(() => createToast({ duration: false }), []);
  useEffect(() => () => notifications.destroy(), [notifications]);

  return (
    <div className="klean-toast-motion-preview">
      <button
        type="button"
        className="min-h-11 cursor-pointer rounded-md bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
        onClick={() =>
          notifications({ status: "Building image", progress: 42 })
        }
      >
        Start deployment
      </button>
      <Toast controller={notifications} position="bottom-right">
        {({ item, dismiss }) => (
          <div className="grid gap-3">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold">{item.status}</p>
              <button
                type="button"
                className="grid size-8 cursor-pointer place-items-center rounded-md hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-950"
                aria-label="Dismiss deployment notification"
                onClick={dismiss}
              >
                ×
              </button>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-gray-200">
              <div
                className="h-full rounded-full bg-blue-600"
                style={{ width: `${item.progress}%` }}
              />
            </div>
          </div>
        )}
      </Toast>
    </div>
  );
}

export const CustomContent = {
  name: "Custom content",
  parameters: { controls: { disable: true } },
  render: () => <CustomDemo />,
};
