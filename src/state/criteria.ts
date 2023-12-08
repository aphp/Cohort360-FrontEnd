import { createSlice, PayloadAction } from '@reduxjs/toolkit'

import { login, logout } from 'state/me'

import { CriteriaItemDataCache, CriteriaItemType } from 'types'

export type CriteriaState = {
  config: {
    [criteriaKey: string]: Partial<CriteriaItemType>
  }
  cache: CriteriaItemDataCache[]
}

const defaultInitialState = {
  config: {},
  cache: []
} as CriteriaState

const criteriaSlice = createSlice({
  name: 'criteria',
  initialState: defaultInitialState,
  reducers: {
    setCriteriaData: (state: CriteriaState, action: PayloadAction<CriteriaState>) => {
      return action.payload
    }
  },
  extraReducers: (builder) => {
    builder.addCase(login, () => defaultInitialState)
    builder.addCase(logout.fulfilled, () => defaultInitialState)
  }
})

export default criteriaSlice.reducer
export const { setCriteriaData } = criteriaSlice.actions
