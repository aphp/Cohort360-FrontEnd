import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit'
import { RootState } from 'state'
import {
  CohortCreationCounterType,
  CohortCreationSnapshotType,
  ScopeTreeRow,
  SelectedCriteriaType,
  CriteriaGroupType,
  TemporalConstraintsType
} from 'types'

import { buildRequest, unbuildRequest } from 'utils/cohortCreation'

import { logout, login } from './me'
import { addRequest, deleteRequest } from './request'

import { createSnapshot, countCohort, fetchRequest } from 'services/cohortCreation'

const localStorageCohortCreation = localStorage.getItem('cohortCreation') ?? null
const jsonCohortCreation = localStorageCohortCreation ? JSON.parse(localStorageCohortCreation).request : {}

export type CohortCreationState = {
  loading: boolean
  saveLoading: boolean
  countLoading: boolean
  requestId: string
  cohortName: string
  json: string
  currentSnapshot: string
  snapshotsHistory: CohortCreationSnapshotType[]
  count: CohortCreationCounterType
  selectedPopulation: ScopeTreeRow[] | null
  selectedCriteria: SelectedCriteriaType[]
  criteriaGroup: CriteriaGroupType[]
  temporalConstraints: TemporalConstraintsType[]
  nextCriteriaId: number
  nextGroupId: number
  projectName?: string
  requestName?: string
}

const defaultInitialState: CohortCreationState = {
  loading: false,
  saveLoading: false,
  countLoading: false,
  requestId: '',
  cohortName: '',
  json: '',
  currentSnapshot: '',
  snapshotsHistory: [],
  count: {},
  selectedPopulation: null,
  selectedCriteria: [],
  criteriaGroup: [
    {
      id: 0,
      title: `Opérateur logique principal`,
      type: 'andGroup',
      criteriaIds: [],
      isSubGroup: false,
      isInclusive: true
    }
  ],
  temporalConstraints: [
    {
      idList: ['All'],
      constraintType: 'none'
    }
  ],
  nextCriteriaId: 1,
  nextGroupId: -1
}

const initialState: CohortCreationState = localStorageCohortCreation ? jsonCohortCreation : defaultInitialState

/**
 * fetchRequestCohortCreation
 *
 */
type FetchRequestCohortCreationParams = {
  requestId: string
  snapshotId?: string
}
type FetchRequestCohortCreationReturn = {
  requestId?: string
  snapshotsHistory?: any[]
  currentSnapshot?: string
  json?: string
}

const fetchRequestCohortCreation = createAsyncThunk<
  FetchRequestCohortCreationReturn,
  FetchRequestCohortCreationParams,
  { state: RootState }
>('cohortCreation/fetchRequest', async ({ requestId, snapshotId }, { dispatch }) => {
  try {
    if (!requestId) return {}
    const requestResult = await fetchRequest(requestId, snapshotId)
    if (!requestResult) return {}

    const { json, currentSnapshot, snapshotsHistory } = requestResult

    dispatch<any>(unbuildCohortCreation({ newCurrentSnapshot: snapshotsHistory[0] as CohortCreationSnapshotType }))

    return {
      json,
      requestId,
      snapshotsHistory: snapshotsHistory.reverse(),
      currentSnapshot
    }
  } catch (error) {
    console.error(error)
    throw error
  }
})

/**
 * countCohortCreation
 *
 */
type CountCohortCreationParams = {
  json?: string
  snapshotId?: string
  requestId?: string
  uuid?: string
}

const countCohortCreation = createAsyncThunk<
  { count?: CohortCreationCounterType },
  CountCohortCreationParams,
  { state: RootState }
>('cohortCreation/count', async ({ json, snapshotId, requestId, uuid }) => {
  try {
    const countResult = await countCohort(json, snapshotId, requestId, uuid)
    if (!countResult) return {}

    return { count: countResult }
  } catch (error) {
    console.error(error)
    throw error
  }
})

/**
 * saveJson
 *
 *
 */
type SaveJsonReturn = {
  requestId: string
  snapshotsHistory: any[]
  currentSnapshot: string
}
type SaveJsonParams = { newJson: string }

