import { describe, it, expect, beforeEach, vi } from 'vitest'
import type { InternalAxiosRequestConfig } from 'axios'
import { ACCESS_TOKEN } from 'constants'

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

describe('api clients interceptors', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it("n'envoie pas Bearer null sur apiBackend", async () => {
    const requestHandler = apiBackend.interceptors.request.handlers[0].fulfilled
    const requestConfig = { headers: {} } as InternalAxiosRequestConfig

    const updatedConfig = await requestHandler?.(requestConfig)

    expect(updatedConfig?.headers.Authorization).toBeUndefined()
    expect(updatedConfig?.headers.authorizationMethod).toBe('JWT')
  })

  it('ajoute Authorization quand un access token existe (apiBackend)', async () => {
    localStorage.setItem(ACCESS_TOKEN, 'access-value')
    localStorage.setItem('oidcAuth', 'true')
    const requestHandler = apiBackend.interceptors.request.handlers[0].fulfilled
    const requestConfig = { headers: {} } as InternalAxiosRequestConfig

    const updatedConfig = await requestHandler?.(requestConfig)

    expect(updatedConfig?.headers.Authorization).toBe('Bearer access-value')
    expect(updatedConfig?.headers.authorizationMethod).toBe('OIDC')
  })

  it("n'envoie pas Bearer null sur apiFhir", async () => {
    const requestHandler = apiFhir.interceptors.request.handlers[0].fulfilled
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
