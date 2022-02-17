import React, { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import moment from 'moment'

import {
  Button,
  Chip,
  CircularProgress,
  Grid,
  IconButton,
  InputAdornment,
  InputBase,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Typography
} from '@material-ui/core'
import Pagination from '@material-ui/lab/Pagination'

import ClearIcon from '@material-ui/icons/Clear'
import { ReactComponent as FilterList } from 'assets/icones/filter.svg'
import { ReactComponent as SearchIcon } from 'assets/icones/search.svg'

import BiologyFilters from 'components/Filters/BiologyFilters/BiologyFilters'

import { fetchBiology } from 'state/patient'
import { useAppSelector } from 'state'
import { CohortObservation } from 'types'

import useStyles from './styles'

type PatientBiologyTypes = {
  groupId?: string
}

const filtersDefault = { nda: '', loinc: '', anabio: '', startDate: null, endDate: null }

const PatientBiology: React.FC<PatientBiologyTypes> = ({ groupId }) => {
  const classes = useStyles()
  const dispatch = useDispatch()
  const { patient } = useAppSelector((state) => ({
    patient: state.patient
  }))

  const loading = patient?.biology?.loading ?? false
  const deidentifiedBoolean = patient?.deidentified ?? false
  const totalBiology = patient?.biology?.count ?? 0
  const totalAllBiology = patient?.biology?.total ?? 0

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

  const [sort, setSort] = useState<{ by: string; direction: 'asc' | 'desc' }>({
    by: 'effectiveDatetime',
    direction: 'asc'
  })

  const columns = [
    { label: `NDA${deidentifiedBoolean ? ' chiffré' : ''}`, code: '' },
    { label: 'Date de prélèvement', code: 'effectiveDatetime' },
    { label: 'ANABIO', code: 'codeSimple-anabio' },
    { label: 'LOINC', code: 'codeSimple-loinc' },
    { label: 'Résultat', code: '' },
    { label: 'Unité exécutrice', code: '' }
  ]

  const _fetchBiology = async (page: number, _searchInput: string) => {
    dispatch(
      fetchBiology({
        groupId,
        options: {
          page,
          sort,
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

  const handleChangePage = (event?: React.ChangeEvent<unknown>, value?: number) => {
    setPage(value ? value : 1)
    _fetchBiology(value ? value : 1, searchInput)
  }

  const handleChangeFilter = (
    filterName: 'nda' | 'loinc' | 'anabio' | 'startDate' | 'endDate',
    value: any,
    item?: any
  ) => {
    switch (filterName) {
      case 'nda':
      case 'loinc':
      case 'anabio':
        if (item) {
          const _filterArray = filters[filterName].split(',')
          const itemToDelete = _filterArray.indexOf(item)
          _filterArray.splice(itemToDelete, 1)

          setFilters((prevState) => ({ ...prevState, [filterName]: _filterArray.join() }))
        } else {
          setFilters((prevState) => ({ ...prevState, [filterName]: value }))
        }
        break
      case 'startDate':
      case 'endDate':
        setFilters((prevState) => ({ ...prevState, [filterName]: value }))
        break
    }
  }

  const handleClearInput = () => {
    setSearchInput('')
    _fetchBiology(1, '')
  }

  const handleSort = (property: any) => (event: React.MouseEvent<unknown> /*eslint-disable-line*/) => {
    const isAsc: boolean = sort.by === property && sort.direction === 'asc'
    const newDirection = isAsc ? 'desc' : 'asc'

    setSort({ by: property, direction: newDirection })
    setPage(1)
  }

  const onKeyDown = async (e: { keyCode: number; preventDefault: () => void }) => {
    if (e.keyCode === 13) {
      e.preventDefault()
      handleChangePage()
    }
  }

  useEffect(() => {
    handleChangePage()
  }, [filters, sort])

  return (
    <Grid container item xs={11} justify="flex-end" className={classes.documentTable}>
      <Grid container item justify="space-between" alignItems="center" className={classes.filterAndSort}>
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
            <IconButton type="submit" aria-label="search" onClick={handleChangePage}>
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
          filters.nda
            .split(',')
            .map((nda) => (
              <Chip
                className={classes.chips}
                key={nda}
                label={nda}
                onDelete={() => handleChangeFilter('nda', null, nda)}
                color="primary"
                variant="outlined"
              />
            ))}
        {filters.loinc !== '' &&
          filters.loinc
            .split(',')
            .map((loinc) => (
              <Chip
                className={classes.chips}
                key={`Code LOINC: ${loinc}`}
                label={loinc}
                onDelete={() => handleChangeFilter('loinc', null, loinc)}
                color="primary"
                variant="outlined"
              />
            ))}
        {filters.anabio !== '' &&
          filters.anabio
            .split(',')
            .map((anabio) => (
              <Chip
                className={classes.chips}
                key={`Code ANABIO: ${anabio}`}
                label={anabio}
                onDelete={() => handleChangeFilter('anabio', null, anabio)}
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

      {loading ? (
        <Grid container justify="center">
          <CircularProgress />
        </Grid>
      ) : (
        <TableContainer component={Paper}>
          <Table className={classes.table}>
            <TableHead className={classes.tableHead}>
              <TableRow>
                {columns.map((column, index: number) => (
                  <TableCell key={index} align="center" className={classes.tableHeadCell}>
                    {column.code !== '' ? (
                      <TableSortLabel
                        active={sort.by === column.code}
                        direction={sort.by === column.code ? sort.direction : 'asc'}
                        onClick={handleSort(column.code)}
                      >
                        {column.label}
                      </TableSortLabel>
                    ) : (
                      column.label
                    )}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {patient?.biology?.list && patient?.biology?.list.length > 0 ? (
                <>
                  {patient?.biology?.list.map((row: CohortObservation) => {
                    const nda = row.NDA
                    const date = row.effectiveDateTime
                    const libelleANABIO = row.code?.coding?.find((code: any) => code.id === 'CODE ANABIO')?.display
                    const codeLOINC = row.code?.coding?.find((code: any) => code.id === 'CODE LOINC')?.code
                    const libelleLOINC = row.code?.coding?.find((code: any) => code.id === 'CODE LOINC')?.display
                    const result = row.valueQuantity
                      ? row.valueQuantity.code
                        ? row.valueQuantity.code
                        : row.valueQuantity.value
                        ? `${row.valueQuantity.value} ${row.valueQuantity.unit}`
                        : '-'
                      : '-'
                    const serviceProvider = row.serviceProvider

                    return (
                      <TableRow className={classes.tableBodyRows} key={row.id}>
                        <TableCell align="left">{nda ?? 'Inconnu'}</TableCell>
                        <TableCell align="center">
                          {date ? new Date(date).toLocaleDateString('fr-FR') : 'Date inconnue'}
                        </TableCell>
                        <TableCell align="center">
                          <Typography className={classes.libelle}>
                            {libelleANABIO === 'No matching concept' ? '-' : libelleANABIO ?? '-'}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Typography className={classes.libelle}>
                            {codeLOINC === 'No matching concept' || codeLOINC === 'Non Renseigné'
                              ? ''
                              : codeLOINC ?? ''}{' '}
                            - {libelleLOINC === 'No matching concept' ? '-' : libelleLOINC ?? '-'}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">{result}</TableCell>
                        <TableCell align="center">{serviceProvider ?? '-'}</TableCell>
                      </TableRow>
                    )
                  })}
                </>
              ) : (
                <TableRow className={classes.emptyTableRow}>
                  <TableCell colSpan={9} align="left">
                    <Grid container justify="center">
                      <Typography variant="button">Aucun résultat de biologie à afficher</Typography>
                    </Grid>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Pagination
        className={classes.pagination}
        count={Math.ceil(totalBiology / 20)}
        shape="rounded"
        onChange={handleChangePage}
        page={page}
      />
    </Grid>
  )
}

export default PatientBiology
