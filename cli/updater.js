import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import {
  applyInstallPlan,
  createInstallPlan,
  KleanInstallerError,
} from "./installer.js";
import { unarchiveSource } from "./source-archive.js";
import { createSourceFormatter } from "./source-formatter.js";

const CLI_DIRECTORY = dirname(fileURLToPath(import.meta.url));
const DEFAULT_REGISTRY_DIRECTORY = resolve(CLI_DIRECTORY, "../registry");
const DEPENDENCY_SECTIONS = [
  "dependencies",
  "devDependencies",
  "optionalDependencies",
  "peerDependencies",
];

function displayPath(path) {
  return path.split(sep).join("/");
}

export function hashSource(source) {
  return `sha256:${createHash("sha256").update(source).digest("hex")}`;
}

function readJson(path, label = path) {
  try {
    return JSON.parse(readFileSync(path, "utf8"));
  } catch (error) {
    throw new KleanInstallerError(`Could not read ${label}: ${error.message}`, {
      code: "INVALID_JSON",
      cause: error,
    });
  }
}

function registryDirectory(options) {
  return resolve(options.registryDirectory ?? DEFAULT_REGISTRY_DIRECTORY);
}

export function registryNames(options = {}) {
  const directory = registryDirectory(options);

  return readdirSync(directory, { withFileTypes: true })
    .filter(
      (entry) =>
        entry.isDirectory() &&
        existsSync(resolve(directory, entry.name, "registry.json")),
    )
    .map((entry) => entry.name)
    .sort();
}

function validSourceArchives(revision) {
  if (revision.sources === undefined) return true;
  if (!revision.sources || typeof revision.sources !== "object") return false;

  const files = Object.keys(revision.files ?? {});
  if (Object.keys(revision.sources).length !== files.length) return false;

  try {
    return files.every(
      (path) =>
        typeof revision.sources[path] === "string" &&
        revision.sources[path].startsWith("gzip:") &&
        hashSource(unarchiveSource(revision.sources[path])) ===
          revision.files[path],
    );
  } catch {
    return false;
  }
}

export function readRegistryLineage(options = {}) {
  const path = resolve(registryDirectory(options), "lineage.json");

  if (!existsSync(path)) {
    return { schemaVersion: 1, items: {} };
  }

  const lineage = readJson(path, "registry lineage");
  if (
    lineage.schemaVersion !== 1 ||
    !lineage.items ||
    typeof lineage.items !== "object" ||
    Array.isArray(lineage.items)
  ) {
    throw new KleanInstallerError("The registry lineage is invalid.", {
      code: "INVALID_REGISTRY",
    });
  }

  for (const [component, frameworks] of Object.entries(lineage.items)) {
    for (const [framework, revisions] of Object.entries(frameworks)) {
      let previousRevision = 0;

      if (!Array.isArray(revisions) || !revisions.length) {
        throw new KleanInstallerError(
          `The registry lineage for ${component}/${framework} is invalid.`,
          { code: "INVALID_REGISTRY" },
        );
      }

      for (const revision of revisions) {
        const validFiles =
          revision.files &&
          Object.keys(revision.files).length > 0 &&
          Object.values(revision.files).every((hash) =>
            /^sha256:[a-f0-9]{64}$/.test(hash),
          );
        const validSources = validSourceArchives(revision);
        const validRevision =
          Number.isInteger(revision.revision) &&
          revision.revision > previousRevision;
        const validDependencies =
          revision.dependencies &&
          typeof revision.dependencies === "object" &&
          !Array.isArray(revision.dependencies);
        const validNotes =
          Array.isArray(revision.migrationNotes) &&
          revision.migrationNotes.every(
            (note) => typeof note === "string" && note.length > 0,
          );

        if (
          !validFiles ||
          !validSources ||
          !validRevision ||
          !validDependencies ||
          !validNotes
        ) {
          throw new KleanInstallerError(
            `The registry lineage revision ${component}/${framework}/r${revision.revision ?? "?"} is invalid.`,
            { code: "INVALID_REGISTRY" },
          );
        }

        previousRevision = revision.revision;
      }
    }
  }

  return lineage;
}

