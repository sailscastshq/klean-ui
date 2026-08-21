import { expect, within } from "storybook/test";
import Sparkline from "../src/vue/sparkline/Sparkline.vue";

const activity = [
  { label: "12:00", value: 12 },
  { label: "12:10", value: 18 },
  { label: "12:20", value: 15 },
  { label: "12:30", value: 32 },
  { label: "12:40", value: 28 },
  { label: "12:50", value: 44 },
  { label: "13:00", value: 36 },
];

const meta = {
  title: "Components/Sparkline",
  component: Sparkline,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A tiny native-SVG trend for use beside an exact value. It is decorative by default, becomes an image when labelled, uses currentColor, and leaves formatting and persistence to the application.",
      },
    },
  },
  args: {
    label: "",
    class: "h-8 w-40 text-gray-950 dark:text-white",
  },
  argTypes: {
    label: {
      control: "text",
      description:
        "Optional accessible name. Omit it when an adjacent exact value already explains the trend.",
    },
    class: {
      control: "text",
      description: "Ordinary Tailwind classes applied to the native SVG.",
    },
  },
};

export default meta;

export const Playground = {
  parameters: { controls: { include: ["label", "class"] } },
  render: (args) => ({
    components: { Sparkline },
    setup() {
      return { activity, args };
    },
    template: `
      <div class="flex items-end gap-4 rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-950">
        <div>
          <p class="text-xs text-gray-500 dark:text-gray-400">Requests</p>
          <p class="mt-1 text-3xl font-semibold tabular-nums">2,418</p>
        </div>
        <Sparkline :data="activity" :label="args.label || undefined" :class="args.class" />
      </div>
    `,
  }),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const sparkline = canvasElement.querySelector('[data-slot="sparkline"]');

    await expect(sparkline).toHaveAttribute("data-slot", "sparkline");
    if (args.label) {
      await expect(canvas.getByRole("img", { name: args.label })).toBeVisible();
    } else {
      await expect(sparkline).toHaveAttribute("aria-hidden", "true");
    }
  },
};

export const States = {
  parameters: { controls: { disable: true } },
  render: () => ({
    components: { Sparkline },
    setup() {
      return {
        activity,
        missing: [
          { label: "A", value: 4 },
          { label: "B", value: 8 },
          { label: "C", value: undefined },
          { label: "D", value: -3 },
          { label: "E", value: 6 },
        ],
      };
    },
    template: `
      <div class="grid gap-5 sm:grid-cols-2">
        <article class="rounded-xl border border-gray-200 p-5 dark:border-gray-800">
          <p class="text-sm font-medium">Ordinary trend</p>
          <Sparkline :data="activity" class="mt-5 h-10 w-full" />
        </article>
        <article class="rounded-xl border border-gray-200 p-5 dark:border-gray-800">
          <p class="text-sm font-medium">Missing and negative samples</p>
          <Sparkline :data="missing" class="mt-5 h-10 w-full text-violet-700 dark:text-violet-300" />
        </article>
        <article class="rounded-xl border border-gray-200 p-5 dark:border-gray-800">
          <p class="text-sm font-medium">One sample</p>
          <Sparkline :data="[{ label: 'Now', value: 7 }]" label="One sample: 7" class="mt-5 h-10 w-full" />
        </article>
        <article class="rounded-xl border border-gray-200 p-5 dark:border-gray-800">
          <p class="text-sm font-medium">No samples</p>
          <Sparkline :data="[]" class="mt-5 h-10 w-full" />
        </article>
      </div>
    `,
  }),
};
