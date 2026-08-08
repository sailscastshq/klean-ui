import { computed, ref, watch } from "vue";
import { addDays, todayIso } from "../src/vue/calendar/date.js";
import DatePicker from "../src/vue/date-picker/DatePicker.vue";

const meta = {
  title: "Components/Date Picker",
  component: DatePicker,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "An editable YYYY-MM-DD field composed with Klean Calendar and native-first Popover.",
      },
    },
  },
  args: {
    modelValue: "2026-08-12",
    name: "dueAt",
    min: "2026-08-01",
    max: "2026-12-31",
    disabled: false,
    readonly: false,
    required: true,
    class: "w-72",
  },
  argTypes: {
    modelValue: { control: "text" },
    name: { control: "text" },
    min: { control: "text" },
    max: { control: "text" },
    disabled: { control: "boolean" },
    readonly: { control: "boolean" },
    required: { control: "boolean" },
    class: { control: "text" },
  },
};

export default meta;

export const Playground = {
  parameters: {
    controls: {
      include: [
        "modelValue",
        "name",
        "min",
        "max",
        "disabled",
        "readonly",
        "required",
        "class",
      ],
    },
  },
  render: (args) => ({
    components: { DatePicker },
    setup() {
      const value = ref(args.modelValue);
      watch(
        () => args.modelValue,
        (next) => (value.value = next),
      );
      return { args, value };
    },
    template: `
      <div class="grid gap-2">
        <label for="date-picker-playground" class="text-sm font-medium">Due date</label>
        <DatePicker
          id="date-picker-playground"
          v-model="value"
          :name="args.name"
          :min="args.min"
          :max="args.max"
          :disabled="args.disabled"
          :readonly="args.readonly"
          :required="args.required"
          :class="args.class"
          aria-describedby="date-picker-playground-help"
        />
        <p id="date-picker-playground-help" class="text-sm text-gray-600">Stored as {{ value || 'no date' }}.</p>
      </div>
    `,
  }),
};

export const InvoiceDates = {
  parameters: { layout: "fullscreen", controls: { disable: true } },
  render: () => ({
    components: { DatePicker },
    setup() {
      const today = todayIso();
      const issued = ref(today);
      const due = ref(addDays(today, 30));
      const dueMin = computed(() => addDays(issued.value, 1));
      const issuedMax = computed(() => addDays(due.value, -1));

      watch(issued, () => {
        if (due.value < dueMin.value) due.value = dueMin.value;
      });
      watch(due, () => {
        if (issued.value > issuedMax.value) issued.value = issuedMax.value;
      });

      return { due, dueMin, issued, issuedMax, today };
    },
    template: `
      <main class="klean-story-canvas px-5 py-14 sm:px-8 lg:px-12">
        <form class="mx-auto grid max-w-2xl gap-6 bg-white p-6 sm:grid-cols-2 sm:p-10" aria-describedby="invoice-date-rules" @submit.prevent>
          <div class="grid gap-2">
            <label for="issued-date" class="text-sm font-medium">Issued</label>
            <DatePicker id="issued-date" v-model="issued" name="issuedAt" :min="today" :max="issuedMax" required />
          </div>
          <div class="grid gap-2">
            <label for="due-date" class="text-sm font-medium">Due</label>
            <DatePicker id="due-date" v-model="due" name="dueAt" :min="dueMin" required />
          </div>
          <p id="invoice-date-rules" class="text-sm text-gray-600 sm:col-span-2">
            Issue dates start today. Due dates must be at least one day later.
          </p>
        </form>
      </main>
    `,
  }),
};
