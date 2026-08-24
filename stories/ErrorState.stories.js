import { Link } from "@inertiajs/vue3";
import { nextTick, ref } from "vue";
import { expect, fn, userEvent, within } from "storybook/test";
import Button from "../src/vue/button/Button.vue";
import ErrorState from "../src/vue/error-state/ErrorState.vue";

const meta = {
  title: "Components/ErrorState",
  component: ErrorState,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "One shallow failed-content layout. The application owns announcement semantics, truthful copy, recovery controls, focus, routing, safe diagnostics, and ordinary Tailwind.",
      },
    },
  },
  args: {
    as: "section",
    title: "Services could not load",
    description: "Slipway could not reach the deployment service.",
  },
  argTypes: {
    as: {
      control: "select",
      options: ["div", "section", "article"],
    },
    title: { control: "text" },
    description: { control: "text" },
  },
};

export default meta;

export const Playground = {
  parameters: { controls: { include: ["as", "title", "description"] } },
  args: { onRetry: fn() },
  render: (args) => ({
    components: { Button, ErrorState },
    setup() {
      return { args };
    },
    template: `
      <ErrorState :as="args.as" role="alert" aria-labelledby="error-playground-title" class="w-[min(42rem,calc(100vw-2rem))] rounded-lg border border-red-200 bg-red-50 dark:border-red-900/50 dark:bg-red-950/20">
        <span aria-hidden="true" class="grid size-12 place-items-center rounded-full bg-red-100 text-xl text-red-700 dark:bg-red-900/40 dark:text-red-300">!</span>
        <div class="max-w-md">
          <h2 id="error-playground-title" class="text-lg font-semibold">{{ args.title }}</h2>
          <p class="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-300">{{ args.description }}</p>
        </div>
        <Button type="button" class="min-h-10 min-w-0 px-4 py-2" @click="args.onRetry">Try again</Button>
      </ErrorState>
    `,
  }),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const alert = canvas.getByRole("alert");

    await expect(alert.tagName.toLowerCase()).toBe(args.as);
    await expect(
      canvas.getByRole("heading", { name: args.title }),
    ).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: "Try again" }));
    await expect(args.onRetry).toHaveBeenCalledOnce();
  },
};

