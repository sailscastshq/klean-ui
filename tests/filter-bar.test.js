import { parse } from "@babel/parser";
import { expect, test } from "@rstest/core";
import { mount } from "@vue/test-utils";
import { compile } from "svelte/compiler";
import { defineComponent, nextTick, ref } from "vue";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import FilterBar from "../src/vue/filter-bar/FilterBar.vue";
import {
  filterUrl,
  filtersFromUrl,
  stableFilters,
} from "../src/vue/filter-bar/filterState.js";

function mountFilterBar({ initial = { status: "active" }, busy = false } = {}) {
  const value = ref(initial);
  const pending = ref(busy);
  const events = [];
  const Harness = defineComponent({
    components: { FilterBar },
    setup() {
      return { events, pending, value };
    },
    template: `
      <FilterBar
        v-model="value"
        :busy="pending"
        @apply="events.push(['apply', $event])"
        @remove="events.push(['remove', $event])"
        @clear="events.push(['clear', $event])"
        v-slot="filter"
      >
        <label for="status-filter">Status</label>
        <input
          id="status-filter"
          :value="filter.draft.status || ''"
          @input="filter.update('status', $event.currentTarget.value)"
        />
        <button v-bind="filter.applyAttrs">Apply</button>
        <button v-bind="filter.cancelAttrs">Cancel</button>
        <button v-bind="filter.clearAttrs">Clear all</button>
        <button
          type="button"
          data-test="replace-draft"
          @click="filter.setDraft((current) => ({
            ...current,
            region: 'lag',
            status: 'review'
          }))"
        >
          Replace draft
        </button>
        <button
          v-for="([key, entry]) in filter.entries"
          :key="key"
          v-bind="filter.removeAttrs(key, 'Remove ' + key)"
        >
          {{ key }}: {{ entry }}
        </button>
      </FilterBar>
    `,
  });
  const wrapper = mount(Harness, { attachTo: document.body });
  return { events, pending, value, wrapper };
}

test("keeps draft edits separate until the native form is submitted", async () => {
  const { events, value, wrapper } = mountFilterBar();
  const input = wrapper.get("input");

  await input.setValue("paused");
  expect(value.value).toEqual({ status: "active" });
  expect(wrapper.get("form").attributes()).toHaveProperty("data-dirty");

  await wrapper.get('button[type="submit"]').trigger("submit");
  expect(value.value).toEqual({ status: "paused" });
  expect(events).toEqual([["apply", { status: "paused" }]]);
  expect(wrapper.get("form").attributes()).not.toHaveProperty("data-dirty");
  wrapper.unmount();
});

test("uses native reset to cancel a draft without changing committed state", async () => {
  const { value, wrapper } = mountFilterBar();
  await wrapper.get("input").setValue("paused");
  await wrapper.get('button[type="reset"]').trigger("reset");

  expect(value.value).toEqual({ status: "active" });
  expect(wrapper.get("input").element.value).toBe("active");
  wrapper.unmount();
});

test("replaces the whole Vue draft without committing caller-owned state", async () => {
  const initial = { status: "active" };
  const { value, wrapper } = mountFilterBar({ initial });

  await wrapper.get('[data-test="replace-draft"]').trigger("click");

  expect(value.value).toEqual({ status: "active" });
  expect(initial).toEqual({ status: "active" });
  expect(wrapper.get("input").element.value).toBe("review");

  await wrapper.get('button[type="submit"]').trigger("submit");
  expect(value.value).toEqual({ region: "lag", status: "review" });
  wrapper.unmount();
});

test("removes one active filter immediately and restores useful focus", async () => {
  const { events, value, wrapper } = mountFilterBar({
    initial: { status: "active", region: "iad" },
  });
  const removeStatus = wrapper.get('[aria-label="Remove status"]');
  removeStatus.element.focus();
  await removeStatus.trigger("click");
  await nextTick();

  expect(value.value).toEqual({ region: "iad" });
  expect(events).toEqual([["remove", { region: "iad" }]]);
  expect(document.activeElement).toBe(
    wrapper.get('[aria-label="Remove region"]').element,
  );
  wrapper.unmount();
});

