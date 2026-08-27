import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'
import fs from 'node:fs'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(new URL('./vite.config.js', import.meta.url)))
const srcDir = fileURLToPath(new URL('./src', import.meta.url))

const STATIC_DIRS = [
  'class-01-airplane-mode-intelligence',
  'class-02-models-gguf-lifecycle',
  'class-03-local-inference-fundamentals',
  'class-04-build-offline-chat',
  'class-05-embeddings-meaning-as-geometry',
  'lessons',
  'assets',
]

function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true })
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const from = path.join(src, entry.name)
    const to = path.join(dest, entry.name)
    if (entry.isDirectory()) copyDir(from, to)
    else fs.copyFileSync(from, to)
  }
}

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.htm': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.md': 'text/markdown; charset=utf-8',
  '.ts': 'text/plain; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ico': 'image/x-icon',
}

function bootcampStaticAssets() {
  return {
    name: 'bootcamp-static-assets',
    enforce: 'pre',
    configureServer(server) {
      const handlers = STATIC_DIRS.map((dir) => {
        const abs = path.resolve(__dirname, dir)
        if (!fs.existsSync(abs)) return null
        return { dir, abs }
      }).filter(Boolean)

      server.middlewares.use((req, res, next) => {
        const url = decodeURIComponent(req.url.split('?')[0])
        for (const { dir, abs } of handlers) {
          const prefix = '/' + dir
          if (!url.startsWith(prefix)) continue
          const rel = url.slice(prefix.length).replace(/^\//, '')
          const file = path.join(abs, rel)
          if (!file.startsWith(abs)) return next()
          if (!fs.existsSync(file) || !fs.statSync(file).isFile()) return next()
          const ext = path.extname(file).toLowerCase()
          res.setHeader('Content-Type', MIME[ext] || 'application/octet-stream')
          res.setHeader('Cache-Control', 'no-cache')
          fs.createReadStream(file).pipe(res)
          return
        }
        next()
      })
    },
    closeBundle() {
      const out = path.resolve(__dirname, 'dist')
      for (const dir of STATIC_DIRS) {
        const src = path.resolve(__dirname, dir)
        if (fs.existsSync(src)) copyDir(src, path.join(out, dir))
      }
    },
  }
}

function disableNinjaInProdHtml() {
  return {
    name: 'disable-ninja-in-prod-html',
    transformIndexHtml(html) {
      return html.replace("if (m === 'ninja')", "if (false && m === 'ninja')")
    },
  }
}

export default defineConfig(({ command }) => ({
  plugins: [
    react(),
    tailwindcss(),
    bootcampStaticAssets(),
    command === 'build' && disableNinjaInProdHtml(),
  ].filter(Boolean),
  resolve: {
    alias: {
      '@': srcDir,
    },
  },
}))
