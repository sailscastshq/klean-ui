import { expect, test } from "@rstest/core";
import { mount } from "@vue/test-utils";
import { h, nextTick } from "vue";
import Slide from "../src/vue/slide/Slide.vue";

function setGeometry(wrapper, width = 224, thumbWidth = 36) {
  Object.defineProperty(wrapper.element, "clientWidth", {
    configurable: true,
    value: width,
  });
  Object.defineProperty(
    wrapper.get('[data-slot="slide-thumb"]').element,
    "offsetWidth",
    {
      configurable: true,
      value: thumbWidth,
    },
  );
}

function installPointerCapture(element) {
  const captured = new Set();
  element.setPointerCapture = (pointerId) => captured.add(pointerId);
  element.hasPointerCapture = (pointerId) => captured.has(pointerId);
  element.releasePointerCapture = (pointerId) => captured.delete(pointerId);
  return captured;
}

function pointer(type, options = {}) {
  return new PointerEvent(type, {
    bubbles: true,
    cancelable: true,
    pointerId: options.pointerId ?? 1,
    pointerType: options.pointerType ?? "mouse",
    isPrimary: options.isPrimary ?? true,
    button: options.button ?? 0,
    clientX: options.clientX ?? 0,
  });
}

function mountSlide(options = {}) {
  const wrapper = mount(Slide, {
    props: options.props,
    attrs: options.attrs,
    slots: {
      default: options.label ?? "Slide to continue",
      ...options.slots,
    },
    attachTo: document.body,
  });
  setGeometry(wrapper, options.width, options.thumbWidth);
  const captured = installPointerCapture(wrapper.element);
  return { wrapper, captured };
}

test("keeps the arrow by default and supports product-owned thumb content", async () => {
  const standard = mountSlide();
  expect(standard.wrapper.get('[data-slot="slide-thumb"] svg').exists()).toBe(
    true,
  );
  standard.wrapper.unmount();

  const states = [];
  const custom = mountSlide({
    props: { pending: true },
    slots: {
      thumb: ({ pending, progress }) => {
        states.push({ pending, progress });
        return h("span", { "data-product-mark": "true" }, "Working");
      },
    },
  });

  expect(custom.wrapper.find('[data-slot="slide-thumb"] svg').exists()).toBe(
    false,
  );
  expect(custom.wrapper.get("[data-product-mark]").text()).toBe("Working");
  expect(states.at(-1)).toEqual({ pending: true, progress: "complete" });

  await custom.wrapper.setProps({ pending: false });
  expect(states.at(-1)).toEqual({ pending: false, progress: "start" });
  custom.wrapper.unmount();
});

async function drag(wrapper, from, to, type = "pointerup") {
  wrapper.element.dispatchEvent(pointer("pointerdown", { clientX: from }));
  wrapper.element.dispatchEvent(pointer("pointermove", { clientX: to }));
  wrapper.element.dispatchEvent(pointer(type, { clientX: to }));
  await nextTick();
}

test("renders one named native button with ordinary attributes", () => {
  const { wrapper } = mountSlide({
    attrs: {
      name: "intent",
      value: "deploy",
      "aria-describedby": "deploy-help",
      class: "w-80 rounded-none shadow-none",
    },
  });

  expect(wrapper.element.tagName).toBe("BUTTON");
  expect(wrapper.attributes("type")).toBe("button");
  expect(wrapper.attributes("name")).toBe("intent");
  expect(wrapper.attributes("value")).toBe("deploy");
  expect(wrapper.attributes("aria-describedby")).toBe("deploy-help");
  expect(wrapper.attributes("data-slot")).toBe("slide");
  expect(wrapper.classes()).toContain("w-80");
  expect(wrapper.classes()).toContain("rounded-none");
  expect(wrapper.classes()).toContain("shadow-none");
  expect(wrapper.classes()).not.toContain("w-56");
  expect(wrapper.classes()).not.toContain("rounded-full");
  expect(wrapper.classes()).not.toContain("shadow-sm");
  wrapper.unmount();
});

test("confirms only after pointer release beyond the conventional threshold", async () => {
  const cancelled = mountSlide();
  await drag(cancelled.wrapper, 0, 80);
  expect(cancelled.wrapper.emitted("confirm")).toBeUndefined();
  expect(cancelled.wrapper.attributes("data-progress")).toBe("start");
  expect(cancelled.wrapper.text()).toContain("Slide cancelled.");
  cancelled.wrapper.unmount();

  const confirmed = mountSlide();
  confirmed.wrapper.element.focus();
  await drag(confirmed.wrapper, 0, 220);
  expect(confirmed.wrapper.emitted("confirm")).toHaveLength(1);
  expect(document.activeElement).toBe(confirmed.wrapper.element);

  confirmed.wrapper.element.click();
  await nextTick();
  expect(confirmed.wrapper.emitted("confirm")).toHaveLength(2);
  confirmed.wrapper.unmount();
});

