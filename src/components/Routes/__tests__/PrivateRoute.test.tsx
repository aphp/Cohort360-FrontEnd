import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('state', () => ({
  useAppSelector: vi.fn(),
  useAppDispatch: vi.fn(() => vi.fn())
}))

vi.mock('services/aphp/serviceFhirConfig', () => ({
  updateConfigFromFhirMetadata: vi.fn()
}))

vi.mock('lodash', () => ({
  throttle: (callback: () => void) => callback
}))

import { AppConfig, type AppConfig as AppConfigType } from 'config'
import { ACCESS_TOKEN } from 'constants.js'
import { useAppSelector } from 'state'
import PrivateRoute from '../PrivateRoute'

const mockedUseAppSelector = vi.mocked(useAppSelector)

const makeJwt = (exp: number) => {
  const header = btoa(JSON.stringify({ alg: 'HS256' }))
  const payload = btoa(JSON.stringify({ exp }))
  return `${header}.${payload}.signature`
}

const renderPrivateRoute = () =>
  render(
    <AppConfig.Provider value={{ system: { userTrackingBlacklist: [] } } as unknown as AppConfigType}>
      <MemoryRouter initialEntries={['/private']}>
        <Routes>
          <Route element={<PrivateRoute />}>
            <Route path="/private" element={<div>private content</div>} />
          </Route>
          <Route path="/onboarding" element={<div>onboarding page</div>} />
        </Routes>
      </MemoryRouter>
    </AppConfig.Provider>
  )

const setValidToken = () => localStorage.setItem(ACCESS_TOKEN, makeJwt(Math.floor(Date.now() / 1000) + 3600))

const stateNotOnboarded = { me: { id: 'user-1' }, onboarding: { completedAt: null } }
const stateOnboarded = { me: { id: 'user-1' }, onboarding: { completedAt: '2026-01-01T00:00:00Z' } }

describe('PrivateRoute', () => {
  beforeEach(() => {
    localStorage.clear()
    mockedUseAppSelector.mockImplementation((selector) =>
      selector({ me: null, onboarding: { completedAt: null } } as never)
    )
  })

  it("bloque l'accès quand me est null", () => {
    renderPrivateRoute()
    expect(screen.getByText(/vous allez être redirigé vers la page de connexion/i)).toBeInTheDocument()
  })

  it("bloque l'accès quand access_token est absent même avec me", () => {
    mockedUseAppSelector.mockImplementation((selector) => selector(stateNotOnboarded as never))
    renderPrivateRoute()
    expect(screen.getByText(/vous allez être redirigé vers la page de connexion/i)).toBeInTheDocument()
  })

  it("bloque l'accès quand le token est expiré", () => {
    localStorage.setItem(ACCESS_TOKEN, makeJwt(Math.floor(Date.now() / 1000) - 3600))
    mockedUseAppSelector.mockImplementation((selector) => selector(stateNotOnboarded as never))
    renderPrivateRoute()
    expect(screen.getByText(/vous allez être redirigé vers la page de connexion/i)).toBeInTheDocument()
  })

  it('redirige vers /onboarding quand le parcours n\'est pas terminé', () => {
    setValidToken()
    mockedUseAppSelector.mockImplementation((selector) => selector(stateNotOnboarded as never))
    renderPrivateRoute()
    expect(screen.getByText('onboarding page')).toBeInTheDocument()
    expect(screen.queryByText('private content')).not.toBeInTheDocument()
  })

  it('laisse passer quand me, token valide et parcours terminé', () => {
    setValidToken()
    mockedUseAppSelector.mockImplementation((selector) => selector(stateOnboarded as never))
    renderPrivateRoute()
    expect(screen.getByText('private content')).toBeInTheDocument()
  })
})
