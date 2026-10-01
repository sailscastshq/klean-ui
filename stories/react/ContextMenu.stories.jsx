import { useRef } from "react";
import ContextMenu from "../../registry/context-menu/react/ContextMenu.jsx";
function Example(args) {
  const actions = useRef();
  const itemClass =
    "block w-full rounded px-3 py-2 text-left text-sm outline-none focus:bg-gray-100 dark:focus:bg-gray-800";
  return (
    <div className="w-72 space-y-3">
      <div
        id="context-project"
        tabIndex={0}
        className="rounded-lg border border-gray-200 p-8 outline-none focus:ring-2 focus:ring-gray-500 dark:border-gray-700"
      >
        <p className="font-medium">Northstar project</p>
        <p className="mt-2 text-sm text-gray-500">
          Right-click or press Shift+F10
        </p>
      </div>
      <button
        type="button"
        onClick={(event) => actions.current.show(event.currentTarget)}
        className="rounded border border-gray-200 px-3 py-2 text-sm dark:border-gray-700"
      >
        Actions
      </button>
      <ContextMenu
        {...args}
        ref={actions}
        target="context-project"
        aria-label="Project actions"
      >
        <button type="button" className={itemClass}>
          Rename
        </button>
        <button type="button" disabled className={`${itemClass} opacity-40`}>
          Archive
        </button>
        <a href="#project" className={itemClass}>
          Open project
        </a>
      </ContextMenu>
    </div>
  );
}
export default {
  title: "Components/ContextMenu",
  component: Example,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Pointer and keyboard invocation on an existing focusable target, composed on Menu. Use a regular Actions button for touch. Caller Tailwind classes own appearance.",
      },
    },
  },
  args: {
    disabled: false,
    className: "w-52",
    placement: "bottom-start",
    offset: 0,
  },
  argTypes: {
    disabled: { control: "boolean" },
    className: { control: "text" },
    placement: {
      control: "select",
      options: ["bottom-start", "bottom-end", "top-start", "top-end"],
    },
    offset: { control: "number" },
  },
};
export const Playground = {};
export const Disabled = { args: { disabled: true } };
