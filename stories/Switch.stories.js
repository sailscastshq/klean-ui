import { ref, watch } from "vue";
import { expect, userEvent, within } from "storybook/test";
import Switch from "../src/vue/switch/Switch.vue";

const meta = {
  title: "Components/Switch",
  component: Switch,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A native boolean switch for settings that take effect immediately. It keeps browser form and keyboard behavior, while ordinary Tailwind classes own the look.",
      },
    },
  },
  args: {
    checked: false,
    disabled: false,
    required: false,
    invalid: false,
    class: "",
  },
  argTypes: {
    checked: {
      control: "boolean",
      description: "Boolean state supplied through Vue v-model.",
    },
    disabled: { control: "boolean", description: "Native disabled state." },
    required: { control: "boolean", description: "Native required state." },
    invalid: {
      control: "boolean",
      description: "Adds aria-invalid and visible application error copy.",
    },
    class: {
      control: "text",
      description: "Caller Tailwind classes merged after neutral defaults.",
    },
  },
};

export default meta;

export const Playground = {
  args: {
    label: "Enable preview releases",
    description:
      "New releases become available to preview as soon as they build.",
  },
  argTypes: {
    label: { control: "text" },
    description: { control: "text" },
  },
  parameters: {
    controls: {
      include: [
        "label",
        "description",
        "checked",
        "disabled",
        "required",
        "invalid",
        "class",
      ],
    },
  },
  render: (args) => ({
    components: { Switch },
    setup() {
      const checked = ref(Boolean(args.checked));
      watch(
        () => args.checked,
        (value) => {
          checked.value = Boolean(value);
        },
      );
      return { args, checked };
    },
    template: `
      <div class="w-[min(26rem,calc(100vw-2rem))] rounded-xl border border-gray-200 bg-white p-1 text-gray-950 shadow-sm dark:border-gray-800 dark:bg-gray-950 dark:text-white">
        <label class="flex min-h-16 cursor-pointer items-center justify-between gap-6 rounded-lg px-4 py-3 has-disabled:cursor-not-allowed">
          <span class="min-w-0">
            <span class="block text-sm font-medium">{{ args.label }}</span>
            <span class="mt-1 block text-sm leading-5 text-gray-500 dark:text-gray-400">{{ args.description }}</span>
          </span>
          <Switch
            v-model="checked"
            name="previewReleases"
            :disabled="args.disabled"
            :required="args.required"
            :aria-invalid="args.invalid || undefined"
            :aria-describedby="args.invalid ? 'preview-releases-error' : undefined"
            :class="args.class"
          />
        </label>
        <p v-if="args.invalid" id="preview-releases-error" class="px-4 pb-3 text-sm text-red-600 dark:text-red-400">
          This setting could not be saved.
        </p>
      </div>
    `,
  }),
  play: async ({ canvasElement, args }) => {
    const control = within(canvasElement).getByRole("switch");
    await expect(control).not.toHaveAttribute("aria-checked");
    if (!args.disabled) {
      const previous = control.checked;
      await userEvent.click(control);
      await expect(control.checked).toBe(!previous);
      await expect(control).toHaveFocus();
      await userEvent.keyboard(" ");
      await expect(control.checked).toBe(previous);
    }
  },
};

