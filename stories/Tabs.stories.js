import { ref, watch } from "vue";
import { expect, userEvent, within } from "storybook/test";
import Tabs from "../src/vue/tabs/Tabs.vue";

const BoringStackLink = {
  name: "BoringStackLink",
  inheritAttrs: false,
  template: '<a v-bind="$attrs"><slot /></a>',
};

const tabClass = [
  "min-h-11 shrink-0 cursor-pointer border-b-2 border-transparent px-1 py-2 text-sm font-medium text-gray-500 outline-none",
  "hover:text-gray-950 focus-visible:ring-2 focus-visible:ring-gray-950 focus-visible:ring-offset-2",
  "data-[state=active]:border-gray-950 data-[state=active]:text-gray-950",
  "disabled:cursor-not-allowed disabled:opacity-40 dark:text-gray-400 dark:hover:text-white dark:focus-visible:ring-white dark:data-[state=active]:border-white dark:data-[state=active]:text-white",
].join(" ");

const meta = {
  title: "Components/Tabs",
  component: Tabs,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Adds the missing tab semantics and keyboard contract to caller-owned buttons and panels. Markup, Tailwind styling, URL state, data loading, and close policy stay in the application.",
      },
    },
  },
  args: {
    active: "overview",
    orientation: "horizontal",
    activation: "automatic",
  },
  argTypes: {
    active: {
      control: "select",
      options: ["overview", "activity", "settings"],
      description: "Selected data-value, supplied through Vue v-model.",
    },
    orientation: {
      control: "inline-radio",
      options: ["horizontal", "vertical"],
      description: "Chooses the matching Arrow-key axis.",
    },
    activation: {
      control: "inline-radio",
      options: ["automatic", "manual"],
      description:
        "Whether focus selects immediately or waits for Enter/Space.",
    },
  },
};

export default meta;

export const Playground = {
  parameters: {
    controls: { include: ["active", "orientation", "activation"] },
  },
  render: (args) => ({
    components: { Tabs },
    setup() {
      const active = ref(args.active);
      watch(
        () => args.active,
        (next) => (active.value = next),
      );
      return { active, args, tabClass };
    },
    template: `
      <Tabs
        v-model="active"
        aria-label="Project sections"
        :orientation="args.orientation"
        :activation="args.activation"
        class="w-[min(38rem,calc(100vw-2rem))] text-gray-950 dark:text-white"
      >
        <div :class="args.orientation === 'vertical' ? 'flex w-36 flex-col items-stretch gap-1 border-r border-gray-200 pr-3 dark:border-gray-800' : 'flex gap-6 overflow-x-auto border-b border-gray-200 dark:border-gray-800'">
          <button v-for="item in ['overview', 'activity', 'settings']" :key="item" type="button" :data-value="item" :class="tabClass + (args.orientation === 'vertical' ? ' justify-start border-b-0 border-l-2 px-3 text-left data-[state=active]:border-l-gray-950 dark:data-[state=active]:border-l-white' : '')">
            {{ item[0].toUpperCase() + item.slice(1) }}
          </button>
        </div>
        <section data-value="overview" class="min-h-36 py-6 outline-none focus-visible:ring-2 focus-visible:ring-gray-950 dark:focus-visible:ring-white">
          <h2 class="text-lg font-semibold">Project overview</h2>
          <p class="mt-2 text-sm leading-6 text-gray-500">Health, ownership, and the next deploy in one instant panel.</p>
        </section>
        <section data-value="activity" class="min-h-36 py-6 outline-none focus-visible:ring-2 focus-visible:ring-gray-950 dark:focus-visible:ring-white">
          <h2 class="text-lg font-semibold">Recent activity</h2>
          <p class="mt-2 text-sm leading-6 text-gray-500">Seven deployments completed this week.</p>
        </section>
        <section data-value="settings" class="min-h-36 py-6 outline-none focus-visible:ring-2 focus-visible:ring-gray-950 dark:focus-visible:ring-white">
          <h2 class="text-lg font-semibold">Project settings</h2>
          <p class="mt-2 text-sm leading-6 text-gray-500">Configuration remains ordinary application markup.</p>
        </section>
      </Tabs>
    `,
  }),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const tabs = canvas.getAllByRole("tab");
    const panels = canvas.getAllByRole("tabpanel", { hidden: true });
    const activeIndex = ["overview", "activity", "settings"].indexOf(
      args.active,
    );

    await expect(tabs).toHaveLength(3);
    await expect(panels).toHaveLength(3);
    await expect(tabs[activeIndex]).toHaveAttribute("aria-selected", "true");
    await expect(tabs[activeIndex]).toHaveAttribute(
      "aria-controls",
      panels[activeIndex].id,
    );

    tabs[activeIndex].focus();
    const forwardKey =
      args.orientation === "vertical" ? "{ArrowDown}" : "{ArrowRight}";
    await userEvent.keyboard(forwardKey);
    const next = tabs[(activeIndex + 1) % tabs.length];
    await expect(next).toHaveFocus();
    if (args.activation === "manual") {
      await expect(next).toHaveAttribute("aria-selected", "false");
      await userEvent.keyboard("{Enter}");
    }
    await expect(next).toHaveAttribute("aria-selected", "true");
  },
};

