import { CohortData } from 'types'
import { IGroup_Member } from '@ahryman40k/ts-fhir-types/lib/R4'
import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit'
import { logout, login } from './me'
import { RootState } from 'state'
import { fetchCohort } from 'services/cohortInfos'
import { fetchMyPatients } from 'services/myPatients'
import { fetchPerimetersInfos } from 'services/perimeters'

export type ExploredCohortState = {
  importedPatients: any[]
  includedPatients: any[]
  excludedPatients: any[]
  loading: boolean
  requestId?: string
} & CohortData

const localStorageExploredCohort = localStorage.getItem('exploredCohort') ?? null
const jsonExploredCohort = localStorageExploredCohort ? JSON.parse(localStorageExploredCohort) : {}

const defaultInitialState = {
  // CohortData
  name: '',
  description: '',
  cohort: [],
  totalPatients: 0,
  originalPatients: [],
  totalDocs: 0,
  documentsList: [],
  wordcloudData: [],
  encounters: [],
  genderRepartitionMap: undefined,
  visitTypeRepartitionData: undefined,
  monthlyVisitData: undefined,
  agePyramidData: undefined,
  requestId: '',
  // ExploredCohortState
  importedPatients: [],
  includedPatients: [],
  excludedPatients: [],
  loading: false
}

const initialState: ExploredCohortState = localStorageExploredCohort
  ? {
      ...jsonExploredCohort,
      agePyramidData: jsonExploredCohort.agePyramidData ? new Map(jsonExploredCohort.agePyramidData) : new Map(),
      genderRepartitionMap: jsonExploredCohort.genderRepartitionMap
        ? new Map(jsonExploredCohort.genderRepartitionMap)
        : new Map(),
      monthlyVisitData: jsonExploredCohort.monthlyVisitData ? new Map(jsonExploredCohort.monthlyVisitData) : new Map()
    }
  : defaultInitialState

const fetchExploredCohort = createAsyncThunk<
  CohortData,
  { context: 'patients' | 'cohort' | 'perimeters' | 'new_cohort'; id?: string },
  { state: RootState }
>('exploredCohort/fetchExploredCohort', async ({ context, id }, { getState }) => {
  const state = getState()
  const stateCohort = state.exploredCohort.cohort
  let shouldRefreshData = true
  switch (context) {
    case 'cohort':
      shouldRefreshData = !stateCohort || Array.isArray(stateCohort) || stateCohort.id !== id
      break
    case 'perimeters': {
      if (!id) {
        throw new Error('No given perimeter ids')
      }
      const perimeterIds = id.split(',')
      const statePerimeterIds =
        stateCohort &&
        Array.isArray(stateCohort) &&
        (stateCohort.map((group) => group.id).filter((id) => id !== undefined) as string[])

      shouldRefreshData =
        !statePerimeterIds ||
        statePerimeterIds.length !== perimeterIds.length ||
        statePerimeterIds.some((id) => !perimeterIds.includes(id))
      break
    }
    case 'patients': {
      shouldRefreshData = stateCohort !== undefined && state.exploredCohort.originalPatients !== undefined
      break
    }

    default:
      break
  }
  let cohort
  if (shouldRefreshData) {
    switch (context) {
      case 'cohort': {
        if (id) {
          cohort = await fetchCohort(id)
        }
        break
      }
      case 'patients': {
        cohort = await fetchMyPatients()
        break
      }
      case 'perimeters': {
        if (id) {
          cohort = await fetchPerimetersInfos(id)
        }
        break
      }

      default:
        break
    }
  }
  return cohort ?? state.exploredCohort
})

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
    builder.addCase(login, () => defaultInitialState)
    builder.addCase(logout, () => defaultInitialState)
    builder.addCase(fetchExploredCohort.pending, (state, { meta }) => {
      state.loading = true
      state.requestId = meta.requestId
    })
    builder.addCase(fetchExploredCohort.fulfilled, (state, { payload, meta }) => {
      return { ...state, ...payload, loading: state.requestId !== meta.requestId }
    })
  }
})

export default exploredCohortSlice.reducer
export { fetchExploredCohort }
export const {
  addImportedPatients,
  excludePatients,
  setExploredCohort,
  removeImportedPatients,
  includePatients,
  removeExcludedPatients,
  updateCohort
} = exploredCohortSlice.actions
