import { createSlice, PayloadAction } from '@reduxjs/toolkit'

import { login, logout } from 'state/me'

import { CriteriaItemType } from 'types'

export type CriteriaState = CriteriaItemType[]

const defaultInitialState = [] as CriteriaState

const criteriaSlice = createSlice({
  name: 'criteria',
  initialState: defaultInitialState,
  reducers: {
    setCriteriaList: (state: CriteriaState, action: PayloadAction<CriteriaState>) => {
      return action.payload
    }
  },
  extraReducers: (builder) => {
    builder.addCase(login, () => defaultInitialState)
    builder.addCase(logout.fulfilled, () => defaultInitialState)
  }
})

export default criteriaSlice.reducer
export const { setCriteriaList } = criteriaSlice.actions
