import { pluginTailwindcss } from '@rsbuild/plugin-tailwindcss'
import { pluginVue } from '@rsbuild/plugin-vue'
import { defineConfig } from '@rslib/core'

export default defineConfig({
  lib: [
    {
      bundle: false
    }
  ],
  output: {
    target: 'web'
  },
  plugins: [pluginVue(), pluginTailwindcss()]
})

