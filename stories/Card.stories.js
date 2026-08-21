import { Link } from "@inertiajs/vue3";
import { expect, fn, userEvent, within } from "storybook/test";
import Card from "../src/vue/card/Card.vue";
import Button from "../src/vue/button/Button.vue";

const meta = {
  title: "Components/Card",
  component: Card,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "One shallow semantic surface. Choose the truthful element, write native content and actions, and let ordinary Tailwind carry the product design.",
      },
    },
  },
  args: {
    as: "article",
    title: "Production API",
    description: "Healthy in Lagos with three replicas.",
  },
  argTypes: {
    as: {
      control: "select",
      options: ["div", "article", "section", "aside"],
      description: "Truthful native element for the surrounding document.",
    },
    title: { control: "text" },
    description: { control: "text" },
  },
};

export default meta;

export const Playground = {
  parameters: { controls: { include: ["as", "title", "description"] } },
  render: (args) => ({
    components: { Card },
    setup() {
      return { args };
    },
    template: `
      <Card :as="args.as" class="w-[min(88vw,28rem)]">
        <h2 class="text-lg font-semibold">{{ args.title }}</h2>
        <p class="mt-2 leading-6 text-gray-600 dark:text-gray-300">{{ args.description }}</p>
      </Card>
    `,
  }),
  play: async ({ canvasElement, args }) => {
    const card = canvasElement.querySelector('[data-slot="card"]');

    await expect(card.tagName.toLowerCase()).toBe(args.as);
    await expect(card).toHaveTextContent(args.title);
    await expect(card.querySelectorAll('[data-slot="card"]')).toHaveLength(0);
  },
};

