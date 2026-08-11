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
      const category = ref("feature");
      const categoryOptions = [
        { value: "feature", label: "Feature" },
        { value: "bug", label: "Bug" },
      ];
      return { category, categoryOptions };
    },
    template: `
      <section
        class="min-h-144 bg-white px-5 py-14 text-gray-950 dark:bg-gray-950 dark:text-white sm:px-10 sm:py-20"
        aria-labelledby="slipway-select-title"
      >
        <div class="mx-auto max-w-2xl">
          <p class="text-xs font-medium uppercase tracking-[0.16em] text-gray-500 dark:text-gray-400">Slipway / Bearing feedback</p>
          <h2 id="slipway-select-title" class="mt-3 text-2xl font-semibold tracking-tight">Share feedback</h2>
          <p class="mt-2 max-w-xl text-sm leading-6 text-gray-500 dark:text-gray-400">
            Choose a fixed feedback category without turning the compact composer header into a form field.
          </p>

          <div class="mt-8 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-950 sm:p-7">
            <div
              class="flex items-center gap-3 **:data-[slot=select]:w-auto **:data-[slot=select-content]:max-h-64 **:data-[slot=select-content]:min-w-44 **:data-[slot=select-content]:max-w-[min(20rem,calc(100vw-2.5rem))] **:data-[slot=select-content]:rounded-xl **:data-[slot=select-content]:border-gray-200 **:data-[slot=select-content]:bg-white **:data-[slot=select-content]:p-1 **:data-[slot=select-content]:shadow-xl **:data-[slot=select-content]:shadow-gray-950/10 dark:**:data-[slot=select-content]:border-gray-700 dark:**:data-[slot=select-content]:bg-gray-900 dark:**:data-[slot=select-content]:shadow-black/30 **:data-[slot=select-option]:min-h-10 **:data-[slot=select-option]:rounded-none **:data-[slot=select-option]:px-3.5 **:data-[slot=select-option]:py-2 **:data-[slot=select-option]:text-gray-700 dark:**:data-[slot=select-option]:text-gray-300 [&_[data-slot=select-option][data-highlighted]]:bg-gray-50 dark:[&_[data-slot=select-option][data-highlighted]]:bg-gray-800 **:data-[slot=select-indicator]:text-gray-500 dark:**:data-[slot=select-indicator]:text-gray-400"
            >
              <span
                role="img"
                aria-label="Posting as Kelvin"
                title="Posting as Kelvin"
                class="grid size-10 shrink-0 place-items-center rounded-full bg-gray-950 text-xs font-semibold text-white dark:bg-white dark:text-gray-950"
              >
                <span aria-hidden="true">KO</span>
              </span>

              <svg aria-hidden="true" viewBox="0 0 16 16" class="size-4 shrink-0 text-gray-300 dark:text-gray-700" fill="none">
                <path d="m6 3.5 4.5 4.5L6 12.5" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" />
              </svg>

              <div>
                <span id="slipway-category-label" class="sr-only">Category</span>
                <Select
                  id="slipway-category"
                  v-model="category"
                  :options="categoryOptions"
                  aria-labelledby="slipway-category-label"
                  class="min-h-10 w-auto max-w-[16rem] rounded-lg border-0 bg-gray-100 px-3.5 py-2 text-sm font-semibold text-gray-950 shadow-none hover:border-transparent hover:bg-gray-200 focus-visible:border-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-950 focus-visible:ring-offset-2 dark:bg-gray-900 dark:text-white dark:hover:border-transparent dark:hover:bg-gray-800 dark:focus-visible:border-transparent dark:focus-visible:ring-white dark:focus-visible:ring-offset-gray-950"
                />
              </div>
            </div>

            <label for="slipway-feedback-summary" class="sr-only">Summary</label>
            <input
              id="slipway-feedback-summary"
              type="text"
              placeholder="What would make this better?"
              class="mt-7 w-full border-0 bg-transparent p-0 text-xl font-semibold tracking-tight text-gray-950 placeholder:font-medium placeholder:text-gray-300 focus:ring-0 dark:text-white dark:placeholder:text-gray-500 sm:text-2xl"
            />
          </div>

          <p class="mt-5 text-sm text-gray-500 dark:text-gray-400">
            Current category: <span class="font-medium text-gray-950 dark:text-white">{{ category }}</span>
          </p>
        </div>
      </section>
    `,
  }),
};
