import { expect, userEvent, within } from "storybook/test";
import { onBeforeUnmount, ref, watch } from "vue";
import Combobox from "../src/vue/combobox/Combobox.vue";

const projects = [
  {
    value: "slipway",
    label: "Slipway",
    description: "Deploy and operate Sails applications",
    keywords: ["hosting", "deployments"],
  },
  {
    value: "hagfish",
    label: "Hagfish",
    description: "Invoices, customers, and billing",
    keywords: ["billing", "payments"],
  },
  {
    value: "boring-stack",
    label: "The Boring JavaScript Stack",
    description: "Full-stack conventions for Sails",
    keywords: ["sails", "inertia"],
  },
  {
    value: "legacy",
    label: "Legacy console",
    description: "Archived and unavailable",
    disabled: true,
  },
];

const meta = {
  title: "Components/Combobox",
  component: Combobox,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "An editable search-and-choose input for long or remotely loaded lists. It keeps a committed value separate from the unfinished query, owns accessible listbox behavior, and leaves request policy with the application.",
      },
    },
  },
  args: {
    value: "slipway",
    placeholder: "Search projects",
    loading: false,
    disabled: false,
    class: "",
  },
  argTypes: {
    value: {
      control: "select",
      options: [undefined, "slipway", "hagfish", "boring-stack"],
      description: "The committed typed application value.",
    },
    placeholder: {
      control: "text",
      description: "Shown when no value is committed.",
    },
    loading: {
      control: "boolean",
      description: "Keeps results stable while application-owned search runs.",
    },
    disabled: {
      control: "boolean",
      description: "Disables the editable input and selection.",
    },
    class: {
      control: "text",
      description: "Ordinary Tailwind classes merged onto the input.",
    },
  },
};

export default meta;

