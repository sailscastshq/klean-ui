import { fn } from "storybook/test";
import Button from "../src/vue/button/Button.vue";
import Spinner from "../src/vue/spinner/Spinner.vue";

const BoringStackLink = {
  name: "BoringStackLink",
  inheritAttrs: false,
  template: '<a v-bind="$attrs" data-boring-stack-link=""><slot /></a>',
};

const hagfishRecipe = [
  "min-h-12 border-2 border-black bg-black px-6 text-base text-white",
  "hover:-translate-x-0.5 hover:-translate-y-0.5 hover:bg-white hover:text-black hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]",
  "active:translate-x-1 active:translate-y-1 active:shadow-none",
  "dark:border-white dark:bg-white dark:text-black dark:hover:bg-transparent dark:hover:text-white dark:hover:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]",
].join(" ");

const slipwayRecipe = [
  "min-h-9 min-w-0 rounded-md bg-gray-900 px-3 py-1.5 text-sm text-white",
  "hover:bg-gray-800 active:bg-gray-700",
  "dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100 dark:active:bg-gray-200",
].join(" ");

const destructiveRecipe = [
  "bg-red-600 text-white hover:bg-red-700 focus-visible:outline-red-600",
  "dark:bg-red-600 dark:text-white dark:hover:bg-red-500",
].join(" ");

const meta = {
  title: "Components/Button",
  component: Button,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A native-first Button with behavioral props only. The visual API is the framework's ordinary class attribute; caller classes are merged last with `tailwind-merge`.",
      },
    },
  },
  args: {
    as: "button",
    type: "button",
    disabled: false,
    class: "",
    onClick: fn(),
  },
  argTypes: {
    as: {
      control: "select",
      options: ["button", "a"],
      description:
        "Native element or a framework component such as the Inertia Link component.",
      table: {
        type: { summary: "'button' | 'a' | Component" },
        defaultValue: { summary: "'button'" },
      },
    },
    type: {
      control: "select",
      options: ["button", "submit", "reset"],
      description: "Native button type. Ignored for non-button elements.",
    },
    disabled: {
      control: "boolean",
      description:
        "Native disabled state for buttons; aria-disabled and tabindex management for links.",
    },
    class: {
      control: "text",
      description:
        "Tailwind classes merged last. This is the visual customization API.",
      table: { category: "Attributes" },
    },
    onClick: {
      table: { category: "Events" },
    },
  },
};

export default meta;

export const Playground = {
  render: (args) => ({
    components: { Button },
    setup() {
      return { args };
    },
    template: '<Button v-bind="args">Continue</Button>',
  }),
};

export const StateSheet = {
  name: "States",
  parameters: { controls: { disable: true } },
  render: () => ({
    components: { Button, Spinner },
    template: `
      <section class="w-[min(42rem,calc(100vw-2rem))] bg-white p-6 sm:p-10" aria-labelledby="button-states-title">
        <div class="flex items-end justify-between gap-6">
          <div>
            <p class="font-mono text-[11px] uppercase tracking-[0.2em] text-klean-muted">Button / state sheet</p>
            <h2 id="button-states-title" class="mt-2 text-2xl font-semibold tracking-[-0.03em]">One primitive, honest states</h2>
          </div>
          <span class="font-mono text-xs text-klean-muted">44px default target</span>
        </div>

        <div class="mt-10 grid gap-x-8 gap-y-8 sm:grid-cols-[7rem_1fr] sm:items-center">
          <p class="font-mono text-xs text-klean-muted">default</p>
          <div><Button>Continue</Button></div>

          <p class="font-mono text-xs text-klean-muted">disabled</p>
          <div><Button disabled>Continue</Button></div>

          <p class="font-mono text-xs text-klean-muted">processing</p>
          <div>
            <Button disabled aria-busy="true">
              <Spinner />
              Saving
            </Button>
          </div>

          <p class="font-mono text-xs text-klean-muted">icon only</p>
          <div>
            <Button aria-label="Add project" class="px-0">
              <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                <path d="M12 5v14M5 12h14" stroke-linecap="round" />
              </svg>
            </Button>
          </div>
        </div>
      </section>
    `,
  }),
};