export const States = {
  parameters: { layout: "fullscreen", controls: { disable: true } },
  render: () => ({
    components: { Switch },
    setup() {
      const publicRoadmap = ref(true);
      const auditExport = ref(false);
      const compact = ref(true);
      const webhook = ref(true);
      return { auditExport, compact, publicRoadmap, webhook };
    },
    template: `
      <section class="klean-story-canvas px-5 py-14 sm:px-8 lg:px-12 lg:py-20" aria-labelledby="switch-states-title">
        <header class="max-w-3xl">
          <p class="font-mono text-[11px] uppercase tracking-[0.2em] text-klean-muted">Native boolean</p>
          <h1 id="switch-states-title" class="mt-3 text-balance text-4xl font-semibold tracking-tighter sm:text-5xl">Immediate, honest settings.</h1>
          <p class="mt-5 max-w-2xl text-pretty text-base leading-7 text-klean-muted">The visible state is the real checked state. The full labelled row is easy to tap, while disabled and invalid settings stay unmistakable.</p>
        </header>

        <div class="mt-12 grid max-w-6xl gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <article class="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950">
            <header class="border-b border-gray-200 px-5 py-4 dark:border-gray-800">
              <h2 class="text-sm font-semibold">Publishing</h2>
              <p class="mt-1 text-sm text-gray-500">Choose what customers can see right now.</p>
            </header>
            <div class="divide-y divide-gray-100 px-2 dark:divide-gray-900">
              <label class="flex min-h-20 cursor-pointer items-center justify-between gap-6 rounded-lg px-3 py-4">
                <span>
                  <span class="block text-sm font-medium">Public roadmap</span>
                  <span class="mt-1 block text-sm text-gray-500">Show planned work on the public feedback site.</span>
                </span>
                <Switch v-model="publicRoadmap" name="publicRoadmap" />
              </label>
              <label class="flex min-h-20 cursor-pointer items-center justify-between gap-6 rounded-lg px-3 py-4">
                <span>
                  <span class="block text-sm font-medium">Audit exports</span>
                  <span class="mt-1 block text-sm text-gray-500">Prepare a weekly record for administrators.</span>
                </span>
                <Switch v-model="auditExport" name="auditExport" />
              </label>
              <label class="flex min-h-20 cursor-not-allowed items-center justify-between gap-6 rounded-lg px-3 py-4 text-gray-400">
                <span>
                  <span class="block text-sm font-medium">Regional failover</span>
                  <span class="mt-1 block text-sm">Available after a second region is connected.</span>
                </span>
                <Switch disabled />
              </label>
            </div>
          </article>

          <div class="grid gap-6">
            <article class="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-950">
              <p class="font-mono text-[11px] uppercase tracking-[0.18em] text-gray-500">Caller classes</p>
              <label class="mt-6 flex min-h-11 cursor-pointer items-center justify-between gap-4">
                <span class="text-sm font-medium">Compact status</span>
                <Switch
                  v-model="compact"
                  class="h-5 w-9 bg-stone-300 after:size-4 checked:bg-emerald-600 checked:after:transform-[translate(1rem,-50%)] dark:bg-stone-700 dark:checked:bg-emerald-400"
                />
              </label>
              <p class="mt-4 text-sm leading-6 text-gray-500">No size or colour prop. Tailwind changes the source you own.</p>
            </article>

            <article class="rounded-2xl border border-red-200 bg-red-50/60 p-5 dark:border-red-950 dark:bg-red-950/20">
              <label class="flex min-h-11 cursor-pointer items-center justify-between gap-4">
                <span>
                  <span class="block text-sm font-medium">Webhook delivery</span>
                  <span id="webhook-switch-error" class="mt-1 block text-sm text-red-700 dark:text-red-300">Reconnect the endpoint before enabling delivery.</span>
                </span>
                <Switch v-model="webhook" aria-invalid="true" aria-describedby="webhook-switch-error" />
              </label>
            </article>
          </div>
        </div>
      </section>
    `,
  }),
};

