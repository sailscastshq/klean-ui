import { expect, userEvent, within } from "storybook/test";
import { onBeforeUnmount, ref } from "vue";
import Toast from "../src/vue/toast/Toast.vue";
import { createToast } from "../src/vue/toast/toast.js";

const positions = [
  "top-left",
  "top-center",
  "top-right",
  "bottom-left",
  "bottom-center",
  "bottom-right",
];
const directions = ["left", "right", "top", "bottom", "fade", "none"];

const meta = {
  title: "Components/Toast",
  component: Toast,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A provider-free notification controller and one persistent live region. Durabo supplies the motion, Slipway proves long-running updates, Hagfish supplies a product recipe, and Tailwind remains application-owned.",
      },
    },
  },
  args: {
    position: "top-right",
    from: "right",
    to: "right",
  },
  argTypes: {
    position: {
      control: "select",
      options: positions,
      description: "Fixed viewport position.",
    },
    from: {
      control: "select",
      options: directions,
      description: "Entry direction. Right is the x-axis default.",
    },
    to: {
      control: "select",
      options: directions,
      description: "Exit direction. Right is the x-axis default.",
    },
  },
};

export default meta;

export const Playground = {
  parameters: { controls: { include: ["position", "from", "to"] } },
  render: (args) => ({
    components: { Toast },
    setup() {
      const notifications = createToast();
      let count = 0;

      function notify() {
        count += 1;
        notifications({
          title: count === 1 ? "Changes saved" : `Notification ${count}`,
          message:
            "The application owns this message and every Tailwind class.",
        });
      }

      onBeforeUnmount(notifications.destroy);
      return { args, notifications, notify };
    },
    template: `
      <div class="grid justify-items-center gap-3">
        <button type="button" class="min-h-11 cursor-pointer rounded-md bg-gray-950 px-4 py-2 font-medium text-white hover:bg-gray-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-950 focus-visible:ring-offset-2" @click="notify">
          Show toast
        </button>
        <p class="text-sm text-gray-500">Try a different entry and exit direction with Controls.</p>
        <Toast :controller="notifications" :position="args.position" :from="args.from" :to="args.to" />
      </div>
    `,
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "Show toast" }));
    await expect(canvas.getByText("Changes saved")).toBeInTheDocument();
    await expect(
      canvasElement.querySelector('[data-slot="toast-viewport"]'),
    ).toHaveAttribute("aria-live", "polite");
  },
};

export const Motion = {
  name: "Durabo motion",
  parameters: { controls: { disable: true } },
  render: () => ({
    components: { Toast },
    setup() {
      const notifications = createToast({ duration: 2600 });
      const from = ref("right");
      const to = ref("right");

      function show(nextFrom, nextTo = nextFrom) {
        from.value = nextFrom;
        to.value = nextTo;
        notifications({
          title: `${nextFrom} in · ${nextTo} out`,
          message: "340ms overshoot in, 300ms counter-motion out.",
        });
      }

      onBeforeUnmount(notifications.destroy);
      return { from, notifications, show, to };
    },
    template: `
      <div class="flex max-w-lg flex-wrap justify-center gap-2">
        <button v-for="direction in ['right', 'left', 'top', 'bottom', 'fade']" :key="direction" type="button" class="min-h-10 cursor-pointer rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium capitalize hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-950" @click="show(direction)">
          {{ direction }}
        </button>
        <button type="button" class="min-h-10 cursor-pointer rounded-md bg-gray-950 px-3 py-2 text-sm font-medium text-white hover:bg-gray-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-950" @click="show('right', 'left')">
          Cross the screen
        </button>
        <Toast :controller="notifications" :from="from" :to="to" />
      </div>
    `,
  }),
};

