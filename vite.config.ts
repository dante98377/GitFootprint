import { defineConfig } from 'vite'
import { resolve } from 'node:path'

export default defineConfig({
    build: {
        emptyOutDir: true,

        rollupOptions: {
            input: {
                content: resolve(
                    process.cwd(),
                    'src/content/index.ts',
                ),

                options: resolve(
                    process.cwd(),
                    'options.html',
                ),
            },

            output: {
                entryFileNames: chunk => {
                    if (chunk.name === 'content') {
                        return 'content.js'
                    }

                    return 'assets/[name]-[hash].js'
                },

                chunkFileNames: 'assets/[name]-[hash].js',
            },
        },
    },
})