function revisionsFor(lineage, component, framework) {
  return lineage.items?.[component]?.[framework] ?? [];
}

function ownedFiles(plan, component) {
  return plan.files.filter((file) => file.component === component);
}

function matchesRevision(files, revision, sourceFormatter) {
  const existingFiles = files.filter(
    (file) => file.currentSource !== undefined,
  );
  const revisionFiles = Object.entries(revision.files ?? {});

  if (existingFiles.length !== revisionFiles.length) return false;

  const currentByPath = new Map(
    existingFiles.map((file) => [file.displayPath, file.currentSource]),
  );

  const exactMatch = revisionFiles.every(
    ([path, hash]) =>
      currentByPath.has(path) && hashSource(currentByPath.get(path)) === hash,
  );

  if (exactMatch) return true;
  if (!sourceFormatter || !revision.sources) return false;

  const filesByPath = new Map(
    existingFiles.map((file) => [file.displayPath, file]),
  );

  return revisionFiles.every(([path]) => {
    const file = filesByPath.get(path);
    const archivedSource = revision.sources[path];
    if (!file || !archivedSource) return false;

    return sourceFormatter.equivalent(
      file.currentSource,
      unarchiveSource(archivedSource),
      file.targetPath,
    );
  });
}

function knownRevision(files, revisions, sourceFormatter) {
  return [...revisions]
    .reverse()
    .find((revision) => matchesRevision(files, revision, sourceFormatter));
}

function classifyItem(plan, component, lineage, sourceFormatter) {
  const files = ownedFiles(plan, component);
  const existingFiles = files.filter(
    (file) => file.currentSource !== undefined,
  );
  const revisions = revisionsFor(lineage, component, plan.framework);
  const latestRevision = revisions.at(-1);

  if (!existingFiles.length) {
    return {
      component,
      status: "absent",
      files,
      revisions,
      latestRevision,
    };
  }

  if (
    existingFiles.length === files.length &&
    files.every((file) => file.currentSource === file.registrySource)
  ) {
    return {
      component,
      status: "current",
      files,
      revisions,
      latestRevision,
      matchedRevision: latestRevision,
    };
  }

  const matchedRevision = knownRevision(files, revisions, sourceFormatter);
  const matchesLatest =
    matchedRevision &&
    latestRevision &&
    matchedRevision.revision === latestRevision.revision;

  return {
    component,
    status: matchedRevision
      ? matchesLatest
        ? "current"
        : "update"
      : "modified",
    files,
    revisions,
    latestRevision,
    matchedRevision,
  };
}

function packageDependencies(packagePath) {
  const packageJson = readJson(packagePath, packagePath);

  return Object.assign(
    {},
    ...DEPENDENCY_SECTIONS.map((section) => packageJson[section] ?? {}),
  );
}

function dependencyAssessment(plan, states = [], overwrite = false) {
  const currentDependencies = packageDependencies(plan.packagePath);
  const changes = plan.dependencies
    .map((dependency) => {
      const currentVersion = currentDependencies[dependency.name];
      const knownVersions = new Set(
        states.flatMap((state) =>
          state.revisions
            .map((revision) => revision.dependencies?.[dependency.name])
            .filter(Boolean),
        ),
      );

      return {
        ...dependency,
        currentVersion,
        missing: !currentVersion,
        safe:
          !currentVersion ||
          currentVersion === dependency.version ||
          knownVersions.has(currentVersion) ||
          overwrite,
      };
    })
    .filter(({ currentVersion, version }) => currentVersion !== version);

  return {
    changes: changes.filter((dependency) => dependency.safe),
    conflicts: changes.filter((dependency) => !dependency.safe),
  };
}

function listFiles(directory) {
  if (!existsSync(directory)) return [];

  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = resolve(directory, entry.name);
    return entry.isDirectory() ? listFiles(path) : [path];
  });
}