export const Deployment = {
  name: "Deployment lifecycle",
  parameters: { layout: "fullscreen", controls: { disable: true } },
  render: () => ({
    components: { Toast },
    setup() {
      const notifications = createToast({ max: 3 });
      const deploymentId = ref();
      const step = ref(0);
      const stages = [
        ["Preparing deployment", "Reading service configuration", 12],
        ["Building image", "Installing dependencies", 38],
        ["Starting service", "Waiting for the health check", 76],
        ["Deployment live", "production.example.com", 100],
      ];

      function start() {
        step.value = 0;
        const [title, message, progress] = stages[0];
        deploymentId.value = notifications({
          title,
          message,
          progress,
          status: "running",
          duration: false,
          dismissible: false,
          class: "border-gray-700 bg-gray-900 text-white shadow-2xl",
        });
      }

      function advance() {
        if (!deploymentId.value) return start();
        step.value = Math.min(step.value + 1, stages.length - 1);
        const [title, message, progress] = stages[step.value];
        const complete = progress === 100;

        notifications.update(deploymentId.value, {
          title,
          message,
          progress,
          status: complete ? "complete" : "running",
          duration: complete ? 5000 : false,
          dismissible: complete,
        });
      }

      onBeforeUnmount(notifications.destroy);
      return { advance, notifications, start };
    },
    template: `
      <main class="min-h-[34rem] bg-gray-950 p-8 text-white sm:p-12">
        <div class="mx-auto max-w-3xl">
          <p class="font-mono text-xs uppercase tracking-[0.18em] text-gray-500">Slipway recipe</p>
          <h2 class="mt-3 text-3xl font-semibold tracking-tight">One toast, updated in place.</h2>
          <p class="mt-3 max-w-xl text-sm leading-6 text-gray-400">The app still owns SSE, deployment language, progress, and terminal-state rules. Klean owns notification timing and motion.</p>
          <div class="mt-6 flex gap-2">
            <button type="button" class="min-h-10 cursor-pointer rounded-md bg-white px-4 py-2 text-sm font-medium text-gray-950 hover:bg-gray-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-gray-950" @click="start">Deploy</button>
            <button type="button" class="min-h-10 cursor-pointer rounded-md border border-gray-700 px-4 py-2 text-sm font-medium text-white hover:bg-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white" @click="advance">Next event</button>
          </div>
        </div>

        <Toast :controller="notifications" position="bottom-right" from="right" to="right">
          <template #default="{ item, dismiss }">
            <article class="grid gap-3" aria-label="Deployment status">
              <div class="flex items-start gap-3">
                <span class="mt-1 size-2.5 shrink-0 rounded-full" :class="item.status === 'complete' ? 'bg-emerald-400' : 'animate-pulse bg-blue-400'" aria-hidden="true"></span>
                <div class="min-w-0 flex-1">
                  <p class="text-sm font-semibold text-white">{{ item.title }}</p>
                  <p class="mt-1 truncate text-xs text-gray-400">{{ item.message }}</p>
                </div>
                <button v-if="item.dismissible !== false" type="button" class="grid size-8 cursor-pointer place-items-center rounded-md text-lg text-gray-400 hover:bg-gray-800 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white" aria-label="Dismiss deployment notification" @click="dismiss">×</button>
              </div>
              <div class="h-1.5 overflow-hidden rounded-full bg-gray-800" aria-hidden="true">
                <div class="h-full rounded-full bg-white transition-[width] duration-300" :style="{ width: item.progress + '%' }"></div>
              </div>
            </article>
          </template>
        </Toast>
      </main>
    `,
  }),
};

export const Products = {
  name: "Product recipes",
  parameters: { layout: "fullscreen", controls: { disable: true } },
  render: () => ({
    components: { Toast },
    setup() {
      const hagfish = createToast({ duration: false });
      const slipway = createToast({ duration: false });

      function showHagfish() {
        hagfish({
          title: "Invoice sent",
          message: "INV-1042 is on its way to Ada.",
          class:
            "rounded-xl border-2 border-black bg-white text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:border-white dark:bg-black dark:text-white dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]",
        });
      }

      function showSlipway() {
        slipway({
          title: "Service restarted",
          message: "api-production is healthy.",
          class:
            "rounded-lg border border-gray-700 bg-gray-900 text-white shadow-lg",
        });
      }

      onBeforeUnmount(() => {
        hagfish.destroy();
        slipway.destroy();
      });
      return { hagfish, showHagfish, showSlipway, slipway };
    },
    template: `
      <div class="grid min-h-[34rem] sm:grid-cols-2">
        <section class="flex items-center justify-center bg-[#f7f3eb] p-8" aria-labelledby="hagfish-toast-recipe">
          <div class="text-center">
            <h2 id="hagfish-toast-recipe" class="text-xs font-medium uppercase tracking-[0.18em] text-black/60">Hagfish</h2>
            <button type="button" class="mt-4 min-h-11 cursor-pointer rounded-lg border-2 border-black bg-black px-4 py-2 font-medium text-white hover:bg-white hover:text-black hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2" @click="showHagfish">Send invoice</button>
          </div>
          <Toast :controller="hagfish" position="top-left" from="left" to="left" />
        </section>
        <section class="dark flex items-center justify-center bg-gray-950 p-8 text-white" aria-labelledby="slipway-toast-recipe">
          <div class="text-center">
            <h2 id="slipway-toast-recipe" class="font-mono text-xs uppercase tracking-[0.18em] text-gray-500">Slipway</h2>
            <button type="button" class="mt-4 min-h-10 cursor-pointer rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white" @click="showSlipway">Restart service</button>
          </div>
          <Toast :controller="slipway" position="top-right" />
        </section>
      </div>
    `,
  }),
};
