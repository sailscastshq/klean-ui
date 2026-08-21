import { expect, userEvent, within } from "storybook/test";
import Button from "../src/vue/button/Button.vue";
import Menu from "../src/vue/menu/Menu.vue";

const BoringStackLink = {
  name: "BoringStackLink",
  inheritAttrs: false,
  template: '<a v-bind="$attrs" data-boring-stack-link=""><slot /></a>',
};

const itemClass = [
  "flex w-full cursor-pointer items-center gap-3 rounded px-3 py-2 text-left text-sm text-gray-700 no-underline outline-none",
  "hover:bg-gray-100 focus:bg-gray-100 focus:text-gray-950",
  "disabled:cursor-not-allowed disabled:opacity-40",
  "aria-disabled:cursor-not-allowed aria-disabled:opacity-40",
  "dark:text-gray-200 dark:hover:bg-white/10 dark:focus:bg-white/10 dark:focus:text-white",
].join(" ");

const dangerClass = [
  itemClass,
  "text-red-700 hover:bg-red-50 focus:bg-red-50 focus:text-red-800",
  "dark:text-red-400 dark:hover:bg-red-500/10 dark:focus:bg-red-500/10 dark:focus:text-red-300",
].join(" ");

const meta = {
  title: "Components/Menu",
  component: Menu,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A native-Popover menu that gives real buttons and anchors roving focus, keyboard navigation, typeahead, durable dismissal, and no visual variants.",
      },
    },
  },
  args: {
    label: "Actions",
    placement: "bottom-start",
    offset: 8,
    disabled: false,
    class: "w-56",
  },
  argTypes: {
    label: {
      control: "text",
      description: "Visible label supplied by this story's real Button.",
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
      description: "Preferred logical placement inherited from Popover.",
    },
    offset: {
      control: { type: "number", min: 0, max: 32, step: 1 },
      description: "Space in pixels between the invoker and menu.",
    },
    disabled: {
      control: "boolean",
      description: "Native state on the story's Button, not a Menu prop.",
    },
    class: {
      control: "text",
      description: "Ordinary Tailwind classes for the menu surface.",
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
    components: { Button, Menu },
    setup() {
      return { args, dangerClass, itemClass };
    },
    template: `
      <div>
        <Button popovertarget="project-actions" :disabled="args.disabled">
          {{ args.label }}
          <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <path d="m7 10 5 5 5-5" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </Button>

        <Menu id="project-actions" aria-label="Project actions" :placement="args.placement" :offset="args.offset" :class="args.class">
          <button type="button" :class="itemClass">Edit project</button>
          <a href="#menu-docs" :class="itemClass">View deployments</a>
          <button type="button" disabled :class="itemClass">Archive project</button>
          <button type="button" :class="dangerClass">Delete project</button>
        </Menu>
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("button", { name: "Actions" });

    await userEvent.click(trigger);
    await expect(
      canvas.getByRole("menuitem", { name: "Edit project" }),
    ).toHaveFocus();
    await userEvent.keyboard("{ArrowDown}");
    await expect(
      canvas.getByRole("menuitem", { name: "View deployments" }),
    ).toHaveFocus();
    await userEvent.keyboard("d");
    await expect(
      canvas.getByRole("menuitem", { name: "Delete project" }),
    ).toHaveFocus();
    await userEvent.keyboard("{Escape}");
    await expect(trigger).toHaveFocus();
  },
};

export const Semantics = {
  parameters: { controls: { disable: true } },
  render: () => ({
    components: { BoringStackLink, Button, Menu },
    setup() {
      return { dangerClass, itemClass };
    },
    template: `
      <section id="menu-semantics" class="w-[min(42rem,calc(100vw-2rem))] bg-white p-6 sm:p-10" aria-labelledby="menu-semantics-title">
        <h2 id="menu-semantics-title" class="text-2xl font-semibold tracking-[-0.03em]">One menu, three honest destinations</h2>
        <p class="mt-3 max-w-xl text-sm leading-6 text-klean-muted">Menu adds the composite keyboard contract. Each child remains the element its job requires.</p>

        <div class="mt-8">
          <Button popovertarget="semantic-actions">Open project menu</Button>
          <Menu id="semantic-actions" aria-label="Project actions" class="w-72">
            <button type="button" :class="itemClass">Restart service</button>
            <a href="https://sailscasts.com" :class="itemClass">Open public site</a>
            <BoringStackLink href="#menu-semantics" :class="itemClass">View settings with Inertia</BoringStackLink>
            <button type="button" :class="dangerClass">Delete service</button>
          </Menu>
          <button type="button" class="ml-3 min-h-11 cursor-pointer rounded-md border border-gray-300 px-4 text-sm font-medium hover:bg-gray-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-950">
            After menu
          </button>
        </div>
      </section>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("button", { name: "Open project menu" });
    const afterMenu = canvas.getByRole("button", { name: "After menu" });

    await userEvent.click(trigger);
    await expect(
      canvas.getByRole("menuitem", { name: "Restart service" }),
    ).toHaveFocus();
    await userEvent.tab();
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
    await expect(afterMenu).toHaveFocus();
  },
};

