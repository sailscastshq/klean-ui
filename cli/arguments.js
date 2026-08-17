import { KleanInstallerError } from "./installer.js";

const VALUE_OPTIONS = new Map([
  ["--components-dir", "componentsDirectory"],
  ["--css", "cssPath"],
  ["--framework", "framework"],
]);

const BOOLEAN_OPTIONS = new Map([
  ["--dry-run", "dryRun"],
  ["--overwrite", "overwrite"],
  ["--all", "all"],
]);

const COMMAND_OPTIONS = {
  add: new Set(["dryRun", "overwrite"]),
  check: new Set(),
  diff: new Set(),
  update: new Set(["all", "dryRun", "overwrite"]),
};

function readOptionValue(argv, index, option) {
  const equalsIndex = option.indexOf("=");

  if (equalsIndex !== -1) {
    return {
      value: option.slice(equalsIndex + 1),
      consumed: 0,
      name: option.slice(0, equalsIndex),
    };
  }

  const value = argv[index + 1];
  if (!value || value.startsWith("--")) {
    throw new KleanInstallerError(`${option} requires a value.`, {
      code: "INVALID_ARGUMENTS",
    });
  }

  return { value, consumed: 1, name: option };
}

export function parseArguments(argv) {
  if (!argv.length || argv.includes("--help") || argv.includes("-h")) {
    return { command: "help" };
  }

  if (argv.includes("--version") || argv.includes("-v")) {
    return { command: "version" };
  }

  const [command, ...commandArguments] = argv;

  if (!COMMAND_OPTIONS[command]) {
    throw new KleanInstallerError(
      `Unknown command \`${command}\`. Run \`klean-ui --help\` for usage.`,
      { code: "INVALID_ARGUMENTS" },
    );
  }

  const rest = [...commandArguments];
  let component;

  if (rest[0] && !rest[0].startsWith("--")) {
    component = rest.shift();
  }

  if (["add", "diff"].includes(command) && !component) {
    throw new KleanInstallerError(
      `The ${command} command needs a component name, for example \`klean-ui ${command} button\`.`,
      { code: "INVALID_ARGUMENTS" },
    );
  }

  if (command === "check" && component) {
    throw new KleanInstallerError(
      "The check command inspects every installed component and does not accept a component name.",
      { code: "INVALID_ARGUMENTS" },
    );
  }

  const options = {};

  for (let index = 0; index < rest.length; index += 1) {
    const rawOption = rest[index];
    const optionName = rawOption.split("=")[0];

    if (BOOLEAN_OPTIONS.has(optionName)) {
      if (rawOption.includes("=")) {
        throw new KleanInstallerError(
          `${optionName} does not accept a value.`,
          { code: "INVALID_ARGUMENTS" },
        );
      }
      options[BOOLEAN_OPTIONS.get(optionName)] = true;
      continue;
    }

    if (VALUE_OPTIONS.has(optionName)) {
      const { value, consumed } = readOptionValue(rest, index, rawOption);
      if (!value) {
        throw new KleanInstallerError(`${optionName} requires a value.`, {
          code: "INVALID_ARGUMENTS",
        });
      }
      options[VALUE_OPTIONS.get(optionName)] = value;
      index += consumed;
      continue;
    }

    throw new KleanInstallerError(
      `Unknown option \`${rawOption}\`. Run \`klean-ui --help\` for usage.`,
      { code: "INVALID_ARGUMENTS" },
    );
  }

  for (const option of Object.keys(options)) {
    if (
      !COMMAND_OPTIONS[command].has(option) &&
      !["componentsDirectory", "cssPath", "framework"].includes(option)
    ) {
      throw new KleanInstallerError(
        `The ${command} command does not accept --${option.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)}.`,
        { code: "INVALID_ARGUMENTS" },
      );
    }
  }

  if (command === "update" && Boolean(component) === Boolean(options.all)) {
    throw new KleanInstallerError(
      "The update command needs one component name or `--all`, but not both.",
      { code: "INVALID_ARGUMENTS" },
    );
  }

  return {
    command,
    component,
    options,
  };
}
