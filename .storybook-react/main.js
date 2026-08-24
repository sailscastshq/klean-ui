import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { mergeRsbuildConfig } from "@rsbuild/core";
import { pluginReact } from "@rsbuild/plugin-react";
import { pluginTailwindcss } from "@rsbuild/plugin-tailwindcss";
import { NormalModuleReplacementPlugin } from "@rspack/core";

function getAbsolutePath(value) {
  return resolve(
    fileURLToPath(
      new URL(import.meta.resolve(`${value}/package.json`, import.meta.url)),
    ),
    "..",
  );
}

const config = {
  stories: ["../stories/react/**/*.stories.@(js|jsx|mjs|ts|tsx)"],
  addons: ["@storybook/addon-a11y", "@storybook/addon-docs"],
  framework: {
    name: getAbsolutePath("storybook-react-rsbuild"),
    options: {},
  },
  rsbuildFinal(config) {
    return mergeRsbuildConfig(config, {
      plugins: [pluginReact(), pluginTailwindcss()],
      tools: {
        rspack: {
          plugins: [
            new NormalModuleReplacementPlugin(
              /^\.\.\/popover\/Popover\.jsx$/,
              resolve(process.cwd(), "registry/popover/react/Popover.jsx"),
            ),
            new NormalModuleReplacementPlugin(
              /^\.\.\/calendar\/Calendar\.jsx$/,
              resolve(process.cwd(), "registry/calendar/react/Calendar.jsx"),
            ),
            new NormalModuleReplacementPlugin(
              /^\.\.\/calendar\/date\.js$/,
              resolve(process.cwd(), "registry/calendar/react/date.js"),
            ),
            new NormalModuleReplacementPlugin(
              /^\.\.\/input\/Input\.jsx$/,
              resolve(process.cwd(), "registry/input/react/Input.jsx"),
            ),
            new NormalModuleReplacementPlugin(
              /^\.\.\/table\/Table\.jsx$/,
              resolve(process.cwd(), "registry/table/react/Table.jsx"),
            ),
          ],
        },
      },
    });
  },
};

export default config;