export const States = {
  parameters: { layout: "fullscreen", controls: { disable: true } },
  render: () => ({
    components: { Button, Menu },
    setup() {
      return { itemClass };
    },
    template: `
      <section class="klean-story-canvas px-5 py-12 sm:px-10" aria-labelledby="menu-states-title">
        <header class="max-w-2xl">
          <h1 id="menu-states-title" class="text-3xl font-semibold tracking-[-0.04em]">Content stays application-shaped.</h1>
          <p class="mt-4 text-sm leading-6 text-klean-muted">Disabled actions, long labels, icons, and compact targets need no Menu prop.</p>
        </header>

        <div class="mt-10 flex flex-wrap items-start gap-6">
          <div>
            <Button popovertarget="long-menu">Long labels</Button>
            <Menu id="long-menu" aria-label="Release actions" default-open class="w-[min(22rem,calc(100vw-2rem))]">
              <button type="button" :class="itemClass">Deploy the selected release to production</button>
              <button type="button" disabled :class="itemClass">Rollback is unavailable during provisioning</button>
              <a href="#menu-states-title" :class="itemClass">Read the release deployment history</a>
            </Menu>
          </div>
        </div>
      </section>
    `,
  }),
};

export const Products = {
  parameters: { layout: "fullscreen", controls: { disable: true } },
  render: () => ({
    components: { Button, Menu },
    template: `
      <div class="grid min-h-152 bg-gray-100 sm:grid-cols-2">
        <section class="flex items-start justify-center bg-[#f4f0e8] p-8 sm:p-14" aria-labelledby="hagfish-menu-title">
          <div>
            <Button popovertarget="hagfish-actions" class="rounded-none border-2 border-black bg-black text-white hover:bg-white hover:text-black dark:border-black dark:bg-black dark:text-white">Invoice actions</Button>
            <Menu id="hagfish-actions" aria-labelledby="hagfish-menu-title" class="w-64 rounded-none border-2 border-black p-2 shadow-[6px_6px_0_0_#000]">
              <p id="hagfish-menu-title" class="px-3 pb-2 pt-1 text-sm font-semibold text-gray-700">Invoice actions</p>
              <a href="#menu-docs" class="flex w-full border-2 border-transparent px-3 py-2 text-sm font-medium text-black no-underline outline-none hover:border-black focus:border-black">Preview invoice</a>
              <button type="button" class="flex w-full cursor-pointer border-2 border-transparent px-3 py-2 text-left text-sm font-medium text-black outline-none hover:border-black focus:border-black">Duplicate invoice</button>
              <button type="button" class="flex w-full cursor-pointer border-2 border-transparent px-3 py-2 text-left text-sm font-medium text-red-700 outline-none hover:border-red-700 focus:border-red-700">Void invoice</button>
            </Menu>
          </div>
        </section>

        <section class="dark flex items-start justify-center bg-gray-950 p-8 text-white sm:p-14" aria-labelledby="slipway-menu-title">
          <div>
            <Button popovertarget="slipway-actions" class="min-h-9 min-w-0 bg-gray-800 px-3 py-1.5 text-sm hover:bg-gray-700 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700">Actions</Button>
            <Menu id="slipway-actions" aria-labelledby="slipway-menu-title" class="w-52 border-gray-700 bg-gray-900 p-1 text-white shadow-xl">
              <p id="slipway-menu-title" class="px-2 py-1.5 text-xs font-medium text-gray-400">Deployment</p>
              <button type="button" class="flex w-full cursor-pointer rounded px-2 py-2 text-left text-sm text-gray-200 outline-none hover:bg-white/10 focus:bg-white/10">Redeploy</button>
              <a href="#menu-docs" class="flex w-full rounded px-2 py-2 text-sm text-gray-200 no-underline outline-none hover:bg-white/10 focus:bg-white/10">View logs</a>
              <button type="button" disabled class="flex w-full cursor-not-allowed rounded px-2 py-2 text-left text-sm text-gray-500 outline-none">Stop provisioning</button>
            </Menu>
          </div>
        </section>
      </div>
    `,
  }),
};
