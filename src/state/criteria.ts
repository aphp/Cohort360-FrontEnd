import { createSlice, PayloadAction } from '@reduxjs/toolkit'

import { CriteriaItemType } from 'types'

export type CriteriaState = CriteriaItemType[]

const localStorageCohortCreation = localStorage.getItem('cohortCreation') ?? null
const jsonCohortCreation = localStorageCohortCreation ? JSON.parse(localStorageCohortCreation).criteria : []

const initialState: CriteriaState = jsonCohortCreation ?? []

const criteriaSlice = createSlice({
  name: 'criteria',
  initialState,
  reducers: {
    setCriteriaList: (state: CriteriaState, action: PayloadAction<CriteriaState>) => {
      return action.payload
    }
  }
})

export default criteriaSlice.reducer
export const { setCriteriaList } = criteriaSlice.actions
