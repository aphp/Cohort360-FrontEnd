import { defineConfig, normalizePath } from 'vite'
import type { ProxyOptions } from 'vite'
import type { ClientRequest, IncomingMessage, ServerResponse } from 'node:http'
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

// Backend environment configuration for local development proxy
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

  // Validate BACKEND_ENV with fallback to 'qualif'
  const envFromProcess = process.env.BACKEND_ENV || 'qualif'
  const BACKEND_ENV: BackendEnv = envFromProcess in BACKEND_ENVS ? (envFromProcess as BackendEnv) : 'qualif'
  if (!(envFromProcess in BACKEND_ENVS) && envFromProcess !== 'qualif') {
    console.warn(`[vite.config] Invalid BACKEND_ENV "${envFromProcess}" provided. Falling back to "qualif".`)
  }
  const backend = BACKEND_ENVS[BACKEND_ENV]

  // TLS verification is enabled by default. To disable for internal endpoints with
  // self-signed certs, set VITE_INSECURE_PROXY=true (not recommended on untrusted networks)
  const insecureProxy = process.env.VITE_INSECURE_PROXY === 'true'
  const createProxyConfig = (target: string, ws = false): ProxyOptions => ({
    target,
    changeOrigin: true,
    secure: !insecureProxy,
    ws,
    timeout: 60000, // 60 seconds timeout
    rewrite: (path: string) => path.replace(/^\/api\/(fhir|back|datamodel)/, ''),
    configure: (proxy, _options) => {
      proxy.on('error', (err, _req, res) => {
        console.error('[vite proxy error]', err.message)
        // Ensure we send a response to prevent ERR_EMPTY_RESPONSE
        if (res && 'writeHead' in res && !res.headersSent) {
          res.writeHead(502, { 'Content-Type': 'text/plain' })
          res.end(`Proxy error: ${err.message}`)
        }
      })
      proxy.on('proxyReq', (proxyReq: ClientRequest, req: IncomingMessage) => {
        // Inject NSC_TMAS cookie for authentication (HTTP requests)
        if (NSC_TMAS) {
          const existingCookie = (req.headers.cookie as string) || ''
          proxyReq.setHeader('Cookie', `NSC_TMAS=${NSC_TMAS}; ${existingCookie}`)
        }
      })
      // Inject NSC_TMAS cookie for WebSocket upgrade requests
      proxy.on('proxyReqWs', (proxyReq: ClientRequest, req: IncomingMessage) => {
        if (NSC_TMAS) {
          const existingCookie = (req.headers.cookie as string) || ''
          proxyReq.setHeader('Cookie', `NSC_TMAS=${NSC_TMAS}; ${existingCookie}`)
        }
      })
      proxy.on('proxyRes', (proxyRes, req) => {
        // Detect strong auth redirect (expired NSC_TMAS cookie)
        const location = proxyRes.headers.location
        if (proxyRes.statusCode && proxyRes.statusCode >= 300 && proxyRes.statusCode < 400 && location) {
          if (location.includes('authentification-forte.aphp.fr')) {
            console.error(
              '\n[vite proxy] ⚠️  NSC_TMAS cookie expired! Backend redirecting to strong auth.',
              '\n  Request:', req.url,
              '\n  Get a new cookie from https://django-qualif-ext-k8s.eds.aphp.fr/ and restart the dev server.\n'
            )
          }
        }
      })
    }
  })

  return {
    define: {
      // Expose BACKEND_ENV to client code for dev login UI
      'import.meta.env.VITE_BACKEND_ENV': JSON.stringify(BACKEND_ENV)
    },
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
