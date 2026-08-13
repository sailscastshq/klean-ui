import { expect, fn, userEvent, within } from "storybook/test";
import Alert from "../src/vue/alert/Alert.vue";
import Button from "../src/vue/button/Button.vue";

const meta = {
  title: "Components/Alert",
  component: Alert,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A shallow notice surface. Klean supplies neutral Tailwind defaults; the application supplies native headings, copy, lists, actions, colors, and explicit live-region semantics only when the message lifecycle requires them.",
      },
    },
  },
  args: {
    as: "div",
    role: "",
    heading: "Changes are saved automatically",
    message: "You can leave this page and return whenever you are ready.",
    class: "",
  },
  argTypes: {
    as: {
      control: "select",
      options: ["div", "section", "aside"],
      description: "Native container chosen from the surrounding document structure.",
    },
    role: {
      control: "select",
      options: ["", "note", "status", "alert"],
      description:
        "Optional semantics chosen from the message lifecycle. Alert stays silent by default.",
    },
    heading: { control: "text" },
    message: { control: "text" },
    class: {
      control: "text",
      description: "Caller Tailwind classes merged after neutral defaults.",
    },
  },
};

export default meta;

export const Playground = {
  parameters: {
    controls: { include: ["as", "role", "heading", "message", "class"] },
  },
  render: (args) => ({
    components: { Alert },
    setup() {
      return { args };
    },
    template: `
      <Alert
        :as="args.as"
        :role="args.role || undefined"
        :class="['max-w-xl', args.class]"
      >
        <h2 class="font-medium">{{ args.heading }}</h2>
        <p class="mt-1 leading-6 text-gray-600 dark:text-gray-300">{{ args.message }}</p>
      </Alert>
    `,
  }),
  play: async ({ canvasElement, args }) => {
    const alert = canvasElement.querySelector('[data-slot="alert"]');

    await expect(alert).toHaveTextContent(args.heading);
    await expect(alert).toHaveTextContent(args.message);
    if (args.role) await expect(alert).toHaveAttribute("role", args.role);
    else await expect(alert).not.toHaveAttribute("role");
  },
};

export const Semantics = {
  parameters: { layout: "fullscreen", controls: { disable: true } },
  render: () => ({
    components: { Alert, Button },
    template: `
      <section class="klean-story-canvas px-5 py-14 sm:px-8 lg:px-12 lg:py-20" aria-labelledby="alert-semantics-title">
        <header class="max-w-3xl">
          <p class="font-mono text-[11px] uppercase tracking-[0.2em] text-klean-muted">Meaning follows lifecycle</p>
          <h1 id="alert-semantics-title" class="mt-3 text-balance text-4xl font-semibold tracking-tighter sm:text-5xl">Visible does not always mean live.</h1>
          <p class="mt-5 max-w-2xl text-pretty text-base leading-7 text-klean-muted">Alert renders no role by default. Choose ordinary content, note, status, or alert semantics from when the message appears and how urgently it must be announced.</p>
        </header>

        <div class="mt-12 grid max-w-6xl gap-6 lg:grid-cols-2">
          <article class="space-y-3">
            <p class="font-mono text-[11px] uppercase tracking-[0.18em] text-gray-500">Static guidance / no role</p>
            <Alert>
              <h2 class="font-medium">Scheduled publishing is optional</h2>
              <p class="mt-1 leading-6 text-gray-600 dark:text-gray-300">Leave the date empty to publish immediately.</p>
            </Alert>
          </article>

          <article class="space-y-3">
            <p class="font-mono text-[11px] uppercase tracking-[0.18em] text-gray-500">Supporting context / note</p>
            <Alert role="note" class="bg-sky-50 text-sky-950 dark:bg-sky-950 dark:text-sky-100">
              <h2 class="font-medium">Preview environment</h2>
              <p class="mt-1 leading-6 text-sky-800 dark:text-sky-200">This URL can change after the next deployment.</p>
            </Alert>
          </article>

          <article class="space-y-3">
            <p class="font-mono text-[11px] uppercase tracking-[0.18em] text-gray-500">Non-urgent update / status</p>
            <Alert role="status" class="bg-emerald-50 text-emerald-950 dark:bg-emerald-950 dark:text-emerald-100">
              <h2 class="font-medium">Invoice saved</h2>
              <p class="mt-1 leading-6 text-emerald-800 dark:text-emerald-200">The latest changes are now available to your team.</p>
            </Alert>
          </article>

          <article class="space-y-3">
            <p class="font-mono text-[11px] uppercase tracking-[0.18em] text-gray-500">Urgent dynamic failure / alert</p>
            <Alert as="section" role="alert" aria-labelledby="alert-failure-title" class="bg-red-50 text-red-950 dark:bg-red-950 dark:text-red-100">
              <h2 id="alert-failure-title" class="font-medium">Deployment failed</h2>
              <p class="mt-1 leading-6 text-red-800 dark:text-red-200">The server could not be reached. No production files changed.</p>
              <Button type="button" class="mt-4 min-h-9 min-w-0 bg-red-950 px-3 py-1.5 text-red-50 hover:bg-red-900 dark:bg-red-50 dark:text-red-950 dark:hover:bg-white">Try again</Button>
            </Alert>
          </article>
        </div>
      </section>
    `,
  }),
};

