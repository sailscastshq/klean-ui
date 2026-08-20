import { expect, userEvent, within } from "storybook/test";
import { ref } from "vue";
import Button from "../src/vue/button/Button.vue";
import Sheet from "../src/vue/sheet/Sheet.vue";
import { contract } from "./shared/contract.js";

const meta = {
  title: "Components/Sheet",
  component: Sheet,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "A native off-canvas dialog. The browser owns modality and focus; Klean UI supplies durable dismissal, smooth motion, and a neutral right-side frame. Ordinary Tailwind moves the same component left or to the bottom.",
      },
    },
  },
  args: {
    dismissible: true,
    class: "",
  },
  argTypes: {
    dismissible: {
      control: "boolean",
      description: "Allows Escape, platform dismissal, and backdrop dismissal.",
    },
    class: {
      control: "text",
      description:
        "Ordinary Tailwind classes merged after the neutral right-side defaults.",
    },
  },
};

export default meta;

export const Playground = {
  parameters: { controls: { include: ["dismissible", "class"] } },
  render: (args) => ({
    components: { Button, Sheet },
    setup() {
      const open = ref(false);
      return { args, contract, open };
    },
    template: `
      <main class="klean-story-canvas grid min-h-136 place-items-center px-5 py-14 sm:px-10">
        <div class="max-w-md text-center">
          <p class="font-mono text-[11px] uppercase tracking-[0.2em] text-klean-muted">Sheet / playground</p>
          <h1 class="mt-3 text-3xl font-semibold tracking-[-0.04em]">One native surface. Any edge.</h1>
          <p class="mt-4 text-sm leading-6 text-klean-muted">The component owns no product anatomy. Put real headers, navigation, forms, and scroll regions inside it.</p>
          <Button class="mt-7" :commandfor="contract.sheetId" command="show-modal">
            {{ contract.sheetLabel }}
          </Button>
          <p class="mt-3 text-xs text-klean-muted" aria-live="polite">Sheet is {{ open ? 'open' : 'closed' }}</p>
        </div>

        <Sheet
          :id="contract.sheetId"
          v-model:open="open"
          :dismissible="args.dismissible"
          :class="args.class"
          aria-labelledby="playground-sheet-title"
          aria-describedby="playground-sheet-description"
        >
          <article class="grid h-full grid-rows-[auto_minmax(0,1fr)_auto]">
            <header class="flex items-start justify-between gap-4 border-b border-gray-200 px-5 py-5 dark:border-gray-800">
              <div>
                <p class="font-mono text-[11px] uppercase tracking-[0.18em] text-gray-500">Production</p>
                <h2 id="playground-sheet-title" class="mt-1 text-xl font-semibold tracking-tight">{{ contract.sheetTitle }}</h2>
              </div>
              <Button
                :commandfor="contract.sheetId"
                command="request-close"
                autofocus
                aria-label="Close project details"
                class="min-h-11 min-w-11 bg-transparent p-0 text-gray-600 hover:bg-gray-100 dark:bg-transparent dark:text-gray-300 dark:hover:bg-gray-800"
              ><span aria-hidden="true" class="text-xl leading-none">×</span></Button>
            </header>

            <div class="overflow-y-auto px-5 py-6">
              <p id="playground-sheet-description" class="text-sm leading-6 text-gray-600 dark:text-gray-300">Inspect the service without leaving the deployment list.</p>
              <dl class="mt-7 grid gap-5 text-sm">
                <div><dt class="text-gray-500">Region</dt><dd class="mt-1 font-medium">Frankfurt</dd></div>
                <div><dt class="text-gray-500">Branch</dt><dd class="mt-1 font-mono">main</dd></div>
                <div><dt class="text-gray-500">Runtime</dt><dd class="mt-1 font-medium">Node.js 24</dd></div>
              </dl>
            </div>

            <footer class="border-t border-gray-200 px-5 py-4 dark:border-gray-800">
              <form method="dialog">
                <Button type="submit" value="done" class="w-full">Done</Button>
              </form>
            </footer>
          </article>
        </Sheet>
      </main>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("button", {
      name: contract.sheetLabel,
    });
    const sheet = canvasElement.querySelector(`#${contract.sheetId}`);

    await userEvent.click(trigger);
    await expect(sheet).toHaveAttribute("open");
    await expect(sheet).toHaveAttribute("data-state", "open");
    await expect(
      canvas.getByRole("button", { name: "Close project details" }),
    ).toHaveFocus();
    await userEvent.click(
      canvas.getByRole("button", { name: "Close project details" }),
    );
    await expect(sheet).not.toHaveAttribute("open");
    await expect(trigger).toHaveFocus();
  },
};

export const Edges = {
  parameters: { controls: { disable: true } },
  render: () => ({
    components: { Button, Sheet },
    template: `
      <main class="klean-story-canvas min-h-152 px-5 py-12 sm:px-10">
        <header class="max-w-2xl">
          <p class="font-mono text-[11px] uppercase tracking-[0.2em] text-klean-muted">Sheet / placement</p>
          <h1 class="mt-3 text-3xl font-semibold tracking-[-0.04em]">Placement is Tailwind, not component configuration.</h1>
          <p class="mt-4 text-sm leading-6 text-klean-muted">The default arrives from the right. A few ordinary layout and transform classes make the same semantic component a left drawer or bottom sheet.</p>
        </header>

        <div class="mt-9 flex flex-wrap gap-3">
          <Button commandfor="right-sheet" command="show-modal">Right inspector</Button>
          <Button commandfor="left-sheet" command="show-modal" class="bg-white text-gray-950 ring-1 ring-inset ring-gray-300 hover:bg-gray-100 dark:bg-gray-800 dark:text-white dark:ring-gray-700 dark:hover:bg-gray-700">Left navigation</Button>
          <Button commandfor="bottom-sheet" command="show-modal" class="bg-white text-gray-950 ring-1 ring-inset ring-gray-300 hover:bg-gray-100 dark:bg-gray-800 dark:text-white dark:ring-gray-700 dark:hover:bg-gray-700">Bottom comments</Button>
        </div>

        <Sheet id="right-sheet" aria-labelledby="right-sheet-title">
          <header class="flex items-center justify-between px-5 py-5">
            <h2 id="right-sheet-title" class="text-lg font-semibold">Right inspector</h2>
            <Button commandfor="right-sheet" command="request-close" autofocus aria-label="Close right inspector" class="min-h-11 min-w-11 bg-transparent p-0 text-gray-600 hover:bg-gray-100"><span aria-hidden="true" class="text-xl leading-none">×</span></Button>
          </header>
          <div class="px-5 py-2 text-sm leading-6 text-gray-600">The useful neutral default for settings, details, and inspectors.</div>
        </Sheet>

        <Sheet
          id="left-sheet"
          aria-labelledby="left-sheet-title"
          class="right-auto left-0 mr-auto ml-0 -translate-x-full border-r border-l-0 open:translate-x-0 starting:open:-translate-x-full"
        >
          <header class="flex items-center justify-between px-5 py-5">
            <h2 id="left-sheet-title" class="text-lg font-semibold">Left navigation</h2>
            <Button commandfor="left-sheet" command="request-close" autofocus aria-label="Close left navigation" class="min-h-11 min-w-11 bg-transparent p-0 text-gray-600 hover:bg-gray-100"><span aria-hidden="true" class="text-xl leading-none">×</span></Button>
          </header>
          <nav aria-label="Project" class="px-3 py-2">
            <ul class="grid gap-1 text-sm">
              <li><a href="#overview" class="block min-h-11 rounded-md px-3 py-3 font-medium no-underline hover:bg-gray-100">Overview</a></li>
              <li><a href="#deployments" class="block min-h-11 rounded-md px-3 py-3 no-underline hover:bg-gray-100">Deployments</a></li>
              <li><a href="#settings" class="block min-h-11 rounded-md px-3 py-3 no-underline hover:bg-gray-100">Settings</a></li>
            </ul>
          </nav>
        </Sheet>

        <Sheet
          id="bottom-sheet"
          aria-labelledby="bottom-sheet-title"
          class="inset-x-0 top-auto bottom-0 m-0 mt-auto h-auto max-h-[min(70dvh,44rem)] w-full max-w-none translate-x-0 translate-y-full rounded-t-2xl border-x-0 border-b-0 border-t open:translate-y-0 starting:open:translate-x-0 starting:open:translate-y-full"
        >
          <div class="mx-auto mt-3 h-1 w-10 rounded-full bg-gray-300 dark:bg-gray-700" aria-hidden="true"></div>
          <header class="flex items-center justify-between px-5 py-4">
            <h2 id="bottom-sheet-title" class="text-lg font-semibold">Comments</h2>
            <Button commandfor="bottom-sheet" command="request-close" autofocus aria-label="Close comments" class="min-h-11 min-w-11 bg-transparent p-0 text-gray-600 hover:bg-gray-100"><span aria-hidden="true" class="text-xl leading-none">×</span></Button>
          </header>
          <div class="max-h-[50dvh] overflow-y-auto px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] text-sm leading-6 text-gray-600">
            A bottom sheet keeps the discussion reachable on narrow screens while preserving the document behind it.
          </div>
        </Sheet>
      </main>
    `,
  }),
};

export const Apps = {
  name: "App recipes",
  parameters: { controls: { disable: true } },
  render: () => ({
    components: { Button, Sheet },
    template: `
      <main class="klean-story-canvas min-h-168 px-5 py-12 sm:px-10">
        <header class="max-w-2xl">
          <p class="font-mono text-[11px] uppercase tracking-[0.2em] text-klean-muted">Sheet / real applications</p>
          <h1 class="mt-3 text-3xl font-semibold tracking-[-0.04em]">Slipway navigation. Hagfish comments. Bearing feedback.</h1>
          <p class="mt-4 text-sm leading-6 text-klean-muted">One native contract keeps the three product treatments recognizable without baking any of them into Klean UI.</p>
        </header>

        <div class="mt-10 grid max-w-5xl gap-6 md:grid-cols-3">
          <article class="rounded-xl bg-gray-950 p-6 text-white shadow-sm">
            <p class="font-mono text-[11px] uppercase tracking-[0.18em] text-gray-400">Slipway</p>
            <h2 class="mt-3 text-lg font-semibold">Mobile navigation</h2>
            <p class="mt-2 min-h-12 text-sm leading-6 text-gray-400">Team switcher and primary project routes from the left edge.</p>
            <Button commandfor="slipway-sheet" command="show-modal" class="mt-6 bg-white text-gray-950 hover:bg-gray-200">Open navigation</Button>
          </article>

          <article class="rounded-none border-2 border-gray-950 bg-[#f7f3eb] p-6 text-gray-950 shadow-[5px_5px_0_#111]">
            <p class="font-mono text-[11px] uppercase tracking-[0.18em] text-gray-600">Hagfish</p>
            <h2 class="mt-3 text-lg font-semibold">Invoice comments</h2>
            <p class="mt-2 min-h-12 text-sm leading-6 text-gray-600">A compact thread slides up without replacing the invoice.</p>
            <Button commandfor="hagfish-sheet" command="show-modal" class="mt-6 rounded-none border-2 border-gray-950 bg-gray-950 text-white hover:bg-white hover:text-gray-950">Open comments</Button>
          </article>

          <article class="rounded-2xl border border-gray-200 bg-white p-6 shadow-lg">
            <p class="font-mono text-[11px] uppercase tracking-[0.18em] text-gray-500">Bearing</p>
            <h2 class="mt-3 text-lg font-semibold">Feedback panel</h2>
            <p class="mt-2 min-h-12 text-sm leading-6 text-gray-600">A full-height mobile sheet and contained desktop panel.</p>
            <Button commandfor="bearing-sheet" command="show-modal" class="mt-6">Send feedback</Button>
          </article>
        </div>

        <Sheet id="slipway-sheet" aria-labelledby="slipway-sheet-title" class="right-auto left-0 mr-auto ml-0 w-72 -translate-x-full border-r border-l-0 bg-gray-50 open:translate-x-0 starting:open:-translate-x-full dark:bg-gray-950">
          <header class="flex min-h-16 items-center justify-between px-4">
            <h2 id="slipway-sheet-title" class="text-sm font-semibold">Slipway team</h2>
            <Button commandfor="slipway-sheet" command="request-close" autofocus aria-label="Close Slipway navigation" class="min-h-11 min-w-11 bg-transparent p-0 text-gray-600 hover:bg-gray-200 dark:bg-transparent dark:text-gray-300 dark:hover:bg-gray-800"><span aria-hidden="true" class="text-xl leading-none">×</span></Button>
          </header>
          <nav aria-label="Slipway" class="px-3 py-2">
            <ul class="grid gap-1 text-sm">
              <li><a href="#projects" aria-current="page" class="block min-h-11 rounded-md bg-gray-200 px-3 py-3 font-medium no-underline dark:bg-gray-800">Projects</a></li>
              <li><a href="#lookout" class="block min-h-11 rounded-md px-3 py-3 no-underline hover:bg-gray-200 dark:hover:bg-gray-800">Lookout</a></li>
              <li><a href="#settings" class="block min-h-11 rounded-md px-3 py-3 no-underline hover:bg-gray-200 dark:hover:bg-gray-800">Settings</a></li>
            </ul>
          </nav>
        </Sheet>

        <Sheet id="hagfish-sheet" aria-labelledby="hagfish-sheet-title" class="inset-x-0 top-auto bottom-0 m-0 mt-auto h-auto max-h-[70dvh] w-full max-w-none translate-x-0 translate-y-full rounded-t-2xl border-x-2 border-t-2 border-b-0 border-gray-950 bg-white shadow-[0_-4px_20px_rgba(0,0,0,0.1)] open:translate-y-0 starting:open:translate-x-0 starting:open:translate-y-full dark:border-white dark:bg-gray-950">
          <div class="mx-auto mt-3 h-1 w-10 rounded-full bg-black/20 dark:bg-white/20" aria-hidden="true"></div>
          <header class="flex items-center justify-between px-4 py-3">
            <h2 id="hagfish-sheet-title" class="text-sm font-bold">Comments <span class="ml-1 rounded-full bg-black/10 px-2 py-1 text-xs">3</span></h2>
            <Button commandfor="hagfish-sheet" command="request-close" autofocus aria-label="Close invoice comments" class="min-h-11 min-w-11 rounded-lg bg-transparent p-0 text-black/50 hover:bg-black/5 dark:bg-transparent dark:text-white/50 dark:hover:bg-white/5"><span aria-hidden="true" class="text-xl leading-none">×</span></Button>
          </header>
          <div class="max-h-[50dvh] overflow-y-auto px-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
            <article v-for="name in ['Ada', 'Kelvin', 'Grace']" :key="name" class="border-t border-black/10 py-4 text-sm dark:border-white/10"><strong>{{ name }}</strong><p class="mt-1 text-black/60 dark:text-white/60">This invoice is ready for review.</p></article>
          </div>
        </Sheet>

        <Sheet id="bearing-sheet" aria-labelledby="bearing-sheet-title" class="inset-x-0 top-auto bottom-0 m-0 mt-auto h-[min(46rem,calc(100dvh-1rem))] w-full max-w-none translate-x-0 translate-y-full rounded-t-2xl border open:translate-y-0 starting:open:translate-x-0 starting:open:translate-y-full sm:inset-y-4 sm:right-4 sm:left-auto sm:top-4 sm:bottom-4 sm:ml-auto sm:h-auto sm:w-[min(26rem,calc(100vw-2rem))] sm:translate-x-full sm:translate-y-0 sm:rounded-2xl sm:open:translate-x-0 sm:starting:open:translate-x-full sm:starting:open:translate-y-0">
          <div class="grid h-full grid-rows-[auto_minmax(0,1fr)_auto]">
            <header class="flex min-h-14 items-center justify-between border-b border-gray-200 px-4 dark:border-gray-800">
              <h2 id="bearing-sheet-title" class="font-semibold">Feedback</h2>
              <Button commandfor="bearing-sheet" command="request-close" autofocus aria-label="Close feedback" class="min-h-11 min-w-11 bg-transparent p-0 text-gray-600 hover:bg-gray-100"><span aria-hidden="true" class="text-xl leading-none">×</span></Button>
            </header>
            <div class="overflow-y-auto p-5 text-sm leading-6 text-gray-600">Tell us what happened and include the page context without leaving your work.</div>
            <footer class="border-t border-gray-200 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] text-center text-xs text-gray-500 dark:border-gray-800">Powered by Slipway Bearing</footer>
          </div>
        </Sheet>
      </main>
    `,
  }),
};
