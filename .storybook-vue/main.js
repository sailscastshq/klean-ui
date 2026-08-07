import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

function getAbsolutePath(value) {
  return resolve(
    fileURLToPath(
      new URL(import.meta.resolve(`${value}/package.json`, import.meta.url))
    ),
    '..'
  )
}

const config = {
  stories: [
    '../stories/*.mdx',
    '../stories/*.stories.@(js|jsx|mjs|ts|tsx)',
  ],
  addons: [
    '@storybook/addon-docs',
    '@storybook/addon-a11y',
    { name: getAbsolutePath('storybook-addon-rslib') },
  ],
  framework: {
    name: getAbsolutePath('storybook-vue3-rsbuild'),
    options: {},
  },
}

export default config
