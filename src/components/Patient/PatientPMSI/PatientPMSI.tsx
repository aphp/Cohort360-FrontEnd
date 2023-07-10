import React, { useEffect, useRef, useState } from 'react'

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
import { useDebounce } from 'utils/debounce'

type PatientPMSITypes = {
  groupId?: string
}
enum PMSI {
  DIAGNOSTIC = 'diagnostic',
  GMH = 'ghm',
  CCAM = 'ccam'
}

const PatientPMSI: React.FC<PatientPMSITypes> = ({ groupId }) => {
  const { classes } = useStyles()
  const dispatch = useAppDispatch()

  const [selectedTab, selectTab] = useState<PMSI>(PMSI.DIAGNOSTIC)
  const [page, setPage] = useState(1)
  const [filters, setFilters] = useState<PMSIFilters & { searchInput: string }>({
    searchInput: '',
    nda: '',
    code: '',
    selectedDiagnosticTypes: [],
    startDate: null,
    endDate: null
  })
  const debouncedSearchValue = useDebounce(500, filters.searchInput)
  const [order, setOrder] = useState<Order>({
    orderBy: 'date',
    orderDirection: 'desc'
  })
  const [open, setOpen] = useState(false)

  const { patient } = useAppSelector((state) => ({
    patient: state.patient
  }))
  const loading = patient?.pmsi?.[selectedTab]?.loading ?? false
  const deidentifiedBoolean = patient?.deidentified ?? false
  const totalPmsi = patient?.pmsi?.[selectedTab]?.count ?? 0
  const totalAllPmsi = patient?.pmsi?.[selectedTab]?.total ?? 0
  const patientPmsiList = patient?.pmsi?.[selectedTab]?.list || []

  const controllerRef = useRef<AbortController | null>()

  const _fetchPMSI = async () => {
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
    _fetchPMSI()
  }, [
    debouncedSearchValue,
    filters.nda,
    filters.code,
    filters.startDate,
    filters.endDate,
    filters.selectedDiagnosticTypes,
    order.orderBy,
    order.orderDirection,
    page
  ])

  useEffect(() => {
    setPage(1)
    setFilters({
      searchInput: '',
      nda: '',
      code: '',
      selectedDiagnosticTypes: [],
      startDate: null,
      endDate: null
    })
    setOrder({ orderBy: 'date', orderDirection: 'desc' })
  }, [selectedTab])

  return (
    <Grid container justifyContent="flex-end" className={classes.documentTable}>
      <DataTableTopBar
        loading={loading}
        tabs={{
          list: [
            { label: 'Diagnostics CIM10', value: PMSI.DIAGNOSTIC },
            { label: 'Actes CCAM', value: PMSI.CCAM },
            { label: 'GHM', value: PMSI.GMH }
          ],
          value: selectedTab,
          onChange: (event: any, newTab?: any) => selectTab(newTab)
        }}
        results={{
          nb: totalPmsi,
          total: totalAllPmsi,
          label: selectedTab === PMSI.DIAGNOSTIC ? 'diagnostic(s)' : selectedTab === PMSI.CCAM ? PMSI.CCAM : 'ghm'
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
        showDiagnosticTypes={selectedTab === PMSI.DIAGNOSTIC}
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
