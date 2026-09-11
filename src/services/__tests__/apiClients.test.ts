import { describe, it, expect, afterEach, beforeEach, vi } from 'vitest'
import type { AxiosError, AxiosInterceptorManager, AxiosResponseHeaders, InternalAxiosRequestConfig } from 'axios'
import { ACCESS_TOKEN } from 'constants.js'

vi.mock('config', () => ({
  getConfig: () => ({
    system: {
      backendUrl: 'http://backend.local',
      fhirUrl: 'http://fhir.local'
    }
  }),
  onUpdateConfig: vi.fn()
}))

import apiBackend from 'services/apiBackend'
import apiFhir, { getAuthorizationMethod } from 'services/apiFhir'

type InterceptorHandler = {
  fulfilled?: (config: InternalAxiosRequestConfig) => InternalAxiosRequestConfig | Promise<InternalAxiosRequestConfig>
  rejected?: (error: AxiosError) => unknown
}

const getRequestHandler = (interceptors: AxiosInterceptorManager<InternalAxiosRequestConfig>) =>
  (interceptors as unknown as { handlers: InterceptorHandler[] }).handlers[0].fulfilled

const getResponseErrorHandler = () =>
  (apiBackend.interceptors.response as unknown as { handlers: InterceptorHandler[] }).handlers[0].rejected

const buildError = (status: number, url: string) =>
  ({
    config: { url, headers: {} as AxiosResponseHeaders },
    response: { status, data: {}, statusText: '', headers: {}, config: { url } }
  }) as unknown as AxiosError

describe('api clients interceptors', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it("n'envoie pas Bearer null sur apiBackend", async () => {
    const requestHandler = getRequestHandler(apiBackend.interceptors.request)
    const requestConfig = { headers: {} } as InternalAxiosRequestConfig

    const updatedConfig = await requestHandler?.(requestConfig)

    expect(updatedConfig?.headers.Authorization).toBeUndefined()
    expect(updatedConfig?.headers.authorizationMethod).toBe('JWT')
  })

  it('ajoute Authorization quand un access token existe (apiBackend)', async () => {
    localStorage.setItem(ACCESS_TOKEN, 'access-value')
    localStorage.setItem('oidcAuth', 'true')
    const requestHandler = getRequestHandler(apiBackend.interceptors.request)
    const requestConfig = { headers: {} } as InternalAxiosRequestConfig

    const updatedConfig = await requestHandler?.(requestConfig)

    expect(updatedConfig?.headers.Authorization).toBe('Bearer access-value')
    expect(updatedConfig?.headers.authorizationMethod).toBe('OIDC')
  })

  it("n'envoie pas Bearer null sur apiFhir", async () => {
    const requestHandler = getRequestHandler(apiFhir.interceptors.request)
    const requestConfig = { headers: {} } as InternalAxiosRequestConfig

    const updatedConfig = await requestHandler?.(requestConfig)

    expect(updatedConfig?.headers.Authorization).toBeUndefined()
    expect(updatedConfig?.headers.authorizationMethod).toBe('JWT')
  })

  it('déduit correctement authorizationMethod pour OIDC/JWT', () => {
    expect(getAuthorizationMethod()).toBe('JWT')
    localStorage.setItem('oidcAuth', 'true')
    expect(getAuthorizationMethod()).toBe('OIDC')
  })
})

describe('gestion des réponses en erreur sur apiBackend', () => {
  const assign = vi.fn()
  const originalLocation = window.location

  beforeEach(() => {
    assign.mockClear()
    localStorage.clear()
    localStorage.setItem(ACCESS_TOKEN, 'access-value')
    Object.defineProperty(window, 'location', {
      value: { pathname: '/exports', assign },
      writable: true,
      configurable: true
    })
  })

  afterEach(() => {
    Object.defineProperty(window, 'location', { value: originalLocation, writable: true, configurable: true })
  })

  it('déconnecte sur une 401', () => {
    getResponseErrorHandler()?.(buildError(401, '/exports/'))

    expect(assign).toHaveBeenCalledWith('/')
    expect(localStorage.getItem(ACCESS_TOKEN)).toBeNull()
  })

  it('déconnecte sur une 403 renvoyée par le rafraîchissement du token', () => {
    getResponseErrorHandler()?.(buildError(403, '/auth/refresh/'))

    expect(assign).toHaveBeenCalledWith('/')
    expect(localStorage.getItem(ACCESS_TOKEN)).toBeNull()
  })

  it('laisse la session intacte sur une 403 de droits', () => {
    getResponseErrorHandler()?.(buildError(403, '/exports/some-uuid/retry/'))

    expect(assign).not.toHaveBeenCalled()
    expect(localStorage.getItem(ACCESS_TOKEN)).toBe('access-value')
  })
})
