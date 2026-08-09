import { afterEach, describe, expect, test } from "@rstest/core";
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import {
  createInstallPlan,
  detectFramework,
  installComponent,
  KleanInstallerError,
} from "../cli/installer.js";

const fixtures = [];

const FRAMEWORK_FIXTURES = {
  vue: {
    dependency: "vue",
    entry: 'import { createApp } from "vue";\ncreateApp({});\n',
    extension: "vue",
  },
  react: {
    dependency: "react",
    entry:
      'import { createRoot } from "react-dom/client";\ncreateRoot(document.body);\n',
    extension: "jsx",
  },
  svelte: {
    dependency: "svelte",
    entry: 'import { mount } from "svelte";\nmount(App, {});\n',
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

function makeFixture(options = {}) {
  const root = mkdtempSync(join(tmpdir(), "klean-ui-installer-"));
  fixtures.push(root);
  const framework = options.framework ?? "vue";
  const fixture = FRAMEWORK_FIXTURES[framework];
  const dependencies = {
    ...(options.sails === false ? {} : { sails: "^1.5.0" }),
    ...(fixture ? { [fixture.dependency]: "latest" } : {}),
    ...(options.tailwindMerge === false ? {} : { "tailwind-merge": "^3.6.0" }),
    ...(options.dependencies ?? {}),
  };
  const packageJson = {
    name: "fixture-app",
    private: true,
    dependencies,
    ...(options.packageManager
      ? { packageManager: options.packageManager }
      : {}),
  };

  write(
    resolve(root, "package.json"),
    `${JSON.stringify(packageJson, null, 2)}\n`,
  );
  write(resolve(root, "package-lock.json"), "{}\n");

  if (options.entry !== false) {
    write(
      resolve(root, "assets/js/app.js"),
      options.entry ?? fixture?.entry ?? "",
    );
  }

  write(resolve(root, "assets/css/app.css"), '@import "tailwindcss";\n');
  return root;
}

function readPackage(root) {
  return JSON.parse(readFileSync(resolve(root, "package.json"), "utf8"));
}

function recordingDependencyInstaller(calls) {
  return ({ root, packageManager, dependencies }) => {
    calls.push({ root, packageManager, dependencies });
    const packageJson = readPackage(root);
    packageJson.dependencies ??= {};

    for (const { name, version } of dependencies) {
      packageJson.dependencies[name] = version;
    }

    write(
      resolve(root, "package.json"),
      `${JSON.stringify(packageJson, null, 2)}\n`,
    );
  };
}

function writeRegistryItem(registryDirectory, name, options = {}) {
  const itemDirectory = resolve(registryDirectory, name);
  const files = options.files ?? [
    {
      source: `vue/${name}.vue`,
      target: `${name}/${name}.vue`,
      contents: `<template><div>${name}</div></template>\n`,
    },
  ];

  for (const file of files) {
    write(resolve(itemDirectory, file.source), file.contents);
  }

  write(
    resolve(itemDirectory, "registry.json"),
    `${JSON.stringify(
      {
        name,
        type: "registry:ui",
        ...(options.registryDependencies
          ? { registryDependencies: options.registryDependencies }
          : {}),
        frameworks: {
          vue: {
            files: files.map(({ source, target }) => ({ source, target })),
            dependencies: options.dependencies ?? {},
          },
        },
      },
      null,
      2,
    )}\n`,
  );
}

function allFiles(directory) {
  if (!existsSync(directory)) return [];

  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = resolve(directory, entry.name);
    return entry.isDirectory() ? allFiles(path) : [path];
  });
}

for (const [framework, fixture] of Object.entries(FRAMEWORK_FIXTURES)) {
  test(`installs only the native ${framework} Button in a canonical app`, () => {
    const root = makeFixture({ framework });
    const result = installComponent("button", { cwd: root });
    const destination = resolve(
      root,
      `assets/js/components/ui/button/Button.${fixture.extension}`,
    );

    expect(result.plan.framework).toBe(framework);
    expect(result.plan.frameworkDetection.source).toBe("entry");
    expect(existsSync(destination)).toBe(true);
    expect(readdirSync(dirname(destination))).toEqual([
      `Button.${fixture.extension}`,
    ]);
    expect(readFileSync(destination, "utf8")).toBe(
      readFileSync(result.plan.file.sourcePath, "utf8"),
    );
  });
}

