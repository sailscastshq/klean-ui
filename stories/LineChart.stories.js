import { expect, within } from "storybook/test";
import LineChart from "../src/vue/line-chart/LineChart.vue";
import Sparkline from "../src/vue/sparkline/Sparkline.vue";

const signups = [
  { label: "Fri", value: 4, detail: "Friday, 4 signups" },
  { label: "Sat", value: 4, detail: "Saturday, 4 signups" },
  { label: "Sun", value: 9, detail: "Sunday, 9 signups" },
  { label: "Mon", value: 9, detail: "Monday, 9 signups" },
  { label: "Tue", value: 4, detail: "Tuesday, 4 signups" },
  { label: "Wed", value: 4, detail: "Wednesday, 4 signups" },
  { label: "Thu", value: 4, detail: "Thursday, 4 signups" },
];

const cpu = [
  { label: "12:00", value: 18, detail: "12:00, 18 percent" },
  { label: "12:10", value: 23, detail: "12:10, 23 percent" },
  { label: "12:20", value: 21, detail: "12:20, 21 percent" },
  { label: "12:30", value: 48, detail: "12:30, 48 percent" },
  { label: "12:40", value: 36, detail: "12:40, 36 percent" },
  { label: "12:50", value: 61, detail: "12:50, 61 percent" },
  { label: "13:00", value: 42, detail: "13:00, 42 percent" },
];

const memory = [
  { label: "12:00", value: 384, detail: "12:00, 384 megabytes" },
  { label: "12:10", value: 402, detail: "12:10, 402 megabytes" },
  { label: "12:20", value: 416, detail: "12:20, 416 megabytes" },
  { label: "12:30", value: undefined, detail: "12:30, sample unavailable" },
  { label: "12:40", value: 448, detail: "12:40, 448 megabytes" },
  { label: "12:50", value: 462, detail: "12:50, 462 megabytes" },
  { label: "13:00", value: 472, detail: "13:00, 472 megabytes" },
];

const meta = {
  title: "Components/LineChart",
  component: LineChart,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A labelled single-series trend built from native figure, figcaption, SVG, and an exact data list. It uses currentColor, accepts ordinary Tailwind, and has no chart configuration language or animation runtime.",
      },
    },
  },
  args: {
    caption: "Signups — last 7 days",
    emptyLabel: "No data",
    class: "w-[min(90vw,42rem)]",
  },
  argTypes: {
    caption: { control: "text", description: "Visible figure caption." },
    emptyLabel: {
      control: "text",
      description: "Localized text used when no finite values exist.",
    },
    class: {
      control: "text",
      description:
        "Ordinary Tailwind classes applied to the figure. Descendant data slots remain available to Tailwind selectors.",
    },
  },
};

export default meta;

export const Playground = {
  parameters: { controls: { include: ["caption", "emptyLabel", "class"] } },
  render: (args) => ({
    components: { LineChart },
    setup() {
      return { args, signups };
    },
    template: `
      <LineChart
        :data="signups"
        :caption="args.caption"
        :empty-label="args.emptyLabel"
        :class="args.class"
      />
    `,
  }),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const chart = canvas.getByRole("figure");

    await expect(chart).toHaveAttribute("data-slot", "line-chart");
    await expect(canvas.getByText(args.caption)).toBeVisible();
    await expect(
      canvasElement.querySelector('[data-slot="line-chart-graphic"]'),
    ).toHaveAttribute("aria-hidden", "true");
    await expect(
      canvasElement.querySelectorAll('[data-slot="line-chart-values"] li'),
    ).toHaveLength(7);
  },
};

