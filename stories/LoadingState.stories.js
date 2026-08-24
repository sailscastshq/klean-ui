import { expect, within } from "storybook/test";
import LoadingState from "../src/vue/loading-state/LoadingState.vue";
import Spinner from "../src/vue/spinner/Spinner.vue";
import ProductLoader from "./fixtures/ProductLoader.vue";

const meta = {
  title: "Components/LoadingState",
  component: LoadingState,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A polite loading status layout. The application owns the busy region, useful copy, request lifecycle, stale content, product mark, skeleton markup, and Tailwind styling.",
      },
    },
  },
  args: {
    label: "Loading services…",
    productMark: false,
    class: "",
  },
  argTypes: {
    label: {
      control: "text",
      description: "Useful loading copy supplied by the application.",
    },
    productMark: {
      control: "boolean",
      description:
        "Story-only switch between the neutral and product-owned mark.",
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
    controls: { include: ["label", "productMark", "class"] },
  },
  render: (args) => ({
    components: { LoadingState, ProductLoader, Spinner },
    setup() {
      return { args };
    },
    template: `
      <section aria-busy="true" aria-labelledby="loading-playground-title" class="w-[min(42rem,calc(100vw-2rem))]">
        <h2 id="loading-playground-title" class="sr-only">Services</h2>
        <LoadingState :class="args.class">
          <Spinner class="size-6">
            <ProductLoader v-if="args.productMark" />
          </Spinner>
          <span>{{ args.label }}</span>
        </LoadingState>
      </section>
    `,
  }),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const section = canvasElement.querySelector("section");
    const status = canvas.getByRole("status");

    await expect(section).toHaveAttribute("aria-busy", "true");
    await expect(status).toHaveAttribute("aria-live", "polite");
    await expect(status).toHaveTextContent(args.label);
  },
};

export const Apps = {
  parameters: { layout: "fullscreen", controls: { disable: true } },
  render: () => ({
    components: { LoadingState, ProductLoader, Spinner },
    template: `
      <main class="klean-story-canvas px-5 py-14 sm:px-8 lg:px-12 lg:py-20">
        <header class="max-w-3xl">
          <h1 class="text-balance text-4xl font-semibold tracking-tighter sm:text-5xl">Loading tells the truth without taking over the page.</h1>
          <p class="mt-5 max-w-2xl text-pretty text-base leading-7 text-klean-muted">Use a full status for the first load, caller-owned skeletons when shape helps, and a compact status while existing content remains useful.</p>
        </header>

        <div class="mt-12 grid max-w-6xl gap-6 lg:grid-cols-2">
          <section aria-busy="true" aria-labelledby="loading-deployments-title" class="bg-gray-950 text-white">
            <h2 id="loading-deployments-title" class="sr-only">Deployments</h2>
            <LoadingState class="min-h-72 text-gray-300 dark:text-gray-300">
              <Spinner class="size-10 text-white">
                <ProductLoader />
              </Spinner>
              <span class="text-sm">Loading deployments…</span>
            </LoadingState>
          </section>

          <section aria-busy="true" aria-labelledby="loading-invoices-title" class="border-2 border-black bg-[#f4f0e8] p-6 text-black shadow-[4px_4px_0_0_#000]">
            <h2 id="loading-invoices-title" class="text-xl font-semibold">Invoices</h2>
            <LoadingState class="min-h-56 items-stretch gap-4 p-0 pt-6 text-left text-black dark:text-black">
              <span class="sr-only">Loading invoices…</span>
              <div aria-hidden="true" class="space-y-3">
                <div class="h-12 animate-pulse bg-black/10 motion-reduce:animate-none"></div>
                <div class="h-12 animate-pulse bg-black/10 motion-reduce:animate-none"></div>
                <div class="h-12 animate-pulse bg-black/10 motion-reduce:animate-none"></div>
              </div>
            </LoadingState>
          </section>

          <section aria-busy="true" aria-labelledby="loading-services-title" aria-describedby="loading-services-status" class="bg-white p-6 dark:bg-gray-950 lg:col-span-2">
            <div class="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 pb-4 dark:border-gray-800">
              <h2 id="loading-services-title" class="text-lg font-semibold">Services</h2>
              <LoadingState id="loading-services-status" class="min-h-0 w-auto flex-row justify-start gap-2 p-0 text-left text-sm text-gray-500 dark:text-gray-400">
                <Spinner class="size-4" />
                Refreshing…
              </LoadingState>
            </div>
            <ul class="divide-y divide-gray-200 dark:divide-gray-800">
              <li class="flex items-center justify-between gap-4 py-4"><span>api.sailscasts.com</span><span class="text-sm text-emerald-700 dark:text-emerald-400">Healthy</span></li>
              <li class="flex items-center justify-between gap-4 py-4"><span>docs.sailscasts.com</span><span class="text-sm text-emerald-700 dark:text-emerald-400">Healthy</span></li>
              <li class="flex items-center justify-between gap-4 py-4"><span>workers</span><span class="text-sm text-gray-500">Updating</span></li>
            </ul>
          </section>
        </div>
      </main>
    `,
  }),
};
