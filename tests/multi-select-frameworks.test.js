import { expect, test } from "@rstest/core";
import { spawnSync } from "node:child_process";
test("React and Svelte SSR preserve selected fixed options and required semantics", () => {
  const result = spawnSync(
    process.execPath,
    ["scripts/check-multi-select-ssr.mjs"],
    { encoding: "utf8" },
  );
  expect(result.stderr).toBe("");
  expect(result.status).toBe(0);
  expect(result.stdout).toContain("React SSR fixed selection");
  expect(result.stdout).toContain("Svelte SSR fixed selection");
});
