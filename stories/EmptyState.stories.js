import { Link } from "@inertiajs/vue3";
import { expect, fn, userEvent, within } from "storybook/test";
import EmptyState from "../src/vue/empty-state/EmptyState.vue";

const meta = {
  title: "Components/EmptyState",
  component: EmptyState,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "One shallow empty-result layout. The application writes the truthful reason, semantic heading, real next action, and ordinary Tailwind.",
      },
    },
  },
  args: {
    as: "section",
    title: "No projects yet",
    description: "Create your first project to deploy an application.",
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
  render: (args) => ({
    components: { EmptyState, Link },
    setup() {
      return { args, Link };
    },
    template: `
      <EmptyState :as="args.as" aria-labelledby="empty-playground-title" class="w-[min(42rem,calc(100vw-2rem))] rounded-lg border border-gray-200 dark:border-gray-800">
        <span aria-hidden="true" class="grid size-12 place-items-center rounded-lg bg-gray-100 text-2xl dark:bg-gray-800">＋</span>
        <div class="max-w-md">
          <h2 id="empty-playground-title" class="text-lg font-semibold">{{ args.title }}</h2>
          <p class="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-300">{{ args.description }}</p>
        </div>
        <Link href="#create-project" class="inline-flex min-h-10 items-center rounded-md bg-gray-950 px-4 text-sm font-medium text-white no-underline hover:bg-gray-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-950 dark:bg-white dark:text-gray-950 dark:hover:bg-gray-200 dark:focus-visible:outline-white" @click.prevent>Create project</Link>
      </EmptyState>
    `,
  }),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const root = canvasElement.querySelector('[data-slot="empty-state"]');

    await expect(root.tagName.toLowerCase()).toBe(args.as);
    await expect(
      canvas.getByRole("heading", { name: args.title }),
    ).toBeVisible();
    await expect(
      canvas.getByRole("link", { name: "Create project" }),
    ).toHaveAttribute("href", "#create-project");
  },
};

export const Apps = {
  parameters: { layout: "fullscreen", controls: { disable: true } },
  args: { onClear: fn(), onRefresh: fn() },
  render: (args) => ({
    components: { EmptyState, Link },
    setup() {
      return { args, Link };
    },
    template: `
      <main class="grid min-h-svh lg:grid-cols-2">
        <section class="bg-gray-950 p-6 text-white sm:p-10" aria-labelledby="empty-slipway-title">
          <EmptyState as="div" class="min-h-120 rounded-xl border border-gray-800 bg-gray-900 px-6 text-white">
            <span aria-hidden="true" class="grid size-12 place-items-center rounded-lg bg-gray-800 text-xl text-gray-300">＋</span>
            <div class="max-w-sm">
              <h1 id="empty-slipway-title" class="text-xl font-semibold tracking-tight">No projects yet</h1>
              <p class="mt-2 text-sm leading-6 text-gray-400">Create your first project to deploy an application with Slipway.</p>
            </div>
            <Link href="#new-project" class="inline-flex min-h-10 items-center rounded-md bg-white px-4 text-sm font-medium text-gray-950 no-underline hover:bg-gray-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white" @click.prevent>Create project</Link>
          </EmptyState>
        </section>

        <section class="bg-[#f7f3eb] p-6 text-black sm:p-10" aria-labelledby="empty-hagfish-title">
          <EmptyState as="div" class="min-h-120 rounded-none border-2 border-black bg-white px-6 text-black shadow-[6px_6px_0_0_#000]">
            <span aria-hidden="true" class="text-5xl leading-none">◎</span>
            <div class="max-w-sm">
              <h2 id="empty-hagfish-title" class="text-2xl font-bold tracking-tight">No clients yet</h2>
              <p class="mt-2 leading-6 text-black/60">Add a client before sending your first beautifully boring invoice.</p>
            </div>
            <Link href="#new-client" class="inline-flex min-h-11 items-center border-2 border-black bg-black px-5 text-sm font-semibold text-white no-underline hover:bg-white hover:text-black focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black" @click.prevent>Add client</Link>
          </EmptyState>
        </section>

        <section class="bg-white p-6 text-gray-950 dark:bg-gray-950 dark:text-white sm:p-10 lg:col-span-2" aria-labelledby="empty-bridge-title">
          <div class="mx-auto max-w-4xl overflow-hidden rounded-lg border border-gray-200 dark:border-gray-800">
            <header class="border-b border-gray-200 px-4 py-3 dark:border-gray-800"><h2 id="empty-bridge-title" class="text-sm font-semibold">Bridge records</h2></header>
            <EmptyState class="min-h-0 gap-2 px-4 py-10 text-sm text-gray-500 dark:text-gray-400">
              <p>No records match “worker”.</p>
              <button type="button" class="min-h-9 cursor-pointer rounded-md px-3 font-medium text-gray-950 underline underline-offset-4 hover:bg-gray-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-950 dark:text-white dark:hover:bg-gray-900 dark:focus-visible:outline-white" @click="args.onClear">Clear filters</button>
            </EmptyState>
          </div>
        </section>
      </main>
    `,
  }),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByText("No projects yet")).toBeVisible();
    await expect(canvas.getByText("No clients yet")).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: "Clear filters" }));
    await expect(args.onClear).toHaveBeenCalledOnce();
  },
};
