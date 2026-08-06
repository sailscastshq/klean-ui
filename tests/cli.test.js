import { afterEach, expect, test } from "@rstest/core";
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { HELP, runCli } from "../cli/index.js";

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
  expect(stdout.value()).toContain("klean-ui add popover");
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