export const Playground = {
  parameters: {
    controls: {
      include: ["value", "placeholder", "loading", "disabled", "class"],
    },
  },
  render: (args) => ({
    components: { Combobox },
    setup() {
      const value = ref(args.value);
      watch(
        () => args.value,
        (nextValue) => {
          value.value = nextValue;
        },
      );
      return { args, projects, value };
    },
    template: `
      <div class="grid w-[min(24rem,calc(100vw-2rem))] gap-2">
        <label for="project-combobox" class="text-sm font-medium text-gray-950 dark:text-white">Project</label>
        <Combobox
          id="project-combobox"
          v-model="value"
          name="project"
          :options="projects"
          :placeholder="args.placeholder"
          :loading="args.loading"
          :disabled="args.disabled"
          :class="args.class"
        />
        <p class="text-sm text-gray-500 dark:text-gray-400">Committed value: {{ value ?? 'none' }}</p>
        <button type="button" class="min-h-11 cursor-pointer rounded-md border border-gray-300 px-3 text-sm hover:bg-gray-100 focus-visible:outline-2 focus-visible:outline-offset-2 dark:border-gray-700 dark:hover:bg-gray-800">
          After combobox
        </button>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole("combobox", { name: "Project" });

    await userEvent.click(input);
    await expect(input).toHaveAttribute("aria-expanded", "true");
    await userEvent.type(input, "bill");
    await expect(canvas.getByRole("option", { name: /Hagfish/ })).toBeVisible();
    await userEvent.keyboard("{ArrowDown}{Enter}");
    await expect(input).toHaveValue("Hagfish");
    await expect(input).toHaveFocus();
    await userEvent.click(input);
    await userEvent.keyboard("{Tab}");
    await expect(input).toHaveAttribute("aria-expanded", "false");
    await expect(
      canvas.getByRole("button", { name: "After combobox" }),
    ).toHaveFocus();
  },
};

export const Relationship = {
  name: "Relationship",
  parameters: { layout: "fullscreen", controls: { disable: true } },
  render: () => ({
    components: { Combobox },
    setup() {
      const customer = ref("cus_kelvin");
      const customers = [
        {
          value: "cus_kelvin",
          label: "Kelvin Omereshone",
          description: "kelvin@sailscasts.com",
        },
        {
          value: "cus_ada",
          label: "Ada Lovelace",
          description: "ada@example.com",
        },
        {
          value: "cus_grace",
          label: "Grace Hopper",
          description: "grace@example.com",
        },
      ];
      return { customer, customers };
    },
    template: `
      <section class="min-h-136 bg-white px-5 py-14 text-gray-950 dark:bg-gray-950 dark:text-white sm:px-10 sm:py-20" aria-labelledby="relationship-title">
        <div class="mx-auto max-w-xl">
          <p class="text-xs font-medium uppercase tracking-[0.16em] text-gray-500 dark:text-gray-400">Slipway / relationship field</p>
          <h2 id="relationship-title" class="mt-3 text-2xl font-semibold tracking-tight">Assign an account owner</h2>
          <p class="mt-2 text-sm leading-6 text-gray-500 dark:text-gray-400">Search by name or email without losing the existing relationship until a new person is chosen.</p>

          <div class="mt-8 rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-950">
            <label for="customer-combobox" class="text-sm font-medium">Customer</label>
            <Combobox
              id="customer-combobox"
              v-model="customer"
              :options="customers"
              placeholder="Search customers"
              class="mt-2 rounded-md border-gray-300 bg-transparent shadow-none dark:border-gray-700"
            />
            <p class="mt-2 text-xs text-gray-500 dark:text-gray-400">The committed ID is {{ customer }}.</p>
          </div>
        </div>
      </section>
    `,
  }),
};

export const RemoteSearch = {
  name: "Remote search",
  parameters: { controls: { disable: true } },
  render: () => ({
    components: { Combobox },
    setup() {
      const repository = ref();
      const results = ref(projects.slice(0, 2));
      const loading = ref(false);
      let request = 0;
      let timer;

      function search(query) {
        const currentRequest = ++request;
        loading.value = true;
        clearTimeout(timer);
        timer = setTimeout(() => {
          if (currentRequest !== request) return;
          const needle = query.toLocaleLowerCase();
          results.value = projects.filter((project) =>
            `${project.label} ${project.description}`
              .toLocaleLowerCase()
              .includes(needle),
          );
          loading.value = false;
        }, 450);
      }

      onBeforeUnmount(() => clearTimeout(timer));
      return { loading, repository, results, search };
    },
    template: `
      <div class="grid w-[min(25rem,calc(100vw-2rem))] gap-2">
        <label for="repository-combobox" class="text-sm font-medium">Repository</label>
        <Combobox
          id="repository-combobox"
          v-model="repository"
          :options="results"
          :loading="loading"
          placeholder="Search repositories"
          @search="search"
        />
        <p class="text-sm text-gray-500 dark:text-gray-400">Search emits after 300 ms; this recipe ignores replaced work and keeps current results visible.</p>
      </div>
    `,
  }),
};

export const States = {
  parameters: { layout: "fullscreen", controls: { disable: true } },
  render: () => ({
    components: { Combobox },
    setup() {
      const region = ref("lagos");
      const grouped = [
        { value: "lagos", label: "Lagos", group: "Nigeria" },
        { value: "abuja", label: "Abuja", group: "Nigeria" },
        { value: "accra", label: "Accra", group: "Ghana" },
        { value: "kumasi", label: "Kumasi", group: "Ghana", disabled: true },
      ];
      return { grouped, region };
    },
    template: `
      <section class="klean-story-canvas px-5 py-12 sm:px-10" aria-labelledby="combobox-states-title">
        <header class="max-w-2xl">
          <p class="font-mono text-[11px] uppercase tracking-[0.2em] text-klean-muted">Combobox / state sheet</p>
          <h1 id="combobox-states-title" class="mt-3 text-3xl font-semibold tracking-[-0.04em]">Search is temporary. Selection is durable.</h1>
        </header>
        <div class="mt-10 grid max-w-4xl gap-7 sm:grid-cols-2">
          <div class="grid gap-2">
            <label for="grouped-combobox" class="text-sm font-medium">Region</label>
            <Combobox id="grouped-combobox" v-model="region" :options="grouped" />
          </div>
          <div class="grid gap-2">
            <label for="loading-combobox" class="text-sm font-medium">Loading</label>
            <Combobox id="loading-combobox" loading :options="grouped" />
          </div>
          <div class="grid gap-2">
            <label for="error-combobox" class="text-sm font-medium">Search error</label>
            <Combobox id="error-combobox" error="Could not refresh results." :options="grouped" />
          </div>
          <div class="grid gap-2">
            <label for="invalid-combobox" class="text-sm font-medium">Invalid relationship</label>
            <Combobox id="invalid-combobox" aria-invalid="true" aria-describedby="combobox-error" :options="grouped" />
            <p id="combobox-error" class="text-sm text-red-700 dark:text-red-400">Choose a valid region.</p>
          </div>
          <div class="grid gap-2">
            <label for="disabled-combobox" class="text-sm font-medium">Disabled</label>
            <Combobox id="disabled-combobox" disabled default-value="lagos" :options="grouped" />
          </div>
        </div>
      </section>
    `,
  }),
};
