import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const { mockUseAppSelector, mockUseOnboardingStatus } = vi.hoisted(() => ({
  mockUseAppSelector: vi.fn(),
  mockUseOnboardingStatus: vi.fn()
}))

vi.mock('state', () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  useAppSelector: (selector: any) => mockUseAppSelector(selector),
  useAppDispatch: () => vi.fn()
}))

vi.mock('hooks/onboarding/useOnboardingStatus', () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  default: (...args: any[]) => mockUseOnboardingStatus(...args)
}))

vi.mock('services/aphp/serviceFhirConfig', () => ({
  updateConfigFromFhirMetadata: vi.fn()
}))

vi.mock('lodash', () => ({
  throttle: (callback: () => void) => callback
}))

import { AppConfig, type AppConfig as AppConfigType } from 'config'
import { ACCESS_TOKEN } from 'constants.js'
import type { OnboardingStatus } from 'services/aphp/serviceOnboarding'
import PrivateRoute from '../PrivateRoute'

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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const setMe = (me: any) => mockUseAppSelector.mockImplementation((selector: any) => selector({ me }))

const setStatus = (status: OnboardingStatus | undefined, statusPending = false) =>
  mockUseOnboardingStatus.mockReturnValue({ status, statusPending, statusIsError: false, refetch: vi.fn() })

const completedStatus: OnboardingStatus = {
  onboarding_step: 3,
  onboarding_completed_at: '2026-01-01T00:00:00Z',
  charter_signed_at: '2026-01-01T00:00:00Z'
}

const pendingStatus: OnboardingStatus = {
  onboarding_step: 0,
  onboarding_completed_at: null,
  charter_signed_at: null
}

describe('PrivateRoute', () => {
  beforeEach(() => {
    localStorage.clear()
    setMe(null)
    setStatus(undefined, true)
  })

  it("bloque l'accès quand me est null", () => {
    renderPrivateRoute()
    expect(screen.getByText(/vous allez être redirigé vers la page de connexion/i)).toBeInTheDocument()
  })

  it("bloque l'accès quand access_token est absent même avec me", () => {
    setMe({ id: 'user-1' })
    renderPrivateRoute()
    expect(screen.getByText(/vous allez être redirigé vers la page de connexion/i)).toBeInTheDocument()
  })

  it("bloque l'accès quand le token est expiré", () => {
    localStorage.setItem(ACCESS_TOKEN, makeJwt(Math.floor(Date.now() / 1000) - 3600))
    setMe({ id: 'user-1' })
    renderPrivateRoute()
    expect(screen.getByText(/vous allez être redirigé vers la page de connexion/i)).toBeInTheDocument()
  })

  it('patiente tant que le statut onboarding n\'est pas confirmé', () => {
    setValidToken()
    setMe({ id: 'user-1' })
    setStatus(undefined, true)
    renderPrivateRoute()
    expect(screen.getByRole('progressbar')).toBeInTheDocument()
    expect(screen.queryByText('onboarding page')).not.toBeInTheDocument()
    expect(screen.queryByText('private content')).not.toBeInTheDocument()
  })

  it('redirige vers /onboarding quand le parcours n\'est pas terminé', () => {
    setValidToken()
    setMe({ id: 'user-1' })
    setStatus(pendingStatus)
    renderPrivateRoute()
    expect(screen.getByText('onboarding page')).toBeInTheDocument()
    expect(screen.queryByText('private content')).not.toBeInTheDocument()
  })

  it('laisse passer quand me, token valide et parcours terminé', () => {
    setValidToken()
    setMe({ id: 'user-1' })
    setStatus(completedStatus)
    renderPrivateRoute()
    expect(screen.getByText('private content')).toBeInTheDocument()
  })

  it('ne déclenche la lecture du statut que lorsque la session est authentifiée', () => {
    setValidToken()
    setMe({ id: 'user-1' })
    setStatus(completedStatus)
    renderPrivateRoute()
    expect(mockUseOnboardingStatus).toHaveBeenCalledWith(true)
  })
})