for (const [framework, fixture] of Object.entries(FRAMEWORK_FIXTURES)) {
  test(`installs only the native ${framework} Slide`, () => {
    const root = makeFixture({ framework });
    const result = installComponent("slide", { cwd: root });
    const destination = resolve(
      root,
      `assets/js/components/ui/slide/Slide.${fixture.extension}`,
    );

    expect(result.plan.registryItems).toEqual(["slide"]);
    expect(result.plan.files).toHaveLength(1);
    expect(existsSync(destination)).toBe(true);
    expect(readFileSync(destination, "utf8")).toBe(
      readFileSync(result.plan.file.sourcePath, "utf8"),
    );
  });
}

for (const [framework, fixture] of Object.entries(FRAMEWORK_FIXTURES)) {
  test(`plans the complete native ${framework} date family without configuration`, () => {
    const root = makeFixture({ framework, tailwindMerge: false });
    const extension = fixture.extension;

    const calendar = createInstallPlan("calendar", { cwd: root });
    expect(calendar.registryItems).toEqual(["calendar"]);
    expect(calendar.files.map((file) => file.displayPath)).toEqual([
      `calendar/Calendar.${extension}`,
      "calendar/date.js",
    ]);

    const datePicker = createInstallPlan("date-picker", { cwd: root });
    expect(datePicker.registryItems).toEqual([
      "calendar",
      "input",
      "popover",
      "date-picker",
    ]);
    expect(datePicker.files.map((file) => file.displayPath)).toEqual([
      `calendar/Calendar.${extension}`,
      "calendar/date.js",
      `input/Input.${extension}`,
      `popover/Popover.${extension}`,
      `date-picker/DatePicker.${extension}`,
    ]);

    const range = createInstallPlan("date-range-picker", { cwd: root });
    expect(range.registryItems).toEqual([
      "calendar",
      "input",
      "popover",
      "date-range-picker",
    ]);
    expect(range.files.at(-1).displayPath).toBe(
      `date-range-picker/DateRangePicker.${extension}`,
    );

    const schedule = createInstallPlan("schedule-picker", { cwd: root });
    expect(schedule.registryItems).toEqual([
      "calendar",
      "input",
      "popover",
      "schedule-picker",
    ]);
    expect(schedule.files.map((file) => file.displayPath)).toEqual([
      `calendar/Calendar.${extension}`,
      "calendar/date.js",
      `input/Input.${extension}`,
      `popover/Popover.${extension}`,
      `schedule-picker/SchedulePicker.${extension}`,
      "schedule-picker/schedule.js",
    ]);
    expect(schedule.dependencies).toEqual(
      expect.arrayContaining([
        {
          name: "@floating-ui/dom",
          version: "^1.8.0",
          missing: true,
        },
        {
          name: "@internationalized/date",
          version: "^3.12.3",
          missing: true,
        },
        { name: "chrono-node", version: "^2.10.1", missing: true },
        { name: "tailwind-merge", version: "^3.6.0", missing: true },
      ]),
    );
    expect(existsSync(resolve(root, "klean-ui.json"))).toBe(false);
    expect(existsSync(resolve(root, "assets/js/lib/cn.js"))).toBe(false);
  });
}

for (const [framework, fixture] of Object.entries(FRAMEWORK_FIXTURES)) {
  for (const [component, filename] of [
    ["input", "Input"],
    ["textarea", "Textarea"],
    ["checkbox", "Checkbox"],
    ["switch", "Switch"],
  ]) {
    test(`installs only the native ${framework} ${filename}`, () => {
      const root = makeFixture({ framework });
      const result = installComponent(component, { cwd: root });
      const destination = resolve(
        root,
        `assets/js/components/ui/${component}/${filename}.${fixture.extension}`,
      );

      expect(result.plan.registryItems).toEqual([component]);
      expect(result.plan.files).toHaveLength(1);
      expect(existsSync(destination)).toBe(true);
      expect(readFileSync(destination, "utf8")).toBe(
        readFileSync(result.plan.file.sourcePath, "utf8"),
      );
      expect(allFiles(root).some((path) => path.includes(".klean-"))).toBe(
        false,
      );
    });
  }
}

