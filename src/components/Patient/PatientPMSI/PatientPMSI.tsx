import React, { useEffect, useState } from 'react'

import { Button, Grid, IconButton, InputAdornment, InputBase, Tab, Tabs, Typography } from '@material-ui/core'

import ClearIcon from '@material-ui/icons/Clear'
import { ReactComponent as SearchIcon } from 'assets/icones/search.svg'
import { ReactComponent as FilterList } from 'assets/icones/filter.svg'

import ModalPMSIFilters from 'components/Filters/PMSIFilters/PMSIFilters'
import DataTablePmsi from 'components/DataTable/DataTablePmsi'
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
    dispatch<any>(
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
        value &&
          onChangeOptions(
            filterName,
            filters.nda
              .split(',')
              .filter((item) => item !== value)
              .join()
          )
        break
      case 'code':
        value &&
          onChangeOptions(
            filterName,
            filters.code
              .split(',')
              .filter((item) => item !== value)
              .join()
          )
        break
      case 'startDate':
        onChangeOptions(filterName, null)
        break
      case 'endDate':
        onChangeOptions(filterName, null)
        break
      case 'selectedDiagnosticTypes':
        value &&
          onChangeOptions(
            filterName,
            filters.selectedDiagnosticTypes.filter((item) => item.id !== value.id)
          )
        break
    }
  }

  const onSearchPMSI = async () => {
    handleChangePage()
  }

  const onKeyDown = async (e: { keyCode: number; preventDefault: () => void }) => {
    if (e.keyCode === 13) {
      e.preventDefault()
      onSearchPMSI()
    }
  }

  const handleClearInput = () => {
    onChangeOptions('searchInput', '')
    handleChangePage()
  }

  useEffect(() => {
    handleChangePage()
  }, [
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
    <Grid container item xs={11} justifyContent="flex-end" className={classes.documentTable}>
      <Grid item container justifyContent="space-between" alignItems="center" className={classes.filterAndSort}>
        <Tabs
          classes={{
            root: classes.root,
            indicator: classes.indicator
          }}
          value={selectedTab}
          onChange={(event, value) => selectTab(value)}
        >
          <Tab
            classes={{ selected: classes.selected }}
            className={classes.tabTitle}
            label="Diagnostics CIM10"
            value="diagnostic"
          />
          <Tab classes={{ selected: classes.selected }} className={classes.tabTitle} label="Actes CCAM" value="ccam" />
          <Tab classes={{ selected: classes.selected }} className={classes.tabTitle} label="GHM" value="ghm" />
        </Tabs>

        <Typography variant="button">
          {`${totalPmsi || 0} / ${totalAllPmsi} ${
            selectedTab !== 'diagnostic' ? (selectedTab !== 'ccam' ? 'ghm' : 'acte(s)') : 'diagnostic(s)'
          }`}
        </Typography>

        <div className={classes.documentButtons}>
          <Grid item container xs={10} alignItems="center" className={classes.searchBar}>
            <InputBase
              placeholder="Rechercher"
              className={classes.input}
              value={filters.searchInput}
              onChange={(event) => onChangeOptions('searchInput', event.target.value)}
              onKeyDown={onKeyDown}
              endAdornment={
                <InputAdornment position="end">
                  {filters.searchInput && (
                    <IconButton onClick={handleClearInput}>
                      <ClearIcon />
                    </IconButton>
                  )}
                </InputAdornment>
              }
            />
            <IconButton type="submit" aria-label="search" onClick={onSearchPMSI}>
              <SearchIcon fill="#ED6D91" height="15px" />
            </IconButton>
          </Grid>
          <Button
            variant="contained"
            disableElevation
            startIcon={<FilterList height="15px" fill="#FFF" />}
            className={classes.searchButton}
            onClick={() => setOpen(true)}
          >
            Filtrer
          </Button>

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
        </div>
      </Grid>

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
    </Grid>
  )
}
export default PatientPMSI
