import { expect, fn, userEvent, within } from "storybook/test";
import Table from "../src/vue/table/Table.vue";

const services = [
  {
    name: "api",
    database: "PostgreSQL 17",
    status: "Healthy",
    memory: "384 MB",
  },
  {
    name: "worker",
    database: "Redis 8",
    status: "Deploying",
    memory: "192 MB",
  },
  {
    name: "web",
    database: "—",
    status: "Healthy",
    memory: "256 MB",
  },
];

const meta = {
  title: "Components/Table",
  component: Table,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "One native table with a neutral baseline. The application writes caption, sections, rows, headers, cells, actions, responsive overflow, and every Tailwind visual choice directly.",
      },
    },
  },
  args: {
    caption: "Production services",
    class: "min-w-160",
    onInspect: fn(),
  },
  argTypes: {
    caption: {
      control: "text",
      description: "Visible native caption supplied by the application.",
    },
    class: {
      control: "text",
      description: "Ordinary Tailwind classes merged on the native table.",
    },
    onInspect: { table: { disable: true } },
  },
};

export default meta;

export const Playground = {
  parameters: { controls: { include: ["caption", "class"] } },
  render: (args) => ({
    components: { Table },
    setup() {
      return { args, services };
    },
    template: `
      <div class="w-[min(92vw,48rem)] overflow-x-auto rounded-lg border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950">
        <Table :class="args.class">
          <caption class="caption-top px-4 py-3 text-left text-base font-semibold">{{ args.caption }}</caption>
          <thead class="bg-gray-50 text-xs uppercase tracking-wider text-gray-600 dark:bg-gray-900 dark:text-gray-400">
            <tr>
              <th scope="col" class="px-4 py-3 font-medium">Service</th>
              <th scope="col" class="px-4 py-3 font-medium">Dependency</th>
              <th scope="col" class="px-4 py-3 font-medium">Status</th>
              <th scope="col" class="px-4 py-3 text-right font-medium">Memory</th>
              <th scope="col" class="px-4 py-3 text-right font-medium"><span class="sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100 dark:divide-gray-800">
            <tr v-for="service in services" :key="service.name">
              <th scope="row" class="px-4 py-3 font-mono font-medium">{{ service.name }}</th>
              <td class="px-4 py-3 text-gray-600 dark:text-gray-300">{{ service.database }}</td>
              <td class="px-4 py-3">{{ service.status }}</td>
              <td class="px-4 py-3 text-right tabular-nums">{{ service.memory }}</td>
              <td class="px-4 py-3 text-right">
                <button type="button" class="cursor-pointer font-medium underline underline-offset-4" @click="args.onInspect(service.name)">Inspect <span class="sr-only">{{ service.name }}</span></button>
              </td>
            </tr>
          </tbody>
        </Table>
      </div>
    `,
  }),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const table = canvas.getByRole("table", { name: args.caption });

    await expect(table).toHaveAttribute("data-slot", "table");
    await expect(canvas.getAllByRole("columnheader")).toHaveLength(5);
    await expect(canvas.getAllByRole("rowheader")).toHaveLength(3);
    await userEvent.click(canvas.getByRole("button", { name: "Inspect api" }));
    await expect(args.onInspect).toHaveBeenCalledWith("api");
  },
};

