import React, { useEffect, useRef, useState } from 'react'

import { Alert, Grid, Typography } from '@mui/material'

import { ReactComponent as FilterList } from 'assets/icones/filter.svg'

import BiologyFilters from 'components/Filters/BiologyFilters/BiologyFilters'
import DataTableObservation from 'components/DataTable/DataTableObservation'
import DataTableTopBar from 'components/DataTable/DataTableTopBar'
import MasterChips from 'components/MasterChips/MasterChips'

import { useAppSelector, useAppDispatch } from 'state'
import { fetchBiology } from 'state/patient'
import { Order, ObservationFilters } from 'types'

import { buildObservationFiltersChips } from 'utils/chips'

import useStyles from './styles'
import { Checkbox } from '@mui/material'
import { useDebounce } from 'utils/debounce'
import { _cancelPendingRequest } from 'utils/abortController'

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

  const [loading, setLoading] = useState(false)
  const deidentifiedBoolean = patient?.deidentified ?? false
  const totalBiology = patient?.biology?.count ?? 0
  const totalAllBiology = patient?.biology?.total ?? 0
  const observationsListState = patient?.biology?.list ?? []

  const [page, setPage] = useState(1)
  const [searchInput, setSearchInput] = useState('')
  const debouncedSearchValue = useDebounce(500, searchInput)
  const [open, setOpen] = useState<string | null>(null)
  const [filters, setFilters] = useState<ObservationFilters>(filtersDefault)
  const [validatedStatus, setValidatedStatus] = useState(true)
  const [order, setOrder] = useState<Order>({
    orderBy: 'effectiveDatetime',
    orderDirection: 'asc'
  })
  const controllerRef = useRef<AbortController | null>(null)

  const _fetchBiology = async () => {
    dispatch(
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
            endDate: filters.endDate
          }
        }
      })
    )
  }

  const handleChangeFilter = (filterName: 'nda' | 'loinc' | 'anabio' | 'startDate' | 'endDate', value: any) => {
    switch (filterName) {
      case 'nda':
      case 'loinc':
      case 'anabio':
        setFilters((prevState) => ({ ...prevState, [filterName]: value }))
        break
      case 'startDate':
      case 'endDate':
        setFilters((prevState) => ({ ...prevState, [filterName]: null }))
        break
    }
  }

  useEffect(() => {
    setLoading(true)
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
    setLoading(true)
  }, [page])

  useEffect(() => {
    if (loading) {
      controllerRef.current = _cancelPendingRequest(controllerRef.current)
      _fetchBiology()
      setLoading(false)
    }
  }, [loading])

  return (
    <Grid container justifyContent="flex-end" className={classes.documentTable}>
      <DataTableTopBar
        loading={loading}
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

      <MasterChips chips={buildObservationFiltersChips(filters, handleChangeFilter)} />
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
        loading={loading}
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
