import { expect, test } from "@rstest/core";
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { basename, join, resolve } from "node:path";
import { createInstallPlan } from "../cli/installer.js";

const frameworks = ["vue", "react", "svelte"];
const registryDirectory = resolve("registry");
const iconMetadata = JSON.parse(
  readFileSync(resolve("icons/metadata.json"), "utf8"),
);
const componentNames = readdirSync(registryDirectory)
  .filter((entry) => {
    const path = resolve(registryDirectory, entry);
    return statSync(path).isDirectory();
  })
  .sort();

function manifestFor(component) {
  return JSON.parse(
    readFileSync(
      resolve(registryDirectory, component, "registry.json"),
      "utf8",
    ),
  );
}

function filesFor(manifest, framework) {
  const contract = manifest.frameworks[framework];
  return (
    contract.files ?? [{ source: contract.source, target: contract.target }]
  );
}

function primaryComponentName(manifest) {
  const primary = filesFor(manifest, "vue").find(({ target }) =>
    target.endsWith(".vue"),
  );
  return basename(primary.target, ".vue");
}

test("the 0.0.2 package metadata describes the copied-source product", () => {
  const packageJson = JSON.parse(readFileSync(resolve("package.json"), "utf8"));

  expect(packageJson.name).toBe("klean-ui");
  expect(packageJson.version).toBe("0.0.2");
  expect(packageJson.homepage).toBe("https://docs.sailscasts.com/klean-ui/");
  expect(packageJson.files).toEqual([
    "bin",
    "cli",
    "registry",
    "skills",
    "README.md",
  ]);
  expect(packageJson.bin).toEqual({ "klean-ui": "bin/klean-ui.js" });
  expect(packageJson.dependencies).toHaveProperty("prettier");
  expect(packageJson.dependencies).toHaveProperty("make-synchronized");
  expect(packageJson.dependencies).not.toHaveProperty("prettier-plugin-svelte");
  expect(packageJson.devDependencies).toHaveProperty("prettier-plugin-svelte");
  expect(packageJson).not.toHaveProperty("peerDependencies");

  expect(existsSync(resolve("docs"))).toBe(false);
  expect(readFileSync(resolve("README.md"), "utf8")).toContain(
    "The canonical documentation lives at [docs.sailscasts.com/klean-ui]",
  );
  expect(existsSync(resolve("skills/klean-ui/SKILL.md"))).toBe(true);
  expect(readFileSync(resolve("skills/klean-ui/SKILL.md"), "utf8")).toContain(
    "name: klean-ui",
  );
});

test("every public registry item has complete framework-native source", () => {
  const iconNames = componentNames.filter((name) => name.startsWith("icon-"));
  const componentPrimitives = componentNames.filter(
    (name) => !name.startsWith("icon-"),
  );

  expect(componentPrimitives).toHaveLength(43);
  expect(iconNames).toHaveLength(iconMetadata.icons.length);
  expect(componentNames).toHaveLength(43 + iconMetadata.icons.length);

  const gaps = [];

  for (const component of componentNames) {
    const manifest = manifestFor(component);
    const frameworkNames = Object.keys(manifest.frameworks).sort();

    if (manifest.name !== component) {
      gaps.push(`${component}: manifest name is ${manifest.name}`);
    }
    if (
      JSON.stringify(frameworkNames) !== JSON.stringify([...frameworks].sort())
    ) {
      gaps.push(`${component}: frameworks are ${frameworkNames.join(", ")}`);
    }

    for (const dependency of manifest.registryDependencies ?? []) {
      if (!componentNames.includes(dependency)) {
        gaps.push(`${component}: unknown registry dependency ${dependency}`);
      }
    }

    for (const framework of frameworks) {
      const contract = manifest.frameworks[framework];
      if (!contract || typeof contract.dependencies !== "object") {
        gaps.push(`${component}/${framework}: missing dependency metadata`);
        continue;
      }

      for (const file of filesFor(manifest, framework)) {
        const source = resolve(registryDirectory, component, file.source);
        if (!existsSync(source)) {
          gaps.push(`${component}/${framework}: missing ${file.source}`);
        }
        const expectedDirectory =
          manifest.kind === "icon" ? "icons/" : `${component}/`;
        if (!file.target.startsWith(expectedDirectory)) {
          gaps.push(`${component}/${framework}: unconventional ${file.target}`);
        }
      }
    }
  }

  expect(gaps).toEqual([]);
});

test("every visual registry component is compiled through all three Storybooks", () => {
  const gaps = [];

  for (const component of componentNames) {
    const manifest = manifestFor(component);
    if (manifest.kind === "utility") continue;
    const componentName = primaryComponentName(manifest);
    const storyName = manifest.kind === "icon" ? "Icons" : componentName;
    const stories = [
      resolve("stories", `${storyName}.stories.js`),
      resolve("stories/react", `${storyName}.stories.jsx`),
      resolve("stories/svelte", `${storyName}.stories.js`),
    ];

    for (const story of stories) {
      if (!existsSync(story)) gaps.push(story);
    }
  }

  expect(gaps).toEqual([]);
});

test("the Vue workbench renders the source that consumers actually receive", () => {
  const applicationRoot = mkdtempSync(join(tmpdir(), "klean-release-vue-"));

  try {
    mkdirSync(resolve(applicationRoot, "assets/js"), { recursive: true });
    writeFileSync(
      resolve(applicationRoot, "package.json"),
      `${JSON.stringify({
        name: "klean-release-vue",
        private: true,
        dependencies: { sails: "^1.5.0", vue: "latest" },
      })}\n`,
    );
    writeFileSync(
      resolve(applicationRoot, "assets/js/app.js"),
      'import { createApp } from "vue";\n',
    );

    const drift = [];

    for (const component of componentNames) {
      const manifest = manifestFor(component);
      if (manifest.kind === "utility") continue;
      const plan = createInstallPlan(component, {
        cwd: applicationRoot,
        framework: "vue",
      });

      for (const file of plan.files.filter(
        (candidate) => candidate.component === component,
      )) {
        const workbenchSource =
          manifest.kind === "icon"
            ? resolve("src/vue/icons", basename(file.targetPath))
            : resolve("src/vue", component, basename(file.targetPath));

        if (!existsSync(workbenchSource)) {
          drift.push(`${component}: missing ${workbenchSource}`);
          continue;
        }
        if (file.registrySource !== readFileSync(workbenchSource, "utf8")) {
          drift.push(`${component}: ${basename(file.targetPath)} differs`);
        }
      }
    }

    expect(drift).toEqual([]);
  } finally {
    rmSync(applicationRoot, { recursive: true, force: true });
  }
});
