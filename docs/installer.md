# Klean UI source installer

The Klean UI installer has one conventional path:

```bash
npx klean-ui add button
npx klean-ui add input
npx klean-ui add textarea
npx klean-ui add popover
```

It does not initialize a project. It resolves a Boring Stack application, selects one framework-native registry item, copies its source files and prerequisites into the application, installs only its missing direct dependencies, and reports the result.

## What the command resolves

The installer walks upward from the current directory until it finds a `package.json` that declares Sails. It then reads the conventional frontend entry under `assets/js/app.*` or `assets/js/main.*` and compares that evidence with direct framework dependencies.

Entry evidence is authoritative when it identifies one framework and does not directly contradict the dependency evidence. If the entry is absent, one unambiguous set of Vue, React, or Svelte dependencies is enough. Conflicting or genuinely ambiguous evidence stops with the files and packages that caused the ambiguity.

For a standard application, the destination is fixed by convention:

| Framework | Installed source                                     |
| --------- | ---------------------------------------------------- |
| Vue       | `assets/js/components/ui/button/Button.vue`          |
| React     | `assets/js/components/ui/button/Button.jsx`          |
| Svelte    | `assets/js/components/ui/button/Button.svelte`       |
| All       | Tailwind entry is understood as `assets/css/app.css` |

The installer creates missing destination directories. It does not ask about aliases because the initial registry source is self-contained.

## Command surface

```bash
npx klean-ui add button
npx klean-ui add button --dry-run
npx klean-ui add button --components-dir <path>
npx klean-ui add button --css <path>
npx klean-ui add button --framework vue|react|svelte
npx klean-ui add button --overwrite
```

`--framework` is an explicit escape hatch for an intentional nonstandard or ambiguous application. It is not a setup question and has no framework default.

All configured paths must stay inside the detected application root. Klean does not write arbitrary paths outside the application.

## Source ownership and conflicts

The registry source and item manifest are bundled in the installed `klean-ui` package. A specific CLI version therefore installs a specific reviewed component; the command does not fetch mutable component source from a remote endpoint.

Registry items can declare prerequisites and more than one source file for future compound components. The complete set is planned before the installer mutates the application. Today's Button, Input, Textarea, and Popover each install one component source file.

The file behavior is deterministic:

- a missing file is created;
- a byte-identical file is unchanged;
- an edited file stops with the first differing line;
- an edited file is replaced only with `--overwrite`.

This is intentionally not an automatic update system. Once copied, the component belongs to the application.

## Direct dependencies

Each framework entry in the registry manifest declares only the packages imported by that copied file. Button imports `tailwind-merge`; Popover imports `tailwind-merge` and the focused `@floating-ui/dom` geometry engine. Klean adds only packages the application does not already declare directly.

The installer honors the `packageManager` field first, then one unambiguous npm, pnpm, Yarn, or Bun lockfile, and otherwise follows the Boring Stack npm convention. It invokes the detected package manager so the direct dependency and lockfile stay in agreement.

Klean itself is not installed as an application runtime dependency. `npx` downloads and executes the source installer; the application runs the copied source and its direct framework dependencies.

## Dry runs and rollback

`--dry-run` resolves and prints the framework, conventional paths, destination file, package manager, dependencies, and planned mutations. It performs no writes and runs no package-manager command.

Before applying a real installation, Klean snapshots every component target, `package.json`, and recognized lockfile. One conflicting target blocks the whole registry transaction before mutation. A failed file or dependency operation restores all controlled files, removes empty directories and atomic-write temporary files, and returns a non-zero exit code. Package-manager caches and already-materialized `node_modules` contents are outside that practical rollback boundary.

## Maintainer registry

Registry manifests are maintainer metadata, not consumer configuration:

```text
registry/
  schema.json
  button/
    registry.json
    vue/Button.vue
  input/
    registry.json
    vue/Input.vue
  textarea/
    registry.json
    vue/Textarea.vue
  popover/
    registry.json
    vue/Popover.vue
```

Every item maps one or more framework sources to conventional destinations, registry prerequisites, and direct dependencies. Tests prove all three canonical applications, safe re-runs, local edits, missing dependencies, path overrides, ambiguity, non-Sails rejection, dry runs, multi-file transactions, temporary-file cleanup, and rollback before a release can publish the registry.
