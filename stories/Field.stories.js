import { ref } from "vue";
import Button from "../src/vue/button/Button.vue";
import Field from "../src/vue/field/Field.vue";
import Input from "../src/vue/input/Input.vue";
import Textarea from "../src/vue/textarea/Textarea.vue";

const meta = {
  title: "Components/Field",
  component: Field,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "The native form foundation. Field supplies semantic relationships by convention; Label, Input, and Textarea remain useful on their own. Validation, values, and visual recipes stay with the application.",
      },
    },
  },
  args: {
    invalid: false,
    disabled: false,
    required: false,
  },
  argTypes: {
    id: {
      control: "text",
      description:
        "Optional native control ID. Field generates one when this is omitted.",
    },
    name: {
      control: "text",
      description: "Native name inherited by Input or Textarea.",
    },
    invalid: {
      control: "boolean",
      description:
        "Sets the accessible invalid state. The application still owns validation.",
    },
    disabled: {
      control: "boolean",
      description: "Disables the field's native control.",
    },
    required: {
      control: "boolean",
      description: "Marks the field's native control as required.",
    },
    class: {
      control: "text",
      description: "Caller-owned Tailwind layout classes.",
    },
  },
};

export default meta;

export const Playground = {
  render: (args) => ({
    components: {
      Field,
      Input,
    },
    setup() {
      const email = ref("");
      return { args, email };
    },
    template: `
      <Field
        v-bind="args"
        id="playground-email"
        name="email"
        label="Email address"
        description="We only use this for account messages."
        :error="args.invalid ? 'Enter a valid email address.' : undefined"
        class="w-[min(28rem,calc(100vw-2rem))]"
      >
        <Input v-model="email" type="email" autocomplete="email" placeholder="kelvin@example.com" />
      </Field>
    `,
  }),
};

export const States = {
  parameters: { layout: "fullscreen", controls: { disable: true } },
  render: () => ({
    components: {
      Field,
      Input,
      Textarea,
    },
    template: `
      <section class="klean-story-canvas px-5 py-14 sm:px-8 lg:px-12 lg:py-20" aria-labelledby="field-states-title">
        <header class="max-w-3xl">
          <p class="font-mono text-[11px] uppercase tracking-[0.2em] text-klean-muted">Form foundation</p>
          <h1 id="field-states-title" class="mt-3 text-balance text-4xl font-semibold tracking-[-0.05em] sm:text-5xl">Native controls. Relationships by convention.</h1>
          <p class="mt-5 max-w-2xl text-pretty text-base leading-7 text-klean-muted">There is no visual variant API. These states use native attributes, Field context, and ordinary Tailwind classes that the application can replace.</p>
        </header>

        <div class="mt-12 grid max-w-5xl gap-8 bg-white p-6 sm:grid-cols-2 sm:p-10">
          <Field id="states-company" name="company" label="Company" description="The public name shown on invoices.">
            <Input autocomplete="organization" placeholder="Sailscasts" />
          </Field>

          <Field id="states-domain" name="domain" label="Domain" error="Enter a hostname such as sailscasts.com.">
            <Input value="not a domain" autocomplete="url" />
          </Field>

          <Field id="states-api-key" name="api-key" label="API key" description="Provisioning usually takes under a minute." disabled>
            <Input value="Unavailable while provisioning" />
          </Field>

          <Field id="states-note" name="note" label="Internal note" description="Plain text, up to 2,000 characters.">
            <Textarea placeholder="Add context for your team…" />
          </Field>

          <Field id="states-filter" name="filter" label="Dense desktop recipe" description="Density is a caller class, never a component prop." class="sm:col-span-2 sm:max-w-sm">
            <Input class="min-h-9 py-1 text-sm" placeholder="Filter deployments" />
          </Field>
        </div>
      </section>
    `,
  }),
};

export const BoringStackForm = {
  name: "Form recipe",
  parameters: { layout: "fullscreen", controls: { disable: true } },
  render: () => ({
    components: {
      Button,
      Field,
      Input,
      Textarea,
    },
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
          <p class="mt-3 leading-7 text-klean-muted">The server owns the error. Field makes its relationship to the control automatic.</p>

          <div class="mt-8 grid gap-6">
            <Field id="recipe-email" name="email" label="Email address" error="Enter a complete email address." required>
              <Input v-model="email" type="email" autocomplete="email" />
            </Field>

            <Field id="recipe-message" name="message" label="What are you building?" description="Include the app and the workflow you want to improve." required>
              <Textarea v-model="message" rows="5" />
            </Field>
          </div>

          <Button type="submit" class="mt-8">Send message</Button>
        </form>
      </main>
    `,
  }),
};
