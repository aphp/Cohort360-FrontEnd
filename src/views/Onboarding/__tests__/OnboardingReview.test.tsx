import { configureStore } from '@reduxjs/toolkit'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router'
import { describe, expect, it, vi } from 'vitest'

import meReducer, { type MeState } from 'state/me'
import OnboardingReview from '../OnboardingReview'
import type { OnboardingScreenConfig } from '../steps'

const ReviewedScreen = () => <h4>reviewed screen</h4>

const renderReview = (screenConfig: Partial<OnboardingScreenConfig> = {}, onReturn = vi.fn()) => {
  const store = configureStore({
    reducer: { me: meReducer },
    preloadedState: { me: { displayName: 'Cesar RICHARD' } as MeState }
  })
  render(
    <Provider store={store}>
      <MemoryRouter>
        <OnboardingReview
          screenConfig={{ key: 'reviewed', component: ReviewedScreen, ...screenConfig }}
          onReturn={onReturn}
        />
      </MemoryRouter>
    </Provider>
  )
  return onReturn
}

describe('OnboardingReview', () => {
  it('shows the given screen on its own, without steps rail nor navigation buttons', () => {
    renderReview()
    expect(screen.getByRole('heading', { name: 'reviewed screen' })).toBeInTheDocument()
    expect(screen.queryByText('Découvrir votre environnement')).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Revenir' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Continuer/ })).not.toBeInTheDocument()
  })

  it('keeps the header with the logo, the user menu and a « Revenir à Cohort360 » button', () => {
    renderReview()
    expect(screen.getByAltText('Logo Cohort360')).toBeInTheDocument()
    expect(screen.getByText('Cesar RICHARD')).toBeInTheDocument()
    const back = screen.getByRole('button', { name: 'Revenir à Cohort360' })
    expect(within(back).getByTestId('CloseRoundedIcon')).toBeInTheDocument()
  })

  it('shows the screen tag when the screen has one', () => {
    renderReview({ tag: 'Engagement 3' })
    expect(screen.getByText('Engagement 3')).toBeInTheDocument()
  })

  it('hands the return over to its caller', async () => {
    const user = userEvent.setup()
    const onReturn = renderReview()
    await user.click(screen.getByRole('button', { name: 'Revenir à Cohort360' }))
    expect(onReturn).toHaveBeenCalledTimes(1)
  })
})
