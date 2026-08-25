import { afterEach, expect, test } from "@rstest/core";
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { KleanInstallerError } from "../cli/installer.js";
import { archiveSource } from "../cli/source-archive.js";
import { createSourceFormatter } from "../cli/source-formatter.js";
import {
  applyUpdatePlan,
  createCheckReport,
  createDiffReport,
  createUpdateAllPlan,
  createUpdatePlan,
  formatDiffReport,
  hashSource,
} from "../cli/updater.js";

const fixtures = [];
const FRAMEWORKS = {
  vue: {
    dependency: "vue",
    entry: 'import { createApp } from "vue";\n',
    extension: "vue",
  },
  react: {
    dependency: "react",
    entry: 'import { createRoot } from "react-dom/client";\n',
    extension: "jsx",
  },
  svelte: {
    dependency: "svelte",
    entry: 'import { mount } from "svelte";\n',
    extension: "svelte",
  },
};

afterEach(() => {
  while (fixtures.length) {
    rmSync(fixtures.pop(), { recursive: true, force: true });
  }
});

function write(path, source) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, source);
}

function makeApp(framework = "vue", dependencies = {}) {
  const root = mkdtempSync(join(tmpdir(), `klean-update-${framework}-`));
  fixtures.push(root);
  const fixture = FRAMEWORKS[framework];
  write(
    resolve(root, "package.json"),
    `${JSON.stringify(
      {
        name: "update-fixture",
        private: true,
        dependencies: {
          sails: "^1.5.0",
          [fixture.dependency]: "latest",
          ...dependencies,
        },
      },
      null,
      2,
    )}\n`,
  );
  write(resolve(root, "package-lock.json"), "original lock\n");
  write(resolve(root, "assets/js/app.js"), fixture.entry);
  return root;
}

function makeRegistry() {
  const root = mkdtempSync(join(tmpdir(), "klean-update-registry-"));
  fixtures.push(root);
  return root;
}

function componentFiles(name, contentsByFramework, extraFiles = {}) {
  return Object.fromEntries(
    Object.entries(FRAMEWORKS).map(([framework, fixture]) => [
      framework,
      [
        {
          source: `${framework}/${name}.${fixture.extension}`,
          target: `${name}/${name}.${fixture.extension}`,
          contents: contentsByFramework[framework],
        },
        ...(extraFiles[framework] ?? []),
      ],
    ]),
  );
}

function writeRegistryItem(
  registry,
  name,
  { files, dependencies = {}, registryDependencies = [] },
) {
  const frameworks = {};

  for (const [framework, frameworkFiles] of Object.entries(files)) {
    for (const file of frameworkFiles) {
      write(resolve(registry, name, file.source), file.contents);
    }
    frameworks[framework] = {
      files: frameworkFiles.map(({ source, target }) => ({ source, target })),
      dependencies: dependencies[framework] ?? dependencies,
    };
  }

  write(
    resolve(registry, name, "registry.json"),
    `${JSON.stringify(
      {
        name,
        description: `${name} fixture`,
        ...(registryDependencies.length ? { registryDependencies } : {}),
        frameworks,
      },
      null,
      2,
    )}\n`,
  );
}

function revision(revisionNumber, files, dependencies = {}, notes = []) {
  return {
    revision: revisionNumber,
    files: Object.fromEntries(
      Object.entries(files).map(([path, source]) => [path, hashSource(source)]),
    ),
    sources: Object.fromEntries(
      Object.entries(files).map(([path, source]) => [
        path,
        archiveSource(source),
      ]),
    ),
    dependencies,
    migrationNotes: notes,
  };
}

function writeLineage(registry, items) {
  write(
    resolve(registry, "lineage.json"),
    `${JSON.stringify({ schemaVersion: 1, items }, null, 2)}\n`,
  );
}

function recordingDependencyInstaller(calls) {
  return ({ root, dependencies }) => {
    calls.push(dependencies);
    const path = resolve(root, "package.json");
    const packageJson = JSON.parse(readFileSync(path, "utf8"));
    for (const dependency of dependencies) {
      packageJson.dependencies[dependency.name] = dependency.version;
    }
    write(path, `${JSON.stringify(packageJson, null, 2)}\n`);
  };
}

