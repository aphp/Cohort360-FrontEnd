import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const { mockDispatch } = vi.hoisted(() => ({ mockDispatch: vi.fn() }))

vi.mock('state', () => ({
  useAppSelector: vi.fn(),
  useAppDispatch: () => mockDispatch
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

const stateNotOnboarded = { me: { id: 'user-1' }, onboarding: { completedAt: null, syncStatus: 'ready' } }
const stateOnboarded = { me: { id: 'user-1' }, onboarding: { completedAt: '2026-01-01T00:00:00Z', syncStatus: 'ready' } }

describe('PrivateRoute', () => {
  beforeEach(() => {
    localStorage.clear()
    mockDispatch.mockClear()
    mockedUseAppSelector.mockImplementation((selector) =>
      selector({ me: null, onboarding: { completedAt: null, syncStatus: 'idle' } } as never)
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

  it('déclenche le resync et patiente quand le statut est encore idle', () => {
    setValidToken()
    mockedUseAppSelector.mockImplementation((selector) =>
      selector({ me: { id: 'user-1' }, onboarding: { completedAt: null, syncStatus: 'idle' } } as never)
    )
    renderPrivateRoute()
    expect(mockDispatch).toHaveBeenCalled()
    expect(screen.getByRole('progressbar')).toBeInTheDocument()
    expect(screen.queryByText('private content')).not.toBeInTheDocument()
  })

  it('ne relance pas de resync quand le statut est déjà connu', () => {
    setValidToken()
    mockedUseAppSelector.mockImplementation((selector) => selector(stateOnboarded as never))
    renderPrivateRoute()
    expect(mockDispatch).not.toHaveBeenCalled()
  })

  it('patiente sans rien gater tant que le statut onboarding est en cours de resync', () => {
    setValidToken()
    mockedUseAppSelector.mockImplementation((selector) =>
      selector({ me: { id: 'user-1' }, onboarding: { completedAt: null, syncStatus: 'loading' } } as never)
    )
    renderPrivateRoute()
    expect(screen.getByRole('progressbar')).toBeInTheDocument()
    expect(screen.queryByText('onboarding page')).not.toBeInTheDocument()
    expect(screen.queryByText('private content')).not.toBeInTheDocument()
  })

  it('redirige vers /onboarding quand le resync échoue (fail-closed)', () => {
    setValidToken()
    mockedUseAppSelector.mockImplementation((selector) =>
      selector({ me: { id: 'user-1' }, onboarding: { completedAt: null, syncStatus: 'error' } } as never)
    )
    renderPrivateRoute()
    expect(screen.getByText('onboarding page')).toBeInTheDocument()
    expect(screen.queryByText('private content')).not.toBeInTheDocument()
  })
})