export const SemanticElements = {
  name: "Semantics",
  parameters: { layout: "fullscreen", controls: { disable: true } },
  render: () => ({
    components: { Button, BoringStackLink },
    setup() {
      return { BoringStackLink };
    },
    template: `
      <section class="klean-story-canvas px-5 py-14 sm:px-8 lg:px-12 lg:py-20" aria-labelledby="semantic-recipes-title">
        <header class="max-w-3xl">
          <p class="font-mono text-[11px] uppercase tracking-[0.2em] text-klean-muted">Semantic recipes</p>
          <h1 id="semantic-recipes-title" class="mt-3 text-balance text-4xl font-semibold tracking-[-0.05em] sm:text-5xl">Keep the treatment. Render the truthful element.</h1>
          <p class="mt-5 max-w-2xl text-pretty text-base leading-7 text-klean-muted">Use a button for an action, a native anchor for a full-page destination, and the Boring Stack Link for internal Inertia navigation. Never put a button inside an anchor.</p>
        </header>

        <ul class="mt-12 grid gap-4 lg:grid-cols-3" role="list">
          <li>
            <article class="flex h-full flex-col bg-white p-6 sm:p-8" aria-labelledby="action-recipe-title">
              <p class="font-mono text-[11px] uppercase tracking-[0.18em] text-klean-muted">Action</p>
              <h2 id="action-recipe-title" class="mt-2 text-xl font-semibold">Native button</h2>
              <p class="mt-2 text-sm leading-6 text-klean-muted">Opens UI, submits a form, or changes state on the current page.</p>
              <div class="mt-8"><Button type="button">Open command menu</Button></div>
              <code class="mt-auto block pt-10 font-mono text-xs text-klean-muted">&lt;Button type="button"&gt;</code>
            </article>
          </li>
          <li>
            <article class="flex h-full flex-col bg-white p-6 sm:p-8" aria-labelledby="anchor-recipe-title">
              <p class="font-mono text-[11px] uppercase tracking-[0.18em] text-klean-muted">Full-page navigation</p>
              <h2 id="anchor-recipe-title" class="mt-2 text-xl font-semibold">Native anchor</h2>
              <p class="mt-2 text-sm leading-6 text-klean-muted">External sites, OAuth redirects, downloads, and destinations that require a document load.</p>
              <div class="mt-8"><Button as="a" href="#semantic-recipes-title">Read the guide</Button></div>
              <code class="mt-auto block pt-10 font-mono text-xs text-klean-muted">&lt;Button as="a" href="..."&gt;</code>
            </article>
          </li>
          <li>
            <article class="flex h-full flex-col bg-klean-ink p-6 text-white sm:p-8" aria-labelledby="inertia-recipe-title">
              <p class="font-mono text-[11px] uppercase tracking-[0.18em] text-white/45">Boring Stack navigation</p>
              <h2 id="inertia-recipe-title" class="mt-2 text-xl font-semibold">Inertia Link</h2>
              <p class="mt-2 text-sm leading-6 text-white/55">Pass the framework component directly. Button supplies treatment while Link keeps client-side navigation semantics.</p>
              <div class="mt-8">
                <Button :as="BoringStackLink" href="#semantic-recipes-title" class="bg-white text-gray-950 hover:bg-gray-100 dark:bg-white dark:text-gray-950 dark:hover:bg-gray-100">View projects</Button>
              </div>
              <code class="mt-auto block pt-10 font-mono text-xs text-white/45">&lt;Button :as="Link" href="..."&gt;</code>
            </article>
          </li>
        </ul>
      </section>
    `,
  }),
};

