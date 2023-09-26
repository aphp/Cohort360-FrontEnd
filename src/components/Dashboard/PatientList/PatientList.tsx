import React, { useState, useEffect, useRef, useMemo } from 'react'
import moment from 'moment'

import { CircularProgress, Grid } from '@mui/material'

import DataTablePatient from 'components/DataTable/DataTablePatient'

import { ReactComponent as FilterList } from 'assets/icones/filter.svg'

import PatientCharts from './components/PatientCharts'

import services from 'services/aphp'
import {
  AgeRepartitionType,
  CohortPatient,
  SimpleChartDataType,
  DTTB_ResultsType as ResultsType,
  LoadingStatus
} from 'types'

import { getGenderRepartitionSimpleData } from 'utils/graphUtils'
import { substructAgeString } from 'utils/age'
import { _cancelPendingRequest } from 'utils/abortController'
import { CanceledError } from 'axios'
import Searchbar from 'components/ui/Searchbar/Searchbar'
import Select from 'components/ui/Searchbar/Select'
import SearchInput from 'components/ui/Searchbar/SearchInput'
import DisplayDigits from 'components/ui/Display/DisplayDigits'
import { ActionTypes, FilterKeys, searchByListPatients, SearchByTypes } from 'types/searchCriterias'
import Chip from 'components/ui/Chips/Chip'
import Button from 'components/ui/Button/Button'
import Modal from 'components/ui/Modal/Modal'
import useSearchCriterias, { initPatientsSearchCriterias } from 'hooks/useSearchCriterias'
import { selectFiltersAsArray } from 'utils/filters'
import GendersFilter from 'components/Filters/GendersFilter/GenderFilter'
import VitalStatusesFilter from 'components/Filters/VitalStatusesFilter/VitalStatusesFilter'
import BirthdatesRangesFilter from 'components/Filters/BirthdatesRangesFilters/BirthdatesRangesFilter'
import { BlockWrapper } from 'components/ui/Layout/styles'

type PatientListProps = {
  total: number
  groupId?: string
  deidentified?: boolean | null
  loading?: boolean
}

