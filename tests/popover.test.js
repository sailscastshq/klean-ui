import { expect, test } from "@rstest/core";
import { mount } from "@vue/test-utils";
import { h, nextTick } from "vue";
import Popover from "../src/vue/popover/Popover.vue";

async function settle() {
  await nextTick();
  await Promise.resolve();
}

async function mountPopover(options = {}) {
  const host = document.createElement("div");
  const trigger = document.createElement("button");
  const anchor = options.anchorId
    ? document.createElement("input")
    : undefined;
  const id = options.id ?? "test-popover";
  let cleanupRoot = host;

  trigger.type = "button";
  trigger.textContent = options.triggerText ?? "Filters";
  trigger.setAttribute("popovertarget", id);
  if (options.action)
    trigger.setAttribute("popovertargetaction", options.action);
  if (anchor) {
    anchor.id = options.anchorId;
    host.append(anchor);
  }
  host.append(trigger);

  if (options.shadow) {
    const shadowHost = document.createElement("div");
    const shadowRoot = shadowHost.attachShadow({ mode: "open" });
    shadowRoot.append(host);
    document.body.append(shadowHost);
    cleanupRoot = shadowHost;
  } else {
    document.body.append(host);
  }

  const wrapper = mount(Popover, {
    attachTo: host,
    props: { id, ...(options.props ?? {}) },
    attrs: options.attrs,
    slots: options.slots ?? { default: "Choose the visible records." },
  });
  await settle();

  return {
    wrapper,
    anchor,
    trigger,
    cleanup() {
      wrapper.unmount();
      cleanupRoot.remove();
    },
  };
}

test("can position from a field without replacing the native invoker", async () => {
  const { wrapper, anchor, trigger, cleanup } = await mountPopover({
    anchorId: "filter-field",
    props: { anchor: "filter-field", defaultOpen: true },
  });

  expect(wrapper.props("anchor")).toBe("filter-field");
  expect(trigger.getAttribute("aria-expanded")).toBe("true");

  anchor.dispatchEvent(
    new PointerEvent("pointerdown", { bubbles: true, composed: true }),
  );
  await settle();

  expect(trigger.getAttribute("aria-expanded")).toBe("true");
  cleanup();
});

test("uses native invoker semantics and a generic non-modal surface", async () => {
  const { wrapper, trigger, cleanup } = await mountPopover();
  const content = wrapper.get('[data-slot="popover-content"]');

  expect(trigger.attributes).toBeDefined();
  expect(trigger.type).toBe("button");
  expect(trigger.getAttribute("aria-expanded")).toBe("false");
  expect(trigger.getAttribute("aria-controls")).toBe(content.attributes("id"));
  expect(trigger.getAttribute("popovertarget")).toBe(content.attributes("id"));
  expect(content.attributes("role")).toBeUndefined();
  expect(content.attributes("hidden")).toBe("");
  cleanup();
});

test("opens from popovertarget without application state and light dismisses", async () => {
  const { wrapper, trigger, cleanup } = await mountPopover();

  trigger.click();
  await settle();

  expect(trigger.getAttribute("aria-expanded")).toBe("true");
  expect(
    wrapper.get('[data-slot="popover-content"]').attributes("hidden"),
  ).toBeUndefined();

  document.body.dispatchEvent(
    new PointerEvent("pointerdown", { bubbles: true, composed: true }),
  );
  await settle();

  expect(trigger.getAttribute("aria-expanded")).toBe("false");
  cleanup();
});

test("keeps the native invoker relationship inside an isolated shadow root", async () => {
  const { wrapper, trigger, cleanup } = await mountPopover({ shadow: true });
  const content = wrapper.get('[data-slot="popover-content"]');

  expect(trigger.getAttribute("aria-controls")).toBe(content.attributes("id"));

  trigger.dispatchEvent(
    new MouseEvent("click", { bubbles: true, composed: true }),
  );
  await settle();

  expect(trigger.getAttribute("aria-expanded")).toBe("true");

  content.element.dispatchEvent(
    new PointerEvent("pointerdown", { bubbles: true, composed: true }),
  );
  await settle();

  expect(trigger.getAttribute("aria-expanded")).toBe("true");

  document.body.dispatchEvent(
    new PointerEvent("pointerdown", { bubbles: true, composed: true }),
  );
  await settle();

  expect(trigger.getAttribute("aria-expanded")).toBe("false");
  cleanup();
});

test("Escape closes and returns focus to the native invoker", async () => {
  const { wrapper, trigger, cleanup } = await mountPopover({
    props: { defaultOpen: true },
  });

  wrapper.get('[data-slot="popover-content"]').element.focus();
  document.dispatchEvent(
    new KeyboardEvent("keydown", { key: "Escape", bubbles: true }),
  );
  await settle();

  expect(trigger.getAttribute("aria-expanded")).toBe("false");
  expect(document.activeElement).toBe(trigger);
  cleanup();
});

test("the content slot can explicitly close and recover focus", async () => {
  const { wrapper, trigger, cleanup } = await mountPopover({
    props: { defaultOpen: true },
    slots: {
      default: ({ close }) =>
        h("button", { type: "button", onClick: close }, "Apply"),
    },
  });

  await wrapper.get("button").trigger("click");
  await settle();

  expect(trigger.getAttribute("aria-expanded")).toBe("false");
  expect(document.activeElement).toBe(trigger);
  cleanup();
});

test("a native hide invoker returns focus to the opening button", async () => {
  const { wrapper, trigger, cleanup } = await mountPopover({
    props: { defaultOpen: true },
    slots: {
      default: () =>
        h(
          "button",
          {
            type: "button",
            popovertarget: "test-popover",
            popovertargetaction: "hide",
          },
          "Done",
        ),
    },
  });
  const dismiss = wrapper.get("button").element;
  const toggle = new Event("toggle");

  Object.defineProperties(toggle, {
    newState: { value: "closed" },
    source: { value: dismiss },
  });

  dismiss.focus();
  wrapper.get('[data-slot="popover-content"]').element.dispatchEvent(toggle);
  await settle();

  expect(trigger.getAttribute("aria-expanded")).toBe("false");
  expect(document.activeElement).toBe(trigger);
  cleanup();
});

test("ordinary classes own the Popover surface", async () => {
  const { wrapper, cleanup } = await mountPopover({
    attrs: { class: "w-80 rounded-xl p-8 shadow-none" },
  });
  const contentClasses = wrapper.get('[data-slot="popover-content"]').classes();

  expect(contentClasses).toContain("w-80");
  expect(contentClasses).toContain("rounded-xl");
  expect(contentClasses).toContain("p-8");
  expect(contentClasses).toContain("shadow-none");
  expect(contentClasses).not.toContain("rounded-md");
  expect(contentClasses).not.toContain("p-4");
  expect(contentClasses).not.toContain("shadow-lg");
  cleanup();
});

test("controlled state emits intent without inventing persistence", async () => {
  const { wrapper, trigger, cleanup } = await mountPopover({
    props: { open: false },
  });

  trigger.click();
  await settle();

  expect(wrapper.emitted("update:open")).toEqual([[true]]);
  expect(trigger.getAttribute("aria-expanded")).toBe("false");
  cleanup();
});
