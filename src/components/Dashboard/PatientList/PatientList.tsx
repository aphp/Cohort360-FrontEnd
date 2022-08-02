import React, { useState, useEffect } from 'react'
import moment from 'moment'

import { CssBaseline, Grid } from '@material-ui/core'

import PatientFilters from 'components/Filters/PatientFilters/PatientFilters'
import DataTablePatient from 'components/DataTable/DataTablePatient'
import DataTableTopBar from 'components/DataTable/DataTableTopBar'

import { ReactComponent as FilterList } from 'assets/icones/filter.svg'

import MasterChips from 'components/MasterChips/MasterChips'

import PatientCharts from './components/PatientCharts'

import services from 'services'
import { PatientGenderKind } from '@ahryman40k/ts-fhir-types/lib/R4'
import {
  AgeRepartitionType,
  CohortPatient,
  GenderRepartitionType,
  Order,
  PatientFilters as PatientFiltersType,
  SearchByTypes,
  SimpleChartDataType,
  VitalStatus,
  DTTB_ResultsType as ResultsType
} from 'types'

import { getGenderRepartitionSimpleData } from 'utils/graphUtils'
import { buildPatientFiltersChips } from 'utils/chips'

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
  const [agePyramid, setAgePyramid] = useState<AgeRepartitionType | undefined>(undefined)

  const [patientData, setPatientData] = useState<
    { vitalStatusData?: SimpleChartDataType[]; genderData?: SimpleChartDataType[] } | undefined
  >(undefined)
  const [open, setOpen] = useState(false)

  const [filters, setFilters] = useState<PatientFiltersType>({
    gender: PatientGenderKind._unknown,
    birthdates: [moment().subtract(130, 'years').format('YYYY-MM-DD'), moment().format('YYYY-MM-DD')],
    vitalStatus: VitalStatus.all
  })

  const [order, setOrder] = useState<Order>({
    orderBy: 'given',
    orderDirection: 'asc'
  })

  useEffect(() => {
    setAgePyramid(agePyramidData)
  }, [agePyramidData])

  useEffect(() => {
    setPatientData(getGenderRepartitionSimpleData(genderRepartitionMap))
  }, [genderRepartitionMap])

  useEffect(() => {
    setPatientsList(patients)
  }, [patients])

  const fetchPatients = async (
    pageValue = 1,
    includeFacets: boolean,
    inputSearch = searchInput,
    _searchBy = searchBy
  ) => {
    setLoadingStatus(true)
    // Set loader on chart
    if (includeFacets) {
      setPatientData(undefined)
      setAgePyramid(undefined)
    }
    // Set search state
    if (inputSearch !== searchInput) setSearchInput(inputSearch)
    if (_searchBy !== searchBy) setSearchBy(_searchBy)

    const result = await services.cohorts.fetchPatientList(
      pageValue,
      _searchBy,
      inputSearch,
      filters.gender,
      filters.birthdates,
      filters.vitalStatus,
      order.orderBy,
      order.orderDirection,
      deidentified ?? true,
      groupId,
      includeFacets
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
    setLoadingStatus(false)
  }

  const onSearchPatient = (inputSearch?: string, searchBy?: SearchByTypes) => {
    setPage(1)
    fetchPatients(1, true, inputSearch, searchBy)
  }

  useEffect(() => {
    onSearchPatient()
  }, [filters, order, searchBy]) // eslint-disable-line

  const handleChangePage = (value?: number) => {
    setPage(value ?? 1)
    //We only fetch patients if we don't already have them
    if (patients && patients.length < patientsResult.nb) {
      fetchPatients(value ?? 1, false)
    }
  }

  const handleDeleteChip = (filterName: string) => {
    switch (filterName) {
      case 'gender':
        setFilters((prevFilters) => ({
          ...prevFilters,
          gender: PatientGenderKind._unknown
        }))
        break
      case 'birthdates':
        setFilters((prevFilters) => ({
          ...prevFilters,
          birthdates: [moment().subtract(130, 'years').format('YYYY-MM-DD'), moment().format('YYYY-MM-DD')]
        }))
        break
      case 'vitalStatus':
        setFilters((prevFilters) => ({
          ...prevFilters,
          vitalStatus: VitalStatus.all
        }))
        break
    }
  }

  return (
    <Grid container direction="column" alignItems="center">
      <CssBaseline />
      <Grid container item xs={11} justifyContent="space-between">
        <PatientCharts agePyramid={agePyramid} patientData={patientData} />

        {/* <Grid id="patient-data-grid" container item justifyContent="flex-end" className={classes.tableGrid}> */}
        <DataTableTopBar
          results={patientsResult}
          searchBar={
            deidentified
              ? undefined
              : {
                  type: 'patient',
                  value: searchInput,
                  searchBy: searchBy,
                  onSearch: (newSearchInput: string, newSearchBy?: SearchByTypes) =>
                    onSearchPatient(newSearchInput, newSearchBy)
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
          setPage={(newPage) => handleChangePage(newPage)}
          total={patientsResult.nb}
        />

        <PatientFilters
          open={open}
          onClose={() => setOpen(false)}
          onSubmit={() => setOpen(false)}
          filters={filters}
          onChangeFilters={setFilters}
        />
      </Grid>
    </Grid>
  )
}

export default PatientList
