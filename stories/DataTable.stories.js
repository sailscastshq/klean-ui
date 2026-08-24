import { computed, ref } from "vue";
import { expect, userEvent, within } from "storybook/test";
import Checkbox from "../src/vue/checkbox/Checkbox.vue";
import DataTable from "../src/vue/data-table/DataTable.vue";
import Input from "../src/vue/input/Input.vue";
import Select from "../src/vue/select/Select.vue";

const services = [
  {
    id: "svc_01J9api",
    service: "api",
    owner: "Platform",
    status: "Healthy",
    region: "fra1",
    updated: "2 minutes ago",
  },
  {
    id: "svc_01J9worker",
    service: "worker",
    owner: "Billing",
    status: "Deploying",
    region: "iad1",
    updated: "8 minutes ago",
  },
  {
    id: "svc_01J9events",
    service: "events",
    owner: "Platform",
    status: "Healthy",
    region: "fra1",
    updated: "21 minutes ago",
  },
  {
    id: "svc_01J9mail",
    service: "mail",
    owner: "Growth",
    status: "Attention",
    region: "sin1",
    updated: "34 minutes ago",
  },
];

const meta = {
  title: "Components/DataTable",
  component: DataTable,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "A server-driven table block. It keeps one native table, page-scoped selection, truthful pending state, and explicit application markup. The companion query helper keeps search, sort, filters, and pagination in clean Inertia URLs.",
      },
    },
  },
  args: {
    busy: false,
    class: "rounded-lg border border-gray-200 dark:border-gray-800",
    tableClass: "min-w-180",
  },
  argTypes: {
    busy: {
      control: "boolean",
      description:
        "Marks the native table busy while keeping current rows readable.",
    },
    class: {
      control: "text",
      description: "Ordinary Tailwind classes on the scroll container.",
    },
    tableClass: {
      control: "text",
      description: "Ordinary Tailwind classes on the native table.",
    },
  },
};

export default meta;

