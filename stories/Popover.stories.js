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
      <div class="grid min-h-[38rem] bg-gray-100 p-6 sm:grid-cols-2 sm:p-12">
        <section class="flex items-start justify-center bg-[#f4f0e8] p-8 sm:p-14" aria-labelledby="hagfish-popover-title">
          <div>
            <p class="mb-5 font-mono text-xs uppercase tracking-[0.18em] text-gray-600">Hagfish / share</p>
            <Button popovertarget="hagfish-share" class="border-2 border-black bg-black text-white hover:bg-white hover:text-black dark:border-black dark:bg-black dark:text-white">
              Share invoice
            </Button>
            <Popover id="hagfish-share" class="w-80 rounded-none border-2 border-black p-0 shadow-[6px_6px_0_0_#000]">
              <section class="p-5" aria-labelledby="hagfish-popover-title">
                <h2 id="hagfish-popover-title" class="font-semibold">Public invoice link</h2>
                <p class="mt-2 break-all font-mono text-xs text-gray-600">https://example.com/i/INV-1042</p>
                <Button class="mt-5 w-full rounded-none">Copy link</Button>
              </section>
            </Popover>
          </div>
        </section>

        <section class="dark flex items-start justify-center bg-gray-950 p-8 text-white sm:p-14" aria-labelledby="slipway-popover-title">
          <div>
            <p class="mb-5 font-mono text-xs uppercase tracking-[0.18em] text-gray-400">Slipway / filter</p>
            <Button popovertarget="slipway-filter" class="min-h-9 min-w-0 bg-gray-800 px-3 py-1.5 text-sm hover:bg-gray-700 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700">
              Environment
            </Button>
            <Popover id="slipway-filter" class="w-64 border-gray-700 bg-gray-900 p-3 text-white shadow-xl">
              <section aria-labelledby="slipway-popover-title">
                <h2 id="slipway-popover-title" class="px-2 py-1 text-xs font-medium uppercase tracking-wide text-gray-400">Environment</h2>
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
