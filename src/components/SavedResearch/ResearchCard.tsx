import React, { useState, useEffect } from 'react'
import moment from 'moment'

import { Button, CircularProgress, Grid, IconButton, InputAdornment, InputBase, Typography } from '@material-ui/core'

import ClearIcon from '@material-ui/icons/Clear'
import { ReactComponent as SearchIcon } from 'assets/icones/search.svg'
import { ReactComponent as FilterList } from 'assets/icones/filter.svg'

import ResearchTable from './ResearchTable/ResearchTable'
import CohortsFilter from 'components/Filters/CohortsFilters/CohortsFilters'
import MasterChips from 'components/MasterChips/MasterChips'

import useStyles from './styles'
import { Cohort, CohortFilters } from 'types'

import displayDigit from 'utils/displayDigit'
import { stableSort, getComparator } from 'utils/alphabeticalSort'
import { buildCohortFiltersChips } from 'utils/chips'

import { useAppSelector, useAppDispatch } from 'state'
import { fetchCohorts, deleteCohort, setFavoriteCohort } from 'state/cohort'
import { Pagination } from '@material-ui/lab'

type ResearchProps = {
  simplified?: boolean
  onClickRow?: Function
  filteredIds?: string[]
}
const Research: React.FC<ResearchProps> = ({ simplified, onClickRow }) => {
  const classes = useStyles()
  const dispatch = useAppDispatch()

  const cohortState = useAppSelector((state) => state.cohort)

  const loadingStatus = cohortState.loading

  const [researches, setResearches] = useState<Cohort[]>([])

  const [searchInput, setSearchInput] = useState('')

  const search = new URLSearchParams(location.search)
  const favInUrl = (search.get('fav') ?? 'false') === 'true'

  const [total, setTotal] = useState(cohortState.count)
  const [page, setPage] = useState(1)
  const [sortBy, setSortBy] = useState(favInUrl ? 'favorite' : 'fhir_datetime')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')

  const [open, setOpen] = useState(false)

  const [filters, setFilters] = useState<CohortFilters>({
    status: [],
    favorite: 'all',
    minPatients: null,
    maxPatients: null,
    startDate: null,
    endDate: null
  })

  useEffect(() => {
    dispatch<any>(fetchCohorts({ limit: 2, page }))
  }, [dispatch])

  useEffect(() => {
    onFetchCohorts(sortBy, sortDirection)
  }, [cohortState, filters, page]) // eslint-disable-line

  const onFetchCohorts = async (sortBy = 'given', sortDirection = 'asc', input = searchInput) => {
    const cohortsList = cohortState.cohortsList
    console.log('cohortState', cohortState)

    // if (input) {
    //   const regexp = new RegExp(`${(input || '').replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&')}`, 'gi') // eslint-disable-line
    //   cohortsList = cohortsList.filter(({ name }) => name?.search(regexp) !== -1)
    // }

    // if (filters.minPatients) {
    //   cohortsList = cohortsList.filter(({ result_size }) => (result_size ?? 0) >= parseInt(filters.minPatients ?? '0'))
    // }
    // if (filters.maxPatients) {
    //   cohortsList = cohortsList.filter(({ result_size }) => (result_size ?? 0) <= parseInt(filters.maxPatients ?? '0'))
    // }

    // if (filters.favorite && filters.favorite !== 'all') {
    //   cohortsList = cohortsList.filter(({ favorite }) =>
    //     filters.favorite === 'True' ? favorite === true : favorite === false
    //   )
    // }

    // if (filters.startDate || filters.endDate) {
    //   cohortsList = cohortsList.filter(({ modified_at }) =>
    //     filters.startDate && filters.endDate
    //       ? // Filtrer les deux
    //         moment(modified_at).isAfter(moment(filters.startDate)) &&
    //         moment(modified_at).isBefore(moment(filters.endDate))
    //       : filters.startDate
    //       ? // Filtrer par rapport à startDate
    //         moment(modified_at).isAfter(moment(filters.startDate))
    //       : // Filtrer par rapport à endDate
    //         moment(modified_at).isBefore(moment(filters.endDate))
    //   )
    // }

    // if (filters.status && filters.status.length > 0) {
    //   cohortsList = cohortsList.filter(({ request_job_status }) =>
    //     filters.status.find((status) => {
    //       return status.code === 'pending,started'
    //         ? request_job_status === 'pending' || request_job_status === 'started'
    //         : request_job_status === status.code
    //     })
    //   )
    // }

    // const sortedCohortsList = stableSort(cohortsList, getComparator(sortDirection, sortBy))
    // setResearches(sortedCohortsList)
    setResearches(cohortsList)
    setTotal(cohortState.count)
  }

  const onDeleteCohort = async (cohort: Cohort) => {
    dispatch<any>(deleteCohort({ deletedCohort: cohort }))
  }

  const onSetCohortFavorite = async (cohort: Cohort) => {
    await dispatch<any>(setFavoriteCohort({ favCohort: cohort }))
  }

  const handleChangeInput = (event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    setSearchInput(event.target.value)
  }

  const handleClearInput = async () => {
    setSearchInput('')
    onFetchCohorts(sortBy, sortDirection, '')
  }

  const onKeyDown = async (e: React.KeyboardEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      onFetchCohorts(sortBy, sortDirection)
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
            status: filters.status.filter((item) => item.code !== value.code)
          })
        break
      case 'favorite':
        setFilters({ ...filters, [filterName]: 'all' })
        break
      case 'minPatients':
      case 'maxPatients':
      case 'startDate':
      case 'endDate':
        setFilters({ ...filters, [filterName]: null })
        break
    }
  }

  return (
    <Grid container justifyContent="flex-end" className={classes.documentTable}>
      <Grid item container justifyContent="space-between">
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
            <IconButton type="submit" aria-label="search" onClick={() => onFetchCohorts(sortBy, sortDirection)}>
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

      <MasterChips chips={buildCohortFiltersChips(filters, handleDeleteChip)} />

      {loadingStatus ? (
        <Grid container justifyContent="center">
          <CircularProgress />
        </Grid>
      ) : (
        <>
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

          <Pagination
            // className={classes.pagination}
            count={Math.ceil((total ?? 0) / 20)}
            shape="rounded"
            onChange={(event, page: number) => setPage && setPage(page)}
            page={page}
          />
        </>
      )}

      <CohortsFilter open={open} onClose={() => setOpen(false)} filters={filters} onChangeFilters={setFilters} />
    </Grid>
  )
}

export default Research
