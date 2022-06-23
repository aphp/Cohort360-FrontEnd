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
  const currrentMedication = medicationPatient[selectedTab] ?? {
    loading: false,
    count: 0,
    total: 0,
    list: []
  }

  const loading = currrentMedication.loading ?? false
  const deidentifiedBoolean = patient?.deidentified ?? false
  const totalMedication = currrentMedication.count ?? 0
  const totalAllMedication = currrentMedication.total ?? 0

  const [patientMedicationList, setPatientMedicationList] = useState<any[]>([])

  const [searchInput, setSearchInput] = useState('')

  const [open, setOpen] = useState<string | null>(null)
  const [page, setPage] = useState(1)

  const [filter, setFilter] = useState<MedicationsFilters>({
    nda: '',
    selectedPrescriptionTypes: [],
    selectedAdministrationRoutes: [],
    startDate: null,
    endDate: null
  })
  const [order, setOrder] = useState<Order>({ orderBy: 'Period-start', orderDirection: 'asc' })

  const _fetchMedication = async (page: number) => {
    dispatch<any>(
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
            searchInput,
            nda: filter.nda,
            selectedPrescriptionTypes: filter.selectedPrescriptionTypes,
            selectedAdministrationRoutes: filter.selectedAdministrationRoutes,
            startDate: filter.startDate,
            endDate: filter.endDate
          }
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
      case 'startDate':
      case 'endDate':
        setFilter((prevState) => ({ ...prevState, [filterName]: value }))
        break
    }
  }

  useEffect(() => {
    handleChangePage()
  }, [filter, order, searchInput]) // eslint-disable-line

  useEffect(() => {
    setSearchInput('')
    setFilter({
      nda: '',
      selectedPrescriptionTypes: [],
      selectedAdministrationRoutes: [],
      startDate: null,
      endDate: null
    })
  }, [selectedTab]) // eslint-disable-line

  useEffect(() => {
    const medicationPatient = patient?.medication ?? {}
    const currrentMedication = medicationPatient[selectedTab] ?? {
      loading: false,
      count: 0,
      total: 0,
      list: []
    }
    setPatientMedicationList(currrentMedication.list)
  }, [currrentMedication, currrentMedication?.list]) // eslint-disable-line

  return (
    <Grid container item xs={11} justifyContent="flex-end" className={classes.documentTable}>
      <DataTableTopBar
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
          value: searchInput,
          onSearch: (newSearchInput: string) => setSearchInput(newSearchInput)
        }}
        buttons={[
          {
            label: 'Filtrer',
            icon: <FilterList height="15px" fill="#FFF" />,
            onClick: () => setOpen('filter')
          }
        ]}
      />

      <MasterChips chips={buildMedicationFiltersChips(filter, handleDeleteChip)} />

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
        filters={filter}
        setFilters={setFilter}
      />
    </Grid>
  )
}
export default PatientMedication
