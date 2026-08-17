import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createInstallPlan } from "../cli/installer.js";
import {
  hashSource,
  readRegistryLineage,
  registryNames,
} from "../cli/updater.js";

const SCRIPT_DIRECTORY = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(SCRIPT_DIRECTORY, "..");
const REGISTRY_DIRECTORY = resolve(ROOT, "registry");
const LINEAGE_PATH = resolve(REGISTRY_DIRECTORY, "lineage.json");
const FRAMEWORKS = {
  vue: {
    dependency: "vue",
    entry: 'import { createApp } from "vue";\n',
  },
  react: {
    dependency: "react",
    entry: 'import { createRoot } from "react-dom/client";\n',
  },
  svelte: {
    dependency: "svelte",
    entry: 'import { mount } from "svelte";\n',
  },
};

function argumentValue(name) {
  const index = process.argv.indexOf(name);
  return index === -1 ? undefined : process.argv[index + 1];
}

const checkOnly = process.argv.includes("--check");
const migrationNote = argumentValue("--note");
const temporaryRoots = [];

function write(path, source) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, source);
}

function makeApplication(framework) {
  const root = mkdtempSync(join(tmpdir(), `klean-lineage-${framework}-`));
  temporaryRoots.push(root);
  const fixture = FRAMEWORKS[framework];
  write(
    resolve(root, "package.json"),
    `${JSON.stringify(
      {
        name: `klean-lineage-${framework}`,
        private: true,
        dependencies: {
          sails: "^1.5.0",
          [fixture.dependency]: "latest",
        },
      },
      null,
      2,
    )}\n`,
  );
  write(resolve(root, "package-lock.json"), "{}\n");
  write(resolve(root, "assets/js/app.js"), fixture.entry);
  return root;
}

function sameSnapshot(left, right) {
  return JSON.stringify(left) === JSON.stringify(right);
}

try {
  const lineage = readRegistryLineage({
    registryDirectory: REGISTRY_DIRECTORY,
  });
  const next = {
    $schema: "./lineage.schema.json",
    schemaVersion: 1,
    items: structuredClone(lineage.items ?? {}),
  };
  const applications = Object.fromEntries(
    Object.keys(FRAMEWORKS).map((framework) => [
      framework,
      makeApplication(framework),
    ]),
  );
  const changed = [];

  for (const component of registryNames({
    registryDirectory: REGISTRY_DIRECTORY,
  })) {
    const manifest = JSON.parse(
      readFileSync(
        resolve(REGISTRY_DIRECTORY, component, "registry.json"),
        "utf8",
      ),
    );
    next.items[component] ??= {};

    for (const framework of Object.keys(FRAMEWORKS)) {
      const plan = createInstallPlan(component, {
        cwd: applications[framework],
        registryDirectory: REGISTRY_DIRECTORY,
        framework,
      });
      const files = Object.fromEntries(
        plan.files
          .filter((file) => file.component === component)
          .map((file) => [file.displayPath, hashSource(file.registrySource)]),
      );
      const snapshot = {
        files,
        dependencies: manifest.frameworks[framework].dependencies ?? {},
      };
      const revisions = next.items[component][framework] ?? [];
      const current = revisions.at(-1);
      const currentSnapshot = current
        ? { files: current.files, dependencies: current.dependencies }
        : undefined;

      if (currentSnapshot && sameSnapshot(currentSnapshot, snapshot)) {
        next.items[component][framework] = revisions;
        continue;
      }

      changed.push(`${component}/${framework}`);
      if (checkOnly) continue;

      if (current && !migrationNote) {
        throw new Error(
          `${component}/${framework} changed. Re-run with --note "<migration note>" so the new revision is deliberate.`,
        );
      }

      next.items[component][framework] = [
        ...revisions,
        {
          revision: (current?.revision ?? 0) + 1,
          ...snapshot,
          migrationNotes: migrationNote ? [migrationNote] : [],
        },
      ];
    }
  }

  if (checkOnly) {
    if (changed.length) {
      process.stderr.write(
        `Registry lineage is stale for ${changed.join(", ")}.\n`,
      );
      process.exitCode = 1;
    } else {
      process.stdout.write("Registry lineage matches every current source.\n");
    }
  } else {
    writeFileSync(LINEAGE_PATH, `${JSON.stringify(next, null, 2)}\n`);
    process.stdout.write(
      changed.length
        ? `Recorded ${changed.length} registry revisions.\n`
        : "Registry lineage was already current.\n",
    );
  }
} finally {
  for (const root of temporaryRoots) {
    rmSync(root, { recursive: true, force: true });
  }
}
