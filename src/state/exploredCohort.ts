import { CohortData } from 'types'
import { IGroup_Member } from '@ahryman40k/ts-fhir-types/lib/R4'
import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { logout } from './me'

type ExploredCohortState = {
  importedPatients: any[]
  includedPatients: any[]
  excludedPatients: any[]
} & CohortData

const initialState: ExploredCohortState = {
  importedPatients: [],
  includedPatients: [],
  excludedPatients: []
}

const exploredCohortSlice = createSlice({
  name: 'exploredCohort',
  initialState,
  reducers: {
    setExploredCohort: (state: ExploredCohortState, action: PayloadAction<CohortData | undefined>) => {
      return action.payload ? { ...state, ...action.payload } : initialState
    },
    addImportedPatients: (state: ExploredCohortState, action: PayloadAction<any[]>) => {
      const importedPatients = [...state.importedPatients, ...action.payload]
      state.importedPatients = importedPatients.filter(
        (patient, index, self) =>
          index === self.findIndex((t) => t.id === patient.id) &&
          !state.originalPatients?.map((p) => p.id).includes(patient.id) &&
          !state.excludedPatients.map((p) => p.id).includes(patient.id)
      )
    },
    removeImportedPatients: (state: ExploredCohortState, action: PayloadAction<any[]>) => {
      const listId = action.payload.map((patient) => patient.id)
      state.importedPatients = state.importedPatients.filter((patient) => !listId.includes(patient.id))
    },
    includePatients: (state: ExploredCohortState, action: PayloadAction<any[]>) => {
      const includedPatients = [...state.includedPatients, ...action.payload]
      const importedPatients = state.importedPatients.filter(
        (patient) => !action.payload.map((p) => p.id).includes(patient.id)
      )
      state.importedPatients = importedPatients
      state.includedPatients = includedPatients
    },
    excludePatients: (state: ExploredCohortState, action: PayloadAction<any[]>) => {
      const toExcluded = state.originalPatients?.filter((patient) =>
        action.payload.map((p) => p.id).includes(patient.id)
      )
      const toImported = state.includedPatients.filter((patient) =>
        action.payload.map((p) => p.id).includes(patient.id)
      )
      const allExcludedPatients = [...state.excludedPatients, ...toExcluded]
      const allImportedPatients = [...state.importedPatients, ...toImported]
      return {
        ...state,
        includedPatients: state.includedPatients.filter(
          (patient) => !action.payload.map((p) => p.id).includes(patient.id)
        ),
        originalPatients: state.originalPatients?.filter(
          (patient) => !action.payload.map((p) => p.id).includes(patient.id)
        ),
        excludedPatients: allExcludedPatients.filter(
          (patient, index, self) => index === self.findIndex((t) => t.id === patient.id)
        ),
        importedPatients: allImportedPatients
      }
    },
    removeExcludedPatients: (state: ExploredCohortState, action: PayloadAction<any[]>) => {
      const originalPatients = [...state.originalPatients, ...action.payload]
      const excludedPatients = state.excludedPatients.filter(
        (patient) => !action.payload.map((p) => p.id).includes(patient.id)
      )
      state.originalPatients = originalPatients
      state.excludedPatients = excludedPatients
    },
    updateCohort: (state: ExploredCohortState, action: PayloadAction<IGroup_Member[]>) => {
      return {
        ...state,
        cohort:
          Array.isArray(state.cohort) || !state.cohort ? state.cohort : { ...state.cohort, member: action.payload },
        importedPatients: [],
        includedPatients: [],
        excludedPatients: []
      }
    }
  },
  extraReducers: (builder) => {
    builder.addCase(logout, () => {
      return initialState
    })
  }
})

export default exploredCohortSlice.reducer
export const {
  addImportedPatients,
  excludePatients,
  setExploredCohort,
  removeImportedPatients,
  includePatients,
  removeExcludedPatients,
  updateCohort
} = exploredCohortSlice.actions
