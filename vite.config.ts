import { defineConfig, loadEnv, normalizePath } from 'vite'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'
import svgr from 'vite-plugin-svgr'
import topLevelAwait from 'vite-plugin-top-level-await'

import path from 'node:path'
import { createRequire } from 'node:module'
import { viteStaticCopy } from 'vite-plugin-static-copy'

import { buildDevProxy } from './vite-dev-proxy'

const require = createRequire(import.meta.url)
const cMapsDir = normalizePath(path.join(path.dirname(require.resolve('pdfjs-dist/package.json')), 'cmaps'))
const standardFontsDir = normalizePath(
  path.join(path.dirname(require.resolve('pdfjs-dist/package.json')), 'standard_fonts')
)

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const proxy = buildDevProxy(env)
  const proxyKeys = Object.keys(proxy)

  if (mode === 'development') {
    if (proxyKeys.length > 0) {
      const back = env.VITE_DEV_PROXY_BACK?.trim()
      console.info(`[cohort360] dev proxy (${proxyKeys.length} règles)${back ? ` → back ${back}` : ''}`)
    } else if ((env.VITE_BACK_API_URL ?? '').startsWith('/')) {
      console.warn(
        '[cohort360] Aucun VITE_DEV_PROXY_* : sans Nginx, les URLs relatives type VITE_BACK_API_URL ne seront pas routées. Voir .env.dev-proxy.example'
      )
    }
  }

  return {
    build: {
      outDir: 'build'
    },
    server: {
      port: 3000,
      ...(proxyKeys.length > 0 ? { proxy } : {})
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
    ]
  }
})
