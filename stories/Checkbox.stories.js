import { computed, ref, watch } from "vue";
import { expect, userEvent, within } from "storybook/test";
import Checkbox from "../src/vue/checkbox/Checkbox.vue";

const meta = {
  title: "Components/Checkbox",
  component: Checkbox,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A native checkbox with real form behavior, indeterminate state, and ordinary Tailwind styling. Labels, descriptions, groups, and selection rules remain visible application markup.",
      },
    },
  },
  args: {
    indeterminate: false,
    disabled: false,
    required: false,
    class: "",
  },
  argTypes: {
    indeterminate: {
      control: "boolean",
      description: "Shows a partial selection without creating a third value.",
    },
    disabled: { control: "boolean", description: "Native disabled state." },
    required: { control: "boolean", description: "Native required state." },
    class: {
      control: "text",
      description: "Caller Tailwind classes merged after neutral defaults.",
    },
  },
};

export default meta;

export const Playground = {
  args: {
    label: "Send deployment notifications",
    checked: false,
  },
  argTypes: {
    label: {
      control: "text",
      description: "Visible label supplied by this story composition.",
    },
    checked: {
      control: "boolean",
      description: "Boolean state supplied through Vue v-model.",
    },
  },
  parameters: {
    controls: {
      include: [
        "label",
        "checked",
        "indeterminate",
        "disabled",
        "required",
        "class",
      ],
    },
  },
  render: (args) => ({
    components: { Checkbox },
    setup() {
      const checked = ref(args.checked);
      watch(
        () => args.checked,
        (value) => {
          checked.value = value;
        },
      );
      return { args, checked };
    },
    template: `
      <label class="flex max-w-sm cursor-pointer items-start gap-3 rounded-lg border border-gray-200 bg-white p-4 text-gray-950 shadow-sm dark:border-gray-800 dark:bg-gray-950 dark:text-white">
        <Checkbox
          v-model="checked"
          name="deploymentNotifications"
          :indeterminate="args.indeterminate"
          :disabled="args.disabled"
          :required="args.required"
          :class="args.class"
        />
        <span>
          <span class="block text-sm font-medium">{{ args.label }}</span>
          <span class="mt-1 block text-sm text-gray-500">Get one message when a deployment finishes.</span>
        </span>
      </label>
    `,
  }),
  play: async ({ canvasElement, args }) => {
    const checkbox = within(canvasElement).getByRole("checkbox");
    if (!args.disabled) {
      const previous = checkbox.checked;
      await userEvent.click(checkbox);
      await expect(checkbox.checked).toBe(!previous);
      await expect(checkbox).toHaveFocus();
    }
  },
};

export const States = {
  parameters: { layout: "fullscreen", controls: { disable: true } },
  render: () => ({
    components: { Checkbox },
    setup() {
      const options = ["Builds", "Deployments", "Incidents"];
      const selected = ref(["Builds"]);
      const allChecked = computed(
        () => selected.value.length === options.length,
      );
      const partial = computed(
        () => selected.value.length > 0 && !allChecked.value,
      );

      function toggleAll(event) {
        selected.value = event.target.checked ? [...options] : [];
      }

      return { allChecked, options, partial, selected, toggleAll };
    },
    template: `
      <section class="klean-story-canvas px-5 py-14 sm:px-8 lg:px-12 lg:py-20" aria-labelledby="checkbox-states-title">
        <header class="max-w-3xl">
          <h1 id="checkbox-states-title" class="text-balance text-4xl font-semibold tracking-tighter sm:text-5xl">A small control with honest state.</h1>
          <p class="mt-5 max-w-2xl text-pretty text-base leading-7 text-klean-muted">The input remains native. Real labels, groups, error text, and selection logic stay where the application can read and change them.</p>
        </header>

        <div class="mt-12 grid max-w-5xl gap-8 bg-white p-6 sm:grid-cols-2 sm:p-10 dark:bg-gray-950">
          <label class="flex cursor-pointer items-start gap-3">
            <Checkbox name="weeklyDigest" />
            <span>
              <span class="block text-sm font-medium">Weekly digest</span>
              <span class="mt-1 block text-sm text-gray-500">A straightforward boolean.</span>
            </span>
          </label>

          <label class="flex cursor-not-allowed items-start gap-3 text-gray-500">
            <Checkbox name="auditExport" disabled />
            <span>
              <span class="block text-sm font-medium">Audit exports</span>
              <span class="mt-1 block text-sm">Available on the team plan.</span>
            </span>
          </label>

          <fieldset class="space-y-3">
            <legend class="text-sm font-semibold">Notify me about</legend>
            <label v-for="option in options" :key="option" class="flex cursor-pointer items-center gap-3 text-sm">
              <Checkbox :id="'checkbox-row-' + option.toLowerCase()" v-model="selected" name="notifications" :value="option" />
              {{ option }}
            </label>
          </fieldset>

          <fieldset class="space-y-3">
            <legend class="text-sm font-semibold">Bulk selection</legend>
            <label class="flex cursor-pointer items-center gap-3 border-b border-gray-200 pb-3 dark:border-gray-800">
              <Checkbox
                aria-controls="checkbox-row-builds checkbox-row-deployments checkbox-row-incidents"
                :model-value="allChecked"
                :indeterminate="partial"
                @change="toggleAll"
              />
              <span class="text-sm font-medium">Select all</span>
            </label>
            <p class="text-sm text-gray-500">{{ selected.length }} of {{ options.length }} selected</p>
          </fieldset>
        </div>
      </section>
    `,
  }),
};