function widgetRegistry() {
  const registry = makeRegistry();
  const oldSource = Object.fromEntries(
    Object.entries(FRAMEWORKS).map(([framework]) => [
      framework,
      `${framework} widget version one\n`,
    ]),
  );
  const latestSource = Object.fromEntries(
    Object.entries(FRAMEWORKS).map(([framework]) => [
      framework,
      `${framework} widget version two\n`,
    ]),
  );
  writeRegistryItem(registry, "widget", {
    files: componentFiles("widget", latestSource),
    dependencies: { "widget-runtime": "^2.0.0" },
  });
  writeLineage(registry, {
    widget: Object.fromEntries(
      Object.entries(FRAMEWORKS).map(([framework, fixture]) => {
        const target = `widget/widget.${fixture.extension}`;
        return [
          framework,
          [
            revision(
              1,
              { [target]: oldSource[framework] },
              { "widget-runtime": "^1.0.0" },
            ),
            revision(
              2,
              { [target]: latestSource[framework] },
              { "widget-runtime": "^2.0.0" },
              ["The widget event now carries the native value."],
            ),
          ],
        ];
      }),
    ),
  });
  return { registry, oldSource, latestSource };
}

const FORMATTER_SOURCES = {
  vue: `<script setup>\nconst props = defineProps({ label: { type: String, default: "Save" } });\n</script>\n\n<template><button type="button" class="inline-flex px-4 py-2">{{ props.label }}</button></template>\n`,
  react: `export function Formatted({ label = "Save" }) { return <button type="button" className="inline-flex px-4 py-2">{label}</button>; }\n`,
  svelte: `<script>\nlet { label = "Save" } = $props();\n</script>\n\n<button type="button" class="inline-flex px-4 py-2">{label}</button>\n`,
};

function formatterRegistry() {
  const registry = makeRegistry();
  writeRegistryItem(registry, "formatted", {
    files: componentFiles("formatted", FORMATTER_SOURCES),
  });
  writeLineage(registry, {
    formatted: Object.fromEntries(
      Object.entries(FRAMEWORKS).map(([framework, fixture]) => [
        framework,
        [
          revision(1, {
            [`formatted/formatted.${fixture.extension}`]:
              FORMATTER_SOURCES[framework],
          }),
        ],
      ]),
    ),
  });
  return registry;
}

for (const [framework, fixture] of Object.entries(FRAMEWORKS)) {
  test(`recognizes and safely updates unchanged historical ${framework} source`, () => {
    const { registry, oldSource, latestSource } = widgetRegistry();
    const root = makeApp(framework, { "widget-runtime": "^1.0.0" });
    const target = resolve(
      root,
      `assets/js/components/ui/widget/widget.${fixture.extension}`,
    );
    write(target, oldSource[framework]);

    const check = createCheckReport({ cwd: root, registryDirectory: registry });
    expect(check.exitCode).toBe(2);
    expect(check.entries).toEqual([
      expect.objectContaining({ component: "widget", status: "update" }),
    ]);

    const diff = createDiffReport("widget", {
      cwd: root,
      registryDirectory: registry,
    });
    expect(diff.exitCode).toBe(2);
    expect(formatDiffReport(diff)).toContain("widget: r1 → r2");
    expect(formatDiffReport(diff)).toContain(
      "-widget version one".replace("widget", `${framework} widget`),
    );
    expect(formatDiffReport(diff)).toContain(
      "+widget version two".replace("widget", `${framework} widget`),
    );
    expect(formatDiffReport(diff)).toContain("widget-runtime@^1.0.0");
    expect(formatDiffReport(diff)).toContain(
      "The widget event now carries the native value.",
    );

    const calls = [];
    const plan = createUpdatePlan("widget", {
      cwd: root,
      registryDirectory: registry,
    });
    const result = applyUpdatePlan(plan, {
      dependencyInstaller: recordingDependencyInstaller(calls),
    });
    expect(result.changed).toBe(true);
    expect(readFileSync(target, "utf8")).toBe(latestSource[framework]);
    expect(calls).toHaveLength(1);
    expect(calls[0][0]).toEqual(
      expect.objectContaining({
        name: "widget-runtime",
        version: "^2.0.0",
        currentVersion: "^1.0.0",
      }),
    );
    expect(
      createCheckReport({ cwd: root, registryDirectory: registry }).exitCode,
    ).toBe(0);
  });
}