export const Apps = {
  parameters: { layout: "fullscreen", controls: { disable: true } },
  args: { onGenerate: fn(), onAddService: fn(), onConfigure: fn() },
  render: (args) => ({
    components: { Alert, Button },
    setup() {
      const checklist = [
        {
          label: "SESSION_SECRET is missing",
          suggestion: "Generate a strong secret before the first deployment.",
          action: "Generate",
          kind: "warning",
        },
        {
          label: "PostgreSQL is not attached",
          suggestion: "Add a database service for production data.",
          action: "Add service",
          kind: "info",
        },
        {
          label: "Deployment source is connected",
          suggestion: "GitHub will provide the selected branch.",
          kind: "success",
        },
      ];
      return { args, checklist };
    },
    methods: {
      handleAction(label) {
        if (label === "Generate") this.args.onGenerate();
        if (label === "Add service") this.args.onAddService();
      },
    },
    template: `
      <section class="klean-story-canvas px-5 py-14 sm:px-8 lg:px-12 lg:py-20" aria-labelledby="alert-apps-title">
        <header class="max-w-3xl">
          <p class="font-mono text-[11px] uppercase tracking-[0.2em] text-klean-muted">Application recipes</p>
          <h1 id="alert-apps-title" class="mt-3 text-balance text-4xl font-semibold tracking-tighter sm:text-5xl">One surface. Native content.</h1>
          <p class="mt-5 max-w-2xl text-pretty text-base leading-7 text-klean-muted">Hagfish keeps its editorial weight. Slipway keeps compact operational density. Neither becomes a Klean variant.</p>
        </header>

        <div class="mt-12 grid max-w-6xl gap-8 xl:grid-cols-[0.8fr_1.2fr]">
          <article class="space-y-3">
            <p class="font-mono text-[11px] uppercase tracking-[0.18em] text-gray-500">Hagfish / invoice warning</p>
            <Alert as="section" role="note" aria-labelledby="hagfish-alert-title" class="rounded-none border-2 border-black bg-[#fff3c4] p-6 text-black shadow-[5px_5px_0_0_#000] dark:bg-[#fff3c4] dark:text-black">
              <svg aria-hidden="true" class="size-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v4m0 4h.01M10.3 3.9 2.8 17a2 2 0 0 0 1.7 3h15a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" />
              </svg>
              <h2 id="hagfish-alert-title" class="mt-5 text-xl font-semibold tracking-tight">This invoice has not been sent</h2>
              <p class="mt-2 leading-7">Your client cannot view or pay it until you share the invoice link.</p>
              <a href="#hagfish-share" class="mt-5 inline-flex font-semibold underline underline-offset-4">Review sharing options</a>
            </Alert>
          </article>

          <article class="space-y-3">
            <p class="font-mono text-[11px] uppercase tracking-[0.18em] text-gray-500">Slipway / deployment checklist</p>
            <Alert as="section" role="note" aria-labelledby="deployment-checklist-title" class="overflow-hidden border border-amber-200 bg-amber-50/50 p-0 text-gray-950 dark:border-amber-900/50 dark:bg-amber-950/20 dark:text-white">
              <header class="flex items-center gap-2 px-4 py-3">
                <svg aria-hidden="true" class="size-4 text-amber-600 dark:text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v4m0 4h.01M10.3 3.9 2.8 17a2 2 0 0 0 1.7 3h15a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" />
                </svg>
                <h2 id="deployment-checklist-title" class="text-sm font-medium text-amber-900 dark:text-amber-200">Deployment checklist</h2>
                <span class="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium text-amber-800 dark:bg-amber-900/50 dark:text-amber-300">2 need attention</span>
              </header>
              <ul class="border-t border-amber-200/60 dark:border-amber-900/40">
                <li v-for="item in checklist" :key="item.label" class="flex items-start justify-between gap-3 border-b border-amber-200/50 px-4 py-3 last:border-b-0 dark:border-amber-900/30">
                  <div class="flex min-w-0 items-start gap-3">
                    <span :class="['mt-1 size-2 shrink-0 rounded-full', item.kind === 'warning' ? 'bg-amber-500' : item.kind === 'info' ? 'bg-sky-500' : 'bg-emerald-500']" aria-hidden="true"></span>
                    <div class="min-w-0">
                      <p class="text-sm text-gray-900 dark:text-gray-100">{{ item.label }}</p>
                      <p class="mt-0.5 text-xs leading-5 text-gray-600 dark:text-gray-400">{{ item.suggestion }}</p>
                    </div>
                  </div>
                  <Button v-if="item.action" type="button" class="min-h-8 min-w-0 shrink-0 border border-amber-300 bg-transparent px-2.5 py-1 text-xs text-amber-900 hover:bg-amber-100 dark:border-amber-800 dark:bg-transparent dark:text-amber-200 dark:hover:bg-amber-900/40" @click="handleAction(item.action)">{{ item.action }}</Button>
                  <span v-else class="shrink-0 text-xs font-medium text-emerald-700 dark:text-emerald-400">Ready</span>
                </li>
              </ul>
            </Alert>
          </article>

          <article class="space-y-3 xl:col-span-2">
            <p class="font-mono text-[11px] uppercase tracking-[0.18em] text-gray-500">Slipway / source action</p>
            <Alert as="section" role="alert" aria-labelledby="source-warning-title" class="flex items-start justify-between gap-4 border border-amber-200 bg-amber-50/50 text-gray-950 dark:border-amber-900/50 dark:bg-amber-950/20 dark:text-white">
              <div class="min-w-0">
                <h2 id="source-warning-title" class="text-sm font-medium text-amber-900 dark:text-amber-200">Deployment source required</h2>
                <p class="mt-1 text-xs leading-5 text-gray-600 dark:text-gray-400">Choose a repository and branch before deploying this application.</p>
              </div>
              <Button type="button" class="min-h-8 min-w-0 shrink-0 border border-amber-300 bg-transparent px-2.5 py-1 text-xs text-amber-900 hover:bg-amber-100 dark:border-amber-800 dark:bg-transparent dark:text-amber-200 dark:hover:bg-amber-900/40" @click="args.onConfigure">Configure source</Button>
            </Alert>
          </article>
        </div>
      </section>
    `,
  }),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getAllByRole("listitem")).toHaveLength(3);
    await userEvent.click(canvas.getByRole("button", { name: "Generate" }));
    await expect(args.onGenerate).toHaveBeenCalledOnce();
    await userEvent.click(canvas.getByRole("button", { name: "Add service" }));
    await expect(args.onAddService).toHaveBeenCalledOnce();
    await userEvent.click(canvas.getByRole("button", { name: "Configure source" }));
    await expect(args.onConfigure).toHaveBeenCalledOnce();
  },
};
