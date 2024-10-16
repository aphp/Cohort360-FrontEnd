import { createSlice, createEntityAdapter, PayloadAction, createSelector } from '@reduxjs/toolkit'
import { Codes, Hierarchy } from 'types/hierarchy'
import { logout } from './me'
import { LabelObject } from 'types/searchCriterias'
import { RootState } from 'state'

export type ValueSetOptions = {
  id: string
  options: { [key: string]: Hierarchy<any> }
}

const valueSetsAdapter = createEntityAdapter<ValueSetOptions>()

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

const mapValueSetOptionsToCodes = <T>(valueSets: ValueSetOptions[]): Codes<Hierarchy<T>> => {
  console.log("test passage")
  const codes: Codes<Hierarchy<T>> = new Map()
  valueSets.forEach((valueSet) => {
    const innerMap: Map<string, Hierarchy<T>> = new Map()
    Object.entries(valueSet.options).forEach(([key, hierarchy]) => innerMap.set(key, hierarchy))
    codes.set(valueSet.id, innerMap)
  })
  return codes
}

export const selectByIdsMapped = createSelector([selectByIds], (valueSets) => mapValueSetOptionsToCodes(valueSets))

export const { updateCache, saveValueSets } = valueSetsSlice.actions
export default valueSetsSlice.reducer
