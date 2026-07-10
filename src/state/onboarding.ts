import type { Action, PayloadAction } from '@reduxjs/toolkit'
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { REHYDRATE } from 'redux-persist'
import serviceOnboarding, { type CharterSignature, type OnboardingProgress } from 'services/aphp/serviceOnboarding'
import type { RootState } from 'state'
import { logout } from 'state/me'

// Mirrors User.ONBOARDING_TOTAL_STEPS server-side.
export const ONBOARDING_TOTAL_STEPS = 3

export type OnboardingState = {
  step: number
  completedAt: string | null
  charterSignedAt: string | null
  saving: boolean
  error: boolean
  previousStep: number | null
}

const initialState: OnboardingState = {
  step: 0,
  completedAt: null,
  charterSignedAt: null,
  saving: false,
  error: false,
  previousStep: null
}

export const advanceOnboarding = createAsyncThunk<OnboardingProgress, number, { state: RootState }>(
  'onboarding/advance',
  (step) => serviceOnboarding.updateStep(step)
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
    },
    clearOnboardingError: (state) => {
      state.error = false
    }
  },
  extraReducers: (builder) => {
    builder
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
      // The slice is persisted: an in-flight request that never settled would otherwise
      // restore `saving: true` on reload and leave the journey buttons disabled forever.
      .addMatcher(
        (action: Action): action is Action => action.type === REHYDRATE,
        (state) => {
          state.saving = false
          state.error = false
          state.previousStep = null
        }
      )
  }
})

export const selectOnboardingCompleted = (state: RootState): boolean => state.onboarding.completedAt !== null

export const { hydrateOnboarding, clearOnboardingError } = onboardingSlice.actions
export default onboardingSlice.reducer