export const Semantics = {
  parameters: { layout: "fullscreen", controls: { disable: true } },
  render: () => ({
    components: { Card, Link },
    setup() {
      return { Link };
    },
    template: `
      <section class="klean-story-canvas px-5 py-14 sm:px-8 lg:px-12 lg:py-20" aria-labelledby="card-semantics-title">
        <header class="max-w-3xl">
          <h1 id="card-semantics-title" class="text-balance text-4xl font-semibold tracking-tighter sm:text-5xl">A surface does not decide what it is.</h1>
          <p class="mt-5 max-w-2xl text-pretty text-base leading-7 text-klean-muted">Card adds one visual seam. The application chooses an article, section, anchor, Boring Stack Link, or button from the content and the action.</p>
        </header>

        <div class="mt-12 grid max-w-6xl gap-6 md:grid-cols-2 xl:grid-cols-3">
          <Card>
            <h2 class="font-semibold">Neutral grouping</h2>
            <p class="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-300">Use a div when no stronger semantic element fits.</p>
          </Card>

          <Card as="article">
            <h2 class="font-semibold">Independent release note</h2>
            <p class="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-300">An article still makes sense when removed from this grid.</p>
          </Card>

          <Card as="section" aria-labelledby="card-billing-title">
            <h2 id="card-billing-title" class="font-semibold">Billing summary</h2>
            <p class="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-300">A labelled section groups one part of the page.</p>
          </Card>

          <Card as="a" href="#native-anchor" class="block cursor-pointer no-underline transition-colors hover:bg-gray-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-950 dark:hover:bg-gray-900 dark:focus-visible:outline-white" @click.prevent>
            <h2 class="font-semibold">Native anchor</h2>
            <p class="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-300">Modified clicks and destinations remain browser behavior.</p>
          </Card>

          <Card :as="Link" href="#inertia-link" class="block cursor-pointer no-underline transition-colors hover:bg-gray-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-950 dark:hover:bg-gray-900 dark:focus-visible:outline-white" @click.prevent>
            <h2 class="font-semibold">Boring Stack Link</h2>
            <p class="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-300">Pass the framework component directly. No adapter prop.</p>
          </Card>

          <Card as="button" type="button" class="w-full cursor-pointer text-left transition-colors hover:bg-gray-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-950 dark:hover:bg-gray-900 dark:focus-visible:outline-white">
            <span class="font-semibold">Action card</span>
            <span class="mt-2 block text-sm leading-6 text-gray-600 dark:text-gray-300">A whole-card command is a real button.</span>
          </Card>
        </div>
      </section>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(
      canvas.getByRole("link", { name: /Native anchor/ }),
    ).toHaveAttribute("href", "#native-anchor");
    await expect(
      canvas.getByRole("link", { name: /Boring Stack Link/ }),
    ).toHaveAttribute("href", "#inertia-link");
    await expect(
      canvas.getByRole("button", { name: /Action card/ }),
    ).toHaveAttribute("type", "button");
  },
};

export const Apps = {
  parameters: { layout: "fullscreen", controls: { disable: true } },
  args: { onCurrency: fn(), onDeploy: fn() },
  render: (args) => ({
    components: { Button, Card, Link },
    setup() {
      return { args, Link };
    },
    template: `
      <section class="klean-story-canvas px-5 py-14 sm:px-8 lg:px-12 lg:py-20" aria-labelledby="card-apps-title">
        <header class="max-w-3xl">
          <h1 id="card-apps-title" class="text-balance text-4xl font-semibold tracking-tighter sm:text-5xl">One boundary. Two products.</h1>
          <p class="mt-5 max-w-2xl text-pretty text-base leading-7 text-klean-muted">Hagfish keeps its offset-shadow voice. Slipway stays compact and operational. Both use the same one-element Card.</p>
        </header>

        <div class="mt-12 grid max-w-7xl gap-10 xl:grid-cols-2">
          <article class="space-y-4">
            <Card as="article" aria-labelledby="hagfish-revenue-title" class="flex min-h-64 flex-col justify-between gap-8 rounded-lg border-2 border-black bg-black p-6 text-white shadow-[4px_4px_0_0_rgba(0,0,0,0.3)] dark:border-white dark:bg-white dark:text-black">
              <header class="flex items-start justify-between gap-4">
                <h2 id="hagfish-revenue-title" class="text-sm font-medium text-white/60 dark:text-black/60">Revenue</h2>
                <Button type="button" class="min-h-8 min-w-0 border border-white/20 bg-white/10 px-2.5 py-1 text-xs text-white hover:bg-white/20 dark:border-black/20 dark:bg-black/10 dark:text-black dark:hover:bg-black/20" @click="args.onCurrency">USD ↔</Button>
              </header>
              <Link href="#paid-invoices" class="block min-w-0 text-[clamp(2.2rem,7vw,4.25rem)] font-bold leading-none tracking-tight text-white no-underline tabular-nums dark:text-black" @click.prevent>$128,420.00</Link>
            </Card>
            <p class="text-sm leading-6 text-klean-muted">Because this card has a currency action and a value destination, the outer Card stays an article. It does not wrap controls in one large link.</p>
          </article>

          <article class="space-y-4">
            <Card as="section" aria-labelledby="slipway-api-title" class="p-4">
              <header class="flex items-center justify-between gap-4">
                <div class="min-w-0">
                  <h2 id="slipway-api-title" class="truncate text-sm font-medium">api</h2>
                  <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">Production · Lagos</p>
                </div>
                <span class="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700 dark:text-emerald-400"><span aria-hidden="true" class="size-1.5 rounded-full bg-emerald-500"></span>Healthy</span>
              </header>
              <dl class="mt-5 grid grid-cols-3 gap-4 text-sm">
                <div><dt class="text-xs text-gray-500 dark:text-gray-400">Replicas</dt><dd class="mt-1 font-medium tabular-nums">3</dd></div>
                <div><dt class="text-xs text-gray-500 dark:text-gray-400">Memory</dt><dd class="mt-1 font-medium tabular-nums">384 MB</dd></div>
                <div><dt class="text-xs text-gray-500 dark:text-gray-400">Region</dt><dd class="mt-1 font-medium">LOS</dd></div>
              </dl>
              <footer class="mt-5 flex items-center gap-3">
                <Button type="button" class="min-h-9 min-w-0 px-3 py-1.5 text-xs" @click="args.onDeploy">Deploy</Button>
                <Link href="#service-settings" class="text-xs font-medium text-gray-600 underline underline-offset-4 dark:text-gray-300" @click.prevent>Settings</Link>
              </footer>
            </Card>

            <Card :as="Link" href="#deployment-1842" class="group block p-4 no-underline transition-colors hover:bg-gray-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-950 dark:hover:bg-gray-900 dark:focus-visible:outline-white" @click.prevent>
              <div class="flex items-center justify-between gap-4">
                <div><h2 class="text-sm font-medium">Deployment #1842</h2><p class="mt-1 text-xs text-gray-500 dark:text-gray-400">main · a13e9c7</p></div>
                <span class="text-xs font-medium text-emerald-700 dark:text-emerald-400">Ready →</span>
              </div>
            </Card>
          </article>
        </div>
      </section>
    `,
  }),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByRole("button", { name: "USD ↔" }));
    await expect(args.onCurrency).toHaveBeenCalledOnce();
    await userEvent.click(canvas.getByRole("button", { name: "Deploy" }));
    await expect(args.onDeploy).toHaveBeenCalledOnce();
    await expect(
      canvasElement.querySelectorAll('a[data-slot="card"] button'),
    ).toHaveLength(0);
    await expect(
      canvas.getByRole("link", { name: /Deployment #1842/ }),
    ).toHaveAttribute("href", "#deployment-1842");
  },
};
