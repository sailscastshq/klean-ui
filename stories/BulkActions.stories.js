import { ref, watch } from "vue";
import { expect, userEvent, within } from "storybook/test";
import BulkActions from "../src/vue/bulk-actions/BulkActions.vue";
import Menu from "../src/vue/menu/Menu.vue";

const meta = {
  title: "Components/BulkActions",
  component: BulkActions,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A selected-record action region with a polite count, default clear control, truthful busy state, and deliberate focus recovery. Selection, actions, mutations, and positioning remain application-owned.",
      },
    },
  },
  args: {
    count: 3,
    label: "Actions for selected services",
    busy: false,
    clearLabel: "Clear selection",
    class: "",
  },
  argTypes: {
    count: { control: { type: "number", min: 0, step: 1 } },
    label: { control: "text" },
    busy: { control: "boolean" },
    clearLabel: { control: "text" },
    class: { control: "text" },
  },
};

export default meta;

export const Playground = {
  parameters: {
    controls: {
      include: ["count", "label", "busy", "clearLabel", "class"],
    },
  },
  render: (args) => ({
    components: { BulkActions },
    setup() {
      const count = ref(args.count);
      const notice = ref("No action yet");
      watch(
        () => args.count,
        (nextCount) => {
          count.value = nextCount;
        },
      );
      return { args, count, notice };
    },
    template: `
      <div class="w-[min(42rem,calc(100vw-2rem))]">
        <label class="mb-3 flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
          <input data-bulk-actions-focus type="checkbox" :checked="count > 0" class="size-4" />
          Select all services on this page
        </label>
        <BulkActions
          :count="count"
          :label="args.label"
          :busy="args.busy"
          :clear-label="args.clearLabel"
          :class="args.class"
          @clear="count = 0"
        >
          <button type="button" :disabled="args.busy" class="min-h-9 cursor-pointer rounded-md bg-gray-950 px-3 text-sm font-medium text-white hover:bg-gray-800 focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-gray-950 dark:hover:bg-gray-200" @click="notice = 'Export requested'">Export</button>
          <button type="button" :disabled="args.busy" class="min-h-9 cursor-pointer rounded-md px-3 text-sm font-medium text-red-700 hover:bg-red-50 focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:text-red-400 dark:hover:bg-red-950/50" @click="notice = 'Delete confirmation requested'">Delete</button>
        </BulkActions>
        <p class="mt-3 text-sm text-gray-500" aria-live="polite">{{ notice }}</p>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const clear = canvas.getByRole("button", { name: "Clear selection" });
    await userEvent.click(clear);
    await expect(
      canvas.getByRole("checkbox", {
        name: "Select all services on this page",
      }),
    ).toHaveFocus();
    await expect(
      canvas.queryByRole("region", { name: "Actions for selected services" }),
    ).not.toBeInTheDocument();
  },
};

export const Apps = {
  parameters: { layout: "fullscreen", controls: { disable: true } },
  render: () => ({
    components: { BulkActions, Menu },
    setup() {
      const invoiceCount = ref(2);
      const serviceCount = ref(3);
      const notice = ref("Choose an action");
      return { invoiceCount, notice, serviceCount };
    },
    template: `
      <main class="grid min-h-svh bg-gray-100 lg:grid-cols-2">
        <section class="bg-[#f7f3eb] p-6 text-black sm:p-12" aria-labelledby="invoice-bulk-title">
          <div class="mx-auto max-w-xl">
            <h1 id="invoice-bulk-title" class="text-2xl font-semibold tracking-tight">Invoices</h1>
            <label class="mt-5 flex items-center gap-3 text-sm font-medium">
              <input data-bulk-actions-focus type="checkbox" :checked="invoiceCount > 0" class="size-5 accent-black" />
              Select all invoices on this page
            </label>
            <BulkActions
              :count="invoiceCount"
              label="Actions for selected invoices"
              clear-label="Clear"
              class="mt-4 rounded-none border-2 border-black bg-white px-4 shadow-[4px_4px_0_0_#000]"
              @clear="invoiceCount = 0"
            >
              <button type="button" class="min-h-10 cursor-pointer border-2 border-black bg-black px-3 text-sm font-medium text-white hover:bg-white hover:text-black" @click="notice = 'Invoices downloaded'">Download</button>
              <button type="button" class="min-h-10 cursor-pointer border-2 border-red-700 px-3 text-sm font-medium text-red-700 hover:bg-red-700 hover:text-white" @click="notice = 'Delete invoice confirmation opened'">Delete</button>
            </BulkActions>
          </div>
        </section>

        <section class="dark bg-gray-950 p-6 text-white sm:p-12" aria-labelledby="bridge-bulk-title">
          <div class="mx-auto max-w-xl">
            <h2 id="bridge-bulk-title" class="text-2xl font-semibold tracking-tight">Bridge records</h2>
            <label class="mt-5 flex items-center gap-3 text-sm text-gray-300">
              <input data-bulk-actions-focus type="checkbox" :checked="serviceCount > 0" class="size-4 accent-white" />
              Select all records on this page
            </label>
            <BulkActions
              :count="serviceCount"
              label="Actions for selected records"
              clear-label="Clear"
              class="mt-4 border-gray-800 bg-gray-900 shadow-none"
              @clear="serviceCount = 0"
            >
              <button popovertarget="bridge-bulk-menu" type="button" class="min-h-9 cursor-pointer rounded-md bg-white px-3 text-sm font-medium text-gray-950 hover:bg-gray-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">Actions</button>
              <Menu id="bridge-bulk-menu" aria-label="Actions for selected records" placement="bottom-end" class="w-56">
                <button type="button" class="block w-full cursor-pointer rounded-sm px-3 py-2 text-left text-sm text-gray-200 hover:bg-white/10" @click="notice = 'Licenses regenerated'">Regenerate licenses</button>
                <button type="button" class="block w-full cursor-pointer rounded-sm px-3 py-2 text-left text-sm text-red-400 hover:bg-red-950/60" @click="notice = 'Delete records confirmation opened'">Delete selected</button>
              </Menu>
            </BulkActions>
          </div>
        </section>

        <p class="sr-only" aria-live="polite">{{ notice }}</p>
      </main>
    `,
  }),
};
