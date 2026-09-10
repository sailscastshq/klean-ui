import { ref } from "vue";
import SchedulePicker from "../src/vue/schedule-picker/SchedulePicker.vue";

const meta = {
  title: "Components/Schedule Picker",
  component: SchedulePicker,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Choose a date, time and timezone together. Future-only by default; allowPast enables historical records. Valid input commits on Enter or when focus leaves the complete picker.",
      },
    },
  },
  args: {
    name: "publishAt",
    timeZone: "Africa/Lagos",
    minuteStep: 15,
    required: true,
    disabled: false,
    readonly: false,
    allowPast: false,
    class: "w-[min(34rem,calc(100vw-2rem))]",
  },
  argTypes: {
    name: { control: "text" },
    timeZone: { control: "text", description: "IANA timezone." },
    minuteStep: { control: { type: "number", min: 5, max: 60, step: 5 } },
    required: { control: "boolean" },
    disabled: { control: "boolean" },
    readonly: { control: "boolean" },
    allowPast: { control: "boolean" },
    class: { control: "text" },
  },
};

export default meta;

export const Playground = {
  parameters: {
    controls: {
      include: [
        "name",
        "timeZone",
        "minuteStep",
        "required",
        "disabled",
        "readonly",
        "allowPast",
        "class",
      ],
    },
  },
  render: (args) => ({
    components: { SchedulePicker },
    setup() {
      const value = ref("");
      return { args, value };
    },
    template: `
      <div class="grid gap-2">
        <label for="schedule-playground" class="text-sm font-medium">Publish at</label>
        <SchedulePicker
          id="schedule-playground"
          v-model="value"
          :name="args.name"
          :time-zone="args.timeZone"
          :minute-step="args.minuteStep"
          :required="args.required"
          :disabled="args.disabled"
          :readonly="args.readonly"
          :allow-past="args.allowPast"
          :class="args.class"
        />
        <output class="break-all font-mono text-xs text-gray-500">{{ value || 'No committed instant yet' }}</output>
        <button type="button" class="mt-2 min-h-11 justify-self-start rounded-md border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-950">
          Continue
        </button>
      </div>
    `,
  }),
};

export const PublishingWorkflow = {
  parameters: { layout: "fullscreen", controls: { disable: true } },
  render: () => ({
    components: { SchedulePicker },
    setup() {
      const value = ref("");
      return { value };
    },
    template: `
      <main class="klean-story-canvas px-5 py-14 sm:px-8 lg:px-12">
        <form class="mx-auto max-w-2xl bg-white p-6 sm:p-10" @submit.prevent>
          <h1 class="text-3xl font-semibold tracking-[-0.04em]">Schedule this announcement</h1>
          <p class="mt-3 text-gray-600">A valid interpretation saves on Enter or when focus leaves the complete picker.</p>
          <div class="mt-8 grid gap-2">
            <label for="publish-at" class="text-sm font-medium">Publish at</label>
            <SchedulePicker id="publish-at" v-model="value" name="publishAt" time-zone="Africa/Lagos" required />
          </div>
        </form>
      </main>
    `,
  }),
};

export const HistoricalRecord = {
  parameters: { controls: { disable: true } },
  render: () => ({
    components: { SchedulePicker },
    setup() {
      const value = ref("2020-02-29T14:35:27.123Z");
      return { value };
    },
    template: `
      <form class="grid w-[min(34rem,calc(100vw-2rem))] gap-3" @submit.prevent>
        <h1 class="text-xl font-semibold">Edit record</h1>
        <label for="record-occurred-at" class="text-sm font-medium">Occurred at</label>
        <SchedulePicker id="record-occurred-at" v-model="value" name="occurredAt" allow-past time-zone="UTC" locale="en-US" placeholder="February 29, 2020 at 2:35pm" class="**:data-[slot=input]:border-dashed **:data-[slot=input]:shadow-none" />
        <output class="break-all font-mono text-xs text-gray-500">{{ value }}</output>
        <button type="submit" class="min-h-11 justify-self-start rounded-md bg-gray-950 px-4 py-2 text-sm font-medium text-white">Save record</button>
      </form>
    `,
  }),
};

export const BoundedPeriod = {
  parameters: { controls: { disable: true } },
  render: () => ({
    components: { SchedulePicker },
    setup() {
      const value = ref("2020-02-29T14:35:00.000Z");
      return { value };
    },
    template: `
      <div class="grid w-[min(34rem,calc(100vw-2rem))] gap-3">
        <label for="bounded-datetime" class="text-sm font-medium">Recorded during February 2020</label>
        <SchedulePicker id="bounded-datetime" v-model="value" name="recordedAt" allow-past time-zone="UTC" locale="en-GB" min="2020-02-01T00:00:00.000Z" max="2020-03-01T00:00:00.000Z" />
        <output class="break-all font-mono text-xs text-gray-500">{{ value }}</output>
        <button type="button" class="min-h-11 justify-self-start rounded-md border border-gray-300 px-4 text-sm">Continue</button>
      </div>
    `,
  }),
};
