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
import {
  applyUpdatePlan,
  createCheckReport,
  createDiffReport,
  createUpdateAllPlan,
  createUpdatePlan,
  formatCheckReport,
  formatDiffReport,
  formatUpdateResult,
} from "./updater.js";

const CLI_DIRECTORY = dirname(fileURLToPath(import.meta.url));

export const HELP = `Klean UI — source-owned components for the Boring Stack

Usage:
  klean-ui add <component> [options]
  klean-ui check [options]
  klean-ui diff <component> [options]
  klean-ui update <component> [options]
  klean-ui update --all [options]

Examples:
  klean-ui add button
  klean-ui add input
  klean-ui add textarea
  klean-ui add separator
  klean-ui add popover
  klean-ui add menu
  klean-ui add dialog
  klean-ui add toast
  klean-ui add data-table
  klean-ui add button --dry-run
  klean-ui add button --components-dir assets/js/components/ui
  klean-ui check
  klean-ui diff button
  klean-ui update button
  klean-ui update --all

Options:
  --dry-run                 Show the resolved changes without writing files
  --overwrite               Replace conflicting application-owned source
  --all                     Update every safely replaceable installed item
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

    const commandOptions = {
      ...parsed.options,
      cwd: options.cwd,
      registryDirectory: options.registryDirectory,
      dependencyInstaller: options.dependencyInstaller,
    };

    if (parsed.command === "check") {
      const report = createCheckReport(commandOptions);
      stdout.write(`${formatDetection(report.detectionPlan)}\n\n`);
      stdout.write(`${formatCheckReport(report)}\n`);
      return report.exitCode;
    }

    if (parsed.command === "diff") {
      const report = createDiffReport(parsed.component, commandOptions);
      stdout.write(`${formatDetection(report.plan)}\n\n`);
      stdout.write(`${formatDiffReport(report)}\n`);
      return report.exitCode;
    }

    if (parsed.command === "update") {
      const update = parsed.options.all
        ? createUpdateAllPlan(commandOptions)
        : {
            plan: createUpdatePlan(parsed.component, commandOptions),
            skipped: [],
          };
      const plan = update.plan;

      stdout.write(`${formatDetection(plan)}\n\n`);
      detectionPrinted = true;
      const result = applyUpdatePlan(plan, commandOptions);
      stdout.write(
        `${formatUpdateResult(result, { skipped: update.skipped })}\n`,
      );
      return update.skipped.length ? 2 : 0;
    }

    const plan = createInstallPlan(parsed.component, commandOptions);

    stdout.write(`${formatDetection(plan)}\n\n`);
    detectionPrinted = true;
    const result = applyInstallPlan(plan, commandOptions);
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
