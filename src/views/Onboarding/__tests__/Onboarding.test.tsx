import { configureStore } from '@reduxjs/toolkit'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import { Provider } from 'react-redux'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const { updateStep, signCharter, getStatus } = vi.hoisted(() => ({
  updateStep: vi.fn(),
  signCharter: vi.fn(),
  getStatus: vi.fn()
}))

vi.mock('services/aphp/serviceOnboarding', () => ({
  default: { updateStep, signCharter, getStatus }
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
    expect(screen.getByText("Les finalités d'usage")).toBeInTheDocument()
    expect(screen.queryByTestId('onboarding-warning')).not.toBeInTheDocument()
  })

  it('falls back to the step placeholder while a step has no screen yet', () => {
    renderAt({ ...baseStatus, onboarding_step: 2 })
    // The label also appears in the stepper rail, so target the card's heading.
    expect(screen.getByRole('heading', { name: "Prendre en main l'outil" })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Terminer/ })).toBeInTheDocument()
  })

  it('surfaces the progress error and keeps the user on the screen', async () => {
    updateStep.mockRejectedValue(new Error('boom'))
    const user = userEvent.setup()
    renderAt({ ...baseStatus, onboarding_step: 2 })

    await user.click(screen.getByRole('button', { name: /Terminer/ }))
    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent(/enregistrement de votre progression/))
  })

  it('disables both buttons while a request is in flight', async () => {
    updateStep.mockReturnValue(new Promise(() => undefined))
    const user = userEvent.setup()
    renderAt({ ...baseStatus, onboarding_step: 2 })

    await user.click(screen.getByRole('button', { name: /Terminer/ }))
    await waitFor(() => expect(screen.getByRole('button', { name: /Terminer/ })).toBeDisabled())
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
