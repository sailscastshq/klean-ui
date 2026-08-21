import { ref, watch } from "vue";
import { expect, userEvent, within } from "storybook/test";
import Radio from "../src/vue/radio/Radio.vue";

const regions = [
  { value: "frankfurt", label: "Frankfurt", hint: "Central Europe" },
  { value: "lagos", label: "Lagos", hint: "West Africa" },
  { value: "virginia", label: "Virginia", hint: "US East" },
];

const meta = {
  title: "Components/Radio",
  component: Radio,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A native radio for one mutually exclusive choice. The browser owns grouping and keyboard behavior; applications keep fieldsets, legends, labels, descriptions, and selection styling in visible markup.",
      },
    },
  },
  args: {
    legend: "Deployment region",
    selected: "lagos",
    disabled: false,
    required: true,
    invalid: false,
    class: "",
  },
  argTypes: {
    legend: {
      control: "text",
      description: "Visible legend supplied by the story composition.",
    },
    selected: {
      control: "select",
      options: regions.map((region) => region.value),
      description: "Scalar value supplied through Vue v-model.",
    },
    disabled: { control: "boolean", description: "Disables every choice." },
    required: {
      control: "boolean",
      description: "Uses native required validation for the group.",
    },
    invalid: {
      control: "boolean",
      description: "Connects the group to visible caller-owned error text.",
    },
    class: {
      control: "text",
      description: "Caller Tailwind classes merged after neutral defaults.",
    },
  },
};

export default meta;

export const Playground = {
  parameters: {
    controls: {
      include: [
        "legend",
        "selected",
        "disabled",
        "required",
        "invalid",
        "class",
      ],
    },
  },
  render: (args) => ({
    components: { Radio },
    setup() {
      const selected = ref(args.selected);
      watch(
        () => args.selected,
        (value) => {
          selected.value = value;
        },
      );
      return { args, regions, selected };
    },
    template: `
      <fieldset class="w-[min(26rem,calc(100vw-2rem))] text-gray-950 dark:text-white" :aria-describedby="args.invalid ? 'region-error' : undefined">
        <legend class="text-sm font-semibold">{{ args.legend }}</legend>
        <div class="mt-3 space-y-2">
          <label v-for="region in regions" :key="region.value" class="flex min-h-14 cursor-pointer items-center gap-3 rounded-lg border border-gray-200 bg-white px-4 py-3 has-checked:border-gray-950 dark:border-gray-800 dark:bg-gray-950 dark:has-checked:border-white">
            <Radio
              v-model="selected"
              name="playground-region"
              :value="region.value"
              :disabled="args.disabled"
              :required="args.required"
              :aria-invalid="args.invalid ? 'true' : undefined"
              :class="args.class"
            />
            <span>
              <span class="block text-sm font-medium">{{ region.label }}</span>
              <span class="mt-0.5 block text-xs text-gray-500">{{ region.hint }}</span>
            </span>
          </label>
        </div>
        <p v-if="args.invalid" id="region-error" class="mt-3 text-sm text-red-600 dark:text-red-500">Choose a deployment region.</p>
      </fieldset>
    `,
  }),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const radios = canvas.getAllByRole("radio");
    const selectedIndex = regions.findIndex(
      (region) => region.value === args.selected,
    );

    await expect(radios[selectedIndex].checked).toBe(true);

    if (!args.disabled) {
      const next = radios[(selectedIndex + 1) % radios.length];
      await userEvent.click(next);
      await expect(next.checked).toBe(true);
      await expect(radios.filter((radio) => radio.checked)).toHaveLength(1);
      await expect(next).toHaveFocus();
    }
  },
};

