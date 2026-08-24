import { afterEach, beforeEach, expect, test } from "@rstest/core";
import { mount } from "@vue/test-utils";
import { h, nextTick } from "vue";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import Toast from "../src/vue/toast/Toast.vue";
import { createToast } from "../src/vue/toast/toast.js";

let now;
let nextTimer;
let tasks;
let realSetTimeout;
let realClearTimeout;
let realDateNow;

function advance(milliseconds) {
  const end = now + milliseconds;

  while (true) {
    const next = [...tasks.entries()]
      .filter(([, task]) => task.at <= end)
      .sort((a, b) => a[1].at - b[1].at || a[0] - b[0])[0];

    if (!next) break;
    const [id, task] = next;
    tasks.delete(id);
    now = task.at;
    task.callback();
  }

  now = end;
}

beforeEach(() => {
  now = 0;
  nextTimer = 0;
  tasks = new Map();
  realSetTimeout = globalThis.setTimeout;
  realClearTimeout = globalThis.clearTimeout;
  realDateNow = Date.now;

  globalThis.setTimeout = (callback, delay = 0) => {
    const id = ++nextTimer;
    tasks.set(id, { at: now + Number(delay), callback });
    return id;
  };
  globalThis.clearTimeout = (id) => tasks.delete(id);
  Date.now = () => now;
});

afterEach(() => {
  globalThis.setTimeout = realSetTimeout;
  globalThis.clearTimeout = realClearTimeout;
  Date.now = realDateNow;
  document.body.innerHTML = "";
});

test("offers a provider-free callable API with update and dismissal methods", () => {
  const controller = createToast({ duration: 1000 });
  const snapshots = [];
  const unsubscribe = controller.subscribe(() =>
    snapshots.push(controller.getSnapshot()),
  );

  const id = controller("Deploying production", {
    class: "border-blue-500",
    deploymentId: "dep-42",
  });

  expect(id).toBe("toast-1");
  expect(controller.getSnapshot()[0]).toMatchObject({
    id,
    message: "Deploying production",
    class: "border-blue-500",
    deploymentId: "dep-42",
    state: "entering",
  });

  expect(controller.completeEnter(id)).toBe(true);
  expect(controller.update(id, { title: "Live", duration: false })).toBe(true);
  expect(controller.getSnapshot()[0]).toMatchObject({
    title: "Live",
    duration: 0,
    state: "open",
  });
  advance(5000);
  expect(controller.getSnapshot()).toHaveLength(1);

  expect(controller.dismiss(id)).toBe(true);
  expect(controller.getSnapshot()[0].state).toBe("closing");
  controller.remove(id);
  expect(controller.getSnapshot()).toEqual([]);
  expect(new Set(snapshots).size).toBe(snapshots.length);

  unsubscribe();
  controller.destroy();
});

test("pauses the remaining duration for every active interaction reason", () => {
  const controller = createToast({ duration: 1000 });
  const id = controller({ title: "Saved" });
  controller.completeEnter(id);

  advance(400);
  controller.pause(id, "hover");
  controller.pause(id, "focus");
  advance(2000);
  expect(controller.getSnapshot()[0].state).toBe("open");

  controller.resume(id, "hover");
  advance(1000);
  expect(controller.getSnapshot()[0].state).toBe("open");

  controller.resume(id, "focus");
  advance(599);
  expect(controller.getSnapshot()[0].state).toBe("open");
  advance(1);
  expect(controller.getSnapshot()[0].state).toBe("closing");
  advance(450);
  expect(controller.getSnapshot()).toEqual([]);
  controller.destroy();
});

test("bounds the live stack without discarding exit motion", () => {
  const controller = createToast({ duration: false, max: 2 });
  const first = controller("First");
  controller("Second");
  controller("Third");

  expect(controller.getSnapshot()).toHaveLength(3);
  expect(controller.getSnapshot()[0]).toMatchObject({
    id: first,
    state: "closing",
  });
  expect(
    controller.getSnapshot().filter((item) => item.state !== "closing"),
  ).toHaveLength(2);

  advance(450);
  expect(controller.getSnapshot().map((item) => item.message)).toEqual([
    "Second",
    "Third",
  ]);
  controller.destroy();
});

test("renders a persistent, named live region with caller-owned Tailwind", async () => {
  const controller = createToast({ duration: false });
  const wrapper = mount(Toast, {
    attachTo: document.body,
    props: {
      controller,
      position: "bottom-left",
      from: "bottom",
      to: "left",
      class: "max-w-sm",
    },
  });

  const id = controller({
    title: "Deployment live",
    message: "production.example.com",
    class: "rounded-none border-2 border-black shadow-none",
  });
  await nextTick();

  const viewport = wrapper.get('[data-slot="toast-viewport"]');
  const item = wrapper.get('[data-slot="toast"]');
  expect(viewport.element.tagName).toBe("SECTION");
  expect(viewport.attributes("popover")).toBe("manual");
  expect(viewport.classes()).toContain("inset-auto");
  expect(viewport.attributes("aria-label")).toBe("Notifications");
  expect(viewport.attributes("aria-live")).toBe("polite");
  expect(viewport.attributes("data-position")).toBe("bottom-left");
  expect(viewport.attributes("style")).toContain(
    "--klean-toast-enter-y: calc(100% + 1rem)",
  );
  expect(viewport.attributes("style")).toContain(
    "--klean-toast-leave-x: calc(-100% - 1rem)",
  );
  expect(viewport.attributes("style")).toContain(
    "--klean-toast-enter-duration: 300ms",
  );
  expect(viewport.attributes("style")).toContain(
    "--klean-toast-leave-duration: 200ms",
  );
  expect(item.classes()).toContain("rounded-none");
  expect(item.classes()).toContain("border-2");
  expect(item.classes()).toContain("shadow-none");
  expect(item.classes()).not.toContain("rounded-lg");
  expect(item.classes()).not.toContain("shadow-lg");
  expect(wrapper.text()).toContain("Deployment live");
  expect(
    wrapper.get('button[data-slot="toast-dismiss"]').attributes("type"),
  ).toBe("button");

  item.element.dispatchEvent(new Event("animationend", { bubbles: true }));
  await nextTick();
  expect(controller.getSnapshot()[0].state).toBe("open");

  controller.dismiss(id);
  await nextTick();
  item.element.dispatchEvent(new Event("animationend", { bubbles: true }));
  await nextTick();
  expect(controller.getSnapshot()).toEqual([]);

  wrapper.unmount();
  controller.destroy();
});

