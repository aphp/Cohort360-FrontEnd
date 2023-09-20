import React, { useEffect, useRef, useState } from 'react'
import { useAppSelector } from 'state'
import { useParams } from 'react-router'

import { Grid, Typography } from '@mui/material'

import DataTablePatient from 'components/DataTable/DataTablePatient'

import services from 'services/aphp'

import { Patient } from 'fhir/r4'
import { _cancelPendingRequest } from 'utils/abortController'
import { ActionTypes, SearchByTypes, searchByListPatients } from 'types/searchCriterias'
import { BlockWrapper } from 'components/ui/Layout/styles'
import Searchbar from 'components/ui/Searchbar/Searchbar'
import { DTTB_ResultsType as ResultsType, LoadingStatus } from 'types'
import Select from 'components/ui/Searchbar/Select'
import SearchInput from 'components/ui/Searchbar/SearchInput'
import useSearchCriterias from 'hooks/useSearchCriterias'
import { initPatientsSearchCriterias } from 'hooks/useSearchCriterias'
import { CanceledError } from 'axios'
import useStyles from './styles'

const SearchPatient: React.FC<{}> = () => {
  const { classes, cx } = useStyles()
  const practitioner = useAppSelector((state) => state.me)
  const { search } = useParams<{ search: string }>()

  const [loadingStatus, setLoadingStatus] = useState(LoadingStatus.FETCHING)
  const [patientsList, setPatientsList] = useState<Patient[]>([])
  const [patientsResult, setPatientsResult] = useState<ResultsType>({ nb: 0, total: 0, label: 'patient(s)' })

  const [page, setPage] = useState(1)

  const [{ orderBy, searchBy, searchInput }, dispatch] = useSearchCriterias(initPatientsSearchCriterias)

  const controllerRef = useRef<AbortController | null>(null)

  const nominativeGroupsIds =
    practitioner && practitioner.nominativeGroupsIds ? practitioner.nominativeGroupsIds.join() : ''

  const fetchPatients = async () => {
    try {
      setLoadingStatus(LoadingStatus.FETCHING)
      const result = await services.cohorts.fetchPatientList(
        {
          page,
          searchCriterias: { orderBy, searchInput, searchBy, filters: null }
        },
        false,
        nominativeGroupsIds,
        false,
        controllerRef.current?.signal
      )

      if (result) {
        const { totalPatients, originalPatients } = result
        if (originalPatients) setPatientsList(originalPatients)
        setPatientsResult((ps) => ({ ...ps, nb: totalPatients, label: 'patient(s)' }))
      }
      setLoadingStatus(LoadingStatus.SUCCESS)
    } catch (error) {
      if (error instanceof CanceledError) {
        setLoadingStatus(LoadingStatus.FETCHING)
      }
    }
  }

  useEffect(() => {
    if (search) {
      dispatch({ type: ActionTypes.CHANGE_SEARCH_INPUT, payload: search })
    }
  }, [])

  useEffect(() => {
    setLoadingStatus(LoadingStatus.IDDLE)
    setPage(1)
  }, [orderBy, searchBy, searchInput])

  useEffect(() => {
    setLoadingStatus(LoadingStatus.IDDLE)
  }, [page])

  useEffect(() => {
    if (loadingStatus === LoadingStatus.IDDLE) {
      controllerRef.current = _cancelPendingRequest(controllerRef.current)
      fetchPatients()
    }
  }, [loadingStatus])

  const open = useAppSelector((state) => state.drawer)

  return (
    <Grid container direction="column" className={cx(classes.appBar, { [classes.appBarShift]: open })}>
      <Grid container justifyContent="center" alignItems="center">
        <BlockWrapper item xs={11} margin={'20px 0px 10px 0px'}>
          <Typography variant="h1" color="primary" className={classes.title}>
            Rechercher un patient
          </Typography>
          <Searchbar>
            <Grid container item xs={12} justifyContent="flex-end">
              <Select
                selectedValue={searchBy || SearchByTypes.TEXT}
                label="Rechercher dans :"
                width={'20%'}
                items={searchByListPatients}
                onchange={(newValue: SearchByTypes) =>
                  dispatch({ type: ActionTypes.CHANGE_SEARCH_BY, payload: newValue })
                }
              />
              <SearchInput
                value={searchInput}
                placeholder="Rechercher"
                onchange={(newValue) => dispatch({ type: ActionTypes.CHANGE_SEARCH_INPUT, payload: newValue })}
              />
            </Grid>
          </Searchbar>
        </BlockWrapper>
        <Grid item xs={11}>
          <DataTablePatient
            loading={loadingStatus === LoadingStatus.FETCHING || loadingStatus === LoadingStatus.IDDLE}
            groupId={nominativeGroupsIds}
            deidentified={false}
            patientsList={patientsList}
            orderBy={orderBy}
            setOrderBy={(orderBy) => dispatch({ type: ActionTypes.CHANGE_ORDER_BY, payload: orderBy })}
            page={page}
            setPage={(newPage) => setPage(newPage)}
            total={patientsResult.nb}
          />
        </Grid>
      </Grid>
    </Grid>
  )
}

export default SearchPatient
