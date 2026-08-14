import { expect, within } from "storybook/test";
import Breadcrumb from "../src/vue/breadcrumb/Breadcrumb.vue";
import { contract } from "./shared/contract.js";

const items = contract.breadcrumbItems;

function stopNavigation(event) {
  if (event.target.closest?.("a")) event.preventDefault();
}

const meta = {
  title: "Components/Breadcrumb",
  component: Breadcrumb,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Durable location hierarchy for The Boring Stack. Pass one ordered list; Klean renders framework-native links, infers the current page, and condenses deep paths from the same semantic trail.",
      },
    },
  },
  args: { items },
  argTypes: {
    items: {
      control: "object",
      description:
        "Ordered ancestors followed by the current page. The final destination is intentionally ignored.",
    },
  },
};

export default meta;

export const Playground = {
  parameters: { controls: { include: ["items"] } },
  render: (args) => ({
    components: { Breadcrumb },
    setup() {
      return { args, stopNavigation };
    },
    template: `
      <div class="w-[min(90vw,48rem)]" @click.capture="stopNavigation">
        <Breadcrumb :items="args.items" />
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const navigation = canvas.getByRole("navigation", { name: "Breadcrumb" });

    await expect(navigation.querySelectorAll(":scope > ol")).toHaveLength(1);
    await expect(canvas.getByRole("link", { name: "Projects" })).toHaveAttribute(
      "href",
      "/",
    );
    await expect(navigation.querySelector('[aria-current="page"]')).toHaveTextContent(
      "Settings",
    );
  },
};

export const States = {
  parameters: { layout: "fullscreen", controls: { disable: true } },
  render: () => ({
    components: { Breadcrumb },
    setup() {
      return { items, stopNavigation };
    },
    template: `
      <section class="klean-story-canvas px-5 py-14 sm:px-8 lg:px-12 lg:py-20" aria-labelledby="breadcrumb-states-title" @click.capture="stopNavigation">
        <header class="max-w-3xl">
          <p class="font-mono text-[11px] uppercase tracking-[0.2em] text-klean-muted">Location, not history</p>
          <h1 id="breadcrumb-states-title" class="mt-3 text-balance text-4xl font-semibold tracking-tighter sm:text-5xl">One truthful trail.</h1>
          <p class="mt-5 max-w-2xl text-pretty text-base leading-7 text-klean-muted">Ancestors stay real links, the current page stays text, and narrow containers retain the useful edges without adding another landmark.</p>
        </header>

        <div class="mt-12 grid max-w-5xl gap-5 lg:grid-cols-2">
          <article class="rounded-lg border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-950">
            <p class="mb-3 text-xs font-medium uppercase tracking-wide text-gray-500">One page</p>
            <Breadcrumb :items="[{ label: 'Projects' }]" />
          </article>
          <article class="rounded-lg border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-950">
            <p class="mb-3 text-xs font-medium uppercase tracking-wide text-gray-500">Parent and current</p>
            <Breadcrumb :items="[{ label: 'Projects', href: '/' }, { label: 'Slipway' }]" />
          </article>
          <article class="rounded-lg border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-950 lg:col-span-2">
            <p class="mb-3 text-xs font-medium uppercase tracking-wide text-gray-500">Deep hierarchy</p>
            <Breadcrumb :items="items" />
          </article>
          <article class="rounded-lg border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-950 lg:col-span-2">
            <p class="mb-3 text-xs font-medium uppercase tracking-wide text-gray-500">Long resource names</p>
            <Breadcrumb :items="[
              { label: 'Projects', href: '/' },
              { label: 'Customer communications infrastructure', href: '/projects/customer-communications-infrastructure', title: 'Customer communications infrastructure' },
              { label: 'Production environment in Frankfurt', href: '/environments/production', title: 'Production environment in Frankfurt' },
              { label: 'Webhook delivery settings for enterprise accounts', title: 'Webhook delivery settings for enterprise accounts' }
            ]" />
          </article>
        </div>
      </section>
    `,
  }),
};

export const Apps = {
  parameters: { layout: "fullscreen", controls: { disable: true } },
  render: () => ({
    components: { Breadcrumb },
    setup() {
      return { stopNavigation };
    },
    template: `
      <section class="klean-story-canvas px-5 py-14 sm:px-8 lg:px-12 lg:py-20" aria-labelledby="breadcrumb-apps-title" @click.capture="stopNavigation">
        <header class="max-w-3xl">
          <p class="font-mono text-[11px] uppercase tracking-[0.2em] text-klean-muted">Application recipes</p>
          <h1 id="breadcrumb-apps-title" class="mt-3 text-balance text-4xl font-semibold tracking-tighter sm:text-5xl">Behavior stays. The finish belongs to the app.</h1>
        </header>

        <div class="mt-12 grid max-w-6xl gap-8 xl:grid-cols-2">
          <article class="dark overflow-hidden rounded-xl border border-gray-800 bg-gray-950 text-white shadow-2xl">
            <div class="border-b border-gray-800 px-5 py-3 sm:px-6">
              <Breadcrumb
                aria-label="Slipway location"
                :items="[
                  { label: 'projects', href: '/' },
                  { label: 'slipway', href: '/projects/slipway' },
                  { label: 'production', href: '/projects/slipway/environments/production' },
                  { label: 'api', href: '/projects/slipway/environments/production/apps/api' },
                  { label: 'deployments' }
                ]"
                class="**:data-[slot=link]:text-gray-400 **:data-[slot=link]:hover:text-white **:data-[slot=current]:text-white **:data-[slot=separator]:text-gray-700"
              />
            </div>
            <div class="p-6">
              <p class="font-mono text-[11px] uppercase tracking-[0.18em] text-gray-500">Slipway / deployment</p>
              <h2 class="mt-4 text-2xl font-semibold tracking-tight">Deploy #824</h2>
              <p class="mt-2 text-sm text-gray-400">Production is healthy and serving traffic.</p>
            </div>
          </article>

          <article class="border-2 border-black bg-[#f7f3eb] text-black shadow-[6px_6px_0_0_#000]">
            <div class="border-b-2 border-black px-5 py-3 sm:px-6">
              <Breadcrumb
                aria-label="Hagfish location"
                :items="[
                  { label: 'Invoices', href: '/invoices' },
                  { label: 'INV-1042' }
                ]"
                class="**:data-[slot=link]:font-medium **:data-[slot=link]:text-black/55 **:data-[slot=link]:hover:text-black **:data-[slot=current]:font-bold **:data-[slot=current]:text-black **:data-[slot=separator]:text-black/35"
              />
            </div>
            <div class="p-6 sm:p-8">
              <p class="font-mono text-[11px] uppercase tracking-[0.18em] text-black/55">Hagfish / invoice</p>
              <h2 class="mt-4 text-3xl font-black tracking-tight">INV-1042</h2>
              <p class="mt-2 text-sm text-black/60">Paid on August 12, 2026.</p>
            </div>
          </article>
        </div>
      </section>
    `,
  }),
};

export const Narrow = {
  parameters: {
    layout: "centered",
    controls: { disable: true },
    viewport: { defaultViewport: "mobile1" },
  },
  render: () => ({
    components: { Breadcrumb },
    setup() {
      return { items, stopNavigation };
    },
    template: `
      <div class="w-72 rounded-lg border border-gray-200 bg-white px-3 dark:border-gray-800 dark:bg-gray-950" @click.capture="stopNavigation">
        <Breadcrumb :items="items" class="**:data-[slot=current]:max-w-28" />
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const ellipsis = canvasElement.querySelector('[data-slot="ellipsis"]');
    await expect(ellipsis).toBeInTheDocument();
    await expect(
      canvasElement.querySelector('[data-slot="item"][data-index="1"]'),
    ).toHaveClass("hidden");
  },
};
