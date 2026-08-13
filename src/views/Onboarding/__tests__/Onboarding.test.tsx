import { configureStore } from '@reduxjs/toolkit'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import { Provider } from 'react-redux'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const { updateStep, signCharter, getStatus, mockUseOnboardingEnabled } = vi.hoisted(() => ({
  updateStep: vi.fn(),
  signCharter: vi.fn(),
  getStatus: vi.fn(),
  mockUseOnboardingEnabled: vi.fn()
}))

vi.mock('services/aphp/serviceOnboarding', () => ({
  default: { updateStep, signCharter, getStatus }
}))

vi.mock('hooks/onboarding/useOnboardingEnabled', () => ({
  default: () => mockUseOnboardingEnabled()
}))

import { ONBOARDING_STATUS_QUERY_KEY } from 'hooks/onboarding/useOnboardingStatus'
import type { OnboardingStatus } from 'services/aphp/serviceOnboarding'
import meReducer, { type MeState } from 'state/me'
import Onboarding from '../Onboarding'
import { ONBOARDING_ROUTE } from '../route'

const renderAt = (status: OnboardingStatus, me: MeState = null) => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false, staleTime: Infinity } } })
  queryClient.setQueryData(ONBOARDING_STATUS_QUERY_KEY, status)
  const store = configureStore({ reducer: { me: meReducer }, preloadedState: { me } })
  return render(
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={[ONBOARDING_ROUTE]}>
          <Routes>
            <Route path={ONBOARDING_ROUTE} element={<Onboarding />} />
            <Route path="/home" element={<div>home page</div>} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    </Provider>
  )
}

const baseStatus: OnboardingStatus = {
  onboarding_step: 0,
  onboarding_completed_at: null,
  charter_signed_at: null
}

describe('Onboarding page', () => {
  beforeEach(() => {
    updateStep.mockReset()
    signCharter.mockReset()
    getStatus.mockReset()
    updateStep.mockResolvedValue({ onboarding_step: 3, onboarding_completed_at: null })
    mockUseOnboardingEnabled.mockReturnValue(true)
  })

  it('redirects to /home when the feature flag is disabled', () => {
    mockUseOnboardingEnabled.mockReturnValue(false)
    renderAt(baseStatus)
    expect(screen.getByText('home page')).toBeInTheDocument()
  })

  it('redirects to /home when the journey is already completed', () => {
    renderAt({ ...baseStatus, onboarding_step: 3, onboarding_completed_at: '2026-01-01T00:00:00Z' })
    expect(screen.getByText('home page')).toBeInTheDocument()
  })

  it('shows the welcome screen when the journey is not completed', () => {
    renderAt(baseStatus)
    expect(screen.getByText('Bienvenue !')).toBeInTheDocument()
  })

  it('shows the warning on the opening commitments screen only', async () => {
    const user = userEvent.setup()
    renderAt({ ...baseStatus, onboarding_step: 1 })

    expect(screen.getByText("Les règles d'utilisation des données dans Cohort360")).toBeInTheDocument()
    expect(screen.getByTestId('onboarding-warning')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /Continuer/ }))
    expect(screen.getByText('Vos accès sont personnels')).toBeInTheDocument()
    expect(screen.queryByTestId('onboarding-warning')).not.toBeInTheDocument()
  })

  it('holds the commitments validation until the certification is ticked', async () => {
    signCharter.mockResolvedValue({ charter_signed_at: '2026-01-01T00:00:00Z' })
    const user = userEvent.setup()
    renderAt({ ...baseStatus, onboarding_step: 1 })

    // Walk the intro then the ten commitments, down to the summary.
    await user.click(screen.getByRole('button', { name: /Continuer/ }))
    for (let i = 0; i < 10; i++) {
      // eslint-disable-next-line no-await-in-loop
      await user.click(screen.getByRole('button', { name: /Je m’y engage/ }))
    }

    expect(screen.getByRole('heading', { name: 'Synthèse de vos engagements' })).toBeInTheDocument()
    const validate = screen.getByRole('button', { name: /Valider/ })
    expect(validate).toBeDisabled()

    await user.click(screen.getByRole('checkbox', { name: /Je certifie avoir pris connaissance/ }))
    expect(validate).toBeEnabled()

    await user.click(validate)
    await waitFor(() => expect(signCharter).toHaveBeenCalledTimes(1))
  })

  it('closes the journey on the guided tour, with a button to the application', () => {
    renderAt({ ...baseStatus, onboarding_step: 2 }, { deidentified: false } as MeState)
    expect(screen.getByRole('heading', { name: "Prendre en main l'outil" })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Accéder à Cohort360/ })).toBeInTheDocument()
  })

  it('surfaces the progress error and keeps the user on the screen', async () => {
    updateStep.mockRejectedValue(new Error('boom'))
    const user = userEvent.setup()
    renderAt({ ...baseStatus, onboarding_step: 2 })

    await user.click(screen.getByRole('button', { name: /Accéder à Cohort360/ }))
    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent(/enregistrement de votre progression/))
  })

  it('disables both buttons while a request is in flight', async () => {
    updateStep.mockReturnValue(new Promise(() => undefined))
    const user = userEvent.setup()
    renderAt({ ...baseStatus, onboarding_step: 2 })

    await user.click(screen.getByRole('button', { name: /Accéder à Cohort360/ }))
    await waitFor(() => expect(screen.getByRole('button', { name: /Accéder à Cohort360/ })).toBeDisabled())
    expect(screen.getByRole('button', { name: 'Revenir' })).toBeDisabled()
  })

  it('greets the connected user with their initials', () => {
    renderAt(baseStatus, { displayName: 'Cesar RICHARD' } as MeState)
    expect(screen.getByText('Cesar RICHARD')).toBeInTheDocument()
    expect(screen.getByText('CR')).toBeInTheDocument()
  })

  it('keeps at most two initials, and none when no user is connected', () => {
    renderAt(baseStatus, { displayName: 'Jean Pierre Marie DUPONT' } as MeState)
    expect(screen.getByText('JP')).toBeInTheDocument()
  })

  it('hides the back button on the welcome screen', () => {
    renderAt(baseStatus)
    expect(screen.getByRole('button', { name: /Commencer/ })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Revenir' })).not.toBeInTheDocument()
  })
})
