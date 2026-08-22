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

      return {
        ariaSort,
        attentionOnly,
        rows,
        search,
        selected,
        sortButton,
        view,
      };
    },
    template: `
      <section class="min-h-svh bg-gray-950 px-4 py-12 text-white sm:px-8" aria-labelledby="bridge-table-title">
        <div class="mx-auto max-w-6xl">
          <header class="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 id="bridge-table-title" class="text-3xl font-semibold tracking-tight">Bridge services</h1>
              <p class="mt-2 max-w-2xl text-sm leading-6 text-gray-400">Server-owned records remain ordinary links and cells. Search, saved views, filters, sorting, and pagination belong in the URL when this recipe moves into an app.</p>
            </div>
            <a href="#new-service" class="inline-flex min-h-11 items-center justify-center rounded-md bg-white px-4 text-sm font-medium text-gray-950 no-underline">New service</a>
          </header>

          <div class="mt-8 flex flex-col gap-3 border-y border-gray-800 py-4 lg:flex-row lg:items-center lg:justify-between">
            <div class="flex flex-1 flex-col gap-3 sm:flex-row">
              <Input v-model="search" type="search" aria-label="Search services" placeholder="Search services..." class="border-gray-700 bg-gray-900 text-white sm:max-w-xs" />
              <Select
                v-model="view"
                aria-label="Saved view"
                :options="[
                  { value: 'all', label: 'All services' },
                  { value: 'platform', label: 'Platform services' }
                ]"
                class="border-gray-700 bg-gray-900 text-white sm:max-w-52"
              />
              <button type="button" :aria-pressed="attentionOnly" class="min-h-11 cursor-pointer rounded-md border border-gray-700 px-4 text-sm text-gray-300 hover:bg-gray-900 aria-pressed:border-white aria-pressed:text-white" @click="attentionOnly = !attentionOnly">Needs attention</button>
            </div>
            <div class="flex min-h-11 items-center gap-3 text-sm text-gray-400">
              <span v-if="selected.length">{{ selected.length }} selected</span>
              <button v-if="selected.length" type="button" class="cursor-pointer font-medium text-white underline underline-offset-4">Actions</button>
              <span>{{ rows.length }} records</span>
            </div>
          </div>

          <DataTable
            v-model:selected="selected"
            :rows="rows"
            class="border-x border-b border-gray-800"
            table-class="min-w-200 text-gray-100 dark:text-gray-100"
            v-slot="table"
          >
            <caption class="sr-only">Bridge service records</caption>
            <thead class="border-b border-gray-800 bg-gray-900/80 text-xs text-gray-400">
              <tr>
                <th scope="col" class="w-12 px-4 py-3"><Checkbox v-bind="table.pageSelection('Select all services on this page')" class="text-white focus-visible:outline-white" /></th>
                <th scope="col" :aria-sort="ariaSort('service')" class="px-4 py-3 text-left font-medium">
                  <button v-bind="sortButton('service', 'service')" class="inline-flex cursor-pointer items-center gap-2 hover:text-white">Service <span aria-hidden="true">↕</span></button>
                </th>
                <th scope="col" class="px-4 py-3 text-left font-medium">Owner</th>
                <th scope="col" :aria-sort="ariaSort('status')" class="px-4 py-3 text-left font-medium">
                  <button v-bind="sortButton('status', 'status')" class="inline-flex cursor-pointer items-center gap-2 hover:text-white">Status <span aria-hidden="true">↕</span></button>
                </th>
                <th scope="col" class="px-4 py-3 text-left font-medium">Region</th>
                <th scope="col" class="px-4 py-3 text-left font-medium">Updated</th>
                <th scope="col" class="w-16 px-4 py-3"><span class="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody v-if="rows.length" class="divide-y divide-gray-900 bg-gray-950">
              <tr v-for="row in rows" :key="row.id" class="hover:bg-white/4">
                <td class="px-4 py-3"><Checkbox v-bind="table.rowSelection(row, 'Select ' + row.service)" class="text-white focus-visible:outline-white" /></td>
                <th scope="row" class="px-4 py-3 text-left font-medium"><a :href="'#' + row.id" class="text-white no-underline hover:underline">{{ row.service }}</a></th>
                <td class="px-4 py-3 text-gray-300">{{ row.owner }}</td>
                <td class="px-4 py-3"><span class="inline-flex items-center gap-2"><span class="size-1.5 rounded-full bg-current" aria-hidden="true"></span>{{ row.status }}</span></td>
                <td class="px-4 py-3 font-mono text-xs text-gray-400">{{ row.region }}</td>
                <td class="px-4 py-3 text-gray-400">{{ row.updated }}</td>
                <td class="px-4 py-3 text-right"><a :href="'#actions-' + row.id" :aria-label="'Actions for ' + row.service" class="inline-grid size-10 place-items-center rounded-md text-xl text-gray-400 no-underline hover:bg-gray-900 hover:text-white">⋯</a></td>
              </tr>
            </tbody>
            <tbody v-else class="bg-gray-950">
              <tr><td colspan="7" class="px-4 py-16 text-center text-sm text-gray-400">No matching services.</td></tr>
            </tbody>
          </DataTable>

          <footer class="flex items-center justify-between border-x border-b border-gray-800 px-4 py-4 text-sm text-gray-400">
            <span>Page 1 of 8</span>
            <nav aria-label="Service pages" class="flex gap-2">
              <span aria-disabled="true" class="inline-flex min-h-11 items-center px-3 text-gray-600">Previous</span>
              <a href="?page=2" class="inline-flex min-h-11 items-center rounded-md border border-gray-700 px-3 text-white no-underline">Next</a>
            </nav>
          </footer>
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
