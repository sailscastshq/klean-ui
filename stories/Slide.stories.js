import { ref } from "vue";
import { expect, fn, userEvent, within } from "storybook/test";
import Slide from "../src/vue/slide/Slide.vue";

const deploymentClasses = [
  "w-72 border-gray-200 bg-gray-100 text-gray-500 shadow-none",
  "[&_[data-slot=slide-fill]]:bg-amber-500/10",
  "[&_[data-slot=slide-thumb]]:bg-gray-950 [&_[data-slot=slide-thumb]]:text-white",
  "[&[data-progress=middle]_[data-slot=slide-thumb]]:bg-amber-500",
  "[&[data-progress=ready]_[data-slot=slide-thumb]]:bg-emerald-500",
  "[&[data-progress=complete]_[data-slot=slide-thumb]]:bg-emerald-500",
  "[&[data-progress=ready]_[data-slot=slide-fill]]:bg-emerald-500/10",
  "[&[data-progress=complete]_[data-slot=slide-fill]]:bg-emerald-500/10",
].join(" ");

const meta = {
  title: "Components/Slide",
  component: Slide,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "An action-confirmation button with an optional pointer slide. Keyboard and assistive activation remain native button activation; ordinary Tailwind owns product styling.",
      },
    },
  },
  args: {
    label: "Slide to continue",
    disabled: false,
    pending: false,
    class: "w-64",
    onConfirm: fn(),
  },
  argTypes: {
    label: {
      control: "text",
      description: "Visible action language supplied by the caller.",
    },
    disabled: {
      control: "boolean",
      description: "Native disabled state.",
    },
    pending: {
      control: "boolean",
      description: "Caller-owned in-progress state that prevents duplicates.",
    },
    class: {
      control: "text",
      description: "Ordinary Tailwind classes, merged last.",
    },
    onConfirm: { table: { disable: true } },
  },
};

export default meta;

export const Playground = {
  parameters: {
    controls: { include: ["label", "disabled", "pending", "class"] },
  },
  render: (args) => ({
    components: { Slide },
    setup() {
      const confirmations = ref(0);

      function confirm() {
        confirmations.value += 1;
        args.onConfirm();
      }

      return { args, confirmations, confirm };
    },
    template: `
      <div class="grid justify-items-center gap-4">
        <Slide
          :disabled="args.disabled"
          :pending="args.pending"
          :class="args.class"
          @confirm="confirm"
        >
          {{ args.pending ? 'Working…' : args.label }}
        </Slide>
        <p class="text-sm text-gray-600" aria-live="polite">
          Confirmed {{ confirmations }} {{ confirmations === 1 ? 'time' : 'times' }}.
        </p>
      </div>
    `,
  }),
};

export const Keyboard = {
  parameters: { controls: { disable: true } },
  args: { label: "Confirm with Enter" },
  render: (args) => ({
    components: { Slide },
    setup() {
      return { args };
    },
    template: `
      <Slide @confirm="args.onConfirm">{{ args.label }}</Slide>
    `,
  }),
  play: async ({ args, canvasElement }) => {
    const button = within(canvasElement).getByRole("button", {
      name: args.label,
    });
    button.focus();
    await userEvent.keyboard("{Enter}");
    await expect(args.onConfirm).toHaveBeenCalledTimes(1);
    await expect(button).toHaveFocus();
  },
};

export const States = {
  parameters: { layout: "centered", controls: { disable: true } },
  render: () => ({
    components: { Slide },
    template: `
      <div class="grid gap-6 sm:grid-cols-2">
        <div class="grid gap-2">
          <span class="text-xs font-medium uppercase tracking-wide text-gray-500">Disabled</span>
          <Slide disabled>Slide to continue</Slide>
        </div>
        <div class="grid gap-2">
          <span class="text-xs font-medium uppercase tracking-wide text-gray-500">Pending</span>
          <Slide pending>Working…</Slide>
        </div>
        <div class="grid gap-2" dir="rtl">
          <span class="text-xs font-medium uppercase tracking-wide text-gray-500">RTL</span>
          <Slide>اسحب للتأكيد</Slide>
        </div>
        <div class="grid gap-2">
          <span class="text-xs font-medium uppercase tracking-wide text-gray-500">Caller styled</span>
          <Slide class="rounded-md border-2 border-gray-950 bg-white shadow-none">Slide to approve</Slide>
        </div>
      </div>
    `,
  }),
};

export const Deployment = {
  name: "Deployment",
  parameters: { layout: "fullscreen", controls: { disable: true } },
  render: () => ({
    components: { Slide },
    setup() {
      const pending = ref(false);
      const message = ref("Ready to deploy.");

      function deploy() {
        pending.value = true;
        message.value = "Deployment started.";
        window.setTimeout(() => {
          pending.value = false;
          message.value = "Ready to deploy again.";
        }, 1200);
      }

      return { deploy, deploymentClasses, message, pending };
    },
    template: `
      <main class="grid min-h-[32rem] place-items-center bg-gray-950 p-6 text-white">
        <section class="grid justify-items-center gap-5" aria-labelledby="deployment-title">
          <div class="text-center">
            <h2 id="deployment-title" class="font-semibold">Ship the current release</h2>
            <p class="mt-1 text-sm text-gray-400">Sliding prevents an accidental pointer click.</p>
          </div>
          <Slide :pending="pending" :class="deploymentClasses" @confirm="deploy">
            {{ pending ? 'Sliding to production…' : 'Slide to production' }}
          </Slide>
          <p class="text-sm text-gray-400" aria-live="polite">{{ message }}</p>
        </section>
      </main>
    `,
  }),
};
