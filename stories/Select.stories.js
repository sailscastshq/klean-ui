import { expect, userEvent, within } from "storybook/test";
import { ref, watch } from "vue";
import Select from "../src/vue/select/Select.vue";

const roleOptions = [
  { value: "viewer", label: "Viewer" },
  { value: "editor", label: "Editor", disabled: true },
  { value: "administrator", label: "Administrator" },
];

const meta = {
  title: "Components/Select",
  component: Select,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A fixed-list value picker with a one-piece API, typed values, native form participation, full keyboard behavior, and ordinary Tailwind styling. Use Combobox—not a Select prop—when the user must search.",
      },
    },
  },
  args: {
    value: "viewer",
    placeholder: "Choose a role",
    required: true,
    disabled: false,
    class: "",
  },
  argTypes: {
    value: {
      control: "select",
      options: [undefined, "viewer", "administrator"],
      description: "The current typed application value.",
    },
    placeholder: {
      control: "text",
      description: "Shown only when no option is selected.",
    },
    required: {
      control: "boolean",
      description: "Exposes the field's required state.",
    },
    disabled: {
      control: "boolean",
      description: "Disables the real trigger and hidden form field.",
    },
    class: {
      control: "text",
      description: "Ordinary Tailwind classes merged onto the visible trigger.",
    },
  },
};

export default meta;

