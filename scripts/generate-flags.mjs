// Run after `npm pack country-flag-icons@1.6.20` and extracting the tarball.
// No runtime asset dependency or network call is introduced.
import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { format } from "prettier";
const directory = process.argv[2];
if (!directory)
  throw new Error("Pass the extracted country-flag-icons package directory.");
const packageJson = JSON.parse(
  readFileSync(resolve(directory, "package.json"), "utf8"),
);
if (
  packageJson.name !== "country-flag-icons" ||
  packageJson.version !== "1.6.20"
)
  throw new Error("Expected country-flag-icons 1.6.20.");
const flags = Object.fromEntries(
  readdirSync(resolve(directory, "3x2"))
    .filter((name) => /^[A-Z]{2}\.svg$/.test(name))
    .sort()
    .map((name) => [
      name.slice(0, 2),
      `data:image/svg+xml;base64,${readFileSync(resolve(directory, "3x2", name)).toString("base64")}`,
    ]),
);
const license = readFileSync(resolve(directory, "LICENSE"), "utf8");
const source = await format(
  `/* country-flag-icons 1.6.20: https://github.com/catamphetamine/country-flag-icons\n${license}\n*/\nconst FLAGS = ${JSON.stringify(flags, null, 2)};\n\nexport const countries = Object.freeze(Object.keys(FLAGS));\n\nexport function flagSource(country, src = "") {\n  if (src) return src;\n  const code = typeof country === "string" ? country.trim().toUpperCase() : "";\n  return /^[A-Z]{2}$/.test(code) && Object.hasOwn(FLAGS, code) ? FLAGS[code] : "";\n}\n`,
  { parser: "babel" },
);
for (const target of ["registry/flag/shared/flags.js", "src/vue/flag/flags.js"])
  writeFileSync(target, source);
console.log(`Generated ${Object.keys(flags).length} licensed local flags.`);
