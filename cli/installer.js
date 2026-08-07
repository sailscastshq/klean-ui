import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  renameSync,
  rmdirSync,
  unlinkSync,
  writeFileSync,
} from "node:fs";
import { spawnSync } from "node:child_process";
import {
  basename,
  dirname,
  isAbsolute,
  relative,
  resolve,
  sep,
} from "node:path";
import { fileURLToPath } from "node:url";

const CLI_DIRECTORY = dirname(fileURLToPath(import.meta.url));
const DEFAULT_REGISTRY_DIRECTORY = resolve(CLI_DIRECTORY, "../registry");
const DEFAULT_COMPONENTS_DIRECTORY = "assets/js/components/ui";
const DEFAULT_CSS_PATH = "assets/css/app.css";
const SUPPORTED_FRAMEWORKS = ["vue", "react", "svelte"];
const DEPENDENCY_SECTIONS = [
  "dependencies",
  "devDependencies",
  "optionalDependencies",
  "peerDependencies",
];
const LOCKFILES = [
  "package-lock.json",
  "npm-shrinkwrap.json",
  "pnpm-lock.yaml",
  "yarn.lock",
  "bun.lock",
  "bun.lockb",
];
const ENTRY_BASENAMES = ["app", "main"];
const ENTRY_EXTENSIONS = ["js", "jsx", "mjs", "mts", "ts", "tsx"];

const FRAMEWORK_PACKAGES = {
  vue: ["vue", "@inertiajs/vue3", "@rsbuild/plugin-vue"],
  react: ["react", "react-dom", "@inertiajs/react", "@rsbuild/plugin-react"],
  svelte: [
    "svelte",
    "@inertiajs/svelte",
    "@rsbuild/plugin-svelte",
    "@sveltejs/vite-plugin-svelte",
  ],
};

