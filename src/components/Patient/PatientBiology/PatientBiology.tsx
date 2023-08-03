import React, { useEffect, useRef, useState } from 'react'

import { Alert, CircularProgress, Grid, Select, Typography } from '@mui/material'

import { ReactComponent as FilterList } from 'assets/icones/filter.svg'

import DataTableObservation from 'components/DataTable/DataTableObservation'
import MasterChips from 'components/ui/Chips/Chips'

import { useAppSelector, useAppDispatch } from 'state'
import { fetchBiology } from 'state/patient'
import { Order, LoadingStatus, PatientsFilters } from 'types'

import { buildObservationFiltersChips } from 'utils/chips'

import useStyles from './styles'
import { Checkbox } from '@mui/material'
import { useDebounce } from 'utils/debounce'
import { _cancelPendingRequest } from 'utils/abortController'
import { CanceledError } from 'axios'
import DisplayDigits from 'components/ui/Display/DisplayDigits'
import Filters from 'components/ui/Searchbar/Filters'
import SearchInput from 'components/ui/Searchbar/SearchInput'
import Searchbar from 'components/ui/Searchbar/Searchbar'

type PatientBiologyTypes = {
  groupId?: string
}

const filtersDefault = { nda: '', loinc: '', anabio: '', startDate: null, endDate: null }

const PatientBiology: React.FC<PatientBiologyTypes> = ({ groupId }) => {
  const { classes } = useStyles()
  const dispatch = useAppDispatch()
  const { patient } = useAppSelector((state) => ({
    patient: state.patient
  }))

  const [loadingStatus, setLoadingStatus] = useState(LoadingStatus.FETCHING)
  const deidentifiedBoolean = patient?.deidentified ?? false
  const searchResults = {
    list: patient?.biology?.list ?? [],
    nb: patient?.biology?.count ?? 0,
    total: patient?.biology?.total ?? 0,
    label: 'résultat(s)'
  }

  const [page, setPage] = useState(1)
  const [searchInput, setSearchInput] = useState('')
  const debouncedSearchValue = useDebounce(500, searchInput)
  const [filters, setFilters] = useState<PatientsFilters>(filtersDefault)
  const [validatedStatus] = useState(true)
  const [order, setOrder] = useState<Order>({
    orderBy: 'effectiveDatetime',
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

  const handleDeleteChip = (filterName: 'nda' | 'loinc' | 'anabio' | 'startDate' | 'endDate') => {
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
      <Grid item xs={12}>
        <Searchbar>
          <Grid item xs={12} lg={3}>
            {(loadingStatus === LoadingStatus.FETCHING || loadingStatus === LoadingStatus.IDDLE) && (
              <CircularProgress />
            )}
            {loadingStatus !== LoadingStatus.FETCHING && loadingStatus !== LoadingStatus.IDDLE && (
              <DisplayDigits nb={searchResults.nb} total={searchResults.total} label={searchResults.label as string} />
            )}
          </Grid>
          <Grid container item xs={12} lg={9} justifyContent="flex-end" style={{ maxWidth: 900 }}>
            <SearchInput
              value={searchInput}
              placeholder="Rechercher"
              width={'70%'}
              onchange={(newValue) => setSearchInput(newValue)}
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
        <MasterChips chips={buildObservationFiltersChips(filters, handleDeleteChip)} />
      </Grid>
      <Grid container item xs={12} alignItems="center" justifyContent="flex-end">
        <Checkbox checked={validatedStatus} disabled />
        <Typography style={{ color: '#505050' }}>
          N'afficher que les analyses dont les résultats ont été validés
        </Typography>
      </Grid>

      <Grid container item xs={12} style={{ marginBottom: 8 }}>
        <Alert severity="warning">
          Les mesures de biologie sont pour l'instant restreintes aux 3870 codes ANABIO correspondants aux analyses les
          plus utilisées au niveau national et à l'AP-HP. De plus, les résultats concernent uniquement les analyses
          quantitatives enregistrées sur GLIMS, qui ont été validées et mises à jour depuis mars 2020.
        </Alert>
      </Grid>

      <Grid item xs={12}>
        <DataTableObservation
          loading={loadingStatus === LoadingStatus.IDDLE || loadingStatus === LoadingStatus.FETCHING}
          deidentified={deidentifiedBoolean}
          observationsList={searchResults.list}
          order={order}
          setOrder={setOrder}
          page={page}
          setPage={(newPage) => setPage(newPage)}
          total={searchResults.total}
        />
      </Grid>

      {/*<BiologyFilters
        open={open === 'filter'}
        onClose={() => setOpen(null)}
        filters={filters}
        onChangeFilters={setFilters}
        deidentified={deidentifiedBoolean}
            />*/}
    </Grid>
  )
}

export default PatientBiology