test("cancels an interrupted pointer gesture without emitting", async () => {
  for (const interruption of ["pointercancel", "lostpointercapture"]) {
    const { wrapper } = mountSlide();
    wrapper.element.dispatchEvent(pointer("pointerdown", { clientX: 0 }));
    wrapper.element.dispatchEvent(pointer("pointermove", { clientX: 220 }));
    wrapper.element.dispatchEvent(pointer(interruption, { clientX: 220 }));
    await nextTick();

    expect(wrapper.emitted("confirm")).toBeUndefined();
    expect(wrapper.attributes("data-state")).toBe("idle");
    expect(wrapper.attributes("data-progress")).toBe("start");
    wrapper.unmount();
  }
});

test("Escape cancels while preserving focus", async () => {
  const { wrapper } = mountSlide();
  wrapper.element.dispatchEvent(pointer("pointerdown", { clientX: 0 }));
  wrapper.element.dispatchEvent(pointer("pointermove", { clientX: 220 }));
  wrapper.element.dispatchEvent(
    new KeyboardEvent("keydown", {
      bubbles: true,
      cancelable: true,
      key: "Escape",
    }),
  );
  await nextTick();

  expect(wrapper.emitted("confirm")).toBeUndefined();
  expect(wrapper.attributes("data-state")).toBe("idle");
  expect(document.activeElement).toBe(wrapper.element);
  wrapper.unmount();
});

test("native keyboard and assistive activation confirms without sliding", async () => {
  const { wrapper } = mountSlide();
  wrapper.element.click();
  await nextTick();

  expect(wrapper.emitted("confirm")).toHaveLength(1);

  await wrapper.trigger("click", { detail: 1 });
  expect(wrapper.emitted("confirm")).toHaveLength(1);
  wrapper.unmount();
});

test("pending is caller-owned, busy, aria-disabled, and resets truthfully", async () => {
  let clicks = 0;
  const { wrapper } = mountSlide({
    props: { pending: true },
    attrs: { onClick: () => (clicks += 1) },
  });

  wrapper.element.focus();
  expect(wrapper.attributes("disabled")).toBeUndefined();
  expect(wrapper.attributes("aria-busy")).toBe("true");
  expect(wrapper.attributes("aria-disabled")).toBe("true");
  expect(wrapper.attributes("data-state")).toBe("pending");
  expect(wrapper.attributes("data-progress")).toBe("complete");

  wrapper.element.click();
  expect(wrapper.emitted("confirm")).toBeUndefined();
  expect(clicks).toBe(0);
  expect(document.activeElement).toBe(wrapper.element);

  await wrapper.setProps({ pending: false });
  expect(wrapper.attributes("disabled")).toBeUndefined();
  expect(wrapper.attributes("aria-disabled")).toBeUndefined();
  expect(wrapper.attributes("data-state")).toBe("idle");
  expect(wrapper.attributes("data-progress")).toBe("start");
  expect(document.activeElement).toBe(wrapper.element);
  wrapper.unmount();
});

test("uses live measured geometry and logical RTL direction", async () => {
  const ltr = mountSlide({ width: 224, thumbWidth: 36 });
  ltr.wrapper.element.dispatchEvent(pointer("pointerdown", { clientX: 0 }));
  setGeometry(ltr.wrapper, 424, 36);
  ltr.wrapper.element.dispatchEvent(pointer("pointermove", { clientX: 200 }));
  await nextTick();
  expect(ltr.wrapper.attributes("data-progress")).toBe("middle");
  ltr.wrapper.element.dispatchEvent(pointer("pointercancel", { clientX: 200 }));
  ltr.wrapper.unmount();

  const rtl = mountSlide({ attrs: { dir: "rtl" } });
  await drag(rtl.wrapper, 220, 0);
  expect(rtl.wrapper.emitted("confirm")).toHaveLength(1);
  rtl.wrapper.unmount();
});

test("disconnects its ResizeObserver when removed", () => {
  const OriginalResizeObserver = globalThis.ResizeObserver;
  let disconnected = false;
  globalThis.ResizeObserver = class {
    observe() {}
    disconnect() {
      disconnected = true;
    }
  };

  const { wrapper } = mountSlide();
  wrapper.unmount();
  globalThis.ResizeObserver = OriginalResizeObserver;

  expect(disconnected).toBe(true);
});
