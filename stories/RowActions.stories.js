import { ref } from "vue";
import { expect, userEvent, within } from "storybook/test";
import RowActions from "../src/vue/row-actions/RowActions.vue";

const meta = {
  title: "Components/RowActions",
  component: RowActions,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A compact action group for application rows. Author real links and buttons, keep frequent actions visible, and place secondary actions in the optional overflow menu.",
      },
    },
  },
  args: {
    label: "Actions for api",
    busy: false,
    class: "",
  },
  argTypes: {
    label: { control: "text" },
    busy: { control: "boolean" },
    class: { control: "text" },
  },
};

export default meta;

export const Playground = {
  parameters: { controls: { include: ["label", "busy", "class"] } },
  render: (args) => ({
    components: { RowActions },
    setup() {
      const result = ref("No action yet");
      return { args, result };
    },
    template: `
      <div class="w-[min(34rem,calc(100vw-2rem))]">
        <div class="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-950">
          <div>
            <a href="#api" class="font-medium text-gray-950 no-underline hover:underline dark:text-white">api</a>
            <p class="mt-1 text-sm text-gray-500">Healthy · fra1</p>
          </div>
          <RowActions :label="args.label" :busy="args.busy" :class="args.class">
            <a href="#logs" class="inline-flex min-h-9 items-center rounded-md px-3 text-sm font-medium text-gray-700 no-underline hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800">Logs</a>
            <template #menu>
              <a href="#settings" class="block rounded-sm px-3 py-2 text-sm text-gray-700 no-underline hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800">Settings</a>
              <button type="button" class="block w-full cursor-pointer rounded-sm px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800" @click="result = 'Redeploy requested'">Redeploy</button>
              <button type="button" class="block w-full cursor-pointer rounded-sm px-3 py-2 text-left text-sm text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40" @click="result = 'Delete confirmation requested'">Delete service</button>
            </template>
          </RowActions>
        </div>
        <p class="mt-3 text-sm text-gray-500" aria-live="polite">{{ result }}</p>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("button", { name: "Actions for api" });
    await userEvent.click(trigger);
    await expect(canvas.getByRole("menu")).toBeVisible();
    await expect(
      canvas.getByRole("menuitem", { name: "Settings" }),
    ).toHaveFocus();
  },
};

export const Apps = {
  parameters: { layout: "fullscreen", controls: { disable: true } },
  render: () => ({
    components: { RowActions },
    setup() {
      const notice = ref("Choose an action");
      return { notice };
    },
    template: `
      <main class="grid min-h-svh bg-gray-100 lg:grid-cols-2">
        <section class="bg-[#f7f3eb] p-6 text-black sm:p-12" aria-labelledby="invoice-actions-title">
          <div class="mx-auto max-w-xl">
            <h1 id="invoice-actions-title" class="text-2xl font-semibold tracking-tight">Invoices</h1>
            <div class="mt-6 overflow-visible border-2 border-black bg-white shadow-[4px_4px_0_0_#000]">
              <div class="flex items-center justify-between gap-4 p-4 sm:p-5">
                <div class="min-w-0">
                  <a href="#inv-1042" class="font-semibold text-black no-underline hover:underline">INV-1042</a>
                  <p class="mt-1 truncate text-sm text-black/60">Acme Studio · Draft</p>
                </div>
                <RowActions label="Actions for invoice INV-1042">
                  <a href="#preview" class="inline-flex min-h-10 items-center border-2 border-black px-3 text-sm font-medium text-black no-underline hover:bg-black hover:text-white">Preview</a>
                  <template #menu>
                    <a href="#edit" class="block px-3 py-2 text-sm text-black no-underline hover:bg-black hover:text-white">Edit invoice</a>
                    <button type="button" class="block w-full cursor-pointer px-3 py-2 text-left text-sm hover:bg-black hover:text-white" @click="notice = 'Invoice duplicated'">Duplicate</button>
                    <button type="button" class="block w-full cursor-pointer px-3 py-2 text-left text-sm text-red-700 hover:bg-red-700 hover:text-white" @click="notice = 'Delete confirmation opened'">Delete draft</button>
                  </template>
                </RowActions>
              </div>
            </div>
          </div>
        </section>

        <section class="dark bg-gray-950 p-6 text-white sm:p-12" aria-labelledby="service-actions-title">
          <div class="mx-auto max-w-xl">
            <h2 id="service-actions-title" class="text-2xl font-semibold tracking-tight">Bridge services</h2>
            <div class="mt-6 divide-y divide-gray-800 overflow-visible rounded-lg border border-gray-800 bg-gray-900">
              <div v-for="service in ['api', 'worker']" :key="service" class="flex items-center justify-between gap-4 p-4">
                <div>
                  <a :href="'#' + service" class="font-mono font-medium text-white no-underline hover:underline">{{ service }}</a>
                  <p class="mt-1 text-sm text-gray-400">Healthy · fra1</p>
                </div>
                <RowActions :label="'Actions for ' + service">
                  <a :href="'#logs-' + service" class="inline-flex min-h-9 items-center rounded-md px-3 text-sm font-medium text-gray-200 no-underline hover:bg-white/10">Logs</a>
                  <template #menu>
                    <a :href="'#settings-' + service" class="block rounded-sm px-3 py-2 text-sm text-gray-200 no-underline hover:bg-white/10">Settings</a>
                    <button type="button" class="block w-full cursor-pointer rounded-sm px-3 py-2 text-left text-sm text-gray-200 hover:bg-white/10" @click="notice = service + ' redeploy requested'">Redeploy</button>
                    <button type="button" class="block w-full cursor-pointer rounded-sm px-3 py-2 text-left text-sm text-red-400 hover:bg-red-950/60" @click="notice = 'Delete ' + service + ' confirmation opened'">Delete service</button>
                  </template>
                </RowActions>
              </div>
            </div>
          </div>
        </section>

        <p class="sr-only" aria-live="polite">{{ notice }}</p>
      </main>
    `,
  }),
};