const ENTRY_PATTERNS = {
  vue: [
    /from\s+["']vue["']/,
    /from\s+["']@inertiajs\/vue3["']/,
    /require\(["']vue["']\)/,
    /require\(["']@inertiajs\/vue3["']\)/,
  ],
  react: [
    /from\s+["']react(?:\/jsx-runtime)?["']/,
    /from\s+["']react-dom(?:\/client)?["']/,
    /from\s+["']@inertiajs\/react["']/,
    /require\(["']react(?:-dom(?:\/client)?)?["']\)/,
  ],
  svelte: [
    /from\s+["']svelte["']/,
    /from\s+["']@inertiajs\/svelte["']/,
    /require\(["']svelte["']\)/,
    /require\(["']@inertiajs\/svelte["']\)/,
  ],
};

export class KleanInstallerError extends Error {
  constructor(message, options = {}) {
    super(message);
    this.name = "KleanInstallerError";
    this.code = options.code ?? "INSTALLER_ERROR";
    this.plan = options.plan;
    this.cause = options.cause;
  }
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

function dependencyMap(packageJson) {
  return Object.assign(
    {},
    ...DEPENDENCY_SECTIONS.map((section) => packageJson[section] ?? {}),
  );
}

function isSailsApplication(packageJson) {
  return Boolean(dependencyMap(packageJson).sails);
}

export function findApplicationRoot(startDirectory = process.cwd()) {
  let currentDirectory = resolve(startDirectory);
  const inspectedPackages = [];

  while (true) {
    const packagePath = resolve(currentDirectory, "package.json");

    if (existsSync(packagePath)) {
      const packageJson = readJson(packagePath, packagePath);
      inspectedPackages.push(packagePath);

      if (isSailsApplication(packageJson)) {
        return {
          root: currentDirectory,
          packagePath,
          packageJson,
        };
      }
    }

    const parentDirectory = dirname(currentDirectory);
    if (parentDirectory === currentDirectory) break;
    currentDirectory = parentDirectory;
  }

  const evidence = inspectedPackages.length
    ? ` Inspected ${inspectedPackages.map((path) => displayPath(path)).join(", ")}.`
    : " No package.json was found in this directory or its parents.";

  throw new KleanInstallerError(
    `Klean UI could not find a Boring Stack Sails application.${evidence} A supported app declares \`sails\` as a direct dependency.`,
    { code: "NOT_SAILS" },
  );
}

function conventionalEntries(root) {
  const entries = [];

  for (const basename of ENTRY_BASENAMES) {
    for (const extension of ENTRY_EXTENSIONS) {
      const path = resolve(root, "assets/js", `${basename}.${extension}`);
      if (existsSync(path)) entries.push(path);
    }
  }

  return entries;
}

function packageEvidence(packageJson) {
  const dependencies = dependencyMap(packageJson);

  return Object.fromEntries(
    SUPPORTED_FRAMEWORKS.map((framework) => [
      framework,
      FRAMEWORK_PACKAGES[framework].filter((name) => dependencies[name]),
    ]),
  );
}

function entryEvidence(root) {
  return conventionalEntries(root).map((path) => {
    const source = readFileSync(path, "utf8");
    const frameworks = SUPPORTED_FRAMEWORKS.filter((framework) =>
      ENTRY_PATTERNS[framework].some((pattern) => pattern.test(source)),
    );

    return {
      path,
      frameworks,
    };
  });
}

function evidenceSummary(root, entries, packages) {
  const entryParts = entries
    .filter((entry) => entry.frameworks.length)
    .map(
      (entry) =>
        `${displayRelativePath(root, entry.path)} (${entry.frameworks.join(", ")})`,
    );
  const packageParts = SUPPORTED_FRAMEWORKS.filter(
    (framework) => packages[framework].length,
  ).map((framework) => `${framework} (${packages[framework].join(", ")})`);

  return [
    entryParts.length ? `entries: ${entryParts.join("; ")}` : "entries: none",
    packageParts.length
      ? `packages: ${packageParts.join("; ")}`
      : "packages: none",
  ].join("; ");
}

export function detectFramework(root, packageJson, explicitFramework) {
  if (explicitFramework && !SUPPORTED_FRAMEWORKS.includes(explicitFramework)) {
    throw new KleanInstallerError(
      `Unsupported framework \`${explicitFramework}\`. Use vue, react, or svelte.`,
      { code: "UNSUPPORTED_FRAMEWORK" },
    );
  }

  const entries = entryEvidence(root);
  const packages = packageEvidence(packageJson);
  const summary = evidenceSummary(root, entries, packages);

  if (explicitFramework) {
    return {
      framework: explicitFramework,
      source: "override",
      evidence: summary,
    };
  }

  const entryFrameworks = [
    ...new Set(entries.flatMap((entry) => entry.frameworks)),
  ];
  const packageFrameworks = SUPPORTED_FRAMEWORKS.filter(
    (framework) => packages[framework].length,
  );

  if (entryFrameworks.length > 1) {
    throw new KleanInstallerError(
      `Klean UI found ambiguous framework evidence (${summary}). Remove the stale entry evidence or pass \`--framework vue|react|svelte\`.`,
      { code: "AMBIGUOUS_FRAMEWORK" },
    );
  }

  if (entryFrameworks.length === 1) {
    const framework = entryFrameworks[0];

    if (packageFrameworks.length === 1 && packageFrameworks[0] !== framework) {
      throw new KleanInstallerError(
        `Klean UI found conflicting framework evidence (${summary}). Fix the application entry or pass \`--framework vue|react|svelte\`.`,
        { code: "AMBIGUOUS_FRAMEWORK" },
      );
    }

    return {
      framework,
      source: "entry",
      evidence: summary,
    };
  }

  if (packageFrameworks.length === 1) {
    return {
      framework: packageFrameworks[0],
      source: "package",
      evidence: summary,
    };
  }

  const reason = packageFrameworks.length
    ? "ambiguous framework packages"
    : "no supported framework evidence";

  throw new KleanInstallerError(
    `Klean UI found ${reason} (${summary}). Pass \`--framework vue|react|svelte\` only when the non-standard application shape is intentional.`,
    { code: "AMBIGUOUS_FRAMEWORK" },
  );
}

function ensureInsideRoot(root, configuredPath, label) {
  const absolutePath = isAbsolute(configuredPath)
    ? resolve(configuredPath)
    : resolve(root, configuredPath);
  const relativePath = relative(root, absolutePath);

  if (
    relativePath === ".." ||
    relativePath.startsWith(`..${sep}`) ||
    isAbsolute(relativePath)
  ) {
    throw new KleanInstallerError(
      `${label} must stay inside the detected application root (${root}). Received ${configuredPath}.`,
      { code: "UNSAFE_PATH" },
    );
  }

  return absolutePath;
}

function validateRegistryPath(root, path, label) {
  const absolutePath = resolve(root, path);
  const relativePath = relative(root, absolutePath);

  if (
    relativePath === ".." ||
    relativePath.startsWith(`..${sep}`) ||
    isAbsolute(relativePath)
  ) {
    throw new KleanInstallerError(`${label} escapes its registry item.`, {
      code: "INVALID_REGISTRY",
    });
  }

  return absolutePath;
}

function loadRegistryItem(component, registryDirectory) {
  if (!/^[a-z0-9-]+$/.test(component)) {
    throw new KleanInstallerError(
      `Invalid component name \`${component}\`. Component names use lowercase letters, numbers, and hyphens.`,
      { code: "INVALID_COMPONENT" },
    );
  }

  const itemDirectory = resolve(registryDirectory, component);
  const manifestPath = resolve(itemDirectory, "registry.json");

  if (!existsSync(manifestPath)) {
    throw new KleanInstallerError(
      `Klean UI does not have a registry item named \`${component}\`.`,
      { code: "UNKNOWN_COMPONENT" },
    );
  }

  const manifest = readJson(manifestPath, `${component} registry manifest`);

  if (manifest.name !== component || !manifest.frameworks) {
    throw new KleanInstallerError(
      `The ${component} registry manifest is invalid.`,
      { code: "INVALID_REGISTRY" },
    );
  }

  return {
    directory: itemDirectory,
    manifest,
  };
}

function frameworkFiles(component, frameworkItem) {
  const files =
    frameworkItem.files ??
    (frameworkItem.source && frameworkItem.target
      ? [{ source: frameworkItem.source, target: frameworkItem.target }]
      : []);

  if (!files.length) {
    throw new KleanInstallerError(
      `The ${component} registry item does not declare any source files.`,
      { code: "INVALID_REGISTRY" },
    );
  }

  return files;
}

function resolveRegistryItems(
  component,
  framework,
  registryDirectory,
  state = {
    visiting: [],
    resolved: new Map(),
  },
) {
  if (state.resolved.has(component)) return state;

  if (state.visiting.includes(component)) {
    const cycle = [...state.visiting, component].join(" -> ");
    throw new KleanInstallerError(
      `Klean UI found a registry dependency cycle: ${cycle}.`,
      { code: "INVALID_REGISTRY" },
    );
  }

  const registryItem = loadRegistryItem(component, registryDirectory);
  const frameworkItem = registryItem.manifest.frameworks[framework];

  if (!frameworkItem) {
    throw new KleanInstallerError(
      `The ${component} registry item does not support ${framework}.`,
      { code: "UNSUPPORTED_COMPONENT_FRAMEWORK" },
    );
  }

  state.visiting.push(component);

  for (const dependency of registryItem.manifest.registryDependencies ?? []) {
    resolveRegistryItems(dependency, framework, registryDirectory, state);
  }

  state.visiting.pop();
  state.resolved.set(component, {
    component,
    directory: registryItem.directory,
    manifest: registryItem.manifest,
    frameworkItem,
  });

  return state;
}

function hasDirectDependency(packageJson, dependency) {
  return DEPENDENCY_SECTIONS.some(
    (section) => packageJson[section]?.[dependency],
  );
}

export function detectPackageManager(root, packageJson) {
  const declaredManager = packageJson.packageManager?.split("@")[0];

  if (["npm", "pnpm", "yarn", "bun"].includes(declaredManager)) {
    return declaredManager;
  }

  const lockfileManagers = [
    ["pnpm", "pnpm-lock.yaml"],
    ["yarn", "yarn.lock"],
    ["bun", "bun.lock"],
    ["bun", "bun.lockb"],
    ["npm", "package-lock.json"],
    ["npm", "npm-shrinkwrap.json"],
  ].filter(([, lockfile]) => existsSync(resolve(root, lockfile)));
  const managers = [...new Set(lockfileManagers.map(([manager]) => manager))];

  if (managers.length > 1) {
    throw new KleanInstallerError(
      `Klean UI found lockfiles for multiple package managers (${lockfileManagers
        .map(([, lockfile]) => lockfile)
        .join(
          ", ",
        )}). Remove stale lockfiles or declare \`packageManager\` in package.json.`,
      { code: "AMBIGUOUS_PACKAGE_MANAGER" },
    );
  }

  return managers[0] ?? "npm";
}

function firstDifference(currentSource, registrySource) {
  const currentLines = currentSource.split("\n");
  const registryLines = registrySource.split("\n");
  const maximum = Math.max(currentLines.length, registryLines.length);
  let lineIndex = 0;

  while (
    lineIndex < maximum &&
    currentLines[lineIndex] === registryLines[lineIndex]
  ) {
    lineIndex += 1;
  }

  const currentLine = currentLines[lineIndex] ?? "<end of file>";
  const registryLine = registryLines[lineIndex] ?? "<end of file>";

  return [
    `First difference at line ${lineIndex + 1}:`,
    `- ${currentLine}`,
    `+ ${registryLine}`,
  ].join("\n");
}

function displayPath(path) {
  return path.split(sep).join("/");
}

function displayRelativePath(root, path) {
  const relativePath = relative(root, path);
  return displayPath(relativePath || ".");
}

function rewriteRegistryImports(
  registrySource,
  sourcePath,
  targetPath,
  sourceTargets,
) {
  return registrySource.replace(
    /(["'])(\.\.?\/[^"']+)\1/g,
    (match, quote, specifier) => {
      const [, importedPath, suffix = ""] =
        specifier.match(/^([^?#]+)([?#].*)?$/) ?? [];
      if (!importedPath) return match;

      const importedTarget = sourceTargets.get(
        resolve(dirname(sourcePath), importedPath),
      );
      if (!importedTarget) return match;

      let rewrittenPath = displayPath(
        relative(dirname(targetPath), importedTarget),
      );
      if (!rewrittenPath.startsWith(".")) rewrittenPath = `./${rewrittenPath}`;

      return `${quote}${rewrittenPath}${suffix}${quote}`;
    },
  );
}

export function createInstallPlan(component, options = {}) {
  const application = findApplicationRoot(options.cwd);
  const frameworkDetection = detectFramework(
    application.root,
    application.packageJson,
    options.framework,
  );
  const registryDirectory = resolve(
    options.registryDirectory ?? DEFAULT_REGISTRY_DIRECTORY,
  );
  const registryItems = [
    ...resolveRegistryItems(
      component,
      frameworkDetection.framework,
      registryDirectory,
    ).resolved.values(),
  ];

  const componentsDirectory = ensureInsideRoot(
    application.root,
    options.componentsDirectory ?? DEFAULT_COMPONENTS_DIRECTORY,
    "Components directory",
  );
  const cssPath = ensureInsideRoot(
    application.root,
    options.cssPath ?? DEFAULT_CSS_PATH,
    "CSS path",
  );
  const targetSources = new Map();
  const sourceTargets = new Map();
  const declaredFiles = [];
  const files = [];
  const dependencyVersions = new Map();

  for (const registryItem of registryItems) {
    for (const [name, version] of Object.entries(
      registryItem.frameworkItem.dependencies ?? {},
    )) {
      const existingVersion = dependencyVersions.get(name);

      if (existingVersion && existingVersion !== version) {
        throw new KleanInstallerError(
          `Registry items require conflicting versions of ${name}: ${existingVersion} and ${version}.`,
          { code: "INVALID_REGISTRY" },
        );
      }

      dependencyVersions.set(name, version);
    }

    for (const declaredFile of frameworkFiles(
      registryItem.component,
      registryItem.frameworkItem,
    )) {
      const sourcePath = validateRegistryPath(
        registryItem.directory,
        declaredFile.source,
        "Registry source",
      );
      const targetPath = validateRegistryPath(
        componentsDirectory,
        declaredFile.target,
        "Registry target",
      );

      if (!existsSync(sourcePath)) {
        throw new KleanInstallerError(
          `The ${registryItem.component} registry source for ${frameworkDetection.framework} is missing.`,
          { code: "INVALID_REGISTRY" },
        );
      }

      const existingTargetPath = sourceTargets.get(sourcePath);
      if (existingTargetPath && existingTargetPath !== targetPath) {
        throw new KleanInstallerError(
          `Registry source ${displayRelativePath(registryDirectory, sourcePath)} maps to more than one target.`,
          { code: "INVALID_REGISTRY" },
        );
      }

      sourceTargets.set(sourcePath, targetPath);
      declaredFiles.push({ registryItem, sourcePath, targetPath });
    }
  }

  for (const { registryItem, sourcePath, targetPath } of declaredFiles) {
    const registrySource = rewriteRegistryImports(
      readFileSync(sourcePath, "utf8"),
      sourcePath,
      targetPath,
      sourceTargets,
    );
    const existingTarget = targetSources.get(targetPath);

    if (existingTarget) {
      if (existingTarget.registrySource !== registrySource) {
        throw new KleanInstallerError(
          `Registry items ${existingTarget.component} and ${registryItem.component} write different source to ${displayRelativePath(componentsDirectory, targetPath)}.`,
          { code: "INVALID_REGISTRY" },
        );
      }
      continue;
    }

    const currentSource = existsSync(targetPath)
      ? readFileSync(targetPath, "utf8")
      : undefined;
    let action = "create";
    let difference;

    if (currentSource === registrySource) {
      action = "unchanged";
    } else if (currentSource !== undefined) {
      action = options.overwrite ? "overwrite" : "conflict";
      difference = firstDifference(currentSource, registrySource);
    }

    const file = {
      component: registryItem.component,
      action,
      sourcePath,
      targetPath,
      displayPath: displayRelativePath(componentsDirectory, targetPath),
      registrySource,
      difference,
    };

    targetSources.set(targetPath, file);
    files.push(file);
  }

  const dependencies = [...dependencyVersions.entries()].map(
    ([name, version]) => ({
      name,
      version,
      missing: !hasDirectDependency(application.packageJson, name),
    }),
  );

  return {
    component,
    root: application.root,
    packagePath: application.packagePath,
    packageManager: detectPackageManager(
      application.root,
      application.packageJson,
    ),
    framework: frameworkDetection.framework,
    frameworkDetection,
    componentsDirectory,
    componentsDisplayPath: displayRelativePath(
      application.root,
      componentsDirectory,
    ),
    cssPath,
    cssDisplayPath: displayRelativePath(application.root, cssPath),
    registryItems: registryItems.map((item) => item.component),
    files,
    file: files.length === 1 ? files[0] : undefined,
    dependencies,
    missingDependencies: dependencies.filter(
      (dependency) => dependency.missing,
    ),
    dryRun: Boolean(options.dryRun),
    overwrite: Boolean(options.overwrite),
  };
}

function dependencyCommand(packageManager, dependencies) {
  const specifications = dependencies.map(
    ({ name, version }) => `${name}@${version}`,
  );

  switch (packageManager) {
    case "pnpm":
      return { command: "pnpm", args: ["add", ...specifications] };
    case "yarn":
      return { command: "yarn", args: ["add", ...specifications] };
    case "bun":
      return { command: "bun", args: ["add", ...specifications] };
    default:
      return {
        command: "npm",
        args: ["install", "--save", ...specifications],
      };
  }
}

function defaultDependencyInstaller({ root, packageManager, dependencies }) {
  const { command, args } = dependencyCommand(packageManager, dependencies);
  const result = spawnSync(command, args, {
    cwd: root,
    stdio: "inherit",
    shell: process.platform === "win32",
  });

  if (result.error) throw result.error;
  if (result.status !== 0) {
    throw new Error(`${command} exited with status ${result.status}`);
  }
}

function snapshotFiles(paths) {
  return paths.map((path) => ({
    path,
    existed: existsSync(path),
    source: existsSync(path) ? readFileSync(path) : undefined,
  }));
}

function restoreFiles(snapshots) {
  for (const snapshot of snapshots) {
    if (snapshot.existed) {
      mkdirSync(dirname(snapshot.path), { recursive: true });
      writeFileSync(snapshot.path, snapshot.source);
    } else if (existsSync(snapshot.path)) {
      unlinkSync(snapshot.path);
    }
  }
}

function pruneEmptyDirectories(startDirectory, stopDirectory) {
  let currentDirectory = startDirectory;

  while (
    currentDirectory !== stopDirectory &&
    currentDirectory.startsWith(`${stopDirectory}${sep}`)
  ) {
    if (!existsSync(currentDirectory)) {
      currentDirectory = dirname(currentDirectory);
      continue;
    }

    if (readdirSync(currentDirectory).length) break;
    rmdirSync(currentDirectory);
    currentDirectory = dirname(currentDirectory);
  }
}

function nearestExistingDirectory(path) {
  let currentDirectory = path;

  while (!existsSync(currentDirectory)) {
    const parentDirectory = dirname(currentDirectory);
    if (parentDirectory === currentDirectory) return currentDirectory;
    currentDirectory = parentDirectory;
  }

  return currentDirectory;
}

function writeFileAtomically(path, source) {
  const directory = dirname(path);
  const temporaryPath = resolve(
    directory,
    `.${basename(path)}.klean-${process.pid}-${Date.now()}`,
  );

  mkdirSync(directory, { recursive: true });

  try {
    writeFileSync(temporaryPath, source, { flag: "wx" });
    renameSync(temporaryPath, path);
  } finally {
    if (existsSync(temporaryPath)) unlinkSync(temporaryPath);
  }
}

function verifyInstalledDependencies(plan) {
  const packageJson = readJson(plan.packagePath, plan.packagePath);
  const missing = plan.missingDependencies.filter(
    ({ name }) => !hasDirectDependency(packageJson, name),
  );

  if (missing.length) {
    throw new Error(
      `The package manager did not record ${missing.map(({ name }) => name).join(", ")} as a direct dependency.`,
    );
  }
}

export function applyInstallPlan(plan, options = {}) {
  const conflict = plan.files.find((file) => file.action === "conflict");

  if (conflict) {
    throw new KleanInstallerError(
      `${conflict.displayPath} has local changes and was not overwritten.\n${conflict.difference}\nRe-run with \`--overwrite\` only if replacing the application-owned source is intentional.`,
      { code: "SOURCE_CONFLICT", plan },
    );
  }

  if (plan.dryRun) {
    return {
      plan,
      changed: false,
      dryRun: true,
    };
  }

  const dependencyInstaller =
    options.dependencyInstaller ?? defaultDependencyInstaller;
  const directoryRollbackBoundaries = plan.files.map((file) => ({
    directory: dirname(file.targetPath),
    boundary: nearestExistingDirectory(dirname(file.targetPath)),
  }));
  const snapshots = snapshotFiles([
    ...plan.files.map((file) => file.targetPath),
    plan.packagePath,
    ...LOCKFILES.map((lockfile) => resolve(plan.root, lockfile)),
  ]);

  try {
    for (const file of plan.files) {
      if (["create", "overwrite"].includes(file.action)) {
        writeFileAtomically(file.targetPath, file.registrySource);
      }
    }

    if (plan.missingDependencies.length) {
      dependencyInstaller({
        root: plan.root,
        packageManager: plan.packageManager,
        dependencies: plan.missingDependencies,
      });
      verifyInstalledDependencies(plan);
    }
  } catch (error) {
    restoreFiles(snapshots);
    for (const { directory, boundary } of directoryRollbackBoundaries) {
      pruneEmptyDirectories(directory, boundary);
    }

    throw new KleanInstallerError(
      `Klean UI could not add ${plan.component}; changes to component and package files were rolled back. ${error.message}`,
      { code: "APPLY_FAILED", plan, cause: error },
    );
  }

  return {
    plan,
    changed:
      plan.files.some((file) =>
        ["create", "overwrite"].includes(file.action),
      ) || plan.missingDependencies.length > 0,
    dryRun: false,
  };
}

export function installComponent(component, options = {}) {
  const plan = createInstallPlan(component, options);
  return applyInstallPlan(plan, options);
}

export function formatDetection(plan) {
  const framework =
    plan.framework.charAt(0).toUpperCase() + plan.framework.slice(1);

  return [
    "Klean UI detected a Boring Stack application.",
    "",
    `  Framework    ${framework}`,
    `  Components   ${plan.componentsDisplayPath}`,
    `  Styles       ${plan.cssDisplayPath}`,
    `  Package      ${plan.packageManager}`,
  ].join("\n");
}

export function formatActions(result) {
  const { plan } = result;
  const lines = [];
  const dependencyNames = plan.missingDependencies.map(
    ({ name, version }) => `${name}@${version}`,
  );

  if (result.dryRun) {
    for (const file of plan.files) {
      const fileVerb = {
        create: "Would add",
        overwrite: "Would overwrite",
        unchanged: "Already matches",
      }[file.action];

      lines.push(`○ ${fileVerb} ${file.displayPath}`);
    }
    lines.push(
      dependencyNames.length
        ? `○ Would add direct dependencies: ${dependencyNames.join(", ")}`
        : "○ Direct dependencies already present",
    );
    return lines.join("\n");
  }

  for (const file of plan.files) {
    lines.push(
      {
        create: `✓ Added ${file.displayPath}`,
        overwrite: `✓ Replaced ${file.displayPath}`,
        unchanged: `– ${file.displayPath} already matches`,
      }[file.action],
    );
  }
  lines.push(
    dependencyNames.length
      ? `✓ Added direct dependencies: ${dependencyNames.join(", ")}`
      : "– Direct dependencies already present",
  );

  return lines.join("\n");
}
