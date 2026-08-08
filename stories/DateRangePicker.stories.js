import { ref } from "vue";
import DateRangePicker from "../src/vue/date-range-picker/DateRangePicker.vue";

const meta = {
  title: "Components/Date Range Picker",
  component: DateRangePicker,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Two date-only boundaries, one contiguous calendar, and native start/end form entries.",
      },
    },
  },
  args: {
    name: "period",
    label: "Report period",
    min: "2026-01-01",
    max: "2026-12-31",
    required: true,
    disabled: false,
    readonly: false,
    class: "w-[min(38rem,calc(100vw-2rem))]",
  },
  argTypes: {
    name: { control: "text" },
    label: { control: "text" },
    min: { control: "text" },
    max: { control: "text" },
    required: { control: "boolean" },
    disabled: { control: "boolean" },
    readonly: { control: "boolean" },
    class: { control: "text" },
  },
};

export default meta;

export const Playground = {
  parameters: {
    controls: {
      include: [
        "name",
        "label",
        "min",
        "max",
        "required",
        "disabled",
        "readonly",
        "class",
      ],
    },
  },
  render: (args) => ({
    components: { DateRangePicker },
    setup() {
      const value = ref({ start: "2026-08-08", end: "2026-08-12" });
      return { args, value };
    },
    template: `
      <DateRangePicker
        v-model="value"
        :name="args.name"
        :label="args.label"
        :min="args.min"
        :max="args.max"
        :required="args.required"
        :disabled="args.disabled"
        :readonly="args.readonly"
        :class="args.class"
      />
    `,
  }),
};

export const Reporting = {
  parameters: { layout: "fullscreen", controls: { disable: true } },
  render: () => ({
    components: { DateRangePicker },
    setup() {
      const period = ref({ start: "2026-08-01", end: "2026-08-31" });
      return { period };
    },
    template: `
      <main class="klean-story-canvas px-5 py-14 sm:px-8 lg:px-12">
        <form class="mx-auto max-w-2xl bg-white p-6 sm:p-10" @submit.prevent>
          <DateRangePicker v-model="period" name="period" label="Revenue report" required />
          <output class="mt-5 block font-mono text-xs text-gray-500">{{ period }}</output>
        </form>
      </main>
    `,
  }),
};
