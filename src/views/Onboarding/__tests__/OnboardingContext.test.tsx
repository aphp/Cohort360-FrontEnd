import { configureStore } from '@reduxjs/toolkit'
import { act, renderHook } from '@testing-library/react'
import type React from 'react'
import { Provider } from 'react-redux'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const updateStep = vi.fn()

vi.mock('services/aphp/serviceOnboarding', () => ({
  default: { updateStep: (step: number) => updateStep(step) }
}))

import onboardingReducer from 'state/onboarding'
import { OnboardingProvider, useOnboarding } from '../OnboardingContext'

const renderOnboarding = (initialStep: number) => {
  const store = configureStore({ reducer: { onboarding: onboardingReducer } })
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <Provider store={store}>
      <OnboardingProvider initialStep={initialStep}>{children}</OnboardingProvider>
    </Provider>
  )
  return renderHook(() => useOnboarding(), { wrapper })
}

describe('OnboardingContext', () => {
  beforeEach(() => {
    updateStep.mockReset()
    updateStep.mockResolvedValue({ data: { onboarding_step: 1, onboarding_completed_at: null } })
  })

  it('starts on the welcome screen when nothing is persisted', () => {
    const { result } = renderOnboarding(0)
    expect(result.current.screen).toBe('welcome')
    expect(result.current.currentStep).toBe(0)
  })

  it('moves from welcome to the first step without persisting', () => {
    const { result } = renderOnboarding(0)
    act(() => result.current.goNext())
    expect(result.current.screen).toBe('steps')
    expect(result.current.currentStep).toBe(0)
    expect(updateStep).not.toHaveBeenCalled()
  })

  it('persists the completed step and advances when continuing', async () => {
    const { result } = renderOnboarding(0)
    act(() => result.current.goNext())
    await act(async () => {
      result.current.goNext()
    })
    expect(updateStep).toHaveBeenCalledWith(1)
    expect(result.current.currentStep).toBe(1)
  })

  it('resumes directly at the persisted macro step (RG3305.06)', () => {
    const { result } = renderOnboarding(1)
    expect(result.current.screen).toBe('steps')
    expect(result.current.currentStep).toBe(1)
  })

  it('completes the journey on the last step without overflowing the index', async () => {
    const { result } = renderOnboarding(2)
    expect(result.current.isLastStep).toBe(true)
    await act(async () => {
      result.current.goNext()
    })
    expect(updateStep).toHaveBeenCalledWith(3)
    expect(result.current.currentStep).toBe(2)
  })

  it('steps back from the first step to the welcome screen', () => {
    const { result } = renderOnboarding(0)
    act(() => result.current.goNext())
    act(() => result.current.goBack())
    expect(result.current.screen).toBe('welcome')
  })
})
