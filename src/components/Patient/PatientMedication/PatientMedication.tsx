import React, { useEffect, useState } from 'react'
import moment from 'moment'

import { Button, Chip, Grid, IconButton, InputAdornment, InputBase, Tab, Tabs, Typography } from '@material-ui/core'

import ClearIcon from '@material-ui/icons/Clear'
import { ReactComponent as SearchIcon } from 'assets/icones/search.svg'
import { ReactComponent as FilterList } from 'assets/icones/filter.svg'

import MedicationFilters from 'components/Filters/MedicationFilters/MedicationFilters'
import DataTableMedication from 'components/DataTable/DataTableMedication'

import { MedicationsFilters, Order } from 'types'

import { useAppSelector, useAppDispatch } from 'state'
import { fetchMedication } from 'state/patient'

import { capitalizeFirstLetter } from 'utils/capitalize'

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

  const handleChangeFilter = (
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

      <Grid>
        {filter.nda !== '' &&
          filter.nda.split(',').map((nda) => (
            <Chip
              className={classes.chips}
              key={nda}
              label={`NDA: ${nda}`}
              onDelete={() =>
                handleChangeFilter(
                  'nda',
                  filter.nda
                    .split(',')
                    .filter((id) => id !== nda)
                    .join()
                )
              }
              color="primary"
              variant="outlined"
            />
          ))}
        {filter.selectedPrescriptionTypes.length > 0 &&
          filter.selectedPrescriptionTypes.map((prescriptionType) => (
            <Chip
              className={classes.chips}
              key={prescriptionType.id}
              label={capitalizeFirstLetter(prescriptionType.label)}
              onDelete={() =>
                handleChangeFilter(
                  'selectedPrescriptionTypes',
                  filter.selectedPrescriptionTypes.filter(({ id }) => id !== prescriptionType.id)
                )
              }
              color="primary"
              variant="outlined"
            />
          ))}
        {filter.selectedAdministrationRoutes.length > 0 &&
          filter.selectedAdministrationRoutes.map((administrationRoute) => (
            <Chip
              className={classes.chips}
              key={administrationRoute.id}
              label={capitalizeFirstLetter(administrationRoute.label)}
              onDelete={() =>
                handleChangeFilter(
                  'selectedAdministrationRoutes',
                  filter.selectedAdministrationRoutes.filter(({ id }) => id !== administrationRoute.id)
                )
              }
              color="primary"
              variant="outlined"
            />
          ))}
        {filter.startDate && (
          <Chip
            className={classes.chips}
            label={`Après le : ${moment(filter.startDate).format('DD/MM/YYYY')}`}
            onDelete={() => handleChangeFilter('startDate', null)}
            color="primary"
            variant="outlined"
          />
        )}
        {filter.endDate && (
          <Chip
            className={classes.chips}
            label={`Avant le : ${moment(filter.endDate).format('DD/MM/YYYY')}`}
            onDelete={() => handleChangeFilter('endDate', null)}
            color="primary"
            variant="outlined"
          />
        )}
      </Grid>

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