test("creates the conventional destination directories when missing", () => {
  const root = makeFixture({ framework: "vue" });
  const destinationDirectory = resolve(root, "assets/js/components/ui");

  expect(existsSync(destinationDirectory)).toBe(false);
  installComponent("button", { cwd: root });
  expect(existsSync(resolve(destinationDirectory, "button/Button.vue"))).toBe(
    true,
  );
});

test("is idempotent when the application-owned source still matches", () => {
  const root = makeFixture({ framework: "react" });

  const first = installComponent("button", { cwd: root });
  const second = installComponent("button", { cwd: root });

  expect(first.changed).toBe(true);
  expect(second.changed).toBe(false);
  expect(second.plan.file.action).toBe("unchanged");
});

test("refuses to overwrite locally edited source and shows the difference", () => {
  const root = makeFixture({ framework: "vue" });
  const first = installComponent("button", { cwd: root });
  write(first.plan.file.targetPath, "<!-- application edit -->\n");

  let receivedError;
  try {
    installComponent("button", { cwd: root });
  } catch (error) {
    receivedError = error;
  }

  expect(receivedError).toBeInstanceOf(KleanInstallerError);
  expect(receivedError.code).toBe("SOURCE_CONFLICT");
  expect(receivedError.message).toContain("First difference at line 1");
  expect(receivedError.message).toContain("--overwrite");
  expect(readFileSync(first.plan.file.targetPath, "utf8")).toBe(
    "<!-- application edit -->\n",
  );
});

test("overwrites local source only with the explicit flag", () => {
  const root = makeFixture({ framework: "vue" });
  const first = installComponent("button", { cwd: root });
  write(first.plan.file.targetPath, "<!-- replace me -->\n");

  const result = installComponent("button", {
    cwd: root,
    overwrite: true,
  });

  expect(result.plan.file.action).toBe("overwrite");
  expect(readFileSync(first.plan.file.targetPath, "utf8")).toBe(
    result.plan.file.registrySource,
  );
});

test("adds only missing direct dependencies with the detected package manager", () => {
  const root = makeFixture({ framework: "svelte", tailwindMerge: false });
  const calls = [];

  const result = installComponent("button", {
    cwd: root,
    dependencyInstaller: recordingDependencyInstaller(calls),
  });

  expect(result.plan.packageManager).toBe("npm");
  expect(calls).toHaveLength(1);
  expect(calls[0].dependencies).toEqual([
    { name: "tailwind-merge", version: "^3.6.0", missing: true },
  ]);
  expect(readPackage(root).dependencies["tailwind-merge"]).toBe("^3.6.0");
});

test("honors explicit non-standard component and CSS paths", () => {
  const root = makeFixture({ framework: "react" });
  const result = installComponent("button", {
    cwd: root,
    componentsDirectory: "assets/js/design-system",
    cssPath: "assets/styles/tailwind.css",
  });

  expect(result.plan.componentsDisplayPath).toBe("assets/js/design-system");
  expect(result.plan.cssDisplayPath).toBe("assets/styles/tailwind.css");
  expect(
    existsSync(resolve(root, "assets/js/design-system/button/Button.jsx")),
  ).toBe(true);
});

test("rejects paths that escape the detected application", () => {
  const root = makeFixture({ framework: "vue" });

  expect(() =>
    createInstallPlan("button", {
      cwd: root,
      componentsDirectory: "../shared-components",
    }),
  ).toThrow(/must stay inside/);
});

test("fails with evidence when framework detection is ambiguous", () => {
  const root = makeFixture({
    framework: "vue",
    dependencies: { react: "latest", "react-dom": "latest" },
    entry:
      'import { createApp } from "vue";\nimport { createRoot } from "react-dom/client";\n',
  });

  expect(() => detectFramework(root, readPackage(root))).toThrow(
    /ambiguous framework evidence.*app\.js \(vue, react\)/,
  );
});

test("allows an explicit framework override without prompting", () => {
  const root = makeFixture({
    framework: "vue",
    dependencies: { react: "latest", "react-dom": "latest" },
    entry:
      'import { createApp } from "vue";\nimport { createRoot } from "react-dom/client";\n',
  });

  const result = installComponent("button", {
    cwd: root,
    framework: "react",
  });

  expect(result.plan.framework).toBe("react");
  expect(result.plan.frameworkDetection.source).toBe("override");
  expect(result.plan.file.targetPath.endsWith("Button.jsx")).toBe(true);
});