export const Modes = {
  parameters: { layout: "fullscreen", controls: { disable: true } },
  render: () => ({
    components: { Tabs },
    setup() {
      return {
        automatic: ref("ready"),
        manual: ref("summary"),
        tabClass,
      };
    },
    template: `
      <section class="klean-story-canvas px-5 py-14 sm:px-8 lg:px-12 lg:py-20" aria-labelledby="tabs-modes-title">
        <header class="max-w-3xl">
          <p class="font-mono text-[11px] uppercase tracking-[0.2em] text-klean-muted">One contract</p>
          <h1 id="tabs-modes-title" class="mt-3 text-balance text-4xl font-semibold tracking-[-0.05em] sm:text-5xl">Fast panels activate. Meaningful work waits.</h1>
          <p class="mt-5 max-w-2xl text-pretty text-base leading-7 text-klean-muted">Automatic activation is right when mounted panels are instant. Manual activation lets a person move focus before choosing a panel that starts latency or work.</p>
        </header>

        <div class="mt-12 grid max-w-5xl gap-8 lg:grid-cols-2">
          <article class="bg-white p-6 dark:bg-gray-950">
            <p class="text-xs font-semibold uppercase tracking-[0.15em] text-gray-500">Automatic · disabled skip</p>
            <Tabs v-model="automatic" aria-label="Deploy state" class="mt-4">
              <div class="flex gap-5 overflow-x-auto border-b border-gray-200 dark:border-gray-800">
                <button type="button" data-value="ready" :class="tabClass">Ready</button>
                <button type="button" data-value="building" :class="tabClass" disabled>Building</button>
                <button type="button" data-value="deployed" :class="tabClass">Deployed</button>
              </div>
              <div data-value="ready" class="py-6 text-sm">Ready to deploy.</div>
              <div data-value="building" class="py-6 text-sm">Build in progress.</div>
              <div data-value="deployed" class="py-6 text-sm">Deployment is live.</div>
            </Tabs>
          </article>

          <article class="bg-white p-6 dark:bg-gray-950">
            <p class="text-xs font-semibold uppercase tracking-[0.15em] text-gray-500">Manual · vertical</p>
            <Tabs v-model="manual" aria-label="Report sections" orientation="vertical" activation="manual" class="mt-4 grid grid-cols-[8rem_1fr] gap-5">
              <div class="flex flex-col gap-1 border-r border-gray-200 pr-3 dark:border-gray-800">
                <button type="button" data-value="summary" class="min-h-11 cursor-pointer border-l-2 border-transparent px-3 text-left text-sm text-gray-500 outline-none focus-visible:ring-2 data-[state=active]:border-gray-950 data-[state=active]:font-medium data-[state=active]:text-gray-950 dark:data-[state=active]:border-white dark:data-[state=active]:text-white">Summary</button>
                <button type="button" data-value="logs" class="min-h-11 cursor-pointer border-l-2 border-transparent px-3 text-left text-sm text-gray-500 outline-none focus-visible:ring-2 data-[state=active]:border-gray-950 data-[state=active]:font-medium data-[state=active]:text-gray-950 dark:data-[state=active]:border-white dark:data-[state=active]:text-white">Logs</button>
              </div>
              <div data-value="summary" class="outline-none"><strong class="text-sm">Summary</strong><p class="mt-2 text-sm text-gray-500">Arrow Down moves focus. Enter opens.</p></div>
              <div data-value="logs" class="outline-none"><strong class="text-sm">Logs</strong><p class="mt-2 text-sm text-gray-500">No request begins on focus alone.</p></div>
            </Tabs>
          </article>
        </div>
      </section>
    `,
  }),
};

