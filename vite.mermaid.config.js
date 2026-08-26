import { defineConfig } from 'vite'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

/** IIFE bundle for static lesson pages → assets/mermaid.js */
export default defineConfig({
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/mermaid-static.js'),
      name: 'BootcampMermaid',
      formats: ['iife'],
      fileName: () => 'mermaid.js',
    },
    outDir: path.resolve(__dirname, 'assets'),
    emptyOutDir: false,
  },
})