test("rejects non-Sails applications", () => {
  const root = makeFixture({ framework: "vue", sails: false });

  let receivedError;
  try {
    createInstallPlan("button", { cwd: root });
  } catch (error) {
    receivedError = error;
  }

  expect(receivedError).toBeInstanceOf(KleanInstallerError);
  expect(receivedError.code).toBe("NOT_SAILS");
  expect(receivedError.message).toContain("declares `sails`");
});

test("dry run reports the complete plan without mutating files or dependencies", () => {
  const root = makeFixture({ framework: "react", tailwindMerge: false });
  const calls = [];
  const result = installComponent("button", {
    cwd: root,
    dryRun: true,
    dependencyInstaller: recordingDependencyInstaller(calls),
  });

  expect(result.dryRun).toBe(true);
  expect(result.plan.file.action).toBe("create");
  expect(result.plan.missingDependencies).toHaveLength(1);
  expect(existsSync(result.plan.file.targetPath)).toBe(false);
  expect(readPackage(root).dependencies["tailwind-merge"]).toBeUndefined();
  expect(calls).toHaveLength(0);
});

test("rolls component, package, and lock files back after a partial failure", () => {
  const root = makeFixture({ framework: "svelte", tailwindMerge: false });
  const originalPackage = readFileSync(resolve(root, "package.json"), "utf8");
  const originalLock = readFileSync(resolve(root, "package-lock.json"), "utf8");
  const plan = createInstallPlan("button", { cwd: root });

  let receivedError;
  try {
    installComponent("button", {
      cwd: root,
      dependencyInstaller: ({ root: applicationRoot }) => {
        const packageJson = readPackage(applicationRoot);
        packageJson.dependencies["tailwind-merge"] = "^3.6.0";
        write(
          resolve(applicationRoot, "package.json"),
          `${JSON.stringify(packageJson)}\n`,
        );
        write(resolve(applicationRoot, "package-lock.json"), "changed\n");
        throw new Error("simulated package manager failure");
      },
    });
  } catch (error) {
    receivedError = error;
  }

  expect(receivedError.code).toBe("APPLY_FAILED");
  expect(receivedError.message).toContain("rolled back");
  expect(existsSync(plan.file.targetPath)).toBe(false);
  expect(existsSync(resolve(root, "assets/js/components/ui"))).toBe(false);
  expect(readFileSync(resolve(root, "package.json"), "utf8")).toBe(
    originalPackage,
  );
  expect(readFileSync(resolve(root, "package-lock.json"), "utf8")).toBe(
    originalLock,
  );
});

test("installs registry prerequisites and multi-file items dependency first", () => {
  const root = makeFixture({ framework: "vue", tailwindMerge: false });
  const registryDirectory = mkdtempSync(join(tmpdir(), "klean-ui-registry-"));
  fixtures.push(registryDirectory);

  writeRegistryItem(registryDirectory, "compound-context", {
    files: [
      {
        source: "vue/compound-context.js",
        target: "compound/compound-context.js",
        contents: "export const compoundContext = {};\n",
      },
    ],
  });
  writeRegistryItem(registryDirectory, "input", {
    registryDependencies: ["compound-context"],
    files: [
      {
        source: "vue/Input.vue",
        target: "input/Input.vue",
        contents: "<template><input /> </template>\n",
      },
    ],
    dependencies: { "tailwind-merge": "^3.6.0" },
  });
  writeRegistryItem(registryDirectory, "compound", {
    registryDependencies: ["compound-context", "input"],
    files: [
      {
        source: "vue/Compound.vue",
        target: "compound/Compound.vue",
        contents: "<template><div><slot /></div></template>\n",
      },
      {
        source: "vue/CompoundPart.vue",
        target: "compound/CompoundPart.vue",
        contents: "<template><p><slot /></p></template>\n",
      },
    ],
  });

  const calls = [];
  const result = installComponent("compound", {
    cwd: root,
    registryDirectory,
    dependencyInstaller: recordingDependencyInstaller(calls),
  });

  expect(result.plan.registryItems).toEqual([
    "compound-context",
    "input",
    "compound",
  ]);
  expect(result.plan.files.map((file) => file.displayPath)).toEqual([
    "compound/compound-context.js",
    "input/Input.vue",
    "compound/Compound.vue",
    "compound/CompoundPart.vue",
  ]);
  expect(result.plan.file).toBeUndefined();
  expect(calls).toHaveLength(1);
  expect(
    existsSync(
      resolve(root, "assets/js/components/ui/compound/compound-context.js"),
    ),
  ).toBe(true);
  expect(allFiles(root).some((path) => path.includes(".klean-"))).toBe(false);
});