function installOptions(options) {
  return {
    cwd: options.cwd,
    registryDirectory: options.registryDirectory,
    framework: options.framework,
    componentsDirectory: options.componentsDirectory,
    cssPath: options.cssPath,
    dryRun: options.dryRun,
  };
}

export function createCheckReport(options = {}) {
  const names = registryNames(options);
  const lineage = readRegistryLineage(options);
  const plans = names.map((component) =>
    createInstallPlan(component, installOptions(options)),
  );
  const detectionPlan = plans[0];
  const sourceFormatter =
    options.sourceFormatter ??
    (detectionPlan ? createSourceFormatter(detectionPlan.root) : undefined);
  const knownTargets = new Set();
  const entries = [];

  for (const [index, component] of names.entries()) {
    const plan = plans[index];
    const state = classifyItem(plan, component, lineage, sourceFormatter);
    const states = plan.registryItems.map((item) =>
      classifyItem(plan, item, lineage, sourceFormatter),
    );

    for (const file of state.files) knownTargets.add(file.targetPath);
    if (state.status === "absent") continue;

    const dependencyResult = dependencyAssessment(plan, states);
    const dependencies = dependencyResult.changes;
    const dependencyConflicts = dependencyResult.conflicts;
    entries.push({
      ...state,
      plan,
      dependencies,
      dependencyConflicts,
      sourceStatus: state.status,
      status:
        dependencyConflicts.length || state.status === "modified"
          ? "modified"
          : state.status === "current" && dependencies.length
            ? "update"
            : state.status,
    });
  }

  const untracked = listFiles(detectionPlan?.componentsDirectory).filter(
    (path) => !knownTargets.has(path),
  );
  const attention =
    entries.some((entry) => entry.status !== "current") || untracked.length > 0;

  return {
    detectionPlan,
    entries,
    untracked: untracked.map((path) => ({
      path,
      displayPath: displayPath(
        relative(detectionPlan.componentsDirectory, path),
      ),
    })),
    exitCode: attention ? 2 : 0,
  };
}

function revisionLabel(revision) {
  return revision ? `r${revision.revision}` : "an unknown revision";
}

export function formatCheckReport(report) {
  const lines = [];

  for (const entry of report.entries) {
    if (entry.status === "current") {
      lines.push(`✓ ${entry.component} is current`);
    } else if (entry.status === "update") {
      lines.push(
        entry.sourceStatus === "current"
          ? `↑ ${entry.component} needs a direct dependency update`
          : `↑ ${entry.component} has an update (${revisionLabel(entry.matchedRevision)} → ${revisionLabel(entry.latestRevision)})`,
      );
    } else {
      lines.push(`! ${entry.component} has local changes`);
    }
  }

  for (const file of report.untracked) {
    lines.push(`? ${file.displayPath} is not tracked by Klean UI`);
  }

  if (!lines.length) {
    return "No Klean UI components were found in the conventional components directory.";
  }

  lines.push("");
  lines.push(
    report.exitCode === 0
      ? "Everything is current."
      : report.entries.some((entry) => entry.status !== "current")
        ? "Run `klean-ui diff <component>` before updating anything that needs attention."
        : "Untracked source remains application-owned and will not be changed by Klean UI.",
  );

  return lines.join("\n");
}

function migrationNotes(state) {
  if (!state.matchedRevision) return [];
  const matchedIndex = state.revisions.findIndex(
    (revision) => revision.revision === state.matchedRevision.revision,
  );

  return state.revisions
    .slice(matchedIndex + 1)
    .flatMap((revision) => revision.migrationNotes ?? []);
}

