import React, { useCallback, useEffect } from 'react'
import { CircularProgress } from '@material-ui/core'
import { useHistory } from 'react-router-dom'
import { useDispatch } from 'react-redux'

import ControlPanel from './ControlPanel/ControlPanel'
import DiagramView from './DiagramView/DiagramView'

import { useAppSelector } from 'state'
import { setCriteriaList } from 'state/criteria'
import { unbuildCohortCreation, resetCohortCreation } from 'state/cohortCreation'
import { CohortCreationSnapshotType } from 'types'

import constructCriteriaList from './DataList_Criteria'

import { getDataFromFetch } from '../../../utils/cohortCreation'
import { createCohort } from '../../../services/cohortCreation'

const Requeteur = () => {
  const {
    loading = false,
    requestId = '',
    currentSnapshot = '',
    selectedCriteria = [],
    criteriaGroup = [],
    snapshotsHistory = [],
    count = {},
    json = ''
  } = useAppSelector((state) => state.cohortCreation.request || {})

  const history = useHistory()
  const dispatch = useDispatch()

  /**
   * Fetch all criteria to display list + retrieve all data from fetcher
   */
  const _fetchCriteria = useCallback(async () => {
    let _criteria = constructCriteriaList()
    _criteria = await getDataFromFetch(Object.freeze(_criteria), selectedCriteria)
    dispatch<any>(setCriteriaList(_criteria))
  }, [dispatch, criteriaGroup, selectedCriteria]) // eslint-disable-line

  const _unbuildRequest = async (newCurrentSnapshot: CohortCreationSnapshotType) => {
    dispatch<any>(unbuildCohortCreation({ newCurrentSnapshot }))
  }

  /**
   * Execute query:
   *  - Create it with `createCohort`
   *  - Link fhir result with the back end, call /cohorts/
   */
  const _onExecute = (cohortName: string, cohortDescription: string) => {
    const _createCohort = async () => {
      if (!json) return

      await createCohort(json, count?.uuid, currentSnapshot, requestId, cohortName, cohortDescription)
      dispatch<any>(resetCohortCreation())
      history.push(`/accueil`)
    }

    _createCohort()
  }

  const _onUndo = async () => {
    const foundItem = snapshotsHistory.find(
      (snapshotsHistory: CohortCreationSnapshotType) => snapshotsHistory.uuid === currentSnapshot
    )
    const index = foundItem ? snapshotsHistory.indexOf(foundItem) : -1
    if (index !== -1) {
      const newCurrentSnapshot = snapshotsHistory[index - 1 > 0 ? index - 1 : 0]
      await _unbuildRequest(newCurrentSnapshot)
    }
  }

  const _onRedo = async () => {
    const foundItem = snapshotsHistory.find(
      (snapshotsHistory: CohortCreationSnapshotType) => snapshotsHistory.uuid === currentSnapshot
    )
    const index = foundItem ? snapshotsHistory.indexOf(foundItem) : -1
    if (index !== -1) {
      const newCurrentSnapshot =
        snapshotsHistory[index <= snapshotsHistory.length ? index + 1 : snapshotsHistory.length - 1]
      await _unbuildRequest(newCurrentSnapshot)
    }
  }

  const _canUndo: () => boolean = () => {
    const foundItem = snapshotsHistory
      ? snapshotsHistory.find(
          (snapshotsHistory: CohortCreationSnapshotType) => snapshotsHistory.uuid === currentSnapshot
        )
      : null
    const index = foundItem ? snapshotsHistory.indexOf(foundItem) : -1
    return index !== 0 && index !== -1
  }

  const _canRedo: () => boolean = () => {
    const foundItem = snapshotsHistory.find(
      (snapshotsHistory: CohortCreationSnapshotType) => snapshotsHistory.uuid === currentSnapshot
    )
    const index = foundItem ? snapshotsHistory.indexOf(foundItem) : -1
    return index !== snapshotsHistory.length - 1 && index !== -1
  }

  const _canExecute: () => boolean = () => {
    if (!json || !count?.uuid || !currentSnapshot || !requestId) {
      return false
    }
    return true
  }

  // Initial useEffect
  useEffect(() => {
    _fetchCriteria()
  }, [_fetchCriteria])

  if (loading) return <CircularProgress />

  return (
    <>
      <DiagramView />

      <ControlPanel
        onExecute={_canExecute() ? _onExecute : undefined}
        onUndo={_canUndo() ? _onUndo : undefined}
        onRedo={_canRedo() ? _onRedo : undefined}
      />
    </>
  )
}

export default Requeteur
