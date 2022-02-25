import { createSlice, PayloadAction } from '@reduxjs/toolkit'

import { CriteriaItemType } from 'types'

export type CriteriaState = CriteriaItemType[]

const criteriaSlice = createSlice({
  name: 'criteria',
  initialState: [] as CriteriaState,
  reducers: {
    setCriteriaList: (state: CriteriaState, action: PayloadAction<CriteriaState>) => {
      return action.payload
    }
  }
})

export default criteriaSlice.reducer
export const { setCriteriaList } = criteriaSlice.actions
