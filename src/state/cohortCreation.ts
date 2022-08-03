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

import { buildRequest, unbuildRequest, joinRequest } from 'utils/cohortCreation'

import { logout, login } from './me'
import { addRequest, deleteRequest } from './request'
import { deleteProject } from './project'

import services from 'services'

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
  selectedPopulation: (ScopeTreeRow | undefined)[] | null
  allowSearchIpp: boolean
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
  allowSearchIpp: false,
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

/**
 * fetchRequestCohortCreation
 *
 */
type FetchRequestCohortCreationParams = {
  requestId: string
  snapshotId?: string
}
type FetchRequestCohortCreationReturn = {
  requestName?: string
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
    const requestResult = await services.cohortCreation.fetchRequest(requestId, snapshotId)
    if (!requestResult) return {}

    const { requestName, json, currentSnapshot, snapshotsHistory, count } = requestResult

    dispatch<any>(
      unbuildCohortCreation({
        newCurrentSnapshot: snapshotsHistory[
          snapshotsHistory.length ? snapshotsHistory.length - 1 : 0
        ] as CohortCreationSnapshotType
      })
    )

    return {
      requestName,
      json,
      requestId,
      snapshotsHistory,
      currentSnapshot,
      count
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
  { count?: CohortCreationCounterType; snapshotsHistory?: CohortCreationSnapshotType[] },
  CountCohortCreationParams,
  { state: RootState }
>('cohortCreation/count', async ({ json, snapshotId, requestId, uuid }, { getState }) => {
  try {
    const state = getState()
    const { snapshotsHistory } = state.cohortCreation.request
    const newSnapshotsHistory = [...snapshotsHistory].map((item) => ({ ...item }))

    const countResult = await services.cohortCreation.countCohort(json, snapshotId, requestId, uuid)
    if (!countResult) return {}

    if (!uuid) {
      const currentSnapshot = newSnapshotsHistory.find(({ uuid }) => uuid === snapshotId)
      if (!currentSnapshot) {
        return { count: countResult, snapshotsHistory }
      }
      const index = newSnapshotsHistory.indexOf(currentSnapshot)
      if (newSnapshotsHistory[index].dated_measures === undefined) {
        newSnapshotsHistory[index].dated_measures = []
      }
      // @ts-ignore
      newSnapshotsHistory[index].dated_measures = [...newSnapshotsHistory[index].dated_measures, countResult]
    }

    return { count: countResult, snapshotsHistory: newSnapshotsHistory }
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
  snapshotsHistory: CohortCreationSnapshotType[]
  currentSnapshot: string
}
type SaveJsonParams = { newJson: string }

const saveJson = createAsyncThunk<SaveJsonReturn, SaveJsonParams, { state: RootState }>(
  'cohortCreation/saveJson',
  async ({ newJson }, { getState }) => {
    try {
      const state = getState()
      const { requestId } = state.cohortCreation.request
      let { snapshotsHistory, currentSnapshot } = state.cohortCreation.request

      if (!snapshotsHistory || (snapshotsHistory && snapshotsHistory.length === 0)) {
        if (requestId) {
          const newSnapshot: any = await services.cohortCreation.createSnapshot(requestId, newJson, true)
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
        const newSnapshot: any = await services.cohortCreation.createSnapshot(currentSnapshot, newJson, false)
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
  selectedPopulation: (ScopeTreeRow | undefined)[] | null
}
type BuildCohortParams = {
  selectedPopulation?: ScopeTreeRow[] | null
  allowSearchIpp?: boolean
}
const buildCohortCreation = createAsyncThunk<BuildCohortReturn, BuildCohortParams, { state: RootState }>(
  'cohortCreation/build',
  async ({ selectedPopulation }, { getState, dispatch }) => {
    try {
      const state: any = getState()

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
        const saveJsonResponse = await dispatch<any>(saveJson({ newJson: json }))

        await dispatch<any>(
          countCohortCreation({
            json: json,
            snapshotId: saveJsonResponse.payload.currentSnapshot,
            requestId: saveJsonResponse.payload.requestId
          })
        )
      }

      let allowSearchIpp = false
      if (_selectedPopulation) {
        allowSearchIpp = await services.perimeters.allowSearchIpp(_selectedPopulation as ScopeTreeRow[])
      }

      return {
        json,
        selectedPopulation: _selectedPopulation,
        allowSearchIpp: allowSearchIpp
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
  selectedPopulation: (ScopeTreeRow | undefined)[] | null
  selectedCriteria: SelectedCriteriaType[]
  criteriaGroup: CriteriaGroupType[]
  nextCriteriaId: number
  nextGroupId: number
}
type UnbuildParams = { newCurrentSnapshot: CohortCreationSnapshotType }

const unbuildCohortCreation = createAsyncThunk<UnbuildCohortReturn, UnbuildParams, { state: RootState }>(
  'cohortCreation/unbuild',
  async ({ newCurrentSnapshot }, { getState, dispatch }) => {
    try {
      const state = getState()
      const { population, criteria, criteriaGroup } = await unbuildRequest(newCurrentSnapshot?.json)

      let allowSearchIpp = false
      if (population) {
        allowSearchIpp = await services.perimeters.allowSearchIpp(population as ScopeTreeRow[])
      }

      const dated_measures = newCurrentSnapshot.dated_measures ? newCurrentSnapshot.dated_measures[0] : null
      const countId = dated_measures ? dated_measures.uuid : null

      if (countId) {
        dispatch<any>(
          countCohortCreation({
            uuid: countId
          })
        )
      } else {
        dispatch<any>(
          countCohortCreation({
            json: newCurrentSnapshot.json,
            snapshotId: newCurrentSnapshot.uuid,
            requestId: state.cohortCreation.request.requestId
          })
        )
      }

      return {
        json: newCurrentSnapshot.json,
        currentSnapshot: newCurrentSnapshot.uuid,
        selectedPopulation: population,
        allowSearchIpp: allowSearchIpp,
        selectedCriteria: criteria,
        criteriaGroup: criteriaGroup,
        nextCriteriaId: criteria.length + 1,
        nextGroupId: -(criteriaGroup.length + 1)
      }
    } catch (error) {
      console.error(error)
      throw error
    }
  }
)

/** addRequestToCohortCreation
 *
 *
 */
type AddRequestToCohortReturn = {
  json: string
  selectedCriteria: SelectedCriteriaType[]
  criteriaGroup: CriteriaGroupType[]
  nextCriteriaId: number
  nextGroupId: number
}
type AddRequestToCohortParams = { selectedRequestId: string; parentId: number | null }

const addRequestToCohortCreation = createAsyncThunk<
  AddRequestToCohortReturn,
  AddRequestToCohortParams,
  { state: RootState }
>('cohortCreation/addRequestToCohort', async ({ selectedRequestId, parentId }, { getState, dispatch }) => {
  try {
    const state = getState()
    const newRequestResult = await services.cohortCreation.fetchRequest(selectedRequestId)

    const { json, criteria, criteriaGroup } = await joinRequest(
      state?.cohortCreation?.request?.json,
      newRequestResult.json,
      parentId
    )

    const saveJsonResponse = await dispatch<any>(saveJson({ newJson: json }))
    await dispatch<any>(
      countCohortCreation({
        json: json,
        snapshotId: saveJsonResponse.payload.currentSnapshot,
        requestId: saveJsonResponse.payload.requestId
      })
    )

    return {
      json: json,
      selectedCriteria: criteria,
      criteriaGroup: criteriaGroup,
      nextCriteriaId: criteria.length + 1,
      nextGroupId: -(criteriaGroup.length + 1)
    }
  } catch (error) {
    console.error(error)
    throw error
  }
})

const cohortCreationSlice = createSlice({
  name: 'cohortCreation',
  initialState: defaultInitialState,
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
      const criteriaGroupSaved = [...state.criteriaGroup]
      // Reset Group criteriaIds
      state.criteriaGroup = state.criteriaGroup.map((item) => ({ ...item, criteriaIds: [] }))
      state.selectedCriteria = state.selectedCriteria
        .filter(({ id }) => id !== criteriaId)
        .map((selectedCriteria, index) => {
          // Get the parent of current critria
          const parentGroup = criteriaGroupSaved.find((criteriaGroup) =>
            criteriaGroup.criteriaIds.find((criteriaId) => criteriaId === selectedCriteria.id)
          )
          if (parentGroup) {
            const indexOfParent = criteriaGroupSaved.indexOf(parentGroup)
            // Assign the new criterion identifier to its group
            if (indexOfParent !== -1) {
              state.criteriaGroup[indexOfParent] = {
                ...state.criteriaGroup[indexOfParent],
                criteriaIds: [...state.criteriaGroup[indexOfParent].criteriaIds, index + 1]
              }
            }
          }
          return { ...selectedCriteria, id: index + 1 }
        })
      // Re-assign groups
      state.criteriaGroup = state.criteriaGroup.map((criteriaGroup) => {
        const foundGroupSaved = criteriaGroupSaved.find(({ id }) => id === criteriaGroup.id)
        const oldGroupsChildren = foundGroupSaved
          ? foundGroupSaved.criteriaIds.filter((criteriaId) => +criteriaId < 0)
          : []
        return {
          ...criteriaGroup,
          criteriaIds: [...criteriaGroup.criteriaIds, ...oldGroupsChildren]
        }
      })
      state.nextCriteriaId += 1
    },
    deleteCriteriaGroup: (state: CohortCreationState, action: PayloadAction<number>) => {
      const groupId = action.payload
      const criteriaGroupSaved = [...state.criteriaGroup]
        .filter(({ id }) => id !== groupId)
        .map((item) => ({
          id: item.id,
          criteriaIds: [...item.criteriaIds]
        }))
      // Reset Group criteriaIds
      state.criteriaGroup = state.criteriaGroup
        .filter(({ id }) => id !== groupId)
        .map((item) => ({ ...item, criteriaIds: [] }))

      const newCriteriaGroup = state.criteriaGroup.map((criteriaGroup, index) => {
        const foundGroupSaved = criteriaGroupSaved.find(({ id }) => id === criteriaGroup.id)
        const oldCriteriaChildren = foundGroupSaved
          ? foundGroupSaved.criteriaIds.filter((criteriaId) => +criteriaId > 0)
          : []

        return {
          ...criteriaGroup,
          newId: index ? -index : 0,
          criteriaIds: oldCriteriaChildren
        }
      })
      for (const criteriaGroup of newCriteriaGroup) {
        const parentGroup = criteriaGroupSaved.find((_criteriaGroup) =>
          _criteriaGroup.criteriaIds.find((criteriaId) => criteriaId === criteriaGroup.id)
        )
        const indexOfParent = parentGroup ? criteriaGroupSaved.indexOf(parentGroup) : -1
        if (indexOfParent !== -1) {
          state.criteriaGroup[indexOfParent] = {
            ...state.criteriaGroup[indexOfParent],
            criteriaIds: [...state.criteriaGroup[indexOfParent].criteriaIds, criteriaGroup.newId]
          }
        }

        const currentGroup = criteriaGroupSaved.find((_criteriaGroup) => _criteriaGroup.id === criteriaGroup.id)
        const indexOfGroup = currentGroup ? criteriaGroupSaved.indexOf(currentGroup) : -1
        if (indexOfGroup !== -1) {
          state.criteriaGroup[indexOfGroup] = {
            ...state.criteriaGroup[indexOfGroup],
            id: criteriaGroup.newId,
            criteriaIds: [...state.criteriaGroup[indexOfGroup].criteriaIds, ...criteriaGroup.criteriaIds]
          }
        }
      }
      state.nextGroupId = -(state.criteriaGroup.length + 1)
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
    duplicateSelectedCriteria: (state: CohortCreationState, action: PayloadAction<number>) => {
      const criteriaId = action.payload

      // Duplicate
      const duplicatedCriterion = state.selectedCriteria.find(({ id }) => id === criteriaId)
      if (!duplicatedCriterion) return

      state.selectedCriteria = [...state.selectedCriteria, duplicatedCriterion]

      // Re-assign IDs of selectedCriteria + criteriaIDs into criteriaGroup
      const criteriaGroupSaved = [...state.criteriaGroup]
      // Reset Group criteriaIds
      state.criteriaGroup = state.criteriaGroup.map((item) => ({ ...item, criteriaIds: [] }))

      // Re-assign IDs of selectedCriteria
      state.selectedCriteria = state.selectedCriteria.map((selectedCriteria, index) => {
        // Get the parent of current critria
        const parentGroup = criteriaGroupSaved.find((criteriaGroup) =>
          criteriaGroup.criteriaIds.find((criteriaId) => criteriaId === selectedCriteria.id)
        )
        if (parentGroup) {
          const indexOfParent = criteriaGroupSaved.indexOf(parentGroup)
          // Assign the new criterion identifier to its group
          if (indexOfParent !== -1) {
            state.criteriaGroup[indexOfParent] = {
              ...state.criteriaGroup[indexOfParent],
              criteriaIds: [...state.criteriaGroup[indexOfParent].criteriaIds, index + 1]
            }
          }
        }
        return { ...selectedCriteria, id: index + 1 }
      })
      // Re-assign IDs of criteriaIDs into criteriaGroup
      state.criteriaGroup = state.criteriaGroup.map((criteriaGroup) => {
        const foundGroupSaved = criteriaGroupSaved.find(({ id }) => id === criteriaGroup.id)
        const oldGroupsChildren = foundGroupSaved
          ? foundGroupSaved.criteriaIds.filter((criteriaId) => +criteriaId < 0)
          : []
        return {
          ...criteriaGroup,
          criteriaIds: [...criteriaGroup.criteriaIds, ...oldGroupsChildren]
        }
      })
      state.nextCriteriaId += 1
    },
    updateTemporalConstraint: (state: CohortCreationState, action: PayloadAction<TemporalConstraintsType>) => {
      const foundItem = state.temporalConstraints.find(({ idList }) => {
        const equals = (a: any[], b: any[]) => a.length === b.length && a.every((v, i) => v === b[i])
        return equals(idList, action.payload.idList)
      })
      const index = foundItem ? state.temporalConstraints.indexOf(foundItem) : -1
      if (index !== -1) state.temporalConstraints[index] = action.payload
    },
    suspendCount: (state: CohortCreationState) => {
      state.count = {
        ...(state.count || {}),
        status:
          (state.count || {}).status === 'pending' ||
          (state.count || {}).status === 'started' ||
          (state.count || {}).status === 'suspended'
            ? 'suspended'
            : (state.count || {}).status
      }
    },
    unsuspendCount: (state: CohortCreationState) => {
      state.count = {
        ...state.count,
        status: 'pending'
      }
    }
  },
  extraReducers: (builder) => {
    builder.addCase(login, () => defaultInitialState)
    builder.addCase(logout.fulfilled, () => defaultInitialState)
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
    builder.addCase(countCohortCreation.pending, (state) => ({ ...state, status: 'pending', countLoading: true }))
    builder.addCase(countCohortCreation.fulfilled, (state, { payload }) => ({
      ...state,
      ...payload,
      countLoading: payload?.count?.status === 'pending' || payload?.count?.status === 'started'
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
      ...payload
    }))
    builder.addCase(fetchRequestCohortCreation.rejected, (state) => ({ ...state, loading: false }))
    // addRequestToCohortCreation
    builder.addCase(addRequestToCohortCreation.pending, (state) => ({ ...state, loading: true }))
    builder.addCase(addRequestToCohortCreation.fulfilled, (state, { payload }) => ({
      ...state,
      ...payload,
      loading: false
    }))
    builder.addCase(addRequestToCohortCreation.rejected, (state) => ({ ...state, loading: false }))
    // Create new request
    builder.addCase(addRequest.fulfilled, (state, { payload }) => {
      const newRequestId = payload.requestsList ? payload.requestsList[payload.requestsList.length - 1].uuid : ''
      const newRequestName = payload.requestsList ? payload.requestsList[payload.requestsList.length - 1].name : ''
      return { ...state, requestId: newRequestId, requestName: newRequestName, loading: false }
    })
    // When you delete a request | folder => reset cohort create (if current request is edited state)
    builder.addCase(deleteRequest.fulfilled, () => defaultInitialState)
    builder.addCase(deleteProject.fulfilled, () => defaultInitialState)
  }
})

export default cohortCreationSlice.reducer
export {
  buildCohortCreation,
  unbuildCohortCreation,
  saveJson,
  countCohortCreation,
  fetchRequestCohortCreation,
  addRequestToCohortCreation
}
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
  duplicateSelectedCriteria,
  //
  updateTemporalConstraint,
  suspendCount,
  unsuspendCount
} = cohortCreationSlice.actions
