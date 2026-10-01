import { ref } from "vue";
import Slider from "../src/vue/slider/Slider.vue";

export default {
  title: "Components/Slider",
  component: Slider,
  parameters: { layout: "centered" },
};

export const Playground = {
  render: () => ({
    components: { Slider },
    setup() {
      return { value: ref(40) };
    },
    template: `<div class="w-80 max-w-full"><div class="mb-2 flex justify-between text-sm font-medium"><label for="rollout">Rollout percentage</label><output>{{ value }}%</output></div><Slider id="rollout" v-model="value" name="rollout" :value-text="v => v + ' percent'"/><p class="mt-2 text-sm text-gray-500">Choose how many visitors receive the release.</p></div>`,
  }),
};

export const States = {
  parameters: { layout: "fullscreen", controls: { disable: true } },
  render: () => ({
    components: { Slider },
    setup() {
      return {
        rollout: ref(40),
        level: ref(3),
        price: ref([200, 800]),
        precision: ref(0.65),
        gap: ref([30, 70]),
        equal: ref([50, 50]),
        start: ref(0),
        end: ref(100),
        dark: ref(65),
        rtl: ref([20, 70]),
        invalid: ref(85),
        keyboard: ref(45),
        marks: [1, 2, 3, 4, 5].map((value) => ({ value, label: value })),
        money: (value) => "$" + value,
      };
    },
    template: `
      <main class="mx-auto max-w-6xl bg-white px-8 py-12 text-gray-950 sm:px-16 sm:py-16">
        <header class="mb-10 flex flex-wrap items-end justify-between gap-4"><div><h1 class="text-3xl font-semibold tracking-tight">A little more control.</h1><p class="mt-3 max-w-lg text-base leading-relaxed text-gray-500">Precise when you need it. Effortless when you don’t.</p></div><span class="text-sm text-gray-400">Klean UI · Slider</span></header>
        <div class="grid gap-x-20 gap-y-10 md:grid-cols-2">
          <section><div class="flex justify-between text-sm font-medium"><label for="state-rollout">Release rollout</label><output class="tabular-nums">{{rollout}}%</output></div><Slider id="state-rollout" v-model="rollout" :value-text="v => v + ' percent'"/><p class="text-sm text-gray-500">A single value. Ready for real traffic.</p></section>
          <section><div class="flex justify-between text-sm font-medium"><span id="budget-label">Monthly budget</span><output class="tabular-nums">{{money(price[0])}} – {{money(price[1])}}</output></div><Slider v-model="price" :max="1000" :step="10" :labels="['Minimum budget', 'Maximum budget']" aria-labelledby="budget-label" :value-text="money"/><div class="flex justify-between text-xs text-gray-400"><span>$0</span><span>$1,000</span></div></section>
          <section class="pb-3"><div class="flex justify-between text-sm font-medium"><label for="state-level">Thinking effort</label><output>{{['','Quick','Light','Balanced','Thorough','Deep'][level]}}</output></div><Slider id="state-level" v-model="level" :min="1" :max="5" :marks="marks" :value-text="v => ['','Quick','Light','Balanced','Thorough','Deep'][v]"/></section>
          <section><div class="flex items-center justify-between text-sm font-medium"><label for="state-precision">Playback speed</label><div class="flex items-center gap-1"><input aria-label="Exact playback speed" type="number" v-model.number="precision" min="0.25" max="2" step="0.05" class="w-16 rounded-md border border-gray-200 px-2 py-1 text-right tabular-nums outline-none focus:border-gray-950"/><span class="text-gray-500">×</span></div></div><Slider id="state-precision" v-model="precision" :min="0.25" :max="2" :step="0.05" :value-text="v => v + ' times'" class="text-blue-600"/><p class="text-sm text-gray-500">Small steps. An exact value when it matters.</p></section>
          <section><div class="flex justify-between text-sm font-medium"><span id="gap-label">Keep a little space</span><output class="tabular-nums">{{gap[0]}} – {{gap[1]}}</output></div><Slider v-model="gap" :min-steps-between="20" aria-labelledby="gap-label" :labels="['Lower threshold','Upper threshold']"/><p class="text-sm text-gray-500">The endpoints stay at least 20 apart.</p></section>
          <section><div class="flex justify-between text-sm font-medium"><span id="equal-label">A shared starting point</span><output class="tabular-nums">{{equal[0]}} – {{equal[1]}}</output></div><Slider v-model="equal" aria-labelledby="equal-label" :labels="['Start point','End point']"/><p class="text-sm text-gray-500">Both handles remain keyboard reachable.</p></section>
          <section><div class="flex justify-between text-sm font-medium"><label for="state-start">At the beginning</label><output>{{start}}%</output></div><Slider id="state-start" v-model="start"/><div class="mt-2 flex justify-between text-sm font-medium"><label for="state-end">All the way</label><output>{{end}}%</output></div><Slider id="state-end" v-model="end"/></section>
          <section><div class="flex justify-between text-sm font-medium"><label for="state-disabled">Managed by your team</label><output class="text-gray-400">60%</output></div><Slider id="state-disabled" :model-value="60" disabled/><p class="text-sm text-gray-500">Unavailable, without losing its context.</p></section>
          <section><div class="flex justify-between text-sm font-medium"><label for="state-keyboard">Keyboard ready</label><output>{{keyboard}}%</output></div><Slider id="state-keyboard" v-model="keyboard"/><p class="text-sm text-gray-500">Arrows to refine. Shift to take a bigger step.</p></section>
          <section><div class="flex justify-between text-sm font-medium"><label for="state-invalid">Team capacity</label><output :class="invalid > 80 ? 'text-red-600' : ''">{{invalid}}%</output></div><Slider id="state-invalid" v-model="invalid" :aria-invalid="invalid > 80" aria-describedby="capacity-error" :class="invalid > 80 ? 'text-red-600' : ''"/><p id="capacity-error" class="text-sm" :class="invalid > 80 ? 'text-red-600' : 'text-gray-500'">{{ invalid > 80 ? 'Your plan allows up to 80%. Choose a lower value.' : 'Within your team’s capacity.' }}</p></section>
          <section class="dark rounded-2xl bg-gray-950 px-6 py-5 text-white"><div class="flex justify-between text-sm font-medium"><label for="state-dark">After hours</label><output>{{dark}}%</output></div><Slider id="state-dark" v-model="dark"/><p class="text-sm text-gray-400">Same control. A different atmosphere.</p></section>
          <section dir="rtl" class="py-5"><div class="flex justify-between text-sm font-medium"><span id="rtl-label">نطاق السعر</span><output class="tabular-nums">{{rtl[0]}} – {{rtl[1]}}</output></div><Slider v-model="rtl" aria-labelledby="rtl-label" :labels="['الحد الأدنى', 'الحد الأقصى']"/><p class="text-sm text-gray-500">Direction follows the surrounding page.</p></section>
        </div>
      </main>`,
  }),
};
