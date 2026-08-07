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
  stories: ['../stories/host/**/*.mdx'],
  addons: ['@storybook/addon-docs'],
  framework: {
    name: getAbsolutePath('storybook-vue3-rsbuild'),
    options: {}
  },
  refs: (config, { configType }) => {
    const development = configType === 'DEVELOPMENT'

    return {
      vue: {
        title: 'Vue',
        expanded: false,
        url: development
          ? process.env.KLEAN_STORYBOOK_VUE_URL ?? 'http://127.0.0.1:6007'
          : './vue'
      },
      react: {
        title: 'React',
        expanded: false,
        url: development
          ? process.env.KLEAN_STORYBOOK_REACT_URL ?? 'http://127.0.0.1:6008'
          : './react'
      },
      svelte: {
        title: 'Svelte',
        expanded: false,
        url: development
          ? process.env.KLEAN_STORYBOOK_SVELTE_URL ?? 'http://127.0.0.1:6009'
          : './svelte'
      }
    }
  }
}

export default config
