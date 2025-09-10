/**
 * @fileoverview Cohort creation state slice.
 * Manages the complex state for building, editing, and managing cohort creation requests.
 * This is the core slice for the cohort creation workflow.
 */

import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit'
import { RootState } from 'state'
import {
  CohortCount,
  CriteriaGroup,
  TemporalConstraintsType,
  TemporalConstraintsKind,
  QuerySnapshotInfo,
  CurrentSnapshot,
  CriteriaGroupType,
  JobStatus
} from 'types'
import { buildRequest, unbuildRequest, joinRequest, checkNominativeCriteria } from 'utils/cohortCreation'

import { logout, login, impersonate } from './me'
import { addRequest } from './request'

import services from 'services/aphp'
import { SelectedCriteriaType } from 'types/requestCriterias'
import { Hierarchy } from 'types/hierarchy'
import { getConfig } from 'config'
import { ScopeElement } from 'types/scope'

/**
 * State interface for cohort creation functionality.
 * Contains all data needed for building and managing cohort requests.
 */
export type CohortCreationState = {
  /** General loading state for cohort operations */
  loading: boolean
  /** Loading state specifically for save operations */
  saveLoading: boolean
  /** Loading state specifically for count operations */
  countLoading: boolean
  /** Whether the current count is outdated */
  count_outdated: boolean
  /** Limit for short cohort processing */
  shortCohortLimit: number
  /** Current request identifier */
  requestId: string
  /** Name of the cohort being created */
  cohortName: string
  /** Serialized JSON representation of the request */
  json: string
  /** Current snapshot data */
  currentSnapshot: CurrentSnapshot
  /** Navigation history for undo/redo functionality */
  navHistory: CurrentSnapshot[]
  /** History of saved snapshots */
  snapshotsHistory: QuerySnapshotInfo[]
  /** Current cohort count and status */
  count: CohortCount
  /** Selected population/scope for the cohort */
  selectedPopulation: Hierarchy<ScopeElement>[] | null
  /** Executive units for the cohort */
  executiveUnits: (Hierarchy<ScopeElement> | undefined)[] | null
  /** Whether IPP search is allowed */
  allowSearchIpp: boolean
  /** Array of selected criteria */
  selectedCriteria: SelectedCriteriaType[]
  /** Whether criteria contain nominative data */
  isCriteriaNominative: boolean
  /** Groups organizing the criteria */
  criteriaGroup: CriteriaGroup[]
  /** Mapping of old IDs to new IDs for criteria */
  idRemap: Record<number, number>
  /** Temporal constraints between criteria */
  temporalConstraints: TemporalConstraintsType[]
  /** Next available criteria ID */
  nextCriteriaId: number
  /** Next available group ID (negative) */
  nextGroupId: number
  /** Optional project name */
  projectName?: string
  /** Optional request name */
  requestName?: string
}

/**
 * Factory function that returns the default initial state for cohort creation.
 * Used to reset state and ensure fresh state on login/logout.
 *
 * @returns {CohortCreationState} Fresh initial state
 */
const defaultInitialState: () => CohortCreationState = () => ({
  loading: false,
  saveLoading: false,
  countLoading: false,
  count_outdated: false,
  shortCohortLimit: getConfig().features.cohort.shortCohortLimit,
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
  idRemap: {},
  temporalConstraints: [
    {
      idList: ['All'],
      constraintType: TemporalConstraintsKind.NONE
    }
  ],
  nextCriteriaId: 1,
  nextGroupId: -1
})

/**
 * Parameters for fetching a cohort creation request.
 */
type FetchRequestCohortCreationParams = {
  /** ID of the request to fetch */
  requestId: string
  /** Optional snapshot ID to load specific version */
  snapshotId?: string
}

/**
 * Return type for fetchRequestCohortCreation async thunk.
 */
type FetchRequestCohortCreationReturn = {
  /** Name of the fetched request */
  requestName?: string
  /** ID of the fetched request */
  requestId?: string
  /** History of snapshots for this request */
  snapshotsHistory?: QuerySnapshotInfo[]
  /** Current snapshot data */
  currentSnapshot?: CurrentSnapshot
  /** Serialized JSON of the request */
  json?: string
}

/**
 * Async thunk to fetch a cohort creation request from the backend.
 * Loads the request data and initializes the cohort creation state.
 *
 * @param {FetchRequestCohortCreationParams} params - Request parameters
 * @param {Object} thunkAPI - Redux thunk API
 * @returns {Promise<FetchRequestCohortCreationReturn>} Request data
 */
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
 * Parameters for counting cohort creation results.
 */
