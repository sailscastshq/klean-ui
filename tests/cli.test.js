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
import { HELP, runCli } from "../cli/index.js";
import { createSourceFormatter } from "../cli/source-formatter.js";

const fixtures = [];

afterEach(() => {
  while (fixtures.length) {
    rmSync(fixtures.pop(), { recursive: true, force: true });
  }
});

function write(path, source) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, source);
}

function makeApp() {
  const root = mkdtempSync(join(tmpdir(), "klean-ui-cli-"));
  fixtures.push(root);
  write(
    resolve(root, "package.json"),
    `${JSON.stringify(
      {
        name: "cli-fixture",
        private: true,
        dependencies: {
          sails: "^1.5.0",
          vue: "latest",
          "tailwind-merge": "^3.6.0",
        },
      },
      null,
      2,
    )}\n`,
  );
  write(resolve(root, "package-lock.json"), "{}\n");
  write(
    resolve(root, "assets/js/app.js"),
    'import { createApp } from "vue";\n',
  );
  return root;
}

function outputBuffer() {
  let value = "";
  return {
    stream: {
      write(chunk) {
        value += chunk;
      },
    },
    value() {
      return value;
    },
  };
}

test("shows terse command help", () => {
  const stdout = outputBuffer();
  const exitCode = runCli(["--help"], { stdout: stdout.stream });

  expect(exitCode).toBe(0);
  expect(stdout.value()).toBe(`${HELP}\n`);
  expect(stdout.value()).toContain("klean-ui add button");
  expect(stdout.value()).toContain("klean-ui add input");
  expect(stdout.value()).toContain("klean-ui add textarea");
  expect(stdout.value()).toContain("klean-ui add separator");
  expect(stdout.value()).toContain("klean-ui add popover");
  expect(stdout.value()).toContain("klean-ui add menu");
  expect(stdout.value()).toContain("klean-ui add dialog");
  expect(stdout.value()).toContain("klean-ui add toast");
  expect(stdout.value()).toContain("klean-ui add data-table");
  expect(stdout.value()).toContain("klean-ui check");
  expect(stdout.value()).toContain("klean-ui diff button");
  expect(stdout.value()).toContain("klean-ui update button");
  expect(stdout.value()).toContain("klean-ui update --all");
  expect(stdout.value()).not.toContain("klean-ui add field");
  expect(stdout.value()).not.toContain("klean-ui init");
});

test("prints the detected conventions and dry-run mutations", () => {
  const root = makeApp();
  const stdout = outputBuffer();
  const stderr = outputBuffer();

  const exitCode = runCli(["add", "button", "--dry-run"], {
    cwd: root,
    stdout: stdout.stream,
    stderr: stderr.stream,
  });

  expect(exitCode).toBe(0);
  expect(stderr.value()).toBe("");
  expect(stdout.value()).toContain("Framework    Vue");
  expect(stdout.value()).toContain("Components   assets/js/components/ui");
  expect(stdout.value()).toContain("Styles       assets/css/app.css");
  expect(stdout.value()).toContain("Would add button/Button.vue");
  expect(existsSync(resolve(root, "assets/js/components/ui"))).toBe(false);
});

test("installs without questions and reports exactly what changed", () => {
  const root = makeApp();
  const stdout = outputBuffer();
  const exitCode = runCli(["add", "button"], {
    cwd: root,
    stdout: stdout.stream,
  });

  expect(exitCode).toBe(0);
  expect(stdout.value()).toContain("✓ Added button/Button.vue");
  expect(stdout.value()).toContain("Direct dependencies already present");
  expect(
    existsSync(resolve(root, "assets/js/components/ui/button/Button.vue")),
  ).toBe(true);
});

test("returns a non-zero exit code with useful evidence on conflict", () => {
  const root = makeApp();
  runCli(["add", "button"], { cwd: root, stdout: outputBuffer().stream });
  write(
    resolve(root, "assets/js/components/ui/button/Button.vue"),
    "<!-- owned edit -->\n",
  );
  const stderr = outputBuffer();

  const exitCode = runCli(["add", "button"], {
    cwd: root,
    stdout: outputBuffer().stream,
    stderr: stderr.stream,
  });

  expect(exitCode).toBe(1);
  expect(stderr.value()).toContain("has local changes");
  expect(stderr.value()).toContain("First difference at line 1");
  expect(stderr.value()).toContain("--overwrite");
});