function updateFileActions(state, overwrite) {
  if (state.status === "absent") {
    return state.files.map((file) => ({ ...file, action: "create" }));
  }

  if (state.status === "current") {
    return state.files.map((file) => ({ ...file, action: "unchanged" }));
  }

  if (state.status === "update") {
    return state.files.map((file) => ({
      ...file,
      action:
        file.currentSource === undefined
          ? "create"
          : file.currentSource === file.registrySource
            ? "unchanged"
            : "update",
    }));
  }

  return state.files.map((file) => ({
    ...file,
    action:
      file.currentSource === file.registrySource
        ? "unchanged"
        : overwrite
          ? file.currentSource === undefined
            ? "create"
            : "overwrite"
          : "conflict",
    difference:
      file.currentSource === undefined
        ? "The installed component is incomplete and does not match a known Klean revision."
        : file.difference,
  }));
}

export function createUpdatePlan(component, options = {}) {
  const lineage = readRegistryLineage(options);
  const plan = createInstallPlan(component, installOptions(options));
  const sourceFormatter =
    options.sourceFormatter ?? createSourceFormatter(plan.root);
  const states = plan.registryItems.map((item) =>
    classifyItem(plan, item, lineage, sourceFormatter),
  );
  const rootState = states.find((state) => state.component === component);

  if (!rootState || rootState.status === "absent") {
    throw new KleanInstallerError(
      `${component} is not installed. Use \`klean-ui add ${component}\` instead.`,
      { code: "NOT_INSTALLED", plan },
    );
  }

  const files = states.flatMap((state) =>
    updateFileActions(state, Boolean(options.overwrite)),
  );
  const dependencyResult = dependencyAssessment(
    plan,
    states,
    Boolean(options.overwrite),
  );
  const dependenciesToInstall = dependencyResult.changes;
  const notes = states.flatMap((state) =>
    migrationNotes(state).map((note) => ({
      component: state.component,
      note,
    })),
  );

  return {
    ...plan,
    operation: "update",
    files,
    file: files.length === 1 ? files[0] : undefined,
    states,
    status: rootState.status,
    dependenciesToInstall,
    dependencyConflicts: dependencyResult.conflicts,
    migrationNotes: notes,
    overwrite: Boolean(options.overwrite),
    dryRun: Boolean(options.dryRun),
    hasConflicts:
      files.some((file) => file.action === "conflict") ||
      dependencyResult.conflicts.length > 0,
    updateAvailable:
      files.some((file) =>
        ["create", "update", "overwrite"].includes(file.action),
      ) || dependenciesToInstall.length > 0,
  };
}

function splitLines(source) {
  if (!source) return [];
  const normalized = source.endsWith("\n") ? source.slice(0, -1) : source;
  return normalized ? normalized.split("\n") : [];
}

function diffOperations(before, after) {
  const left = splitLines(before);
  const right = splitLines(after);
  const matrix = Array.from(
    { length: left.length + 1 },
    () => new Uint32Array(right.length + 1),
  );

  for (let leftIndex = left.length - 1; leftIndex >= 0; leftIndex -= 1) {
    for (let rightIndex = right.length - 1; rightIndex >= 0; rightIndex -= 1) {
      matrix[leftIndex][rightIndex] =
        left[leftIndex] === right[rightIndex]
          ? matrix[leftIndex + 1][rightIndex + 1] + 1
          : Math.max(
              matrix[leftIndex + 1][rightIndex],
              matrix[leftIndex][rightIndex + 1],
            );
    }
  }

  const operations = [];
  let leftIndex = 0;
  let rightIndex = 0;

  while (leftIndex < left.length || rightIndex < right.length) {
    if (
      leftIndex < left.length &&
      rightIndex < right.length &&
      left[leftIndex] === right[rightIndex]
    ) {
      operations.push({ type: "equal", line: left[leftIndex] });
      leftIndex += 1;
      rightIndex += 1;
    } else if (
      rightIndex < right.length &&
      (leftIndex === left.length ||
        matrix[leftIndex][rightIndex + 1] > matrix[leftIndex + 1][rightIndex])
    ) {
      operations.push({ type: "add", line: right[rightIndex] });
      rightIndex += 1;
    } else {
      operations.push({ type: "delete", line: left[leftIndex] });
      leftIndex += 1;
    }
  }

  return operations;
}

