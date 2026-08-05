import { expect, test } from "@rstest/core";
import { mount } from "@vue/test-utils";
import { defineComponent, nextTick, ref } from "vue";
import Field from "../src/vue/field/Field.vue";
import Input from "../src/vue/input/Input.vue";
import Label from "../src/vue/label/Label.vue";
import Textarea from "../src/vue/textarea/Textarea.vue";

const FormFixture = defineComponent({
  components: {
    Field,
    Input,
    Textarea,
  },
  props: {
    invalid: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
  },
  setup() {
    const email = ref("");
    const note = ref("");
    return { email, note };
  },
  template: `
    <div>
      <Field
        id="account-email"
        name="email"
        label="Email address"
        description="Used for account messages."
        :error="invalid ? 'Enter a valid address.' : undefined"
        required
        :invalid="invalid"
        :disabled="disabled"
      >
        <Input
          v-model="email"
          id="ignored-child-control-id"
          type="email"
          autocomplete="email"
          aria-describedby="external-help"
        />
      </Field>

      <Field name="note" label="Note">
        <Textarea v-model="note" rows="4" />
      </Field>
    </div>
  `,
});

test("wires native label, control, description, and error semantics", async () => {
  const wrapper = mount(FormFixture, { props: { invalid: true } });
  await nextTick();

  const field = wrapper.find('[data-slot="field"]');
  const label = field.find("label");
  const input = field.find("input");
  const description = field.find('[data-slot="field-description"]');
  const error = field.find('[data-slot="field-error"]');
  const describedBy = input.attributes("aria-describedby").split(" ");

  expect(label.attributes("for")).toBe("account-email");
  expect(input.attributes("id")).toBe("account-email");
  expect(input.attributes("name")).toBe("email");
  expect(input.attributes("required")).toBe("");
  expect(input.attributes("aria-invalid")).toBe("true");
  expect(describedBy).toContain("external-help");
  expect(describedBy).toContain(description.attributes("id"));
  expect(describedBy).toContain(error.attributes("id"));
  expect(new Set(describedBy).size).toBe(describedBy.length);
  expect(error.attributes("role")).toBeUndefined();
});

test("removes stale error relationships when the application clears an error", async () => {
  const wrapper = mount(FormFixture, { props: { invalid: true } });
  await wrapper.setProps({ invalid: false });

  const input = wrapper.find("input");
  const describedBy = input.attributes("aria-describedby").split(" ");

  expect(wrapper.find('[data-slot="field-error"]').exists()).toBe(false);
  expect(input.attributes("aria-invalid")).toBeUndefined();
  expect(describedBy).toEqual([
    "external-help",
    wrapper.find('[data-slot="field-description"]').attributes("id"),
  ]);
});

test("inherits a disabled state without replacing native semantics", () => {
  const wrapper = mount(FormFixture, { props: { disabled: true } });
  const field = wrapper.find('[data-slot="field"]');

  expect(field.attributes("data-disabled")).toBe("");
  expect(field.find("label").attributes("data-disabled")).toBe("");
  expect(field.find("input").attributes("disabled")).toBe("");
  expect(field.find("input").attributes("data-disabled")).toBe("");
});

test("keeps Vue form values application owned", async () => {
  const wrapper = mount(FormFixture);
  const input = wrapper.find("input");
  const textarea = wrapper.find("textarea");

  await input.setValue("kelvin@sailscasts.com");
  await textarea.setValue("Ship native primitives.");

  expect(wrapper.vm.email).toBe("kelvin@sailscasts.com");
  expect(wrapper.vm.note).toBe("Ship native primitives.");
});

test("keeps every primitive useful without Field", () => {
  const label = mount(Label, {
    props: { for: "search" },
    slots: { default: "Search" },
  });
  const input = mount(Input, {
    props: { id: "search", name: "query" },
    attrs: {
      placeholder: "Find a project",
      class: "min-h-9 rounded-none border-2 text-sm shadow-none",
    },
  });
  const textarea = mount(Textarea, {
    props: { id: "summary", name: "summary" },
    attrs: { class: "min-h-40 resize-y" },
  });

  expect(label.element.tagName).toBe("LABEL");
  expect(label.attributes("for")).toBe("search");
  expect(input.element.tagName).toBe("INPUT");
  expect(input.attributes("id")).toBe("search");
  expect(input.attributes("placeholder")).toBe("Find a project");
  expect(input.classes()).toContain("min-h-9");
  expect(input.classes()).toContain("rounded-none");
  expect(input.classes()).not.toContain("min-h-11");
  expect(input.classes()).not.toContain("rounded-md");
  expect(textarea.element.tagName).toBe("TEXTAREA");
  expect(textarea.classes()).toContain("min-h-40");
  expect(textarea.classes()).toContain("resize-y");
  expect(textarea.classes()).not.toContain("resize-none");
});

test("uses touch-safe neutral defaults without a visual variant API", () => {
  const input = mount(Input);
  const textarea = mount(Textarea);

  expect(input.classes()).toContain("min-h-11");
  expect(input.classes()).toContain("text-base");
  expect(textarea.classes()).toContain("min-h-28");
  expect(textarea.classes()).toContain("resize-none");
  expect(Input.props).not.toHaveProperty("variant");
  expect(Input.props).not.toHaveProperty("size");
  expect(Textarea.props).not.toHaveProperty("variant");
  expect(Field.props).not.toHaveProperty("orientation");
});

test("grows Textarea from its current value without an autoGrow prop", async () => {
  const wrapper = mount(Textarea);
  Object.defineProperty(wrapper.element, "scrollHeight", {
    configurable: true,
    value: 184,
  });

  await wrapper.trigger("input");

  expect(
    wrapper.element.style.getPropertyValue("--klean-textarea-height"),
  ).toBe("184px");
  expect(wrapper.classes()).toContain("h-[var(--klean-textarea-height)]");
  expect(wrapper.classes()).toContain("overflow-y-hidden");
  expect(Textarea.props).not.toHaveProperty("autoGrow");
});
