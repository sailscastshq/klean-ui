import { expect, test } from "@rstest/core";
import { mount } from "@vue/test-utils";
import { defineComponent, nextTick, ref } from "vue";
import Radio from "../src/vue/radio/Radio.vue";

const RegionFixture = defineComponent({
  components: { Radio },
  setup() {
    const region = ref("lagos");
    return { region };
  },
  template: `
    <form>
      <fieldset>
        <legend>Deployment region</legend>
        <label><Radio v-model="region" name="region" value="lagos" required /> Lagos</label>
        <label><Radio v-model="region" name="region" value="frankfurt" required /> Frankfurt</label>
        <label><Radio v-model="region" name="region" value="virginia" required /> Virginia</label>
      </fieldset>
    </form>
  `,
});

test("renders native radios without recreating group semantics", () => {
  const wrapper = mount(RegionFixture);
  const radios = wrapper.findAll("input");

  expect(radios).toHaveLength(3);
  expect(radios[0].attributes("type")).toBe("radio");
  expect(radios[0].attributes("name")).toBe("region");
  expect(radios[0].attributes("required")).toBe("");
  expect(radios[0].attributes("data-slot")).toBe("radio");
  expect(radios[0].attributes("role")).toBeUndefined();
  expect(radios[0].attributes("aria-checked")).toBeUndefined();
  expect(Radio.props).not.toHaveProperty("variant");
  expect(Radio.props).not.toHaveProperty("size");
  expect(Radio.props).not.toHaveProperty("tone");
  expect(Radio.props).not.toHaveProperty("orientation");
});

test("uses one scalar Vue v-model and native mutual exclusion", async () => {
  const wrapper = mount(RegionFixture);
  const [lagos, frankfurt, virginia] = wrapper.findAll("input");

  expect(wrapper.vm.region).toBe("lagos");
  expect(lagos.element.checked).toBe(true);
  expect(lagos.attributes("data-state")).toBe("checked");

  await frankfurt.setValue(true);

  expect(wrapper.vm.region).toBe("frankfurt");
  expect(lagos.element.checked).toBe(false);
  expect(frankfurt.element.checked).toBe(true);
  expect(virginia.element.checked).toBe(false);
  expect(lagos.attributes("data-state")).toBe("unchecked");
  expect(frankfurt.attributes("data-state")).toBe("checked");
});

test("submits the checked native value and satisfies required validation", async () => {
  const wrapper = mount(RegionFixture);
  const form = wrapper.find("form").element;
  const radios = wrapper.findAll("input");

  await radios[2].setValue(true);

  expect(new FormData(form).get("region")).toBe("virginia");
  expect(radios[0].element.validity.valueMissing).toBe(false);
});

test("preserves typed Vue values used by real application choices", async () => {
  const fixture = defineComponent({
    components: { Radio },
    setup() {
      const anonymous = ref(false);
      return { anonymous };
    },
    template: `
      <fieldset>
        <legend>Participation</legend>
        <label><Radio v-model="anonymous" name="participation" :value="false" /> Members</label>
        <label><Radio v-model="anonymous" name="participation" :value="true" /> Anyone</label>
      </fieldset>
    `,
  });
  const wrapper = mount(fixture);
  const radios = wrapper.findAll("input");

  expect(radios[0].element.checked).toBe(true);
  await radios[1].setValue(true);
  expect(wrapper.vm.anonymous).toBe(true);
});

test("forwards native attributes while caller Tailwind classes win", () => {
  const wrapper = mount(Radio, {
    props: { modelValue: "team" },
    attrs: {
      id: "team-plan",
      name: "plan",
      value: "team",
      disabled: true,
      required: true,
      "aria-invalid": "true",
      "aria-describedby": "plan-error",
      class: "size-5 text-emerald-700 focus-visible:outline-emerald-700",
    },
  });

  expect(wrapper.attributes("id")).toBe("team-plan");
  expect(wrapper.attributes("name")).toBe("plan");
  expect(wrapper.attributes("value")).toBe("team");
  expect(wrapper.attributes("disabled")).toBe("");
  expect(wrapper.attributes("required")).toBe("");
  expect(wrapper.attributes("aria-describedby")).toBe("plan-error");
  expect(wrapper.attributes("data-disabled")).toBe("");
  expect(wrapper.attributes("data-invalid")).toBe("");
  expect(wrapper.classes()).toContain("size-5");
  expect(wrapper.classes()).toContain("text-emerald-700");
  expect(wrapper.classes()).not.toContain("size-4");
  expect(wrapper.classes()).not.toContain("text-gray-950");
});

test("keeps native form reset and the Vue model in agreement", async () => {
  const wrapper = mount(RegionFixture);
  const radios = wrapper.findAll("input");

  await radios[2].setValue(true);
  expect(wrapper.vm.region).toBe("virginia");

  wrapper.find("form").element.reset();
  await Promise.resolve();
  await nextTick();

  expect(wrapper.vm.region).toBe("lagos");
  expect(radios[0].element.checked).toBe(true);
  expect(radios[2].element.checked).toBe(false);
  expect(radios[0].attributes("data-state")).toBe("checked");
  expect(radios[2].attributes("data-state")).toBe("unchecked");
});
