import type { ProxyOptions } from 'vite'

/**
 * Proxy dev : une URL par cible, vide = route désactivée (hybride local / k8s / etc.).
 * Variables lues depuis .env (loadEnv prefix '' dans vite.config).
 */
const E = {
  back: 'VITE_DEV_PROXY_BACK',
  fhir: 'VITE_DEV_PROXY_FHIR',
  request: 'VITE_DEV_PROXY_REQUEST',
  datamodel: 'VITE_DEV_PROXY_DATAMODEL',
  portail: 'VITE_DEV_PROXY_PORTAIL',
  secure: 'VITE_DEV_PROXY_SECURE'
} as const

/** TLS upstream : true par défaut ; `VITE_DEV_PROXY_SECURE=false` pour auto-signé / proxy d’entreprise. */
function tlsVerify(envVal: string | undefined): boolean {
  const x = (envVal ?? 'true').trim().toLowerCase()
  return !['0', 'false', 'no'].includes(x)
}

/**
 * FhirApi local attend souvent `authorizationMethod: OIDC` (RS256) alors que `oidcAuth` reste false
 * pour le back Django (JWT). Sans toucher au code React : même rôle qu’un nginx qui ajoute le header
 * sur /fhir. Voir `VITE_DEV_PROXY_FHIR_AUTH_METHOD` dans `.env.dev-proxy.example`.
 */
function withFhirAuthHeaderOverride(
  opts: ProxyOptions,
  mode: 'OIDC' | undefined
): ProxyOptions {
  if (mode !== 'OIDC') {
    return opts
  }
  const prevConfigure = opts.configure
  return {
    ...opts,
    configure(proxy, options) {
      prevConfigure?.(proxy, options)
      proxy.on('proxyReq', (proxyReq) => {
        proxyReq.setHeader('authorizationMethod', 'OIDC')
      })
    }
  }
}

export function buildDevProxy(env: Record<string, string | undefined>): Record<string, ProxyOptions> {
  const secure = tlsVerify(env[E.secure])
  const proxy: Record<string, ProxyOptions> = {}

  const back = env[E.back]?.trim()
  const fhir = env[E.fhir]?.trim()
  const requestRaw = env[E.request]?.trim()
  const request =
    requestRaw === '-' || requestRaw === 'off'
      ? undefined
      : requestRaw || fhir
  const datamodel = env[E.datamodel]?.trim()
  const fhirAuthOverride =
    env.VITE_DEV_PROXY_FHIR_AUTH_METHOD?.trim().toUpperCase() === 'OIDC' ? ('OIDC' as const) : undefined

  const baseOpts = (): ProxyOptions => ({
    changeOrigin: true,
    secure
  })

  if (back) {
    proxy['/api/back/ws'] = {
      ...baseOpts(),
      target: back,
      ws: true,
      rewrite: (path) => path.replace(/^\/api\/back\/ws/, '/ws')
    }
    proxy['/api/back'] = {
      ...baseOpts(),
      target: back,
      rewrite: (path) => path.replace(/^\/api\/back/, '') || '/'
    }
    // Filet de sécurité : /auth/... sans préfixe /api/back (regex pour ne pas matcher /author…).
    proxy['^/auth/'] = {
      ...baseOpts(),
      target: back
    }
  }

  const portailTarget = env[E.portail]?.trim() || back
  if (portailTarget) {
    proxy['/api/portail'] = {
      ...baseOpts(),
      target: portailTarget,
      rewrite: (path) => path.replace(/^\/api\/portail/, '') || '/'
    }
  }

  if (fhir) {
    proxy['/api/fhir'] = withFhirAuthHeaderOverride(
      {
        ...baseOpts(),
        target: fhir,
        rewrite: (path) => path.replace(/^\/api\/fhir/, '/fhir')
      },
      fhirAuthOverride
    )
  }

  if (request) {
    proxy['/api/request'] = withFhirAuthHeaderOverride(
      {
        ...baseOpts(),
        target: request,
        rewrite: (path) => path.replace(/^\/api\/request/, '/fhir')
      },
      fhirAuthOverride
    )
  }

  if (datamodel) {
    proxy['/api/datamodel'] = {
      ...baseOpts(),
      target: datamodel,
      rewrite: (path) => path.replace(/^\/api\/datamodel/, '') || '/'
    }
  }

  return proxy
}
