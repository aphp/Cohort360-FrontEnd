import { createEntityAdapter, createSelector, createSlice } from '@reduxjs/toolkit'
import { impersonate, login, logout } from './me'
import { CodesCache, Hierarchy } from 'types/hierarchy'
import { RootState } from 'state'
import { mapCacheToCodes } from 'utils/hierarchy'
import { ScopeElement } from 'types/scope'

export type ScopeState = {
  rights: Hierarchy<ScopeElement>[]
  codes: {
    rights: ReturnType<typeof fetchedRightsAdapter.getInitialState>
    perimeters: ReturnType<typeof fetchedPerimetersAdapter.getInitialState>
  }
  openPopulation: number[]
}

const fetchedRightsAdapter = createEntityAdapter<CodesCache<ScopeElement>>()
const fetchedPerimetersAdapter = createEntityAdapter<CodesCache<ScopeElement>>()

const defaultInitialState: ScopeState = {
  rights: [],
  codes: {
    rights: fetchedRightsAdapter.getInitialState(),
    perimeters: fetchedPerimetersAdapter.getInitialState()
  },
  openPopulation: []
}

const scopeSlice = createSlice({
  name: 'scope',
  initialState: defaultInitialState,
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
    saveScopeCodes: (state, action) => {
      action.payload.isRights
        ? fetchedRightsAdapter.setOne(state.codes.rights, action.payload.values)
        : fetchedPerimetersAdapter.setOne(state.codes.perimeters, action.payload.values)
    }
  },
  extraReducers: (builder) => {
    builder.addCase(login, () => defaultInitialState)
    builder.addCase(logout.fulfilled, () => defaultInitialState)
    builder.addCase(impersonate, () => defaultInitialState)
  }
})

const selectPerimeterCodes = fetchedPerimetersAdapter.getSelectors((state: RootState) => state.scope.codes.perimeters)
const selectRightsCodes = fetchedRightsAdapter.getSelectors((state: RootState) => state.scope.codes.rights)

const selectByAccess = createSelector(
  [
    selectPerimeterCodes.selectAll,
    selectRightsCodes.selectAll,
    (state: RootState, isRights: boolean) => ({ isRights })
  ],
  (perimeterCodes, rightsCodes, { isRights }) => (isRights ? rightsCodes : perimeterCodes)
)

export const selectScopeCodes = createSelector([selectByAccess], (codes) => mapCacheToCodes(codes))

export default scopeSlice.reducer
export const { closeAllOpenedPopulation, saveRights, saveScopeCodes } = scopeSlice.actions
