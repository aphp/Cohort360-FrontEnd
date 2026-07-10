import type { RootState } from 'state'
import { logout } from 'state/me'
import onboardingReducer, {
  advanceOnboarding,
  hydrateOnboarding,
  type OnboardingState,
  selectOnboardingCompleted,
  signCharter
} from 'state/onboarding'
import { describe, expect, it } from 'vitest'

const SIGNED_AT = '2026-07-09T09:30:00Z'

const initialState: OnboardingState = {
  step: 0,
  completedAt: null,
  charterSignedAt: null,
  saving: false,
  error: false,
  previousStep: null
}

describe('onboarding reducer', () => {
  it('hydrates progress from the server payload', () => {
    const state = onboardingReducer(
      initialState,
      hydrateOnboarding({ step: 2, completedAt: '2026-06-29T10:00:00Z', charterSignedAt: null })
    )
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

  it('records the charter signature timestamp on success (RG3309.02)', () => {
    const pending = onboardingReducer(initialState, signCharter.pending('req'))
    expect(pending.saving).toBe(true)
    const fulfilled = onboardingReducer(pending, signCharter.fulfilled({ charter_signed_at: SIGNED_AT }, 'req'))
    expect(fulfilled.charterSignedAt).toBe(SIGNED_AT)
    expect(fulfilled.saving).toBe(false)
    expect(fulfilled.error).toBe(false)
  })

  it('flags an error and keeps the charter unsigned when the call fails', () => {
    const pending = onboardingReducer(initialState, signCharter.pending('req'))
    const rejected = onboardingReducer(pending, signCharter.rejected(new Error('boom'), 'req'))
    expect(rejected.charterSignedAt).toBeNull()
    expect(rejected.error).toBe(true)
    expect(rejected.saving).toBe(false)
  })

  it('hydrates an already signed charter', () => {
    const state = onboardingReducer(
      initialState,
      hydrateOnboarding({ step: 2, completedAt: null, charterSignedAt: SIGNED_AT })
    )
    expect(state.charterSignedAt).toBe(SIGNED_AT)
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
