import { expect, test } from "@rstest/core";
import { mount } from "@vue/test-utils";
import { defineComponent, h } from "vue";
import Button from "../src/vue/button/Button.vue";

test("renders a safe native button by default", () => {
  const wrapper = mount(Button, {
    slots: { default: "Save changes" },
  });

  expect(wrapper.element.tagName).toBe("BUTTON");
  expect(wrapper.attributes("type")).toBe("button");
  expect(wrapper.attributes("data-slot")).toBe("button");
  expect(wrapper.text()).toBe("Save changes");
});

test("forwards native form, data, and aria attributes", () => {
  const wrapper = mount(Button, {
    props: { type: "submit" },
    attrs: {
      name: "intent",
      value: "save",
      "data-test": "save-button",
      "aria-label": "Save invoice",
    },
  });

  expect(wrapper.attributes("type")).toBe("submit");
  expect(wrapper.attributes("name")).toBe("intent");
  expect(wrapper.attributes("value")).toBe("save");
  expect(wrapper.attributes("data-test")).toBe("save-button");
  expect(wrapper.attributes("aria-label")).toBe("Save invoice");
});

test("forwards native click listeners", async () => {
  let clickCount = 0;
  const wrapper = mount(Button, {
    attrs: {
      onClick: () => {
        clickCount += 1;
      },
    },
  });

  await wrapper.trigger("click");

  expect(clickCount).toBe(1);
});

test("uses native disabled semantics for buttons", async () => {
  let clickCount = 0;
  const wrapper = mount(Button, {
    props: { disabled: true },
    attrs: {
      onClick: () => {
        clickCount += 1;
      },
    },
  });

  await wrapper.trigger("click");

  expect(wrapper.attributes("disabled")).toBe("");
  expect(wrapper.attributes("data-disabled")).toBe("");
  expect(clickCount).toBe(0);
});

test("renders an enabled anchor without button attributes", () => {
  const wrapper = mount(Button, {
    props: { as: "a" },
    attrs: { href: "/docs" },
  });

  expect(wrapper.element.tagName).toBe("A");
  expect(wrapper.attributes("href")).toBe("/docs");
  expect(wrapper.attributes("type")).toBeUndefined();
  expect(wrapper.attributes("aria-disabled")).toBeUndefined();
  expect(wrapper.classes()).toContain("no-underline");
});

test("renders a Boring Stack Link component with anchor semantics", () => {
  const BoringStackLink = defineComponent({
    inheritAttrs: false,
    setup(_, { attrs, slots }) {
      return () =>
        h("a", { ...attrs, "data-boring-stack-link": "" }, slots.default?.());
    },
  });

  const wrapper = mount(Button, {
    props: { as: BoringStackLink },
    attrs: { href: "/projects", prefetch: "" },
    slots: { default: "View projects" },
  });

  expect(wrapper.element.tagName).toBe("A");
  expect(wrapper.attributes("href")).toBe("/projects");
  expect(wrapper.attributes("prefetch")).toBe("");
  expect(wrapper.attributes("type")).toBeUndefined();
  expect(wrapper.attributes("data-boring-stack-link")).toBe("");
  expect(wrapper.text()).toBe("View projects");
});

test("makes a disabled anchor unfocusable and non-activatable", async () => {
  let clickCount = 0;
  let keydownCount = 0;
  const wrapper = mount(Button, {
    props: { as: "a", disabled: true },
    attrs: {
      href: "/billing",
      onClick: () => {
        clickCount += 1;
      },
      onKeydown: () => {
        keydownCount += 1;
      },
    },
  });

  await wrapper.trigger("click");
  await wrapper.trigger("keydown", { key: "Enter" });
  await wrapper.trigger("keydown", { key: "Tab" });

  expect(wrapper.attributes("aria-disabled")).toBe("true");
  expect(wrapper.attributes("tabindex")).toBe("-1");
  expect(clickCount).toBe(0);
  expect(keydownCount).toBe(1);
});

test("merges caller classes last across the visual surface", () => {
  const wrapper = mount(Button, {
    attrs: {
      class:
        "min-h-14 rounded-full bg-amber-400 px-8 text-lg text-gray-950 shadow-xl",
    },
  });

  const classes = wrapper.attributes("class").split(" ");

  expect(classes).toContain("min-h-14");
  expect(classes).toContain("rounded-full");
  expect(classes).toContain("bg-amber-400");
  expect(classes).toContain("px-8");
  expect(classes).toContain("text-lg");
  expect(classes).toContain("text-gray-950");
  expect(classes).toContain("shadow-xl");
  expect(classes).not.toContain("min-h-11");
  expect(classes).not.toContain("rounded-md");
  expect(classes).not.toContain("bg-gray-950");
  expect(classes).not.toContain("px-4");
  expect(classes).not.toContain("text-sm");
  expect(classes).not.toContain("text-white");
});

test("keeps icon and label anatomy in the default slot", () => {
  const wrapper = mount(Button, {
    slots: {
      default:
        '<svg aria-hidden="true" data-test="icon"></svg><span>Deploy</span>',
    },
  });

  expect(wrapper.find('[data-test="icon"]').exists()).toBe(true);
  expect(wrapper.text()).toBe("Deploy");
});

test("keeps product motion out of the base button", () => {
  const wrapper = mount(Button);
  const classes = wrapper.attributes("class").split(" ");

  expect(classes).toContain("active:bg-gray-700");
  expect(
    classes.some((className) => className.startsWith("active:translate")),
  ).toBe(false);
  expect(
    classes.some((className) => className.startsWith("active:scale")),
  ).toBe(false);
});