test("blocks a multi-file install before mutation when any target conflicts", () => {
  const root = makeFixture({ framework: "vue" });
  const registryDirectory = mkdtempSync(join(tmpdir(), "klean-ui-registry-"));
  fixtures.push(registryDirectory);
  writeRegistryItem(registryDirectory, "compound", {
    files: [
      {
        source: "vue/Compound.vue",
        target: "compound/Compound.vue",
        contents: "<template><div /></template>\n",
      },
      {
        source: "vue/CompoundPart.vue",
        target: "compound/CompoundPart.vue",
        contents: "<template><p /></template>\n",
      },
    ],
  });
  const conflictingPath = resolve(
    root,
    "assets/js/components/ui/compound/CompoundPart.vue",
  );
  const untouchedPath = resolve(
    root,
    "assets/js/components/ui/compound/Compound.vue",
  );
  write(conflictingPath, "<!-- application owned -->\n");

  expect(() =>
    installComponent("compound", { cwd: root, registryDirectory }),
  ).toThrow(/has local changes/);
  expect(existsSync(untouchedPath)).toBe(false);
  expect(readFileSync(conflictingPath, "utf8")).toBe(
    "<!-- application owned -->\n",
  );
});

test("rolls every registry file back and removes atomic temp files", () => {
  const root = makeFixture({ framework: "vue", tailwindMerge: false });
  const registryDirectory = mkdtempSync(join(tmpdir(), "klean-ui-registry-"));
  fixtures.push(registryDirectory);
  writeRegistryItem(registryDirectory, "compound", {
    files: [
      {
        source: "vue/Compound.vue",
        target: "compound/Compound.vue",
        contents: "<template><div /></template>\n",
      },
      {
        source: "vue/CompoundPart.vue",
        target: "compound/CompoundPart.vue",
        contents: "<template><p /></template>\n",
      },
    ],
    dependencies: { "tailwind-merge": "^3.6.0" },
  });

  expect(() =>
    installComponent("compound", {
      cwd: root,
      registryDirectory,
      dependencyInstaller: () => {
        throw new Error("simulated package manager failure");
      },
    }),
  ).toThrow(/rolled back/);

  expect(existsSync(resolve(root, "assets/js/components/ui"))).toBe(false);
  expect(allFiles(root).some((path) => path.includes(".klean-"))).toBe(false);
});

test("does not generate project configuration or a shared class helper", () => {
  const root = makeFixture({ framework: "vue" });
  installComponent("button", { cwd: root });

  expect(existsSync(resolve(root, "klean-ui.json"))).toBe(false);
  expect(existsSync(resolve(root, "assets/js/lib/cn.js"))).toBe(false);
  expect(existsSync(resolve(root, "assets/js/utils.js"))).toBe(false);
});

test("plans Popover as one source component with automatic geometry dependencies", () => {
  const root = makeFixture({ framework: "vue", tailwindMerge: false });
  const plan = createInstallPlan("popover", { cwd: root });

  expect(plan.registryItems).toEqual(["popover"]);
  expect(plan.files).toHaveLength(1);
  expect(plan.files[0].displayPath).toBe("popover/Popover.vue");
  expect(plan.dependencies).toEqual([
    { name: "@floating-ui/dom", version: "^1.8.0", missing: true },
    { name: "tailwind-merge", version: "^3.6.0", missing: true },
  ]);
  expect(plan.registryItems).not.toContain("button");
});

test("installs Menu with Popover first and no configuration ceremony", () => {
  const root = makeFixture({ framework: "vue", tailwindMerge: false });
  const plan = createInstallPlan("menu", { cwd: root });

  expect(plan.registryItems).toEqual(["popover", "menu"]);
  expect(plan.files.map((file) => file.displayPath)).toEqual([
    "popover/Popover.vue",
    "menu/Menu.vue",
  ]);
  expect(plan.dependencies).toEqual([
    { name: "@floating-ui/dom", version: "^1.8.0", missing: true },
    { name: "tailwind-merge", version: "^3.6.0", missing: true },
  ]);
  expect(existsSync(resolve(root, "klean-ui.json"))).toBe(false);
  expect(existsSync(resolve(root, "assets/js/lib/cn.js"))).toBe(false);
});

