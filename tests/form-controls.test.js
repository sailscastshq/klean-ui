import { expect, test } from "@rstest/core";
import { mount } from "@vue/test-utils";
import { defineComponent, ref } from "vue";
import Input from "../src/vue/input/Input.vue";
import Textarea from "../src/vue/textarea/Textarea.vue";

const NativeFormFixture = defineComponent({
  components: { Input, Textarea },
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
      <div class="grid gap-2">
        <label for="account-email">Email address</label>
        <Input
          id="account-email"
          v-model="email"
          name="email"
          type="email"
          autocomplete="email"
          required
          :disabled="disabled"
          :aria-invalid="invalid"
          aria-describedby="account-email-help account-email-error"
        />
        <p id="account-email-help">Used for account messages.</p>
        <p id="account-email-error" class="empty:hidden">
          {{ invalid ? 'Enter a valid address.' : '' }}
        </p>
      </div>

      <div class="grid gap-2">
        <label for="account-note">Note</label>
        <Textarea id="account-note" v-model="note" name="note" rows="4" />
      </div>
    </div>
  `,
});

test("keeps native form relationships explicit and untouched", () => {
  const wrapper = mount(NativeFormFixture, { props: { invalid: true } });
  const input = wrapper.find("input");
  const error = wrapper.find("#account-email-error");

  expect(wrapper.find('label[for="account-email"]').exists()).toBe(true);
  expect(input.attributes("id")).toBe("account-email");
  expect(input.attributes("name")).toBe("email");
  expect(input.attributes("required")).toBe("");
  expect(input.attributes("aria-invalid")).toBe("true");
  expect(input.attributes("aria-describedby")).toBe(
    "account-email-help account-email-error",
  );
  expect(error.attributes("role")).toBeUndefined();
});

test("keeps the relationship stable when the application clears an error", async () => {
  const wrapper = mount(NativeFormFixture, { props: { invalid: true } });
  await wrapper.setProps({ invalid: false });

  const error = wrapper.find("#account-email-error");

  expect(error.exists()).toBe(true);
  expect(error.text()).toBe("");
  expect(error.classes()).toContain("empty:hidden");
  expect(wrapper.find("input").attributes("aria-invalid")).toBe("false");
  expect(wrapper.find("input").attributes("aria-describedby")).toBe(
    "account-email-help account-email-error",
  );
});

test("forwards native disabled semantics without inventing field state", () => {
  const wrapper = mount(NativeFormFixture, { props: { disabled: true } });
  const input = wrapper.find("input");

  expect(input.attributes("disabled")).toBe("");
  expect(input.attributes("data-disabled")).toBeUndefined();
});

test("keeps Vue form values application owned", async () => {
  const wrapper = mount(NativeFormFixture);

  await wrapper.find("input").setValue("kelvin@sailscasts.com");
  await wrapper.find("textarea").setValue("Ship native controls.");

  expect(wrapper.vm.email).toBe("kelvin@sailscasts.com");
  expect(wrapper.vm.note).toBe("Ship native controls.");
});

test("forwards native attributes and lets caller Tailwind win", () => {
  const input = mount(Input, {
    attrs: {
      id: "search",
      name: "query",
      placeholder: "Find a project",
      "aria-describedby": "search-help",
      class: "min-h-9 rounded-none border-2 text-sm shadow-none",
    },
  });
  const textarea = mount(Textarea, {
    attrs: {
      id: "summary",
      name: "summary",
      class: "h-40 resize-y overflow-y-auto",
    },
  });

  expect(input.element.tagName).toBe("INPUT");
  expect(input.attributes("id")).toBe("search");
  expect(input.attributes("aria-describedby")).toBe("search-help");
  expect(input.classes()).toContain("min-h-9");
  expect(input.classes()).toContain("rounded-none");
  expect(input.classes()).not.toContain("min-h-11");
  expect(input.classes()).not.toContain("rounded-md");
  expect(textarea.element.tagName).toBe("TEXTAREA");
  expect(textarea.classes()).toContain("h-40");
  expect(textarea.classes()).toContain("resize-y");
  expect(textarea.classes()).not.toContain("h-(--klean-textarea-height)");
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
  expect(Textarea.props).not.toHaveProperty("autoGrow");
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
  expect(wrapper.classes()).toContain("h-(--klean-textarea-height)");
  expect(wrapper.classes()).toContain("overflow-y-hidden");
});
