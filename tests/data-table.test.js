import { parse } from "@babel/parser";
import { expect, test } from "@rstest/core";
import { mount } from "@vue/test-utils";
import { router } from "@inertiajs/vue3";
import { compile, compileModule } from "svelte/compiler";
import { defineComponent, h, nextTick, ref } from "vue";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import Checkbox from "../src/vue/checkbox/Checkbox.vue";
import DataTable from "../src/vue/data-table/DataTable.vue";
import {
  dataTableUrl,
  useDataTableQuery,
} from "../src/vue/data-table/useDataTableQuery.js";

const records = [
  { id: 41, name: "api", selectable: true },
  { id: 42, name: "worker", selectable: true },
  { id: 43, name: "system", selectable: false },
];

function registrySource(framework, filename) {
  return readFileSync(
    resolve(`registry/data-table/${framework}/${filename}`),
    "utf8",
  );
}

function selectionHarness(options = {}) {
  const rows = ref(options.rows ?? records);
  const selected = ref(options.selected ?? []);
  const busy = ref(false);
  const wrapper = mount(
    defineComponent({
      components: { Checkbox, DataTable },
      setup() {
        return { busy, rows, selected };
      },
      template: `
        <DataTable
          v-model:selected="selected"
          :rows="rows"
          :busy="busy"
          :selectable="row => row.selectable"
          class="rounded-lg border border-gray-200"
          table-class="min-w-160 text-xs"
          v-slot="table"
        >
          <caption>Bridge services</caption>
          <thead>
            <tr>
              <th scope="col"><Checkbox v-bind="table.pageSelection()" /></th>
              <th scope="col">Service</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in rows" :key="row.id">
              <td><Checkbox v-bind="table.rowSelection(row, 'Select ' + row.name)" /></td>
              <th scope="row">{{ row.name }}</th>
            </tr>
          </tbody>
        </DataTable>
      `,
    }),
    { attachTo: document.body },
  );
  return { busy, rows, selected, wrapper };
}

test("keeps one native table and leaves its anatomy to application markup", () => {
  const { wrapper } = selectionHarness();
  const dataTable = wrapper.get('[data-slot="data-table"]');

  expect(dataTable.findAll("table")).toHaveLength(1);
  expect(dataTable.get("table").attributes("data-slot")).toBe("table");
  expect(dataTable.get("caption").text()).toBe("Bridge services");
  expect(dataTable.findAll('th[scope="col"]')).toHaveLength(2);
  expect(dataTable.findAll('th[scope="row"]')).toHaveLength(3);
  expect(dataTable.classes()).toContain("rounded-lg");
  expect(dataTable.get("table").classes()).toContain("min-w-160");
  expect(dataTable.get("table").classes()).toContain("text-xs");

  wrapper.unmount();
});

test("provides labelled row and page selection with an honest mixed state", async () => {
  const { selected, wrapper } = selectionHarness();
  const api = wrapper.get('input[aria-label="Select api"]');
  const page = wrapper.get('input[aria-label="Select all rows on this page"]');
  const unavailable = wrapper.get('input[aria-label="Select system"]');

  expect(unavailable.attributes("disabled")).toBeDefined();
  await api.setValue(true);
  expect(selected.value).toEqual([41]);
  expect(page.element.indeterminate).toBe(true);
  expect(wrapper.get('[aria-live="polite"]').text()).toBe("1 row selected.");

  await page.setValue(true);
  expect(selected.value).toEqual([41, 42]);
  expect(page.element.checked).toBe(true);
  expect(page.element.indeterminate).toBe(false);

  wrapper.unmount();
});

test("reconciles page-scoped selection when rows or permissions change", async () => {
  const { rows, selected, wrapper } = selectionHarness({ selected: [41, 43] });

  await nextTick();
  expect(selected.value).toEqual([41]);

  rows.value = [
    { id: 44, name: "web", selectable: true },
    { id: 45, name: "jobs", selectable: true },
  ];
  await nextTick();
  expect(selected.value).toEqual([]);

  wrapper.unmount();
});

test("keeps pending rows readable while preventing duplicate selection", async () => {
  const { busy, selected, wrapper } = selectionHarness();
  busy.value = true;
  await nextTick();

  expect(wrapper.get("table").attributes("aria-busy")).toBe("true");
  expect(wrapper.findAll("tbody tr")).toHaveLength(3);
  expect(
    wrapper.get('input[aria-label="Select api"]').attributes("disabled"),
  ).toBeDefined();
  await wrapper.get('input[aria-label="Select api"]').setValue(true);
  expect(selected.value).toEqual([]);

  wrapper.unmount();
});

test("cleans default query state without dropping unrelated URL state", () => {
  expect(
    dataTableUrl(
      "/bridge/users?dashboard=ops#records",
      {
        page: 1,
        sort: "email ASC",
        search: "",
        filters: {},
        lens: "recent",
      },
      { sort: "createdAt DESC", lens: "" },
    ),
  ).toBe("/bridge/users?dashboard=ops&sort=email+ASC&lens=recent#records");

  expect(
    dataTableUrl("/bridge/users", {
      page: 3,
      filters: { state: "active" },
    }),
  ).toBe("/bridge/users?page=3&filters=%7B%22state%22%3A%22active%22%7D");
});

