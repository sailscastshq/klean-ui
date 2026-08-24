import { expect, userEvent, within } from "storybook/test";
import { ref } from "vue";
import FilterBar from "../src/vue/filter-bar/FilterBar.vue";

const meta = {
  title: "Components/Filter Bar",
  component: FilterBar,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "One native filter form with separate draft and committed state. Application markup owns every control and Tailwind class; Klean supplies apply, cancel, clear, removal, focus recovery, pending safety, and deterministic URL helpers.",
      },
    },
  },
  args: { label: "Service filters", busy: false, class: "" },
  argTypes: {
    label: { control: "text" },
    busy: { control: "boolean" },
    class: {
      control: "text",
      description: "Ordinary Tailwind classes merged onto the native form.",
    },
  },
};

export default meta;

function stateLabel(key, value) {
  if (key === "status") return `Status: ${value.value}`;
  if (key === "region") return `Region: ${value.value}`;
  return key;
}

export const Playground = {
  parameters: { controls: { include: ["label", "busy", "class"] } },
  render: (args) => ({
    components: { FilterBar },
    setup() {
      const filters = ref({
        status: { operator: "equals", value: "running" },
      });
      return { args, filters, stateLabel };
    },
    template: `
      <section class="klean-story-canvas min-h-screen px-5 py-12 sm:px-10">
        <div class="mx-auto max-w-5xl">
          <h1 class="text-3xl font-semibold tracking-[-0.04em]">Find the services that need you</h1>
          <p class="mt-3 max-w-2xl text-sm leading-6 text-klean-muted">Edit freely, then apply once. Active filters stay shareable and removable without losing keyboard focus.</p>

          <FilterBar
            v-model="filters"
            :label="args.label"
            :busy="args.busy"
            :class="['mt-8 rounded-xl border border-gray-200 bg-white p-3 shadow-sm dark:border-gray-800 dark:bg-gray-950', args.class]"
            v-slot="filter"
          >
            <div class="flex min-w-0 flex-1 flex-wrap items-center gap-2">
              <label for="filter-status" class="sr-only">Status</label>
              <select
                id="filter-status"
                :value="filter.draft.status?.value || ''"
                class="min-h-11 cursor-pointer rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-950 outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-950 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:focus-visible:outline-white"
                @change="filter.update('status', $event.currentTarget.value ? { operator: 'equals', value: $event.currentTarget.value } : undefined)"
              >
                <option value="">Any status</option>
                <option value="running">Running</option>
                <option value="degraded">Needs attention</option>
                <option value="stopped">Stopped</option>
              </select>

              <label for="filter-region" class="sr-only">Region</label>
              <select
                id="filter-region"
                :value="filter.draft.region?.value || ''"
                class="min-h-11 cursor-pointer rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-950 outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-950 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:focus-visible:outline-white"
                @change="filter.update('region', $event.currentTarget.value ? { operator: 'equals', value: $event.currentTarget.value } : undefined)"
              >
                <option value="">Any region</option>
                <option value="iad">Virginia</option>
                <option value="ams">Amsterdam</option>
                <option value="sin">Singapore</option>
              </select>

              <button v-bind="filter.applyAttrs" class="min-h-11 cursor-pointer rounded-lg bg-gray-950 px-4 text-sm font-semibold text-white transition-colors hover:bg-gray-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-950 disabled:cursor-not-allowed disabled:opacity-40 motion-reduce:transition-none dark:bg-white dark:text-gray-950 dark:hover:bg-gray-200 dark:focus-visible:outline-white">Apply</button>
              <button v-bind="filter.cancelAttrs" class="min-h-11 cursor-pointer rounded-lg px-3 text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-950 disabled:cursor-not-allowed disabled:opacity-40 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white dark:focus-visible:outline-white">Cancel</button>
            </div>

            <div v-if="filter.entries.length" class="flex w-full flex-wrap items-center gap-2 border-t border-gray-100 pt-3 dark:border-gray-800">
              <button
                v-for="([key, value]) in filter.entries"
                :key="key"
                v-bind="filter.removeAttrs(key, 'Remove ' + stateLabel(key, value))"
                class="inline-flex min-h-9 cursor-pointer items-center gap-2 rounded-full bg-gray-100 px-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-950 disabled:cursor-not-allowed disabled:opacity-40 motion-reduce:transition-none dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700 dark:focus-visible:outline-white"
              >
                {{ stateLabel(key, value) }} <span aria-hidden="true">×</span>
              </button>
              <button v-bind="filter.clearAttrs" class="min-h-9 cursor-pointer rounded-lg px-2 text-sm font-medium text-gray-500 underline-offset-4 hover:text-gray-950 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-950 disabled:cursor-not-allowed disabled:opacity-40 dark:text-gray-400 dark:hover:text-white dark:focus-visible:outline-white">Clear all</button>
            </div>
          </FilterBar>

          <pre class="mt-6 overflow-x-auto rounded-lg bg-gray-950 p-4 text-xs text-gray-300"><code>{{ JSON.stringify(filters, null, 2) }}</code></pre>
        </div>
      </section>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.selectOptions(canvas.getByLabelText("Region"), "iad");
    await userEvent.click(canvas.getByRole("button", { name: "Apply" }));
    await expect(
      canvas.getByRole("button", { name: "Remove Region: iad" }),
    ).toBeInTheDocument();
  },
};

export const Bridge = {
  name: "Bridge filters",
  parameters: { controls: { disable: true } },
  render: () => ({
    components: { FilterBar },
    setup() {
      const filters = ref({
        environment: { operator: "equals", value: "production" },
      });
      return { filters, stateLabel };
    },
    template: `
      <section class="min-h-screen bg-gray-950 px-5 py-12 text-white sm:px-10">
        <div class="mx-auto max-w-6xl">
          <div class="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <h1 class="text-3xl font-semibold tracking-[-0.04em]">Services</h1>
              <p class="mt-2 text-sm text-gray-400">Search, saved views, and typed filters remain ordinary application controls.</p>
            </div>
            <span class="text-sm tabular-nums text-gray-400">24 records</span>
          </div>

          <FilterBar v-model="filters" label="Bridge service filters" class="mt-7 rounded-xl border border-gray-800 bg-gray-900/70 p-3 shadow-2xl shadow-black/20" v-slot="filter">
            <label class="relative min-w-56 flex-1">
              <span class="sr-only">Search services</span>
              <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" class="pointer-events-none absolute left-3 top-3.5 size-4 text-gray-500" aria-hidden="true"><circle cx="8.5" cy="8.5" r="5.5" stroke-width="1.5" /><path d="m13 13 4 4" stroke-linecap="round" stroke-width="1.5" /></svg>
              <input type="search" placeholder="Search services" class="min-h-11 w-full rounded-lg border border-gray-700 bg-gray-950 pl-10 pr-3 text-sm text-white outline-none placeholder:text-gray-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white" />
            </label>

            <label>
              <span class="sr-only">Environment</span>
              <select :value="filter.draft.environment?.value || ''" class="min-h-11 cursor-pointer rounded-lg border border-gray-700 bg-gray-950 px-3 text-sm text-white outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white" @change="filter.update('environment', $event.currentTarget.value ? { operator: 'equals', value: $event.currentTarget.value } : undefined)">
                <option value="">All environments</option><option value="production">Production</option><option value="staging">Staging</option>
              </select>
            </label>

            <label>
              <span class="sr-only">Health</span>
              <select :value="filter.draft.health?.value || ''" class="min-h-11 cursor-pointer rounded-lg border border-gray-700 bg-gray-950 px-3 text-sm text-white outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white" @change="filter.update('health', $event.currentTarget.value ? { operator: 'equals', value: $event.currentTarget.value } : undefined)">
                <option value="">Any health</option><option value="healthy">Healthy</option><option value="attention">Needs attention</option>
              </select>
            </label>

            <button v-bind="filter.applyAttrs" class="min-h-11 cursor-pointer rounded-lg bg-white px-4 text-sm font-semibold text-gray-950 hover:bg-gray-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white disabled:cursor-not-allowed disabled:opacity-40">Apply</button>
            <button v-bind="filter.cancelAttrs" class="min-h-11 cursor-pointer rounded-lg px-3 text-sm text-gray-300 hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white disabled:cursor-not-allowed disabled:opacity-40">Cancel</button>

            <div v-if="filter.entries.length" class="flex w-full flex-wrap gap-2 border-t border-gray-800 pt-3">
              <button v-for="([key, value]) in filter.entries" :key="key" v-bind="filter.removeAttrs(key)" class="inline-flex min-h-9 cursor-pointer items-center gap-2 rounded-full bg-white/10 px-3 text-sm text-gray-200 hover:bg-white/15 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">{{ key }}: {{ value.value }} <span aria-hidden="true">×</span></button>
              <button v-bind="filter.clearAttrs" class="min-h-9 cursor-pointer px-2 text-sm text-gray-400 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">Clear all</button>
            </div>
          </FilterBar>
        </div>
      </section>
    `,
  }),
};
