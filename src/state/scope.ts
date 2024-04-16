import { createSlice } from '@reduxjs/toolkit'
import { impersonate, login, logout } from './me'
import { ScopeElement } from 'types'
import { Hierarchy } from 'types/hierarchy'

export type ScopeState = {
  rights: Hierarchy<ScopeElement, string>[]
  codes: {
    rights: Hierarchy<ScopeElement, string>[]
    perimeters: Hierarchy<ScopeElement, string>[]
  }
  openPopulation: number[]
}

const defaultInitialState: ScopeState = {
  rights: [],
  codes: {
    rights: [],
    perimeters: []
  },
  openPopulation: []
}

const scopeSlice = createSlice({
  name: 'scope',
  initialState: defaultInitialState as ScopeState,
  reducers: {
    closeAllOpenedPopulation: (state) => {
      return {
        ...state,
        openPopulation: []
      }
    },
    saveRights: (state, action) => {
      return {
        ...state,
        rights: action.payload.rights || []
      }
    },
    saveFetchedRights: (state, action) => {
      return {
        ...state,
        codes: { ...state.codes, rights: action.payload || [] }
      }
    },
    saveFetchedPerimeters: (state, action) => {
      return {
        ...state,
        codes: { ...state.codes, perimeters: action.payload || [] }
      }
    }
  },
  extraReducers: (builder) => {
    builder.addCase(login, () => defaultInitialState)
    builder.addCase(logout.fulfilled, () => defaultInitialState)
    builder.addCase(impersonate, () => defaultInitialState)
  }
})

export default scopeSlice.reducer
export const { closeAllOpenedPopulation, saveRights, saveFetchedRights, saveFetchedPerimeters } = scopeSlice.actions
