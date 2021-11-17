import React, { useState, useEffect } from 'react'
import moment from 'moment'

import {
  Button,
  Chip,
  CircularProgress,
  Grid,
  IconButton,
  InputAdornment,
  InputBase,
  Typography
} from '@material-ui/core'
import Pagination from '@material-ui/lab/Pagination'

import ClearIcon from '@material-ui/icons/Clear'
import { ReactComponent as SearchIcon } from 'assets/icones/search.svg'
import { ReactComponent as FilterList } from 'assets/icones/filter.svg'

import ResearchTable from './ResearchTable/ResearchTable'
import CohortsFilter from '../Filters/CohortsFilters/CohortsFilters'
import { fetchCohorts } from 'services/savedResearches'

import useStyles from './styles'
import { CohortFilters, FormattedCohort, ValueSet } from 'types'

import displayDigit from 'utils/displayDigit'

import { setFavoriteCohortThunk, deleteUserCohortThunk } from 'state/userCohorts'
import { useAppDispatch } from 'state'

type ResearchProps = {
  simplified?: boolean
  onClickRow?: Function
  filteredIds?: string[]
}
const Research: React.FC<ResearchProps> = ({ simplified, onClickRow, filteredIds }) => {
  const classes = useStyles()
  const dispatch = useAppDispatch()
  const [page, setPage] = useState(1)
  const [researches, setResearches] = useState<FormattedCohort[] | undefined>()
  const [loadingStatus, setLoadingStatus] = useState(true)
  const [total, setTotal] = useState(0)
  const [searchInput, setSearchInput] = useState('')
  const [sortBy, setSortBy] = useState('fhir_datetime')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')
  const [open, setOpen] = useState(false)
  const [showFilterChip, setShowFilterChip] = useState(false)
  const [filters, setFilters] = useState<CohortFilters>({
    status: [],
    type: 'all',
    favorite: 'all',
    minPatients: null,
    maxPatients: null,
    startDate: null,
    endDate: null
  })
  const researchLines = 20 // Number of desired lines in the document array

  useEffect(() => {
    onFetchCohorts(sortBy, sortDirection)
  }, [filters]) // eslint-disable-line

  const onFetchCohorts = async (sortBy = 'given', sortDirection = 'asc', input = searchInput) => {
    setLoadingStatus(true)
    setPage(1)
    setSortBy(sortBy)
    setSortDirection(sortDirection as 'asc' | 'desc')
    const cohortsResp = await fetchCohorts(sortBy, sortDirection, filters, input)

    if (filteredIds) {
      setResearches(cohortsResp ? cohortsResp?.results?.filter((r) => !filteredIds.includes(r.researchId)) : undefined)
    } else {
      setResearches(cohortsResp?.results ?? undefined)
    }
    setTotal(cohortsResp?.count ?? 0)
    setLoadingStatus(false)
  }

  const onDeleteCohort = async (cohortId: string) => {
    setResearches(researches?.filter((r) => r.researchId !== cohortId))
    dispatch<any>(deleteUserCohortThunk({ cohortId }))
  }

  const onSetCohortFavorite = async (cohortId: string) => {
    await dispatch<any>(setFavoriteCohortThunk({ cohortId }))

    const cohortsResp = await fetchCohorts(sortBy, sortDirection, filters)

    setResearches(cohortsResp?.results ?? undefined)
    setTotal(cohortsResp?.count ?? 0)
  }

  const handleChangePage = async (event?: React.ChangeEvent<unknown>, value = 1) => {
    setPage(value)
    setLoadingStatus(true)
    const cohortsResp = await fetchCohorts(sortBy, sortDirection, filters, searchInput, value || 1)
    if (cohortsResp) {
      setResearches(cohortsResp?.results ?? undefined)
      setTotal(cohortsResp?.count ?? 0)
      setLoadingStatus(false)
    }
  }

  const handleCloseDialog = (submit: boolean) => () => {
    setOpen(false)
    submit && setShowFilterChip(true)
  }

  const handleChangeInput = (event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    setSearchInput(event.target.value)
  }

  const onSearchCohort = async () => {
    handleChangePage()
  }

  const handleClearInput = async () => {
    setSearchInput('')
    setLoadingStatus(true)
    const cohortsResp = await fetchCohorts(sortBy, sortDirection, filters)

    if (filteredIds) {
      setResearches(
        cohortsResp && cohortsResp.results && cohortsResp.results.length > 0
          ? cohortsResp?.results?.filter((r) => !filteredIds.includes(r.researchId))
          : undefined
      )
      setTotal(cohortsResp?.count ?? 0)
    }

    setLoadingStatus(false)
  }

  const onKeyDown = async (e: React.KeyboardEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    if (e.keyCode === 13) {
      e.preventDefault()
      onSearchCohort()
    }
  }

  const handleRequestSort = (event: React.MouseEvent<unknown>, property: any) => {
    const isAsc: boolean = sortBy === property && sortDirection === 'asc'
    const _sortDirection = isAsc ? 'desc' : 'asc'

    setSortDirection(_sortDirection)
    setSortBy(property)
    onFetchCohorts(property, _sortDirection)
  }

  const handleDeleteChip = (filterName: string, value?: any) => {
    switch (filterName) {
      case 'status':
        value &&
          setFilters({
            ...filters,
            status: filters.status.filter((item) => item !== value)
          })
        break
      case 'type':
        setFilters({ ...filters, type: 'all' })
        break
      case 'favorite':
        setFilters({ ...filters, favorite: 'all' })
        break
      case 'minPatients':
        setFilters({ ...filters, minPatients: null })
        break
      case 'maxPatients':
        setFilters({ ...filters, maxPatients: null })
        break
      case 'startDate':
        setFilters({ ...filters, startDate: null })
        break
      case 'endDate':
        setFilters({ ...filters, endDate: null })
        break
    }
  }

  return (
    <Grid container justify="flex-end" className={classes.documentTable}>
      <Grid item container justify="space-between">
        <Typography variant="button">{displayDigit(total ?? 0)} cohorte(s)</Typography>
        <div className={classes.tableButtons}>
          <Grid item container xs={10} alignItems="center" className={classes.searchBar}>
            <InputBase
              placeholder="Rechercher"
              className={classes.input}
              value={searchInput}
              onChange={handleChangeInput}
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
            <IconButton type="submit" aria-label="search" onClick={onSearchCohort}>
              <SearchIcon fill="#ED6D91" height="15px" />
            </IconButton>
          </Grid>
          <Button
            variant="contained"
            disableElevation
            onClick={() => setOpen(true)}
            startIcon={<FilterList height="15px" fill="#FFF" />}
            className={classes.searchButton}
          >
            Filtrer
          </Button>
        </div>
      </Grid>
      <Grid>
        {showFilterChip &&
          filters.status &&
          filters.status.length > 0 &&
          filters.status.map((status: ValueSet) => (
            <Chip
              className={classes.chips}
              key={status.code}
              label={`Statut ${status.display}`}
              onDelete={() => handleDeleteChip('status', status)}
              color="primary"
              variant="outlined"
            />
          ))}
        {showFilterChip && filters.type && filters.type !== 'all' && (
          <Chip
            className={classes.chips}
            label={filters.type === 'IMPORT_I2B2' ? 'Cohorte I2B2' : 'Cohorte Cohort360'}
            onDelete={() => handleDeleteChip('type')}
            color="primary"
            variant="outlined"
          />
        )}
        {showFilterChip && filters.minPatients && (
          <Chip
            className={classes.chips}
            label={`Au moins ${filters.minPatients} patients`}
            onDelete={() => handleDeleteChip('minPatients')}
            color="primary"
            variant="outlined"
          />
        )}
        {showFilterChip && filters.maxPatients && (
          <Chip
            className={classes.chips}
            label={`Jusque ${filters.maxPatients} patients`}
            onDelete={() => handleDeleteChip('maxPatients')}
            color="primary"
            variant="outlined"
          />
        )}
        {showFilterChip && filters.startDate && (
          <Chip
            className={classes.chips}
            label={`Après le : ${moment(filters.startDate).format('DD/MM/YYYY')}`}
            onDelete={() => handleDeleteChip('startDate')}
            color="primary"
            variant="outlined"
          />
        )}
        {showFilterChip && filters.endDate && (
          <Chip
            className={classes.chips}
            label={`Avant le : ${moment(filters.endDate).format('DD/MM/YYYY')}`}
            onDelete={() => handleDeleteChip('endDate')}
            color="primary"
            variant="outlined"
          />
        )}
        {showFilterChip && filters.favorite && filters.favorite !== 'all' && (
          <Chip
            className={classes.chips}
            label={filters.favorite === 'True' ? 'Cohortes favories' : 'Cohortes non favories'}
            onDelete={() => handleDeleteChip('favorite')}
            color="primary"
            variant="outlined"
          />
        )}
      </Grid>
      {loadingStatus ? (
        <Grid container justify="center">
          <CircularProgress />
        </Grid>
      ) : (
        <ResearchTable
          simplified={simplified}
          researchData={researches}
          onDeleteCohort={onDeleteCohort}
          onSetCohortFavorite={onSetCohortFavorite}
          onClickRow={onClickRow}
          sortBy={sortBy}
          sortDirection={sortDirection}
          onRequestSort={handleRequestSort}
        />
      )}
      <Pagination
        className={classes.pagination}
        count={Math.ceil(total / researchLines)}
        shape="rounded"
        onChange={handleChangePage}
        page={page}
      />
      <CohortsFilter
        open={open}
        onClose={handleCloseDialog(false)}
        onSubmit={handleCloseDialog(true)}
        filters={filters}
        onChangeFilters={setFilters}
      />
    </Grid>
  )
}

export default Research
