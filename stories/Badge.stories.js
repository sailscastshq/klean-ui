import { expect, fn, userEvent, within } from "storybook/test";
import Badge from "../src/vue/badge/Badge.vue";
import Button from "../src/vue/button/Button.vue";

const meta = {
  title: "Components/Badge",
  component: Badge,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "One static span for compact metadata. The application supplies meaning and ordinary Tailwind; buttons and links remain the interactive owners.",
      },
    },
  },
  args: {
    label: "Paid",
    class: "",
  },
  argTypes: {
    label: { control: "text" },
    class: { control: "text" },
  },
};

export default meta;

export const Playground = {
  parameters: { controls: { include: ["label", "class"] } },
  render: (args) => ({
    components: { Badge },
    setup() {
      return { args };
    },
    template: `<Badge :class="args.class">{{ args.label }}</Badge>`,
  }),
  play: async ({ canvasElement, args }) => {
    const badge = canvasElement.querySelector('[data-slot="badge"]');

    await expect(badge.tagName).toBe("SPAN");
    await expect(badge).toHaveTextContent(args.label);
    await expect(badge).not.toHaveAttribute("role");
    await expect(badge).not.toHaveAttribute("aria-live");
    await expect(badge).not.toHaveAttribute("tabindex");
  },
};

export const Semantics = {
  parameters: { layout: "fullscreen", controls: { disable: true } },
  args: { onNotifications: fn(), onDeployment: fn() },
  render: (args) => ({
    components: { Badge, Button },
    setup() {
      return { args };
    },
    data() {
      return { deployment: "Deploying" };
    },
    methods: {
      finishDeployment() {
        this.deployment = "Deployment complete";
        args.onDeployment();
      },
    },
    template: `
      <section class="klean-story-canvas px-5 py-14 sm:px-8 lg:px-12 lg:py-20" aria-labelledby="badge-semantics-title">
        <header class="max-w-3xl">
          <p class="font-mono text-[11px] uppercase tracking-[0.2em] text-klean-muted">Static by design</p>
          <h1 id="badge-semantics-title" class="mt-3 text-balance text-4xl font-semibold tracking-tighter sm:text-5xl">Small metadata. Honest semantics.</h1>
          <p class="mt-5 max-w-2xl text-pretty text-base leading-7 text-klean-muted">Badge never becomes a control. Give terse text more context, let the parent control own notifications, and opt into live semantics only when a changing message truly needs announcement.</p>
        </header>

        <div class="mt-12 grid max-w-6xl gap-6 md:grid-cols-3">
          <article class="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-950">
            <p class="text-sm font-medium">Visible status</p>
            <Badge class="mt-4 bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200">
              <span aria-hidden="true" class="size-1.5 rounded-full bg-emerald-500"></span>
              Healthy
            </Badge>
          </article>

          <article class="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-950">
            <p class="text-sm font-medium">Context inside the label</p>
            <p class="mt-4">Inbox <Badge>3 <span class="sr-only">unread messages</span></Badge></p>
          </article>

          <article class="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-950">
            <p class="text-sm font-medium">The button owns the notification</p>
            <Button type="button" aria-label="Notifications, 3 unread" class="relative mt-4 size-11 min-h-0 min-w-0 rounded-full p-0" @click="args.onNotifications">
              <svg aria-hidden="true" class="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"/><path d="M10 21h4"/></svg>
              <Badge aria-hidden="true" class="absolute -right-1 -top-1 min-w-5 justify-center border-white bg-red-600 px-1 text-[10px] text-white dark:border-gray-950 dark:bg-red-500">3</Badge>
            </Button>
          </article>
        </div>

        <article class="mt-6 max-w-6xl rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-950">
          <div class="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p class="text-sm font-medium">Deliberate live status</p>
              <p class="mt-1 text-sm text-klean-muted">The same mounted badge changes text, so assistive technology can announce the update.</p>
            </div>
            <div class="flex items-center gap-3">
              <Badge role="status" aria-live="polite" aria-atomic="true">{{ deployment }}</Badge>
              <Button type="button" class="min-h-9 min-w-0 px-3 py-1.5 text-sm" @click="finishDeployment">Finish deployment</Button>
            </div>
          </div>
        </article>
      </section>
    `,
  }),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const notifications = canvas.getByRole("button", {
      name: "Notifications, 3 unread",
    });
    const notificationBadge = notifications.querySelector(
      '[data-slot="badge"]',
    );

    await expect(notificationBadge).toHaveAttribute("aria-hidden", "true");
    await userEvent.click(notifications);
    await expect(args.onNotifications).toHaveBeenCalledOnce();

    const status = canvas.getByRole("status");
    await expect(status).toHaveTextContent("Deploying");
    await userEvent.click(
      canvas.getByRole("button", { name: "Finish deployment" }),
    );
    await expect(status).toHaveTextContent("Deployment complete");
    await expect(args.onDeployment).toHaveBeenCalledOnce();
  },
};

