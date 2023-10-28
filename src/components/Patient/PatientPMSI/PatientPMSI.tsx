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

import { PMSIFilters, Order, LoadingStatus } from 'types'

import useStyles from './styles'
import { useDebounce } from 'utils/debounce'
import { cancelPendingRequest } from 'utils/abortController'
import { CanceledError } from 'axios'

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
    diagnosticTypes: [],
    startDate: null,
    endDate: null,
    executiveUnits: []
  })
  const debouncedSearchValue = useDebounce(500, filters.searchInput)
  const [order, setOrder] = useState<Order>({
    orderBy: 'date',
    orderDirection: 'desc'
  })
  const [open, setOpen] = useState(false)

  /* TODO => enlever l'appel de redux */
  const { patient } = useAppSelector((state) => ({
    patient: state.patient
  }))
  const [loadingStatus, setLoadingStatus] = useState(LoadingStatus.FETCHING)

  const deidentifiedBoolean = patient?.deidentified ?? false
  const totalPmsi = patient?.pmsi?.[selectedTab]?.count ?? 0
  const totalAllPmsi = patient?.pmsi?.[selectedTab]?.total ?? 0
  const patientPmsiList = patient?.pmsi?.[selectedTab]?.list || []

  const controllerRef = useRef<AbortController | null>(null)

  const _fetchPMSI = async () => {
    try {
      const selectedDiagnosticTypesCodes = filters.diagnosticTypes.map((diagnosticType) => diagnosticType.id)
      setLoadingStatus(LoadingStatus.FETCHING)
      const response = await dispatch(
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
              diagnosticTypes: selectedDiagnosticTypesCodes,
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
      case 'diagnosticTypes':
        onChangeOptions(
          filterName,
          filters.diagnosticTypes.filter((item) => item.id !== value.id)
        )
        break
      case 'executiveUnits':
        onChangeOptions(
          filterName,
          filters.executiveUnits.filter((executiveUnit) => executiveUnit.name !== value)
        )
        break
    }
  }
  useEffect(() => {
    setLoadingStatus(LoadingStatus.IDDLE)
    setPage(1)
  }, [
    debouncedSearchValue,
    filters.nda,
    filters.code,
    filters.startDate,
    filters.endDate,
    filters.diagnosticTypes,
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
      _fetchPMSI()
    }
  }, [loadingStatus])

  useEffect(() => {
    setPage(1)
    setFilters({
      searchInput: '',
      nda: '',
      code: '',
      diagnosticTypes: [],
      startDate: null,
      endDate: null,
      executiveUnits: []
    })
    setOrder({ orderBy: 'date', orderDirection: 'desc' })
  }, [selectedTab])

  return (
    <Grid container justifyContent="flex-end" className={classes.documentTable}>
      <DataTableTopBar
        loading={loadingStatus === LoadingStatus.FETCHING || loadingStatus === LoadingStatus.IDDLE}
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
        loading={loadingStatus === LoadingStatus.FETCHING || loadingStatus === LoadingStatus.IDDLE}
        selectedTab={selectedTab}
        pmsiList={patientPmsiList}
        deidentified={deidentifiedBoolean}
        order={order}
        setOrder={setOrder}
        page={page}
        setPage={(newPage) => setPage(newPage)}
        total={totalPmsi}
      />

      <ModalPMSIFilters
        open={open}
        onClose={() => setOpen(false)}
        deidentified={deidentifiedBoolean}
        showDiagnosticTypes={selectedTab === PMSI.DIAGNOSTIC}
        pmsiType={selectedTab}
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
