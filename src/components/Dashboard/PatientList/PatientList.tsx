import React, { useState, useEffect, useRef } from 'react'
import moment from 'moment'

import Grid from '@mui/material/Grid'

import PatientFilters from 'components/Filters/PatientFilters/PatientFilters'
import DataTablePatient from 'components/DataTable/DataTablePatient'
import DataTableTopBar from 'components/DataTable/DataTableTopBar'

import { ReactComponent as FilterList } from 'assets/icones/filter.svg'

import MasterChips from 'components/MasterChips/MasterChips'

import PatientCharts from './components/PatientCharts'

import services from 'services/aphp'
import {
  AgeRepartitionType,
  CohortPatient,
  GenderRepartitionType,
  Order,
  PatientFilters as PatientFiltersType,
  SearchByTypes,
  SimpleChartDataType,
  DTTB_ResultsType as ResultsType
} from 'types'

import { getGenderRepartitionSimpleData } from 'utils/graphUtils'
import { buildPatientFiltersChips } from 'utils/chips'
import { substructAgeString } from 'utils/age'
import { useDebounce } from 'utils/debounce'
import { _cancelPendingRequest } from 'utils/abortController'

type PatientListProps = {
  total: number
  groupId?: string
  deidentified?: boolean | null
  patients?: CohortPatient[]
  loading?: boolean
  agePyramidData?: AgeRepartitionType
  genderRepartitionMap?: GenderRepartitionType
}

const PatientList: React.FC<PatientListProps> = ({
  groupId,
  total,
  deidentified,
  patients,
  agePyramidData,
  genderRepartitionMap
}) => {
  const [page, setPage] = useState(1)
  const [patientsResult, setPatientsResult] = useState<ResultsType>({ nb: 0, total, label: 'patient(s)' })
  const [patientsList, setPatientsList] = useState(patients)
  const [loadingStatus, setLoadingStatus] = useState(false)
  const [searchInput, setSearchInput] = useState('')
  const [searchBy, setSearchBy] = useState<SearchByTypes>(SearchByTypes.text)
  const [agePyramid, setAgePyramid] = useState<AgeRepartitionType | undefined>(agePyramidData)
  const [patientData, setPatientData] = useState<
    { vitalStatusData?: SimpleChartDataType[]; genderData?: SimpleChartDataType[] } | undefined
  >(getGenderRepartitionSimpleData(genderRepartitionMap))
  const debouncedSearchInput = useDebounce(500, searchInput)

  const [open, setOpen] = useState(false)
  const [filters, setFilters] = useState<PatientFiltersType>({
    gender: [],
    birthdatesRanges: ['', ''],
    vitalStatus: []
  })

  const [order, setOrder] = useState<Order>({
    orderBy: 'family',
    orderDirection: 'asc'
  })

  const controllerRef = useRef<AbortController | null>(null)

  const fetchPatients = async () => {
    const includeFacets = page === 1
    const birthdates: [string, string] = [
      moment(substructAgeString(filters.birthdatesRanges[0])).format('MM/DD/YYYY'),
      moment(substructAgeString(filters.birthdatesRanges[1])).format('MM/DD/YYYY')
    ]

    try {
      const result = await services.cohorts.fetchPatientList(
        page,
        searchBy,
        debouncedSearchInput,
        filters.gender,
        birthdates,
        filters.vitalStatus,
        order.orderBy,
        order.orderDirection,
        deidentified ?? true,
        groupId,
        includeFacets,
        controllerRef.current?.signal
      )
      if (result) {
        const { totalPatients, originalPatients, genderRepartitionMap, agePyramidData } = result
        setPatientsList(originalPatients)
        if (includeFacets) {
          setPatientData(getGenderRepartitionSimpleData(genderRepartitionMap))
          setAgePyramid(agePyramidData)
        }
        setPatientsResult((ps) => ({ ...ps, nb: totalPatients }))
      }
    } catch (e) {
      console.error('Error while fetching patients list')
    } finally {
      setLoadingStatus(false)
    }
  }

  const onChangeOptions = (key: string, value: any) => {
    setFilters((prevState) => ({
      ...prevState,
      [key]: value
    }))
  }

  const onSearch = (newSearchInput: string, newSearchBy: SearchByTypes) => {
    setSearchInput(newSearchInput)
    setSearchBy(newSearchBy)
  }

  const handleDeleteChip = <S extends string, T>(filterName: S, value?: T) => {
    switch (filterName) {
      case 'gender':
        setFilters((prevFilters) => ({
          ...prevFilters,
          gender: [...prevFilters.gender.filter((elem) => elem !== value)]
        }))
        break
      case 'birthdates':
        onChangeOptions(filterName, ['', ''])
        break
      case 'vitalStatus':
        setFilters((prevFilters) => ({
          ...prevFilters,
          vitalStatus: [...prevFilters.vitalStatus.filter((elem) => elem !== value)]
        }))
        break
    }
  }
  useEffect(() => {
    setLoadingStatus(true)
    setPage(1)
  }, [filters, order, searchBy, debouncedSearchInput])

  useEffect(() => {
    setLoadingStatus(true)
  }, [page])

  useEffect(() => {
    if (loadingStatus) {
      controllerRef.current = _cancelPendingRequest(controllerRef.current)
      fetchPatients()
    }
  }, [loadingStatus])

  return (
    <Grid container direction="column" alignItems="center">
      <PatientCharts
        agePyramid={loadingStatus ? undefined : agePyramid}
        patientData={loadingStatus ? undefined : patientData}
      />

      <DataTableTopBar
        loading={loadingStatus}
        results={patientsResult}
        searchBar={
          deidentified
            ? undefined
            : {
                type: 'patient',
                value: searchInput,
                searchBy: searchBy,
                onSearch: onSearch
              }
        }
        buttons={[
          {
            label: 'Filtrer',
            icon: <FilterList height="15px" fill="#FFF" />,
            onClick: () => setOpen(true)
          }
        ]}
      />

      <MasterChips chips={buildPatientFiltersChips(filters, handleDeleteChip)} />

      <DataTablePatient
        loading={loadingStatus}
        groupId={groupId}
        deidentified={deidentified ?? false}
        patientsList={patientsList ?? []}
        order={order}
        setOrder={setOrder}
        page={page}
        setPage={(newPage) => setPage(newPage)}
        total={patientsResult.nb}
      />

      {open && (
        <PatientFilters
          onClose={() => setOpen(false)}
          onSubmit={() => setOpen(false)}
          filters={filters}
          onChangeFilters={setFilters}
        />
      )}
    </Grid>
  )
}

export default PatientList
