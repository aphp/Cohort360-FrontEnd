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
  nextCriteriaId: number
  nextGroupId: number
}

const initialState: CohortCreationState = {
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
  nextCriteriaId: 1,
  nextGroupId: -1
}

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
      let { requestId, snapshotsHistory, currentSnapshot } = state.cohortCreation.request

      let _requestId = requestId ? requestId : ''

      if (!snapshotsHistory || (snapshotsHistory && snapshotsHistory.length === 0)) {
        // Create request + first snapshot
        const _request = await createRequest()
        _requestId = _request ? _request.uuid : null
        if (_requestId) {
          requestId = _requestId

          const newSnapshot = await createSnapshot(_requestId, newJson, true)
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
            index === snapshotsHistory.length - 1 ? snapshotsHistory : snapshotsHistory.splice(0, index + 1)

          currentSnapshot = uuid
          snapshotsHistory = [..._snapshotsHistory, { uuid, json, date }]
        }
      }

      dispatch(
        countCohortCreation({
          json: newJson,
          snapshotId: currentSnapshot,
          requestId
        })
      )

      return {
        requestId: _requestId,
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
      const _criteriaGroup = state.cohortCreation.request.criteriaGroup

      const json = await buildRequest(_selectedPopulation, _selectedCriteria, _criteriaGroup)

      dispatch(saveJson({ newJson: json }))

      return {
        json,
        selectedPopulation: _selectedPopulation
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
  async ({ newCurrentSnapshot }) => {
    try {
      const { population, criteria, criteriaGroup } = await unbuildRequest(newCurrentSnapshot.json)

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
      if (index !== -1) state.selectedCriteria[index] = action.payload
    },
    editCriteriaGroup: (state: CohortCreationState, action: PayloadAction<CriteriaGroupType>) => {
      const foundItem = state.criteriaGroup.find(({ id }) => id === action.payload.id)
      const index = foundItem ? state.criteriaGroup.indexOf(foundItem) : -1
      if (index !== -1) state.criteriaGroup[index] = action.payload
    }
  },
  extraReducers: (builder) => {
    builder.addCase(logout, () => initialState)
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
      countLoading: false
    }))
    builder.addCase(countCohortCreation.rejected, (state) => ({
      ...state,
      count: { status: 'error' },
      countLoading: false
    }))
  }
})

export default cohortCreationSlice.reducer
export { buildCohortCreation, unbuildCohortCreation, saveJson, countCohortCreation }
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
