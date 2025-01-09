import { createSlice, createEntityAdapter, PayloadAction, createSelector } from '@reduxjs/toolkit'
import { CodesCache } from 'types/hierarchy'
import { logout } from './me'
import { LabelObject } from 'types/searchCriterias'
import { RootState } from 'state'
import { mapCacheToCodes } from 'utils/hierarchy'
import { FhirItem } from 'types/valueSet'

const valueSetsAdapter = createEntityAdapter<CodesCache<FhirItem>>()

const valueSetsSlice = createSlice({
  name: 'valueSets',
  initialState: valueSetsAdapter.getInitialState({
    loading: false,
    error: false,
    loaded: false,
    cache: {} as { [system: string]: LabelObject[] }
  }),
  reducers: {
    saveValueSets: (state, action) => valueSetsAdapter.setMany(state, action.payload),
    updateCache: (state, action: PayloadAction<{ [system: string]: LabelObject[] }>) => {
      return {
        ...state,
        cache: action.payload
      }
    }
  },
  extraReducers: (builder) => {
    builder.addCase(logout.fulfilled, () =>
      valueSetsAdapter.getInitialState({ loading: false, error: false, loaded: false, cache: {} })
    )
  }
})

const valueSetsSelectors = valueSetsAdapter.getSelectors((state: RootState) => state.valueSets)

const selectByIds = createSelector(
  [valueSetsSelectors.selectAll, (state: RootState, ids: string[]) => ids],
  (valueSets, ids) => valueSets.filter((valueSet) => ids.includes(valueSet.id))
)

export const selectValueSetCodes = createSelector([selectByIds], (valueSets) => mapCacheToCodes(valueSets))

export const { updateCache, saveValueSets } = valueSetsSlice.actions
export default valueSetsSlice.reducer