const PatientList: React.FC<PatientListProps> = ({ groupId, total, deidentified }) => {
  const [toggleModal, setToggleModal] = useState(false)
  const [page, setPage] = useState(1)
  const [patientsResult, setPatientsResult] = useState<ResultsType>({ nb: 0, total, label: 'patient(s)' })
  const [patientsList, setPatientsList] = useState<CohortPatient[]>([])

  const [loadingStatus, setLoadingStatus] = useState(LoadingStatus.FETCHING)
  const [agePyramid, setAgePyramid] = useState<AgeRepartitionType>([])
  const [patientData, setPatientData] = useState<{
    vitalStatusData?: SimpleChartDataType[]
    genderData?: SimpleChartDataType[]
  }>({})

  const [
    {
      orderBy,
      searchBy,
      searchInput,
      filters: { genders, birthdatesRanges, vitalStatuses }
    },
    dispatch
  ] = useSearchCriterias(initPatientsSearchCriterias)

  const filtersAsArray = useMemo(() => {
    return selectFiltersAsArray({ genders, vitalStatuses, birthdatesRanges })
  }, [genders, vitalStatuses, birthdatesRanges])

  const controllerRef = useRef<AbortController | null>(null)

  const fetchPatients = async () => {
    try {
      const includeFacets = page === 1
      const birthdates: [string, string] = [
        moment(substructAgeString(birthdatesRanges?.[0] || '')).format('MM/DD/YYYY'),
        moment(substructAgeString(birthdatesRanges?.[1] || '')).format('MM/DD/YYYY')
      ]
      setLoadingStatus(LoadingStatus.FETCHING)
      const result = await services.cohorts.fetchPatientList(
        {
          page,
          searchCriterias: {
            orderBy,
            searchInput,
            searchBy,
            filters: { genders, vitalStatuses, birthdatesRanges: birthdates }
          }
        },
        deidentified ?? true,
        groupId,
        includeFacets,
        controllerRef.current?.signal
      )
      if (result) {
        const { totalPatients, originalPatients, genderRepartitionMap, agePyramidData } = result
        if (originalPatients) setPatientsList(originalPatients)
        if (includeFacets) {
          if (genderRepartitionMap) setPatientData(getGenderRepartitionSimpleData(genderRepartitionMap))
          if (agePyramidData) setAgePyramid(agePyramidData)
        }
        setPatientsResult((ps) => ({ ...ps, nb: totalPatients, label: 'patient(s)' }))
      }
      setLoadingStatus(LoadingStatus.SUCCESS)
    } catch (error) {
      if (error instanceof CanceledError) {
        setLoadingStatus(LoadingStatus.FETCHING)
      }
      setLoadingStatus(LoadingStatus.SUCCESS)
    }
  }

  useEffect(() => {
    setLoadingStatus(LoadingStatus.IDDLE)
    setPage(1)
  }, [genders, vitalStatuses, birthdatesRanges, orderBy, searchBy, searchInput])

  useEffect(() => {
    setLoadingStatus(LoadingStatus.IDDLE)
  }, [page])

  useEffect(() => {
    if (loadingStatus === LoadingStatus.IDDLE) {
      controllerRef.current = _cancelPendingRequest(controllerRef.current)
      fetchPatients()
    }
  }, [loadingStatus])

  return (
    <Grid container>
      <Grid item xs={12}>
        <PatientCharts
          agePyramid={
            loadingStatus === LoadingStatus.FETCHING || loadingStatus === LoadingStatus.IDDLE ? [] : agePyramid
          }
          patientData={
            loadingStatus === LoadingStatus.FETCHING || loadingStatus === LoadingStatus.IDDLE ? {} : patientData
          }
          loading={loadingStatus === LoadingStatus.FETCHING || loadingStatus === LoadingStatus.IDDLE}
        />
      </Grid>
      <BlockWrapper item xs={12} margin={'20px 0px 10px 0px'}>
        <Searchbar>
          <Grid item xs={12} lg={3}>
            {(loadingStatus === LoadingStatus.FETCHING || loadingStatus === LoadingStatus.IDDLE) && (
              <CircularProgress />
            )}
            {loadingStatus !== LoadingStatus.FETCHING && loadingStatus !== LoadingStatus.IDDLE && (
              <DisplayDigits
                nb={patientsResult.nb}
                total={patientsResult.total}
                label={patientsResult.label as string}
              />
            )}
          </Grid>
          <Grid container item xs={12} lg={9} justifyContent="flex-end" style={{ maxWidth: 900 }}>
            <Select
              selectedValue={searchBy || SearchByTypes.TEXT}
              label="Rechercher dans :"
              width={'25%'}
              items={searchByListPatients}
              onchange={(newValue: SearchByTypes) =>
                dispatch({ type: ActionTypes.CHANGE_SEARCH_BY, payload: newValue })
              }
            />
            <SearchInput
              value={searchInput}
              placeholder="Rechercher"
              width={'50%'}
              onchange={(newValue) => dispatch({ type: ActionTypes.CHANGE_SEARCH_INPUT, payload: newValue })}
            />
            <Button width={'25%'} icon={<FilterList height="15px" fill="#FFF" />} onClick={() => setToggleModal(true)}>
              Filtrer
            </Button>

            <Modal
              title="Filtrer les patients"
              open={toggleModal}
              onClose={() => setToggleModal(false)}
              onSubmit={(newFilters) => {
                dispatch({
                  type: ActionTypes.ADD_FILTERS,
                  payload: { genders, birthdatesRanges, vitalStatuses, ...newFilters }
                })
              }}
            >
              <GendersFilter name={FilterKeys.GENDERS} value={genders} />
              <VitalStatusesFilter name={FilterKeys.VITAL_STATUSES} value={vitalStatuses} />
              <BirthdatesRangesFilter name={FilterKeys.BIRTHDATES} value={birthdatesRanges} />
            </Modal>
          </Grid>
        </Searchbar>
      </BlockWrapper>
      <Grid item xs={12}>
        {filtersAsArray.map((filter, index) => (
          <Chip
            key={index}
            label={filter.label}
            onDelete={() => {
              dispatch({ type: ActionTypes.REMOVE_FILTER, payload: { key: filter.category, value: filter.value } })
            }}
          />
        ))}
      </Grid>
      <Grid item xs={12}>
        <DataTablePatient
          loading={loadingStatus === LoadingStatus.FETCHING || loadingStatus === LoadingStatus.IDDLE}
          groupId={groupId}
          deidentified={deidentified ?? false}
          patientsList={patientsList ?? []}
          orderBy={orderBy}
          setOrderBy={(orderBy) => dispatch({ type: ActionTypes.CHANGE_ORDER_BY, payload: orderBy })}
          page={page}
          setPage={(newPage) => setPage(newPage)}
          total={patientsResult.nb}
        />
      </Grid>
    </Grid>
  )
}

export default PatientList
