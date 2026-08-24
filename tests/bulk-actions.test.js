import { parse } from "@babel/parser";
import { expect, test } from "@rstest/core";
import { mount } from "@vue/test-utils";
import { compile } from "svelte/compiler";
import { defineComponent, nextTick, ref } from "vue";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import BulkActions from "../src/vue/bulk-actions/BulkActions.vue";

async function settle() {
  await nextTick();
  await Promise.resolve();
  await nextTick();
}

function registrySource(framework, filename) {
  return readFileSync(
    resolve(`registry/bulk-actions/${framework}/${filename}`),
    "utf8",
  );
}

test("renders nothing without a caller-owned selection", async () => {
  const wrapper = mount(BulkActions, { props: { count: 0 } });
  expect(wrapper.find('[data-slot="bulk-actions"]').exists()).toBe(false);

  await wrapper.setProps({ count: -4 });
  expect(wrapper.find('[data-slot="bulk-actions"]').exists()).toBe(false);
});

test("names one live selected-record action region with native caller actions", () => {
  const wrapper = mount(BulkActions, {
    props: { count: 3, label: "Actions for selected invoices" },
    slots: {
      default:
        '<a href="/invoices/export">Export</a><button type="button">Archive</button>',
    },
  });

  const root = wrapper.get('[data-slot="bulk-actions"]');
  const summary = wrapper.get('[data-slot="bulk-actions-summary"]');

  expect(root.attributes("role")).toBe("region");
  expect(root.attributes("aria-label")).toBe("Actions for selected invoices");
  expect(summary.attributes("role")).toBe("status");
  expect(summary.attributes("aria-live")).toBe("polite");
  expect(summary.attributes("aria-atomic")).toBe("true");
  expect(summary.text()).toBe("3 selected");
  expect(wrapper.get("a").attributes("href")).toBe("/invoices/export");
  expect(wrapper.get("button:not([data-slot])").attributes("type")).toBe(
    "button",
  );
  expect(wrapper.get('[data-slot="bulk-actions-clear"]').text()).toBe(
    "Clear selection",
  );
});

test("clears caller selection and restores focus only from the disappearing region", async () => {
  const Parent = defineComponent({
    components: { BulkActions },
    setup() {
      const count = ref(2);
      return { count };
    },
    template: `
      <div>
        <input type="checkbox" data-bulk-actions-focus aria-label="Select all invoices on this page" />
        <BulkActions :count="count" @clear="count = 0">
          <button type="button">Export</button>
        </BulkActions>
      </div>
    `,
  });
  const wrapper = mount(Parent, { attachTo: document.body });
  const focusTarget = wrapper.get("[data-bulk-actions-focus]");
  const clear = wrapper.get('[data-slot="bulk-actions-clear"]');

  clear.element.focus();
  expect(document.activeElement).toBe(clear.element);
  await clear.trigger("click");
  await settle();

  expect(wrapper.find('[data-slot="bulk-actions"]').exists()).toBe(false);
  expect(document.activeElement).toBe(focusTarget.element);
  wrapper.unmount();
});

test("keeps busy truth narrow and leaves caller actions caller-owned", async () => {
  let clears = 0;
  const wrapper = mount(BulkActions, {
    props: {
      count: 12,
      busy: true,
      onClear: () => {
        clears += 1;
      },
    },
    slots: {
      default: '<button type="button" data-test="export">Export</button>',
    },
  });

  const root = wrapper.get('[data-slot="bulk-actions"]');
  const clear = wrapper.get('[data-slot="bulk-actions-clear"]');
  const callerAction = wrapper.get('[data-test="export"]');

  expect(root.attributes("aria-busy")).toBe("true");
  expect(clear.attributes()).toHaveProperty("disabled");
  expect(callerAction.attributes("disabled")).toBeUndefined();
  await clear.trigger("click");
  expect(clears).toBe(0);

  await wrapper.setProps({ busy: false });
  await clear.trigger("click");
  expect(clears).toBe(1);
});

test("supports product copy and lets caller Tailwind classes win", () => {
  const wrapper = mount(BulkActions, {
    props: { count: 2.9, clearLabel: "Keep none" },
    attrs: { class: "min-h-16 gap-5 rounded-none border-black shadow-none" },
    slots: {
      summary: ({ count }) => `${count} invoices chosen`,
    },
  });
  const root = wrapper.get('[data-slot="bulk-actions"]');

  expect(wrapper.get('[data-slot="bulk-actions-summary"]').text()).toBe(
    "2 invoices chosen",
  );
  expect(wrapper.get('[data-slot="bulk-actions-clear"]').text()).toBe(
    "Keep none",
  );
  for (const className of [
    "min-h-16",
    "gap-5",
    "rounded-none",
    "border-black",
    "shadow-none",
  ]) {
    expect(root.classes()).toContain(className);
  }
  for (const className of [
    "min-h-12",
    "gap-3",
    "rounded-lg",
    "border-gray-200",
    "shadow-sm",
  ]) {
    expect(root.classes()).not.toContain(className);
  }
});

test("ships framework-native ports without IDs, action schemas, or variants", () => {
  const vue = registrySource("vue", "BulkActions.vue");
  const react = registrySource("react", "BulkActions.jsx");
  const svelte = registrySource("svelte", "BulkActions.svelte");

  expect(vue).toBe(
    readFileSync(resolve("src/vue/bulk-actions/BulkActions.vue"), "utf8"),
  );
  expect(() =>
    parse(react, { sourceType: "module", plugins: ["jsx"] }),
  ).not.toThrow();
  expect(
    compile(svelte, { filename: "BulkActions.svelte", generate: false })
      .warnings,
  ).toEqual([]);
  expect(react).toContain("latestCount.current > 0");

  for (const source of [vue, react, svelte]) {
    expect(source).toContain('data-slot="bulk-actions"');
    expect(source).toContain("data-bulk-actions-focus");
    expect(source).not.toMatch(/selectedIds|recordIds|modelValue|selected\s*=/);
    expect(source).not.toMatch(
      /\bactions\s*(?::|=(?!=))|permission|authorize/i,
    );
    expect(source).not.toMatch(/\bvariant\b/i);
    expect(source).not.toMatch(/localStorage|sessionStorage|URLSearchParams/);
  }
});