for (const [framework, fixture] of Object.entries(FRAMEWORKS)) {
  test(`recognizes formatter-only changes in current ${framework} source`, () => {
    const registry = formatterRegistry();
    const root = makeApp(framework);
    write(
      resolve(root, ".prettierrc.json"),
      `${JSON.stringify({ singleQuote: true, semi: false }, null, 2)}\n`,
    );
    const target = resolve(
      root,
      `assets/js/components/ui/formatted/formatted.${fixture.extension}`,
    );
    const formatter = createSourceFormatter(root);
    const applicationSource = formatter.format(
      FORMATTER_SOURCES[framework],
      target,
    );
    expect(applicationSource).not.toBe(FORMATTER_SOURCES[framework]);
    write(target, applicationSource);

    const check = createCheckReport({ cwd: root, registryDirectory: registry });
    expect(check.exitCode).toBe(0);
    expect(check.entries[0]).toEqual(
      expect.objectContaining({ component: "formatted", status: "current" }),
    );

    const diff = createDiffReport("formatted", {
      cwd: root,
      registryDirectory: registry,
    });
    expect(diff.exitCode).toBe(0);
    expect(diff.files).toEqual([]);
    expect(readFileSync(target, "utf8")).toBe(applicationSource);

    write(target, applicationSource.replace("Save", "Delete"));
    const modified = createCheckReport({
      cwd: root,
      registryDirectory: registry,
    });
    expect(modified.entries[0].status).toBe("modified");
    expect(
      createUpdatePlan("formatted", {
        cwd: root,
        registryDirectory: registry,
      }).hasConflicts,
    ).toBe(true);
  });
}

test("uses the application's formatter version when it is available", () => {
  const root = makeApp("vue", { prettier: "test" });
  const prettierDirectory = resolve(root, "node_modules/prettier");
  write(
    resolve(prettierDirectory, "package.json"),
    `${JSON.stringify({
      name: "prettier",
      version: "0.0.0-test",
      type: "module",
      exports: "./index.js",
    })}\n`,
  );
  write(
    resolve(prettierDirectory, "index.js"),
    `export async function resolveConfig() { return { application: true } }\nexport async function format(source, options) { return options.application ? \`application:\${source}\` : \`bundled:\${source}\` }\n`,
  );

  const target = resolve(root, "assets/js/components/ui/example.js");
  expect(createSourceFormatter(root).format("const value = 1", target)).toBe(
    "application:const value = 1",
  );
});

test("distinguishes locally modified and untracked source without writing", () => {
  const { registry } = widgetRegistry();
  const root = makeApp("vue", { "widget-runtime": "^2.0.0" });
  const target = resolve(root, "assets/js/components/ui/widget/widget.vue");
  write(target, "application-owned widget\n");
  write(
    resolve(root, "assets/js/components/ui/product/Product.vue"),
    "product wrapper\n",
  );

  const report = createCheckReport({ cwd: root, registryDirectory: registry });
  expect(report.entries[0].status).toBe("modified");
  expect(report.untracked[0].displayPath).toBe("product/Product.vue");
  expect(readFileSync(target, "utf8")).toBe("application-owned widget\n");

  const plan = createUpdatePlan("widget", {
    cwd: root,
    registryDirectory: registry,
  });
  expect(plan.hasConflicts).toBe(true);
  expect(() => applyUpdatePlan(plan)).toThrow(KleanInstallerError);
  expect(readFileSync(target, "utf8")).toBe("application-owned widget\n");
});

