import React, { useCallback, useEffect, useState, useRef } from 'react'
import { CircularProgress } from '@mui/material'
import { useNavigate, useParams } from 'react-router-dom'

import Grid from '@mui/material/Grid'

import ControlPanel from './ControlPanel/ControlPanel'
import DiagramView from './DiagramView/DiagramView'
import ModalCreateNewRequest from './Modals/ModalCreateNewRequest/ModalCreateNewRequest'

import { useAppDispatch, useAppSelector } from 'state'
import { fetchRequestCohortCreation, resetCohortCreation, unbuildCohortCreation } from 'state/cohortCreation'
import { setCriteriaList } from 'state/criteria'

import { CurrentSnapshot } from 'types'

import constructCriteriaList from './DataList_Criteria'

import { getDataFromFetch } from 'utils/cohortCreation'

import useStyles from './styles'
import services from 'services/aphp'

const Requeteur = () => {
  const {
    request: {
      loading = false,
      requestId = '',
      currentSnapshot = {} as CurrentSnapshot,
      navHistory,
      selectedCriteria = [],
      criteriaGroup = [],
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

  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { classes } = useStyles()

  const [requestLoading, setRequestLoading] = useState(0)
  const [criteriaLoading, setCriteriaLoading] = useState(0)
  let _criteria = constructCriteriaList()
  const isRendered = useRef<boolean>(false)

  const _fetchRequest = useCallback(async () => {
    setRequestLoading((requestLoading) => requestLoading + 1)
    try {
      if (requestIdFromUrl) {
        dispatch(resetCohortCreation())
        dispatch(
          fetchRequestCohortCreation({
            requestId: requestIdFromUrl,
            snapshotId: snapshotIdFromUrl
          })
        )
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
    if (isRendered.current) {
      setCriteriaLoading((criteriaLoading) => criteriaLoading + 1)
    }
    try {
      _criteria.forEach((criterion) => {
        if (criterion.id === 'IPPList') {
          criterion.color = allowSearchIpp ? '#0063AF' : '#808080'
          criterion.disabled = !allowSearchIpp
        }
      })

      _criteria = await getDataFromFetch(Object.freeze(_criteria), selectedCriteria, criteriaList)
      dispatch(setCriteriaList(_criteria))
    } catch (error) {
      console.error(error)
    }
    if (isRendered.current) {
      setCriteriaLoading((criteriaLoading) => criteriaLoading - 1)
    }
  }, [dispatch, criteriaGroup, selectedCriteria, selectedPopulation]) // eslint-disable-line

  const _unbuildRequest = async (newCurrentSnapshot: CurrentSnapshot) => {
    dispatch(unbuildCohortCreation({ newCurrentSnapshot }))
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
        currentSnapshot?.uuid,
        requestId,
        cohortName,
        cohortDescription,
        globalCount
      )

      if (createCohortResult && createCohortResult.status === 201) {
        dispatch(resetCohortCreation())
        navigate(`/home`)
      }
    }

    _createCohort()
  }

  const _onUndo = async () => {
    const newCurrentSnapshot = navHistory[currentSnapshot.navHistoryIndex - 1]
    await _unbuildRequest(newCurrentSnapshot)
  }

  const _onRedo = async () => {
    const newCurrentSnapshot = navHistory[currentSnapshot.navHistoryIndex + 1]
    await _unbuildRequest(newCurrentSnapshot)
  }

  const _canUndo: () => boolean = () => {
    return !!navHistory[currentSnapshot.navHistoryIndex - 1]
  }

  const _canRedo: () => boolean = () => {
    return !!navHistory[currentSnapshot.navHistoryIndex + 1]
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
    isRendered.current = true
    _fetchCriteria()
    return () => {
      isRendered.current = false
    }
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
