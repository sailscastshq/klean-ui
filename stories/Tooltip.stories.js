import { expect, userEvent, waitFor, within } from "storybook/test";
import Button from "../src/vue/button/Button.vue";
import Tooltip from "../src/vue/tooltip/Tooltip.vue";

const meta = {
  title: "Components/Tooltip",
  component: Tooltip,
  parameters: { layout: "centered" },
  args: {
    text: "Re-run query",
    placement: "top",
    class: "",
  },
  argTypes: {
    text: {
      control: "text",
      description: "Short supplementary text.",
    },
    placement: {
      control: "select",
      options: ["top", "right", "bottom", "left"],
      description: "Preferred side; collisions may flip it.",
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
    controls: { include: ["text", "placement", "class"] },
  },
  render: (args) => ({
    components: { Button, Tooltip },
    setup() {
      return { args };
    },
    template: `
      <Tooltip :text="args.text" :placement="args.placement" :class="args.class">
        <Button type="button" aria-label="Re-run query" class="size-10 min-h-0 p-0">
          <svg viewBox="0 0 24 24" class="size-4" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
            <path d="M20 11a8 8 0 1 0-2.34 5.66M20 4v7h-7" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </Button>
      </Tooltip>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("button", { name: "Re-run query" });

    trigger.focus();
    await waitFor(
      () => {
        const id = trigger.getAttribute("aria-describedby");
        const tooltip = canvasElement.ownerDocument.getElementById(id);
        expect(tooltip).toHaveAttribute("role", "tooltip");
        expect(tooltip).toHaveAttribute("data-state", "open");
      },
      { timeout: 1000 },
    );

    await userEvent.keyboard("{Escape}");
    const tooltip = canvasElement.ownerDocument.getElementById(
      trigger.getAttribute("aria-describedby"),
    );
    await expect(tooltip).toHaveAttribute("data-state", "closed");
    await expect(trigger).toHaveFocus();
  },
};

export const Sides = {
  parameters: { layout: "fullscreen", controls: { disable: true } },
  render: () => ({
    components: { Tooltip },
    data: () => ({ sides: ["top", "right", "bottom", "left"] }),
    template: `
      <section class="klean-story-canvas grid min-h-136 place-items-center px-8 py-16" aria-label="Tooltip placement">
        <div class="grid grid-cols-2 gap-24">
          <Tooltip v-for="side in sides" :key="side" :text="side[0].toUpperCase() + side.slice(1)" :placement="side">
            <button type="button" :aria-label="side + ' tooltip'" class="grid size-12 place-items-center rounded-full border border-gray-300 bg-white text-sm font-semibold uppercase text-gray-950 shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 dark:border-gray-700 dark:bg-gray-950 dark:text-white">
              {{ side[0] }}
            </button>
          </Tooltip>
        </div>
      </section>
    `,
  }),
};

export const Boundaries = {
  parameters: { layout: "fullscreen", controls: { disable: true } },
  render: () => ({
    components: { Tooltip },
    template: `
      <section class="klean-story-canvas grid min-h-136 grid-cols-2 grid-rows-2 p-3" aria-label="Tooltip collision handling">
        <Tooltip text="A longer tooltip that stays inside the viewport" placement="top" class="max-w-56 whitespace-normal leading-5">
          <button type="button" class="self-start justify-self-start rounded-md border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-950">Top left</button>
        </Tooltip>
        <Tooltip text="Shifted away from the right edge" placement="right">
          <button type="button" class="self-start justify-self-end rounded-md border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-950">Top right</button>
        </Tooltip>
        <Tooltip text="Shifted away from the left edge" placement="left">
          <button type="button" class="self-end justify-self-start rounded-md border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-950">Bottom left</button>
        </Tooltip>
        <Tooltip text="Flipped above when there is no room below" placement="bottom">
          <button type="button" class="self-end justify-self-end rounded-md border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-950">Bottom right</button>
        </Tooltip>
      </section>
    `,
  }),
};

export const Products = {
  parameters: { layout: "fullscreen", controls: { disable: true } },
  render: () => ({
    components: { Tooltip },
    template: `
      <section class="grid min-h-136 lg:grid-cols-2" aria-label="Application tooltip recipes">
        <article class="flex items-center justify-center bg-gray-950 p-8 text-white">
          <div>
            <p class="font-mono text-[11px] uppercase tracking-[0.18em] text-gray-500">Slipway / query toolbar</p>
            <div class="mt-6 flex items-center gap-1 rounded-lg border border-gray-800 bg-gray-900 p-1.5 shadow-xl">
              <Tooltip text="Table view" placement="bottom" class="border-gray-700 bg-gray-800 text-gray-100">
                <button type="button" aria-label="Table view" class="grid size-9 place-items-center rounded-md bg-white/10 text-white hover:bg-white/15 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">
                  <svg viewBox="0 0 24 24" class="size-4" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="M4 5h16v14H4zM4 10h16M9 5v14" /></svg>
                </button>
              </Tooltip>
              <Tooltip text="JSON view" placement="bottom" class="border-gray-700 bg-gray-800 text-gray-100">
                <button type="button" aria-label="JSON view" class="grid size-9 place-items-center rounded-md text-gray-300 hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">
                  <span aria-hidden="true" class="font-mono text-sm">{ }</span>
                </button>
              </Tooltip>
              <span aria-hidden="true" class="mx-1 h-5 w-px bg-gray-700"></span>
              <Tooltip text="Re-run query" placement="bottom" class="border-gray-700 bg-gray-800 text-gray-100">
                <button type="button" aria-label="Re-run query" class="grid size-9 place-items-center rounded-md text-gray-300 hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">
                  <svg viewBox="0 0 24 24" class="size-4" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="M20 11a8 8 0 1 0-2.34 5.66M20 4v7h-7" stroke-linecap="round" stroke-linejoin="round" /></svg>
                </button>
              </Tooltip>
            </div>
          </div>
        </article>

        <article class="flex items-center justify-center bg-[#f4f0e8] p-8 text-black">
          <div>
            <p class="font-mono text-[11px] uppercase tracking-[0.18em] text-black/50">Hagfish / invoice action</p>
            <Tooltip text="Copy public invoice link" placement="bottom" class="rounded-none border-2 border-black bg-[#f4f0e8] px-3 py-2 font-mono text-[11px] uppercase tracking-[0.12em] text-black shadow-[3px_3px_0_0_#000] **:data-[slot=tooltip-arrow]:hidden">
              <button type="button" aria-label="Copy public invoice link" class="mt-6 grid size-12 place-items-center border-2 border-black bg-black text-white shadow-[3px_3px_0_0_#9ca3af] transition-colors hover:bg-white hover:text-black focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-black">
                <svg viewBox="0 0 24 24" class="size-5" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M8 8V6a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2M6 8h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2Z" /></svg>
              </button>
            </Tooltip>
          </div>
        </article>
      </section>
    `,
  }),
};
