import { createSlice, createEntityAdapter, PayloadAction } from '@reduxjs/toolkit'
import { HierarchyElementWithSystem } from 'types'
import { logout } from './me'
import { LabelObject } from 'types/searchCriterias'

type ValueSetOptions = {
  id: string
  options: HierarchyElementWithSystem[]
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
    addValueSets: valueSetsAdapter.addMany,
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

export const { addValueSets, updateCache } = valueSetsSlice.actions
export default valueSetsSlice.reducer
