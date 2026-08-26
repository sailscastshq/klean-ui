import { parse } from "@babel/parser";
import { afterEach, beforeEach, expect, test } from "@rstest/core";
import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { createInstallPlan } from "../cli/installer.js";
import { compileModule } from "svelte/compiler";
import { createApp, effectScope, h, nextTick, reactive, ref } from "vue";
import { useFormDraft } from "../registry/durable-ui/vue/useFormDraft.js";
import {
  clearDraft,
  durableKey,
  readDraft,
  readQuery,
  readScroll,
  readStored,
  subscribeQuery,
  subscribeStored,
  writeDraft,
  writeQuery,
  writeScroll,
  writeStored,
} from "../registry/durable-ui/core.js";

const fixtures = [];

beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
  history.replaceState({}, "", "/durable");
});

afterEach(() => {
  while (fixtures.length) {
    rmSync(fixtures.pop(), { recursive: true, force: true });
  }
});

test("stored state is namespaced, versioned, default-cleaning, and failure-safe", () => {
  const options = { namespace: "slipway", version: 2 };
  const key = durableKey("density", options);

  expect(key).toBe("klean:slipway:density:v2");
  expect(readStored("density", "comfortable", options)).toMatchObject({
    found: false,
    value: "comfortable",
  });

  expect(writeStored("density", "compact", "comfortable", options)).toBe(true);
  expect(JSON.parse(localStorage.getItem(key))).toEqual({
    value: "compact",
    version: 2,
  });
  expect(readStored("density", "comfortable", options)).toMatchObject({
    found: true,
    value: "compact",
  });

  writeStored("density", "comfortable", "comfortable", options);
  expect(localStorage.getItem(key)).toBeNull();

  localStorage.setItem(key, "not-json");
  expect(readStored("density", "comfortable", options).value).toBe(
    "comfortable",
  );
  expect(localStorage.getItem(key)).toBeNull();
});

test("stored state expires and synchronizes across tabs without polling", () => {
  const options = { ttl: 10 };
  const key = durableKey("panel", options);
  writeStored("panel", true, false, options);
  const record = JSON.parse(localStorage.getItem(key));
  localStorage.setItem(
    key,
    JSON.stringify({ ...record, expiresAt: Date.now() - 1 }),
  );
  expect(readStored("panel", false, options).value).toBe(false);

  let updates = 0;
  const unsubscribe = subscribeStored("panel", () => updates++, options);
  dispatchEvent(
    new StorageEvent("storage", {
      key,
      newValue: JSON.stringify({ value: true, version: 1 }),
      storageArea: localStorage,
    }),
  );
  expect(updates).toBe(1);
  unsubscribe();
});

test("query state infers types, removes defaults, and observes navigation", () => {
  let updates = 0;
  const unsubscribe = subscribeQuery("page", () => updates++);

  expect(writeQuery("page", 3, 1)).toBe(true);
  expect(location.search).toBe("?page=3");
  expect(readQuery("page", 1)).toBe(3);
  expect(updates).toBe(1);

  writeQuery("filters", { status: "paid" }, {});
  expect(readQuery("filters", {})).toEqual({ status: "paid" });

  writeQuery("page", 1, 1, { history: "replace" });
  expect(new URLSearchParams(location.search).has("page")).toBe(false);
  dispatchEvent(new PopStateEvent("popstate"));
  expect(updates).toBeGreaterThanOrEqual(3);
  unsubscribe();
});

test("drafts are explicit, expiring, clone their data, and clear safely", () => {
  const source = { subject: "Deploy production" };
  const draft = writeDraft("feedback", source, { ttl: 1000 });
  source.subject = "Changed after save";

  expect(draft.data.subject).toBe("Deploy production");
  expect(readDraft("feedback").data.subject).toBe("Deploy production");

  clearDraft("feedback");
  expect(readDraft("feedback")).toBeNull();
  expect(writeDraft("feedback", { subject: "" })).toBeNull();
});

test("Vue form drafts clear after confirmed success", async () => {
  writeDraft("invoice:new", { customer: "Ada" });
  const host = document.createElement("div");
  const saved = ref(false);
  const form = reactive({ customer: "Ada" });
  const app = createApp({
    setup() {
      useFormDraft("invoice:new", form, { clearWhen: saved });
      return () => h("form");
    },
  });

  app.mount(host);
  expect(readDraft("invoice:new")).not.toBeNull();
  saved.value = true;
  await nextTick();
  expect(readDraft("invoice:new")).toBeNull();
  app.unmount();
});

test("scroll positions are session-scoped and validated", () => {
  expect(writeScroll("invoices", { x: 12, y: 480 })).toBe(true);
  expect(readScroll("invoices")).toEqual({ x: 12, y: 480 });
  expect(localStorage.length).toBe(0);
  expect(sessionStorage.length).toBe(1);
});

