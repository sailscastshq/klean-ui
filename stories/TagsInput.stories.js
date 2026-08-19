import { expect, userEvent, within } from "storybook/test";
import { ref } from "vue";
import TagsInput from "../src/vue/tags-input/TagsInput.vue";

const meta = {
  title: "Components/Tags Input",
  component: TagsInput,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A one-piece tags field for real forms. The caller owns the committed string array and can also bind the unfinished draft so navigation, restoration, dirty state, and submission stay honest.",
      },
    },
  },
  args: {
    placeholder: "Add a tag",
    disabled: false,
    readonly: false,
    required: false,
    max: 5,
    class: "",
  },
  argTypes: {
    placeholder: { control: "text" },
    disabled: { control: "boolean" },
    readonly: { control: "boolean" },
    required: { control: "boolean" },
    max: { control: { type: "number", min: 1, max: 12 } },
    class: {
      control: "text",
      description: "Ordinary Tailwind classes merged onto the field root.",
    },
  },
};

export default meta;

export const Playground = {
  parameters: {
    controls: {
      include: [
        "placeholder",
        "disabled",
        "readonly",
        "required",
        "max",
        "class",
      ],
    },
  },
  render: (args) => ({
    components: { TagsInput },
    setup() {
      const tags = ref(["billing", "invoice"]);
      const draft = ref("");
      return { args, tags, draft };
    },
    template: `
      <div class="grid w-[min(34rem,calc(100vw-2rem))] gap-2">
        <label for="tags-playground" class="text-sm font-medium text-gray-950 dark:text-white">Tags</label>
        <TagsInput
          id="tags-playground"
          v-model="tags"
          v-model:draft="draft"
          name="tags"
          :placeholder="args.placeholder"
          :disabled="args.disabled"
          :readonly="args.readonly"
          :required="args.required"
          :max="args.max"
          :class="args.class"
          aria-describedby="tags-playground-help"
        />
        <p id="tags-playground-help" class="text-sm text-gray-500 dark:text-gray-400">Press Enter or comma to add. Paste a comma-separated list.</p>
        <p class="font-mono text-xs text-gray-500 dark:text-gray-400">tags: {{ JSON.stringify(tags) }} · draft: {{ JSON.stringify(draft) }}</p>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole("textbox", { name: "Tags" });
    await userEvent.click(input);
    await userEvent.type(input, "overdue{Enter}");
    await expect(canvas.getByText("overdue")).toBeInTheDocument();
    await expect(input).toHaveValue("");
  },
};

export const States = {
  parameters: { layout: "fullscreen", controls: { disable: true } },
  render: () => ({
    components: { TagsInput },
    setup() {
      const ordinary = ref(["billing", "paid"]);
      const invalid = ref(["invoice"]);
      const limited = ref(["one", "two"]);
      const readonlyTags = ref(["imported", "verified"]);
      return { invalid, limited, ordinary, readonlyTags };
    },
    template: `
      <section class="klean-story-canvas px-5 py-12 sm:px-10" aria-labelledby="tags-states-title">
        <header class="max-w-2xl">
          <p class="font-mono text-[11px] uppercase tracking-[0.2em] text-klean-muted">Tags Input / state sheet</p>
          <h1 id="tags-states-title" class="mt-3 text-3xl font-semibold tracking-[-0.04em]">Small API. Complete form behavior.</h1>
          <p class="mt-4 text-sm leading-6 text-klean-muted">Caller Tailwind, native labels and errors, durable pending text, limits, and read-only data all use the same component.</p>
        </header>

        <div class="mt-10 grid max-w-5xl gap-7 md:grid-cols-2">
          <div class="grid gap-2">
            <label for="ordinary-tags" class="text-sm font-medium">Ordinary</label>
            <TagsInput id="ordinary-tags" v-model="ordinary" />
          </div>

          <div class="grid gap-2">
            <label for="invalid-tags" class="text-sm font-medium">Invalid relationship</label>
            <TagsInput id="invalid-tags" v-model="invalid" aria-invalid="true" aria-describedby="invalid-tags-error" />
            <p id="invalid-tags-error" class="text-sm text-red-700 dark:text-red-400">Use at least two expense tags.</p>
          </div>

          <div class="grid gap-2">
            <label for="limited-tags" class="text-sm font-medium">Maximum two</label>
            <TagsInput id="limited-tags" v-model="limited" :max="2" />
          </div>

          <div class="grid gap-2">
            <label for="readonly-tags" class="text-sm font-medium">Read only</label>
            <TagsInput id="readonly-tags" v-model="readonlyTags" readonly />
          </div>

          <div class="grid gap-2 md:col-span-2">
            <label for="styled-tags" class="text-sm font-medium">Caller-owned treatment</label>
            <TagsInput
              id="styled-tags"
              v-model="ordinary"
              class="rounded-none border-2 border-gray-950 shadow-[5px_5px_0_#111] **:data-[part=tag]:rounded-none **:data-[part=tag]:bg-amber-100 dark:border-white dark:shadow-[5px_5px_0_#fff] dark:**:data-[part=tag]:bg-amber-950"
            />
          </div>
        </div>
      </section>
    `,
  }),
};

export const Apps = {
  name: "App recipes",
  parameters: { layout: "fullscreen", controls: { disable: true } },
  render: () => ({
    components: { TagsInput },
    setup() {
      const expenseTags = ref(["software", "monthly"]);
      const filterTags = ref(["production"]);
      const restoredTags = ref(["customer"]);
      const restoredDraft = ref("follow up");
      const tagRule = (tag) =>
        tag.length <= 24 || "Keep tags to 24 characters or fewer.";
      return {
        expenseTags,
        filterTags,
        restoredDraft,
        restoredTags,
        tagRule,
      };
    },
    template: `
      <section class="klean-story-canvas px-5 py-12 sm:px-10" aria-labelledby="tags-apps-title">
        <header class="max-w-2xl">
          <p class="font-mono text-[11px] uppercase tracking-[0.2em] text-klean-muted">Tags Input / real applications</p>
          <h1 id="tags-apps-title" class="mt-3 text-3xl font-semibold tracking-[-0.04em]">Hagfish entry. Slipway filtering. Restored work.</h1>
        </header>

        <div class="mt-10 grid max-w-6xl gap-8 lg:grid-cols-3">
          <article class="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-950">
            <p class="font-mono text-[11px] uppercase tracking-[0.18em] text-klean-muted">Hagfish / Expense</p>
            <label for="expense-tags" class="mt-5 block text-sm font-semibold">Tags</label>
            <TagsInput
              id="expense-tags"
              v-model="expenseTags"
              name="tags"
              :validate="tagRule"
              class="mt-2 rounded-none border-2 border-gray-950 shadow-[4px_4px_0_#111] **:data-[part=tag]:rounded-none dark:border-white dark:shadow-[4px_4px_0_#fff]"
              aria-describedby="expense-tags-help"
            />
            <p id="expense-tags-help" class="mt-2 text-sm text-klean-muted">Examples: software, travel, office.</p>
          </article>

          <article class="rounded-xl bg-gray-950 p-6 text-white shadow-sm">
            <p class="font-mono text-[11px] uppercase tracking-[0.18em] text-gray-400">Slipway / Log filters</p>
            <label for="filter-tags" class="mt-5 block text-sm font-semibold">Match labels</label>
            <TagsInput
              id="filter-tags"
              v-model="filterTags"
              class="mt-2 border-gray-700 bg-gray-900 text-white **:data-[part=tag]:bg-gray-700 **:data-[part=tag]:text-white"
              placeholder="Add a label"
            />
            <p class="mt-3 font-mono text-xs text-gray-400">{{ filterTags.join(' + ') }}</p>
          </article>

          <article class="rounded-xl border border-dashed border-gray-300 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-950">
            <p class="font-mono text-[11px] uppercase tracking-[0.18em] text-klean-muted">Restored form draft</p>
            <label for="restored-tags" class="mt-5 block text-sm font-semibold">Customer labels</label>
            <TagsInput
              id="restored-tags"
              v-model="restoredTags"
              v-model:draft="restoredDraft"
              class="mt-2"
            />
            <p class="mt-2 text-sm text-klean-muted">The unfinished text returns with the committed tags, so the form is honestly restored.</p>
          </article>
        </div>
      </section>
    `,
  }),
};
