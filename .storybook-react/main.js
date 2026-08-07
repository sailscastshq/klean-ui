import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { mergeRsbuildConfig } from '@rsbuild/core'
import { pluginReact } from '@rsbuild/plugin-react'
import { pluginTailwindcss } from '@rsbuild/plugin-tailwindcss'
import { NormalModuleReplacementPlugin } from '@rspack/core'

function getAbsolutePath(value) {
  return resolve(
    fileURLToPath(
      new URL(import.meta.resolve(`${value}/package.json`, import.meta.url))
    ),
    '..'
  )
}

const config = {
  stories: ['../stories/react/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  addons: ['@storybook/addon-docs', '@storybook/addon-a11y'],
  framework: {
    name: getAbsolutePath('storybook-react-rsbuild'),
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
              resolve(
                process.cwd(),
                'registry/popover/react/Popover.jsx'
              )
            ),
          ],
        },
      },
    })
  },
}

export default config
