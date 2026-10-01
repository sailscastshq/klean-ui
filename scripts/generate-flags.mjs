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
// Checked-in English names are stable across browser/server ICU versions.
// Seeded with Node 24.14.1 / ICU 78.2 / CLDR 48.0; XA/XC/XO follow
// the pinned asset package README, not Unicode pseudo-region assignments.
const countryNames = JSON.parse(
  readFileSync(new URL("./flag-country-names.json", import.meta.url), "utf8"),
);
if (
  Object.keys(countryNames).join() !== Object.keys(flags).join() ||
  Object.values(countryNames).some((name) => typeof name !== "string" || !name)
)
  throw new Error("Expected one checked-in English name per flag.");
const license = readFileSync(resolve(directory, "LICENSE"), "utf8");
const source = await format(
  `/* country-flag-icons 1.6.20: https://github.com/catamphetamine/country-flag-icons\n${license}\n*/\nconst FLAGS = ${JSON.stringify(flags, null, 2)};\n\n// Stable English names; application alt strings own localization.\nconst COUNTRY_NAMES = Object.freeze(${JSON.stringify(countryNames, null, 2)});\n\nexport function countryName(country) {\n  const code = typeof country === "string" ? country.trim().toUpperCase() : "";\n  return Object.hasOwn(COUNTRY_NAMES, code) ? COUNTRY_NAMES[code] : "";\n}\n\nexport const countries = Object.freeze(Object.keys(FLAGS));\n\nexport function flagSource(country, src = "") {\n  if (src) return src;\n  const code = typeof country === "string" ? country.trim().toUpperCase() : "";\n  return /^[A-Z]{2}$/.test(code) && Object.hasOwn(FLAGS, code) ? FLAGS[code] : "";\n}\n`,
  { parser: "babel" },
);
for (const target of ["registry/flag/shared/flags.js", "src/vue/flag/flags.js"])
  writeFileSync(target, source);
console.log(`Generated ${Object.keys(flags).length} licensed local flags.`);
