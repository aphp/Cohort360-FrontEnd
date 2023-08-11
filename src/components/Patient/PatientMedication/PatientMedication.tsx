import React, { useEffect, useRef, useState } from 'react'

import Grid from '@mui/material/Grid'

import { ReactComponent as FilterList } from 'assets/icones/filter.svg'

import MedicationFilters from 'components/Filters/MedicationFilters/MedicationFilters'
import DataTableMedication from 'components/DataTable/DataTableMedication'
import DataTableTopBar from 'components/DataTable/DataTableTopBar'
import MasterChips from 'components/MasterChips/MasterChips'

import { LoadingStatus, MedicationsFilters, Order } from 'types'

import { useAppSelector, useAppDispatch } from 'state'
import { fetchMedication } from 'state/patient'

import { buildMedicationFiltersChips } from 'utils/chips'

import useStyles from './styles'
import { useDebounce } from 'utils/debounce'
import { cancelPendingRequest } from 'utils/abortController'
import { CanceledError } from 'axios'

type PatientMedicationTypes = {
  groupId?: string
}
const PatientMedication: React.FC<PatientMedicationTypes> = ({ groupId }) => {
  const { classes } = useStyles()
  const dispatch = useAppDispatch()
  const { patient } = useAppSelector((state) => ({
    patient: state.patient
  }))

  const [loadingStatus, setLoadingStatus] = useState(LoadingStatus.FETCHING)
  const [open, setOpen] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [filters, setFilters] = useState<MedicationsFilters & { searchInput: string }>({
    searchInput: '',
    nda: '',
    selectedPrescriptionTypes: [],
    selectedAdministrationRoutes: [],
    startDate: null,
    endDate: null,
    executiveUnits: []
  })
  const [selectedTab, selectTab] = useState<'prescription' | 'administration'>('prescription')
  const [order, setOrder] = useState<Order>({ orderBy: 'Period-start', orderDirection: 'asc' })
  const debouncedSearchValue = useDebounce(500, filters.searchInput)
  const deidentifiedBoolean = patient?.deidentified ?? false
  const totalMedication = patient?.medication?.[selectedTab]?.count ?? 0
  const totalAllMedication = patient?.medication?.[selectedTab]?.total ?? 0
  const patientMedicationList = patient?.medication?.[selectedTab]?.list ?? []

  const controllerRef = useRef<AbortController | null>(null)

  const _fetchMedication = async () => {
    try {
      setLoadingStatus(LoadingStatus.FETCHING)
      const response = await dispatch(
        fetchMedication({
          selectedTab,
          groupId,
          options: {
            page,
            sort: {
              by: order.orderBy,
              direction: order.orderDirection
            },
            filters: {
              ...filters,
              executiveUnits: filters.executiveUnits.map((executiveUnit) => executiveUnit.id)
            }
          },
          signal: controllerRef.current?.signal
        })
      )
      if (response.payload.error) {
        throw response.payload.error
      }
      setLoadingStatus(LoadingStatus.SUCCESS)
    } catch (error) {
      if (error instanceof CanceledError) {
        setLoadingStatus(LoadingStatus.FETCHING)
      } else {
        setLoadingStatus(LoadingStatus.SUCCESS)
      }
    }
  }

  const handleDeleteChip = (
    filterName:
      | 'nda'
      | 'startDate'
      | 'endDate'
      | 'selectedPrescriptionTypes'
      | 'selectedAdministrationRoutes'
      | 'executiveUnits',
    value: any
  ) => {
    switch (filterName) {
      case 'selectedAdministrationRoutes':
      case 'selectedPrescriptionTypes':
      case 'nda':
        setFilters((prevState) => ({ ...prevState, [filterName]: value }))
        break
      case 'startDate':
      case 'endDate':
        setFilters((prevState) => ({ ...prevState, [filterName]: null }))
        break
      case 'executiveUnits':
        setFilters((prevState) => ({
          ...prevState,
          executiveUnits: prevState.executiveUnits.filter((executiveUnit) => executiveUnit.name !== value)
        }))
    }
  }

  useEffect(() => {
    setLoadingStatus(LoadingStatus.IDDLE)
    setPage(1)
  }, [
    debouncedSearchValue,
    filters.nda,
    filters.startDate,
    filters.endDate,
    filters.selectedPrescriptionTypes,
    filters.selectedAdministrationRoutes,
    filters.executiveUnits,
    order.orderBy,
    order.orderDirection
  ])

  useEffect(() => {
    setLoadingStatus(LoadingStatus.IDDLE)
  }, [page])

  useEffect(() => {
    if (loadingStatus === LoadingStatus.IDDLE) {
      controllerRef.current = cancelPendingRequest(controllerRef.current)
      _fetchMedication()
    }
  }, [loadingStatus])

  useEffect(() => {
    setPage(1)
    setFilters({
      searchInput: '',
      nda: '',
      selectedPrescriptionTypes: [],
      selectedAdministrationRoutes: [],
      startDate: null,
      endDate: null,
      executiveUnits: []
    })
    setOrder({ orderBy: 'Period-start', orderDirection: 'desc' })
  }, [selectedTab])

  return (
    <Grid container justifyContent="flex-end" className={classes.documentTable}>
      <DataTableTopBar
        loading={loadingStatus === LoadingStatus.IDDLE || loadingStatus === LoadingStatus.FETCHING}
        tabs={{
          list: [
            { label: 'Prescription', value: 'prescription' },
            { label: 'Administration', value: 'administration' }
          ],
          value: selectedTab,
          onChange: (event: any, newTab?: any) => selectTab(newTab)
        }}
        results={{
          nb: totalMedication,
          total: totalAllMedication,
          label: selectedTab === 'prescription' ? `prescription(s)` : `administration(s)`
        }}
        searchBar={{
          type: 'simple',
          value: filters.searchInput,
          onSearch: (newSearchInput: string) => setFilters({ ...filters, ['searchInput']: newSearchInput })
        }}
        buttons={[
          {
            label: 'Filtrer',
            icon: <FilterList height="15px" fill="#FFF" />,
            onClick: () => setOpen('filter')
          }
        ]}
      />

      <MasterChips chips={buildMedicationFiltersChips(filters, handleDeleteChip)} />

      <DataTableMedication
        loading={loadingStatus === LoadingStatus.IDDLE || loadingStatus === LoadingStatus.FETCHING}
        selectedTab={selectedTab}
        medicationsList={patientMedicationList}
        deidentified={deidentifiedBoolean}
        order={order}
        setOrder={setOrder}
        page={page}
        setPage={(newPage) => setPage(newPage)}
        total={totalMedication}
      />

      <MedicationFilters
        open={open === 'filter'}
        onClose={() => setOpen(null)}
        deidentified={deidentifiedBoolean}
        showPrescriptionTypes={selectedTab === 'prescription'}
        showAdministrationRoutes={selectedTab === 'administration'}
        filters={filters}
        setFilters={(newFilters) => setFilters({ searchInput: filters.searchInput, ...newFilters })}
      />
    </Grid>
  )
}
export default PatientMedication
