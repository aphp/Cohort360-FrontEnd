import type { PayloadAction } from '@reduxjs/toolkit'
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import serviceOnboarding, {
  type CharterSignature,
  type OnboardingProgress,
  type OnboardingStatus
} from 'services/aphp/serviceOnboarding'
import type { RootState } from 'state'
import { logout } from 'state/me'

// Mirrors User.ONBOARDING_TOTAL_STEPS server-side.
export const ONBOARDING_TOTAL_STEPS = 3

// Tracks whether the current session's progress has been resynced from the server yet.
// The gate waits for a settled status (`ready` or `error`) before deciding, so a returning
// session is never judged on the default (not-onboarded) state while the resync is still in flight.
export type OnboardingSyncStatus = 'idle' | 'loading' | 'ready' | 'error'

export type OnboardingState = {
  step: number
  completedAt: string | null
  charterSignedAt: string | null
  saving: boolean
  error: boolean
  previousStep: number | null
  syncStatus: OnboardingSyncStatus
}

const initialState: OnboardingState = {
  step: 0,
  completedAt: null,
  charterSignedAt: null,
  saving: false,
  error: false,
  previousStep: null,
  syncStatus: 'idle'
}

export const advanceOnboarding = createAsyncThunk<OnboardingProgress, number, { state: RootState }>(
  'onboarding/advance',
  (step) => serviceOnboarding.updateStep(step)
)

export const syncOnboarding = createAsyncThunk<OnboardingStatus, void, { state: RootState }>('onboarding/sync', () =>
  serviceOnboarding.getStatus()
)

export const signCharter = createAsyncThunk<CharterSignature, void, { state: RootState }>(
  'onboarding/signCharter',
  async (_, { getState }) => {
    // Stepping back from the confirmation screen re-enters the charter: never sign twice.
    const { charterSignedAt } = getState().onboarding
    if (charterSignedAt !== null) {
      return { charter_signed_at: charterSignedAt }
    }
    return serviceOnboarding.signCharter()
  }
)

const onboardingSlice = createSlice({
  name: 'onboarding',
  initialState,
  reducers: {
    hydrateOnboarding: (
      state,
      action: PayloadAction<{ step: number; completedAt: string | null; charterSignedAt: string | null }>
    ) => {
      state.step = action.payload.step
      state.completedAt = action.payload.completedAt
      state.charterSignedAt = action.payload.charterSignedAt
      state.saving = false
      state.error = false
      state.previousStep = null
      // A fresh login already carries the server truth: no extra resync needed.
      state.syncStatus = 'ready'
    },
    clearOnboardingError: (state) => {
      state.error = false
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(syncOnboarding.pending, (state) => {
        state.syncStatus = 'loading'
      })
      .addCase(syncOnboarding.fulfilled, (state, action) => {
        state.step = action.payload.onboarding_step
        state.completedAt = action.payload.onboarding_completed_at
        state.charterSignedAt = action.payload.charter_signed_at
        state.syncStatus = 'ready'
      })
      .addCase(syncOnboarding.rejected, (state) => {
        // The gate treats an unconfirmed status as not-onboarded, so a regulatory step is
        // never skipped because a resync failed.
        state.syncStatus = 'error'
      })
      .addCase(advanceOnboarding.pending, (state, action) => {
        state.saving = true
        state.error = false
        state.previousStep = state.step
        state.step = action.meta.arg
      })
      .addCase(advanceOnboarding.fulfilled, (state, action) => {
        state.step = action.payload.onboarding_step
        state.completedAt = action.payload.onboarding_completed_at
        state.saving = false
        state.previousStep = null
      })
      .addCase(advanceOnboarding.rejected, (state) => {
        if (state.previousStep !== null) {
          state.step = state.previousStep
        }
        state.previousStep = null
        state.saving = false
        state.error = true
      })
      .addCase(signCharter.pending, (state) => {
        state.saving = true
        state.error = false
      })
      .addCase(signCharter.fulfilled, (state, action) => {
        state.charterSignedAt = action.payload.charter_signed_at
        state.saving = false
      })
      .addCase(signCharter.rejected, (state) => {
        state.saving = false
        state.error = true
      })
      .addCase(logout.fulfilled, () => initialState)
      .addCase(logout.rejected, () => initialState)
  }
})

export const selectOnboardingCompleted = (state: RootState): boolean => state.onboarding.completedAt !== null

export const selectOnboardingSyncStatus = (state: RootState): OnboardingSyncStatus => state.onboarding.syncStatus

export const { hydrateOnboarding, clearOnboardingError } = onboardingSlice.actions
export default onboardingSlice.reducer