export const Apps = {
  name: "App recipes",
  parameters: { layout: "fullscreen", controls: { disable: true } },
  render: () => ({
    components: { LineChart, Sparkline },
    setup() {
      return { cpu, memory, signups };
    },
    template: `
      <main class="klean-story-canvas px-5 py-14 sm:px-8 lg:px-12 lg:py-20">
        <header class="max-w-3xl">
          <p class="font-mono text-[11px] uppercase tracking-[0.2em] text-klean-muted">Data display / application evidence</p>
          <h1 class="mt-3 text-balance text-4xl font-semibold tracking-tighter sm:text-5xl">The trend stays quiet. The value stays exact.</h1>
          <p class="mt-5 max-w-2xl text-pretty text-base leading-7 text-klean-muted">Slipway proves operational metrics. Klean removes product colours, hover-only truth, and page-coupled SVG math while preserving the two shapes the application actually needs.</p>
        </header>

        <section class="mt-12 grid max-w-7xl gap-8 xl:grid-cols-[minmax(0,1.15fr)_minmax(20rem,0.85fr)]" aria-label="Chart recipes">
          <article class="dark rounded-xl bg-gray-950 p-6 text-white shadow-xl sm:p-8">
            <div class="flex flex-wrap items-start justify-between gap-6">
              <div>
                <p class="font-mono text-[11px] uppercase tracking-[0.18em] text-gray-400">Slipway / Lookout</p>
                <h2 class="mt-2 text-xl font-semibold">Production API</h2>
              </div>
              <dl class="flex gap-8">
                <div><dt class="text-xs text-gray-400">CPU</dt><dd class="mt-1 flex items-end gap-3 text-xl font-semibold tabular-nums">42% <Sparkline :data="cpu" class="mb-1 h-6 w-24 text-emerald-400" /></dd></div>
                <div><dt class="text-xs text-gray-400">Memory</dt><dd class="mt-1 flex items-end gap-3 text-xl font-semibold tabular-nums">472 MB <Sparkline :data="memory" class="mb-1 h-6 w-24 text-sky-400" /></dd></div>
              </dl>
            </div>

            <div class="mt-10 grid gap-8 sm:grid-cols-2">
              <LineChart :data="cpu" caption="CPU — last hour" class="h-56 text-emerald-400 **:data-[slot=line-chart-caption]:text-white **:data-[slot=line-chart-labels]:text-gray-400" />
              <LineChart :data="memory" caption="Memory — last hour" class="h-56 text-sky-400 **:data-[slot=line-chart-caption]:text-white **:data-[slot=line-chart-labels]:text-gray-400" />
            </div>
          </article>

          <article class="border-2 border-gray-950 bg-[#f7f3eb] p-6 text-gray-950 shadow-[6px_6px_0_0_#111] sm:p-8">
            <p class="font-mono text-[11px] uppercase tracking-[0.18em] text-gray-600">Klean / minimal report</p>
            <LineChart :data="signups" caption="Signups — last 7 days" class="mt-7 h-72 text-gray-950 dark:text-gray-950 **:data-[slot=line-chart-caption]:text-lg **:data-[slot=line-chart-labels]:text-gray-600" />
            <p class="mt-6 text-sm leading-6 text-gray-600">No provider. No theme object. The exact seven values remain available from the same source data.</p>
          </article>
        </section>
      </main>
    `,
  }),
};

export const DataStates = {
  name: "Data states",
  parameters: { layout: "fullscreen", controls: { disable: true } },
  render: () => ({
    components: { LineChart },
    setup() {
      return {
        states: [
          { name: "Empty", data: [] },
          { name: "One point", data: [{ label: "Now", value: 8 }] },
          {
            name: "Flat",
            data: [
              { label: "A", value: 4 },
              { label: "B", value: 4 },
              { label: "C", value: 4 },
            ],
          },
          {
            name: "Zero and negative",
            data: [
              { label: "A", value: -5 },
              { label: "B", value: 0 },
              { label: "C", value: 8 },
            ],
          },
          {
            name: "Missing sample",
            data: [
              { label: "A", value: 3 },
              { label: "B", value: 8 },
              { label: "C", value: undefined },
              { label: "D", value: 5 },
              { label: "E", value: 11 },
            ],
          },
          {
            name: "Large values",
            data: [
              { label: "A", value: 1200000 },
              { label: "B", value: 3900000 },
              { label: "C", value: 2100000 },
            ],
          },
        ],
      };
    },
    template: `
      <section class="klean-story-canvas px-5 py-14 sm:px-8" aria-labelledby="line-chart-states-title">
        <h1 id="line-chart-states-title" class="text-3xl font-semibold tracking-tight">Deliberate at every data boundary.</h1>
        <div class="mt-10 grid gap-8 md:grid-cols-2 xl:grid-cols-3">
          <LineChart v-for="state in states" :key="state.name" :data="state.data" :caption="state.name" class="h-56 rounded-xl border border-gray-200 p-5 dark:border-gray-800" />
        </div>
      </section>
    `,
  }),
};

export const Narrow = {
  name: "Narrow container",
  parameters: { controls: { disable: true } },
  render: () => ({
    components: { LineChart },
    setup() {
      return { signups };
    },
    template: `<LineChart :data="signups" caption="Signups — narrow" class="h-56 w-64" />`,
  }),
};