export const Playground = {
  parameters: {
    controls: {
      include: ["value", "placeholder", "required", "disabled", "class"],
    },
  },
  render: (args) => ({
    components: { Select },
    setup() {
      const value = ref(args.value);
      watch(
        () => args.value,
        (nextValue) => {
          value.value = nextValue;
        },
      );
      return { args, roleOptions, value };
    },
    template: `
      <div class="grid w-[min(22rem,calc(100vw-2rem))] gap-2">
        <label for="role-select" class="text-sm font-medium text-gray-950 dark:text-white">Member role</label>
        <Select
          id="role-select"
          v-model="value"
          name="role"
          :options="roleOptions"
          :placeholder="args.placeholder"
          :required="args.required"
          :disabled="args.disabled"
          :class="args.class"
        />
        <p class="text-sm text-gray-500 dark:text-gray-400">Current value: {{ value ?? 'none' }}</p>
        <button type="button" class="min-h-11 cursor-pointer rounded-md border border-gray-300 px-3 text-sm hover:bg-gray-100 focus-visible:outline-2 focus-visible:outline-offset-2 dark:border-gray-700 dark:hover:bg-gray-800">
          After select
        </button>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("combobox", { name: "Member role" });

    trigger.focus();
    await userEvent.keyboard("{ArrowDown}");
    await expect(trigger).toHaveAttribute("aria-expanded", "true");
    await userEvent.keyboard("{ArrowDown}{Enter}");
    await expect(trigger).toHaveTextContent("Administrator");
    await expect(trigger).toHaveFocus();
    await userEvent.keyboard("{ArrowDown}{Tab}");
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
    await expect(
      canvas.getByRole("button", { name: "After select" }),
    ).toHaveFocus();
  },
};

export const States = {
  parameters: { layout: "fullscreen", controls: { disable: true } },
  render: () => ({
    components: { Select },
    template: `
      <section class="klean-story-canvas px-5 py-12 sm:px-10" aria-labelledby="select-states-title">
        <header class="max-w-2xl">
          <p class="font-mono text-[11px] uppercase tracking-[0.2em] text-klean-muted">Select / state sheet</p>
          <h1 id="select-states-title" class="mt-3 text-3xl font-semibold tracking-[-0.04em]">Fixed choices stay fixed—and typed.</h1>
          <p class="mt-4 text-sm leading-6 text-klean-muted">Placeholders, booleans, groups, disabled options, empty data, and invalid relationships use one API.</p>
        </header>

        <div class="mt-10 grid max-w-4xl gap-7 sm:grid-cols-2">
          <div class="grid gap-2">
            <label for="boolean-select" class="text-sm font-medium">Service state</label>
            <Select id="boolean-select" v-model="active" :options="[{ value: true, label: 'Active' }, { value: false, label: 'Paused' }]" />
            <p class="text-sm text-klean-muted">Boolean: {{ active }}</p>
          </div>

          <div class="grid gap-2">
            <label for="grouped-select" class="text-sm font-medium">Region</label>
            <Select id="grouped-select" v-model="grouped" :options="groupedOptions" />
          </div>

          <div class="grid gap-2">
            <label for="empty-select" class="text-sm font-medium">Repository</label>
            <Select id="empty-select" v-model="empty" :options="[]" placeholder="Choose a repository" />
          </div>

          <div class="grid gap-2">
            <label for="invalid-select" class="text-sm font-medium">Deployment target</label>
            <Select id="invalid-select" :options="[{ value: 'production', label: 'Production' }]" aria-invalid="true" aria-describedby="target-error" />
            <p id="target-error" class="text-sm text-red-700 dark:text-red-400">Choose a deployment target.</p>
          </div>

          <div class="grid gap-2">
            <label for="disabled-select" class="text-sm font-medium">Unavailable control</label>
            <Select id="disabled-select" disabled default-value="viewer" :options="roleOptions" />
          </div>
        </div>
      </section>
    `,
    setup() {
      const active = ref(false);
      const empty = ref();
      const grouped = ref("lagos");
      const groupedOptions = [
        { value: "lagos", label: "Lagos", group: "Nigeria" },
        { value: "abuja", label: "Abuja", group: "Nigeria" },
        { value: "accra", label: "Accra", group: "Ghana" },
        { value: "kumasi", label: "Kumasi", group: "Ghana", disabled: true },
      ];
      return { active, empty, grouped, groupedOptions, roleOptions };
    },
  }),
};

export const DynamicOptions = {
  parameters: { controls: { disable: true } },
  render: () => ({
    components: { Select },
    setup() {
      const includeArchived = ref(false);
      const value = ref("main");
      const available = [
        { value: "main", label: "main" },
        { value: "develop", label: "develop" },
      ];
      const archived = [
        ...available,
        { value: "legacy-v1", label: "legacy-v1 (archived)" },
      ];
      return { archived, available, includeArchived, value };
    },
    template: `
      <div class="grid w-[min(24rem,calc(100vw-2rem))] gap-4">
        <label for="branch-select" class="text-sm font-medium">Deploy branch</label>
        <Select id="branch-select" v-model="value" :options="includeArchived ? archived : available" />
        <button type="button" class="min-h-11 cursor-pointer rounded-md border border-gray-300 px-3 text-sm hover:bg-gray-100 focus-visible:outline-2 focus-visible:outline-offset-2" @click="includeArchived = !includeArchived">
          {{ includeArchived ? 'Hide' : 'Include' }} archived branches
        </button>
      </div>
    `,
  }),
};

export const Products = {
  parameters: { layout: "fullscreen", controls: { disable: true } },
  render: () => ({
    components: { Select },
    setup() {
      const invoiceStatus = ref("draft");
      const environment = ref("production");
      return { environment, invoiceStatus };
    },
    template: `
      <div class="grid min-h-[36rem] sm:grid-cols-2">
        <section class="bg-[#f4f0e8] p-8 sm:p-14 [&_[data-slot=select-content]]:rounded-none [&_[data-slot=select-content]]:border-2 [&_[data-slot=select-content]]:border-black [&_[data-slot=select-content]]:shadow-[6px_6px_0_0_#000]" aria-labelledby="hagfish-select-title">
          <p class="font-mono text-xs uppercase tracking-[0.18em] text-gray-600">Hagfish / invoice</p>
          <h2 id="hagfish-select-title" class="mt-5 text-2xl font-semibold text-black">Invoice status</h2>
          <div class="mt-5 max-w-sm">
            <Select
              id="hagfish-status"
              v-model="invoiceStatus"
              :options="[{ value: 'draft', label: 'Draft' }, { value: 'sent', label: 'Sent' }, { value: 'paid', label: 'Paid' }]"
              class="rounded-none border-2 border-black bg-white text-black shadow-[4px_4px_0_0_#000] hover:border-black focus-visible:border-black focus-visible:outline-black"
            />
          </div>
        </section>

        <section class="dark bg-gray-950 p-8 text-white sm:p-14 [&_[data-slot=select-content]]:border-gray-700 [&_[data-slot=select-content]]:bg-gray-900 [&_[data-slot=select-content]]:shadow-xl" aria-labelledby="slipway-select-title">
          <p class="font-mono text-xs uppercase tracking-[0.18em] text-gray-400">Slipway / deploy</p>
          <h2 id="slipway-select-title" class="mt-5 text-2xl font-semibold">Environment</h2>
          <div class="mt-5 max-w-sm">
            <Select
              id="slipway-environment"
              v-model="environment"
              :options="[{ value: 'preview', label: 'Preview' }, { value: 'staging', label: 'Staging' }, { value: 'production', label: 'Production' }]"
              class="min-h-9 border-gray-700 bg-gray-900 px-3 py-1.5 text-sm text-white shadow-none hover:border-gray-600 focus-visible:border-white focus-visible:outline-white"
            />
          </div>
        </section>
      </div>
    `,
  }),
};