export const Playground = {
  parameters: {
    layout: "centered",
    controls: { include: ["busy", "class", "tableClass"] },
  },
  render: (args) => ({
    components: { Checkbox, DataTable },
    setup() {
      const selected = ref([]);
      return { args, rows: services.slice(0, 3), selected };
    },
    template: `
      <DataTable
        v-model:selected="selected"
        :rows="rows"
        :busy="args.busy"
        :class="args.class"
        :table-class="args.tableClass"
        v-slot="table"
      >
        <caption class="caption-top px-4 py-3 text-left text-base font-semibold">Production services</caption>
        <thead class="border-y border-gray-200 bg-gray-50 text-xs text-gray-600 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400">
          <tr>
            <th scope="col" class="w-12 px-4 py-3"><Checkbox v-bind="table.pageSelection()" /></th>
            <th scope="col" class="px-4 py-3 font-medium">Service</th>
            <th scope="col" class="px-4 py-3 font-medium">Status</th>
            <th scope="col" class="px-4 py-3 font-medium">Region</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100 bg-white dark:divide-gray-800 dark:bg-gray-950">
          <tr v-for="row in rows" :key="row.id">
            <td class="px-4 py-3"><Checkbox v-bind="table.rowSelection(row, 'Select ' + row.service)" /></td>
            <th scope="row" class="px-4 py-3 font-mono font-medium">{{ row.service }}</th>
            <td class="px-4 py-3">{{ row.status }}</td>
            <td class="px-4 py-3 font-mono text-xs text-gray-500">{{ row.region }}</td>
          </tr>
        </tbody>
      </DataTable>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const table = canvas.getByRole("table", { name: "Production services" });
    const pageSelection = canvas.getByRole("checkbox", {
      name: "Select all rows on this page",
    });

    await expect(table).toHaveAttribute("data-slot", "table");
    await userEvent.click(canvas.getByRole("checkbox", { name: "Select api" }));
    await expect(pageSelection).toBePartiallyChecked();
    await expect(canvas.getByText("1 row selected.")).toBeInTheDocument();
  },
};

export const Bridge = {
  parameters: { controls: { disable: true } },
  render: () => ({
    components: { Checkbox, DataTable, Input, Select },
    setup() {
      const selected = ref([]);
      const search = ref("");
      const view = ref("all");
      const attentionOnly = ref(false);
      const sort = ref("service ASC");

      const rows = computed(() => {
        const query = search.value.trim().toLowerCase();
        const filtered = services.filter((service) => {
          if (view.value === "platform" && service.owner !== "Platform") {
            return false;
          }
          if (attentionOnly.value && service.status !== "Attention") {
            return false;
          }
          return (
            !query ||
            [service.service, service.owner, service.status, service.region]
              .join(" ")
              .toLowerCase()
              .includes(query)
          );
        });
        const [field, direction] = sort.value.split(" ");
        return filtered.toSorted((left, right) => {
          const result = String(left[field]).localeCompare(
            String(right[field]),
          );
          return direction === "ASC" ? result : -result;
        });
      });

      function ariaSort(field) {
        const [active, direction] = sort.value.split(" ");
        if (active !== field) return undefined;
        return direction === "ASC" ? "ascending" : "descending";
      }

      function sortButton(field, label) {
        const [active, direction] = sort.value.split(" ");
        const next = active === field && direction === "ASC" ? "DESC" : "ASC";
        return {
          type: "button",
          "aria-label": `Sort by ${label} ${next === "ASC" ? "ascending" : "descending"}`,
          onClick: () => {
            sort.value = `${field} ${next}`;
          },
        };
      }

      function sortState(field) {
        const [active, direction] = sort.value.split(" ");
        return active === field ? direction : undefined;
      }

      function statusClasses(status) {
        return {
          Healthy: "bg-emerald-400/10 text-emerald-300 ring-emerald-400/20",
          Deploying: "bg-sky-400/10 text-sky-300 ring-sky-400/20",
          Attention: "bg-amber-400/10 text-amber-300 ring-amber-400/20",
        }[status];
      }

      return {
        ariaSort,
        attentionOnly,
        rows,
        search,
        selected,
        sortButton,
        sortState,
        statusClasses,
        view,
      };
    },
    template: `
      <section class="min-h-svh bg-gray-950 px-4 py-12 text-white sm:px-8" aria-labelledby="bridge-table-title">
        <div class="mx-auto max-w-6xl">
          <header class="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 id="bridge-table-title" class="text-2xl font-semibold tracking-tight sm:text-3xl">Bridge services</h1>
              <p class="mt-2 max-w-2xl text-sm leading-6 text-gray-400">Production services connected to this environment.</p>
            </div>
            <a href="#new-service" class="inline-flex min-h-11 items-center justify-center gap-2 self-start rounded-lg bg-white px-4 text-sm font-medium text-gray-950 no-underline transition-colors hover:bg-gray-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white motion-reduce:transition-none">
              <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" class="size-4" aria-hidden="true"><path d="M10 4v12M4 10h12" stroke-linecap="round" stroke-width="1.75" /></svg>
              New service
            </a>
          </header>

          <div class="mt-8 flex flex-col gap-3 rounded-xl bg-gray-900/60 p-3 ring-1 ring-white/10 lg:flex-row lg:items-center lg:justify-between">
            <div class="flex flex-1 flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Input v-model="search" type="search" aria-label="Search services" placeholder="Search services..." class="border-gray-700 bg-gray-950 text-white sm:w-64" />
              <div class="sm:w-52">
                <Select
                  v-model="view"
                  aria-label="Saved view"
                  :options="[
                    { value: 'all', label: 'All services' },
                    { value: 'platform', label: 'Platform services' }
                  ]"
                  class="border-gray-700 bg-gray-950 text-white"
                />
              </div>
              <button type="button" :aria-pressed="attentionOnly" class="inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-lg border border-gray-700 px-4 text-sm text-gray-300 transition-colors hover:border-gray-600 hover:bg-white/5 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white aria-pressed:border-amber-400/50 aria-pressed:bg-amber-400/10 aria-pressed:text-amber-200 motion-reduce:transition-none sm:w-auto" @click="attentionOnly = !attentionOnly">
                <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" class="size-4" aria-hidden="true"><path d="M3 4h14l-5.5 6.2v4.3l-3 1.5v-5.8L3 4Z" stroke-linejoin="round" stroke-width="1.5" /></svg>
                Needs attention
              </button>
            </div>
            <div class="flex min-h-11 items-center justify-between gap-3 px-1 text-sm text-gray-400 lg:justify-end">
              <span>{{ rows.length }} records</span>
              <span v-if="selected.length" aria-hidden="true" class="text-gray-700">/</span>
              <span v-if="selected.length" class="rounded-full bg-white/10 px-2.5 py-1 font-medium text-white">{{ selected.length }} selected</span>
              <button v-if="selected.length" type="button" class="cursor-pointer rounded-md px-2 py-1 font-medium text-white transition-colors hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white motion-reduce:transition-none">Actions</button>
            </div>
          </div>

          <div class="mt-6 overflow-hidden rounded-xl bg-gray-950 ring-1 ring-white/10">
            <DataTable
              v-model:selected="selected"
              :rows="rows"
              class="overscroll-x-contain"
              table-class="min-w-200 text-gray-100 dark:text-gray-100"
              v-slot="table"
            >
              <caption class="sr-only">Bridge service records</caption>
              <thead class="border-b border-gray-800 bg-gray-900 text-xs uppercase tracking-wider text-gray-400">
                <tr>
                  <th scope="col" class="sticky left-0 z-20 w-12 bg-gray-900 px-4 py-3"><Checkbox v-bind="table.pageSelection('Select all services on this page')" class="text-white focus-visible:outline-white" /></th>
                  <th scope="col" :aria-sort="ariaSort('service')" class="sticky left-12 z-20 min-w-36 border-r border-gray-800 bg-gray-900 px-4 py-3 text-left font-medium">
                    <button v-bind="sortButton('service', 'service')" class="inline-flex cursor-pointer items-center gap-2 rounded-sm hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">
                      Service
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" class="size-3.5" aria-hidden="true">
                        <path v-if="sortState('service') === 'ASC'" d="m7 14 5-5 5 5" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" />
                        <path v-else-if="sortState('service') === 'DESC'" d="m7 10 5 5 5-5" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" />
                        <path v-else d="m8 9 4-4 4 4m0 6-4 4-4-4" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" />
                      </svg>
                    </button>
                  </th>
                  <th scope="col" class="px-4 py-3 text-left font-medium">Owner</th>
                  <th scope="col" :aria-sort="ariaSort('status')" class="px-4 py-3 text-left font-medium">
                    <button v-bind="sortButton('status', 'status')" class="inline-flex cursor-pointer items-center gap-2 rounded-sm hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">
                      Status
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" class="size-3.5" aria-hidden="true">
                        <path v-if="sortState('status') === 'ASC'" d="m7 14 5-5 5 5" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" />
                        <path v-else-if="sortState('status') === 'DESC'" d="m7 10 5 5 5-5" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" />
                        <path v-else d="m8 9 4-4 4 4m0 6-4 4-4-4" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" />
                      </svg>
                    </button>
                  </th>
                  <th scope="col" class="px-4 py-3 text-left font-medium">Region</th>
                  <th scope="col" class="px-4 py-3 text-left font-medium">Updated</th>
                  <th scope="col" class="w-16 px-4 py-3"><span class="sr-only">Actions</span></th>
                </tr>
              </thead>
              <tbody v-if="rows.length" class="divide-y divide-gray-900 bg-gray-950">
                <tr v-for="row in rows" :key="row.id" class="group hover:bg-white/4 focus-within:bg-white/4">
                  <td :class="['sticky left-0 z-10 px-4 py-3', table.isSelected(row) ? 'bg-gray-900' : 'bg-gray-950 group-hover:bg-gray-900 group-focus-within:bg-gray-900']"><Checkbox v-bind="table.rowSelection(row, 'Select ' + row.service)" class="text-white focus-visible:outline-white" /></td>
                  <th scope="row" :class="['sticky left-12 z-10 border-r border-gray-900 px-4 py-3 text-left font-medium', table.isSelected(row) ? 'bg-gray-900' : 'bg-gray-950 group-hover:bg-gray-900 group-focus-within:bg-gray-900']"><a :href="'#' + row.id" class="rounded-sm text-white no-underline hover:underline hover:underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">{{ row.service }}</a></th>
                  <td class="px-4 py-3 text-gray-300">{{ row.owner }}</td>
                  <td class="px-4 py-3"><span :class="['inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset', statusClasses(row.status)]"><span class="size-1.5 rounded-full bg-current" aria-hidden="true"></span>{{ row.status }}</span></td>
                  <td class="px-4 py-3 font-mono text-xs text-gray-400">{{ row.region }}</td>
                  <td class="px-4 py-3 text-gray-400">{{ row.updated }}</td>
                  <td class="px-4 py-3 text-right"><a :href="'#actions-' + row.id" :aria-label="'Actions for ' + row.service" class="inline-grid size-10 place-items-center rounded-lg text-gray-400 no-underline transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white motion-reduce:transition-none"><svg viewBox="0 0 20 20" fill="currentColor" class="size-4" aria-hidden="true"><circle cx="4" cy="10" r="1.5" /><circle cx="10" cy="10" r="1.5" /><circle cx="16" cy="10" r="1.5" /></svg></a></td>
                </tr>
              </tbody>
              <tbody v-else class="bg-gray-950">
                <tr><td colspan="7" class="px-4 py-16 text-center text-sm text-gray-400">No matching services.</td></tr>
              </tbody>
            </DataTable>

            <footer class="flex items-center justify-between border-t border-gray-800 bg-gray-900/40 px-4 py-3 text-sm text-gray-400">
              <span class="tabular-nums">Page 1 of 8</span>
              <nav aria-label="Service pages" class="flex gap-2">
                <span aria-disabled="true" class="inline-flex min-h-10 items-center px-3 text-gray-600">Previous</span>
                <a href="?page=2" class="inline-flex min-h-10 items-center gap-1 rounded-lg px-3 font-medium text-white no-underline transition-colors hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white motion-reduce:transition-none">Next <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" class="size-4" aria-hidden="true"><path d="m7 4 6 6-6 6" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" /></svg></a>
              </nav>
            </footer>
          </div>
        </div>
      </section>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const serviceButton = canvas.getByRole("button", {
      name: "Sort by service descending",
    });
    const serviceHeader = serviceButton.closest("th");
    await expect(serviceHeader).toHaveAttribute("aria-sort", "ascending");
    serviceButton.focus();
    await userEvent.keyboard("{Enter}");
    await expect(serviceHeader).toHaveAttribute("aria-sort", "descending");
    serviceButton.blur();
  },
};

