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

  it('navigates the screens of a macro step without persisting until it is left', async () => {
    const { result } = renderOnboarding(0)
    act(() => result.current.goNext()) // welcome -> first screen of step 0
    expect(result.current.currentStep).toBe(0)
    expect(result.current.subStep).toBe(0)

    // The environment step is made of four screens (three from 3306, one from 3307).
    act(() => result.current.goNext())
    expect(result.current.subStep).toBe(1)
    expect(updateStep).not.toHaveBeenCalled()

    act(() => result.current.goNext())
    act(() => result.current.goNext())
    expect(result.current.subStep).toBe(3)
    expect(updateStep).not.toHaveBeenCalled()
  })

  it('persists the completed step and advances when leaving the last screen of a macro step', async () => {
    const { result } = renderOnboarding(0)
    act(() => result.current.goNext()) // welcome -> screen 0
    act(() => result.current.goNext()) // screen 1
    act(() => result.current.goNext()) // screen 2
    act(() => result.current.goNext()) // screen 3 (last of step 0)
    await act(async () => {
      result.current.goNext() // leaves step 0
    })
    expect(updateStep).toHaveBeenCalledWith(1)
    expect(result.current.currentStep).toBe(1)
    expect(result.current.subStep).toBe(0)
  })

  it('steps back through screens then to the previous macro step', async () => {
    const { result } = renderOnboarding(0)
    for (let i = 0; i < 5; i++) {
      // eslint-disable-next-line no-await-in-loop
      await act(async () => {
        result.current.goNext()
      })
    }
    // Now on the last screen of step 1 boundary; walk back into step 0.
    expect(result.current.currentStep).toBe(1)
    act(() => result.current.goBack())
    expect(result.current.currentStep).toBe(0)
    expect(result.current.subStep).toBe(3)
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
