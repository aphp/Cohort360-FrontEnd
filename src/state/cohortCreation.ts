import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit'
import { RootState } from 'state'
import {
  CohortCreationCounterType,
  ScopeTreeRow,
  CriteriaGroup,
  TemporalConstraintsType,
  TemporalConstraintsKind,
  QuerySnapshotInfo,
  CurrentSnapshot,
  CohortJobStatus,
  CriteriaGroupType
} from 'types'

import { buildRequest, unbuildRequest, joinRequest, checkNominativeCriteria } from 'utils/cohortCreation'

import { logout, login, impersonate } from './me'
import { addRequest, deleteRequest } from './request'
import { deleteProject } from './project'

import services from 'services/aphp'
import { SHORT_COHORT_LIMIT } from '../constants'
import { SelectedCriteriaType } from 'types/requestCriterias'

export type CohortCreationState = {
  loading: boolean
  saveLoading: boolean
  countLoading: boolean
  count_outdated: boolean
  shortCohortLimit: number
  requestId: string
  cohortName: string
  json: string
  currentSnapshot: CurrentSnapshot
  navHistory: CurrentSnapshot[]
  snapshotsHistory: QuerySnapshotInfo[]
  count: CohortCreationCounterType
  selectedPopulation: (ScopeTreeRow | undefined)[] | null
  executiveUnits: (ScopeTreeRow | undefined)[] | null
  allowSearchIpp: boolean
  selectedCriteria: SelectedCriteriaType[]
  isCriteriaNominative: boolean
  criteriaGroup: CriteriaGroup[]
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
  count_outdated: false,
  shortCohortLimit: SHORT_COHORT_LIMIT,
  requestId: '',
  cohortName: '',
  json: '',
  currentSnapshot: {} as CurrentSnapshot,
  navHistory: [],
  snapshotsHistory: [],
  count: {},
  selectedPopulation: null,
  executiveUnits: null,
  allowSearchIpp: false,
  selectedCriteria: [],
  isCriteriaNominative: false,
  criteriaGroup: [
    {
      id: 0,
      title: `Opérateur logique principal`,
      type: CriteriaGroupType.AND_GROUP,
      criteriaIds: [],
      isSubGroup: false,
      isInclusive: true
    }
  ],
  temporalConstraints: [
    {
      idList: ['All'],
      constraintType: TemporalConstraintsKind.NONE
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
  snapshotsHistory?: QuerySnapshotInfo[]
  currentSnapshot?: CurrentSnapshot
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

    const { requestName, json, currentSnapshot, shortCohortLimit, snapshotsHistory, count, count_outdated } =
      requestResult

    const _currentSnapshot: CurrentSnapshot = { ...currentSnapshot, navHistoryIndex: 0 }
    const initNavHistory = [_currentSnapshot]

    dispatch(
      unbuildCohortCreation({
        newCurrentSnapshot: _currentSnapshot
      })
    )

    return {
      requestName,
      json,
      requestId,
      snapshotsHistory,
      currentSnapshot: _currentSnapshot,
      navHistory: initNavHistory,
      shortCohortLimit,
      count_outdated,
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
  { count?: CohortCreationCounterType; snapshotsHistory?: QuerySnapshotInfo[] },
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
    }

    return {
      count: countResult,
      snapshotsHistory: newSnapshotsHistory,
      count_outdated: countResult.count_outdated,
      shortCohortLimit: countResult.shortCohortLimit
    }
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
export type SaveJsonReturn = {
  requestId: string
  snapshotsHistory: QuerySnapshotInfo[]
  currentSnapshot: CurrentSnapshot
}
type SaveJsonParams = { newJson: string }

const saveJson = createAsyncThunk<SaveJsonReturn, SaveJsonParams, { state: RootState }>(
  'cohortCreation/saveJson',
  async ({ newJson }, { getState }) => {
    try {
      const state = getState()
      const { requestId } = state.cohortCreation.request
      let { snapshotsHistory, currentSnapshot } = state.cohortCreation.request
      const { navHistory } = state.cohortCreation.request
      const _navHistory: CurrentSnapshot[] = navHistory.slice()

      if (!snapshotsHistory || (snapshotsHistory && snapshotsHistory.length === 0)) {
        if (requestId) {
          const newSnapshot = await services.cohortCreation.createSnapshot(requestId, newJson, true)
          if (newSnapshot) {
            const uuid = newSnapshot.uuid
            const created_at = newSnapshot.created_at
            const title = newSnapshot.title
            const has_linked_cohorts = newSnapshot.has_linked_cohorts
            const version = newSnapshot.version

            currentSnapshot = { ...newSnapshot, navHistoryIndex: navHistory.length }
            snapshotsHistory = [{ uuid, created_at, title, has_linked_cohorts, version }]
            _navHistory.push(currentSnapshot)
          }
        }
      } else if (currentSnapshot) {
        // Update snapshots list
        const newSnapshot = await services.cohortCreation.createSnapshot(snapshotsHistory[0].uuid, newJson, false)
        if (newSnapshot) {
          const uuid = newSnapshot.uuid
          const created_at = newSnapshot.created_at
          const title = newSnapshot.title
          const has_linked_cohorts = newSnapshot.has_linked_cohorts
          const version = newSnapshot.version

          currentSnapshot = { ...newSnapshot, navHistoryIndex: navHistory.length }
          snapshotsHistory = [{ uuid, created_at, title, has_linked_cohorts, version }, ...snapshotsHistory]
          _navHistory.push(currentSnapshot)
        }
      }

      return {
        requestId,
        snapshotsHistory,
        currentSnapshot,
        navHistory: _navHistory
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
      const _criteriaGroup: CriteriaGroup[] =
        state.cohortCreation.request.criteriaGroup && state.cohortCreation.request.criteriaGroup.length > 0
          ? state.cohortCreation.request.criteriaGroup
          : defaultInitialState.criteriaGroup
      const _temporalConstraints =
        state.cohortCreation.request.temporalConstraints ?? defaultInitialState.temporalConstraints

      const json = buildRequest(_selectedPopulation, _selectedCriteria, _criteriaGroup, _temporalConstraints)

      if (json !== state?.cohortCreation?.request?.json) {
        const saveJsonResponse = await dispatch(saveJson({ newJson: json })).unwrap()

        await dispatch(
          countCohortCreation({
            json: json,
            snapshotId: saveJsonResponse.currentSnapshot.uuid,
            requestId: saveJsonResponse.requestId
          })
        )
      }

      const allowSearchIpp = _selectedPopulation
        ? await services.perimeters.allowSearchIpp(_selectedPopulation as ScopeTreeRow[])
        : false

      let _initTemporalConstraints

      if (_temporalConstraints?.length === 0) {
        _initTemporalConstraints = defaultInitialState.temporalConstraints
      } else {
        _initTemporalConstraints = _temporalConstraints
      }

      if (_temporalConstraints?.length > 0) {
        _initTemporalConstraints = _temporalConstraints.map(
          (temporalConstraint: TemporalConstraintsType, index: number) => {
            return {
              ...temporalConstraint,
              id: index + 1
            }
          }
        )
      }

      return {
        json,
        selectedPopulation: _selectedPopulation,
        allowSearchIpp: allowSearchIpp,
        temporalConstraints: _initTemporalConstraints
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
  currentSnapshot: CurrentSnapshot
  selectedPopulation: (ScopeTreeRow | undefined)[] | null
  selectedCriteria: SelectedCriteriaType[]
  criteriaGroup: CriteriaGroup[]
  nextCriteriaId: number
  nextGroupId: number
}
type UnbuildParams = { newCurrentSnapshot: CurrentSnapshot }

const unbuildCohortCreation = createAsyncThunk<UnbuildCohortReturn, UnbuildParams, { state: RootState }>(
  'cohortCreation/unbuild',
  async ({ newCurrentSnapshot }, { dispatch }) => {
    try {
      const { serialized_query, dated_measures } = newCurrentSnapshot
      const { population, criteria, criteriaGroup, temporalConstraints } = await unbuildRequest(serialized_query)

      let _temporalConstraints
      let isCriteriaNominative = false

      if (temporalConstraints && temporalConstraints?.length > 0) {
        _temporalConstraints = temporalConstraints.map((temporalConstraint: TemporalConstraintsType, index: number) => {
          return {
            ...temporalConstraint,
            id: index + 1
          }
        })
      } else {
        _temporalConstraints = defaultInitialState.temporalConstraints
      }

      let allowSearchIpp = false
      if (population) {
        allowSearchIpp = await services.perimeters.allowSearchIpp(population as ScopeTreeRow[])
      }

      if (checkNominativeCriteria(criteria)) {
        isCriteriaNominative = true
      }

      const countId = dated_measures && dated_measures[0] ? dated_measures[0].uuid : null

      if (countId) {
        dispatch(
          countCohortCreation({
            uuid: countId
          })
        )
      } else {
        dispatch(
          countCohortCreation({
            json: serialized_query,
            snapshotId: newCurrentSnapshot.uuid,
            requestId: newCurrentSnapshot.request
          })
        )
      }

      return {
        json: serialized_query,
        currentSnapshot: newCurrentSnapshot,
        selectedPopulation: population,
        allowSearchIpp: allowSearchIpp,
        temporalConstraints: _temporalConstraints,
        selectedCriteria: criteria,
        isCriteriaNominative: isCriteriaNominative,
        criteriaGroup: criteriaGroup.length > 0 ? criteriaGroup : defaultInitialState.criteriaGroup,
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
  criteriaGroup: CriteriaGroup[]
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

    const saveJsonResponse = await dispatch(saveJson({ newJson: json })).unwrap()
    await dispatch(
      countCohortCreation({
        json: json,
        snapshotId: saveJsonResponse.currentSnapshot.uuid,
        requestId: saveJsonResponse.requestId
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
      const idMap: { [key: number]: number } = {} // Object to hold previous and new IDs mapping

      // Reset Group criteriaIds
      state.criteriaGroup = state.criteriaGroup.map((item) => ({ ...item, criteriaIds: [] }))

      state.selectedCriteria = state.selectedCriteria
        .filter(({ id }) => id !== criteriaId)
        .map((selectedCriteria, index) => {
          // Get the parent of current criteria
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
          idMap[selectedCriteria.id] = index + 1
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

      // Delete temporalConstraints containing deletedCriteria and reassign criteriaIds
      const remainingConstraints = state.temporalConstraints
        .filter(
          (constraint) =>
            !(
              constraint.idList.includes(criteriaId as never) &&
              (constraint.constraintType === TemporalConstraintsKind.DIRECT_CHRONOLOGICAL_ORDERING ||
                (constraint.constraintType === TemporalConstraintsKind.SAME_ENCOUNTER && constraint.idList.length <= 2))
            )
        )
        .map((constraint) => {
          if (
            constraint.idList.includes(criteriaId as never) &&
            constraint.constraintType === TemporalConstraintsKind.SAME_ENCOUNTER
          ) {
            const findIndex = constraint.idList.findIndex((id) => id === criteriaId)
            constraint.idList.splice(findIndex, 1)
          }
          return constraint
        })
        .map((constraint) => {
          const oldIds = constraint.idList as number[]
          const newIds = oldIds.map((id) => idMap[id] ?? id)
          return { ...constraint, idList: newIds }
        })

      state.temporalConstraints = remainingConstraints
    },
    deleteCriteriaGroup: (state: CohortCreationState, action: PayloadAction<number>) => {
      const groupId = action.payload
      const criteriaGroupSaved = [...state.criteriaGroup]
        .filter(({ id }) => id !== groupId)
        .map((item) => ({
          id: item.id,
          criteriaIds: [...item.criteriaIds]
        }))

      // delete constraints containing criteria from this group
      const deletedGroupCriteriaIds = state.criteriaGroup.find((group) => group.id === action.payload)?.criteriaIds

      if (deletedGroupCriteriaIds) {
        const remainingConstraints = state.temporalConstraints.filter(
          (constraint) => !constraint.idList.some((r) => deletedGroupCriteriaIds.includes(r as number))
        )
        state.temporalConstraints = remainingConstraints
      }

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
    addNewSelectedCriteria: (state: CohortCreationState, action: PayloadAction<SelectedCriteriaType>) => {
      state.selectedCriteria = [...state.selectedCriteria, action.payload]
      state.nextCriteriaId++
    },
    addNewCriteriaGroup: (state: CohortCreationState, action: PayloadAction<CriteriaGroup>) => {
      state.criteriaGroup = [...state.criteriaGroup, action.payload]
      state.nextGroupId--
    },
    editAllCriteria: (state: CohortCreationState, action: PayloadAction<SelectedCriteriaType[]>) => {
      state.selectedCriteria = action.payload
    },
    editAllCriteriaGroup: (state: CohortCreationState, action: PayloadAction<CriteriaGroup[]>) => {
      state.criteriaGroup = action.payload
    },
    pseudonimizeCriteria: (state: CohortCreationState) => {
      state.isCriteriaNominative = false
    },
    editSelectedCriteria: (state: CohortCreationState, action: PayloadAction<SelectedCriteriaType>) => {
      const foundItem = state.selectedCriteria.find(({ id }) => id === action.payload.id)
      const index = foundItem ? state.selectedCriteria.indexOf(foundItem) : -1
      if (index !== -1) state.selectedCriteria[index] = action.payload
    },
    editCriteriaGroup: (state: CohortCreationState, action: PayloadAction<CriteriaGroup>) => {
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
    deleteTemporalConstraint: (state: CohortCreationState, action: PayloadAction<TemporalConstraintsType>) => {
      state.temporalConstraints = state.temporalConstraints.filter((constraint) => constraint !== action.payload)
    },
    updateTemporalConstraints: (state: CohortCreationState, action: PayloadAction<TemporalConstraintsType[]>) => {
      state.temporalConstraints = action.payload
    },
    suspendCount: (state: CohortCreationState) => {
      state.count = {
        ...(state.count || {}),
        status:
          (state.count || {}).status === CohortJobStatus.PENDING ||
          (state.count || {}).status === CohortJobStatus.NEW ||
          (state.count || {}).status === CohortJobStatus.SUSPENDED
            ? CohortJobStatus.SUSPENDED
            : (state.count || {}).status
      }
    },
    unsuspendCount: (state: CohortCreationState) => {
      state.count = {
        ...state.count,
        status: CohortJobStatus.PENDING
      }
    },
    addActionToNavHistory: (state: CohortCreationState, action: PayloadAction<CurrentSnapshot>) => {
      let navHistory = state.navHistory
      const newSnapshot = action.payload
      if (navHistory.length > newSnapshot.navHistoryIndex) {
        navHistory = state.navHistory.splice(newSnapshot.navHistoryIndex)
      }
      navHistory.push(newSnapshot)
      state.navHistory = navHistory
    }
  },
  extraReducers: (builder) => {
    builder.addCase(login, () => defaultInitialState)
    builder.addCase(logout.fulfilled, () => defaultInitialState)
    builder.addCase(impersonate, () => defaultInitialState)
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
    builder.addCase(countCohortCreation.pending, (state) => ({
      ...state,
      status: CohortJobStatus.PENDING,
      countLoading: true
    }))
    builder.addCase(countCohortCreation.fulfilled, (state, { payload }) => ({
      ...state,
      ...payload,
      countLoading: payload?.count?.status === CohortJobStatus.PENDING || payload?.count?.status === CohortJobStatus.NEW
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
  setCohortName,
  setPopulationSource,
  setSelectedCriteria,
  deleteSelectedCriteria,
  deleteCriteriaGroup,
  addNewSelectedCriteria,
  addNewCriteriaGroup,
  editAllCriteriaGroup,
  editAllCriteria,
  pseudonimizeCriteria,
  editSelectedCriteria,
  editCriteriaGroup,
  duplicateSelectedCriteria,
  updateTemporalConstraints,
  deleteTemporalConstraint,
  suspendCount,
  unsuspendCount,
  addActionToNavHistory
} = cohortCreationSlice.actions
