import { computed, ref } from "vue";
import Button from "../src/vue/button/Button.vue";
import Input from "../src/vue/input/Input.vue";
import Textarea from "../src/vue/textarea/Textarea.vue";

const meta = {
  title: "Components/Input",
  component: Input,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A styled native input. Klean forwards ordinary attributes and leaves labels, help, errors, validation, and layout as visible native application markup.",
      },
    },
  },
  args: {
    type: "email",
    name: "email",
    placeholder: "kelvin@example.com",
    disabled: false,
    required: false,
    class: "",
  },
  argTypes: {
    type: { control: "text", description: "Native input type." },
    name: { control: "text", description: "Native form-data name." },
    disabled: { control: "boolean", description: "Native disabled state." },
    required: { control: "boolean", description: "Native required state." },
    class: {
      control: "text",
      description: "Caller Tailwind classes merged after the neutral defaults.",
    },
  },
};

export default meta;

export const Playground = {
  args: {
    label: "Email address",
    help: "We only use this for account messages.",
    error: "",
  },
  argTypes: {
    label: {
      control: "text",
      description: "Visible label supplied by this story composition.",
    },
    help: {
      control: "text",
      description: "Stable help text supplied by this story composition.",
    },
    error: {
      control: "text",
      description:
        "Application error text. An empty value hides the stable error node.",
    },
  },
  parameters: {
    controls: {
      include: [
        "label",
        "help",
        "error",
        "placeholder",
        "disabled",
        "required",
      ],
    },
  },
  render: (args) => ({
    components: { Input },
    setup() {
      const value = ref("");
      const invalid = computed(() => Boolean(args.error));
      return { args, invalid, value };
    },
    template: `
      <div class="grid w-[min(28rem,calc(100vw-2rem))] gap-2">
        <label for="playground-email" class="text-sm font-medium text-gray-950">{{ args.label }}</label>
        <Input
          id="playground-email"
          v-model="value"
          :type="args.type"
          :name="args.name"
          :placeholder="args.placeholder"
          :disabled="args.disabled"
          :required="args.required"
          :class="args.class"
          :aria-invalid="invalid"
          aria-describedby="playground-email-help playground-email-error"
        />
        <p id="playground-email-help" class="text-sm text-gray-600">{{ args.help }}</p>
        <p id="playground-email-error" class="empty:hidden text-sm text-red-700">{{ args.error }}</p>
      </div>
    `,
  }),
};

export const States = {
  parameters: { layout: "fullscreen", controls: { disable: true } },
  render: () => ({
    components: { Input },
    template: `
      <section class="klean-story-canvas px-5 py-14 sm:px-8 lg:px-12 lg:py-20" aria-labelledby="input-states-title">
        <header class="max-w-3xl">
          <p class="font-mono text-[11px] uppercase tracking-[0.2em] text-klean-muted">Native input</p>
          <h1 id="input-states-title" class="mt-3 text-balance text-4xl font-semibold tracking-tighter sm:text-5xl">The relationship stays in the markup.</h1>
          <p class="mt-5 max-w-2xl text-pretty text-base leading-7 text-klean-muted">Klean styles and forwards the control. The application writes the real label, IDs, help, error, and Tailwind layout where everyone can see them.</p>
        </header>

        <div class="mt-12 grid max-w-5xl gap-8 bg-white p-6 sm:grid-cols-2 sm:p-10">
          <div class="grid gap-2">
            <label for="states-company" class="text-sm font-medium">Company</label>
            <Input id="states-company" name="company" autocomplete="organization" placeholder="Sailscasts" aria-describedby="states-company-help" />
            <p id="states-company-help" class="text-sm text-gray-600">The public name shown on invoices.</p>
          </div>

          <div class="grid gap-2">
            <label for="states-domain" class="text-sm font-medium">Domain</label>
            <Input id="states-domain" name="domain" value="not a domain" aria-invalid="true" aria-describedby="states-domain-error" />
            <p id="states-domain-error" class="text-sm text-red-700">Enter a hostname such as sailscasts.com.</p>
          </div>

          <div class="grid gap-2">
            <label for="states-api-key" class="text-sm font-medium text-gray-500">API key</label>
            <Input id="states-api-key" name="api-key" value="Unavailable while provisioning" disabled aria-describedby="states-api-key-help" />
            <p id="states-api-key-help" class="text-sm text-gray-500">Provisioning usually takes under a minute.</p>
          </div>

          <div class="grid max-w-sm gap-2">
            <label for="states-filter" class="text-sm font-medium">Dense desktop recipe</label>
            <Input id="states-filter" name="filter" class="min-h-9 py-1 text-sm" placeholder="Filter deployments" aria-describedby="states-filter-help" />
            <p id="states-filter-help" class="text-sm text-gray-600">Density is a caller class, never a component prop.</p>
          </div>
        </div>
      </section>
    `,
  }),
};

export const BoringStackForm = {
  name: "Native form recipe",
  parameters: { layout: "fullscreen", controls: { disable: true } },
  render: () => ({
    components: { Button, Input, Textarea },
    setup() {
      const email = ref("kelvin@");
      const message = ref("");
      return { email, message };
    },
    template: `
      <main class="klean-story-canvas px-5 py-14 sm:px-8 lg:px-12 lg:py-20">
        <form class="mx-auto max-w-xl bg-white p-6 sm:p-10" novalidate @submit.prevent aria-labelledby="contact-title">
          <p class="font-mono text-[11px] uppercase tracking-[0.2em] text-klean-muted">Boring Stack form</p>
          <h1 id="contact-title" class="mt-2 text-3xl font-semibold tracking-[-0.04em]">Talk to the team</h1>
          <p class="mt-3 leading-7 text-klean-muted">The server owns validation. Native HTML makes every relationship inspectable.</p>

          <div class="mt-8 grid gap-6">
            <div class="grid gap-2">
              <label for="recipe-email" class="text-sm font-medium">Email address</label>
              <Input id="recipe-email" v-model="email" name="email" type="email" autocomplete="email" required :aria-invalid="true" aria-describedby="recipe-email-help recipe-email-error" />
              <p id="recipe-email-help" class="text-sm text-gray-600">Use the address where the team can reach you.</p>
              <p id="recipe-email-error" class="text-sm text-red-700">Enter a complete email address.</p>
            </div>

            <div class="grid gap-2">
              <label for="recipe-message" class="text-sm font-medium">What are you building?</label>
              <Textarea id="recipe-message" v-model="message" name="message" rows="5" required aria-describedby="recipe-message-help" />
              <p id="recipe-message-help" class="text-sm text-gray-600">Include the app and the workflow you want to improve.</p>
            </div>
          </div>

          <Button type="submit" class="mt-8">Send message</Button>
        </form>
      </main>
    `,
  }),
};
