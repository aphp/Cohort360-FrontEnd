import { CohortData } from 'types'
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit'
import { impersonate, login, logout } from './me'
import { RootState } from 'state'

import services from 'services/aphp'
import servicesPerimeters from '../services/aphp/servicePerimeters'
import { Patient } from 'fhir/r4'
import { isCustomError } from 'utils/perimeters'
import { getExtension } from 'utils/fhir'
import { getConfig } from 'config'
import { URLS } from 'types/exploration'

export type ExploredCohortState = {
  importedPatients: Patient[]
  includedPatients: Patient[]
  excludedPatients: Patient[]
  loading: boolean
  rightToExplore: boolean | undefined
  requestId?: string
  snapshotId?: string
  cohortId?: string
  canMakeExport?: boolean
  deidentifiedBoolean?: boolean
  isSample: boolean
} & CohortData

const defaultInitialState = {
  // CohortData
  name: '',
  description: '',
  cohort: undefined,
  totalPatients: undefined,
  originalPatients: [],
  totalDocs: 0,
  documentsList: [],
  wordcloudData: [],

  encounters: [],
  genderRepartitionMap: undefined,
  visitTypeRepartitionData: undefined,
  monthlyVisitData: undefined,
  agePyramidData: undefined,
  snapshotId: '',
  requestId: '',
  cohortId: '',
  favorite: false,
  // ExploredCohortState
  isSample: false,
  importedPatients: [],
  includedPatients: [],
  excludedPatients: [],
  loading: false,
  rightToExplore: undefined,
  canMakeExport: false,
  deidentifiedBoolean: undefined
}

const fetchExploredCohort = createAsyncThunk<
  CohortData,
  { context: URLS; id?: string; forceReload?: boolean },
  { state: RootState }
>('exploredCohort/fetchExploredCohort', async ({ context, id, forceReload }, { getState, dispatch }) => {
  const state = getState()
  const stateCohort = state.exploredCohort.cohort

  let shouldRefreshData = true

  switch (context) {
    case URLS.COHORT: {
      shouldRefreshData = !stateCohort || Array.isArray(stateCohort) || stateCohort.id !== id
      break
    }
    case URLS.PERIMETERS: {
      if (!id) {
        throw new Error('No given perimeter ids')
      }
      const perimeterIds = id.split(',')
      const statePerimeterIds =
        stateCohort &&
        Array.isArray(stateCohort) &&
        stateCohort.map((group) => group.id).filter((id) => id !== undefined)

      shouldRefreshData =
        !statePerimeterIds ||
        statePerimeterIds.length !== perimeterIds.length ||
        statePerimeterIds.some((id: string) => !perimeterIds.includes(id))
      break
    }
    case URLS.PATIENTS: {
      shouldRefreshData = stateCohort !== undefined && state.exploredCohort.originalPatients !== undefined
      break
    }

    default:
      break
  }
  const fetchCohortAction = dispatch(fetchExploredCohortInBackground({ context, id }))
  if (shouldRefreshData || forceReload) {
    return await fetchCohortAction.unwrap()
  }
  return state.exploredCohort
})

const fetchExploredCohortInBackground = createAsyncThunk<
  CohortData,
  { context: URLS; id?: string },
  { state: RootState }
>('exploredCohort/fetchExploredCohortInBackground', async ({ context, id }, { getState }) => {
  const state = getState()
  const appConfig = getConfig()

  let cohort
  switch (context) {
    case URLS.COHORT: {
      if (id) {
        cohort = (await services.cohorts.fetchCohort(id)) as ExploredCohortState
        if (cohort) {
          cohort.cohortId = id
          const cohortRights = await services.cohorts.fetchCohortsRights([{ group_id: id }])
          if (cohortRights?.[0].rights) {
            if (
              cohortRights?.[0]?.rights?.read_patient_pseudo === false &&
              cohortRights?.[0]?.rights?.read_patient_nomi === false
            ) {
              throw new Error("You don't have any rights on this cohort")
            } else {
              cohort.canMakeExport = !!appConfig.features.export.enabled
                ? cohortRights?.[0]?.rights?.export_csv_nomi
                : false

              cohort.deidentifiedBoolean = cohortRights?.[0]?.rights?.read_patient_pseudo
                ? cohortRights?.[0]?.rights?.read_patient_nomi
                  ? false
                  : true
                : false
            }
          } else {
            throw new Error("You don't have any rights on this cohort")
          }
        }
      }
      break
    }
    case URLS.PATIENTS: {
      cohort = (await services.patients.fetchMyPatients()) as ExploredCohortState
      const rights = await services.perimeters.getRights({})

      if (cohort && !isCustomError(rights)) {
        cohort.name = '-'
        cohort.description = ''
        cohort.requestId = ''
        cohort.favorite = false
        cohort.uuid = ''
        cohort.cohortId = ''
        cohort.canMakeExport = false
        cohort.deidentifiedBoolean = rights.results.some((right) =>
          right.rights ? servicesPerimeters.getAccessFromRights(right.rights) === 'Pseudonymisé' : true
        )
      }
      break
    }
    case URLS.PERIMETERS: {
      if (id) {
        cohort = (await services.perimeters.fetchPerimetersInfos(id)) as ExploredCohortState
        if (cohort) {
          cohort.name = '-'
          cohort.description = ''
          cohort.requestId = ''
          cohort.favorite = false
          cohort.uuid = ''
          cohort.cohortId = ''
          cohort.canMakeExport = false
          cohort.deidentifiedBoolean =
            cohort.cohort && cohort.cohort && Array.isArray(cohort.cohort)
              ? cohort.cohort.some(
                  (cohort) => getExtension(cohort, 'READ_ACCESS')?.valueString === 'DATA_PSEUDOANONYMISED'
                ) ?? true
              : true
        }
      }
      break
    }

    default:
      break
  }
  return cohort ?? state.exploredCohort
})

