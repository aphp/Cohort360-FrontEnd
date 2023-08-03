import React, { useState, useEffect, useRef } from 'react'
import moment from 'moment'

import Grid from '@mui/material/Grid'

import DataTablePatient from 'components/DataTable/DataTablePatient'

import { ReactComponent as FilterList } from 'assets/icones/filter.svg'

import PatientCharts from './components/PatientCharts'

import services from 'services/aphp'
import {
  AgeRepartitionType,
  CohortPatient,
  Order,
  SearchByTypes,
  SimpleChartDataType,
  DTTB_ResultsType as ResultsType,
  LoadingStatus,
  PatientsFilters,
  GenderStatus,
  VitalStatus
} from 'types'

import { getGenderRepartitionSimpleData } from 'utils/graphUtils'
import { buildPatientFiltersChips } from 'utils/chips'
import { substructAgeString } from 'utils/age'
import { _cancelPendingRequest } from 'utils/abortController'
import { CanceledError } from 'axios'
import Searchbar from 'components/ui/Searchbar/Searchbar'
import Select from 'components/ui/Searchbar/Select'
import Filters from 'components/ui/Searchbar/Filters'
import Chips from 'components/ui/Chips/Chips'
import SearchInput from 'components/ui/Searchbar/SearchInput'
import DisplayDigits from 'components/ui/Display/DisplayDigits'
import { CircularProgress } from '@mui/material'

type PatientListProps = {
  total: number
  groupId?: string
  deidentified?: boolean | null
  loading?: boolean
}

const PatientList: React.FC<PatientListProps> = ({ groupId, total, deidentified }) => {
  const [page, setPage] = useState(1)
  const [patientsResult, setPatientsResult] = useState<ResultsType>({ nb: 0, total, label: 'patient(s)' })
  const [patientsList, setPatientsList] = useState<CohortPatient[]>([])
  const [loadingStatus, setLoadingStatus] = useState(LoadingStatus.FETCHING)
  const [searchInput, setSearchInput] = useState('')
  const [searchBy, setSearchBy] = useState<SearchByTypes>(SearchByTypes.text)
  const [agePyramid, setAgePyramid] = useState<AgeRepartitionType>([])
  const [patientData, setPatientData] = useState<{
    vitalStatusData?: SimpleChartDataType[]
    genderData?: SimpleChartDataType[]
  }>({})

  const [filters, setFilters] = useState<PatientsFilters>({
    gender: [],
    birthdatesRanges: ['', ''],
    vitalStatus: []
  })

  const [order, setOrder] = useState<Order>({
    orderBy: 'family',
    orderDirection: 'asc'
  })

  const searchOptions = [
    {
      id: SearchByTypes.text,
      label: 'Tous les champs'
    },
    {
      id: SearchByTypes.family,
      label: 'Nom'
    },
    {
      id: SearchByTypes.given,
      label: 'Prénom'
    },
    {
      id: SearchByTypes.identifier,
      label: 'IPP'
    }
  ]

  const controllerRef = useRef<AbortController | null>(null)

  const fetchPatients = async () => {
    try {
      const includeFacets = page === 1
      const birthdates: [string, string] = [
        moment(substructAgeString(filters?.birthdatesRanges?.[0] || '')).format('MM/DD/YYYY'),
        moment(substructAgeString(filters?.birthdatesRanges?.[1] || '')).format('MM/DD/YYYY')
      ]
      setLoadingStatus(LoadingStatus.FETCHING)
      const result = await services.cohorts.fetchPatientList(
        page,
        searchBy,
        searchInput,
        filters.gender || [GenderStatus.UNKNOWN],
        birthdates,
        filters.vitalStatus || [VitalStatus.ALL],
        order.orderBy,
        order.orderDirection,
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
    }
  }

  const handleDeleteChip = <S extends keyof PatientsFilters, T>(filterName: S, value?: T) => {
    setFilters((prevFilters: PatientsFilters) => {
      if (filterName === 'gender' && prevFilters.gender)
        return {
          ...prevFilters,
          gender: [...prevFilters.gender.filter((elem) => elem !== value)]
        }
      if (filterName === 'vitalStatus' && prevFilters.vitalStatus)
        return {
          ...prevFilters,
          vitalStatus: [...prevFilters.vitalStatus.filter((elem) => elem !== value)]
        }
      if (filterName === 'birthdatesRanges' && prevFilters.birthdatesRanges)
        return {
          ...prevFilters,
          birthdatesRanges: ['', '']
        }
      return prevFilters
    })
  }
  useEffect(() => {
    setLoadingStatus(LoadingStatus.IDDLE)
    setPage(1)
  }, [filters, order, searchBy, searchInput])

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
      <Grid item xs={12}>
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
              selectedValue={searchBy}
              label="Rechercher dans :"
              width={'25%'}
              items={searchOptions}
              onchange={(newValue: SearchByTypes) => setSearchBy(newValue)}
            />
            <SearchInput
              value={searchInput}
              placeholder="Rechercher"
              width={'50%'}
              onchange={(newValue) => setSearchInput(newValue)}
            />
            <Filters
              label="Filtrer"
              filters={filters}
              width={'25%'}
              icon={<FilterList height="15px" fill="#FFF" />}
              onChange={setFilters}
            />
          </Grid>
        </Searchbar>
      </Grid>

      <Grid item xs={12}>
        <Chips chips={buildPatientFiltersChips(filters, handleDeleteChip)} />
      </Grid>

      <Grid item xs={12}>
        <DataTablePatient
          loading={loadingStatus === LoadingStatus.FETCHING || loadingStatus === LoadingStatus.IDDLE}
          groupId={groupId}
          deidentified={deidentified ?? false}
          patientsList={patientsList ?? []}
          order={order}
          setOrder={setOrder}
          page={page}
          setPage={(newPage) => setPage(newPage)}
          total={patientsResult.nb}
        />
      </Grid>
    </Grid>
  )
}

export default PatientList
