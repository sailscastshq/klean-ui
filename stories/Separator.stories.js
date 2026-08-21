import { expect } from "storybook/test";
import Separator from "../src/vue/separator/Separator.vue";

const meta = {
  title: "Components/Separator",
  component: Separator,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "One honest boundary for the rare places where spacing is not enough. Horizontal uses a native thematic break; vertical supplies the semantics HTML does not have. Tailwind owns every visual decision.",
      },
    },
  },
  args: {
    orientation: "horizontal",
    class: "",
  },
  argTypes: {
    orientation: {
      control: "inline-radio",
      options: ["horizontal", "vertical"],
      description: "Semantic direction, not a visual variant.",
    },
    class: { control: "text" },
  },
};

export default meta;

export const Playground = {
  parameters: { controls: { include: ["orientation", "class"] } },
  render: (args) => ({
    components: { Separator },
    setup() {
      return { args };
    },
    template: `
      <div :class="args.orientation === 'vertical' ? 'flex h-32 items-stretch' : 'w-[min(80vw,28rem)]'">
        <Separator :orientation="args.orientation" :class="args.class" />
      </div>
    `,
  }),
  play: async ({ canvasElement, args }) => {
    const separator = canvasElement.querySelector('[data-slot="separator"]');

    await expect(separator.dataset.orientation).toBe(args.orientation);
    await expect(separator.tagName).toBe(
      args.orientation === "vertical" ? "DIV" : "HR",
    );
    if (args.orientation === "vertical") {
      await expect(separator).toHaveAttribute("role", "separator");
      await expect(separator).toHaveAttribute("aria-orientation", "vertical");
    }
  },
};

export const Intent = {
  parameters: { layout: "fullscreen", controls: { disable: true } },
  render: () => ({
    components: { Separator },
    template: `
      <section class="klean-story-canvas px-5 py-14 sm:px-8 lg:px-12 lg:py-20" aria-labelledby="separator-intent-title">
        <header class="max-w-3xl">
          <h1 id="separator-intent-title" class="text-balance text-4xl font-semibold tracking-tighter sm:text-5xl">Spacing first. A line when the boundary matters.</h1>
          <p class="mt-5 max-w-2xl text-pretty text-base leading-7 text-klean-muted">Separator is not a layout primitive. Use it for a real thematic break or a dense control boundary; keep ordinary groups clean with spacing.</p>
        </header>

        <div class="mt-12 grid max-w-6xl gap-8 lg:grid-cols-2">
          <article class="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-950">
            <header>
              <p class="text-sm font-medium">Account</p>
              <p class="mt-1 text-sm text-gray-600 dark:text-gray-300">Identity and sign-in preferences.</p>
            </header>
            <Separator class="my-6" />
            <section aria-labelledby="security-title">
              <h2 id="security-title" class="font-semibold">Security</h2>
              <p class="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-300">This thematic change is meaningful, so the native horizontal rule remains in the accessibility tree.</p>
            </section>
          </article>

          <article class="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-950">
            <p class="text-sm font-medium">Toolbar boundary</p>
            <div class="mt-5 flex h-10 items-stretch rounded-lg bg-gray-100 p-1 dark:bg-gray-900" role="toolbar" aria-label="Document actions">
              <button type="button" class="cursor-pointer rounded-md px-3 text-sm hover:bg-white dark:hover:bg-gray-800">Undo</button>
              <button type="button" class="cursor-pointer rounded-md px-3 text-sm hover:bg-white dark:hover:bg-gray-800">Redo</button>
              <Separator orientation="vertical" aria-hidden="true" class="mx-1 h-6 self-center bg-gray-300 dark:bg-gray-700" />
              <button type="button" class="cursor-pointer rounded-md px-3 text-sm hover:bg-white dark:hover:bg-gray-800">Share</button>
            </div>
            <p class="mt-5 text-sm leading-6 text-gray-600 dark:text-gray-300">This line is only visual. <code class="font-mono text-xs">aria-hidden</code> keeps it silent without a decorative prop.</p>
          </article>
        </div>
      </section>
    `,
  }),
};

export const Apps = {
  parameters: { layout: "fullscreen", controls: { disable: true } },
  render: () => ({
    components: { Separator },
    template: `
      <section class="klean-story-canvas px-5 py-14 sm:px-8 lg:px-12 lg:py-20" aria-labelledby="separator-apps-title">
        <header class="max-w-3xl">
          <h1 id="separator-apps-title" class="text-balance text-4xl font-semibold tracking-tighter sm:text-5xl">One semantic seam. Each product keeps its voice.</h1>
          <p class="mt-5 max-w-2xl text-pretty text-base leading-7 text-klean-muted">Hagfish can replace its Divider dependency without flattening its contrast. Slipway can keep compact operational grouping. Neither app turns every border into a component.</p>
        </header>

        <div class="mt-12 grid max-w-7xl gap-10 xl:grid-cols-2">
          <article class="space-y-4">
            <div class="border-2 border-black bg-white p-2 shadow-[6px_6px_0_0_#000] dark:border-white dark:bg-gray-950 dark:shadow-[6px_6px_0_0_#fff]">
              <a href="#profile" class="block px-4 py-3 font-medium no-underline">Profile</a>
              <a href="#billing" class="block px-4 py-3 font-medium no-underline">Billing</a>
              <Separator aria-hidden="true" class="my-1 bg-black/10 dark:bg-white/10" />
              <button type="button" class="w-full cursor-pointer px-4 py-3 text-left font-medium text-red-700 dark:text-red-400">Sign out</button>
            </div>
          </article>

          <article class="space-y-4">
            <div class="overflow-hidden rounded-xl bg-white shadow-sm dark:bg-gray-950">
              <div class="p-4"><p class="text-sm font-medium">Deploy production</p><p class="mt-1 text-xs text-gray-500 dark:text-gray-400">main · Lagos · 3 replicas</p></div>
              <Separator aria-hidden="true" class="bg-gray-100 dark:bg-gray-800" />
              <footer class="flex items-center justify-between gap-4 px-4 py-3 text-xs text-gray-500 dark:text-gray-400"><span>Enter to deploy</span><span>Esc to close</span></footer>
            </div>
          </article>
        </div>
      </section>
    `,
  }),
};