const saveJson = createAsyncThunk<SaveJsonReturn, SaveJsonParams, { state: RootState }>(
  'cohortCreation/saveJson',
  async ({ newJson }, { getState, dispatch }) => {
    try {
      const state = getState()
      const { requestId } = state.cohortCreation.request
      let { snapshotsHistory, currentSnapshot } = state.cohortCreation.request

      if (!snapshotsHistory || (snapshotsHistory && snapshotsHistory.length === 0)) {
        if (requestId) {
          const newSnapshot = await createSnapshot(requestId, newJson, true)
          if (newSnapshot) {
            const uuid = newSnapshot.uuid
            const json = newSnapshot.serialized_query
            const date = newSnapshot.created_at

            currentSnapshot = uuid
            snapshotsHistory = [{ uuid, json, date }]
          }
        }
      } else if (currentSnapshot) {
        // Update snapshots list
        const newSnapshot = await createSnapshot(currentSnapshot, newJson, false)
        if (newSnapshot) {
          const foundItem = snapshotsHistory.find(
            (snapshotsHistory: CohortCreationSnapshotType) => snapshotsHistory.uuid === currentSnapshot
          )
          const index = foundItem ? snapshotsHistory.indexOf(foundItem) : -1

          const uuid = newSnapshot.uuid
          const json = newSnapshot.serialized_query
          const date = newSnapshot.created_at

          const _snapshotsHistory =
            index === snapshotsHistory.length - 1 ? snapshotsHistory : [...snapshotsHistory].splice(0, index + 1)

          currentSnapshot = uuid
          snapshotsHistory = [..._snapshotsHistory, { uuid, json, date }]
        }
      }

      dispatch<any>(
        countCohortCreation({
          json: newJson,
          snapshotId: currentSnapshot,
          requestId
        })
      )

      return {
        requestId,
        snapshotsHistory,
        currentSnapshot
      }
    } catch (error) {
      console.error(error)
      throw error
    }
  }
)

/**
 * buildCohortCreation()
 *
 *
 */
type BuildCohortReturn = {
  json: string
  selectedPopulation: ScopeTreeRow[] | null
}
type BuildCohortParams = {
  selectedPopulation?: ScopeTreeRow[] | null
}
const buildCohortCreation = createAsyncThunk<BuildCohortReturn, BuildCohortParams, { state: RootState }>(
  'cohortCreation/build',
  async ({ selectedPopulation }, { getState, dispatch }) => {
    try {
      const state = getState()

      const _selectedPopulation = selectedPopulation
        ? selectedPopulation
        : state.cohortCreation.request.selectedPopulation
      const _selectedCriteria = state.cohortCreation.request.selectedCriteria
      const _criteriaGroup: CriteriaGroupType[] =
        state.cohortCreation.request.criteriaGroup && state.cohortCreation.request.criteriaGroup.length > 0
          ? state.cohortCreation.request.criteriaGroup
          : defaultInitialState.criteriaGroup
      const _temporalConstraints =
        state.cohortCreation.request.temporalConstraints ?? defaultInitialState.temporalConstraints

      const json = await buildRequest(_selectedPopulation, _selectedCriteria, _criteriaGroup, _temporalConstraints)

      if (json !== state?.cohortCreation?.request?.json) {
        dispatch<any>(saveJson({ newJson: json }))
      }

      return {
        json,
        selectedPopulation: _selectedPopulation,
        criteriaGroup: _criteriaGroup
      }
    } catch (error) {
      console.error(error)
      throw error
    }
  }
)

/** unbuildCohortCreation
 *
 *
 */
type UnbuildCohortReturn = {
  json: string
  currentSnapshot: string
  selectedPopulation: ScopeTreeRow[] | null
  selectedCriteria: SelectedCriteriaType[]
  criteriaGroup: CriteriaGroupType[]
}
type UnbuildParams = { newCurrentSnapshot: CohortCreationSnapshotType }

const unbuildCohortCreation = createAsyncThunk<UnbuildCohortReturn, UnbuildParams, { state: RootState }>(
  'cohortCreation/unbuild',
  async ({ newCurrentSnapshot }, { getState, dispatch }) => {
    try {
      const state = getState()
      const { population, criteria, criteriaGroup } = await unbuildRequest(newCurrentSnapshot.json)

      dispatch<any>(
        countCohortCreation({
          json: newCurrentSnapshot.json,
          snapshotId: newCurrentSnapshot.uuid,
          requestId: state.cohortCreation.request.requestId
        })
      )

      return {
        json: newCurrentSnapshot.json,
        currentSnapshot: newCurrentSnapshot.uuid,
        selectedPopulation: population,
        selectedCriteria: criteria,
        criteriaGroup: criteriaGroup
      }
    } catch (error) {
      console.error(error)
      throw error
    }
  }
)

