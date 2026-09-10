import { ref } from "vue";
import Chips from "../src/vue/chips/Chips.vue";
export default {
  title: "Components/Chips",
  component: Chips,
  parameters: { layout: "centered" },
};
export const Playground = {
  render: () => ({
    components: { Chips },
    setup() {
      return { values: ref(["Design", "Build"]) };
    },
    template:
      '<div class="w-80"><label for="chips-demo">Steps</label><Chips id="chips-demo" v-model="values" placeholder="Add value, press Enter" class="border-b border-dashed p-2" /></div>',
  }),
};
