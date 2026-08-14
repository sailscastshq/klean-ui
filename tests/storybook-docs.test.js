import { expect, test } from "@rstest/core";
import { readFileSync } from "node:fs";

test("enables autodocs in every framework Storybook", () => {
  for (const framework of ["vue", "react", "svelte"]) {
    const config = `.storybook-${framework}/main.js`;
    const preview = `.storybook-${framework}/preview.js`;

    expect(readFileSync(config, "utf8")).toContain(
      '"@storybook/addon-docs"',
    );
    expect(readFileSync(preview, "utf8")).toContain(
      'tags: ["autodocs"]',
    );
  }
});