export const States = {
  parameters: { layout: "fullscreen", controls: { disable: true } },
  render: () => ({
    components: { Radio },
    setup() {
      const plan = ref("pro");
      const support = ref();
      const submitted = ref("");

      function submit(event) {
        submitted.value = new FormData(event.currentTarget).get("support");
      }

      return { plan, submitted, submit, support };
    },
    template: `
      <section class="klean-story-canvas px-5 py-14 sm:px-8 lg:px-12 lg:py-20" aria-labelledby="radio-states-title">
        <header class="max-w-3xl">
          <h1 id="radio-states-title" class="text-balance text-4xl font-semibold tracking-tighter sm:text-5xl">One choice, kept honest by the browser.</h1>
          <p class="mt-5 max-w-2xl text-pretty text-base leading-7 text-klean-muted">A shared name creates the group. Fieldset and legend give it meaning. Arrow keys, required validation, submission, and reset remain native.</p>
        </header>

        <div class="mt-12 grid max-w-5xl gap-8 bg-white p-6 sm:grid-cols-2 sm:p-10 dark:bg-gray-950">
          <fieldset class="space-y-3">
            <legend class="text-sm font-semibold">Plan</legend>
            <label v-for="option in ['starter', 'pro', 'team']" :key="option" class="flex cursor-pointer items-center gap-3 text-sm capitalize">
              <Radio v-model="plan" name="plan" :value="option" />
              {{ option }}
            </label>
          </fieldset>

          <fieldset class="space-y-3 text-gray-500">
            <legend class="text-sm font-semibold">Unavailable region</legend>
            <label class="flex cursor-not-allowed items-center gap-3 text-sm">
              <Radio model-value="archive" name="archive-region" value="archive" disabled />
              Archive cluster
            </label>
          </fieldset>

          <form class="space-y-3" @submit.prevent="submit">
            <fieldset aria-describedby="support-error">
              <legend class="text-sm font-semibold">Support tier</legend>
              <div class="mt-3 space-y-3">
                <label class="flex cursor-pointer items-center gap-3 text-sm">
                  <Radio v-model="support" name="support" value="standard" required aria-invalid="true" />
                  Standard support
                </label>
                <label class="flex cursor-pointer items-center gap-3 text-sm">
                  <Radio v-model="support" name="support" value="priority" required aria-invalid="true" />
                  Priority support
                </label>
              </div>
            </fieldset>
            <p id="support-error" class="text-sm text-red-600 dark:text-red-500">Choose a support tier before continuing.</p>
            <button class="min-h-11 bg-gray-950 px-4 py-2 text-sm font-medium text-white dark:bg-white dark:text-gray-950">Continue</button>
            <p v-if="submitted" class="text-sm text-gray-500">Submitted: {{ submitted }}</p>
          </form>

          <fieldset class="space-y-3">
            <legend class="text-sm font-semibold">Caller styling</legend>
            <label class="flex cursor-pointer items-center gap-3 text-sm text-emerald-700 dark:text-emerald-400">
              <Radio model-value="green" name="accent" value="green" class="size-5 text-emerald-700 focus-visible:outline-emerald-700 dark:text-emerald-400 dark:focus-visible:outline-emerald-400" />
              Ordinary Tailwind wins
            </label>
          </fieldset>
        </div>
      </section>
    `,
  }),
};

