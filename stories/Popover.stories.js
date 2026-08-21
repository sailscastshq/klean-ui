import { ref } from "vue";
import Button from "../src/vue/button/Button.vue";
import Popover from "../src/vue/popover/Popover.vue";

const meta = {
  title: "Components/Popover",
  component: Popover,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A native-first non-modal floating surface. Connect any real button with the standard popovertarget attribute; ordinary classes style both components independently.",
      },
    },
  },
  args: {
    label: "Filters",
    placement: "bottom-start",
    offset: 8,
    disabled: false,
    class: "w-72",
  },
  argTypes: {
    label: {
      control: "text",
      description: "Visible label supplied by this story's Button.",
    },
    placement: {
      control: "select",
      options: [
        "top",
        "top-start",
        "top-end",
        "right",
        "right-start",
        "right-end",
        "bottom",
        "bottom-start",
        "bottom-end",
        "left",
        "left-start",
        "left-end",
      ],
      description:
        "Preferred logical placement. Popover flips or shifts to stay visible.",
    },
    offset: {
      control: { type: "number", min: 0, max: 32, step: 1 },
      description: "Space in pixels between invoker and surface.",
    },
    disabled: {
      control: "boolean",
      description: "Native state on the story's Button, not a Popover prop.",
    },
    class: {
      control: "text",
      description: "Ordinary Tailwind classes for the floating surface.",
    },
  },
};

export default meta;

export const Playground = {
  parameters: {
    controls: {
      include: ["label", "placement", "offset", "disabled", "class"],
    },
  },
  render: (args) => ({
    components: { Button, Popover },
    setup() {
      return { args };
    },
    template: `
      <div>
        <Button popovertarget="filters-popover" :disabled="args.disabled">
          {{ args.label }}
          <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <path d="m7 10 5 5 5-5" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </Button>

        <Popover id="filters-popover" :placement="args.placement" :offset="args.offset" :class="args.class">
          <section aria-labelledby="filters-title">
            <h2 id="filters-title" class="font-semibold">Visible records</h2>
            <p class="mt-1 text-sm leading-6 text-gray-600 dark:text-gray-400">Choose which records appear in this view.</p>
            <label class="mt-4 flex items-center gap-3 text-sm">
              <input type="checkbox" checked class="size-4 accent-gray-950" />
              Active projects
            </label>
          </section>
        </Popover>
      </div>
    `,
  }),
};

export const NativeClose = {
  name: "Native close",
  parameters: { controls: { disable: true } },
  render: () => ({
    components: { Button, Popover },
    template: `
      <div>
        <Button popovertarget="profile-popover" class="bg-white text-gray-950 ring-1 ring-inset ring-gray-300 hover:bg-gray-100 dark:bg-white dark:text-gray-950">
          Account
        </Button>
        <Popover id="profile-popover" class="w-80">
          <section aria-labelledby="profile-title">
            <h2 id="profile-title" class="font-semibold">Kelvin Omereshone</h2>
            <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">kelvin@example.com</p>
            <Button popovertarget="profile-popover" popovertargetaction="hide" class="mt-5 w-full">
              Done
            </Button>
          </section>
        </Popover>
      </div>
    `,
  }),
};

export const ObservedState = {
  name: "Observed state",
  parameters: { controls: { disable: true } },
  render: () => ({
    components: { Button, Popover },
    setup() {
      const open = ref(false);
      return { open };
    },
    template: `
      <div class="grid justify-items-start gap-3">
        <p class="text-sm text-gray-600" aria-live="polite">Popover is {{ open ? 'open' : 'closed' }}</p>
        <Button popovertarget="observed-popover">Inspect state</Button>
        <Popover id="observed-popover" v-model:open="open" class="w-64">
          <p class="text-sm leading-6">Observe open state only when the application truly needs it. Klean never persists it.</p>
        </Popover>
      </div>
    `,
  }),
};

