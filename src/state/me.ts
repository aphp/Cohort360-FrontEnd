import { createSlice, PayloadAction, createAsyncThunk, createAction } from '@reduxjs/toolkit'
import { RootState } from 'state'

import services from 'services/aphp'
import { AccessExpiration, User } from '../types'
import { IMPERSONATED_USER } from 'constants.js'

/**
 * State interface for the current user (me).
 * Can be null when user is not authenticated.
 */
export type MeState = null | {
  /** User unique identifier */
  id: string
  /** User login name */
  userName: string
  /** User display name */
  displayName: string
  /** User first name */
  firstName: string
  /** User last name */
  lastName: string
  /** Whether user access is deidentified */
  deidentified: boolean
  /** List of access expirations for different perimeters */
  accessExpirations: AccessExpiration[]
  /** IDs of nominative groups the user has access to */
  nominativeGroupsIds?: string[]
  /** Top-level care sites the user has access to */
  topLevelCareSites?: string[]
  /** Last connection timestamp */
  lastConnection?: string
  /** Maintenance information */
  maintenance?: {
    /** Whether maintenance is active */
    active: boolean
    /** Maintenance end timestamp */
    maintenance_end: string
    /** Maintenance start timestamp */
    maintenance_start: string
    /** Maintenance type */
    type: string
    /** Maintenance message */
    message: string
  }
  /** Impersonated user information */
  impersonation?: User
}

/**
 * Logout action defined outside of the meSlice because it is being used by all reducers.
 * Calls the logout service and returns null to clear the user state.
 * Also clears impersonation data from localStorage.
 *
 * @returns Promise resolving to null (cleared state)
 */
const logout = createAsyncThunk<MeState, void, { state: RootState }>('scope/logout', async () => {
  services.practitioner.logout()
  // Clear impersonation data from localStorage on logout
  localStorage.removeItem(IMPERSONATED_USER)
  return null
})

/**
 * Impersonation action that allows switching to another user's context.
 * Manages localStorage for impersonated user and triggers page reload.
 *
 * @param user - User to impersonate, or undefined to stop impersonation
 * @returns Action with user payload
 */
export const impersonate = createAction('me/impersonate', (user?: User) => {
  if (user) {
    localStorage.setItem(IMPERSONATED_USER, JSON.stringify(user))
  } else {
    localStorage.removeItem(IMPERSONATED_USER)
  }
  // this is bad but i don't know how to refresh the page after impersonation (which is sometimes needed to refresh the current page content/store)
  setTimeout(() => {
    window.location.reload()
  }, 1000)
  return {
    payload: { user }
  }
})

/**
 * Redux slice for user authentication and profile management
 */
const meSlice = createSlice({
  name: 'me',
  initialState: null as MeState,
  reducers: {
    /**
     * Sets the authenticated user state.
     *
     * @param state - Current state
     * @param action - Action containing the user data
     */
    login: (state: MeState, action: PayloadAction<MeState>) => {
      return action.payload
    },
    /**
     * Updates user perimeters (access boundaries) and deidentification status.
     * Sets deidentified to true if no nominative groups are available.
     *
     * @param state - Current state
     * @param action - Action containing nominative groups and care sites
     */
    updatePerimeters: (
      state,
      action: PayloadAction<{ nominativeGroupsIds: string[]; topLevelCareSites: string[] }>
    ) => {
      if (state) {
        return {
          ...state,
          nominativeGroupsIds: action.payload.nominativeGroupsIds,
          topLevelCareSites: action.payload.topLevelCareSites,
          deidentified: action.payload.nominativeGroupsIds.length === 0
        }
      }
      return state
    },
    /**
     * Updates maintenance information for the current user session.
     *
     * @param state - Current state
     * @param action - Action containing maintenance details
     */
    updateMaintenance: (
      state,
      action: PayloadAction<{
        active: boolean
        maintenance_end: string
        maintenance_start: string
        type: string
        message: string
      }>
    ) => {
      if (state) {
        return {
          ...state,
          maintenance: action.payload
        }
      }
      return state
    }
  },
  extraReducers: (builder) => {
    builder.addCase(logout.fulfilled, () => null)
    builder.addCase(logout.rejected, () => null)
    builder.addCase(impersonate, (state, action) => {
      if (state) {
        return { ...state, impersonation: action.payload.user }
      }
      return state
    })
  }
})

/** Default export: the me reducer */
export default meSlice.reducer

/** Async thunk action for user logout */
export { logout }

/** Action creators for user management operations */
export const { login, updateMaintenance, updatePerimeters } = meSlice.actions
