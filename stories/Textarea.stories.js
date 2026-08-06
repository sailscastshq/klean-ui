import { computed, ref } from "vue";
import Textarea from "../src/vue/textarea/Textarea.vue";

const meta = {
  title: "Components/Textarea",
  component: Textarea,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A styled native textarea that grows from its current value and width. Labels and messages remain ordinary native application markup.",
      },
    },
  },
  args: {
    name: "note",
    rows: 3,
    placeholder: "Add context for your team…",
    disabled: false,
    required: false,
    class: "",
  },
  argTypes: {
    rows: { control: "number", description: "Native initial row count." },
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
    label: "Internal note",
    help: "The control grows as the note wraps onto new lines.",
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
    components: { Textarea },
    setup() {
      const value = ref("");
      const invalid = computed(() => Boolean(args.error));
      return { args, invalid, value };
    },
    template: `
      <div class="grid w-[min(32rem,calc(100vw-2rem))] gap-2">
        <label for="playground-note" class="text-sm font-medium text-gray-950">{{ args.label }}</label>
        <Textarea
          id="playground-note"
          v-model="value"
          :name="args.name"
          :rows="args.rows"
          :placeholder="args.placeholder"
          :disabled="args.disabled"
          :required="args.required"
          :class="args.class"
          :aria-invalid="invalid"
          aria-describedby="playground-note-help playground-note-error"
        />
        <p id="playground-note-help" class="text-sm text-gray-600">{{ args.help }}</p>
        <p id="playground-note-error" class="empty:hidden text-sm text-red-700">{{ args.error }}</p>
      </div>
    `,
  }),
};

export const RestoredDraft = {
  name: "Restored draft",
  parameters: { controls: { disable: true } },
  render: () => ({
    components: { Textarea },
    setup() {
      const note = ref(
        "This value represents a draft restored by the application.\n\nTextarea derives its height from the restored value and the current responsive width. Klean does not create a second persistence layer.",
      );
      return { note };
    },
    template: `
      <div class="grid w-[min(36rem,calc(100vw-2rem))] gap-2">
        <label for="restored-note" class="text-sm font-medium">Internal note</label>
        <Textarea id="restored-note" v-model="note" name="note" aria-describedby="restored-note-help" />
        <p id="restored-note-help" class="text-sm text-gray-600">Restored by the application; resized by the control.</p>
      </div>
    `,
  }),
};

export const CallerSized = {
  name: "Caller-sized",
  parameters: { controls: { disable: true } },
  render: () => ({
    components: { Textarea },
    template: `
      <div class="grid w-[min(32rem,calc(100vw-2rem))] gap-2">
        <label for="caller-sized-note" class="text-sm font-medium">Fixed workspace</label>
        <Textarea id="caller-sized-note" name="workspace" class="h-40 resize-y overflow-y-auto" placeholder="Caller Tailwind takes ownership…" />
        <p class="text-sm text-gray-600">A caller height removes the derived-height utility through tailwind-merge.</p>
      </div>
    `,
  }),
};
