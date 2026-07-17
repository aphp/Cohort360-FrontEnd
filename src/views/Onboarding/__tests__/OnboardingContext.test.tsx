import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'
import type React from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const updateStep = vi.fn()
const signCharterCall = vi.fn()

vi.mock('services/aphp/serviceOnboarding', () => ({
  default: { updateStep: (step: number) => updateStep(step), signCharter: () => signCharterCall() }
}))

import { ONBOARDING_STATUS_QUERY_KEY } from 'hooks/onboarding/useOnboardingStatus'
import { OnboardingProvider, useOnboarding } from '../OnboardingContext'

const CHARTER_SUBSTEP = 7

const renderOnboarding = (initialStep: number) => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  queryClient.setQueryData(ONBOARDING_STATUS_QUERY_KEY, {
    onboarding_step: initialStep,
    onboarding_completed_at: null,
    charter_signed_at: null
  })
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <OnboardingProvider initialStep={initialStep}>{children}</OnboardingProvider>
    </QueryClientProvider>
  )
  return renderHook(() => useOnboarding(), { wrapper })
}

/** Walks the commitments step from its first screen up to the charter. */
const goToCharter = async (result: { current: ReturnType<typeof useOnboarding> }) => {
  for (let i = 0; i < CHARTER_SUBSTEP; i++) {
    // eslint-disable-next-line no-await-in-loop
    await act(async () => {
      result.current.goNext()
    })
  }
}

describe('OnboardingContext', () => {
  beforeEach(() => {
    updateStep.mockReset()
    signCharterCall.mockReset()
    updateStep.mockResolvedValue({ onboarding_step: 1, onboarding_completed_at: null })
    signCharterCall.mockResolvedValue({ charter_signed_at: '2026-07-09T09:30:00Z' })
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

  it('reports no progress on the welcome screen', () => {
    const { result } = renderOnboarding(0)
    expect(result.current.stepProgress).toBe(0)
  })

  it('advances stepProgress as the screens of a step are left behind', () => {
    const { result } = renderOnboarding(0)
    act(() => result.current.goNext()) // welcome -> first of four screens
    expect(result.current.stepProgress).toBe(0)
    act(() => result.current.goNext())
    expect(result.current.stepProgress).toBe(0.25)
    act(() => result.current.goNext())
    expect(result.current.stepProgress).toBe(0.5)
  })

  it('refuses to be used outside its provider', () => {
    expect(() => renderHook(() => useOnboarding())).toThrow(/must be used within an OnboardingProvider/)
  })

  it('ignores goBack on the welcome screen', () => {
    const { result } = renderOnboarding(0)
    act(() => result.current.goBack())
    expect(result.current.screen).toBe('welcome')
    expect(result.current.currentStep).toBe(0)
  })

  it('clamps a persisted step beyond the last one', () => {
    const { result } = renderOnboarding(99)
    expect(result.current.currentStep).toBe(2)
    expect(result.current.isLastStep).toBe(true)
  })

  it('labels the primary button `Signer` on the charter screen (US-3309)', async () => {
    const { result } = renderOnboarding(1)
    await goToCharter(result)
    expect(result.current.subStep).toBe(CHARTER_SUBSTEP)
    expect(result.current.primaryLabel).toBe('Signer')
  })

  it('signs the charter then moves to the confirmation screen', async () => {
    const { result } = renderOnboarding(1)
    await goToCharter(result)

    await act(async () => {
      result.current.goNext()
    })

    expect(signCharterCall).toHaveBeenCalledTimes(1)
    expect(result.current.subStep).toBe(CHARTER_SUBSTEP + 1)
    expect(result.current.primaryLabel).toBe('Continuer')
  })

  it('stays on the charter screen and raises an error when the signature fails', async () => {
    signCharterCall.mockRejectedValue(new Error('boom'))
    const { result } = renderOnboarding(1)
    await goToCharter(result)

    await act(async () => {
      result.current.goNext()
    })

    await waitFor(() => expect(result.current.error).toBe(true))
    expect(result.current.subStep).toBe(CHARTER_SUBSTEP)
    expect(updateStep).not.toHaveBeenCalled()
  })

  it('ignores goNext while a request is still in flight', async () => {
    let release: (value: unknown) => void = () => undefined
    updateStep.mockReturnValue(new Promise((resolve) => (release = resolve)))

    const { result } = renderOnboarding(2) // last macro step: goNext persists immediately
    act(() => result.current.goNext())
    await waitFor(() => expect(result.current.saving).toBe(true))
    expect(updateStep).toHaveBeenCalledTimes(1)

    act(() => result.current.goNext())
    expect(updateStep).toHaveBeenCalledTimes(1)

    await act(async () => {
      release({ onboarding_step: 3, onboarding_completed_at: '2026-07-10T09:00:00Z' })
    })
    await waitFor(() => expect(result.current.saving).toBe(false))
  })

  it('clears the error banner when the user steps back', async () => {
    updateStep.mockRejectedValue(new Error('boom'))
    const { result } = renderOnboarding(2)
    await act(async () => {
      result.current.goNext()
    })
    await waitFor(() => expect(result.current.error).toBe(true))

    act(() => result.current.goBack())
    expect(result.current.error).toBe(false)
  })

  it('does not sign twice when stepping back from the confirmation screen', async () => {
    const { result } = renderOnboarding(1)
    await goToCharter(result)
    await act(async () => {
      result.current.goNext()
    })

    act(() => result.current.goBack())
    expect(result.current.subStep).toBe(CHARTER_SUBSTEP)
    await act(async () => {
      result.current.goNext()
    })

    expect(signCharterCall).toHaveBeenCalledTimes(1)
    expect(result.current.subStep).toBe(CHARTER_SUBSTEP + 1)
  })
})