export const Form = {
  parameters: { controls: { disable: true } },
  render: () => ({
    components: { Radio },
    setup() {
      return { region: ref("lagos"), regions };
    },
    template: `
      <form class="w-[min(26rem,calc(100vw-2rem))]" @submit.prevent>
        <fieldset>
          <legend class="text-sm font-semibold">Deployment region</legend>
          <div class="mt-3 space-y-3">
            <label v-for="item in regions" :key="item.value" class="flex cursor-pointer items-center gap-3 text-sm">
              <Radio v-model="region" name="vue-form-region" :value="item.value" />
              {{ item.label }}
            </label>
          </div>
        </fieldset>
        <div class="mt-5 flex items-center gap-3">
          <button type="reset" class="min-h-11 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium dark:border-gray-700">Reset</button>
          <output class="font-mono text-xs text-gray-500">{{ region }}</output>
        </div>
      </form>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const virginia = canvas.getByRole("radio", { name: "Virginia" });
    await userEvent.click(virginia);
    await expect(virginia.checked).toBe(true);

    await userEvent.click(canvas.getByRole("button", { name: "Reset" }));
    await expect(canvas.getByRole("radio", { name: "Lagos" }).checked).toBe(
      true,
    );
    await expect(canvas.getByText("lagos")).toBeInTheDocument();
  },
};

export const Apps = {
  parameters: { layout: "fullscreen", controls: { disable: true } },
  render: () => ({
    components: { Radio },
    setup() {
      const category = ref("all");
      const participation = ref(false);
      const provider = ref("s3");
      return { category, participation, provider };
    },
    template: `
      <section class="klean-story-canvas px-5 py-14 sm:px-8 lg:px-12 lg:py-20" aria-labelledby="radio-apps-title">
        <header class="max-w-3xl">
          <h1 id="radio-apps-title" class="text-4xl font-semibold tracking-tighter sm:text-5xl">The radio can disappear. Its semantics cannot.</h1>
          <p class="mt-5 max-w-2xl text-base leading-7 text-klean-muted">These patterns come from Slipway: a conventional provider list, large participation cards, and compact filters. The caller owns every visual treatment.</p>
        </header>

        <div class="mt-12 grid max-w-6xl gap-6 lg:grid-cols-2">
          <article class="overflow-hidden rounded-lg border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950">
            <fieldset>
              <legend class="px-4 py-3 text-sm font-medium">Storage provider</legend>
              <div class="divide-y divide-gray-200 border-t border-gray-200 dark:divide-gray-800 dark:border-gray-800">
                <label v-for="item in [{ value: 's3', label: 'Amazon S3', hint: 'Managed object storage' }, { value: 'r2', label: 'Cloudflare R2', hint: 'Egress-friendly storage' }]" :key="item.value" class="flex cursor-pointer items-center gap-3 px-4 py-3 transition-colors hover:bg-gray-50 dark:hover:bg-gray-900/50">
                  <Radio v-model="provider" name="provider" :value="item.value" />
                  <span>
                    <span class="block text-sm font-medium">{{ item.label }}</span>
                    <span class="mt-0.5 block text-xs text-gray-500">{{ item.hint }}</span>
                  </span>
                </label>
              </div>
            </fieldset>
          </article>

          <article class="bg-white p-6 dark:bg-gray-950">
            <fieldset>
              <legend class="text-sm font-semibold">Participation</legend>
              <p class="mt-1 text-sm leading-6 text-gray-500">Choose who can submit and vote.</p>
              <div class="mt-5 grid gap-3 sm:grid-cols-2">
                <label class="cursor-pointer rounded-xl bg-gray-50 p-4 text-gray-950 transition has-checked:bg-gray-950 has-checked:text-white dark:bg-gray-900 dark:text-white dark:has-checked:bg-white dark:has-checked:text-gray-950">
                  <Radio v-model="participation" class="sr-only" name="participation" :value="false" />
                  <span class="block text-sm font-medium">Logged-in users only</span>
                  <span class="mt-2 block text-sm opacity-70">Every vote has a person behind it.</span>
                </label>
                <label class="cursor-pointer rounded-xl bg-gray-50 p-4 text-gray-950 transition has-checked:bg-gray-950 has-checked:text-white dark:bg-gray-900 dark:text-white dark:has-checked:bg-white dark:has-checked:text-gray-950">
                  <Radio v-model="participation" class="sr-only" name="participation" :value="true" />
                  <span class="block text-sm font-medium">Anyone</span>
                  <span class="mt-2 block text-sm opacity-70">Anonymous participation is allowed.</span>
                </label>
              </div>
            </fieldset>
          </article>

          <article class="bg-white p-6 dark:bg-gray-950 lg:col-span-2">
            <fieldset>
              <legend class="text-xs font-medium text-gray-500">Category</legend>
              <div class="mt-3 flex flex-wrap gap-2">
                <label v-for="item in ['all', 'billing', 'deploys', 'domains']" :key="item" class="min-h-11 cursor-pointer rounded-xl bg-gray-50 px-4 py-3 text-sm font-medium text-gray-500 transition has-checked:bg-gray-950 has-checked:text-white dark:bg-gray-900 dark:text-gray-400 dark:has-checked:bg-white dark:has-checked:text-gray-950">
                  <Radio v-model="category" class="sr-only" name="category" :value="item" />
                  {{ item === 'all' ? 'All categories' : item }}
                </label>
              </div>
            </fieldset>
          </article>
        </div>
      </section>
    `,
  }),
};
