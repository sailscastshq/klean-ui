import { expect, test } from "@rstest/core";
import { mount } from "@vue/test-utils";
import { h, nextTick } from "vue";
import Dialog from "../src/vue/dialog/Dialog.vue";

async function settle() {
  await nextTick();
  await Promise.resolve();
  await nextTick();
}

async function mountDialog(options = {}) {
  const host = document.createElement("div");
  const trigger = document.createElement("button");
  const id = options.id ?? "delete-project";

  trigger.type = "button";
  trigger.textContent = "Delete project";
  trigger.setAttribute("commandfor", id);
  trigger.setAttribute("command", "show-modal");
  host.append(trigger);
  document.body.append(host);

  const wrapper = mount(Dialog, {
    attachTo: host,
    props: { id, ...(options.props ?? {}) },
    attrs: {
      "aria-labelledby": "dialog-title",
      ...(options.attrs ?? {}),
    },
    slots: {
      default: () => [
        h("h2", { id: "dialog-title" }, "Delete project?"),
        h("button", { type: "button", autofocus: true }, "Cancel"),
      ],
    },
  });
  await settle();

  return {
    wrapper,
    trigger,
    dialog: wrapper.get("dialog"),
    async cleanup() {
      wrapper.unmount();
      host.remove();
      await settle();
    },
  };
}

test("renders one native, named dialog with consumer-owned markup", async () => {
  const { dialog, cleanup } = await mountDialog({
    attrs: { class: "max-w-sm rounded-none p-4 shadow-none" },
  });

  expect(dialog.element.tagName).toBe("DIALOG");
  expect(dialog.attributes("aria-labelledby")).toBe("dialog-title");
  expect(dialog.attributes("closedby")).toBe("any");
  expect(dialog.attributes("data-slot")).toBe("dialog");
  expect(dialog.attributes("data-state")).toBe("closed");
  expect(dialog.classes()).toContain("max-w-sm");
  expect(dialog.classes()).toContain("rounded-none");
  expect(dialog.classes()).toContain("p-4");
  expect(dialog.classes()).toContain("shadow-none");
  expect(dialog.classes()).not.toContain("max-w-lg");
  expect(dialog.classes()).not.toContain("rounded-lg");
  expect(dialog.classes()).not.toContain("p-6");
  expect(dialog.classes()).not.toContain("shadow-xl");
  await cleanup();
});

test("supports declarative command buttons without a trigger component", async () => {
  const { wrapper, trigger, dialog, cleanup } = await mountDialog();

  trigger.focus();
  trigger.click();
  await settle();

  expect(dialog.element.open).toBe(true);
  expect(dialog.attributes("data-state")).toBe("open");
  expect(wrapper.emitted("update:open")).toEqual([[true]]);

  wrapper.vm.close("cancel");
  await settle();

  expect(dialog.element.open).toBe(false);
  expect(dialog.element.returnValue).toBe("cancel");
  expect(dialog.attributes("data-state")).toBe("closed");
  expect(document.activeElement).toBe(trigger);
  await cleanup();
});

test("keeps ambient dismissal separate from explicit close", async () => {
  const { wrapper, trigger, dialog, cleanup } = await mountDialog({
    props: { dismissible: false },
  });

  trigger.click();
  await settle();
  expect(dialog.attributes("closedby")).toBe("none");

  const cancelEvent = new Event("cancel", { cancelable: true });
  dialog.element.dispatchEvent(cancelEvent);
  await settle();

  expect(cancelEvent.defaultPrevented).toBe(true);
  expect(dialog.element.open).toBe(true);

  wrapper.vm.close("complete");
  await settle();
  expect(dialog.element.open).toBe(false);
  expect(dialog.element.returnValue).toBe("complete");
  await cleanup();
});

test("falls back to durable backdrop dismissal when closedby is unavailable", async () => {
  const { trigger, dialog, cleanup } = await mountDialog();
  trigger.click();
  await settle();

  dialog.element.getBoundingClientRect = () => ({
    left: 100,
    right: 500,
    top: 100,
    bottom: 400,
  });
  dialog.element.dispatchEvent(
    new MouseEvent("click", {
      bubbles: true,
      cancelable: true,
      clientX: 20,
      clientY: 20,
    }),
  );
  await settle();

  expect(dialog.element.open).toBe(false);
  await cleanup();
});

test("controlled state restores scroll and the exact external invoker", async () => {
  document.documentElement.style.overflow = "clip";
  const { wrapper, trigger, dialog, cleanup } = await mountDialog({
    props: { open: false },
  });

  trigger.focus();
  await wrapper.setProps({ open: true });
  await settle();
  expect(dialog.element.open).toBe(true);
  expect(document.documentElement.style.overflow).toBe("hidden");

  await wrapper.setProps({ open: false });
  await settle();
  expect(dialog.element.open).toBe(false);
  expect(document.documentElement.style.overflow).toBe("clip");
  expect(document.activeElement).toBe(trigger);

  document.documentElement.style.overflow = "";
  await cleanup();
});
