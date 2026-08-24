import { parse } from "@babel/parser";
import { expect, test } from "@rstest/core";
import { mount } from "@vue/test-utils";
import { compile } from "svelte/compiler";
import { h, nextTick } from "vue";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import RowActions from "../src/vue/row-actions/RowActions.vue";

async function settle() {
  await nextTick();
  await Promise.resolve();
  await nextTick();
}

function mountActions({
  busy = false,
  class: className,
  menu = true,
  onDelete = () => {},
} = {}) {
  const host = document.createElement("div");
  let rowClicks = 0;
  host.addEventListener("click", () => {
    rowClicks += 1;
  });
  document.body.append(host);

  const wrapper = mount(RowActions, {
    attachTo: host,
    props: {
      id: "invoice-actions",
      label: "Actions for invoice INV-1042",
      busy,
    },
    attrs: className ? { class: className } : undefined,
    slots: {
      default: () =>
        h(
          "a",
          {
            href: "/invoices/INV-1042",
            "data-test": "visible-action",
          },
          "View",
        ),
      ...(menu
        ? {
            menu: () => [
              h(
                "a",
                { href: "/invoices/INV-1042/edit", "data-test": "edit" },
                "Edit",
              ),
              h(
                "button",
                {
                  type: "button",
                  "data-test": "delete",
                  onClick: onDelete,
                },
                "Delete",
              ),
            ],
          }
        : {}),
    },
  });

  return {
    wrapper,
    rowClicks: () => rowClicks,
    cleanup() {
      wrapper.unmount();
      host.remove();
    },
  };
}

test("keeps visible links native and labels one compact action group", async () => {
  const { wrapper, cleanup } = mountActions();
  await settle();

  const root = wrapper.get('[data-slot="row-actions"]');
  const visible = wrapper.get('[data-test="visible-action"]');
  const trigger = wrapper.get('[data-slot="row-actions-trigger"]');
  const menu = wrapper.get("[data-row-actions-menu]");

  expect(root.attributes("role")).toBe("group");
  expect(root.attributes("aria-label")).toBe("Actions for invoice INV-1042");
  expect(visible.element.tagName).toBe("A");
  expect(visible.attributes("href")).toBe("/invoices/INV-1042");
  expect(trigger.attributes("aria-controls")).toBe("invoice-actions");
  expect(trigger.attributes("aria-haspopup")).toBe("menu");
  expect(menu.attributes("role")).toBe("menu");
  expect(menu.attributes("aria-label")).toBe("Actions for invoice INV-1042");
  expect(
    wrapper.findAll('[role="menuitem"]').map((item) => item.element.tagName),
  ).toEqual(["A", "BUTTON"]);
  cleanup();
});

test("isolates links, buttons, and overflow interaction from the row", async () => {
  const { wrapper, rowClicks, cleanup } = mountActions();
  await wrapper.get('[data-test="visible-action"]').trigger("click");
  await wrapper.get('[data-slot="row-actions-trigger"]').trigger("click");
  await wrapper.get('[data-test="edit"]').trigger("click");

  expect(rowClicks()).toBe(0);
  cleanup();
});

test("inherits Menu keyboard behavior and restores trigger focus", async () => {
  let deletes = 0;
  const { wrapper, cleanup } = mountActions({
    onDelete: () => {
      deletes += 1;
    },
  });
  await settle();

  const trigger = wrapper.get('[data-slot="row-actions-trigger"]');
  trigger.element.dispatchEvent(
    new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }),
  );
  await settle();

  const edit = wrapper.get('[data-test="edit"]');
  expect(document.activeElement).toBe(edit.element);
  edit.element.dispatchEvent(
    new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }),
  );
  expect(document.activeElement).toBe(
    wrapper.get('[data-test="delete"]').element,
  );

  await wrapper.get('[data-test="delete"]').trigger("click");
  await settle();
  expect(deletes).toBe(1);
  expect(trigger.attributes("aria-expanded")).toBe("false");
  expect(document.activeElement).toBe(trigger.element);
  cleanup();
});

test("busy truth closes overflow without disabling caller-owned visible actions", async () => {
  const { wrapper, cleanup } = mountActions();
  await settle();
  const trigger = wrapper.get('[data-slot="row-actions-trigger"]');

  trigger.element.dispatchEvent(
    new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }),
  );
  await settle();
  expect(trigger.attributes("aria-expanded")).toBe("true");

  await wrapper.setProps({ busy: true });
  await settle();
  expect(wrapper.get('[data-slot="row-actions"]').attributes("aria-busy")).toBe(
    "true",
  );
  expect(trigger.attributes()).toHaveProperty("disabled");
  expect(trigger.attributes("aria-expanded")).toBe("false");
  expect(
    wrapper.get('[data-test="visible-action"]').attributes("aria-disabled"),
  ).toBeUndefined();
  cleanup();
});

test("omits overflow when unused and lets caller Tailwind classes win", () => {
  const { wrapper, cleanup } = mountActions({
    menu: false,
    class: "gap-4 rounded-none",
  });
  const root = wrapper.get('[data-slot="row-actions"]');

  expect(wrapper.find('[data-slot="row-actions-trigger"]').exists()).toBe(
    false,
  );
  expect(root.classes()).toContain("gap-4");
  expect(root.classes()).not.toContain("gap-1");
  expect(root.classes()).toContain("rounded-none");
  cleanup();
});

test("ships valid idiomatic React and Svelte ports without an action schema", () => {
  const react = readFileSync(
    resolve("registry/row-actions/react/RowActions.jsx"),
    "utf8",
  );
  const svelte = readFileSync(
    resolve("registry/row-actions/svelte/RowActions.svelte"),
    "utf8",
  );
  const vue = readFileSync(
    resolve("registry/row-actions/vue/RowActions.vue"),
    "utf8",
  );

  expect(() =>
    parse(react, { sourceType: "module", plugins: ["jsx"] }),
  ).not.toThrow();
  expect(
    compile(svelte, { filename: "RowActions.svelte", generate: false })
      .warnings,
  ).toEqual([]);
  expect(vue).toBe(
    readFileSync(resolve("src/vue/row-actions/RowActions.vue"), "utf8"),
  );

  for (const source of [vue, react, svelte]) {
    expect(source).not.toMatch(/actions\s*=/);
    expect(source).not.toMatch(/\bvariant\b/i);
    expect(source).not.toMatch(/permission|authorize/i);
    expect(source).toContain("row-actions");
  }
});