export const Apps = {
  parameters: { layout: "fullscreen", controls: { disable: true } },
  render: () => ({
    components: { Checkbox },
    setup() {
      const autoScroll = ref(true);
      const purgeData = ref(false);
      const rememberMe = ref(false);
      const feedbackIds = ref(["billing"]);
      return { autoScroll, feedbackIds, purgeData, rememberMe };
    },
    template: `
      <section class="klean-story-canvas px-5 py-14 sm:px-8 lg:px-12 lg:py-20" aria-labelledby="checkbox-apps-title">
        <header class="max-w-3xl">
          <h1 id="checkbox-apps-title" class="text-4xl font-semibold tracking-tighter sm:text-5xl">One input. Different products.</h1>
        </header>

        <div class="mt-12 grid max-w-6xl gap-6 lg:grid-cols-2">
          <article class="bg-gray-950 p-6 text-white">
            <div class="mt-8 flex items-center justify-between border-t border-gray-800 pt-4">
              <code class="text-sm text-gray-400">service: web · live</code>
              <label class="flex cursor-pointer items-center gap-2 text-xs text-gray-400">
                <Checkbox v-model="autoScroll" class="size-3.5 text-white focus-visible:outline-white" />
                Auto-scroll
              </label>
            </div>
          </article>

          <article class="border border-black bg-[#f4f0e8] p-6 text-black shadow-[4px_4px_0_0_#000]">
            <label class="mt-8 flex cursor-pointer items-center gap-2 text-sm text-black/60">
              <Checkbox v-model="rememberMe" class="cursor-pointer text-black focus-visible:outline-black" />
              Remember me
            </label>
          </article>

          <article class="bg-white p-6 dark:bg-gray-950">
            <label class="mt-8 flex cursor-pointer items-start gap-3">
              <Checkbox v-model="purgeData" required class="mt-0.5 text-red-600 focus-visible:outline-red-600 dark:text-red-500" />
              <span>
                <span class="block text-sm font-medium">Also permanently delete retained data</span>
                <span class="mt-1 block text-sm text-gray-500">This cannot be recovered after the project is removed.</span>
              </span>
            </label>
          </article>

          <article class="bg-white p-6 dark:bg-gray-950">
            <fieldset>
              <legend class="text-sm font-semibold text-gray-700">Filter logs</legend>
              <div class="mt-8 flex flex-wrap gap-2">
                <label v-for="item in ['billing', 'deploys', 'domains']" :key="item" class="has-checked:bg-gray-950 has-checked:text-white dark:has-checked:bg-white dark:has-checked:text-gray-950 cursor-pointer rounded-full bg-gray-100 px-3 py-2 text-xs dark:bg-gray-900">
                  <Checkbox v-model="feedbackIds" :value="item" class="sr-only" />
                  {{ item }}
                </label>
              </div>
            </fieldset>
          </article>
        </div>
      </section>
    `,
  }),
};