test("opens the persistent viewport in the native top layer and closes it on teardown", () => {
  const showDescriptor = Object.getOwnPropertyDescriptor(
    HTMLElement.prototype,
    "showPopover",
  );
  const hideDescriptor = Object.getOwnPropertyDescriptor(
    HTMLElement.prototype,
    "hidePopover",
  );
  let opened = 0;
  let closed = 0;

  Object.defineProperty(HTMLElement.prototype, "showPopover", {
    configurable: true,
    value() {
      opened += 1;
    },
  });
  Object.defineProperty(HTMLElement.prototype, "hidePopover", {
    configurable: true,
    value() {
      closed += 1;
    },
  });

  try {
    const controller = createToast({ duration: false });
    const wrapper = mount(Toast, { props: { controller } });
    expect(opened).toBe(1);
    wrapper.unmount();
    expect(closed).toBe(1);
    controller.destroy();
  } finally {
    if (showDescriptor) {
      Object.defineProperty(
        HTMLElement.prototype,
        "showPopover",
        showDescriptor,
      );
    } else {
      delete HTMLElement.prototype.showPopover;
    }
    if (hideDescriptor) {
      Object.defineProperty(
        HTMLElement.prototype,
        "hidePopover",
        hideDescriptor,
      );
    } else {
      delete HTMLElement.prototype.hidePopover;
    }
  }
});

test("keeps the native top-layer contract aligned across frameworks", () => {
  for (const file of [
    "registry/toast/vue/Toast.vue",
    "registry/toast/react/Toast.jsx",
    "registry/toast/svelte/Toast.svelte",
  ]) {
    const source = readFileSync(resolve(file), "utf8");
    expect(source).toContain('popover="manual"');
    expect(source).toContain("showPopover");
    expect(source).toContain("hidePopover");
    expect(source).toContain("inset-auto");
  }
});

test("keeps default motion on the nearest horizontal edge", () => {
  const controller = createToast({ duration: false });
  const left = mount(Toast, {
    props: { controller, position: "top-left" },
  });

  expect(left.get('[data-slot="toast-viewport"]').attributes("data-from")).toBe(
    "left",
  );
  expect(left.get('[data-slot="toast-viewport"]').attributes("data-to")).toBe(
    "left",
  );
  expect(
    left.get('[data-slot="toast-viewport"]').attributes("style"),
  ).toContain("--klean-toast-enter-x: calc(-100% - 1rem)");

  left.unmount();
  controller.destroy();
});

test("gives cross-viewport travel enough time without slowing nearby motion", () => {
  const controller = createToast({ duration: false });
  const wrapper = mount(Toast, {
    props: {
      controller,
      position: "top-right",
      from: "left",
      to: "bottom",
    },
  });

  const style = wrapper.get('[data-slot="toast-viewport"]').attributes("style");
  expect(style).toContain("--klean-toast-enter-x: -100vw");
  expect(style).toContain("--klean-toast-leave-y: 100dvh");
  expect(style).toContain("--klean-toast-enter-duration: 450ms");
  expect(style).toContain("--klean-toast-leave-duration: 320ms");

  wrapper.unmount();
  controller.destroy();
});

test("renders semantic actions and dismisses after activation", async () => {
  const controller = createToast({ duration: false });
  let actionCalls = 0;
  const wrapper = mount(Toast, {
    attachTo: document.body,
    props: { controller },
  });

  const linkId = controller({
    title: "Draft saved",
    action: { label: "View draft", href: "#draft" },
  });
  await nextTick();
  const link = wrapper.get('a[data-slot="toast-action"]');
  expect(link.attributes("href")).toBe("#draft");
  await link.trigger("click");
  expect(
    controller.getSnapshot().find((item) => item.id === linkId)?.state,
  ).toBe("closing");

  controller.remove(linkId);
  controller({
    title: "Connection lost",
    action: {
      label: "Retry",
      onClick() {
        actionCalls += 1;
      },
    },
  });
  await nextTick();
  const button = wrapper.get('button[data-slot="toast-action"]');
  expect(button.attributes("type")).toBe("button");
  await button.trigger("click");
  expect(actionCalls).toBe(1);
  expect(controller.getSnapshot()[0].state).toBe("closing");

  wrapper.unmount();
  controller.destroy();
});

test("lets applications replace the complete toast body", async () => {
  const controller = createToast({ duration: false });
  const wrapper = mount(Toast, {
    attachTo: document.body,
    props: { controller },
    slots: {
      default: ({ item, dismiss }) =>
        h("button", { type: "button", onClick: dismiss }, item.status),
    },
  });

  controller({ status: "Building image" });
  await nextTick();
  expect(wrapper.text()).toBe("Building image");
  await wrapper.get("button").trigger("click");
  expect(controller.getSnapshot()[0].state).toBe("closing");

  wrapper.unmount();
  controller.destroy();
});
