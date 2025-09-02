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

/**
 * State interface for explored cohort management.
 * Extends CohortData with additional exploration-specific properties.
 */
export type ExploredCohortState = {
  /** Patients imported for exploration */
  importedPatients: Patient[]
  /** Patients included in the exploration */
  includedPatients: Patient[]
  /** Patients excluded from the exploration */
  excludedPatients: Patient[]
  /** Loading state indicator */
  loading: boolean
  /** Whether user has rights to explore this cohort */
  rightToExplore: boolean | undefined
  /** Request identifier */
  requestId?: string
  /** Snapshot identifier */
  snapshotId?: string
  /** Cohort identifier */
  cohortId?: string
  /** Whether user can export data */
  canMakeExport?: boolean
  /** Whether data is deidentified */
  deidentifiedBoolean?: boolean
  /** Whether this is a sample dataset */
  isSample: boolean
} & CohortData

/**
 * Default initial state for explored cohort
 */
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

/**
 * Fetches explored cohort data based on context (cohort, perimeters, or patients).
 * Implements caching logic to avoid unnecessary API calls.
 *
 * @param context - The exploration context (COHORT, PERIMETERS, or PATIENTS)
 * @param id - Optional identifier for the cohort or perimeter
 * @param forceReload - Force reload even if data exists
 * @returns Promise resolving to CohortData
 */
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

/**
 * Fetches explored cohort data in background without caching logic.
 * Always performs the API call regardless of current state.
 *
 * @param context - The exploration context (COHORT, PERIMETERS, or PATIENTS)
 * @param id - Optional identifier for the cohort or perimeter
 * @returns Promise resolving to CohortData
 */
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
                ? cohortRights?.[0]?.rights?.export_csv_xlsx_nomi
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

/**
 * Redux slice for explored cohort state management
 */
const exploredCohortSlice = createSlice({
  name: 'exploredCohort',
  initialState: defaultInitialState as ExploredCohortState,
  reducers: {
    /**
     * Adds patients to the imported patients list.
     * Filters out duplicates and patients already in original or excluded lists.
     *
     * @param state - Current state
     * @param action - Action containing Patient array to add
     */
    addImportedPatients: (state: ExploredCohortState, action: PayloadAction<Patient[]>) => {
      const importedPatients = [...state.importedPatients, ...action.payload]
      state.importedPatients = importedPatients.filter(
        (patient, index, self) =>
          index === self.findIndex((t) => t.id === patient.id) &&
          !state.originalPatients?.map((p) => p.id).includes(patient.id) &&
          !state.excludedPatients.map((p) => p.id).includes(patient.id)
      )
    },
    /**
     * Removes patients from the imported patients list.
     *
     * @param state - Current state
     * @param action - Action containing Patient array to remove
     */
    removeImportedPatients: (state: ExploredCohortState, action: PayloadAction<Patient[]>) => {
      const listId = action.payload.map((patient) => patient.id)
      state.importedPatients = state.importedPatients.filter((patient) => !listId.includes(patient.id))
    },
    /**
     * Moves patients from imported to included list.
     *
     * @param state - Current state
     * @param action - Action containing Patient array to include
     */
    includePatients: (state: ExploredCohortState, action: PayloadAction<Patient[]>) => {
      const includedPatients = [...state.includedPatients, ...action.payload]
      state.importedPatients = state.importedPatients.filter(
        (patient) => !action.payload.map((p) => p.id).includes(patient.id)
      )
      state.includedPatients = includedPatients
    },
    /**
     * Excludes patients from the cohort.
     * Moves patients from original/included lists to excluded list.
     * Some patients may be moved back to imported list.
     *
     * @param state - Current state
     * @param action - Action containing Patient array to exclude
     */
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
    /**
     * Removes patients from excluded list and moves them back to original patients.
     *
     * @param state - Current state
     * @param action - Action containing Patient array to remove from excluded
     */
    removeExcludedPatients: (state: ExploredCohortState, action: PayloadAction<Patient[]>) => {
      if (!action?.payload) return
      const statePatient = state.originalPatients || []
      const originalPatients = [...statePatient, ...action.payload]
      const excludedPatients = state.excludedPatients.filter(
        (patient) => !action.payload.map((p) => p.id).includes(patient.id)
      )
      state.originalPatients = originalPatients
      state.excludedPatients = excludedPatients
    },
    /**
     * Updates the cohort data with new information.
     *
     * @param state - Current state
     * @param action - Action containing CohortData to merge
     */
    updateCohort: (state: ExploredCohortState, action: PayloadAction<CohortData>) => {
      return { ...state, ...action.payload }
    },
    resetState: () => defaultInitialState
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

/** Default export: the explored cohort reducer */
export default exploredCohortSlice.reducer

/** Async thunk actions for fetching cohort data */
export { fetchExploredCohort, fetchExploredCohortInBackground }

/** Action creators for cohort exploration operations */
export const {
  addImportedPatients,
  excludePatients,
  removeImportedPatients,
  includePatients,
  removeExcludedPatients,
  updateCohort,
  resetState
} = exploredCohortSlice.actions
