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

// Backend environment configuration
const BACKEND_ENVS = {
  develop: {
    fhir: 'https://fhir-r4-develop-ext-k8s.eds.aphp.fr/fhir/',
    back: 'https://django-develop-ext-k8s.eds.aphp.fr/',
    datamodel: 'https://data-models-api-dev-ext-k8s.eds.aphp.fr/'
  },
  qualif: {
    fhir: 'https://fhir-r4-qualif-ext-k8s.eds.aphp.fr/fhir/',
    back: 'https://django-qualif-ext-k8s.eds.aphp.fr/',
    datamodel: 'https://data-models-api-qua-ext-k8s.eds.aphp.fr/'
  },
  preprod: {
    fhir: 'https://fhir-r4-preprod-ext-k8s.eds.aphp.fr/fhir/',
    back: 'https://django-preprod-ext-k8s.eds.aphp.fr/',
    datamodel: 'https://data-models-api-qua-ext-k8s.eds.aphp.fr/'
  },
  prod: {
    fhir: 'https://fhir-r4-prod-ext-k8s.eds.aphp.fr/fhir/',
    back: 'https://django-prod-ext-k8s.eds.aphp.fr/',
    datamodel: 'https://data-models-api-qua-ext-k8s.eds.aphp.fr/'
  }
} as const

type BackendEnv = keyof typeof BACKEND_ENVS

export default defineConfig(() => {
  const NSC_TMAS = process.env.NSC_TMAS || ''
  const BACKEND_ENV = (process.env.BACKEND_ENV || 'qualif') as BackendEnv
  const backend = BACKEND_ENVS[BACKEND_ENV]

  const createProxyConfig = (target: string, ws = false) => ({
    target,
    changeOrigin: true,
    secure: false, // Disable SSL verification for dev (self-signed certs)
    ws,
    rewrite: (path: string) => path.replace(/^\/api\/(fhir|back|datamodel)/, ''),
    configure: (proxy: any) => {
      if (NSC_TMAS) {
        proxy.on('proxyReq', (proxyReq: any, req: any) => {
          const existingCookie = req.headers.cookie || ''
          proxyReq.setHeader('Cookie', `NSC_TMAS=${NSC_TMAS}; ${existingCookie}`)
        })
      }
    }
  })

  return {
    build: {
      outDir: 'build'
    },
    server: {
      port: 3000,
      proxy: {
        '/api/back/ws': createProxyConfig(backend.back.replace('https://', 'wss://'), true),
        '/api/fhir': createProxyConfig(backend.fhir),
        '/api/back': createProxyConfig(backend.back),
        '/api/datamodel': createProxyConfig(backend.datamodel)
      }
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
