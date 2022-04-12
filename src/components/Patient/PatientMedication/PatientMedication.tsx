import React, { useEffect, useState } from 'react'

import { Button, Grid, IconButton, InputAdornment, InputBase, Tab, Tabs, Typography } from '@material-ui/core'

import ClearIcon from '@material-ui/icons/Clear'
import { ReactComponent as SearchIcon } from 'assets/icones/search.svg'
import { ReactComponent as FilterList } from 'assets/icones/filter.svg'

import MedicationFilters from 'components/Filters/MedicationFilters/MedicationFilters'
import DataTableMedication from 'components/DataTable/DataTableMedication'
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

  const handleClearInput = () => {
    setSearchInput('')
    handleChangePage()
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

  const onKeyDown = async (e: { keyCode: number; preventDefault: () => void }) => {
    if (e.keyCode === 13) {
      e.preventDefault()
      handleChangePage()
    }
  }

  useEffect(() => {
    handleChangePage()
  }, [filter, order]) // eslint-disable-line

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
            label="Prescription"
            value="prescription"
          />
          <Tab
            classes={{ selected: classes.selected }}
            className={classes.tabTitle}
            label="Administration"
            value="administration"
          />
        </Tabs>
        <Typography variant="button">
          {totalMedication || 0} /{' '}
          {selectedTab === 'prescription'
            ? `${totalAllMedication ?? 0} prescription(s)`
            : `${totalAllMedication ?? 0} administration(s)`}
        </Typography>
        <div className={classes.documentButtons}>
          <Grid item container xs={10} alignItems="center" className={classes.searchBar}>
            <InputBase
              placeholder="Rechercher"
              className={classes.input}
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              onKeyDown={onKeyDown}
              endAdornment={
                <InputAdornment position="end">
                  {searchInput && (
                    <IconButton onClick={handleClearInput}>
                      <ClearIcon />
                    </IconButton>
                  )}
                </InputAdornment>
              }
            />
            <IconButton type="submit" aria-label="search" onClick={() => handleChangePage()}>
              <SearchIcon fill="#ED6D91" height="15px" />
            </IconButton>
          </Grid>
          <Button
            variant="contained"
            disableElevation
            startIcon={<FilterList height="15px" fill="#FFF" />}
            className={classes.searchButton}
            onClick={() => setOpen('filter')}
          >
            Filtrer
          </Button>

          <MedicationFilters
            open={open === 'filter'}
            onClose={() => setOpen(null)}
            deidentified={deidentifiedBoolean}
            showPrescriptionTypes={selectedTab === 'prescription'}
            showAdministrationRoutes={selectedTab === 'administration'}
            filters={filter}
            setFilters={setFilter}
          />
        </div>
      </Grid>

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
    </Grid>
  )
}
export default PatientMedication
