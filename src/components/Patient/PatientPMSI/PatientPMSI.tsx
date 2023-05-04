import React, { useEffect, useState } from 'react'

import { Grid } from '@mui/material'

import { ReactComponent as FilterList } from 'assets/icones/filter.svg'

import ModalPMSIFilters from 'components/Filters/PMSIFilters/PMSIFilters'
import DataTablePmsi from 'components/DataTable/DataTablePmsi'
import DataTableTopBar from 'components/DataTable/DataTableTopBar'
import MasterChips from 'components/MasterChips/MasterChips'

import { buildPmsiFiltersChips } from 'utils/chips'

import { useAppSelector, useAppDispatch } from 'state'
import { fetchPmsi } from 'state/patient'

import { PMSIFilters, Order } from 'types'

import useStyles from './styles'

type PatientPMSITypes = {
  groupId?: string
}
const PatientPMSI: React.FC<PatientPMSITypes> = ({ groupId }) => {
  const classes = useStyles()
  const dispatch = useAppDispatch()
  const { patient } = useAppSelector((state) => ({
    patient: state.patient
  }))

  const [selectedTab, selectTab] = useState<'diagnostic' | 'ghm' | 'ccam'>('diagnostic')

  const pmsiPatient = patient?.pmsi ?? {}
  const currrentPmsi = pmsiPatient[selectedTab] ?? {
    loading: false,
    count: 0,
    total: 0,
    list: []
  }

  const loading = currrentPmsi.loading ?? false
  const deidentifiedBoolean = patient?.deidentified ?? false
  const totalPmsi = currrentPmsi.count ?? 0
  const totalAllPmsi = currrentPmsi.total ?? 0

  const [patientPmsiList, setPatientPmsiList] = useState<any[]>([])

  const [page, setPage] = useState(1)

  const [filters, setFilters] = useState<PMSIFilters & { searchInput: string }>({
    searchInput: '',
    nda: '',
    code: '',
    selectedDiagnosticTypes: [],
    startDate: null,
    endDate: null
  })

  const [order, setOrder] = useState<Order>({
    orderBy: 'date',
    orderDirection: 'desc'
  })

  const [open, setOpen] = useState(false)

  const _fetchPMSI = async (page: number) => {
    const selectedDiagnosticTypesCodes = filters.selectedDiagnosticTypes.map((diagnosticType) => diagnosticType.id)
    dispatch(
      fetchPmsi({
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
            diagnosticTypes: selectedDiagnosticTypesCodes
          }
        }
      })
    )
  }

  const handleChangePage = (value?: number) => {
    setPage(value ? value : 1)
    _fetchPMSI(value ? value : 1)
  }

  const onChangeOptions = (key: string, value: any) => {
    setFilters((prevState) => ({
      ...prevState,
      [key]: value
    }))
  }

  const handleDeleteChip = (filterName: string, value?: any) => {
    switch (filterName) {
      case 'nda':
      case 'code':
        onChangeOptions(filterName, value)
        break
      case 'startDate':
      case 'endDate':
        onChangeOptions(filterName, null)
        break
      case 'selectedDiagnosticTypes':
        onChangeOptions(
          filterName,
          filters.selectedDiagnosticTypes.filter((item) => item.id !== value.id)
        )
        break
    }
  }

  useEffect(() => {
    handleChangePage()
  }, [
    filters.searchInput,
    filters.nda,
    filters.code,
    filters.startDate,
    filters.endDate,
    filters.selectedDiagnosticTypes,
    order.orderBy,
    order.orderDirection
  ]) // eslint-disable-line

  useEffect(() => {
    setPage(1)
    // Clear filter state
    setFilters({
      searchInput: '',
      nda: '',
      code: '',
      selectedDiagnosticTypes: [],
      startDate: null,
      endDate: null
    })
    setOrder({ orderBy: 'date', orderDirection: 'desc' })
  }, [selectedTab]) // eslint-disable-line

  useEffect(() => {
    const pmsiPatient = patient?.pmsi ?? {}
    const currrentPmsi = pmsiPatient[selectedTab] ?? {
      loading: false,
      count: 0,
      total: 0,
      list: []
    }
    setPatientPmsiList(currrentPmsi.list)
  }, [currrentPmsi, currrentPmsi?.list]) // eslint-disable-line

  return (
    <Grid container justifyContent="flex-end" className={classes.documentTable}>
      <DataTableTopBar
        loading={loading}
        tabs={{
          list: [
            { label: 'Diagnostics CIM10', value: 'diagnostic' },
            { label: 'Actes CCAM', value: 'ccam' },
            { label: 'GHM', value: 'ghm' }
          ],
          value: selectedTab,
          onChange: (event: any, newTab?: any) => selectTab(newTab)
        }}
        results={{
          nb: totalPmsi,
          total: totalAllPmsi,
          label: selectedTab === 'diagnostic' ? 'diagnostic(s)' : selectedTab === 'ccam' ? 'ccam' : 'ghm'
        }}
        searchBar={{
          type: 'simple',
          value: filters.searchInput,
          onSearch: (newSearchInput: string) => onChangeOptions('searchInput', newSearchInput)
        }}
        buttons={[
          {
            label: 'Filtrer',
            icon: <FilterList height="15px" fill="#FFF" />,
            onClick: () => setOpen(true)
          }
        ]}
      />

      <MasterChips chips={buildPmsiFiltersChips(filters as PMSIFilters, handleDeleteChip)} />

      <DataTablePmsi
        loading={loading}
        selectedTab={selectedTab}
        pmsiList={patientPmsiList}
        deidentified={deidentifiedBoolean}
        order={order}
        setOrder={setOrder}
        page={page}
        setPage={(newPage) => handleChangePage(newPage)}
        total={totalPmsi}
      />

      <ModalPMSIFilters
        open={open}
        onClose={() => setOpen(false)}
        deidentified={deidentifiedBoolean}
        showDiagnosticTypes={selectedTab === 'diagnostic'}
        filters={filters}
        setFilters={(newFilters) =>
          setFilters({
            searchInput: filters.searchInput,
            ...newFilters
          })
        }
      />
    </Grid>
  )
}
export default PatientPMSI
