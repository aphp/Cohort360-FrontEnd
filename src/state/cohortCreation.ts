import { logout } from './me'
import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit'
import { RootState } from 'state'
import {
  CohortCreationCounterType,
  CohortCreationSnapshotType,
  ScopeTreeRow,
  SelectedCriteriaType,
  CriteriaGroupType
} from 'types'

import { buildRequest, unbuildRequest } from 'utils/cohortCreation'

import { createRequest, createSnapshot, countCohort } from 'services/cohortCreation'

export type CohortCreationState = {
  loading: boolean
  requestId: string
  cohortName: string
  json: string
  currentSnapshot: string
  snapshotsHistory: CohortCreationSnapshotType[]
  count: CohortCreationCounterType
  selectedPopulation: ScopeTreeRow[] | null
  selectedCriteria: SelectedCriteriaType[]
  criteriaGroup: CriteriaGroupType[]
  nextCriteriaId: number
  nextGroupId: number
}

const initialState: CohortCreationState = {
  loading: false,
  requestId: '',
  cohortName: '',
  json: '',
  currentSnapshot: '',
  snapshotsHistory: [],
  count: {},
  selectedPopulation: null,
  selectedCriteria: [],
  criteriaGroup: [],
  nextCriteriaId: 1,
  nextGroupId: -1
}

/**
 * Set all data to 'loading' to display a loader, save-it.
 * Just after, get new count and save it
 */
const _countCohort = async (_json: string, _snapshotId: string, _requestId: string) => {
  if (!_json || !_snapshotId || !_requestId) return {}

  const countResult = await countCohort(_json, _snapshotId, _requestId)
  if (!countResult) return {}
  return {
    uuid: countResult?.uuid,
    includePatient: countResult?.count
  }
}

const _onSaveNewJson = async (cohortCreation: CohortCreationState, newJson: string) => {
  let { requestId, snapshotsHistory, currentSnapshot } = cohortCreation

  let _requestId = requestId ? requestId : null
  let uuid = ''

  if (!snapshotsHistory || (snapshotsHistory && snapshotsHistory.length === 0)) {
    // Create request + first snapshot
    const _request = await createRequest()
    _requestId = _request ? _request.uuid : null
    if (_requestId) {
      requestId = _requestId

      const newSnapshot = await createSnapshot(_requestId, newJson, true)
      if (newSnapshot) {
        uuid = newSnapshot.uuid
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

      uuid = newSnapshot.uuid
      const json = newSnapshot.serialized_query
      const date = newSnapshot.created_at

      const _snapshotsHistory =
        index === snapshotsHistory.length - 1 ? snapshotsHistory : snapshotsHistory.splice(0, index + 1)

      currentSnapshot = uuid
      snapshotsHistory = [..._snapshotsHistory, { uuid, json, date }]
    }
  }
  const count = await _countCohort(newJson, currentSnapshot, requestId)
  return { count, requestId, snapshotsHistory, currentSnapshot }
}

const buildCreationCohort = createAsyncThunk<
  CohortCreationState,
  {
    selectedPopulation?: ScopeTreeRow[] | null
  },
  { state: RootState }
>('cohortCreation/build', async ({ selectedPopulation }, { getState }) => {
  try {
    const state = getState()

    const _selectedPopulation = selectedPopulation
      ? selectedPopulation
      : state.cohortCreation.request.selectedPopulation
    const _selectedCriteria = state.cohortCreation.request.selectedCriteria
    const _criteriaGroup = state.cohortCreation.request.criteriaGroup

    const json = buildRequest(_selectedPopulation, _selectedCriteria, _criteriaGroup)
    const { requestId, snapshotsHistory, currentSnapshot, count } = await _onSaveNewJson(
      state.cohortCreation.request,
      json
    )

    return {
      ...state.cohortCreation.request,
      requestId,
      snapshotsHistory,
      currentSnapshot,
      json,
      count,
      selectedPopulation: _selectedPopulation,
      selectedCriteria: _selectedCriteria
    }
  } catch (error) {
    console.error(error)
    throw error
  }
})

const unbuildCreationCohort = createAsyncThunk<
  CohortCreationState,
  { newCurrentSnapshot: CohortCreationSnapshotType },
  { state: RootState }
>('cohortCreation/unbuild', async ({ newCurrentSnapshot }, { getState }) => {
  try {
    const state = getState()

    const { population, criteria, criteriaGroup } = await unbuildRequest(newCurrentSnapshot.json)
    const count = await _countCohort(
      newCurrentSnapshot.json,
      newCurrentSnapshot.uuid,
      state.cohortCreation.request.requestId
    )

    return {
      ...state.cohortCreation.request,
      count,
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
})

const cohortCreationSlice = createSlice({
  name: 'cohortCreation',
  initialState,
  reducers: {
    resetCohortCreation: () => initialState,
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
      action.payload.isInclusive = true
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
      if (index !== -1) state.selectedCriteria[index] = { ...foundItem, ...action.payload }
    },
    editCriteriaGroup: (state: CohortCreationState, action: PayloadAction<CriteriaGroupType>) => {
      const foundItem = state.criteriaGroup.find(({ id }) => id === action.payload.id)
      const index = foundItem ? state.criteriaGroup.indexOf(foundItem) : -1
      if (index !== -1) state.criteriaGroup[index] = action.payload
    }
  },
  extraReducers: (builder) => {
    builder.addCase(logout, () => initialState)
    // buildCreationCohort
    builder.addCase(buildCreationCohort.pending, (state) => {
      state.loading = true
    })
    builder.addCase(buildCreationCohort.fulfilled, (state, { payload }) => ({ ...state, ...payload, loading: false }))
    builder.addCase(buildCreationCohort.rejected, (state) => ({ ...state, loading: false }))
    // unbuildCreationCohort
    builder.addCase(unbuildCreationCohort.pending, (state) => ({ ...state, loading: true }))
    builder.addCase(unbuildCreationCohort.fulfilled, (state, { payload }) => ({ ...state, ...payload, loading: false }))
    builder.addCase(unbuildCreationCohort.rejected, (state) => ({ ...state, loading: false }))
  }
})

export default cohortCreationSlice.reducer
export { buildCreationCohort, unbuildCreationCohort }
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
  editCriteriaGroup
} = cohortCreationSlice.actions
