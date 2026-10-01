import Example from "./ContextMenuExample.svelte";
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
    class: "w-52",
    placement: "bottom-start",
    offset: 0,
  },
  argTypes: {
    disabled: { control: "boolean" },
    class: { control: "text" },
    placement: {
      control: "select",
      options: ["bottom-start", "bottom-end", "top-start", "top-end"],
    },
    offset: { control: "number" },
  },
};
export const Playground = {};
export const Disabled = { args: { disabled: true } };