export function unifiedDiff(before, after, path, context = 3) {
  const operations = diffOperations(before, after);
  const changed = operations
    .map((operation, index) => (operation.type === "equal" ? -1 : index))
    .filter((index) => index !== -1);

  if (!changed.length) return "";

  const ranges = [];
  for (const index of changed) {
    const start = Math.max(0, index - context);
    const end = Math.min(operations.length, index + context + 1);
    const previous = ranges.at(-1);
    if (previous && start <= previous.end)
      previous.end = Math.max(previous.end, end);
    else ranges.push({ start, end });
  }

  const oldLinesBefore = (index) =>
    operations.slice(0, index).filter((operation) => operation.type !== "add")
      .length;
  const newLinesBefore = (index) =>
    operations
      .slice(0, index)
      .filter((operation) => operation.type !== "delete").length;

  const lines = [`--- application/${path}`, `+++ registry/${path}`];

  for (const range of ranges) {
    const hunk = operations.slice(range.start, range.end);
    const oldStart = oldLinesBefore(range.start) + 1;
    const newStart = newLinesBefore(range.start) + 1;
    const oldCount = hunk.filter(
      (operation) => operation.type !== "add",
    ).length;
    const newCount = hunk.filter(
      (operation) => operation.type !== "delete",
    ).length;
    lines.push(`@@ -${oldStart},${oldCount} +${newStart},${newCount} @@`);
    lines.push(
      ...hunk.map(
        (operation) =>
          `${{ equal: " ", add: "+", delete: "-" }[operation.type]}${operation.line}`,
      ),
    );
  }

  return lines.join("\n");
}

export function createDiffReport(component, options = {}) {
  const plan = createUpdatePlan(component, options);
  const files = plan.files
    .filter((file) => file.action !== "unchanged")
    .map((file) => ({
      ...file,
      diff: unifiedDiff(
        file.currentSource ?? "",
        file.registrySource,
        file.displayPath,
      ),
    }));

  return {
    plan,
    files,
    dependencies: plan.dependenciesToInstall,
    dependencyConflicts: plan.dependencyConflicts,
    migrationNotes: plan.migrationNotes,
    exitCode:
      files.length ||
      plan.dependenciesToInstall.length ||
      plan.dependencyConflicts.length
        ? 2
        : 0,
  };
}

export function formatDiffReport(report) {
  const lines = [];

  for (const state of report.plan.states) {
    if (state.status === "update") {
      lines.push(
        `${state.component}: ${revisionLabel(state.matchedRevision)} → ${revisionLabel(state.latestRevision)}`,
      );
    } else if (state.status === "modified") {
      lines.push(
        `${state.component}: local source is not a known Klean revision`,
      );
    }
  }

  if (lines.length) lines.push("");
  for (const file of report.files) {
    lines.push(file.diff, "");
  }

  if (report.dependencies.length) {
    lines.push("Dependencies:");
    for (const dependency of report.dependencies) {
      lines.push(
        `- ${dependency.name}@${dependency.currentVersion ?? "not installed"}`,
        `+ ${dependency.name}@${dependency.version}`,
      );
    }
    lines.push("");
  }

  if (report.dependencyConflicts.length) {
    lines.push("Dependencies requiring review:");
    for (const dependency of report.dependencyConflicts) {
      lines.push(
        `! ${dependency.name}@${dependency.currentVersion} is application-owned; Klean currently requires ${dependency.version}`,
      );
    }
    lines.push("");
  }

  if (report.migrationNotes.length) {
    lines.push("Migration notes:");
    for (const note of report.migrationNotes) {
      lines.push(`- ${note.component}: ${note.note}`);
    }
    lines.push("");
  }

  if (
    !report.files.length &&
    !report.dependencies.length &&
    !report.dependencyConflicts.length
  ) {
    lines.push(
      `${report.plan.component} is current; there is no upstream diff.`,
    );
  }

  return lines.join("\n").trimEnd();
}

