import { afterEach, beforeEach, expect, test } from "@rstest/core";
import { mount } from "@vue/test-utils";
import { h, nextTick } from "vue";
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
  expect(viewport.attributes("aria-label")).toBe("Notifications");
  expect(viewport.attributes("aria-live")).toBe("polite");
  expect(viewport.attributes("data-position")).toBe("bottom-left");
  expect(viewport.attributes("style")).toContain(
    "--klean-toast-enter-y: calc(100% + 1.25rem)",
  );
  expect(viewport.attributes("style")).toContain(
    "--klean-toast-leave-x: calc(-100% - 1.25rem)",
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
  ).toContain("--klean-toast-enter-x: calc(-100% - 1.25rem)");

  left.unmount();
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
