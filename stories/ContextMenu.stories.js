import ContextMenu from "../src/vue/context-menu/ContextMenu.vue";

export default {
  title: "Components/ContextMenu",
  component: ContextMenu,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Right-click or use ContextMenu / Shift+F10 on an existing focusable target. A normal Actions button exposes the same menu to touch users. No long-press interception; style the surface and native items with classes.",
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
    target: { control: false },
    open: { control: false },
    disabled: { control: "boolean" },
    class: { control: "text" },
    placement: {
      control: "select",
      options: ["bottom-start", "bottom-end", "top-start", "top-end"],
    },
    offset: { control: "number" },
  },
  render: (args) => ({
    components: { ContextMenu },
    setup: () => ({ args }),
    template: `<div class="w-72 space-y-3"><div id="context-project" tabindex="0" class="rounded-lg border border-gray-200 p-8 outline-none focus:ring-2 focus:ring-gray-500 dark:border-gray-700"><p class="font-medium">Northstar project</p><p class="mt-2 text-sm text-gray-500">Right-click or press Shift+F10</p></div><button type="button" @click="$refs.actions.show($event.currentTarget)" class="rounded border border-gray-200 px-3 py-2 text-sm dark:border-gray-700">Actions</button><ContextMenu ref="actions" v-bind="args" target="context-project" aria-label="Project actions"><button type="button" class="block w-full rounded px-3 py-2 text-left text-sm outline-none focus:bg-gray-100 dark:focus:bg-gray-800">Rename</button><button type="button" disabled class="block w-full rounded px-3 py-2 text-left text-sm opacity-40">Archive</button><a href="#project" class="block w-full rounded px-3 py-2 text-left text-sm outline-none focus:bg-gray-100 dark:focus:bg-gray-800">Open project</a></ContextMenu></div>`,
  }),
};
export const Playground = {};
export const Disabled = { args: { disabled: true } };