export const EverydayUses = {
  name: "Recipes",
  parameters: { layout: "fullscreen", controls: { disable: true } },
  render: () => ({
    components: { Button, Spinner },
    template: `
      <section class="klean-story-canvas px-5 py-14 sm:px-8 lg:px-12 lg:py-20" aria-labelledby="everyday-uses-title">
        <header class="max-w-3xl">
          <p class="font-mono text-[11px] uppercase tracking-[0.2em] text-klean-muted">Hagfish + Slipway audit</p>
          <h1 id="everyday-uses-title" class="mt-3 text-balance text-4xl font-semibold tracking-[-0.05em] sm:text-5xl">One lean contract, many real jobs.</h1>
          <p class="mt-5 max-w-2xl text-pretty text-base leading-7 text-klean-muted">These recipes cover the recurring source-app patterns without turning size, color, density, or loading into Button props.</p>
        </header>

        <ul class="mt-12 grid gap-4 sm:grid-cols-2 xl:grid-cols-4" role="list">
          <li class="bg-white p-6">
            <article aria-labelledby="submit-recipe-title">
              <h2 id="submit-recipe-title" class="font-semibold">Processing submit</h2>
              <p class="mt-2 min-h-12 text-sm leading-6 text-klean-muted">Inertia owns request state; the form owns the label.</p>
              <Button type="submit" disabled aria-busy="true" class="mt-7 w-full">
                <Spinner />
                Saving changes
              </Button>
            </article>
          </li>
          <li class="bg-white p-6">
            <article aria-labelledby="toolbar-recipe-title">
              <h2 id="toolbar-recipe-title" class="font-semibold">Dense toolbar</h2>
              <p class="mt-2 min-h-12 text-sm leading-6 text-klean-muted">Slipway-style 36px desktop control with an accessible name.</p>
              <Button type="button" aria-label="Refresh deployments" class="mt-7 min-h-9 min-w-9 px-0 py-0">
                <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                  <path d="M20 7v5h-5M4 17v-5h5M6.1 9A7 7 0 0 1 18 6l2 6M18 15a7 7 0 0 1-11.9 3L4 12" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
              </Button>
            </article>
          </li>
          <li class="bg-white p-6">
            <article aria-labelledby="toggle-recipe-title">
              <h2 id="toggle-recipe-title" class="font-semibold">Pressed action</h2>
              <p class="mt-2 min-h-12 text-sm leading-6 text-klean-muted">Native button state remains available through aria attributes.</p>
              <Button type="button" aria-pressed="true" class="mt-7 bg-white text-gray-950 ring-2 ring-inset ring-gray-950 hover:bg-gray-100 dark:bg-white dark:text-gray-950">
                Sidebar visible
              </Button>
            </article>
          </li>
          <li class="bg-white p-6">
            <article aria-labelledby="destructive-recipe-title">
              <h2 id="destructive-recipe-title" class="font-semibold">Quiet destructive action</h2>
              <p class="mt-2 min-h-12 text-sm leading-6 text-klean-muted">Clear language and color, without a danger prop.</p>
              <Button type="button" class="mt-7 min-h-0 min-w-0 bg-transparent px-0 py-0 text-red-700 hover:bg-transparent hover:text-red-800 dark:bg-transparent dark:text-red-700">
                Stop recurring invoices
              </Button>
            </article>
          </li>
        </ul>
      </section>
    `,
  }),
};

