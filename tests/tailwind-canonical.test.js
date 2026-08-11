import { execFileSync } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { expect, test } from "@rstest/core";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");

test("keeps every component and story on canonical Tailwind classes", async () => {
  expect(() =>
    execFileSync(process.execPath, ["scripts/check-tailwind-canonical.mjs"], {
      cwd: projectRoot,
      encoding: "utf8",
    }),
  ).not.toThrow();
});
