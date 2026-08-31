import assert from "node:assert/strict";
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
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const temporaryRoot = mkdtempSync(join(tmpdir(), "klean-ui-packed-cli-"));

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: options.cwd ?? root,
    env: options.env ?? process.env,
    encoding: "utf8",
  });

  if (result.status !== 0) {
    throw new Error(
      [
        `${command} ${args.join(" ")} exited ${result.status}`,
        result.stdout,
        result.stderr,
      ]
        .filter(Boolean)
        .join("\n"),
    );
  }

  return result.stdout;
}

function write(path, contents) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, contents);
}

function applicationFixture(framework) {
  const fixtures = {
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
  const fixture = fixtures[framework];
  const applicationRoot = resolve(temporaryRoot, `app-${framework}`);

  write(
    resolve(applicationRoot, "package.json"),
    `${JSON.stringify(
      {
        name: `packed-${framework}-app`,
        private: true,
        dependencies: {
          sails: "^1.5.0",
          [fixture.dependency]: "latest",
          "tailwind-merge": "^3.6.0",
        },
      },
      null,
      2,
    )}\n`,
  );
  write(resolve(applicationRoot, "assets/js/app.js"), fixture.entry);
  write(
    resolve(applicationRoot, "assets/css/app.css"),
    '@import "tailwindcss";\n',
  );

  return { applicationRoot, extension: fixture.extension };
}

try {
  const packageDirectory = resolve(temporaryRoot, "tarball");
  const installDirectory = resolve(temporaryRoot, "installed-package");
  const npmCache = resolve(temporaryRoot, "npm-cache");
  mkdirSync(packageDirectory, { recursive: true });
  mkdirSync(installDirectory, { recursive: true });

  const packed = JSON.parse(
    run("npm", ["pack", "--pack-destination", packageDirectory, "--json"], {
      env: { ...process.env, npm_config_cache: npmCache },
    }),
  )[0];
  const tarball = resolve(packageDirectory, packed.filename);

  run("npm", ["init", "--yes"], {
    cwd: installDirectory,
    env: { ...process.env, npm_config_cache: npmCache },
  });
  run("npm", ["install", "--ignore-scripts", "--omit=dev", tarball], {
    cwd: installDirectory,
    env: { ...process.env, npm_config_cache: npmCache },
  });

  const installedPackage = resolve(installDirectory, "node_modules/klean-ui");
  const cli = resolve(installedPackage, "bin/klean-ui.js");
  const installedMetadata = JSON.parse(
    readFileSync(resolve(installedPackage, "package.json"), "utf8"),
  );
  const installedExecutable = resolve(
    installDirectory,
    "node_modules/.bin/klean-ui",
  );

  assert.equal(installedMetadata.version, "0.0.2");
  assert.deepEqual(installedMetadata.bin, {
    "klean-ui": "bin/klean-ui.js",
  });
  assert.ok(existsSync(cli));
  assert.ok(existsSync(installedExecutable));
  assert.equal(
    run("npm", ["exec", "--offline", "--", "klean-ui", "--version"], {
      cwd: installDirectory,
      env: { ...process.env, npm_config_cache: npmCache },
    }).trim(),
    "0.0.2",
  );
  assert.ok(
    existsSync(resolve(installedPackage, "registry/button/registry.json")),
  );
  assert.ok(existsSync(resolve(installedPackage, "skills/klean-ui/SKILL.md")));

  for (const framework of ["vue", "react", "svelte"]) {
    const { applicationRoot, extension } = applicationFixture(framework);
    const addOutput = run(process.execPath, [cli, "add", "button"], {
      cwd: applicationRoot,
    });
    const target = resolve(
      applicationRoot,
      `assets/js/components/ui/button/Button.${extension}`,
    );

    assert.match(addOutput, new RegExp(`Framework\\s+${framework}`, "i"));
    assert.ok(existsSync(target));
    assert.match(
      run(process.execPath, [cli, "check"], { cwd: applicationRoot }),
      /button is current/,
    );
    assert.match(
      run(process.execPath, [cli, "diff", "button"], {
        cwd: applicationRoot,
      }),
      /button is current; there is no upstream diff/,
    );
    assert.match(
      run(process.execPath, [cli, "update", "button"], {
        cwd: applicationRoot,
      }),
      /Everything is already current/,
    );

    const iconOutput = run(
      process.execPath,
      [cli, "add", "icon", "arrow-right", "fingerprint", "terminal"],
      { cwd: applicationRoot },
    );
    for (const iconName of ["ArrowRight", "Fingerprint", "Terminal"]) {
      assert.match(
        iconOutput,
        new RegExp(`Added icons/${iconName}\\.${extension}`),
      );
      assert.ok(
        existsSync(
          resolve(
            applicationRoot,
            `assets/js/components/ui/icons/${iconName}.${extension}`,
          ),
        ),
      );
    }
    assert.match(
      run(process.execPath, [cli, "check", "icon", "terminal"], {
        cwd: applicationRoot,
      }),
      /icon terminal is current/,
    );

    writeFileSync(
      target,
      `${readFileSync(target, "utf8")}${
        framework === "react"
          ? "\n// application edit\n"
          : "\n<!-- application edit -->\n"
      }`,
    );
    const localDiff = spawnSync(process.execPath, [cli, "diff", "button"], {
      cwd: applicationRoot,
      encoding: "utf8",
    });
    assert.equal(localDiff.status, 2);
    assert.match(
      localDiff.stdout,
      /local source is not a known Klean revision/,
    );

    const safeUpdate = spawnSync(process.execPath, [cli, "update", "button"], {
      cwd: applicationRoot,
      encoding: "utf8",
    });
    assert.equal(safeUpdate.status, 1);
    assert.match(
      safeUpdate.stderr,
      /has local changes and was not overwritten/,
    );
  }

  const vueFixture = resolve(temporaryRoot, "app-vue");
  run(process.execPath, [cli, "add", "date-picker"], { cwd: vueFixture });
  for (const path of [
    "calendar/Calendar.vue",
    "calendar/date.js",
    "input/Input.vue",
    "popover/Popover.vue",
    "date-picker/DatePicker.vue",
  ]) {
    assert.ok(existsSync(resolve(vueFixture, "assets/js/components/ui", path)));
  }

  console.log(
    `Packed ${installedMetadata.name}@${installedMetadata.version}: Vue, React, Svelte add/check/diff/safe-update, and compound dependency smoke checks passed.`,
  );
} finally {
  rmSync(temporaryRoot, { recursive: true, force: true });
}
