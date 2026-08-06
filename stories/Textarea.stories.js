import { ref } from "vue";
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
  render: (args) => ({
    components: { Textarea },
    setup() {
      const value = ref("");
      return { args, value };
    },
    template: `
      <div class="grid w-[min(32rem,calc(100vw-2rem))] gap-2">
        <label for="playground-note" class="text-sm font-medium text-gray-950">Internal note</label>
        <Textarea
          v-bind="args"
          id="playground-note"
          v-model="value"
          aria-describedby="playground-note-help"
        />
        <p id="playground-note-help" class="text-sm text-gray-600">The control grows as the note wraps onto new lines.</p>
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
