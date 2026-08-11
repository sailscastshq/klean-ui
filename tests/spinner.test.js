import { expect, test } from "@rstest/core";
import { mount } from "@vue/test-utils";
import Spinner from "../src/vue/spinner/Spinner.vue";

test("renders a decorative wrapper with a non-focusable fallback mark", () => {
  const wrapper = mount(Spinner);
  const mark = wrapper.get('[data-slot="spinner-mark"]');

  expect(wrapper.element.tagName.toLowerCase()).toBe("span");
  expect(wrapper.attributes("data-slot")).toBe("spinner");
  expect(wrapper.attributes("aria-hidden")).toBe("true");
  expect(wrapper.attributes("role")).toBeUndefined();
  expect(mark.element.tagName.toLowerCase()).toBe("svg");
  expect(mark.attributes("aria-hidden")).toBe("true");
  expect(mark.attributes("focusable")).toBe("false");
  expect(wrapper.findAll("circle")).toHaveLength(1);
  expect(wrapper.findAll("path")).toHaveLength(1);
});

test("uses currentColor and respects reduced motion without JavaScript", () => {
  const wrapper = mount(Spinner);

  expect(wrapper.find("circle").attributes("stroke")).toBe("currentColor");
  expect(wrapper.find("path").attributes("stroke")).toBe("currentColor");
  expect(wrapper.classes()).toContain("animate-spin");
  expect(wrapper.classes()).toContain("motion-reduce:animate-none!");
  expect(wrapper.classes()).toContain("motion-reduce:**:animate-none!");
});

test("keeps accessibility semantics fixed while forwarding ordinary attributes", () => {
  const wrapper = mount(Spinner, {
    attrs: {
      id: "deployment-spinner",
      role: "status",
      "aria-hidden": "false",
      focusable: "true",
      tabindex: "0",
      "data-slot": "custom-spinner",
    },
  });

  expect(wrapper.attributes("id")).toBe("deployment-spinner");
  expect(wrapper.attributes("role")).toBeUndefined();
  expect(wrapper.attributes("aria-hidden")).toBe("true");
  expect(wrapper.attributes("focusable")).toBeUndefined();
  expect(wrapper.attributes("tabindex")).toBeUndefined();
  expect(wrapper.attributes("data-slot")).toBe("spinner");
});

test("lets caller Tailwind classes replace size and animation defaults", () => {
  const wrapper = mount(Spinner, {
    attrs: {
      class: "size-8 animate-pulse text-sky-600",
    },
  });

  expect(wrapper.classes()).toContain("size-8");
  expect(wrapper.classes()).toContain("animate-pulse");
  expect(wrapper.classes()).toContain("text-sky-600");
  expect(wrapper.classes()).not.toContain("size-4");
  expect(wrapper.classes()).not.toContain("animate-spin");
  expect(wrapper.classes()).toContain("motion-reduce:animate-none!");
});

test("lets a product-owned mark fill the wrapper without adding a second animation", () => {
  const wrapper = mount(Spinner, {
    attrs: { class: "size-5 text-white" },
    slots: {
      default:
        '<svg data-product-loader="slippy" class="slippy-loader" viewBox="0 0 32 32"></svg>',
    },
  });

  expect(wrapper.classes()).toContain("size-5");
  expect(wrapper.classes()).toContain("text-white");
  expect(wrapper.classes()).toContain("*:size-full");
  expect(wrapper.classes()).not.toContain("animate-spin");
  expect(wrapper.get('[data-product-loader="slippy"]').exists()).toBe(true);
  expect(wrapper.find('[data-slot="spinner-mark"]').exists()).toBe(false);
});

test("does not expose visual variants or application loading state", () => {
  const props = Spinner.props ?? {};

  expect(props).not.toHaveProperty("variant");
  expect(props).not.toHaveProperty("tone");
  expect(props).not.toHaveProperty("size");
  expect(props).not.toHaveProperty("speed");
  expect(props).not.toHaveProperty("loading");
  expect(Spinner.emits).toBeUndefined();
});
