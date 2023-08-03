import React, { useEffect, useRef, useState } from 'react'

import Grid from '@mui/material/Grid'

import { ReactComponent as FilterList } from 'assets/icones/filter.svg'

import DataTableMedication from 'components/DataTable/DataTableMedication'
import MasterChips from 'components/ui/Chips/Chips'

import { LoadingStatus, Order, PatientsFilters, TabType } from 'types'

import { useAppSelector, useAppDispatch } from 'state'
import { fetchMedication } from 'state/patient'

import { buildMedicationFiltersChips } from 'utils/chips'

import useStyles from './styles'
import { _cancelPendingRequest } from 'utils/abortController'
import { CanceledError } from 'axios'
import Searchbar from 'components/ui/Searchbar/Searchbar'
import { CircularProgress, useMediaQuery, useTheme } from '@mui/material'
import DisplayDigits from 'components/ui/Display/DisplayDigits'
import Filters from 'components/ui/Searchbar/Filters'
import SearchInput from 'components/ui/Searchbar/SearchInput'
import Tabs from 'components/ui/Tabs/Tabs'

type PatientMedicationTypes = {
  groupId?: string
}

enum Medication {
  PRESCRIPTION = 'prescription',
  ADMINISTRATION = 'administration'
}

enum MedicationLabel {
  PRESCRIPTION = 'Prescription',
  ADMINISTRATION = 'Administration'
}

const PatientMedication: React.FC<PatientMedicationTypes> = ({ groupId }) => {
  const { classes } = useStyles()
  const theme = useTheme()
  const isMd = useMediaQuery(theme.breakpoints.between('sm', 'lg'))
  const isSm = useMediaQuery(theme.breakpoints.down('md'))

  const dispatch = useAppDispatch()
  const { patient } = useAppSelector((state) => ({
    patient: state.patient
  }))

  const [loadingStatus, setLoadingStatus] = useState(LoadingStatus.FETCHING)
  const [page, setPage] = useState(1)
  const [filters, setFilters] = useState<PatientsFilters>({
    nda: '',
    selectedPrescriptionTypes: [],
    selectedAdministrationRoutes: [],
    startDate: null,
    endDate: null
  })
  const [selectedTab, setSelectedTab] = useState<TabType<Medication, MedicationLabel>>({
    id: Medication.PRESCRIPTION,
    label: MedicationLabel.PRESCRIPTION
  })
  const medicationTabs: TabType<Medication, MedicationLabel>[] = [
    { id: Medication.PRESCRIPTION, label: MedicationLabel.PRESCRIPTION },
    { id: Medication.ADMINISTRATION, label: MedicationLabel.ADMINISTRATION }
  ]
  const [order, setOrder] = useState<Order>({ orderBy: 'Period-start', orderDirection: 'asc' })
  const [searchInput, setSearchInput] = useState('')
  const deidentifiedBoolean = patient?.deidentified ?? false
  const searchResults = {
    nb: patient?.medication?.[selectedTab.id]?.count ?? 0,
    total: patient?.medication?.[selectedTab.id]?.total ?? 0,
    list: patient?.medication?.[selectedTab.id]?.list ?? [],
    label: 'prescription(s)'
  }

  const controllerRef = useRef<AbortController | null>(null)

  const _fetchMedication = async () => {
    try {
      setLoadingStatus(LoadingStatus.FETCHING)
      const response = await dispatch(
        fetchMedication({
          selectedTab: selectedTab.id,
          groupId,
          options: {
            page,
            sort: {
              by: order.orderBy,
              direction: order.orderDirection
            },
            filters: filters,
            searchInput
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
    setLoadingStatus(LoadingStatus.IDDLE)
    setPage(1)
  }, [
    searchInput,
    filters.nda,
    filters.startDate,
    filters.endDate,
    filters.selectedPrescriptionTypes,
    filters.selectedAdministrationRoutes,
    order.orderBy,
    order.orderDirection
  ])

  useEffect(() => {
    setLoadingStatus(LoadingStatus.IDDLE)
  }, [page])

  useEffect(() => {
    if (loadingStatus === LoadingStatus.IDDLE) {
      controllerRef.current = _cancelPendingRequest(controllerRef.current)
      _fetchMedication()
    }
  }, [loadingStatus])

  useEffect(() => {
    setPage(1)
    setFilters({
      nda: '',
      selectedPrescriptionTypes: [],
      selectedAdministrationRoutes: [],
      startDate: null,
      endDate: null
    })
    setSearchInput('')
    setOrder({ orderBy: 'Period-start', orderDirection: 'desc' })
  }, [selectedTab])

  return (
    <Grid container justifyContent="flex-end" className={classes.documentTable}>
      <Grid item xs={12}>
        <Searchbar>
          <Grid container item xs={12} md={12} lg={8} xl={8} style={isSm ? { flexWrap: 'wrap-reverse' } : {}}>
            <Grid item xs={12} md={6} lg={6} xl={6}>
              <Tabs
                values={medicationTabs}
                active={selectedTab}
                onchange={(value: TabType<Medication, MedicationLabel>) => setSelectedTab(value)}
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
        <MasterChips chips={buildMedicationFiltersChips(filters, handleDeleteChip)} />
      </Grid>

      <Grid item xs={12}>
        <DataTableMedication
          loading={loadingStatus === LoadingStatus.IDDLE || loadingStatus === LoadingStatus.FETCHING}
          selectedTab={selectedTab.id}
          medicationsList={searchResults.list}
          deidentified={deidentifiedBoolean}
          order={order}
          setOrder={setOrder}
          page={page}
          setPage={(newPage) => setPage(newPage)}
          total={searchResults.total}
        />
      </Grid>

      {/*<MedicationFilters
        open={open === 'filter'}
        onClose={() => setOpen(null)}
        deidentified={deidentifiedBoolean}
        showPrescriptionTypes={selectedTab === 'prescription'}
        showAdministrationRoutes={selectedTab === 'administration'}
        filters={filters}
        setFilters={(newFilters) => setFilters({ searchInput: filters.searchInput, ...newFilters })}
            />*/}
    </Grid>
  )
}
export default PatientMedication
