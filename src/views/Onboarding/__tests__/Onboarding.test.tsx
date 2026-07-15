import { configureStore } from '@reduxjs/toolkit'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import { Provider } from 'react-redux'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'

vi.mock('services/aphp/serviceOnboarding', () => ({
  default: { updateStep: vi.fn(), signCharter: vi.fn() }
}))

import meReducer, { type MeState } from 'state/me'
import onboardingReducer, { type OnboardingState } from 'state/onboarding'
import Onboarding from '../Onboarding'
import { ONBOARDING_ROUTE } from '../route'

const renderAt = (onboarding: OnboardingState, me: MeState = null) => {
  const store = configureStore({
    reducer: { onboarding: onboardingReducer, me: meReducer },
    preloadedState: { onboarding, me }
  })
  return render(
    <Provider store={store}>
      <MemoryRouter initialEntries={[ONBOARDING_ROUTE]}>
        <Routes>
          <Route path={ONBOARDING_ROUTE} element={<Onboarding />} />
          <Route path="/home" element={<div>home page</div>} />
        </Routes>
      </MemoryRouter>
    </Provider>
  )
}

const baseState: OnboardingState = {
  step: 0,
  completedAt: null,
  charterSignedAt: null,
  saving: false,
  error: false,
  previousStep: null,
  syncStatus: 'ready'
}

describe('Onboarding page', () => {
  it('redirects to /home when the journey is already completed', () => {
    renderAt({ ...baseState, step: 3, completedAt: '2026-01-01T00:00:00Z' })
    expect(screen.getByText('home page')).toBeInTheDocument()
  })

  it('shows the welcome screen when the journey is not completed', () => {
    renderAt(baseState)
    expect(screen.getByText('Bienvenue !')).toBeInTheDocument()
  })

  it('shows the warning on the opening commitments screen only', async () => {
    const user = userEvent.setup()
    renderAt({ ...baseState, step: 1 })

    expect(screen.getByText("Les règles d'utilisation des données dans Cohort360")).toBeInTheDocument()
    expect(screen.getByTestId('onboarding-warning')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /Continuer/ }))
    expect(screen.getByText("L'enregistrement de vos actions")).toBeInTheDocument()
    expect(screen.queryByTestId('onboarding-warning')).not.toBeInTheDocument()
  })

  it('falls back to the step placeholder while a step has no screen yet', () => {
    renderAt({ ...baseState, step: 2 })
    // The label also appears in the stepper rail, so target the card's heading.
    expect(screen.getByRole('heading', { name: "Prendre en main l'outil" })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Terminer/ })).toBeInTheDocument()
  })

  it('surfaces the progress error and keeps the user on the screen', () => {
    renderAt({ ...baseState, step: 1, error: true })
    expect(screen.getByRole('alert')).toHaveTextContent(/enregistrement de votre progression/)
  })

  it('disables both buttons while a request is in flight', () => {
    renderAt({ ...baseState, step: 1, saving: true })
    expect(screen.getByRole('button', { name: /Continuer/ })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Revenir' })).toBeDisabled()
  })

  it('greets the connected user with their initials', () => {
    renderAt(baseState, { displayName: 'Cesar RICHARD' } as MeState)
    expect(screen.getByText('Cesar RICHARD')).toBeInTheDocument()
    expect(screen.getByText('CR')).toBeInTheDocument()
  })

  it('keeps at most two initials, and none when no user is connected', () => {
    renderAt(baseState, { displayName: 'Jean Pierre Marie DUPONT' } as MeState)
    expect(screen.getByText('JP')).toBeInTheDocument()
  })

  it('hides the back button on the welcome screen', () => {
    renderAt(baseState)
    expect(screen.getByRole('button', { name: /Commencer/ })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Revenir' })).not.toBeInTheDocument()
  })
})
