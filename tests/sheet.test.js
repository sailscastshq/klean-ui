import { expect, test } from "@rstest/core";
import { mount } from "@vue/test-utils";
import { h, nextTick } from "vue";
import Sheet from "../src/vue/sheet/Sheet.vue";

async function settle() {
  await nextTick();
  await Promise.resolve();
  await nextTick();
}

async function mountSheet(options = {}) {
  const host = document.createElement("div");
  const trigger = document.createElement("button");
  const id = options.id ?? "project-sheet";

  trigger.type = "button";
  trigger.textContent = "Open project";
  trigger.setAttribute("commandfor", id);
  trigger.setAttribute("command", "show-modal");
  host.append(trigger);
  document.body.append(host);

  const wrapper = mount(Sheet, {
    attachTo: host,
    props: { id, ...(options.props ?? {}) },
    attrs: {
      "aria-labelledby": "sheet-title",
      ...(options.attrs ?? {}),
    },
    slots: {
      default: () => [
        h("h2", { id: "sheet-title" }, "Project details"),
        h("button", { type: "button", autofocus: true }, "Close"),
      ],
    },
  });
  await settle();

  return {
    wrapper,
    trigger,
    sheet: wrapper.get("dialog"),
    async cleanup() {
      wrapper.unmount();
      host.remove();
      await settle();
    },
  };
}

test("renders a native right-side sheet with caller-owned semantics", async () => {
  const { sheet, cleanup } = await mountSheet();

  expect(sheet.element.tagName).toBe("DIALOG");
  expect(sheet.attributes("aria-labelledby")).toBe("sheet-title");
  expect(sheet.attributes("data-slot")).toBe("dialog");
  expect(sheet.attributes("data-klean-sheet")).toBe("");
  expect(sheet.classes()).toContain("right-0");
  expect(sheet.classes()).toContain("left-auto");
  expect(sheet.classes()).toContain("h-dvh");
  expect(sheet.classes()).toContain("translate-x-full");
  expect(sheet.classes()).toContain("open:translate-x-0");
  expect(sheet.classes()).toContain("transition-discrete");
  expect(sheet.classes()).toContain("motion-reduce:transition-none");
  await cleanup();
});

test("opens through native commands and returns focus after dismissal", async () => {
  const { wrapper, trigger, sheet, cleanup } = await mountSheet();

  trigger.focus();
  trigger.click();
  await settle();
  expect(sheet.element.open).toBe(true);
  expect(wrapper.emitted("update:open")).toEqual([[true]]);

  wrapper.vm.requestClose("done");
  await settle();
  expect(sheet.element.open).toBe(false);
  expect(sheet.element.returnValue).toBe("done");
  expect(document.activeElement).toBe(trigger);
  await cleanup();
});

test("uses Tailwind classes instead of a side configuration API", async () => {
  const { sheet, cleanup } = await mountSheet({
    attrs: {
      class:
        "right-auto left-0 mr-auto ml-0 -translate-x-full border-r border-l-0 open:translate-x-0 starting:open:-translate-x-full",
    },
  });

  expect(sheet.classes()).toContain("right-auto");
  expect(sheet.classes()).toContain("left-0");
  expect(sheet.classes()).toContain("mr-auto");
  expect(sheet.classes()).toContain("-translate-x-full");
  expect(sheet.classes()).toContain("border-r");
  expect(sheet.classes()).not.toContain("right-0");
  expect(sheet.classes()).not.toContain("left-auto");
  expect(sheet.classes()).not.toContain("translate-x-full");
  expect(sheet.classes()).not.toContain("border-l");
  await cleanup();
});

test("observes controlled state and restores document scrolling", async () => {
  document.documentElement.style.overflow = "clip";
  const { wrapper, sheet, cleanup } = await mountSheet({
    props: { open: false },
  });

  await wrapper.setProps({ open: true });
  await settle();
  expect(sheet.element.open).toBe(true);
  expect(document.documentElement.style.overflow).toBe("hidden");

  await wrapper.setProps({ open: false });
  await settle();
  expect(sheet.element.open).toBe(false);
  expect(document.documentElement.style.overflow).toBe("clip");

  document.documentElement.style.overflow = "";
  await cleanup();
});