test("overwrites modified source only after the explicit escape hatch", () => {
  const { registry, latestSource } = widgetRegistry();
  const root = makeApp("vue", { "widget-runtime": "^2.0.0" });
  const target = resolve(root, "assets/js/components/ui/widget/widget.vue");
  write(target, "application-owned widget\n");

  const plan = createUpdatePlan("widget", {
    cwd: root,
    registryDirectory: registry,
    overwrite: true,
  });
  expect(plan.files[0].action).toBe("overwrite");
  applyUpdatePlan(plan);
  expect(readFileSync(target, "utf8")).toBe(latestSource.vue);
});

test("does not downgrade an application-owned dependency implicitly", () => {
  const { registry, latestSource } = widgetRegistry();
  const root = makeApp("vue", { "widget-runtime": "^3.0.0" });
  const target = resolve(root, "assets/js/components/ui/widget/widget.vue");
  write(target, latestSource.vue);

  const check = createCheckReport({ cwd: root, registryDirectory: registry });
  expect(check.entries[0].status).toBe("modified");
  expect(check.entries[0].dependencyConflicts[0]).toEqual(
    expect.objectContaining({
      name: "widget-runtime",
      currentVersion: "^3.0.0",
      version: "^2.0.0",
    }),
  );

  const plan = createUpdatePlan("widget", {
    cwd: root,
    registryDirectory: registry,
  });
  expect(plan.hasConflicts).toBe(true);
  expect(() => applyUpdatePlan(plan)).toThrow(/application-owned dependency/);

  const calls = [];
  const overwrite = createUpdatePlan("widget", {
    cwd: root,
    registryDirectory: registry,
    overwrite: true,
  });
  applyUpdatePlan(overwrite, {
    dependencyInstaller: recordingDependencyInstaller(calls),
  });
  expect(calls[0][0].version).toBe("^2.0.0");
});

test("adds files introduced by a later compound revision", () => {
  const registry = makeRegistry();
  const oldComponent = "component version one\n";
  const latestComponent = "component version two\n";
  const helper = "new helper\n";
  const files = componentFiles(
    "compound",
    Object.fromEntries(
      Object.keys(FRAMEWORKS).map((framework) => [framework, latestComponent]),
    ),
    Object.fromEntries(
      Object.entries(FRAMEWORKS).map(([framework]) => [
        framework,
        [
          {
            source: `${framework}/helper.js`,
            target: "compound/helper.js",
            contents: helper,
          },
        ],
      ]),
    ),
  );
  writeRegistryItem(registry, "compound", { files });
  writeLineage(registry, {
    compound: Object.fromEntries(
      Object.entries(FRAMEWORKS).map(([framework, fixture]) => [
        framework,
        [
          revision(1, {
            [`compound/compound.${fixture.extension}`]: oldComponent,
          }),
          revision(2, {
            [`compound/compound.${fixture.extension}`]: latestComponent,
            "compound/helper.js": helper,
          }),
        ],
      ]),
    ),
  });
  const root = makeApp("react");
  const componentPath = resolve(
    root,
    "assets/js/components/ui/compound/compound.jsx",
  );
  const helperPath = resolve(
    root,
    "assets/js/components/ui/compound/helper.js",
  );
  write(componentPath, oldComponent);

  const plan = createUpdatePlan("compound", {
    cwd: root,
    registryDirectory: registry,
  });
  expect(plan.files.map((file) => file.action)).toEqual(["update", "create"]);
  applyUpdatePlan(plan);
  expect(readFileSync(componentPath, "utf8")).toBe(latestComponent);
  expect(readFileSync(helperPath, "utf8")).toBe(helper);
});

