import React, { useEffect, useState } from 'react'

import Grid from '@mui/material/Grid'

import { ReactComponent as FilterList } from 'assets/icones/filter.svg'

import MedicationFilters from 'components/Filters/MedicationFilters/MedicationFilters'
import DataTableMedication from 'components/DataTable/DataTableMedication'
import DataTableTopBar from 'components/DataTable/DataTableTopBar'
import MasterChips from 'components/MasterChips/MasterChips'

import { MedicationsFilters, Order } from 'types'

import { useAppSelector, useAppDispatch } from 'state'
import { fetchMedication } from 'state/patient'

import { buildMedicationFiltersChips } from 'utils/chips'

import useStyles from './styles'

type PatientMedicationTypes = {
  groupId?: string
}
const PatientMedication: React.FC<PatientMedicationTypes> = ({ groupId }) => {
  const classes = useStyles()
  const dispatch = useAppDispatch()
  const { patient } = useAppSelector((state) => ({
    patient: state.patient
  }))

  const [selectedTab, selectTab] = useState<'prescription' | 'administration'>('prescription')

  const medicationPatient = patient?.medication ?? {}
  const currentMedication = medicationPatient[selectedTab] ?? {
    loading: false,
    count: 0,
    total: 0,
    list: []
  }

  const loading = currentMedication.loading ?? false
  const deidentifiedBoolean = patient?.deidentified ?? false
  const totalMedication = currentMedication.count ?? 0
  const totalAllMedication = currentMedication.total ?? 0

  const [patientMedicationList, setPatientMedicationList] = useState<any[]>([])

  const [open, setOpen] = useState<string | null>(null)
  const [page, setPage] = useState(1)

  const [filters, setFilters] = useState<MedicationsFilters & { searchInput: string }>({
    searchInput: '',
    nda: '',
    selectedPrescriptionTypes: [],
    selectedAdministrationRoutes: [],
    startDate: null,
    endDate: null
  })
  const [order, setOrder] = useState<Order>({ orderBy: 'Period-start', orderDirection: 'asc' })

  const _fetchMedication = async (page: number) => {
    dispatch(
      fetchMedication({
        selectedTab,
        groupId,
        options: {
          page,
          sort: {
            by: order.orderBy,
            direction: order.orderDirection
          },
          filters: filters
        }
      })
    )
  }

  const handleChangePage = (value?: number) => {
    setPage(value ? value : 1)
    _fetchMedication(value ? value : 1)
  }

  const handleDeleteChip = (
    filterName: 'nda' | 'startDate' | 'endDate' | 'selectedPrescriptionTypes' | 'selectedAdministrationRoutes',
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
    }
  }

  useEffect(() => {
    handleChangePage()
  }, [filters, order]) // eslint-disable-line

  useEffect(() => {
    setPage(1)
    setFilters({
      searchInput: '',
      nda: '',
      selectedPrescriptionTypes: [],
      selectedAdministrationRoutes: [],
      startDate: null,
      endDate: null
    })
    setOrder({ orderBy: 'Period-start', orderDirection: 'asc' })
  }, [selectedTab]) // eslint-disable-line

  useEffect(() => {
    const medicationPatient = patient?.medication ?? {}
    const currentMedication = medicationPatient[selectedTab] ?? {
      loading: false,
      count: 0,
      total: 0,
      list: []
    }
    setPatientMedicationList(currentMedication.list)
  }, [currentMedication, currentMedication?.list]) // eslint-disable-line

  return (
    <Grid container justifyContent="flex-end" className={classes.documentTable}>
      <DataTableTopBar
        loading={loading}
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
        loading={loading}
        selectedTab={selectedTab}
        medicationsList={patientMedicationList}
        deidentified={deidentifiedBoolean}
        order={order}
        setOrder={setOrder}
        page={page}
        setPage={(newPage) => handleChangePage(newPage)}
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