export const Apps = {
  parameters: { layout: "fullscreen", controls: { disable: true } },
  render: () => ({
    components: { Table },
    setup() {
      const queryRows = [
        { id: 4012, email: "kelvin@example.com", plan: "Pro", total: "$48.00" },
        { id: 4011, email: "mira@example.com", plan: "Team", total: "$120.00" },
        { id: 4010, email: "ada@example.com", plan: "Pro", total: "$48.00" },
      ];
      const invoiceRows = [
        { item: "Brand direction", quantity: 1, amount: "$1,600.00" },
        { item: "Landing page", quantity: 2, amount: "$2,400.00" },
        { item: "Launch support", quantity: 4, amount: "$800.00" },
      ];
      return { queryRows, invoiceRows };
    },
    template: `
      <section class="klean-story-canvas px-5 py-14 sm:px-8 lg:px-12 lg:py-20" aria-labelledby="table-apps-title">
        <header class="max-w-3xl">
          <p class="font-mono text-[11px] uppercase tracking-[0.2em] text-klean-muted">Application recipes</p>
          <h1 id="table-apps-title" class="mt-3 text-balance text-4xl font-semibold tracking-tighter sm:text-5xl">Tabular truth. Product-owned rhythm.</h1>
          <p class="mt-5 max-w-2xl text-pretty text-base leading-7 text-klean-muted">Slipway proves dense operational results. Hagfish proves an invoice report can keep its editorial voice. Its editable invoice form remains a responsive list, because it is not a data table.</p>
        </header>

        <div class="mt-12 grid gap-10 xl:grid-cols-2">
          <article class="dark overflow-hidden rounded-lg border border-gray-800 bg-gray-950 text-white shadow-xl">
            <div class="flex items-center justify-between gap-4 px-5 py-4">
              <div>
                <p class="font-mono text-[11px] uppercase tracking-[0.18em] text-gray-500">Slipway / SQL result</p>
                <h2 class="mt-1 text-lg font-semibold">customers · 3 rows</h2>
              </div>
              <button type="button" class="cursor-pointer rounded-md border border-gray-700 px-3 py-2 text-xs font-medium text-gray-200 hover:bg-gray-800">Copy JSON</button>
            </div>
            <div class="overflow-x-auto">
              <Table class="min-w-160 text-gray-100 dark:text-gray-100">
                <caption class="sr-only">Latest customer query results</caption>
                <thead class="border-y border-gray-800 bg-gray-900 font-mono text-[11px] uppercase tracking-wider text-gray-400">
                  <tr>
                    <th scope="col" class="px-5 py-3 font-medium">id</th>
                    <th scope="col" class="px-5 py-3 font-medium">email</th>
                    <th scope="col" class="px-5 py-3 font-medium">plan</th>
                    <th scope="col" class="px-5 py-3 text-right font-medium">total</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-900 font-mono text-xs">
                  <tr v-for="row in queryRows" :key="row.id" class="hover:bg-white/5">
                    <td class="px-5 py-3 text-gray-400 tabular-nums">{{ row.id }}</td>
                    <td class="px-5 py-3">{{ row.email }}</td>
                    <td class="px-5 py-3">{{ row.plan }}</td>
                    <td class="px-5 py-3 text-right tabular-nums">{{ row.total }}</td>
                  </tr>
                </tbody>
              </Table>
            </div>
          </article>

          <article class="overflow-hidden border-2 border-black bg-[#f7f3eb] p-6 text-black shadow-[6px_6px_0_0_#000] sm:p-8">
            <p class="font-mono text-[11px] uppercase tracking-[0.18em] text-black/55">Hagfish / report ledger</p>
            <h2 class="mt-2 text-2xl font-semibold tracking-tight">Invoice INV-1042</h2>
            <div class="mt-6 overflow-x-auto">
              <Table class="min-w-xl border-separate border-spacing-0 text-black dark:text-black">
                <caption class="sr-only">Invoice INV-1042 line item report</caption>
                <thead class="font-mono text-[11px] uppercase tracking-[0.18em] text-black/55">
                  <tr>
                    <th scope="col" class="border-b-2 border-black py-3 pr-6 font-medium">Work</th>
                    <th scope="col" class="border-b-2 border-black px-6 py-3 text-right font-medium">Qty</th>
                    <th scope="col" class="border-b-2 border-black py-3 pl-6 text-right font-medium">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="row in invoiceRows" :key="row.item">
                    <th scope="row" class="border-b border-black/20 py-4 pr-6 font-medium">{{ row.item }}</th>
                    <td class="border-b border-black/20 px-6 py-4 text-right tabular-nums">{{ row.quantity }}</td>
                    <td class="border-b border-black/20 py-4 pl-6 text-right font-semibold tabular-nums">{{ row.amount }}</td>
                  </tr>
                </tbody>
                <tfoot>
                  <tr>
                    <th scope="row" colspan="2" class="pt-5 text-right text-base font-semibold">Total</th>
                    <td class="pt-5 text-right text-lg font-semibold tabular-nums">$4,800.00</td>
                  </tr>
                </tfoot>
              </Table>
            </div>
          </article>
        </div>
      </section>
    `,
  }),
};

export const NarrowViewport = {
  name: "Narrow viewport",
  parameters: { controls: { disable: true } },
  render: () => ({
    components: { Table },
    setup() {
      return { services };
    },
    template: `
      <div class="w-80">
        <p id="overflow-note" class="mb-3 text-sm text-gray-600 dark:text-gray-400">The wrapper scrolls. The table stays a table.</p>
        <div class="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-800" tabindex="0" aria-describedby="overflow-note">
          <Table class="min-w-160">
            <caption class="sr-only">Services at a narrow viewport</caption>
            <thead class="bg-gray-50 dark:bg-gray-900"><tr><th scope="col" class="px-4 py-3">Service</th><th scope="col" class="px-4 py-3">Dependency</th><th scope="col" class="px-4 py-3">Status</th><th scope="col" class="px-4 py-3 text-right">Memory</th></tr></thead>
            <tbody class="divide-y divide-gray-100 dark:divide-gray-800"><tr v-for="service in services" :key="service.name"><th scope="row" class="px-4 py-3 font-mono">{{ service.name }}</th><td class="px-4 py-3">{{ service.database }}</td><td class="px-4 py-3">{{ service.status }}</td><td class="px-4 py-3 text-right tabular-nums">{{ service.memory }}</td></tr></tbody>
          </Table>
        </div>
      </div>
    `,
  }),
};
