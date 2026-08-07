import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import tailwindcss from '@tailwindcss/vite'
import { mergeConfig } from 'vite'

function getAbsolutePath(value) {
  return resolve(
    fileURLToPath(
      new URL(import.meta.resolve(`${value}/package.json`, import.meta.url))
    ),
    '..'
  )
}

const config = {
  stories: ['../stories/svelte/**/*.stories.@(js|mjs|ts)'],
  addons: ['@storybook/addon-docs', '@storybook/addon-a11y'],
  framework: {
    name: getAbsolutePath('@storybook/svelte-vite'),
    options: { docgen: false },
  },
  async viteFinal(config) {
    return mergeConfig(config, {
      plugins: [svelte(), tailwindcss()],
      resolve: {
        alias: [
          {
            find: /^\.\.\/popover\/Popover\.svelte$/,
            replacement: resolve(
              process.cwd(),
              'registry/popover/svelte/Popover.svelte'
            ),
          },
        ],
      },
    })
  },
}

export default config