test("all three frameworks receive idiomatic complete resilience source", () => {
  const contracts = {
    vue: {
      files: [
        "useStoredState.js",
        "useQueryState.js",
        "useFormDraft.js",
        "useWizardDraft.js",
        "useScrollRestoration.js",
        "useOptimistic.js",
        "useSearch.js",
      ],
      names: ["useStoredState", "useQueryState", "useFormDraft", "useSearch"],
    },
    react: {
      files: [
        "useStoredState.js",
        "useQueryState.js",
        "useFormDraft.js",
        "useWizardDraft.js",
        "useScrollRestoration.js",
        "useOptimistic.js",
        "useSearch.js",
      ],
      names: ["useStoredState", "useQueryState", "useFormDraft", "useSearch"],
    },
    svelte: {
      files: [
        "storedState.svelte.js",
        "queryState.svelte.js",
        "formDraft.svelte.js",
        "wizardDraft.svelte.js",
        "scrollRestoration.svelte.js",
        "optimistic.svelte.js",
        "search.svelte.js",
      ],
      names: [
        "createStoredState",
        "createQueryState",
        "createFormDraft",
        "createSearch",
      ],
    },
  };

  for (const [framework, contract] of Object.entries(contracts)) {
    const directory = resolve("registry/durable-ui", framework);
    const combined = contract.files
      .map((file) => {
        const source = readFileSync(resolve(directory, file), "utf8");
        if (framework === "svelte") {
          expect(() =>
            compileModule(source, { filename: file, generate: "client" }),
          ).not.toThrow();
        } else {
          expect(() => parse(source, { sourceType: "module" })).not.toThrow();
        }
        return source;
      })
      .join("\n");

    for (const name of contract.names) expect(combined).toContain(name);
    expect(combined).toContain("beforeunload");
    expect(combined).toContain("AbortController");
    expect(combined).toContain("scrollRestoration");
    expect(combined).toContain("onError");
  }
});

test("the zero-configuration installer copies the focused source bundle", () => {
  for (const framework of ["vue", "react", "svelte"]) {
    const plan = createInstallPlan("durable-ui", {
      cwd: fixtureRoot(framework),
      framework,
    });
    const files = plan.files.filter((file) => file.component === "durable-ui");
    expect(files).toHaveLength(8);
    expect(
      files.some((file) => file.displayPath.endsWith("durable-ui/core.js")),
    ).toBe(true);
    expect(
      files
        .filter((file) => file.displayPath !== "durable-ui/core.js")
        .some((file) => file.registrySource.includes('from "./core.js"')),
    ).toBe(true);
    for (const file of files) {
      expect(file.registrySource).not.toContain('from "../core.js"');
      if (file.displayPath.endsWith(".svelte.js")) {
        expect(() =>
          compileModule(file.registrySource, {
            filename: file.displayPath,
            generate: "client",
          }),
        ).not.toThrow();
      } else {
        expect(() =>
          parse(file.registrySource, { sourceType: "module" }),
        ).not.toThrow();
      }
    }
  }
});

test("installed Vue async utilities roll back and reject stale search results", async () => {
  const root = fixtureRoot("vue");
  const runtime = mkdtempSync(resolve(".klean-durable-runtime-"));
  fixtures.push(runtime);
  const plan = createInstallPlan("durable-ui", { cwd: root, framework: "vue" });

  for (const file of plan.files) {
    const target = resolve(runtime, file.displayPath);
    mkdirSync(resolve(target, ".."), { recursive: true });
    writeFileSync(target, file.registrySource);
  }

  const optimisticModule = await import(
    `${pathToFileURL(resolve(runtime, "durable-ui/useOptimistic.js")).href}?test=${Date.now()}`
  );
  const searchModule = await import(
    `${pathToFileURL(resolve(runtime, "durable-ui/useSearch.js")).href}?test=${Date.now()}`
  );
  const scope = effectScope();
  const source = ref("draft");
  const failure = new Error("Server rejected the title");
  const optimistic = scope.run(() =>
    optimisticModule.useOptimistic(source, async () => {
      throw failure;
    }),
  );

  const result = optimistic.update("published");
  expect(optimistic.value.value).toBe("published");
  expect(await result).toBe(false);
  expect(optimistic.value.value).toBe("draft");
  expect(optimistic.error.value).toBe(failure);

  const calls = [];
  const query = ref("");
  const search = scope.run(() =>
    searchModule.useSearch(
      query,
      (value, { signal }) =>
        new Promise((resolveSearch) =>
          calls.push({ resolveSearch, signal, value }),
        ),
      { immediate: false },
    ),
  );
  const first = search.run("old");
  const second = search.run("new");
  expect(calls[0].signal.aborted).toBe(true);
  calls[1].resolveSearch(["new"]);
  expect(await second).toEqual(["new"]);
  calls[0].resolveSearch(["old"]);
  await first;
  expect(search.results.value).toEqual(["new"]);

  scope.stop();
});

function fixtureRoot(framework) {
  const root = mkdtempSync(join(tmpdir(), `klean-durable-${framework}-`));
  fixtures.push(root);
  mkdirSync(resolve(root, "assets/js"), { recursive: true });
  writeFileSync(
    resolve(root, "package.json"),
    `${JSON.stringify({
      name: "durable-fixture",
      private: true,
      dependencies: { sails: "^1.5.0", [framework]: "latest" },
    })}\n`,
  );
  writeFileSync(
    resolve(root, "assets/js/app.js"),
    framework === "vue"
      ? 'import { createApp } from "vue";\n'
      : framework === "react"
        ? 'import { createRoot } from "react-dom/client";\n'
        : 'import { mount } from "svelte";\n',
  );
  return root;
}
