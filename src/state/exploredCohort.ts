import { CohortData } from 'types'
import { IGroup_Member } from '@ahryman40k/ts-fhir-types/lib/R4'
import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit'
import { logout, login } from './me'
import { RootState } from 'state'

import { setFavoriteCohortThunk } from './userCohorts'

import services from 'services'

export type ExploredCohortState = {
  importedPatients: any[]
  includedPatients: any[]
  excludedPatients: any[]
  loading: boolean
  requestId?: string
  cohortId?: string
  canMakeExport?: boolean
} & CohortData

const localStorageExploredCohort = localStorage.getItem('exploredCohort') ?? null
const jsonExploredCohort = localStorageExploredCohort ? JSON.parse(localStorageExploredCohort) : {}

const defaultInitialState = {
  // CohortData
  name: '',
  description: '',
  cohort: [],
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
  canMakeExport: false,
  requestId: '',
  cohortId: '',
  favorite: false,
  // ExploredCohortState
  importedPatients: [],
  includedPatients: [],
  excludedPatients: [],
  loading: false
}

const initialState: ExploredCohortState = localStorageExploredCohort
  ? {
      ...jsonExploredCohort,
      genderRepartitionMap: jsonExploredCohort.genderRepartitionMap
        ? jsonExploredCohort.genderRepartitionMap
        : {
            female: { deceased: 0, alive: 0 },
            male: { deceased: 0, alive: 0 },
            other: { deceased: 0, alive: 0 },
            unknown: { deceased: 0, alive: 0 }
          },
      agePyramidData: jsonExploredCohort.agePyramidData ? jsonExploredCohort.agePyramidData : [],
      monthlyVisitData: jsonExploredCohort.monthlyVisitData ? jsonExploredCohort.monthlyVisitData : {}
    }
  : defaultInitialState

const favoriteExploredCohort = createAsyncThunk<CohortData, { id: string }, { state: RootState }>(
  'exploredCohort/favoriteExploredCohort',
  async ({ id }, { getState, dispatch }) => {
    const state = getState()

    const favoriteResult = await dispatch(setFavoriteCohortThunk({ cohortId: id }))

    return {
      ...state.exploredCohort,
      favorite:
        favoriteResult.meta.requestStatus === 'fulfilled'
          ? !state.exploredCohort.favorite
          : state.exploredCohort.favorite
    }
  }
)

const fetchExploredCohort = createAsyncThunk<
  CohortData,
  { context: 'patients' | 'cohort' | 'perimeters' | 'new_cohort'; id?: string; forceReload?: boolean },
  { state: RootState }
>('exploredCohort/fetchExploredCohort', async ({ context, id, forceReload }, { getState, dispatch }) => {
  const state = getState()
  const providerId = state.me?.id
  const stateCohort = state.exploredCohort.cohort

  let shouldRefreshData = true

  switch (context) {
    case 'cohort': {
      shouldRefreshData = !stateCohort || Array.isArray(stateCohort) || stateCohort.id !== id
      break
    }
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
  if (shouldRefreshData || forceReload) {
    switch (context) {
      case 'cohort': {
        if (id) {
          cohort = (await services.cohorts.fetchCohort(id)) as ExploredCohortState
          if (cohort) {
            cohort.cohortId = id
            cohort.canMakeExport = await services.cohorts.fetchCohortExportRight(id, providerId ?? '')
          }
        }
        break
      }
      case 'patients': {
        cohort = (await services.patients.fetchMyPatients()) as ExploredCohortState
        if (cohort) {
          cohort.name = '-'
          cohort.description = ''
          cohort.requestId = ''
          cohort.favorite = false
          cohort.uuid = ''
          cohort.canMakeExport = false
        }
        break
      }
      case 'perimeters': {
        if (id) {
          cohort = (await services.perimeters.fetchPerimetersInfos(id)) as ExploredCohortState
          if (cohort) {
            cohort.name = '-'
            cohort.description = ''
            cohort.requestId = ''
            cohort.favorite = false
            cohort.uuid = ''
            cohort.canMakeExport = false
          }
        }
        break
      }

      default:
        break
    }
  } else {
    dispatch<any>(fetchExploredCohortInBackground({ context, id }))
  }
  return cohort ?? state.exploredCohort
})

const fetchExploredCohortInBackground = createAsyncThunk<
  CohortData,
  { context: 'patients' | 'cohort' | 'perimeters' | 'new_cohort'; id?: string },
  { state: RootState }
>('exploredCohort/fetchExploredCohortInBackground', async ({ context, id }, { getState }) => {
  const state = getState()
  const providerId = state.me?.id

  let cohort
  switch (context) {
    case 'cohort': {
      if (id) {
        cohort = (await services.cohorts.fetchCohort(id)) as ExploredCohortState
        if (cohort) {
          cohort.canMakeExport = await services.cohorts.fetchCohortExportRight(id, providerId ?? '')
        }
      }
      break
    }
    case 'patients': {
      cohort = (await services.patients.fetchMyPatients()) as ExploredCohortState
      if (cohort) {
        cohort.name = '-'
        cohort.description = ''
        cohort.requestId = ''
        cohort.favorite = false
        cohort.uuid = ''
        cohort.canMakeExport = false
      }
      break
    }
    case 'perimeters': {
      if (id) {
        cohort = (await services.perimeters.fetchPerimetersInfos(id)) as ExploredCohortState
        if (cohort) {
          cohort.name = '-'
          cohort.description = ''
          cohort.requestId = ''
          cohort.favorite = false
          cohort.uuid = ''
          cohort.canMakeExport = false
        }
      }
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
    removeExcludedPatients: (state: ExploredCohortState, action: PayloadAction<any[]>) => {
      if (!action || !action.payload) return
      const statePatient = state.originalPatients || []
      const originalPatients = [...statePatient, ...action.payload]
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
    builder.addCase(fetchExploredCohort.pending, (state) => ({ ...state, loading: true }))
    builder.addCase(fetchExploredCohort.fulfilled, (state, { payload }) => ({ ...state, ...payload, loading: false }))
    builder.addCase(fetchExploredCohort.rejected, () => ({ ...defaultInitialState }))
    builder.addCase(fetchExploredCohortInBackground.pending, (state) => ({ ...state, loading: true }))
    builder.addCase(fetchExploredCohortInBackground.fulfilled, (state, { payload }) => ({
      ...state,
      ...payload,
      loading: false
    }))
    builder.addCase(fetchExploredCohortInBackground.rejected, () => ({ ...defaultInitialState }))
    builder.addCase(favoriteExploredCohort.pending, (state) => ({ ...state }))
    builder.addCase(favoriteExploredCohort.fulfilled, (state, { payload }) => ({
      ...state,
      ...payload
    }))
    builder.addCase(favoriteExploredCohort.rejected, () => ({ ...defaultInitialState }))
  }
})

export default exploredCohortSlice.reducer
export { fetchExploredCohort, favoriteExploredCohort, fetchExploredCohortInBackground }
export const {
  addImportedPatients,
  excludePatients,
  setExploredCohort,
  removeImportedPatients,
  includePatients,
  removeExcludedPatients,
  updateCohort
} = exploredCohortSlice.actions
