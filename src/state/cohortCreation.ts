import { logout } from './me'
import { createSlice, PayloadAction } from '@reduxjs/toolkit'

type CohortCreationState = {
  //TODO: PopulationSources typing
  populationSources: any[]
  //TODO: Criteria typing
  inclusionCriterias: any[]
  cohortName: string
}

const initialState: CohortCreationState = {
  populationSources: [],
  inclusionCriterias: [],
  cohortName: ''
}

const cohortCreationSlice = createSlice({
  name: 'cohortCreation',
  initialState,
  reducers: {
    setPopulationSource: (state: CohortCreationState, action: PayloadAction<any[]>) => {
      state.populationSources = action.payload
    },
    addInclusionCriteria: (
      state: CohortCreationState,
      action: PayloadAction<{ inclusionCriteria: any; index: number }>
    ) => {
      const { inclusionCriteria, index } = action.payload
      const inclusionCriterias = [...state.inclusionCriterias]
      const newCriterias =
        undefined !== index
          ? inclusionCriterias.map((criteria, i) => {
              return i === index ? inclusionCriteria : criteria
            })
          : [...state.inclusionCriterias, inclusionCriteria]

      state.inclusionCriterias = newCriterias
    },
    removeInclusionCriteria: (state: CohortCreationState, action: PayloadAction<number>) => {
      state.inclusionCriterias = state.inclusionCriterias.filter((criteria, index) => index !== action.payload)
    },
    setCohortName: (state: CohortCreationState, action: PayloadAction<string>) => {
      state.cohortName = action.payload
    },
    resetCohortCreation: () => {
      return initialState
    }
  },
  extraReducers: (builder) => {
    builder.addCase(logout, () => {
      return initialState
    })
  }
})

export default cohortCreationSlice.reducer
export const {
  addInclusionCriteria,
  removeInclusionCriteria,
  resetCohortCreation,
  setCohortName,
  setPopulationSource
} = cohortCreationSlice.actions
