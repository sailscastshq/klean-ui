import { ref, watch } from "vue";
import Calendar from "../src/vue/calendar/Calendar.vue";

const meta = {
  title: "Components/Calendar",
  component: Calendar,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A locale-aware date-only calendar with semantic table markup, roving focus, and ordinary Tailwind classes.",
      },
    },
  },
  args: {
    modelValue: "2026-08-12",
    min: "2026-08-01",
    max: "2026-10-31",
    locale: "en-NG",
    disabled: false,
    readonly: false,
    class: "",
  },
  argTypes: {
    modelValue: { control: "text", description: "Date-only YYYY-MM-DD value." },
    min: { control: "text" },
    max: { control: "text" },
    locale: { control: "text" },
    disabled: { control: "boolean" },
    readonly: { control: "boolean" },
    class: { control: "text", description: "Caller Tailwind classes." },
  },
};

export default meta;

export const Playground = {
  parameters: {
    controls: {
      include: [
        "modelValue",
        "min",
        "max",
        "locale",
        "disabled",
        "readonly",
        "class",
      ],
    },
  },
  render: (args) => ({
    components: { Calendar },
    setup() {
      const value = ref(args.modelValue);
      watch(
        () => args.modelValue,
        (next) => (value.value = next),
      );
      return { args, value };
    },
    template: `
      <Calendar
        v-model="value"
        :min="args.min"
        :max="args.max"
        :locale="args.locale"
        :disabled="args.disabled"
        :readonly="args.readonly"
        :class="args.class"
      />
    `,
  }),
};

export const Availability = {
  parameters: { controls: { disable: true } },
  render: () => ({
    components: { Calendar },
    setup() {
      const value = ref("2026-08-12");
      const unavailable = (date) => {
        const weekday = new Date(`${date}T00:00:00Z`).getUTCDay();
        return weekday === 0 || weekday === 6;
      };
      return { unavailable, value };
    },
    template: `
      <div class="grid gap-3">
        <p class="text-sm text-gray-600">Weekends are unavailable by this application's rule.</p>
        <Calendar v-model="value" min="2026-08-01" :unavailable="unavailable" />
      </div>
    `,
  }),
};

export const Rtl = {
  name: "RTL",
  parameters: { controls: { disable: true } },
  args: { modelValue: "2026-08-12", locale: "ar-EG", dir: "rtl" },
};
