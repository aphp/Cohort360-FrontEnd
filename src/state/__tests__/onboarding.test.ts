import type { RootState } from 'state'
import { logout } from 'state/me'
import onboardingReducer, {
  advanceOnboarding,
  hydrateOnboarding,
  type OnboardingState, 
  selectOnboardingCompleted
} from 'state/onboarding'
import { describe, expect, it } from 'vitest'

const initialState: OnboardingState = {
  step: 0,
  completedAt: null,
  saving: false,
  error: false,
  previousStep: null
}

describe('onboarding reducer', () => {
  it('hydrates progress from the server payload', () => {
    const state = onboardingReducer(initialState, hydrateOnboarding({ step: 2, completedAt: '2026-06-29T10:00:00Z' }))
    expect(state.step).toBe(2)
    expect(state.completedAt).toBe('2026-06-29T10:00:00Z')
  })

  it('applies the step optimistically while saving', () => {
    const state = onboardingReducer(initialState, advanceOnboarding.pending('req', 2))
    expect(state.step).toBe(2)
    expect(state.previousStep).toBe(0)
    expect(state.saving).toBe(true)
  })

  it('commits the server response on success', () => {
    const pending = onboardingReducer(initialState, advanceOnboarding.pending('req', 3))
    const fulfilled = onboardingReducer(
      pending,
      advanceOnboarding.fulfilled({ onboarding_step: 3, onboarding_completed_at: '2026-06-29T10:00:00Z' }, 'req', 3)
    )
    expect(fulfilled.step).toBe(3)
    expect(fulfilled.completedAt).toBe('2026-06-29T10:00:00Z')
    expect(fulfilled.saving).toBe(false)
  })

  it('rolls back the step when saving fails', () => {
    const started = { ...initialState, step: 1 }
    const pending = onboardingReducer(started, advanceOnboarding.pending('req', 2))
    expect(pending.step).toBe(2)
    const rejected = onboardingReducer(pending, advanceOnboarding.rejected(new Error('boom'), 'req', 2))
    expect(rejected.step).toBe(1)
    expect(rejected.error).toBe(true)
    expect(rejected.saving).toBe(false)
  })

  it('resets on logout', () => {
    const completed: OnboardingState = { ...initialState, step: 3, completedAt: '2026-06-29T10:00:00Z' }
    const state = onboardingReducer(completed, logout.fulfilled(null, 'req'))
    expect(state).toEqual(initialState)
  })
})

describe('selectOnboardingCompleted', () => {
  it('is false while completedAt is null', () => {
    expect(selectOnboardingCompleted({ onboarding: initialState } as RootState)).toBe(false)
  })

  it('is true once completedAt is set', () => {
    const state = { onboarding: { ...initialState, completedAt: '2026-06-29T10:00:00Z' } } as RootState
    expect(selectOnboardingCompleted(state)).toBe(true)
  })
})
