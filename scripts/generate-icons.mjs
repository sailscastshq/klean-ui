import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { basename, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { format } from "prettier";
import * as sveltePlugin from "prettier-plugin-svelte";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const METADATA_PATH = resolve(ROOT, "icons/metadata.json");
const SOURCE_DIRECTORY = resolve(ROOT, "icons/source");
const CHECK_ONLY = process.argv.includes("--check");

const ROOT_ATTRIBUTES = [
  ["xmlns", "http://www.w3.org/2000/svg"],
  ["viewBox", "0 0 24 24"],
  ["fill", "none"],
  ["stroke", "currentColor"],
  ["stroke-width", "1.5"],
  ["stroke-linecap", "round"],
  ["stroke-linejoin", "round"],
];

const JSX_ATTRIBUTES = new Map([
  ["stroke-width", "strokeWidth"],
  ["stroke-linecap", "strokeLinecap"],
  ["stroke-linejoin", "strokeLinejoin"],
  ["fill-rule", "fillRule"],
  ["clip-rule", "clipRule"],
]);

function kebabCase(value) {
  return value
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/([A-Z])([A-Z][a-z])/g, "$1-$2")
    .toLowerCase();
}

function readMetadata() {
  const metadata = JSON.parse(readFileSync(METADATA_PATH, "utf8"));

  if (metadata.schemaVersion !== 1 || metadata.canvas !== 24) {
    throw new Error(
      "icons/metadata.json must use schemaVersion 1 on a 24px canvas.",
    );
  }

  const names = new Set();
  for (const icon of metadata.icons) {
    if (!/^[A-Z][A-Za-z0-9]*$/.test(icon.name)) {
      throw new Error(`Invalid icon name ${icon.name}. Use PascalCase.`);
    }
    if (names.has(icon.name))
      throw new Error(`Duplicate icon name ${icon.name}.`);
    names.add(icon.name);

    if (!Array.isArray(icon.opticalBounds) || icon.opticalBounds.length !== 4) {
      throw new Error(`${icon.name} needs four opticalBounds values.`);
    }
    if (icon.opticalBounds.some((value) => value < 0 || value > 24)) {
      throw new Error(
        `${icon.name} opticalBounds must stay on the 24px canvas.`,
      );
    }
    if (
      !Array.isArray(icon.applications) ||
      icon.applications.some(
        (application) => !["hagfish", "slipway"].includes(application),
      ) ||
      new Set(icon.applications).size !== icon.applications.length
    ) {
      throw new Error(
        `${icon.name} applications must contain unique hagfish or slipway values.`,
      );
    }
  }

  return metadata;
}

function attribute(openingTag, name) {
  return openingTag.match(new RegExp(`\\b${name}="([^"]+)"`))?.[1];
}

function readGeometry(icon) {
  const path = resolve(SOURCE_DIRECTORY, `${icon.name}.svg`);
  if (!existsSync(path)) throw new Error(`Missing ${path}.`);

  const source = readFileSync(path, "utf8").trim();
  const openingTag = source.match(/^<svg\b[^>]*>/)?.[0];
  const inner = source.match(/^<svg\b[^>]*>\s*([\s\S]*?)\s*<\/svg>$/)?.[1];

  if (!openingTag || !inner)
    throw new Error(`${icon.name}.svg is not a simple SVG document.`);
  for (const [name, expected] of ROOT_ATTRIBUTES) {
    if (attribute(openingTag, name) !== expected) {
      throw new Error(`${icon.name}.svg must declare ${name}="${expected}".`);
    }
  }

  if (/<(?:script|style|foreignObject|image|text)\b/i.test(inner)) {
    throw new Error(`${icon.name}.svg contains unsupported or unsafe content.`);
  }
  if (
    /#[0-9a-f]{3,8}|\b(?:rgb|hsl)a?\(|\b(?:black|white|red|blue|green)\b/i.test(
      inner,
    )
  ) {
    throw new Error(`${icon.name}.svg contains a hard-coded color.`);
  }
  if (/\b(?:class|style)=/i.test(inner)) {
    throw new Error(
      `${icon.name}.svg must keep application styling out of its geometry.`,
    );
  }

  return inner
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function indent(lines, spaces) {
  const prefix = " ".repeat(spaces);
  return lines.map((line) => `${prefix}${line}`).join("\n");
}

function vueSource(lines) {
  return `<script setup>
defineOptions({ inheritAttrs: false });
</script>

<template>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    width="1em"
    height="1em"
    fill="none"
    stroke="currentColor"
    stroke-width="1.5"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
    focusable="false"
    data-slot="icon"
    v-bind="$attrs"
  >
${indent(lines, 4)}
  </svg>
</template>
`;
}

function jsxGeometry(lines) {
  return lines.map((line) => {
    let result = line;
    for (const [html, jsx] of JSX_ATTRIBUTES) {
      result = result.replaceAll(`${html}=`, `${jsx}=`);
    }
    return result;
  });
}