export const Apps = {
  parameters: { layout: "fullscreen", controls: { disable: true } },
  render: () => ({
    components: { Switch },
    setup() {
      const flag = ref(true);
      const bearing = ref(true);
      const discord = ref(false);
      const durable = ref(false);
      const saving = ref(false);
      const error = ref("");

      function failDurably(event) {
        const next = Boolean(event.currentTarget.checked);
        const previous = !next;
        saving.value = true;
        error.value = "";

        window.setTimeout(() => {
          durable.value = previous;
          saving.value = false;
          error.value = "Could not save. The previous setting was restored.";
        }, 550);
      }

      return { bearing, discord, durable, error, failDurably, flag, saving };
    },
    template: `
      <section class="klean-story-canvas px-5 py-14 sm:px-8 lg:px-12 lg:py-20" aria-labelledby="switch-apps-title">
        <header class="max-w-3xl">
          <p class="font-mono text-[11px] uppercase tracking-[0.2em] text-klean-muted">Application recipes</p>
          <h1 id="switch-apps-title" class="mt-3 text-balance text-4xl font-semibold tracking-tighter sm:text-5xl">The switch stays lean. The product stays yours.</h1>
        </header>

        <div class="mt-12 grid max-w-6xl gap-6 lg:grid-cols-2">
          <article class="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-950">
            <p class="font-mono text-[11px] uppercase tracking-[0.18em] text-gray-500">Release flag</p>
            <div class="mt-7 flex items-center gap-3 border-t border-gray-100 pt-4 dark:border-gray-900">
              <div class="min-w-0 flex-1">
                <div class="flex items-baseline gap-2">
                  <code class="truncate text-sm font-medium">new-checkout</code>
                  <span class="text-xs text-gray-400">Everyone</span>
                </div>
                <p class="mt-1 truncate text-xs text-gray-500">Serve the rebuilt checkout experience.</p>
              </div>
              <Switch
                v-model="flag"
                aria-label="Enable new-checkout"
                class="h-5 w-9 after:size-4 checked:after:transform-[translate(1rem,-50%)]"
              />
              <button type="button" aria-label="Open release flag actions" class="grid size-9 place-items-center rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-900">•••</button>
            </div>
          </article>

          <article class="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-950">
            <p class="font-mono text-[11px] uppercase tracking-[0.18em] text-gray-500">Product availability</p>
            <label class="mt-7 flex min-h-20 cursor-pointer items-center justify-between gap-6 rounded-xl bg-gray-50 px-4 py-4 dark:bg-gray-900">
              <span>
                <span class="block text-sm font-medium">Customer feedback</span>
                <span class="mt-1 block text-sm leading-6 text-gray-500">Publish feedback, roadmap, and updates for this app.</span>
              </span>
              <Switch v-model="bearing" name="feedbackEnabled" />
            </label>
          </article>

          <article class="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950">
            <div class="flex min-h-20 items-center justify-between gap-6 px-5 py-4">
              <div>
                <h2 class="text-sm font-medium">Discord</h2>
                <p class="mt-1 text-xs text-gray-500">Receive notifications through a webhook.</p>
              </div>
              <label class="flex min-h-11 cursor-pointer items-center">
                <span class="sr-only">Enable Discord notifications</span>
                <Switch v-model="discord" name="discordEnabled" />
              </label>
            </div>
            <div v-if="discord" class="border-t border-gray-200 px-5 py-4 dark:border-gray-800">
              <label for="discord-webhook" class="block text-sm font-medium">Webhook URL</label>
              <input id="discord-webhook" class="mt-2 w-full border-b border-dashed border-gray-300 bg-transparent py-2 text-sm outline-none focus:border-gray-950 dark:border-gray-700 dark:focus:border-white" placeholder="https://discord.com/api/webhooks/…" />
            </div>
          </article>

          <article class="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-950">
            <p class="font-mono text-[11px] uppercase tracking-[0.18em] text-gray-500">Durable optimistic setting</p>
            <label class="mt-7 flex min-h-16 cursor-pointer items-center justify-between gap-6">
              <span>
                <span class="block text-sm font-medium">Automatic deploys</span>
                <span class="mt-1 block text-sm text-gray-500">Try it: this demo intentionally fails and rolls back.</span>
              </span>
              <Switch v-model="durable" :disabled="saving" aria-describedby="durable-switch-status" @change="failDurably" />
            </label>
            <p id="durable-switch-status" :role="error ? 'alert' : 'status'" class="mt-3 min-h-5 text-sm" :class="error ? 'text-red-600 dark:text-red-400' : 'text-gray-500'">
              {{ saving ? 'Saving…' : error }}
            </p>
          </article>
        </div>
      </section>
    `,
  }),
};