test("updates safe items atomically and skips modified items with --all", () => {
  const { registry, oldSource, latestSource } = widgetRegistry();
  const otherLatest = Object.fromEntries(
    Object.keys(FRAMEWORKS).map((framework) => [
      framework,
      `${framework} other latest\n`,
    ]),
  );
  writeRegistryItem(registry, "other", {
    files: componentFiles("other", otherLatest),
  });
  writeLineage(registry, {
    ...JSON.parse(readFileSync(resolve(registry, "lineage.json"), "utf8"))
      .items,
    other: Object.fromEntries(
      Object.entries(FRAMEWORKS).map(([framework, fixture]) => [
        framework,
        [
          revision(1, {
            [`other/other.${fixture.extension}`]: `${framework} other old\n`,
          }),
          revision(2, {
            [`other/other.${fixture.extension}`]: otherLatest[framework],
          }),
        ],
      ]),
    ),
  });
  const root = makeApp("vue", { "widget-runtime": "^1.0.0" });
  const widgetPath = resolve(root, "assets/js/components/ui/widget/widget.vue");
  const otherPath = resolve(root, "assets/js/components/ui/other/other.vue");
  write(widgetPath, oldSource.vue);
  write(otherPath, "bespoke other\n");

  const update = createUpdateAllPlan({
    cwd: root,
    registryDirectory: registry,
  });
  expect(update.skipped).toEqual([
    { component: "other", reason: "local changes" },
  ]);
  applyUpdatePlan(update.plan, {
    dependencyInstaller: recordingDependencyInstaller([]),
  });
  expect(readFileSync(widgetPath, "utf8")).toBe(latestSource.vue);
  expect(readFileSync(otherPath, "utf8")).toBe("bespoke other\n");
});

test("dry run plans source and dependency changes without mutation", () => {
  const { registry, oldSource } = widgetRegistry();
  const root = makeApp("vue", { "widget-runtime": "^1.0.0" });
  const target = resolve(root, "assets/js/components/ui/widget/widget.vue");
  write(target, oldSource.vue);
  const originalPackage = readFileSync(resolve(root, "package.json"), "utf8");
  const calls = [];

  const plan = createUpdatePlan("widget", {
    cwd: root,
    registryDirectory: registry,
    dryRun: true,
  });
  const result = applyUpdatePlan(plan, {
    dependencyInstaller: recordingDependencyInstaller(calls),
  });
  expect(result.dryRun).toBe(true);
  expect(readFileSync(target, "utf8")).toBe(oldSource.vue);
  expect(readFileSync(resolve(root, "package.json"), "utf8")).toBe(
    originalPackage,
  );
  expect(calls).toHaveLength(0);
});

test("rolls source, package, and lockfiles back when an update fails", () => {
  const { registry, oldSource } = widgetRegistry();
  const root = makeApp("svelte", { "widget-runtime": "^1.0.0" });
  const target = resolve(root, "assets/js/components/ui/widget/widget.svelte");
  write(target, oldSource.svelte);
  const originalPackage = readFileSync(resolve(root, "package.json"), "utf8");
  const originalLock = readFileSync(resolve(root, "package-lock.json"), "utf8");
  const plan = createUpdatePlan("widget", {
    cwd: root,
    registryDirectory: registry,
  });

  expect(() =>
    applyUpdatePlan(plan, {
      dependencyInstaller: ({ root: applicationRoot }) => {
        write(resolve(applicationRoot, "package.json"), "changed package\n");
        write(resolve(applicationRoot, "package-lock.json"), "changed lock\n");
        throw new Error("simulated update failure");
      },
    }),
  ).toThrow(/rolled back/);
  expect(readFileSync(target, "utf8")).toBe(oldSource.svelte);
  expect(readFileSync(resolve(root, "package.json"), "utf8")).toBe(
    originalPackage,
  );
  expect(readFileSync(resolve(root, "package-lock.json"), "utf8")).toBe(
    originalLock,
  );
});

test("rejects update for an absent component instead of installing it", () => {
  const { registry } = widgetRegistry();
  const root = makeApp("vue");

  expect(() =>
    createUpdatePlan("widget", { cwd: root, registryDirectory: registry }),
  ).toThrow(/not installed.*klean-ui add widget/);
  expect(
    existsSync(resolve(root, "assets/js/components/ui/widget/widget.vue")),
  ).toBe(false);
});

test("rejects malformed maintainer lineage before classifying application source", () => {
  const { registry } = widgetRegistry();
  const root = makeApp("vue");
  writeLineage(registry, {
    widget: {
      vue: [
        {
          revision: 1,
          files: { "widget/widget.vue": "not-a-content-hash" },
          dependencies: {},
          migrationNotes: [],
        },
      ],
    },
  });

  expect(() =>
    createCheckReport({ cwd: root, registryDirectory: registry }),
  ).toThrow(/registry lineage revision.*invalid/i);
});