for (const [framework, extension] of [
  ["vue", "vue"],
  ["react", "jsx"],
  ["svelte", "svelte"],
]) {
  test(`installs the ${framework} Select with Popover and no configuration ceremony`, () => {
    const root = makeFixture({ framework, tailwindMerge: false });
    const plan = createInstallPlan("select", { cwd: root });

    expect(plan.registryItems).toEqual(["popover", "select"]);
    expect(plan.files.map((file) => file.displayPath)).toEqual([
      `popover/Popover.${extension}`,
      `select/Select.${extension}`,
    ]);
    expect(plan.dependencies).toEqual([
      { name: "@floating-ui/dom", version: "^1.8.0", missing: true },
      { name: "tailwind-merge", version: "^3.6.0", missing: true },
    ]);
    expect(existsSync(resolve(root, "klean-ui.json"))).toBe(false);
    expect(existsSync(resolve(root, "assets/js/lib/cn.js"))).toBe(false);
  });
}

for (const [framework, extension] of [
  ["vue", "vue"],
  ["react", "jsx"],
  ["svelte", "svelte"],
]) {
  test(`installs the ${framework} Combobox with Popover and no configuration ceremony`, () => {
    const root = makeFixture({ framework, tailwindMerge: false });
    const plan = createInstallPlan("combobox", { cwd: root });

    expect(plan.registryItems).toEqual(["popover", "combobox"]);
    expect(plan.files.map((file) => file.displayPath)).toEqual([
      `popover/Popover.${extension}`,
      `combobox/Combobox.${extension}`,
    ]);
    expect(plan.dependencies).toEqual([
      { name: "@floating-ui/dom", version: "^1.8.0", missing: true },
      { name: "tailwind-merge", version: "^3.6.0", missing: true },
    ]);
    expect(existsSync(resolve(root, "klean-ui.json"))).toBe(false);
    expect(existsSync(resolve(root, "assets/js/lib/cn.js"))).toBe(false);
  });
}

test("plans Dialog as one source component with no interaction dependency", () => {
  const root = makeFixture({ framework: "vue", tailwindMerge: false });
  const plan = createInstallPlan("dialog", { cwd: root });

  expect(plan.registryItems).toEqual(["dialog"]);
  expect(plan.files).toHaveLength(1);
  expect(plan.files[0].displayPath).toBe("dialog/Dialog.vue");
  expect(plan.dependencies).toEqual([
    { name: "tailwind-merge", version: "^3.6.0", missing: true },
  ]);
  expect(existsSync(resolve(root, "klean-ui.json"))).toBe(false);
  expect(existsSync(resolve(root, "assets/js/lib/cn.js"))).toBe(false);
});

for (const [framework, extension] of [
  ["vue", "vue"],
  ["react", "jsx"],
  ["svelte", "svelte"],
]) {
  test(`installs the ${framework} Toast renderer and shared controller`, () => {
    const root = makeFixture({ framework });
    const result = installComponent("toast", { cwd: root });
    const toastDirectory = resolve(root, "assets/js/components/ui/toast");

    expect(result.plan.registryItems).toEqual(["toast"]);
    expect(result.plan.files.map((file) => file.displayPath)).toEqual([
      "toast/toast.js",
      `toast/Toast.${extension}`,
    ]);
    expect(existsSync(resolve(toastDirectory, "toast.js"))).toBe(true);
    expect(existsSync(resolve(toastDirectory, `Toast.${extension}`))).toBe(
      true,
    );
    const installedSource = readFileSync(
      resolve(toastDirectory, `Toast.${extension}`),
      "utf8",
    );
    expect(installedSource).toContain('from "./toast.js"');
    expect(installedSource).not.toContain('from "../toast.js"');
    expect(existsSync(resolve(root, "klean-ui.json"))).toBe(false);
    expect(existsSync(resolve(root, "assets/js/lib/cn.js"))).toBe(false);
  });
}
