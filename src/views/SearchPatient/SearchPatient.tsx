import React, { useEffect, useRef, useState } from 'react'
import { useAppSelector } from 'state'
import { useNavigate, useParams } from 'react-router'

import { Grid, Typography } from '@mui/material'

import DataTablePatient from 'components/DataTable/DataTablePatient'

import services from 'services/aphp'

import useStyles from './styles'
import { Patient } from 'fhir/r4'
import { cancelPendingRequest } from 'utils/abortController'
import { SearchByTypes, searchByListPatients } from 'types/searchCriterias'
import { BlockWrapper } from 'components/ui/Layout'
import Searchbar from 'components/ui/Searchbar'
import { DTTB_ResultsType as ResultsType, LoadingStatus } from 'types'
import Select from 'components/ui/Searchbar/Select'
import SearchInput from 'components/ui/Searchbar/SearchInput'
import { CanceledError } from 'axios'
import useSearchCriterias, { initPatientsSearchCriterias } from 'reducers/searchCriteriasReducer'

const SearchPatient: React.FC<{}> = () => {
  const { classes, cx } = useStyles()
  const practitioner = useAppSelector((state) => state.me)
  const { search } = useParams<{ search: string }>()
  const navigate = useNavigate()

  const [loadingStatus, setLoadingStatus] = useState(LoadingStatus.FETCHING)
  const [patientsList, setPatientsList] = useState<Patient[]>([])
  const [patientsResult, setPatientsResult] = useState<ResultsType>({ nb: 0, total: 0 })

  const [page, setPage] = useState(1)

  const [{ orderBy, searchBy, searchInput }, { changeOrderBy, changeSearchBy, changeSearchInput }] =
    useSearchCriterias(initPatientsSearchCriterias)

  const controllerRef = useRef<AbortController | null>(null)

  const nominativeGroupsIds = practitioner?.nominativeGroupsIds ? practitioner.nominativeGroupsIds.join() : ''

  const deidentified = useAppSelector((state) => state.me?.deidentified)
  const open = useAppSelector((state) => state.drawer)

  const fetchPatients = async () => {
    try {
      const deidentified = false
      const includeFacets = false

      setLoadingStatus(LoadingStatus.FETCHING)
      const result = await services.cohorts.fetchPatientList(
        {
          page,
          searchCriterias: { orderBy, searchInput, searchBy, filters: null }
        },
        deidentified,
        nominativeGroupsIds,
        includeFacets,
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
      changeSearchInput(search)
    }
  }, [])

  useEffect(() => {
    if (deidentified) navigate(`/home`)
  }, [deidentified])

  useEffect(() => {
    setLoadingStatus(LoadingStatus.IDDLE)
    setPage(1)
  }, [orderBy, searchBy, searchInput])

  useEffect(() => {
    setLoadingStatus(LoadingStatus.IDDLE)
  }, [page])

  useEffect(() => {
    if (loadingStatus === LoadingStatus.IDDLE) {
      controllerRef.current = cancelPendingRequest(controllerRef.current)
      fetchPatients()
    }
  }, [loadingStatus])

  return (
    <Grid container direction="column" className={cx(classes.appBar, { [classes.appBarShift]: open })}>
      <Grid container justifyContent="center" alignItems="center">
        <BlockWrapper item xs={11} margin={'20px 0px'}>
          <Typography variant="h1" color="primary" className={classes.title}>
            Rechercher un patient
          </Typography>
          <Searchbar>
            <Grid container item xs={12} justifyContent="flex-end">
              <Select
                value={searchBy || SearchByTypes.TEXT}
                label="Rechercher dans :"
                width={'20%'}
                items={searchByListPatients}
                onchange={(newValue) => changeSearchBy(newValue)}
              />
              <SearchInput
                value={searchInput}
                placeholder="Rechercher"
                onchange={(newValue) => changeSearchInput(newValue)}
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
            setOrderBy={(orderBy) => changeOrderBy(orderBy)}
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