type CountCohortCreationParams = {
  /** JSON query to count */
  json?: string
  /** Snapshot ID for the count */
  snapshotId?: string
  /** Request ID for the count */
  requestId?: string
  /** UUID for existing count job */
  uuid?: string
}

/**
 * Async thunk to count patients in a cohort creation request.
 * Initiates or retrieves count job results from the backend.
 *
 * @param {CountCohortCreationParams} params - Count parameters
 * @param {Object} thunkAPI - Redux thunk API
 * @returns {Promise<Object>} Count results and updated snapshots
 */
const countCohortCreation = createAsyncThunk<
  { count?: CohortCount; snapshotsHistory?: QuerySnapshotInfo[] },
  CountCohortCreationParams,
  { state: RootState }
>('cohortCreation/count', async ({ json, snapshotId, requestId, uuid }, { getState }) => {
  try {
    const state = getState()
    const { snapshotsHistory } = state.cohortCreation.request
    const newSnapshotsHistory = [...snapshotsHistory].map((item) => ({ ...item }))

    const countResult = await services.cohortCreation.countCohort(
      json,
      snapshotId,
      requestId,
      uuid,
      state.preferences.requests.detailedMode
    )

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
 * Return type for saveJson async thunk.
 */
export type SaveJsonReturn = {
  /** ID of the request */
  requestId: string
  /** Updated snapshots history */
  snapshotsHistory: QuerySnapshotInfo[]
  /** Current snapshot after save */
  currentSnapshot: CurrentSnapshot
}

/**
 * Parameters for saving JSON query.
 */
type SaveJsonParams = {
  /** New JSON query to save */
  newJson: string
}

/**
 * Async thunk to save a JSON query as a new snapshot.
 * Creates a new snapshot or updates existing snapshots history.
 *
 * @param {SaveJsonParams} params - Save parameters
 * @param {Object} thunkAPI - Redux thunk API
 * @returns {Promise<SaveJsonReturn>} Save results
 */
const saveJson = createAsyncThunk<SaveJsonReturn, SaveJsonParams, { state: RootState }>(
  'cohortCreation/saveJson',
  // eslint-disable-next-line max-statements
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
            const cohorts_count = newSnapshot.cohorts_count
            const version = newSnapshot.version

            currentSnapshot = { ...newSnapshot, navHistoryIndex: navHistory.length }
            snapshotsHistory = [{ uuid, created_at, title, cohorts_count, version }]
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
          const cohorts_count = newSnapshot.cohorts_count
          const version = newSnapshot.version

          currentSnapshot = { ...newSnapshot, navHistoryIndex: navHistory.length }
          snapshotsHistory = [{ uuid, created_at, title, cohorts_count, version }, ...snapshotsHistory]
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
 * Return type for buildCohortCreation async thunk.
 */
type BuildCohortReturn = {
  /** Built JSON query */
  json: string
  /** Selected population for the cohort */
  selectedPopulation: Hierarchy<ScopeElement, string>[] | null
}

/**
 * Parameters for building cohort creation.
 */
type BuildCohortParams = {
  /** Population to use for building */
  selectedPopulation: Hierarchy<ScopeElement, string>[] | null
}
/**
 * Async thunk to build a cohort creation request from current state.
 * Constructs the JSON query from criteria, groups, and constraints.
 *
 * @param {BuildCohortParams} params - Build parameters
 * @param {Object} thunkAPI - Redux thunk API
 * @returns {Promise<BuildCohortReturn>} Built cohort data
 */
const buildCohortCreation = createAsyncThunk<BuildCohortReturn, BuildCohortParams, { state: RootState }>(
  'cohortCreation/build',
  async ({ selectedPopulation }, { getState, dispatch }) => {
    try {
      const state = getState()
      const _selectedPopulation = selectedPopulation ?? state.cohortCreation.request.selectedPopulation
      const _selectedCriteria = state.cohortCreation.request.selectedCriteria
      const _criteriaGroup: CriteriaGroup[] =
        state.cohortCreation.request.criteriaGroup && state.cohortCreation.request.criteriaGroup.length > 0
          ? state.cohortCreation.request.criteriaGroup
          : defaultInitialState().criteriaGroup
      const _temporalConstraints =
        state.cohortCreation.request.temporalConstraints ?? defaultInitialState().temporalConstraints

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

      const allowSearchIpp = _selectedPopulation ? await services.perimeters.allowSearchIpp(_selectedPopulation) : false

      let _initTemporalConstraints

      if (_temporalConstraints?.length === 0) {
        _initTemporalConstraints = defaultInitialState().temporalConstraints
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

/**
 * Return type for unbuildCohortCreation async thunk.
 */
type UnbuildCohortReturn = {
  /** Original JSON query */
  json: string
  /** Current snapshot data */
  currentSnapshot: CurrentSnapshot
  /** Extracted population */
  selectedPopulation: Hierarchy<ScopeElement, string>[] | null
  /** Extracted criteria */
  selectedCriteria: SelectedCriteriaType[]
  /** ID remapping for criteria */
  idRemap: Record<number, number>
  /** Extracted criteria groups */
  criteriaGroup: CriteriaGroup[]
  /** Next criteria ID to use */
  nextCriteriaId: number
  /** Next group ID to use */
  nextGroupId: number
}

/**
 * Parameters for unbuilding cohort creation.
 */
type UnbuildParams = {
  /** Snapshot to unbuild */
  newCurrentSnapshot: CurrentSnapshot
}

/**
 * Async thunk to unbuild a cohort creation request from JSON.
 * Parses the JSON query back into criteria, groups, and constraints.
 *
 * @param {UnbuildParams} params - Unbuild parameters
 * @param {Object} thunkAPI - Redux thunk API
 * @returns {Promise<UnbuildCohortReturn>} Unbuilt cohort data
 */
const unbuildCohortCreation = createAsyncThunk<UnbuildCohortReturn, UnbuildParams, { state: RootState }>(
  'cohortCreation/unbuild',
  async ({ newCurrentSnapshot }, { dispatch }) => {
    try {
      const { serialized_query, dated_measures } = newCurrentSnapshot
      const { population, criteria, criteriaGroup, temporalConstraints, idRemap } =
        await unbuildRequest(serialized_query)
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
        _temporalConstraints = defaultInitialState().temporalConstraints
      }

      let allowSearchIpp = false
      if (population) {
        allowSearchIpp = await services.perimeters.allowSearchIpp(population)
      }

      if (checkNominativeCriteria(criteria)) {
        isCriteriaNominative = true
      }

      const countId = dated_measures?.[0] ? dated_measures[0].uuid : null

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
        criteriaGroup: criteriaGroup.length > 0 ? criteriaGroup : defaultInitialState().criteriaGroup,
        idRemap,
        nextCriteriaId: criteria.length + 1,
        nextGroupId: -(criteriaGroup.length + 1)
      }
    } catch (error) {
      console.error(error)
      throw error
    }
  }
)

/**
 * Return type for addRequestToCohortCreation async thunk.
 */
type AddRequestToCohortReturn = {
  /** Merged JSON query */
  json: string
  /** Merged criteria */
  selectedCriteria: SelectedCriteriaType[]
  /** Merged criteria groups */
  criteriaGroup: CriteriaGroup[]
  /** Next criteria ID */
  nextCriteriaId: number
  /** Next group ID */
  nextGroupId: number
}

/**
 * Parameters for adding request to cohort creation.
 */
type AddRequestToCohortParams = {
  /** ID of request to add */
  selectedRequestId: string
  /** Parent group ID to add to */
  parentId: number | null
}

/**
 * Async thunk to add an existing request to the current cohort creation.
 * Merges the selected request with the current cohort being built.
 *
 * @param {AddRequestToCohortParams} params - Add request parameters
 * @param {Object} thunkAPI - Redux thunk API
 * @returns {Promise<AddRequestToCohortReturn>} Merged cohort data
 */
const addRequestToCohortCreation = createAsyncThunk<
  AddRequestToCohortReturn,
  AddRequestToCohortParams,
  { state: RootState }
>('cohortCreation/addRequestToCohort', async ({ selectedRequestId, parentId }, { getState, dispatch }) => {
  try {
    const state = getState()
    const newRequestResult = await services.cohortCreation.fetchRequest(selectedRequestId)

    const { json, criteria, criteriaGroup, idRemap } = await joinRequest(
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
      nextGroupId: -(criteriaGroup.length + 1),
      idRemap
    }
  } catch (error) {
    console.error(error)
    throw error
  }
})

/**
 * Cohort creation slice managing the complete cohort building workflow.
 *
 * This slice handles:
 * - Criteria management (add, edit, delete, duplicate)
 * - Group management and organization
 * - Temporal constraints between criteria
 * - Population and scope selection
 * - Navigation history for undo/redo
 * - Count management and status
 *
 * Actions:
 * - resetCohortCreation: Resets to initial state
 * - setCohortName: Sets the cohort name
 * - setPopulationSource: Sets the selected population
 * - setSelectedCriteria: Sets the complete criteria array
 * - deleteSelectedCriteria: Removes a criteria and updates dependencies
 * - deleteCriteriaGroup: Removes a criteria group
 * - addNewSelectedCriteria: Adds a new criteria
 * - addNewCriteriaGroup: Adds a new criteria group
 * - editAllCriteria: Replaces all criteria
 * - editAllCriteriaGroup: Replaces all criteria groups
 * - pseudonimizeCriteria: Marks criteria as non-nominative
 * - editSelectedCriteria: Updates a specific criteria
 * - editCriteriaGroup: Updates a specific criteria group
 * - duplicateSelectedCriteria: Duplicates an existing criteria
 * - deleteTemporalConstraint: Removes a temporal constraint
 * - updateTemporalConstraints: Updates all temporal constraints
 * - suspendCount: Suspends count job
 * - unsuspendCount: Resumes count job
 * - updateCount: Updates count results
 * - addActionToNavHistory: Adds action to navigation history
 *
 * Extra Reducers:
 * - Handles async thunk states for build, unbuild, save, count, fetch operations
 * - Resets state on login/logout/impersonate
 */
const cohortCreationSlice = createSlice({
  name: 'cohortCreation',
  initialState: defaultInitialState(),
  reducers: {
    /**
     * Resets the cohort creation state to initial values.
     */
    resetCohortCreation: () => defaultInitialState(),
    /**
     * Sets the name of the cohort being created.
     *
     * @param state - Current cohort creation state
     * @param action - Action containing the new cohort name
     */
    setCohortName: (state: CohortCreationState, action: PayloadAction<string>) => {
      state.cohortName = action.payload
    },
    //
    /**
     * Sets the population source/scope for the cohort.
     *
     * @param state - Current cohort creation state
     * @param action - Action containing the selected population
     */
    setPopulationSource: (
      state: CohortCreationState,
      action: PayloadAction<Hierarchy<ScopeElement, string>[] | null>
    ) => {
      state.selectedPopulation = action.payload
    },
    /**
     * Sets the complete array of selected criteria.
     *
     * @param state - Current cohort creation state
     * @param action - Action containing the new criteria array
     */
    setSelectedCriteria: (state: CohortCreationState, action: PayloadAction<SelectedCriteriaType[]>) => {
      state.selectedCriteria = action.payload
    },
    //
    /**
     * Deletes a selected criteria and updates all dependent structures.
     * Handles ID remapping, group assignments, and temporal constraints cleanup.
     *
     * @param state - Current cohort creation state
     * @param action - Action containing the criteria ID to delete
     */
    deleteSelectedCriteria: (state: CohortCreationState, action: PayloadAction<number>) => {
      const criteriaId = action.payload
      const criteriaGroupSaved = [...state.criteriaGroup]
      const idMap: { [key: number]: number } = {} // Object to hold previous and new IDs mapping

      // Reset Group criteriaIds
      state.criteriaGroup = state.criteriaGroup.map((item) => ({ ...item, criteriaIds: [] }))

      state.selectedCriteria = state.selectedCriteria
        .filter(({ id }) => id !== criteriaId && id !== undefined)
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
                (constraint.constraintType === TemporalConstraintsKind.SAME_ENCOUNTER &&
                  constraint.idList.length <= 2) ||
                (constraint.constraintType === TemporalConstraintsKind.SAME_EPISODE_OF_CARE &&
                  constraint.idList.length <= 2))
            )
        )
        .map((constraint) => {
          if (
            constraint.idList.includes(criteriaId as never) &&
            (constraint.constraintType === TemporalConstraintsKind.SAME_ENCOUNTER ||
              constraint.constraintType === TemporalConstraintsKind.SAME_EPISODE_OF_CARE)
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
    /**
     * Deletes a criteria group and reorganizes remaining groups.
     * Also cleans up temporal constraints involving the deleted group.
     *
     * @param state - Current cohort creation state
     * @param action - Action containing the group ID to delete
     */
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
    /**
     * Adds a new criteria to the selection and increments the next criteria ID.
     *
     * @param state - Current cohort creation state
     * @param action - Action containing the new criteria to add
     */
    addNewSelectedCriteria: (state: CohortCreationState, action: PayloadAction<SelectedCriteriaType>) => {
      state.selectedCriteria = [...state.selectedCriteria, action.payload]
      state.nextCriteriaId++
    },
    /**
     * Adds a new criteria group and decrements the next group ID.
     *
     * @param state - Current cohort creation state
     * @param action - Action containing the new criteria group to add
     */
    addNewCriteriaGroup: (state: CohortCreationState, action: PayloadAction<CriteriaGroup>) => {
      state.criteriaGroup = [...state.criteriaGroup, action.payload]
      state.nextGroupId--
    },
    /**
     * Replaces all criteria with a new array.
     *
     * @param state - Current cohort creation state
     * @param action - Action containing the new criteria array
     */
    editAllCriteria: (state: CohortCreationState, action: PayloadAction<SelectedCriteriaType[]>) => {
      state.selectedCriteria = action.payload
    },
    /**
     * Replaces all criteria groups with a new array.
     *
     * @param state - Current cohort creation state
     * @param action - Action containing the new criteria groups array
     */
    editAllCriteriaGroup: (state: CohortCreationState, action: PayloadAction<CriteriaGroup[]>) => {
      state.criteriaGroup = action.payload
    },
    /**
     * Marks criteria as non-nominative (pseudonymized).
     *
     * @param state - Current cohort creation state
     */
    pseudonimizeCriteria: (state: CohortCreationState) => {
      state.isCriteriaNominative = false
    },
    /**
     * Updates a specific criteria by ID.
     *
     * @param state - Current cohort creation state
     * @param action - Action containing the updated criteria
     */
    editSelectedCriteria: (state: CohortCreationState, action: PayloadAction<SelectedCriteriaType>) => {
      const foundItem = state.selectedCriteria.find(({ id }) => id === action.payload.id)
      const index = foundItem ? state.selectedCriteria.indexOf(foundItem) : -1
      if (index !== -1) state.selectedCriteria[index] = action.payload
    },
    /**
     * Updates a specific criteria group by ID.
     *
     * @param state - Current cohort creation state
     * @param action - Action containing the updated criteria group
     */
    editCriteriaGroup: (state: CohortCreationState, action: PayloadAction<CriteriaGroup>) => {
      const foundItem = state.criteriaGroup.find(({ id }) => id === action.payload.id)
      const index = foundItem ? state.criteriaGroup.indexOf(foundItem) : -1
      if (index !== -1) state.criteriaGroup[index] = action.payload
    },
    /**
     * Duplicates an existing criteria and reassigns all IDs.
     *
     * @param state - Current cohort creation state
     * @param action - Action containing the criteria ID to duplicate
     */
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
    /**
     * Removes a temporal constraint from the list.
     *
     * @param state - Current cohort creation state
     * @param action - Action containing the temporal constraint to remove
     */
    deleteTemporalConstraint: (state: CohortCreationState, action: PayloadAction<TemporalConstraintsType>) => {
      state.temporalConstraints = state.temporalConstraints.filter((constraint) => constraint !== action.payload)
    },
    /**
     * Updates the complete array of temporal constraints.
     *
     * @param state - Current cohort creation state
     * @param action - Action containing the new temporal constraints array
     */
    updateTemporalConstraints: (state: CohortCreationState, action: PayloadAction<TemporalConstraintsType[]>) => {
      state.temporalConstraints = action.payload
    },
    /**
     * Suspends the current count job if it's in a suspendable state.
     *
     * @param state - Current cohort creation state
     */
    suspendCount: (state: CohortCreationState) => {
      state.count = {
        ...state.count,
        status:
          state.count?.status === JobStatus.PENDING ||
          state.count?.status === JobStatus.NEW ||
          state.count?.status === JobStatus.SUSPENDED
            ? JobStatus.SUSPENDED
            : state.count?.status
      }
    },
    /**
     * Resumes a suspended count job by setting status to pending.
     *
     * @param state - Current cohort creation state
     */
    unsuspendCount: (state: CohortCreationState) => {
      state.count = {
        ...state.count,
        status: JobStatus.PENDING
      }
    },
    /**
     * Updates the count results with new data from the backend.
     *
     * @param state - Current cohort creation state
     * @param action - Action containing the updated count data
     */
    updateCount: (state: CohortCreationState, action: PayloadAction<CohortCount>) => {
      state.count = {
        ...state.count,
        status: action.payload.status,
        includePatient: action.payload.includePatient,
        jobFailMsg: action.payload.jobFailMsg,
        extra: action.payload.extra
      }
    },
    /**
     * Adds a new action to the navigation history for undo/redo functionality.
     *
     * @param state - Current cohort creation state
     * @param action - Action containing the snapshot to add to history
     */
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
    builder.addCase(login, () => defaultInitialState())
    builder.addCase(logout.fulfilled, () => defaultInitialState())
    builder.addCase(impersonate, () => defaultInitialState())
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
      status: JobStatus.PENDING,
      countLoading: true
    }))
    builder.addCase(countCohortCreation.fulfilled, (state, { payload }) => ({
      ...state,
      ...payload,
      countLoading: payload?.count?.status === JobStatus.PENDING || payload?.count?.status === JobStatus.NEW
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
  updateCount,
  addActionToNavHistory
} = cohortCreationSlice.actions
