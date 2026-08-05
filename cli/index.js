import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { parseArguments } from "./arguments.js";
import {
  applyInstallPlan,
  createInstallPlan,
  formatActions,
  formatDetection,
  KleanInstallerError,
} from "./installer.js";

const CLI_DIRECTORY = dirname(fileURLToPath(import.meta.url));

export const HELP = `Klean UI — source-owned components for the Boring Stack

Usage:
  klean-ui add <component> [options]

Examples:
  klean-ui add button
  klean-ui add field
  klean-ui add button --dry-run
  klean-ui add button --components-dir assets/js/components/ui

Options:
  --dry-run                 Show the resolved changes without writing files
  --overwrite               Replace conflicting application-owned source
  --components-dir <path>   Override assets/js/components/ui
  --css <path>              Override assets/css/app.css
  --framework <name>        Resolve intentional ambiguous evidence
  -h, --help                Show this help
  -v, --version             Show the installed CLI version

Klean UI does not use an init command, klean-ui.json, a framework prompt, or cn.js.`;

function packageVersion() {
  const packageJson = JSON.parse(
    readFileSync(resolve(CLI_DIRECTORY, "../package.json"), "utf8"),
  );
  return packageJson.version;
}

export function runCli(argv, options = {}) {
  const stdout = options.stdout ?? process.stdout;
  const stderr = options.stderr ?? process.stderr;
  let detectionPrinted = false;

  try {
    const parsed = parseArguments(argv);

    if (parsed.command === "help") {
      stdout.write(`${HELP}\n`);
      return 0;
    }

    if (parsed.command === "version") {
      stdout.write(`${packageVersion()}\n`);
      return 0;
    }

    const installOptions = {
      ...parsed.options,
      cwd: options.cwd,
      registryDirectory: options.registryDirectory,
      dependencyInstaller: options.dependencyInstaller,
    };
    const plan = createInstallPlan(parsed.component, installOptions);

    stdout.write(`${formatDetection(plan)}\n\n`);
    detectionPrinted = true;
    const result = applyInstallPlan(plan, installOptions);
    stdout.write(`${formatActions(result)}\n`);
    return 0;
  } catch (error) {
    if (error instanceof KleanInstallerError) {
      if (error.plan && !detectionPrinted) {
        stderr.write(`${formatDetection(error.plan)}\n\n`);
      }
      stderr.write(`✗ ${error.message}\n`);
      return 1;
    }

    stderr.write(`✗ Unexpected Klean UI failure: ${error.message}\n`);
    return 1;
  }
}
