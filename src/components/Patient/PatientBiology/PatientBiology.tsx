import React, { useEffect, useRef, useState } from 'react'

import { Alert, Grid, Typography } from '@mui/material'

import { ReactComponent as FilterList } from 'assets/icones/filter.svg'

import BiologyFilters from 'components/Filters/BiologyFilters/BiologyFilters'
import DataTableObservation from 'components/DataTable/DataTableObservation'
import DataTableTopBar from 'components/DataTable/DataTableTopBar'
import MasterChips from 'components/MasterChips/MasterChips'

import { useAppSelector, useAppDispatch } from 'state'
import { fetchBiology } from 'state/patient'
import { Order, ObservationFilters, LoadingStatus } from 'types'

import { buildObservationFiltersChips } from 'utils/chips'

import useStyles from './styles'
import { Checkbox } from '@mui/material'
import { useDebounce } from 'utils/debounce'
import { _cancelPendingRequest } from 'utils/abortController'
import { CanceledError } from 'axios'

type PatientBiologyTypes = {
  groupId?: string
}

const filtersDefault: ObservationFilters = {
  nda: '',
  loinc: '',
  anabio: '',
  startDate: null,
  endDate: null,
  executiveUnits: []
}

const PatientBiology: React.FC<PatientBiologyTypes> = ({ groupId }) => {
  const { classes } = useStyles()
  const dispatch = useAppDispatch()
  const { patient } = useAppSelector((state) => ({
    patient: state.patient
  }))

  const [loadingStatus, setLoadingStatus] = useState(LoadingStatus.FETCHING)
  const deidentifiedBoolean = patient?.deidentified ?? false
  const totalBiology = patient?.biology?.count ?? 0
  const totalAllBiology = patient?.biology?.total ?? 0
  const observationsListState = patient?.biology?.list ?? []

  const [page, setPage] = useState(1)
  const [searchInput, setSearchInput] = useState('')
  const debouncedSearchValue = useDebounce(500, searchInput)
  const [open, setOpen] = useState<string | null>(null)
  const [filters, setFilters] = useState<ObservationFilters>(filtersDefault)
  const [validatedStatus] = useState(true)
  const [order, setOrder] = useState<Order>({
    orderBy: 'date',
    orderDirection: 'asc'
  })
  const controllerRef = useRef<AbortController | null>(null)

  const _fetchBiology = async () => {
    try {
      setLoadingStatus(LoadingStatus.FETCHING)
      const response = await dispatch(
        fetchBiology({
          groupId,
          rowStatus: validatedStatus,
          options: {
            page,
            sort: {
              by: order.orderBy,
              direction: order.orderDirection
            },
            filters: {
              searchInput,
              nda: filters.nda,
              loinc: filters.loinc,
              anabio: filters.anabio,
              startDate: filters.startDate,
              endDate: filters.endDate,
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

  const handleDeleteChip = (
    filterName: 'nda' | 'loinc' | 'anabio' | 'startDate' | 'endDate' | 'executiveUnits',
    value: string
  ) => {
    switch (filterName) {
      case 'nda':
      case 'loinc':
      case 'anabio':
        setFilters((prevState) => ({ ...prevState, [filterName]: null }))
        break
      case 'startDate':
      case 'endDate':
        setFilters((prevState) => ({ ...prevState, [filterName]: null }))
        break
      case 'executiveUnits':
        {
          const newExecutiveUnits = filters.executiveUnits.filter((executiveUnit) => executiveUnit.name !== value)
          setFilters((prevFilters) => ({ ...prevFilters, executiveUnits: newExecutiveUnits }))
        }
        break
    }
  }

  useEffect(() => {
    setLoadingStatus(LoadingStatus.IDDLE)
    setPage(1)
  }, [
    debouncedSearchValue,
    filters.anabio,
    filters.nda,
    filters.endDate,
    filters.startDate,
    filters.executiveUnits,
    order.orderBy,
    order.orderDirection
  ])

  useEffect(() => {
    setLoadingStatus(LoadingStatus.IDDLE)
  }, [page])

  useEffect(() => {
    if (loadingStatus === LoadingStatus.IDDLE) {
      controllerRef.current = _cancelPendingRequest(controllerRef.current)
      _fetchBiology()
    }
  }, [loadingStatus])

  return (
    <Grid container justifyContent="flex-end" className={classes.documentTable}>
      <DataTableTopBar
        loading={loadingStatus === LoadingStatus.IDDLE || loadingStatus === LoadingStatus.FETCHING}
        results={{
          nb: totalBiology,
          total: totalAllBiology,
          label: 'résultat(s)'
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

      <MasterChips chips={buildObservationFiltersChips(filters, handleDeleteChip)} />
      <Grid container item alignItems="center" justifyContent="flex-end">
        <Checkbox checked={validatedStatus} disabled />
        <Typography style={{ color: '#505050' }}>
          N'afficher que les analyses dont les résultats ont été validés
        </Typography>
      </Grid>

      <Grid container item style={{ marginBottom: 8 }}>
        <Alert severity="warning">
          Les mesures de biologie sont pour l'instant restreintes aux 3870 codes ANABIO correspondants aux analyses les
          plus utilisées au niveau national et à l'AP-HP. De plus, les résultats concernent uniquement les analyses
          quantitatives enregistrées sur GLIMS, qui ont été validées et mises à jour depuis mars 2020.
        </Alert>
      </Grid>

      <DataTableObservation
        loading={loadingStatus === LoadingStatus.IDDLE || loadingStatus === LoadingStatus.FETCHING}
        deidentified={deidentifiedBoolean}
        observationsList={observationsListState}
        order={order}
        setOrder={setOrder}
        page={page}
        setPage={(newPage) => setPage(newPage)}
        total={totalBiology}
      />

      <BiologyFilters
        open={open === 'filter'}
        onClose={() => setOpen(null)}
        filters={filters}
        onChangeFilters={setFilters}
        deidentified={deidentifiedBoolean}
      />
    </Grid>
  )
}

export default PatientBiology