export const ProductRecipes = {
  name: "Products",
  parameters: { layout: "fullscreen", controls: { disable: true } },
  render: () => ({
    components: { Button },
    setup() {
      return { hagfishRecipe, slipwayRecipe, destructiveRecipe };
    },
    template: `
      <div class="grid min-h-svh lg:grid-cols-2">
        <section class="flex min-h-[50svh] flex-col justify-between bg-klean-paper p-6 sm:p-10 lg:min-h-svh lg:p-14" aria-labelledby="hagfish-title">
          <header>
            <p class="font-mono text-[11px] uppercase tracking-[0.2em] text-klean-muted">Expressive recipe</p>
            <h2 id="hagfish-title" class="mt-3 text-4xl font-semibold tracking-[-0.05em]">Hagfish</h2>
            <p class="mt-3 max-w-sm text-sm leading-6 text-klean-muted">High contrast, generous proportions, and a physical offset-shadow response.</p>
          </header>
          <div class="py-14">
            <Button :class="hagfishRecipe">
              Send invoice
              <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                <path d="m5 12 5 5L20 7" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </Button>
          </div>
          <code class="break-words font-mono text-[11px] leading-5 text-klean-muted">class="{{ hagfishRecipe }}"</code>
        </section>

        <section class="dark flex min-h-[50svh] flex-col justify-between bg-gray-950 p-6 text-white sm:p-10 lg:min-h-svh lg:p-14" aria-labelledby="slipway-title">
          <header>
            <p class="font-mono text-[11px] uppercase tracking-[0.2em] text-white/45">Compact recipe</p>
            <h2 id="slipway-title" class="mt-3 text-4xl font-semibold tracking-[-0.05em]">Slipway</h2>
            <p class="mt-3 max-w-sm text-sm leading-6 text-white/55">Quiet geometry for dense operational surfaces, with tonal feedback instead of movement.</p>
          </header>
          <div class="flex flex-wrap items-center gap-2 py-14">
            <Button :class="slipwayRecipe">Deploy</Button>
            <Button class="min-h-9 min-w-0 bg-transparent px-3 py-1.5 text-gray-300 ring-1 ring-inset ring-white/15 hover:bg-white/10 dark:bg-transparent dark:text-gray-300 dark:hover:bg-white/10">Cancel</Button>
            <Button :class="destructiveRecipe">Delete service</Button>
          </div>
          <code class="break-words font-mono text-[11px] leading-5 text-white/45">class="{{ slipwayRecipe }}"</code>
        </section>
      </div>
    `,
  }),
};

export const ClassOwnership = {
  name: "Classes",
  parameters: { controls: { disable: true } },
  render: () => ({
    components: { Button },
    template: `
      <section class="w-[min(44rem,calc(100vw-2rem))] bg-gray-200 p-8 sm:p-14" aria-labelledby="ownership-title">
        <p class="font-mono text-[11px] uppercase tracking-[0.2em] text-klean-ink/60">Override proof</p>
        <h2 id="ownership-title" class="mt-3 max-w-lg text-4xl font-semibold tracking-[-0.05em]">The component does not negotiate with your design.</h2>
        <p class="mt-4 max-w-xl text-sm leading-6 text-klean-ink/70">This button replaces the default height, radius, background, text color, spacing, typography, shadow, and motion using one ordinary class attribute.</p>
        <Button class="mt-10 min-h-14 rounded-full bg-white px-8 text-base font-semibold text-gray-950 shadow-[0_8px_0_0_#151512] hover:-translate-y-0.5 hover:bg-white active:translate-y-2 active:shadow-none">
          Make it mine
        </Button>
      </section>
    `,
  }),
};

export const NativeAnchor = {
  name: "Anchor",
  args: {
    as: "a",
    href: "#button-api",
    class: "no-underline",
  },
  render: (args) => ({
    components: { Button },
    setup() {
      return { args };
    },
    template: `
      <Button v-bind="args">
        Read the API
        <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
          <path d="M5 12h14m-5-5 5 5-5 5" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </Button>
    `,
  }),
};

export const BoringStackNavigation = {
  name: "Inertia Link",
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          'In a Boring Stack app, import `Link` from `@inertiajs/vue3` and pass it directly with `<Button :as="Link" href="/projects">`. This workbench uses a small anchor-backed stand-in so the recipe remains interactive without making Inertia a Button dependency.',
      },
    },
  },
  render: () => ({
    components: { Button, BoringStackLink },
    setup() {
      return { BoringStackLink };
    },
    template: `
      <Button :as="BoringStackLink" href="#button-api">
        View projects
        <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
          <path d="M5 12h14m-5-5 5 5-5 5" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </Button>
    `,
  }),
};