const exploredCohortSlice = createSlice({
  name: 'exploredCohort',
  initialState: defaultInitialState as ExploredCohortState,
  reducers: {
    addImportedPatients: (state: ExploredCohortState, action: PayloadAction<Patient[]>) => {
      const importedPatients = [...state.importedPatients, ...action.payload]
      state.importedPatients = importedPatients.filter(
        (patient, index, self) =>
          index === self.findIndex((t) => t.id === patient.id) &&
          !state.originalPatients?.map((p) => p.id).includes(patient.id) &&
          !state.excludedPatients.map((p) => p.id).includes(patient.id)
      )
    },
    removeImportedPatients: (state: ExploredCohortState, action: PayloadAction<Patient[]>) => {
      const listId = action.payload.map((patient) => patient.id)
      state.importedPatients = state.importedPatients.filter((patient) => !listId.includes(patient.id))
    },
    includePatients: (state: ExploredCohortState, action: PayloadAction<Patient[]>) => {
      const includedPatients = [...state.includedPatients, ...action.payload]
      state.importedPatients = state.importedPatients.filter(
        (patient) => !action.payload.map((p) => p.id).includes(patient.id)
      )
      state.includedPatients = includedPatients
    },
    excludePatients: (state: ExploredCohortState, action: PayloadAction<Patient[]>) => {
      const toExcluded = state.originalPatients?.filter((patient) =>
        action.payload.map((p) => p.id).includes(patient.id)
      )
      const toImported = state.includedPatients.filter((patient) =>
        action.payload.map((p) => p.id).includes(patient.id)
      )
      const allExcludedPatients = toExcluded ? [...state.excludedPatients, ...toExcluded] : []
      const allImportedPatients = toImported ? [...state.importedPatients, ...toImported] : []
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
    removeExcludedPatients: (state: ExploredCohortState, action: PayloadAction<Patient[]>) => {
      if (!action || !action.payload) return
      const statePatient = state.originalPatients || []
      const originalPatients = [...statePatient, ...action.payload]
      const excludedPatients = state.excludedPatients.filter(
        (patient) => !action.payload.map((p) => p.id).includes(patient.id)
      )
      state.originalPatients = originalPatients
      state.excludedPatients = excludedPatients
    },
    updateCohort: (state: ExploredCohortState, action: PayloadAction<CohortData>) => {
      return { ...state, ...action.payload }
    }
  },
  extraReducers: (builder) => {
    builder.addCase(login, () => defaultInitialState)
    builder.addCase(logout.fulfilled, () => defaultInitialState)
    builder.addCase(impersonate, () => defaultInitialState)
    builder.addCase(fetchExploredCohort.pending, (state) => ({ ...state, loading: true, rightToExplore: undefined }))
    builder.addCase(fetchExploredCohort.fulfilled, (state, { payload }) => ({
      ...state,
      ...payload,
      loading: false,
      rightToExplore: true
    }))
    builder.addCase(fetchExploredCohort.rejected, () => ({ ...defaultInitialState, rightToExplore: false }))
    builder.addCase(fetchExploredCohortInBackground.pending, (state) => ({
      ...state,
      loading: true,
      rightToExplore: undefined
    }))
    builder.addCase(fetchExploredCohortInBackground.fulfilled, (state, { payload }) => ({
      ...state,
      ...payload,
      loading: false,
      rightToExplore: true
    }))
    builder.addCase(fetchExploredCohortInBackground.rejected, () => ({ ...defaultInitialState, rightToExplore: false }))
  }
})

export default exploredCohortSlice.reducer
export { fetchExploredCohort, fetchExploredCohortInBackground }
export const {
  addImportedPatients,
  excludePatients,
  removeImportedPatients,
  includePatients,
  removeExcludedPatients,
  updateCohort
} = exploredCohortSlice.actions
