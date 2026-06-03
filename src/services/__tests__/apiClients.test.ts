import { describe, it, expect, beforeEach, vi } from 'vitest'
import type { AxiosInterceptorManager, InternalAxiosRequestConfig } from 'axios'
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
}

const getRequestHandler = (interceptors: AxiosInterceptorManager<InternalAxiosRequestConfig>) =>
  (interceptors as unknown as { handlers: InterceptorHandler[] }).handlers[0].fulfilled

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