function mergePlans(plans, check, options) {
  const basePlan = plans[0] ?? check.detectionPlan;
  const fileMap = new Map();
  const dependencyMap = new Map();
  const actionPriority = {
    unchanged: 0,
    create: 1,
    update: 2,
    overwrite: 3,
  };

  for (const plan of plans) {
    for (const file of plan.files) {
      if (file.action === "unchanged") continue;
      const current = fileMap.get(file.targetPath);

      if (current && current.registrySource !== file.registrySource) {
        throw new KleanInstallerError(
          `Update plans disagree about ${file.displayPath}.`,
          { code: "INVALID_REGISTRY" },
        );
      }

      if (
        !current ||
        actionPriority[file.action] > actionPriority[current.action]
      ) {
        fileMap.set(file.targetPath, file);
      }
    }

    for (const dependency of plan.dependenciesToInstall) {
      const current = dependencyMap.get(dependency.name);
      if (current && current.version !== dependency.version) {
        throw new KleanInstallerError(
          `Update plans require conflicting versions of ${dependency.name}.`,
          { code: "INVALID_REGISTRY" },
        );
      }
      dependencyMap.set(dependency.name, dependency);
    }
  }

  return {
    ...basePlan,
    operation: "update",
    component: "installed components",
    components: plans.map((plan) => plan.component),
    files: [...fileMap.values()],
    file: undefined,
    dependenciesToInstall: [...dependencyMap.values()],
    missingDependencies: [...dependencyMap.values()].filter(
      (dependency) => dependency.missing,
    ),
    dryRun: Boolean(options.dryRun),
    overwrite: Boolean(options.overwrite),
  };
}

export function createUpdateAllPlan(options = {}) {
  const check = createCheckReport(options);
  const candidates = [];
  const skipped = [];

  for (const entry of check.entries) {
    const plan = createUpdatePlan(entry.component, options);

    if (plan.hasConflicts && !options.overwrite) {
      skipped.push({
        component: entry.component,
        reason: "local changes",
      });
      continue;
    }

    if (plan.updateAvailable) candidates.push(plan);
  }

  for (const file of check.untracked) {
    skipped.push({ component: file.displayPath, reason: "untracked source" });
  }

  return {
    plan: mergePlans(candidates, check, options),
    check,
    skipped,
  };
}

export function applyUpdatePlan(plan, options = {}) {
  if (plan.dependencyConflicts?.length) {
    const dependency = plan.dependencyConflicts[0];
    throw new KleanInstallerError(
      `${dependency.name}@${dependency.currentVersion} does not match a known Klean dependency revision and was not replaced. Re-run with \`--overwrite\` only if changing the application-owned dependency is intentional.`,
      { code: "DEPENDENCY_CONFLICT", plan },
    );
  }

  return applyInstallPlan(plan, options);
}

export function formatUpdateResult(result, options = {}) {
  const plan = result.plan;
  const lines = [];

  for (const file of plan.files) {
    const message = result.dryRun
      ? {
          create: `○ Would add ${file.displayPath}`,
          update: `○ Would update ${file.displayPath}`,
          overwrite: `○ Would overwrite ${file.displayPath}`,
        }[file.action]
      : {
          create: `✓ Added ${file.displayPath}`,
          update: `✓ Updated ${file.displayPath}`,
          overwrite: `✓ Replaced ${file.displayPath}`,
        }[file.action];
    if (message) lines.push(message);
  }

  for (const dependency of plan.dependenciesToInstall) {
    lines.push(
      result.dryRun
        ? `○ Would set ${dependency.name}@${dependency.version}`
        : `✓ Set ${dependency.name}@${dependency.version}`,
    );
  }

  for (const skipped of options.skipped ?? []) {
    lines.push(`! Skipped ${skipped.component}: ${skipped.reason}`);
  }

  if (!lines.length) lines.push("Everything is already current.");
  return lines.join("\n");
}