test("checks and diffs installed source without writing", () => {
  const root = makeApp();
  runCli(["add", "button"], { cwd: root, stdout: outputBuffer().stream });
  const current = outputBuffer();

  expect(
    runCli(["check"], {
      cwd: root,
      stdout: current.stream,
      stderr: outputBuffer().stream,
    }),
  ).toBe(0);
  expect(current.value()).toContain("✓ button is current");

  const diff = outputBuffer();
  expect(
    runCli(["diff", "button"], {
      cwd: root,
      stdout: diff.stream,
      stderr: outputBuffer().stream,
    }),
  ).toBe(0);
  expect(diff.value()).toContain("there is no upstream diff");
});

test("treats application formatting as a no-op across CLI workflows", () => {
  const root = makeApp();
  write(
    resolve(root, ".prettierrc.json"),
    `${JSON.stringify({ singleQuote: true, semi: false }, null, 2)}\n`,
  );
  runCli(["add", "button"], { cwd: root, stdout: outputBuffer().stream });
  const target = resolve(root, "assets/js/components/ui/button/Button.vue");
  const formatted = createSourceFormatter(root).format(
    readFileSync(target, "utf8"),
    target,
  );
  write(target, formatted);

  const check = outputBuffer();
  expect(
    runCli(["check"], {
      cwd: root,
      stdout: check.stream,
      stderr: outputBuffer().stream,
    }),
  ).toBe(0);
  expect(check.value()).toContain("✓ button is current");

  const diff = outputBuffer();
  expect(
    runCli(["diff", "button"], {
      cwd: root,
      stdout: diff.stream,
      stderr: outputBuffer().stream,
    }),
  ).toBe(0);
  expect(diff.value()).toContain("there is no upstream diff");

  const update = outputBuffer();
  expect(
    runCli(["update", "button"], {
      cwd: root,
      stdout: update.stream,
      stderr: outputBuffer().stream,
    }),
  ).toBe(0);
  expect(update.value()).toContain("Everything is already current.");
  expect(readFileSync(target, "utf8")).toBe(formatted);
});

test("reports modified source and refuses to update it implicitly", () => {
  const root = makeApp();
  runCli(["add", "button"], { cwd: root, stdout: outputBuffer().stream });
  const target = resolve(root, "assets/js/components/ui/button/Button.vue");
  write(target, "<!-- application-owned -->\n");

  const check = outputBuffer();
  expect(
    runCli(["check"], {
      cwd: root,
      stdout: check.stream,
      stderr: outputBuffer().stream,
    }),
  ).toBe(2);
  expect(check.value()).toContain("! button has local changes");

  const diff = outputBuffer();
  expect(
    runCli(["diff", "button"], {
      cwd: root,
      stdout: diff.stream,
      stderr: outputBuffer().stream,
    }),
  ).toBe(2);
  expect(diff.value()).toContain("--- application/button/Button.vue");
  expect(diff.value()).toContain("+++ registry/button/Button.vue");

  const stderr = outputBuffer();
  expect(
    runCli(["update", "button"], {
      cwd: root,
      stdout: outputBuffer().stream,
      stderr: stderr.stream,
    }),
  ).toBe(1);
  expect(stderr.value()).toContain("has local changes");
  expect(stderr.value()).toContain("--overwrite");
  expect(existsSync(target)).toBe(true);
});

test("supports a no-op update --all without configuration", () => {
  const root = makeApp();
  runCli(["add", "button"], { cwd: root, stdout: outputBuffer().stream });
  const stdout = outputBuffer();

  expect(
    runCli(["update", "--all"], {
      cwd: root,
      stdout: stdout.stream,
      stderr: outputBuffer().stream,
    }),
  ).toBe(0);
  expect(stdout.value()).toContain("Everything is already current.");
});

test("rejects ambiguous update targets and component-scoped check", () => {
  for (const argv of [
    ["update"],
    ["update", "button", "--all"],
    ["check", "button"],
  ]) {
    const stderr = outputBuffer();
    expect(
      runCli(argv, {
        cwd: makeApp(),
        stdout: outputBuffer().stream,
        stderr: stderr.stream,
      }),
    ).toBe(1);
    expect(stderr.value()).toContain("✗");
  }
});