export const AuditLog = {
  parameters: { layout: "centered", controls: { disable: true } },
  render: () => ({
    components: { DataTable },
    setup() {
      return {
        rows: [
          {
            id: 1,
            event: "deployment.finished",
            actor: "Kelvin",
            time: "12:04",
          },
          { id: 2, event: "domain.verified", actor: "System", time: "11:48" },
          { id: 3, event: "secret.updated", actor: "Mira", time: "10:16" },
        ],
      };
    },
    template: `
      <DataTable :rows="rows" class="w-[min(92vw,46rem)] border-y border-gray-200 dark:border-gray-800" table-class="min-w-140" v-slot>
        <caption class="caption-top py-4 text-left text-lg font-semibold">Audit log</caption>
        <thead class="border-y border-gray-200 text-xs text-gray-500 dark:border-gray-800"><tr><th scope="col" class="py-3 pr-5 font-medium">Event</th><th scope="col" class="px-5 py-3 font-medium">Actor</th><th scope="col" class="py-3 pl-5 text-right font-medium">Time</th></tr></thead>
        <tbody class="divide-y divide-gray-100 dark:divide-gray-900"><tr v-for="row in rows" :key="row.id"><th scope="row" class="py-4 pr-5 font-mono text-xs font-medium">{{ row.event }}</th><td class="px-5 py-4">{{ row.actor }}</td><td class="py-4 pl-5 text-right tabular-nums text-gray-500">{{ row.time }}</td></tr></tbody>
      </DataTable>
    `,
  }),
};