export const Navigation = {
  parameters: { layout: "fullscreen", controls: { disable: true } },
  render: () => ({
    components: { BoringStackLink, Tabs },
    setup() {
      const current = ref("profile");
      const sections = [
        { value: "profile", label: "Profile", href: "#profile" },
        { value: "billing", label: "Billing", href: "#billing" },
        { value: "schedule", label: "Schedule", href: "#schedule" },
      ];
      return { current, sections };
    },
    template: `
      <section class="klean-story-canvas px-5 py-14 sm:px-8 lg:px-12 lg:py-20" aria-labelledby="tabs-navigation-title">
        <header class="max-w-3xl">
          <p class="font-mono text-[11px] uppercase tracking-[0.2em] text-klean-muted">Hagfish-shaped navigation</p>
          <h1 id="tabs-navigation-title" class="mt-3 text-balance text-4xl font-semibold tracking-[-0.05em] sm:text-5xl">Links stay links.</h1>
          <p class="mt-5 max-w-2xl text-pretty text-base leading-7 text-klean-muted">Pass native anchors or the Boring Stack Link directly. Klean marks the active destination while href, prefetch, history, modified clicks, and open-in-new-tab remain the router and browser's job.</p>
        </header>

        <div class="mt-12 max-w-4xl border-2 border-black bg-white p-6 shadow-[5px_5px_0_#111] dark:border-white dark:bg-gray-950 dark:shadow-[5px_5px_0_#fff] sm:p-8">
          <div class="flex items-center gap-3">
            <div class="grid size-12 place-items-center rounded-xl bg-black text-sm font-bold text-white dark:bg-white dark:text-black">KU</div>
            <div><h2 class="font-semibold">Account settings</h2><p class="text-sm text-gray-500">Durable route navigation</p></div>
          </div>

          <Tabs :model-value="current" orientation="vertical" aria-label="Account settings" class="mt-8 md:grid md:grid-cols-[12rem_1fr] md:gap-10">
            <nav class="flex gap-2 overflow-x-auto md:flex-col" aria-label="Account settings">
              <BoringStackLink
                v-for="section in sections"
                :key="section.value"
                :href="section.href"
                :data-value="section.value"
                prefetch
                class="min-h-11 shrink-0 cursor-pointer rounded-lg px-3 py-2.5 text-sm font-medium text-black/60 outline-none transition-colors hover:bg-black/5 hover:text-black focus-visible:ring-2 focus-visible:ring-black data-[state=active]:bg-black data-[state=active]:text-white dark:text-white/65 dark:hover:bg-white/5 dark:hover:text-white dark:focus-visible:ring-white dark:data-[state=active]:bg-white dark:data-[state=active]:text-black"
                @click="current = section.value"
              >{{ section.label }}</BoringStackLink>
            </nav>
          </Tabs>

          <div class="mt-8 border-t border-black/10 pt-6 md:ml-[14.5rem] dark:border-white/10">
            <h3 class="text-lg font-semibold capitalize">{{ current }}</h3>
            <p class="mt-2 text-sm text-gray-500">The destination owns this page. Tabs only supplies a truthful active-state hook.</p>
          </div>
        </div>
      </section>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const navigation = canvas.getByRole("navigation", {
      name: "Account settings",
    });
    const links = within(navigation).getAllByRole("link");

    await expect(navigation).not.toHaveAttribute("role", "tablist");
    await expect(links[0]).toHaveAttribute("aria-current", "page");
    await expect(links[0]).not.toHaveAttribute("role", "tab");
    await userEvent.click(links[1]);
    await expect(links[1]).toHaveAttribute("aria-current", "page");
    await expect(links[0]).not.toHaveAttribute("aria-current");
  },
};

export const Workspace = {
  parameters: { layout: "fullscreen", controls: { disable: true } },
  render: () => ({
    components: { Tabs },
    setup() {
      const openTabs = ref([
        { value: "schema", label: "schema.sql" },
        { value: "customers", label: "customers" },
        { value: "invoices", label: "invoices" },
        { value: "deploys", label: "deploys" },
        { value: "logs", label: "worker.log" },
      ]);
      const active = ref("customers");
      function close(value) {
        openTabs.value = openTabs.value.filter((item) => item.value !== value);
      }
      return { active, close, openTabs };
    },
    template: `
      <section class="klean-story-canvas px-5 py-14 sm:px-8 lg:px-12 lg:py-20" aria-labelledby="tabs-workspace-title">
        <header class="max-w-3xl">
          <p class="font-mono text-[11px] uppercase tracking-[0.2em] text-klean-muted">Slipway-shaped workspace</p>
          <h1 id="tabs-workspace-title" class="mt-3 text-balance text-4xl font-semibold tracking-[-0.05em] sm:text-5xl">Dynamic tabs stay operable.</h1>
          <p class="mt-5 max-w-2xl text-pretty text-base leading-7 text-klean-muted">Tabs keep safe adjacent focus when an active result closes. Close actions are real buttons beside—not inside—the semantic tab list.</p>
        </header>

        <div class="mt-12 max-w-5xl border border-gray-300 bg-white shadow-[5px_5px_0_#111] dark:border-gray-700 dark:bg-gray-950 dark:shadow-[5px_5px_0_#fff]">
          <Tabs v-model="active" aria-label="Open workspace results" class="relative">
            <div class="flex max-w-full overflow-x-auto border-b border-gray-300 dark:border-gray-700">
              <button v-for="item in openTabs" :key="item.value" type="button" :data-value="item.value" class="min-h-11 w-36 shrink-0 cursor-pointer truncate border-r border-gray-300 px-4 pr-10 text-left font-mono text-xs text-gray-600 outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-gray-950 data-[state=active]:bg-gray-950 data-[state=active]:text-white dark:border-gray-700 dark:text-gray-400 dark:data-[state=active]:bg-white dark:data-[state=active]:text-gray-950">{{ item.label }}</button>
            </div>
            <div class="pointer-events-none absolute left-0 top-0 flex">
              <span v-for="item in openTabs" :key="item.value" class="flex min-h-11 w-36 shrink-0 items-center justify-end pr-1">
                <button type="button" :aria-label="'Close ' + item.label" :class="['pointer-events-auto grid size-9 cursor-pointer place-items-center outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-red-600', active === item.value ? 'text-gray-300 hover:text-white dark:text-gray-600 dark:hover:text-black' : 'text-gray-600 hover:bg-red-50 hover:text-red-700 dark:text-gray-400 dark:hover:bg-red-950/30']" @click="close(item.value)">×</button>
              </span>
            </div>
            <div v-for="item in openTabs" :key="item.value" :data-value="item.value" class="min-h-60 p-6 font-mono text-sm outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-gray-950 dark:focus-visible:ring-white">
              <p class="text-xs uppercase tracking-[0.14em] text-gray-600 dark:text-gray-400">Active result</p>
              <p class="mt-5">{{ item.label }}</p>
              <p class="mt-2 text-gray-500">Caller-owned content stays mounted while Klean manages only visibility and interaction.</p>
            </div>
          </Tabs>
        </div>
      </section>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const customers = canvas.getByRole("tab", { name: "customers" });
    customers.focus();
    await userEvent.click(
      canvas.getByRole("button", { name: "Close customers" }),
    );
    await expect(canvas.queryByRole("tab", { name: "customers" })).toBeNull();
    await expect(canvas.getByRole("tab", { name: "invoices" })).toHaveFocus();
    await expect(canvas.getByRole("tab", { name: "invoices" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
  },
};

export const Overflow = {
  parameters: { controls: { disable: true } },
  render: () => ({
    components: { Tabs },
    setup() {
      return {
        active: ref("workers"),
        labels: [
          "overview",
          "deploys",
          "databases",
          "workers",
          "domains",
          "variables",
          "activity",
          "settings",
        ],
      };
    },
    template: `
      <Tabs v-model="active" aria-label="Service views" class="w-[min(34rem,calc(100vw-2rem))]">
        <div class="flex overflow-x-auto border-b border-gray-200 dark:border-gray-800">
          <button v-for="label in labels" :key="label" type="button" :data-value="label" class="min-h-11 shrink-0 cursor-pointer border-b-2 border-transparent px-4 text-sm capitalize text-gray-600 outline-none focus-visible:ring-2 focus-visible:ring-inset data-[state=active]:border-gray-950 data-[state=active]:text-gray-950 dark:text-gray-400 dark:data-[state=active]:border-white dark:data-[state=active]:text-white">{{ label }}</button>
        </div>
        <div v-for="label in labels" :key="label" :data-value="label" class="min-h-32 py-6 text-sm capitalize outline-none">{{ label }} view</div>
      </Tabs>
    `,
  }),
};