const cohortCreationSlice = createSlice({
  name: 'cohortCreation',
  initialState,
  reducers: {
    resetCohortCreation: () => defaultInitialState,
    setCohortName: (state: CohortCreationState, action: PayloadAction<string>) => {
      state.cohortName = action.payload
    },
    //
    setPopulationSource: (state: CohortCreationState, action: PayloadAction<ScopeTreeRow[] | null>) => {
      state.selectedPopulation = action.payload
    },
    setSelectedCriteria: (state: CohortCreationState, action: PayloadAction<SelectedCriteriaType[]>) => {
      state.selectedCriteria = action.payload
    },
    //
    deleteSelectedCriteria: (state: CohortCreationState, action: PayloadAction<number>) => {
      const criteriaId = action.payload
      state.selectedCriteria = state.selectedCriteria.filter(({ id }) => id !== criteriaId)
    },
    deleteCriteriaGroup: (state: CohortCreationState, action: PayloadAction<number>) => {
      const groupId = action.payload
      state.criteriaGroup = state.criteriaGroup.filter(({ id }) => id !== groupId)
    },
    //
    addNewSelectedCriteria: (state: CohortCreationState, action: PayloadAction<SelectedCriteriaType>) => {
      state.selectedCriteria = [...state.selectedCriteria, action.payload]
      state.nextCriteriaId++
    },
    addNewCriteriaGroup: (state: CohortCreationState, action: PayloadAction<CriteriaGroupType>) => {
      state.criteriaGroup = [...state.criteriaGroup, action.payload]
      state.nextGroupId--
    },
    //
    editSelectedCriteria: (state: CohortCreationState, action: PayloadAction<SelectedCriteriaType>) => {
      const foundItem = state.selectedCriteria.find(({ id }) => id === action.payload.id)
      const index = foundItem ? state.selectedCriteria.indexOf(foundItem) : -1
      if (index !== -1) state.selectedCriteria[index] = action.payload
    },
    editCriteriaGroup: (state: CohortCreationState, action: PayloadAction<CriteriaGroupType>) => {
      const foundItem = state.criteriaGroup.find(({ id }) => id === action.payload.id)
      const index = foundItem ? state.criteriaGroup.indexOf(foundItem) : -1
      if (index !== -1) state.criteriaGroup[index] = action.payload
    },
    updateTemporalConstraint: (state: CohortCreationState, action: PayloadAction<TemporalConstraintsType>) => {
      const foundItem = state.temporalConstraints.find(({ idList }) => {
        const equals = (a: any[], b: any[]) => a.length === b.length && a.every((v, i) => v === b[i])
        return equals(idList, action.payload.idList)
      })
      const index = foundItem ? state.temporalConstraints.indexOf(foundItem) : -1
      if (index !== -1) state.temporalConstraints[index] = action.payload
    }
  },
  extraReducers: (builder) => {
    builder.addCase(login, () => defaultInitialState)
    builder.addCase(logout, () => defaultInitialState)
    // buildCohortCreation
    builder.addCase(buildCohortCreation.pending, (state) => ({ ...state, loading: true }))
    builder.addCase(buildCohortCreation.fulfilled, (state, { payload }) => ({ ...state, ...payload, loading: false }))
    builder.addCase(buildCohortCreation.rejected, (state) => ({ ...state, loading: false }))
    // unbuildCohortCreation
    builder.addCase(unbuildCohortCreation.pending, (state) => ({ ...state, loading: true }))
    builder.addCase(unbuildCohortCreation.fulfilled, (state, { payload }) => ({ ...state, ...payload, loading: false }))
    builder.addCase(unbuildCohortCreation.rejected, (state) => ({ ...state, loading: false }))
    // saveJson
    builder.addCase(saveJson.pending, (state) => ({ ...state, saveLoading: true }))
    builder.addCase(saveJson.fulfilled, (state, { payload }) => ({ ...state, ...payload, saveLoading: false }))
    builder.addCase(saveJson.rejected, (state) => ({ ...state, saveLoading: false }))
    // countCohortCreation
    builder.addCase(countCohortCreation.pending, (state) => ({ ...state, countLoading: true }))
    builder.addCase(countCohortCreation.fulfilled, (state, { payload }) => ({
      ...state,
      ...payload,
      countLoading: payload?.count?.status === 'pending' || payload?.count?.status === 'started' ? true : false
    }))
    builder.addCase(countCohortCreation.rejected, (state) => ({
      ...state,
      count: { status: 'error' },
      countLoading: false
    }))
    // fetchRequestCohortCreation
    builder.addCase(fetchRequestCohortCreation.pending, (state) => ({ ...state, loading: true }))
    builder.addCase(fetchRequestCohortCreation.fulfilled, (state, { payload }) => ({
      ...state,
      ...payload,
      loading: false
    }))
    builder.addCase(fetchRequestCohortCreation.rejected, (state) => ({ ...state, loading: false }))
    // Create new request
    builder.addCase(addRequest.fulfilled, (state, { payload }) => {
      const newRequestId = payload.requestsList ? payload.requestsList[payload.requestsList.length - 1].uuid : ''
      return { ...state, requestId: newRequestId, loading: false }
    })
    // When you delete a request => reset cohort create (if current request is edited state)
    builder.addCase(deleteRequest.fulfilled, () => defaultInitialState)
  }
})

export default cohortCreationSlice.reducer
export { buildCohortCreation, unbuildCohortCreation, saveJson, countCohortCreation, fetchRequestCohortCreation }
export const {
  resetCohortCreation,
  //
  setCohortName,
  setPopulationSource,
  setSelectedCriteria,
  //
  deleteSelectedCriteria,
  deleteCriteriaGroup,
  //
  addNewSelectedCriteria,
  addNewCriteriaGroup,
  //
  editSelectedCriteria,
  editCriteriaGroup,
  //
  updateTemporalConstraint
} = cohortCreationSlice.actions
