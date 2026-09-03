import { defineConfig } from 'vite'
import { resolve } from 'node:path'

export default defineConfig({
  build: {
    emptyOutDir: true,

    rollupOptions: {
      input: resolve(process.cwd(), 'src/content/index.ts'),

      output: {
        entryFileNames: 'content.js',
        format: 'iife',
      },
    },
  },
})