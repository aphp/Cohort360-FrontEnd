import React, { useCallback, useEffect, useState } from 'react'
import { CircularProgress } from '@material-ui/core'
import { useHistory, useParams } from 'react-router-dom'
import { useDispatch } from 'react-redux'

import Grid from '@material-ui/core/Grid'

import ControlPanel from './ControlPanel/ControlPanel'
import DiagramView from './DiagramView/DiagramView'
import ModalCreateNewRequest from './Modals/ModalCreateNewRequest/ModalCreateNewRequest'

import { useAppSelector } from 'state'
import { setCriteriaList } from 'state/criteria'
import { fetchRequestCohortCreation, unbuildCohortCreation, resetCohortCreation } from 'state/cohortCreation'
import { setSelectedRequest } from 'state/request'

import { CohortCreationSnapshotType } from 'types'

import constructCriteriaList from './DataList_Criteria'

import { getDataFromFetch } from 'utils/cohortCreation'
import { createCohort } from 'services/cohortCreation'

import useStyles from './styles'

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

  const params = useParams<{
    requestId: string
    snapshotId: string
  }>()

  const requestIdFromUrl = params.requestId
  const snapshotIdFromUrl = params.snapshotId

  const history = useHistory()
  const dispatch = useDispatch()
  const classes = useStyles()

  const [requestLoading, setRequestLoading] = useState(true)
  const [criteriaLoading, setCriteriaLoading] = useState(true)

  const _fetchRequest = useCallback(async () => {
    setRequestLoading(true)
    if (requestIdFromUrl) {
      dispatch<any>(resetCohortCreation())
      dispatch<any>(
        fetchRequestCohortCreation({
          requestId: requestIdFromUrl,
          snapshotId: snapshotIdFromUrl
        })
      )
      history.replace('/cohort/new')
    } else if (!requestIdFromUrl && !requestId) {
      dispatch<any>(setSelectedRequest({ uuid: '', name: '' }))
    }
    setRequestLoading(false)
  }, [dispatch, requestIdFromUrl, snapshotIdFromUrl])

  /**
   * Fetch all criteria to display list + retrieve all data from fetcher
   */
  const _fetchCriteria = useCallback(async () => {
    setCriteriaLoading(true)
    let _criteria = constructCriteriaList()
    _criteria = await getDataFromFetch(Object.freeze(_criteria), selectedCriteria)
    dispatch<any>(setCriteriaList(_criteria))
    setCriteriaLoading(false)
  }, [dispatch, criteriaGroup, selectedCriteria]) // eslint-disable-line

  const _unbuildRequest = async (newCurrentSnapshot: CohortCreationSnapshotType) => {
    dispatch<any>(unbuildCohortCreation({ newCurrentSnapshot }))
  }

  /**
   * Execute query:
   *  - Create it with `createCohort`
   *  - Link fhir result with the back end, call /cohorts/
   */
  const _onExecute = (cohortName: string, cohortDescription: string, globalCount: boolean) => {
    const _createCohort = async () => {
      if (!json) return

      const createCohortResult = await createCohort(
        json,
        count?.uuid,
        currentSnapshot,
        requestId,
        cohortName,
        cohortDescription,
        globalCount
      )

      if (createCohortResult && createCohortResult.status === 201) {
        dispatch<any>(resetCohortCreation())
        history.push(`/accueil`)
      } else {
        console.log('createCohortResult :>> ', createCohortResult)
      }
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
    if (
      !json ||
      !count?.uuid ||
      count.status === 'failed' ||
      count.status === 'error' ||
      !currentSnapshot ||
      !requestId
    ) {
      return false
    }
    return true
  }

  // Initial useEffect
  useEffect(() => {
    _fetchCriteria()
  }, [_fetchCriteria])

  useEffect(() => {
    _fetchRequest()
  }, [_fetchRequest])

  if (loading || criteriaLoading || requestLoading || (requestIdFromUrl && requestId !== requestIdFromUrl)) {
    return (
      <Grid className={classes.grid} container justify="center" alignItems="center">
        <CircularProgress />
      </Grid>
    )
  }

  return (
    <>
      <DiagramView />

      <ControlPanel
        onExecute={_canExecute() ? _onExecute : undefined}
        onUndo={_canUndo() ? _onUndo : undefined}
        onRedo={_canRedo() ? _onRedo : undefined}
      />

      {!requestIdFromUrl && !requestId && <ModalCreateNewRequest />}
    </>
  )
}

export default Requeteur
