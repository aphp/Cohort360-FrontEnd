import { defineConfig, normalizePath } from 'vite'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'
import svgr from 'vite-plugin-svgr'
import topLevelAwait from 'vite-plugin-top-level-await'

import path from 'node:path'
import { createRequire } from 'node:module'
import { viteStaticCopy } from 'vite-plugin-static-copy'

const require = createRequire(import.meta.url)
const cMapsDir = normalizePath(path.join(path.dirname(require.resolve('pdfjs-dist/package.json')), 'cmaps'))
const standardFontsDir = normalizePath(
  path.join(path.dirname(require.resolve('pdfjs-dist/package.json')), 'standard_fonts')
)

export default defineConfig(() => {
  return {
    build: {
      outDir: 'build'
    },
    server: {
      port: 3000
    },
    plugins: [
      react(),
      tsconfigPaths(),
      svgr(),
      topLevelAwait(),
      viteStaticCopy({
        targets: [
          { src: cMapsDir, dest: '' },
          { src: standardFontsDir, dest: '' }
        ]
      })
    ],
    test: {
      threads: false // disable worker threads so that canvas runs in main thread
    }
  }
})