test("clear all commits an empty filter object and announces the count", async () => {
  const { events, value, wrapper } = mountFilterBar();
  await wrapper.get("[data-filter-clear]").trigger("click");

  expect(value.value).toEqual({});
  expect(events).toEqual([["clear", {}]]);
  expect(wrapper.get('[aria-live="polite"]').text()).toBe("0 active filters.");
  wrapper.unmount();
});

test("pending state keeps committed filters visible and prevents duplicates", async () => {
  const { pending, value, wrapper } = mountFilterBar({ busy: true });
  expect(wrapper.get("form").attributes("aria-busy")).toBe("true");
  expect(
    wrapper.get('[aria-label="Remove status"]').attributes(),
  ).toHaveProperty("disabled");
  await wrapper.get("input").setValue("paused");
  await wrapper.get("form").trigger("submit");
  expect(value.value).toEqual({ status: "active" });

  pending.value = false;
  await nextTick();
  await wrapper.get("form").trigger("submit");
  expect(value.value).toEqual({ status: "paused" });
  wrapper.unmount();
});

test("serializes typed filters deterministically and removes URL defaults", () => {
  const filters = {
    status: { value: "active", operator: "equals" },
    createdAt: { to: "2026-08-24", from: "2026-08-01", operator: "between" },
  };
  expect(stableFilters(filters)).toBe(
    '{"createdAt":{"from":"2026-08-01","operator":"between","to":"2026-08-24"},"status":{"operator":"equals","value":"active"}}',
  );
  const url = filterUrl("/bridge/users?lens=recent#records", filters);
  expect(url).toContain("/bridge/users?lens=recent&filters=");
  expect(url.endsWith("#records")).toBe(true);
  expect(filtersFromUrl(url)).toEqual(filters);
  expect(filterUrl(url, {})).toBe("/bridge/users?lens=recent#records");
  expect(
    filtersFromUrl("/bridge/users?filters=broken", { safe: true }),
  ).toEqual({
    safe: true,
  });
});

test("ships matching Vue source and valid idiomatic React and Svelte ports", () => {
  expect(
    readFileSync(resolve("registry/filter-bar/vue/FilterBar.vue"), "utf8"),
  ).toBe(readFileSync(resolve("src/vue/filter-bar/FilterBar.vue"), "utf8"));
  expect(
    readFileSync(resolve("registry/filter-bar/vue/filterState.js"), "utf8"),
  ).toBe(readFileSync(resolve("src/vue/filter-bar/filterState.js"), "utf8"));

  const react = readFileSync(
    resolve("registry/filter-bar/react/FilterBar.jsx"),
    "utf8",
  );
  expect(() =>
    parse(react, { sourceType: "module", plugins: ["jsx"] }),
  ).not.toThrow();

  const svelte = readFileSync(
    resolve("registry/filter-bar/svelte/FilterBar.svelte"),
    "utf8",
  );
  expect(
    compile(svelte, { filename: "FilterBar.svelte", generate: false }).warnings,
  ).toEqual([]);
});

test("keeps one-piece composition and caller-owned durability", () => {
  for (const [framework, filename] of [
    ["vue", "FilterBar.vue"],
    ["react", "FilterBar.jsx"],
    ["svelte", "FilterBar.svelte"],
  ]) {
    const source = readFileSync(
      resolve(`registry/filter-bar/${framework}/${filename}`),
      "utf8",
    );
    expect(source).not.toMatch(/localStorage|sessionStorage/);
    expect(source).not.toMatch(/Filter(?:Trigger|Panel|Chip|Item)/);
    expect(source).not.toMatch(/\bvariant\b/i);
    expect(source).toContain('data-slot="filter-bar"');
  }
});