test("uses replace for cancellable search and syncs back-forward server state", async () => {
  const originalVisit = router.visit;
  const visits = [];
  router.visit = (href, options) => {
    visits.push({ href, options });
    options.onStart?.({});
    options.onFinish?.({});
  };
  const serverQuery = ref({ page: 2, sort: "name ASC", search: "api" });
  let query;
  const wrapper = mount(
    defineComponent({
      setup() {
        query = useDataTableQuery({
          url: "/bridge/services",
          query: serverQuery,
          defaults: { page: 1, sort: "createdAt DESC", search: "" },
          only: ["records", "total", "currentPage", "sort", "search"],
        });
        return () => h("div");
      },
    }),
  );

  try {
    expect(query.search.value).toBe("api");
    query.search.value = "worker";
    await new Promise((resolvePromise) => setTimeout(resolvePromise, 330));

    expect(visits).toHaveLength(1);
    expect(visits[0].href).toBe("/bridge/services?sort=name+ASC&search=worker");
    expect(visits[0].options.replace).toBe(true);
    expect(visits[0].options.preserveState).toBe(true);
    expect(visits[0].options.preserveScroll).toBe(true);
    expect(visits[0].options.only).toEqual([
      "records",
      "total",
      "currentPage",
      "sort",
      "search",
    ]);

    serverQuery.value = { page: 1, sort: "name ASC", search: "worker" };
    await nextTick();
    serverQuery.value = { page: 1, sort: "name ASC", search: "api" };
    await nextTick();
    await new Promise((resolvePromise) => setTimeout(resolvePromise, 330));
    expect(query.search.value).toBe("api");
    expect(visits).toHaveLength(1);
  } finally {
    wrapper.unmount();
    router.visit = originalVisit;
  }
});

test("sort helpers use real button semantics and truthful aria-sort", () => {
  const originalVisit = router.visit;
  const visits = [];
  router.visit = (href) => visits.push(href);
  let query;
  const wrapper = mount(
    defineComponent({
      setup() {
        query = useDataTableQuery({
          url: "/bridge/services",
          query: { page: 4, sort: "name ASC", search: "" },
        });
        return () => h("div");
      },
    }),
  );

  try {
    const props = query.sortButton("name", "Service name");
    const trigger = document.createElement("button");
    trigger.dataset.tableFocus = "sort:name";
    props.onClick({ currentTarget: trigger });

    expect(props.type).toBe("button");
    expect(props["aria-label"]).toBe("Sort by Service name descending");
    expect(query.ariaSort("name")).toBe("ascending");
    expect(query.ariaSort("status")).toBeUndefined();
    expect(visits).toEqual(["/bridge/services?sort=name+DESC"]);
  } finally {
    wrapper.unmount();
    router.visit = originalVisit;
  }
});

test("cancels pending debounced search when its owner unmounts", async () => {
  const originalVisit = router.visit;
  const visits = [];
  router.visit = (...args) => visits.push(args);
  let query;
  const wrapper = mount(
    defineComponent({
      setup() {
        query = useDataTableQuery({
          url: "/audit",
          query: { page: 1, search: "" },
        });
        return () => h("div");
      },
    }),
  );

  try {
    query.search.value = "deploy";
    wrapper.unmount();
    await new Promise((resolvePromise) => setTimeout(resolvePromise, 330));
    expect(visits).toHaveLength(0);
  } finally {
    router.visit = originalVisit;
  }
});

test("ships equivalent parseable framework-native source", () => {
  expect(registrySource("vue", "DataTable.vue")).toBe(
    readFileSync(resolve("src/vue/data-table/DataTable.vue"), "utf8"),
  );
  expect(registrySource("vue", "useDataTableQuery.js")).toBe(
    readFileSync(resolve("src/vue/data-table/useDataTableQuery.js"), "utf8"),
  );

  for (const filename of ["DataTable.jsx", "useDataTableQuery.js"]) {
    expect(() =>
      parse(registrySource("react", filename), {
        sourceType: "module",
        plugins: ["jsx"],
      }),
    ).not.toThrow();
  }

  const component = compile(registrySource("svelte", "DataTable.svelte"), {
    filename: "DataTable.svelte",
    generate: false,
  });
  const queryModule = compileModule(
    registrySource("svelte", "dataTableQuery.svelte.js"),
    { filename: "dataTableQuery.svelte.js", generate: false },
  );
  expect(component.warnings).toEqual([]);
  expect(queryModule.warnings).toEqual([]);
});

test("keeps native anatomy, caller styling, and server ownership explicit", () => {
  for (const [framework, component, query] of [
    ["vue", "DataTable.vue", "useDataTableQuery.js"],
    ["react", "DataTable.jsx", "useDataTableQuery.js"],
    ["svelte", "DataTable.svelte", "dataTableQuery.svelte.js"],
  ]) {
    const componentSource = registrySource(framework, component);
    const querySource = registrySource(framework, query);

    expect(componentSource).toContain('data-slot="data-table"');
    expect(componentSource).toContain('aria-live="polite"');
    expect(componentSource).toContain("pageSelection");
    expect(componentSource).toContain("rowSelection");
    expect(componentSource).not.toMatch(
      /DataTableHeader|DataTableRow|DataTableCell|columnDef|accessorKey/,
    );
    expect(componentSource).not.toMatch(/\bvariant\b/i);
    expect(querySource).toContain("preserveState");
    expect(querySource).toContain("preserveScroll");
    expect(querySource).toContain("data-table-focus");
    expect(querySource).not.toMatch(/localStorage|sessionStorage/);
  }
});
