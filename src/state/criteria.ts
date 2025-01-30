import { createSlice, PayloadAction } from '@reduxjs/toolkit'

import { login, logout } from 'state/me'

import { CriteriaItemType } from 'types'

export type CriteriaState = {
  config: {
    [criteriaKey: string]: Partial<CriteriaItemType>
  }
}

const defaultInitialState = {
  config: {}
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
