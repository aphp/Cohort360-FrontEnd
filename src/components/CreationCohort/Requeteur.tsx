import React, { useCallback, useEffect, useState, useRef, useContext } from 'react'
import { CircularProgress } from '@mui/material'
import { useNavigate, useParams } from 'react-router-dom'

import Grid from '@mui/material/Grid'

import ControlPanel from './ControlPanel/ControlPanel'
import DiagramView from './DiagramView'
import ModalCreateNewRequest from './Modals/ModalCreateNewRequest/ModalCreateNewRequest'

import { useAppDispatch, useAppSelector } from 'state'
import { fetchRequestCohortCreation, resetCohortCreation } from 'state/cohortCreation'
import { setSelectedRequest } from 'state/request'

import { CurrentSnapshot } from 'types'

import criteriaList from './DataList_Criteria'

import { cleanNominativeCriterias, fetchCriteriasCodes } from 'utils/cohortCreation'

import useStyles from './styles'
import services from 'services/aphp'
import { setCriteriaData } from 'state/criteria'
import { AppConfig } from 'config'
import { initValueSets, updateCache } from 'state/valueSets'

const Requeteur = () => {
  const {
    loading = false,
    requestId = '',
    currentSnapshot = {} as CurrentSnapshot,
    selectedCriteria = [],
    isCriteriaNominative = false,
    criteriaGroup = [],
    selectedPopulation,
    count = {},
    json = '',
    allowSearchIpp = false
  } = useAppSelector((state) => state.cohortCreation.request || {})
  const valueSets = useAppSelector((state) => state.valueSets)
  const config = useContext(AppConfig)
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
  const [valueSetsLoading, setValueSetsLoading] = useState(true)
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

  useEffect(() => {
    if (requestId && requestId !== requestIdFromUrl && !requestIdFromUrl) {
      navigate(`/cohort/new/${requestId}`)
    }
  }, [requestIdFromUrl, requestId, navigate])

  /**
   * Fetch all criteria to display list + retrieve all data from fetcher
   */
  const _fetchCriteria = useCallback(async () => {
    if (isRendered.current) {
      setCriteriaLoading((criteriaLoading) => criteriaLoading + 1)
    }
    try {
      const criteriaCodesCache = await fetchCriteriasCodes(criteriaList(), selectedCriteria, valueSets.cache)
      dispatch(updateCache(criteriaCodesCache))

      const allowMaternityForms = selectedPopulation?.every((population) => population?.access === 'Nominatif')
      const questionnairesEnabled = config.features.questionnaires.enabled
      dispatch(
        setCriteriaData({
          config: {
            IPPList: {
              color: allowSearchIpp ? '#0063AF' : '#808080',
              disabled: !allowSearchIpp
            },
            Pregnancy: {
              color: allowMaternityForms && questionnairesEnabled ? '#0063AF' : '#808080',
              disabled: !allowMaternityForms || !questionnairesEnabled
            },
            Hospit: {
              color: allowMaternityForms && questionnairesEnabled ? '#0063AF' : '#808080',
              disabled: !allowMaternityForms || !questionnairesEnabled
            }
          }
        })
      )
    } catch (error) {
      console.error(error)
    }
    if (isRendered.current) {
      setCriteriaLoading((criteriaLoading) => criteriaLoading - 1)
    }
  }, [dispatch, selectedCriteria, allowSearchIpp, selectedPopulation])

  useEffect(() => {
    if (selectedPopulation?.some((perimeter) => perimeter?.access === 'Pseudonymisé') && isCriteriaNominative) {
      cleanNominativeCriterias(selectedCriteria, criteriaGroup, dispatch)
    }
  }, [selectedPopulation, isCriteriaNominative])

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

  // Initial useEffects

  useEffect(() => {
    ;(async () => {
      if (!valueSets.loading && !valueSets.loaded) {
        await dispatch(initValueSets(criteriaList())).unwrap()
      }
      setValueSetsLoading(false)
    })()
  }, [dispatch, valueSets])

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
    valueSetsLoading ||
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
      {(requestId || requestIdFromUrl) && <DiagramView />}

      <ControlPanel onExecute={_canExecute() ? _onExecute : undefined} />

      {!requestIdFromUrl && !requestId && (
        <ModalCreateNewRequest
          onClose={() => {
            dispatch(setSelectedRequest(null))
            navigate('/home')
          }}
        />
      )}
    </>
  )
}

export default Requeteur
