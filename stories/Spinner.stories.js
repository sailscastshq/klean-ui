import { expect, within } from "storybook/test";
import Button from "../src/vue/button/Button.vue";
import Spinner from "../src/vue/spinner/Spinner.vue";
import ProductLoader from "./fixtures/ProductLoader.vue";

const meta = {
  title: "Components/Spinner",
  component: Spinner,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A decorative loading wrapper with a neutral fallback ring and a slot for product-owned marks. The application keeps truthful loading text, aria-busy, and live-region semantics in visible markup.",
      },
    },
  },
  args: {
    loading: true,
    label: "Loading deployments…",
    class: "",
  },
  argTypes: {
    loading: {
      control: "boolean",
      description: "Application-owned loading state used by this story.",
    },
    label: {
      control: "text",
      description: "Truthful status text supplied by the application.",
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
    controls: { include: ["loading", "label", "class"] },
  },
  render: (args) => ({
    components: { Spinner },
    setup() {
      return { args };
    },
    template: `
      <span role="status" aria-live="polite" aria-atomic="true" class="inline-flex min-h-6 items-center gap-2 text-sm text-gray-700 dark:text-gray-200">
        <template v-if="args.loading">
          <Spinner :class="args.class" />
          <span>{{ args.label }}</span>
        </template>
      </span>
    `,
  }),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const status = canvas.getByRole("status");

    if (args.loading) {
      await expect(status).toHaveTextContent(args.label);
      await expect(
        status.querySelector('[data-slot="spinner"]'),
      ).toHaveAttribute("aria-hidden", "true");
    }
  },
};

export const Semantics = {
  parameters: { layout: "fullscreen", controls: { disable: true } },
  render: () => ({
    components: { Button, ProductLoader, Spinner },
    template: `
      <section class="klean-story-canvas px-5 py-14 sm:px-8 lg:px-12 lg:py-20" aria-labelledby="spinner-semantics-title">
        <header class="max-w-3xl">
          <p class="font-mono text-[11px] uppercase tracking-[0.2em] text-klean-muted">Truthful loading</p>
          <h1 id="spinner-semantics-title" class="mt-3 text-balance text-4xl font-semibold tracking-[-0.05em] sm:text-5xl">The mark moves. The markup explains why.</h1>
          <p class="mt-5 max-w-2xl text-pretty text-base leading-7 text-klean-muted">Spinner is hidden from assistive technology. The owning button or region exposes busy state and a stable status surface announces useful changes.</p>
        </header>

        <div class="mt-12 grid max-w-6xl gap-6 lg:grid-cols-2">
          <article class="bg-white p-6 dark:bg-gray-950">
            <p class="font-mono text-[11px] uppercase tracking-[0.18em] text-gray-500">Inside a button</p>
            <Button type="button" disabled aria-busy="true" class="mt-8 min-h-10 min-w-0 px-4 py-2 opacity-70">
              <Spinner class="size-4">
                <ProductLoader />
              </Spinner>
              Deploying…
            </Button>
          </article>

          <article aria-busy="true" aria-describedby="spinner-region-status" class="bg-white p-6 dark:bg-gray-950">
            <p class="font-mono text-[11px] uppercase tracking-[0.18em] text-gray-500">Busy region</p>
            <div id="spinner-region-status" role="status" class="mt-8 flex min-h-24 items-center justify-center gap-3 text-sm text-gray-600 dark:text-gray-300">
              <Spinner class="size-5" />
              Loading recent deployments…
            </div>
          </article>

          <article class="bg-white p-6 dark:bg-gray-950">
            <p class="font-mono text-[11px] uppercase tracking-[0.18em] text-gray-500">Compact status</p>
            <span role="status" class="mt-8 inline-flex size-10 items-center justify-center rounded-full bg-gray-100 text-gray-950 dark:bg-gray-900 dark:text-white">
              <Spinner class="size-5" />
              <span class="sr-only">Checking service health…</span>
            </span>
          </article>

          <article class="bg-white p-6 dark:bg-gray-950">
            <p class="font-mono text-[11px] uppercase tracking-[0.18em] text-gray-500">Default and product marks</p>
            <div class="mt-8 flex items-center gap-6">
              <Spinner class="size-3 text-gray-500" />
              <Spinner class="size-6 text-sky-600" />
              <Spinner class="size-10 text-amber-600">
                <ProductLoader />
              </Spinner>
            </div>
          </article>
        </div>
      </section>
    `,
  }),
};

export const Apps = {
  parameters: { layout: "fullscreen", controls: { disable: true } },
  render: () => ({
    components: { Button, ProductLoader, Spinner },
    template: `
      <section class="klean-story-canvas px-5 py-14 sm:px-8 lg:px-12 lg:py-20" aria-labelledby="spinner-apps-title">
        <header class="max-w-3xl">
          <p class="font-mono text-[11px] uppercase tracking-[0.2em] text-klean-muted">Application recipes</p>
          <h1 id="spinner-apps-title" class="mt-3 text-4xl font-semibold tracking-[-0.05em] sm:text-5xl">Neutral source. Product-owned context.</h1>
        </header>

        <div class="mt-12 grid max-w-6xl gap-6 lg:grid-cols-2">
          <article class="bg-gray-950 p-6 text-white">
            <p class="font-mono text-[11px] uppercase tracking-[0.18em] text-gray-500">Slipway / Deployment action</p>
            <Button type="button" disabled aria-busy="true" class="mt-8 min-h-10 min-w-0 bg-white px-4 py-2 text-gray-950 opacity-80 hover:bg-white dark:bg-white dark:text-gray-950">
              <Spinner class="size-4">
                <ProductLoader />
              </Spinner>
              Deploying service…
            </Button>
          </article>

          <article class="border-2 border-black bg-[#f4f0e8] p-6 text-black shadow-[4px_4px_0_0_#000]">
            <p class="font-mono text-[11px] uppercase tracking-[0.18em] text-black/50">Hagfish / Invoice action</p>
            <Button type="button" disabled aria-busy="true" class="mt-8 min-h-11 min-w-0 rounded-none border-2 border-black bg-black px-5 font-semibold text-white opacity-80 dark:bg-black dark:text-white">
              <Spinner class="size-4" />
              Marking as paid…
            </Button>
          </article>

          <article aria-busy="true" aria-describedby="spinner-table-status" class="bg-white p-6 dark:bg-gray-950 lg:col-span-2">
            <div class="flex items-center justify-between border-b border-gray-200 pb-4 dark:border-gray-800">
              <h2 class="font-medium">Deployments</h2>
              <span id="spinner-table-status" role="status" class="inline-flex items-center gap-2 text-sm text-gray-500">
                <Spinner class="size-4" />
                Refreshing…
              </span>
            </div>
            <div class="grid min-h-32 place-items-center text-sm text-gray-500">Existing rows remain readable while fresh data loads.</div>
          </article>
        </div>
      </section>
    `,
  }),
};