export const Recovery = {
  parameters: { controls: { disable: true } },
  render: () => ({
    components: { Button, ErrorState },
    setup() {
      const failed = ref(false);
      const trigger = ref();

      function load() {
        failed.value = true;
      }

      async function retry() {
        failed.value = false;
        await nextTick();
        trigger.value?.focus();
      }

      return { failed, load, retry, trigger };
    },
    template: `
      <div class="w-[min(38rem,calc(100vw-2rem))]">
        <Button ref="trigger" type="button" class="min-h-10 min-w-0 px-4 py-2" @click="load">Load services</Button>
        <ErrorState v-if="failed" role="alert" aria-labelledby="recovery-error-title" class="mt-4 min-h-64 rounded-lg border border-red-200 bg-red-50 dark:border-red-900/50 dark:bg-red-950/20">
          <div class="max-w-sm">
            <h2 id="recovery-error-title" class="font-semibold">Services could not load</h2>
            <p class="mt-2 text-sm text-gray-600 dark:text-gray-300">Your current page is safe. Try the request again.</p>
          </div>
          <Button type="button" class="min-h-10 min-w-0 px-4 py-2" @click="retry">Try again</Button>
        </ErrorState>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const loadButton = canvas.getByRole("button", { name: "Load services" });

    await userEvent.click(loadButton);
    await expect(canvas.getByRole("alert")).toBeVisible();
    await expect(document.activeElement).toBe(loadButton);

    await userEvent.click(canvas.getByRole("button", { name: "Try again" }));
    await expect(canvas.queryByRole("alert")).not.toBeInTheDocument();
    await expect(document.activeElement).toBe(
      canvas.getByRole("button", { name: "Load services" }),
    );
  },
};

export const Apps = {
  parameters: { layout: "fullscreen", controls: { disable: true } },
  args: { onRetryBridge: fn(), onRetryContent: fn() },
  render: (args) => ({
    components: { Button, ErrorState, Link },
    setup() {
      return { args, Link };
    },
    template: `
      <main class="klean-story-canvas px-5 py-14 sm:px-8 lg:px-12 lg:py-20">
        <header class="max-w-3xl">
          <h1 class="text-balance text-4xl font-semibold tracking-tighter sm:text-5xl">Failure should explain the safe way forward.</h1>
          <p class="mt-5 max-w-2xl text-pretty text-base leading-7 text-klean-muted">Pages, regions, and product voices stay distinct while recovery remains ordinary markup.</p>
        </header>

        <div class="mt-12 grid max-w-6xl gap-6 lg:grid-cols-2">
          <section class="bg-gray-950 p-6 text-white" aria-labelledby="error-bridge-region-title">
            <ErrorState role="alert" class="min-h-80 rounded-xl border border-gray-800 bg-gray-900 px-6 text-white">
              <span aria-hidden="true" class="grid size-12 place-items-center rounded-lg bg-red-950 text-xl text-red-300">!</span>
              <div class="max-w-sm">
                <h2 id="error-bridge-region-title" class="text-lg font-semibold">Bridge records could not load</h2>
                <p class="mt-2 text-sm leading-6 text-gray-400">Slipway could not reach this datastore. Your filters have been preserved.</p>
              </div>
              <div class="flex flex-wrap justify-center gap-3">
                <Button type="button" class="min-h-10 min-w-0 bg-white px-4 py-2 text-gray-950 hover:bg-gray-200 dark:bg-white dark:text-gray-950" @click="args.onRetryBridge">Try again</Button>
                <Link href="#projects" class="inline-flex min-h-10 items-center px-3 text-sm font-medium text-gray-300 no-underline hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white" @click.prevent>Return to projects</Link>
              </div>
            </ErrorState>
          </section>

          <section class="border-2 border-black bg-[#f4f0e8] p-6 text-black shadow-[5px_5px_0_0_#000]" aria-labelledby="error-content-title">
            <ErrorState role="alert" class="min-h-80 rounded-none border-2 border-black bg-white px-6 text-black">
              <span aria-hidden="true" class="text-5xl leading-none">×</span>
              <div class="max-w-sm">
                <h2 id="error-content-title" class="text-xl font-bold">Invoices could not load</h2>
                <p class="mt-2 text-sm leading-6 text-black/60">Hagfish kept your current work. Check the connection and try again.</p>
              </div>
              <Button type="button" class="min-h-11 min-w-0 rounded-none border-2 border-black bg-black px-5 font-semibold text-white hover:bg-white hover:text-black dark:bg-black dark:text-white" @click="args.onRetryContent">Try again</Button>
            </ErrorState>
          </section>

          <ErrorState as="section" aria-labelledby="error-static-title" class="min-h-80 items-start bg-white px-6 text-left dark:bg-gray-950 lg:col-span-2">
            <p class="font-mono text-sm font-semibold tracking-[0.14em] text-gray-400">503</p>
            <div class="max-w-2xl">
              <h2 id="error-static-title" class="text-balance text-4xl font-semibold tracking-tighter">Slipway is temporarily unavailable</h2>
              <p class="mt-4 max-w-xl leading-7 text-gray-500 dark:text-gray-400">We are finishing some work behind the scenes. Try again in a moment.</p>
            </div>
            <nav aria-label="Recovery" class="flex flex-wrap gap-3">
              <a href="" class="inline-flex min-h-11 items-center rounded-md bg-gray-950 px-5 text-sm font-semibold text-white no-underline hover:bg-gray-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-950 dark:bg-white dark:text-gray-950 dark:hover:bg-gray-200 dark:focus-visible:outline-white">Try again</a>
              <Link href="#home" class="inline-flex min-h-11 items-center px-4 text-sm font-semibold text-gray-600 no-underline hover:text-gray-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-950 dark:text-gray-300 dark:hover:text-white dark:focus-visible:outline-white" @click.prevent>Return to Slipway</Link>
            </nav>
          </ErrorState>
        </div>
      </main>
    `,
  }),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getAllByRole("alert")).toHaveLength(2);
    await expect(
      canvas
        .getByRole("heading", { name: "Slipway is temporarily unavailable" })
        .closest('[data-slot="error-state"]'),
    ).not.toHaveAttribute("role");
    await userEvent.click(
      canvas.getAllByRole("button", { name: "Try again" })[0],
    );
    await expect(args.onRetryBridge).toHaveBeenCalledOnce();
  },
};
