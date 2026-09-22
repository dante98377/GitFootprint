import { defineConfig } from 'vite'
import { resolve } from 'node:path'

export default defineConfig({
    build: {
        emptyOutDir: false,

        rollupOptions: {
            input: resolve(
                process.cwd(),
                'src/content/index.ts',
            ),

            output: {
                format: 'iife',
                inlineDynamicImports: true,
                entryFileNames: 'content.js',
            },
        },
    },
})