export const Apps = {
  parameters: { layout: "fullscreen", controls: { disable: true } },
  render: () => ({
    components: { Badge, Button },
    setup() {
      const invoiceStatuses = {
        draft: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
        sent: "bg-blue-50 text-blue-800 dark:bg-blue-950 dark:text-blue-200",
        paid: "bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200",
      };
      return { invoiceStatuses };
    },
    template: `
      <section class="klean-story-canvas px-5 py-14 sm:px-8 lg:px-12 lg:py-20" aria-labelledby="badge-apps-title">
        <header class="max-w-3xl">
          <p class="font-mono text-[11px] uppercase tracking-[0.2em] text-klean-muted">Application recipes</p>
          <h1 id="badge-apps-title" class="mt-3 text-balance text-4xl font-semibold tracking-tighter sm:text-5xl">One seam. Both product voices.</h1>
          <p class="mt-5 max-w-2xl text-pretty text-base leading-7 text-klean-muted">Hagfish keeps strong invoice labels. Slipway stays compact and operational. Their visual meaning is visible where each app owns it.</p>
        </header>

        <div class="mt-12 grid max-w-7xl gap-10 xl:grid-cols-2">
          <article class="space-y-4">
            <p class="font-mono text-[11px] uppercase tracking-[0.18em] text-gray-500">Hagfish / invoices</p>
            <div class="border-2 border-black bg-white p-6 shadow-[6px_6px_0_0_#000] dark:border-white dark:bg-gray-950 dark:shadow-[6px_6px_0_0_#fff]">
              <div class="flex items-center justify-between gap-4">
                <div><h2 class="font-semibold">August invoices</h2><p class="mt-1 text-sm text-gray-600 dark:text-gray-300">Three customer records</p></div>
                <Badge class="rounded-none border-2 border-black bg-black px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-white dark:border-white dark:bg-white dark:text-black">3 invoices</Badge>
              </div>
              <ul class="mt-6 divide-y divide-gray-200 dark:divide-gray-800">
                <li v-for="status in ['draft', 'sent', 'paid']" :key="status" class="flex items-center justify-between gap-4 py-3">
                  <span class="text-sm font-medium">INV-104{{ status === 'draft' ? '4' : status === 'sent' ? '3' : '2' }}</span>
                  <Badge :class="invoiceStatuses[status]">{{ status }}</Badge>
                </li>
              </ul>
            </div>
          </article>

          <article class="space-y-4">
            <p class="font-mono text-[11px] uppercase tracking-[0.18em] text-gray-500">Slipway / services</p>
            <div class="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-950">
              <div class="flex items-center justify-between gap-4">
                <div><h2 class="text-sm font-medium">api</h2><p class="mt-1 text-xs text-gray-500 dark:text-gray-400">Production · Lagos</p></div>
                <Badge class="bg-emerald-50 px-3 py-1 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"><span aria-hidden="true" class="size-1.5 rounded-full bg-emerald-500"></span>Healthy</Badge>
              </div>
              <Button type="button" class="mt-6 flex w-full justify-between bg-white px-3 text-gray-950 hover:bg-gray-50 dark:bg-gray-950 dark:text-white dark:hover:bg-gray-900">
                <span>Deployment logs</span>
                <Badge class="bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400">12 <span class="sr-only">log entries</span></Badge>
              </Button>
            </div>
          </article>
        </div>
      </section>
    `,
  }),
};
