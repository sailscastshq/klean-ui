import { expect, userEvent, waitFor, within } from "storybook/test";
import Tooltip from "../../registry/tooltip/react/Tooltip.jsx";

function RefreshIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="size-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      aria-hidden="true"
    >
      <path
        d="M20 11a8 8 0 1 0-2.34 5.66M20 4v7h-7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const meta = {
  title: "Components/Tooltip",
  component: Tooltip,
  parameters: { layout: "centered" },
  args: {
    text: "Re-run query",
    placement: "top",
    className: "",
  },
  argTypes: {
    text: { control: "text" },
    placement: {
      control: "select",
      options: ["top", "right", "bottom", "left"],
    },
    className: { control: "text" },
  },
};

export default meta;

export const Playground = {
  render: (args) => (
    <Tooltip {...args}>
      <button
        type="button"
        aria-label="Re-run query"
        className="grid size-10 place-items-center rounded-md bg-gray-950 text-white focus-visible:outline-2 focus-visible:outline-offset-2 dark:bg-white dark:text-gray-950"
      >
        <RefreshIcon />
      </button>
    </Tooltip>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("button", { name: "Re-run query" });
    trigger.focus();

    await waitFor(
      () => {
        const tooltip = canvasElement.ownerDocument.getElementById(
          trigger.getAttribute("aria-describedby"),
        );
        expect(tooltip).toHaveAttribute("data-state", "open");
      },
      { timeout: 1000 },
    );
    await userEvent.keyboard("{Escape}");
    await expect(trigger).toHaveFocus();
  },
};

export const Sides = {
  render: () => (
    <div className="grid grid-cols-2 gap-24">
      {["top", "right", "bottom", "left"].map((placement) => (
        <Tooltip
          key={placement}
          text={placement[0].toUpperCase() + placement.slice(1)}
          placement={placement}
        >
          <button
            type="button"
            aria-label={`${placement} tooltip`}
            className="grid size-12 place-items-center rounded-full border border-gray-300 bg-white text-sm font-semibold uppercase text-gray-950"
          >
            {placement[0]}
          </button>
        </Tooltip>
      ))}
    </div>
  ),
};

export const Themes = {
  parameters: { layout: "fullscreen", controls: { disable: true } },
  render: () => (
    <section
      className="grid min-h-136 md:grid-cols-2"
      aria-label="Tooltip theme defaults"
    >
      <article className="grid place-items-center bg-white p-10 text-gray-950">
        <div className="grid justify-items-center gap-4">
          <p className="text-sm font-medium">Light application</p>
          <Tooltip text="Dark by default" placement="bottom">
            <button
              type="button"
              className="min-h-11 cursor-pointer rounded-md border border-gray-300 bg-white px-4 text-sm shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-950"
            >
              Focus or hover
            </button>
          </Tooltip>
        </div>
      </article>
      <article className="dark grid place-items-center bg-gray-950 p-10 text-white">
        <div className="grid justify-items-center gap-4">
          <p className="text-sm font-medium">Dark application</p>
          <Tooltip text="Light by default" placement="bottom">
            <button
              type="button"
              className="min-h-11 cursor-pointer rounded-md border border-gray-700 bg-gray-900 px-4 text-sm shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              Focus or hover
            </button>
          </Tooltip>
        </div>
      </article>
    </section>
  ),
};
