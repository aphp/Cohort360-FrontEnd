import { configureStore } from '@reduxjs/toolkit'
import { render, screen } from '@testing-library/react'
import React from 'react'
import { Provider } from 'react-redux'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'

vi.mock('services/aphp/serviceOnboarding', () => ({
  default: { updateStep: vi.fn() }
}))

import meReducer from 'state/me'
import onboardingReducer, { type OnboardingState } from 'state/onboarding'
import Onboarding from '../Onboarding'

const renderAt = (onboarding: OnboardingState) => {
  const store = configureStore({
    reducer: { onboarding: onboardingReducer, me: meReducer },
    preloadedState: { onboarding }
  })
  return render(
    <Provider store={store}>
      <MemoryRouter initialEntries={['/onboarding']}>
        <Routes>
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/home" element={<div>home page</div>} />
        </Routes>
      </MemoryRouter>
    </Provider>
  )
}

const baseState: OnboardingState = { step: 0, completedAt: null, saving: false, error: false, previousStep: null }

describe('Onboarding page', () => {
  it('redirects to /home when the journey is already completed', () => {
    renderAt({ ...baseState, step: 3, completedAt: '2026-01-01T00:00:00Z' })
    expect(screen.getByText('home page')).toBeInTheDocument()
  })

  it('shows the welcome screen when the journey is not completed', () => {
    renderAt(baseState)
    expect(screen.getByText('Bienvenue !')).toBeInTheDocument()
  })
})