function reactSource(icon, lines) {
  return `import { forwardRef } from "react";

const ${icon.name} = forwardRef(function ${icon.name}(props, ref) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width="1em"
      height="1em"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      data-slot="icon"
      {...props}
      ref={ref}
    >
${indent(jsxGeometry(lines), 6)}
    </svg>
  );
});

export default ${icon.name};
`;
}

function svelteSource(lines) {
  return `<script>
  let { ...props } = $props();
</script>

<svg
  xmlns="http://www.w3.org/2000/svg"
  viewBox="0 0 24 24"
  width="1em"
  height="1em"
  fill="none"
  stroke="currentColor"
  stroke-width="1.5"
  stroke-linecap="round"
  stroke-linejoin="round"
  aria-hidden="true"
  focusable="false"
  data-slot="icon"
  {...props}
>
${indent(lines, 2)}
</svg>
`;
}

function manifest(icon) {
  const registryName = `icon-${kebabCase(icon.name)}`;
  return `${JSON.stringify(
    {
      $schema: "../schema.json",
      name: registryName,
      description: icon.description,
      kind: "icon",
      frameworks: {
        vue: {
          source: `vue/${icon.name}.vue`,
          target: `icons/${icon.name}.vue`,
          dependencies: {},
        },
        react: {
          source: `react/${icon.name}.jsx`,
          target: `icons/${icon.name}.jsx`,
          dependencies: {},
        },
        svelte: {
          source: `svelte/${icon.name}.svelte`,
          target: `icons/${icon.name}.svelte`,
          dependencies: {},
        },
      },
    },
    null,
    2,
  )}\n`;
}

function storyModule(metadata, framework) {
  const sourceRoot = {
    vue: "../../src/vue/icons",
    react: "../../../registry",
    svelte: "../../../registry",
  }[framework];
  const imports = metadata.icons
    .map((icon) => {
      const registryName = `icon-${kebabCase(icon.name)}`;
      const source =
        framework === "vue"
          ? `${sourceRoot}/${icon.name}.vue`
          : `${sourceRoot}/${registryName}/${framework}/${icon.name}.${framework === "react" ? "jsx" : "svelte"}`;
      return `import ${icon.name} from ${JSON.stringify(source)};`;
    })
    .join("\n");
  const components = metadata.icons.map((icon) => `  ${icon.name},`).join("\n");
  const entries = metadata.icons
    .map(
      (icon) => `  {
    name: ${JSON.stringify(icon.name)},
    component: ${icon.name},
    description: ${JSON.stringify(icon.description)},
    keywords: ${JSON.stringify(icon.keywords)},
    applications: ${JSON.stringify(icon.applications ?? [])},
  },`,
    )
    .join("\n");

  return `${imports}

export const iconComponents = {
${components}
};

export const iconEntries = [
${entries}
];

export const iconNames = iconEntries.map(({ name }) => name);
`;
}

const changed = [];

async function formattedSource(path, source) {
  const extension = path.slice(path.lastIndexOf("."));
  const parser = {
    ".vue": "vue",
    ".jsx": "babel",
    ".js": "babel",
    ".svelte": "svelte",
    ".json": "json",
  }[extension];

  if (!parser) return source;
  return format(source, {
    parser,
    ...(parser === "svelte" ? { plugins: [sveltePlugin] } : {}),
  });
}

async function output(path, source) {
  const expected = await formattedSource(path, source);
  const current = existsSync(path) ? readFileSync(path, "utf8") : undefined;
  if (current === expected) return;
  changed.push(path.slice(ROOT.length + 1));
  if (CHECK_ONLY) return;
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, expected);
}

const metadata = readMetadata();
for (const icon of metadata.icons) {
  const lines = readGeometry(icon);
  const registryName = `icon-${kebabCase(icon.name)}`;

  await output(
    resolve(ROOT, `src/vue/icons/${icon.name}.vue`),
    vueSource(lines),
  );
  await output(
    resolve(ROOT, `registry/${registryName}/vue/${icon.name}.vue`),
    vueSource(lines),
  );
  await output(
    resolve(ROOT, `registry/${registryName}/react/${icon.name}.jsx`),
    reactSource(icon, lines),
  );
  await output(
    resolve(ROOT, `registry/${registryName}/svelte/${icon.name}.svelte`),
    svelteSource(lines),
  );
  await output(
    resolve(ROOT, `registry/${registryName}/registry.json`),
    manifest(icon),
  );
}

for (const framework of ["vue", "react", "svelte"]) {
  const directory =
    framework === "vue" ? "generated" : `${framework}/generated`;
  await output(
    resolve(ROOT, `stories/${directory}/icons.js`),
    storyModule(metadata, framework),
  );
}

if (CHECK_ONLY && changed.length) {
  process.stderr.write(
    `Generated icon source is stale:\n${changed.map((path) => `- ${path}`).join("\n")}\n`,
  );
  process.exitCode = 1;
} else if (CHECK_ONLY) {
  process.stdout.write("Generated icon source is current.\n");
} else {
  process.stdout.write(`Generated ${metadata.icons.length} Klean icons.\n`);
}