export const SourceAppRecipes = {
  name: "Products",
  parameters: { layout: "fullscreen", controls: { disable: true } },
  render: () => ({
    components: { Button, Popover },
    template: `
      <div class="grid min-h-152 bg-gray-100 p-6 sm:grid-cols-2 sm:p-12">
        <section class="flex items-start justify-center bg-white p-8 sm:p-14" aria-labelledby="hagfish-popover-title">
          <div>
            <h2 id="hagfish-popover-title" class="mb-5 text-base font-semibold text-black">Invoice editor</h2>
            <Button
              popovertarget="hagfish-share"
              class="rounded-lg border-2 border-black bg-black px-4 py-2 text-sm text-white hover:bg-white hover:text-black hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-1 active:translate-y-1 active:shadow-none"
            >
              Share
              <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
                <path d="m19.5 8.25-7.5 7.5-7.5-7.5" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </Button>
            <Popover
              id="hagfish-share"
              placement="bottom-end"
              class="w-72 origin-top-right overflow-hidden rounded-xl border-2 border-black bg-white p-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
            >
              <section class="flex flex-col gap-1" aria-label="Share invoice">
                <button type="button" aria-label="Send via email" class="group flex w-full cursor-pointer items-center gap-3 rounded-2xl px-3 py-2.5 text-left text-sm font-medium text-black transition-colors hover:bg-black/5">
                  <span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-black/5 text-black/70 transition-colors group-hover:bg-black/10">
                    <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
                      <path d="M3 8.25 10.94 13a2 2 0 0 0 2.12 0L21 8.25M5.25 19.5h13.5A2.25 2.25 0 0 0 21 17.25V6.75a2.25 2.25 0 0 0-2.25-2.25H5.25A2.25 2.25 0 0 0 3 6.75v10.5a2.25 2.25 0 0 0 2.25 2.25Z" stroke-linecap="round" stroke-linejoin="round" />
                    </svg>
                  </span>
                  <span class="min-w-0 flex-1 pr-2">Send via email</span>
                  <span class="ml-auto shrink-0 rounded-full border border-black/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-black/60">Email</span>
                </button>

                <button type="button" aria-label="Copy link" class="group flex w-full cursor-pointer items-center gap-3 rounded-2xl px-3 py-2.5 text-left text-sm font-medium text-black transition-colors hover:bg-black/5">
                  <span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-black/5 text-black/70 transition-colors group-hover:bg-black/10">
                    <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
                      <path d="M8.25 7.5V6A2.25 2.25 0 0 1 10.5 3.75h7.5A2.25 2.25 0 0 1 20.25 6v7.5A2.25 2.25 0 0 1 18 15.75h-1.5m-8.25-8.25h-1.5A2.25 2.25 0 0 0 4.5 9.75v7.5a2.25 2.25 0 0 0 2.25 2.25h7.5a2.25 2.25 0 0 0 2.25-2.25v-1.5m-8.25-8.25h6A2.25 2.25 0 0 1 16.5 9.75v6" stroke-linecap="round" stroke-linejoin="round" />
                    </svg>
                  </span>
                  <span class="min-w-0 flex-1 pr-2">Copy link</span>
                  <span class="ml-auto shrink-0 rounded-full border border-black/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-black/60">Link</span>
                </button>

                <button type="button" aria-label="Generate PDF" class="group flex w-full cursor-pointer items-center gap-3 rounded-2xl px-3 py-2.5 text-left text-sm font-medium text-black transition-colors hover:bg-black/5">
                  <span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-black text-white transition-colors group-hover:bg-black/85">
                    <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
                      <path d="M19.5 14.25v-2.625A3.375 3.375 0 0 0 16.125 8.25h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5A3.375 3.375 0 0 0 10.125 2.25H8.25m2.25 9h6m-6 3h3m-6.75 6.75h10.5A2.25 2.25 0 0 0 19.5 18.75v-7.125a9 9 0 0 0-9-9H6.75A2.25 2.25 0 0 0 4.5 4.875v13.5A2.25 2.25 0 0 0 6.75 20.625Z" stroke-linecap="round" stroke-linejoin="round" />
                    </svg>
                  </span>
                  <span class="min-w-0 flex-1 pr-2">Generate PDF</span>
                  <span class="ml-auto shrink-0 rounded-full border border-black/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-black/60">PDF</span>
                </button>
              </section>
            </Popover>
          </div>
        </section>

        <section class="dark flex items-start justify-center bg-gray-950 p-8 text-white sm:p-14" aria-labelledby="slipway-popover-title">
          <div>
            <Button popovertarget="slipway-filter" class="min-h-9 min-w-0 bg-gray-800 px-3 py-1.5 text-sm hover:bg-gray-700 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700">
              Environment
            </Button>
            <Popover id="slipway-filter" class="w-64 border-gray-700 bg-gray-900 p-3 text-white shadow-xl">
              <section aria-labelledby="slipway-popover-title">
                <h2 id="slipway-popover-title" class="px-2 py-1 text-sm font-semibold text-gray-300">Environment</h2>
                <label class="mt-2 flex items-center gap-3 rounded px-2 py-2 text-sm hover:bg-white/10">
                  <input type="checkbox" checked class="size-4" /> Production
                </label>
                <label class="flex items-center gap-3 rounded px-2 py-2 text-sm hover:bg-white/10">
                  <input type="checkbox" class="size-4" /> Staging
                </label>
              </section>
            </Popover>
          </div>
        </section>
      </div>
    `,
  }),
};
