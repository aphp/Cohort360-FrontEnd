import React, { useEffect, useRef, useState } from 'react'

import { CircularProgress, Grid, useMediaQuery, useTheme } from '@mui/material'

import { ReactComponent as FilterList } from 'assets/icones/filter.svg'

import DataTablePmsi from 'components/DataTable/DataTablePmsi'
import MasterChips from 'components/ui/Chips/Chips'

import { buildPmsiFiltersChips } from 'utils/chips'

import { useAppSelector, useAppDispatch } from 'state'
import { fetchPmsi } from 'state/patient'

import { PMSIFilters, Order, LoadingStatus, PatientsFilters, TabType } from 'types'

import useStyles from './styles'
import { _cancelPendingRequest } from 'utils/abortController'
import { CanceledError } from 'axios'
import Searchbar from 'components/ui/Searchbar/Searchbar'
import SearchInput from 'components/ui/Searchbar/SearchInput'
import Filters from 'components/ui/Searchbar/Filters'
import DisplayDigits from 'components/ui/Display/DisplayDigits'
import Tabs from 'components/ui/Tabs/Tabs'

type PatientPMSITypes = {
  groupId?: string
}
enum PMSI {
  DIAGNOSTIC = 'diagnostic',
  GMH = 'ghm',
  CCAM = 'ccam'
}

enum PMSILabel {
  DIAGNOSTIC = 'Diagnostics CIM10',
  GMH = 'GHM',
  CCAM = 'Actes CCAM'
}

const PatientPMSI: React.FC<PatientPMSITypes> = ({ groupId }) => {
  const { classes } = useStyles()
  const theme = useTheme()
  const isMd = useMediaQuery(theme.breakpoints.between('sm', 'lg'))
  const isSm = useMediaQuery(theme.breakpoints.down('md'))
  const dispatch = useAppDispatch()

  const [selectedTab, setSelectedTab] = useState<TabType<PMSI, PMSILabel>>({
    id: PMSI.DIAGNOSTIC,
    label: PMSILabel.DIAGNOSTIC
  })
  const PMSITabs: TabType<PMSI, PMSILabel>[] = [
    { label: PMSILabel.DIAGNOSTIC, id: PMSI.DIAGNOSTIC },
    { label: PMSILabel.CCAM, id: PMSI.CCAM },
    { label: PMSILabel.GMH, id: PMSI.GMH }
  ]
  const [page, setPage] = useState(1)
  const [filters, setFilters] = useState<PatientsFilters>({
    nda: '',
    code: '',
    diagnosticTypes: [],
    startDate: null,
    endDate: null
  })
  const [searchInput, setSearchInput] = useState('')
  const [order, setOrder] = useState<Order>({
    orderBy: 'date',
    orderDirection: 'desc'
  })
  const [loadingStatus, setLoadingStatus] = useState(LoadingStatus.FETCHING)

  /* TODO => enlever l'appel de redux */
  const { patient } = useAppSelector((state) => ({
    patient: state.patient
  }))

  const deidentifiedBoolean = patient?.deidentified ?? false
  const searchResults = {
    list: patient?.pmsi?.[selectedTab.id]?.list || [],
    nb: patient?.pmsi?.[selectedTab.id]?.count ?? 0,
    total: patient?.pmsi?.[selectedTab.id]?.total ?? 0,
    label: selectedTab.id === PMSI.DIAGNOSTIC ? 'diagnostic(s)' : selectedTab.id === PMSI.CCAM ? PMSI.CCAM : 'ghm'
  }
  const controllerRef = useRef<AbortController | null>(null)

  const _fetchPMSI = async () => {
    try {
      setLoadingStatus(LoadingStatus.FETCHING)
      const response = await dispatch(
        fetchPmsi({
          selectedTab: selectedTab.id,
          groupId,
          options: {
            page,
            sort: {
              by: order.orderBy,
              direction: order.orderDirection
            },
            searchInput: searchInput,
            filters: {
              ...filters,
              diagnosticTypes: filters.diagnosticTypes
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
      case 'selectedDiagnosticTypes':
        onChangeOptions(
          filterName,
          filters.diagnosticTypes?.filter((item) => item.id !== value.id)
        )
        break
    }
  }
  useEffect(() => {
    setLoadingStatus(LoadingStatus.IDDLE)
    setPage(1)
  }, [
    searchInput,
    filters.nda,
    filters.code,
    filters.startDate,
    filters.endDate,
    filters.diagnosticTypes,
    order.orderBy,
    order.orderDirection
  ])

  useEffect(() => {
    setLoadingStatus(LoadingStatus.IDDLE)
  }, [page])

  useEffect(() => {
    if (loadingStatus === LoadingStatus.IDDLE) {
      controllerRef.current = _cancelPendingRequest(controllerRef.current)
      _fetchPMSI()
    }
  }, [loadingStatus])

  useEffect(() => {
    setPage(1)
    setFilters({
      nda: '',
      code: '',
      diagnosticTypes: [],
      startDate: null,
      endDate: null
    })
    setSearchInput('')
    setOrder({ orderBy: 'date', orderDirection: 'desc' })
  }, [selectedTab])

  return (
    <Grid container justifyContent="flex-end" className={classes.documentTable}>
      <Grid item xs={12}>
        <Searchbar>
          <Grid container item xs={12} md={12} lg={8} xl={8} style={isSm ? { flexWrap: 'wrap-reverse' } : {}}>
            <Grid item xs={12} md={6} lg={6} xl={6}>
              <Tabs
                values={PMSITabs}
                active={selectedTab}
                onchange={(value: TabType<PMSI, PMSILabel>) => setSelectedTab(value)}
              />
            </Grid>
            <Grid
              container
              justifyContent={isSm ? 'flex-start' : isMd ? 'flex-end' : 'center'}
              alignItems="center"
              item
              xs={12}
              md={6}
              lg={6}
              xl={6}
              style={isSm ? { marginBottom: 20 } : {}}
            >
              {(loadingStatus === LoadingStatus.FETCHING || loadingStatus === LoadingStatus.IDDLE) && (
                <CircularProgress />
              )}
              {loadingStatus !== LoadingStatus.FETCHING && loadingStatus !== LoadingStatus.IDDLE && (
                <DisplayDigits
                  nb={searchResults.nb}
                  total={searchResults.total}
                  label={searchResults.label}
                  color="#5BC5F2"
                />
              )}
            </Grid>
          </Grid>

          <Grid container item xs={12} md={12} lg={4} xl={4} justifyContent="flex-end">
            <SearchInput
              value={searchInput}
              placeholder={'Rechercher'}
              width="70%"
              onchange={(newSearchInput: string) => setSearchInput(newSearchInput)}
            />
            <Filters
              label="Filtrer"
              filters={filters}
              width={'30%'}
              icon={<FilterList height="15px" fill="#FFF" />}
              onChange={setFilters}
            />
          </Grid>
        </Searchbar>
      </Grid>

      <Grid item xs={12}>
        <MasterChips chips={buildPmsiFiltersChips(filters as PMSIFilters, handleDeleteChip)} />
      </Grid>

      <Grid item xs={12}>
        <DataTablePmsi
          loading={loadingStatus === LoadingStatus.FETCHING || loadingStatus === LoadingStatus.IDDLE}
          selectedTab={selectedTab.id}
          pmsiList={searchResults.list}
          deidentified={deidentifiedBoolean}
          order={order}
          setOrder={setOrder}
          page={page}
          setPage={(newPage) => setPage(newPage)}
          total={searchResults.total}
        />
      </Grid>
    </Grid>
  )
}
export default PatientPMSI
