import { CircularProgress } from '@material-ui/core'
import React, { useCallback, useEffect, useState } from 'react'
import { useHistory, useParams } from 'react-router-dom'

import Grid from '@material-ui/core/Grid'

import ControlPanel from './ControlPanel/ControlPanel'
import DiagramView from './DiagramView/DiagramView'
import ModalCreateNewRequest from './Modals/ModalCreateNewRequest/ModalCreateNewRequest'

import { useAppDispatch, useAppSelector } from 'state'
import { fetchRequestCohortCreation, resetCohortCreation, unbuildCohortCreation } from 'state/cohortCreation'
import { setCriteriaList } from 'state/criteria'

import { CohortCreationSnapshotType } from 'types'

import constructCriteriaList from './DataList_Criteria'

import { getDataFromFetch } from 'utils/cohortCreation'

import useStyles from './styles'
import services from 'services'

const Requeteur = () => {
  const {
    request: {
      loading = false,
      requestId = '',
      currentSnapshot = '',
      selectedCriteria = [],
      criteriaGroup = [],
      snapshotsHistory = [],
      count = {},
      json = '',
      allowSearchIpp = false,
      selectedPopulation = []
    },
    criteriaList
  } = useAppSelector((state) => ({
    request: state.cohortCreation.request || {},
    criteriaList: state.cohortCreation.criteria || {}
  }))

  const params = useParams<{
    requestId: string
    snapshotId: string
  }>()

  const requestIdFromUrl = params.requestId
  const snapshotIdFromUrl = params.snapshotId

  const history = useHistory()
  const dispatch = useAppDispatch()
  const classes = useStyles()

  const [requestLoading, setRequestLoading] = useState(0)
  const [criteriaLoading, setCriteriaLoading] = useState(0)
  let _criteria = constructCriteriaList()

  const _fetchRequest = useCallback(async () => {
    setRequestLoading((requestLoading) => requestLoading + 1)
    try {
      if (requestIdFromUrl) {
        dispatch<any>(resetCohortCreation())
        dispatch<any>(
          fetchRequestCohortCreation({
            requestId: requestIdFromUrl,
            snapshotId: snapshotIdFromUrl
          })
        )
        history.replace('/cohort/new')
      }
    } catch (error) {
      console.error(error)
    }
    setRequestLoading((requestLoading) => requestLoading - 1)
  }, [dispatch, requestIdFromUrl, snapshotIdFromUrl])

  /**
   * Fetch all criteria to display list + retrieve all data from fetcher
   */
  const _fetchCriteria = useCallback(async () => {
    setCriteriaLoading((criteriaLoading) => criteriaLoading + 1)
    try {
      _criteria.forEach((criterion) => {
        if (criterion.id === 'IPPList') {
          criterion.color = allowSearchIpp ? '#0063AF' : '#808080'
          criterion.disabled = !allowSearchIpp
        }
      })

      _criteria = await getDataFromFetch(Object.freeze(_criteria), selectedCriteria, criteriaList)
      dispatch<any>(setCriteriaList(_criteria))
    } catch (error) {
      console.error(error)
    }
    setCriteriaLoading((criteriaLoading) => criteriaLoading - 1)
  }, [dispatch, criteriaGroup, selectedCriteria, selectedPopulation]) // eslint-disable-line

  const _unbuildRequest = async (newCurrentSnapshot: CohortCreationSnapshotType) => {
    dispatch<any>(unbuildCohortCreation({ newCurrentSnapshot }))
  }

  /**
   * Execute query:
   *  - Create it with `services.cohortCreation.createCohort`
   *  - Link fhir result with the back end, call /cohorts/
   */
  const _onExecute = (cohortName: string, cohortDescription: string, globalCount: boolean) => {
    const _createCohort = async () => {
      if (!json) return

      const createCohortResult = await services.cohortCreation.createCohort(
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
        history.push(`/home`)
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
    _fetchRequest()
  }, [_fetchRequest])

  useEffect(() => {
    _fetchCriteria()
  }, [_fetchCriteria])

  if (
    loading ||
    criteriaLoading != 0 ||
    requestLoading != 0 ||
    (!!requestIdFromUrl && requestId !== requestIdFromUrl)
  ) {
    return (
      <Grid className={classes.grid} container justifyContent="center" alignItems="center">
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
