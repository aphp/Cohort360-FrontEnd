import React, { useEffect, useState } from 'react'
import moment from 'moment'

import { Button, Chip, Grid, IconButton, InputAdornment, InputBase, Typography } from '@material-ui/core'
import Alert from '@material-ui/lab/Alert'

import ClearIcon from '@material-ui/icons/Clear'
import { ReactComponent as FilterList } from 'assets/icones/filter.svg'
import { ReactComponent as SearchIcon } from 'assets/icones/search.svg'

import BiologyFilters from 'components/Filters/BiologyFilters/BiologyFilters'
import DataTableObservation from 'components/DataTable/DataTableObservation'

import { useAppSelector, useAppDispatch } from 'state'
import { fetchBiology } from 'state/patient'
import { Order } from 'types'

import useStyles from './styles'

type PatientBiologyTypes = {
  groupId?: string
}

const filtersDefault = { nda: '', loinc: '', anabio: '', startDate: null, endDate: null }

const PatientBiology: React.FC<PatientBiologyTypes> = ({ groupId }) => {
  const classes = useStyles()
  const dispatch = useAppDispatch()
  const { patient } = useAppSelector((state) => ({
    patient: state.patient
  }))

  const loading = patient?.biology?.loading ?? false
  const deidentifiedBoolean = patient?.deidentified ?? false
  const totalBiology = patient?.biology?.count ?? 0
  const totalAllBiology = patient?.biology?.total ?? 0

  const observationsListState = patient?.biology?.list ?? []

  const [page, setPage] = useState(1)

  const [searchInput, setSearchInput] = useState('')

  const [open, setOpen] = useState<string | null>(null)

  const [filters, setFilters] = useState<{
    nda: string
    loinc: string
    anabio: string
    startDate: string | null
    endDate: string | null
  }>(filtersDefault)

  const [order, setOrder] = useState<Order>({
    orderBy: 'effectiveDatetime',
    orderDirection: 'asc'
  })

  const _fetchBiology = async (page: number, _searchInput: string) => {
    dispatch<any>(
      fetchBiology({
        groupId,
        options: {
          page,
          sort: {
            by: order.orderBy,
            direction: order.orderDirection
          },
          filters: {
            searchInput: _searchInput,
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

  const handleChangePage = (value?: number) => {
    setPage(value ? value : 1)
    _fetchBiology(value ? value : 1, searchInput)
  }

  const handleChangeFilter = (filterName: 'nda' | 'loinc' | 'anabio' | 'startDate' | 'endDate', value: any) => {
    switch (filterName) {
      case 'nda':
      case 'loinc':
      case 'anabio':
      case 'startDate':
      case 'endDate':
        setFilters((prevState) => ({ ...prevState, [filterName]: value }))
        break
    }
  }

  const handleClearInput = () => {
    setSearchInput('')
    handleChangePage(1)
  }

  const onKeyDown = async (e: { keyCode: number; preventDefault: () => void }) => {
    if (e.keyCode === 13) {
      e.preventDefault()
      handleChangePage()
    }
  }

  useEffect(() => {
    handleChangePage()
  }, [filters, order])

  return (
    <Grid container item xs={11} justifyContent="flex-end" className={classes.documentTable}>
      <Grid container item style={{ marginBottom: 8 }}>
        <Alert severity="warning">
          Les mesures de biologie sont pour l'instant restreintes aux 3870 codes ANABIO correspondant aux analyses les
          plus utilisées au niveau national et à l'AP-HP. De plus, les résultats concernent uniquement les analyses
          quantitatives enregistrées sur GLIMS, qui ont été validés et mis à jour depuis mars 2020.
        </Alert>
      </Grid>

      <Grid container item justifyContent="space-between" alignItems="center" className={classes.filterAndSort}>
        <Typography variant="button">
          {totalBiology || 0} / {totalAllBiology ?? 0} résultats
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

          {open && (
            <BiologyFilters
              open={open === 'filter'}
              onClose={() => setOpen(null)}
              filters={filters}
              onChangeFilters={setFilters}
              deidentified={deidentifiedBoolean}
            />
          )}
        </div>
      </Grid>

      <Grid>
        {filters.nda !== '' &&
          filters.nda.split(',').map((nda) => (
            <Chip
              className={classes.chips}
              key={nda}
              label={`NDA: ${nda}`}
              onDelete={() =>
                handleChangeFilter(
                  'nda',
                  filters.nda
                    .split(',')
                    .filter((value) => value !== nda)
                    .join()
                )
              }
              color="primary"
              variant="outlined"
            />
          ))}
        {filters.loinc !== '' &&
          filters.loinc.split(',').map((loinc) => (
            <Chip
              className={classes.chips}
              key={loinc}
              label={`Code LOINC: ${loinc.toLocaleUpperCase()}`}
              onDelete={() =>
                handleChangeFilter(
                  'loinc',
                  filters.loinc
                    .split(',')
                    .filter((value) => value !== loinc)
                    .join()
                )
              }
              color="primary"
              variant="outlined"
            />
          ))}
        {filters.anabio !== '' &&
          filters.anabio.split(',').map((anabio) => (
            <Chip
              className={classes.chips}
              label={`Code ANABIO: ${anabio.toLocaleUpperCase()}`}
              key={anabio}
              onDelete={() =>
                handleChangeFilter(
                  'anabio',
                  filters.anabio
                    .split(',')
                    .filter((value) => value !== anabio)
                    .join()
                )
              }
              color="primary"
              variant="outlined"
            />
          ))}
        {filters.startDate && (
          <Chip
            className={classes.chips}
            label={`Après le : ${moment(filters.startDate).format('DD/MM/YYYY')}`}
            onDelete={() => handleChangeFilter('startDate', null)}
            color="primary"
            variant="outlined"
          />
        )}
        {filters.endDate && (
          <Chip
            className={classes.chips}
            label={`Avant le : ${moment(filters.endDate).format('DD/MM/YYYY')}`}
            onDelete={() => handleChangeFilter('endDate', null)}
            color="primary"
            variant="outlined"
          />
        )}
      </Grid>

      <DataTableObservation
        loading={loading}
        deidentified={deidentifiedBoolean}
        observationsList={observationsListState}
        order={order}
        setOrder={setOrder}
        page={page}
        setPage={(newPage) => handleChangePage(newPage)}
        total={totalBiology}
      />
    </Grid>
  )
}

export default PatientBiology
