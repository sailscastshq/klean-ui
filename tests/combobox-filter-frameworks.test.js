import { expect, test } from "@rstest/core";
import { spawnSync } from "node:child_process";

test("all installed Combobox framework sources preserve application matches on the server", () => {
  const result = spawnSync(
    process.execPath,
    ["scripts/check-combobox-filter-ssr.mjs"],
    { encoding: "utf8" },
  );
  expect(result.status, result.stdout + result.stderr).toBe(0);
  for (const framework of ["vue", "react", "svelte"]) {
    expect(result.stdout).toContain(
      `${framework}: SSR default filtering and application-ranked matches passed`,
    );
  }
});
