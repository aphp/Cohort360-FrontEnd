import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

import {
  Button,
  CircularProgress,
  Grid,
  IconButton,
  InputAdornment,
  InputBase,
  Pagination,
  Typography
} from '@mui/material'

import ClearIcon from '@mui/icons-material/Clear'
import { ReactComponent as SearchIcon } from 'assets/icones/search.svg'
import { ReactComponent as FilterList } from 'assets/icones/filter.svg'

import ResearchTable from './ResearchTable/ResearchTable'
import CohortsFilter from 'components/Filters/CohortsFilters/CohortsFilters'
import MasterChips from 'components/MasterChips/MasterChips'

import useStyles from './styles'
import { Cohort, CohortFilters, Sort } from 'types'

import displayDigit from 'utils/displayDigit'
import { buildCohortFiltersChips } from 'utils/chips'

import { useAppSelector, useAppDispatch } from 'state'
import { deleteCohort, editCohort, fetchCohorts } from 'state/cohort'
import { useDebounce } from 'utils/debounce'

type ResearchProps = {
  simplified?: boolean
  onClickRow?: Function
  filteredIds?: string[]
}
const Research: React.FC<ResearchProps> = ({ simplified, onClickRow }) => {
  const { classes } = useStyles()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()

  const cohortState = useAppSelector((state) => state.cohort)

  const loadingStatus = cohortState.loading

  const [searchInput, setSearchInput] = useState('')

  const search = new URLSearchParams(location.search)
  const favInUrl = (search.get('fav') ?? 'false') === 'true'

  const [page, setPage] = useState(1)
  const [sort, setSort] = useState<Sort>({
    sortBy: 'modified_at',
    sortDirection: 'desc'
  })

  const [open, setOpen] = useState(false)

  const rowsPerPage = 20
  const debouncedSearchItem = useDebounce(500, searchInput)

  const [filters, setFilters] = useState<CohortFilters>({
    status: [],
    favorite: favInUrl ? 'True' : 'all',
    minPatients: null,
    maxPatients: null,
    startDate: null,
    endDate: null
  })

  const onFetchCohorts = async (_page?: number) => {
    dispatch(
      fetchCohorts({
        filters,
        sort,
        searchInput,
        limit: rowsPerPage,
        page: _page ? _page : page
      })
    )
  }

  useEffect(() => {
    onFetchCohorts()
  }, [filters, sort, page, debouncedSearchItem]) // eslint-disable-line

  const onEditCohort = () => {
    if (sort.sortBy === 'modified_at' && sort.sortDirection === 'desc') {
      setPage(1)
      onFetchCohorts(1)
    } else {
      onFetchCohorts()
    }
  }

  const onDeleteCohort = async (cohort: Cohort) => {
    await dispatch(deleteCohort({ deletedCohort: cohort }))
    onFetchCohorts()
  }

  const onSetCohortFavorite = async (cohort: Cohort) => {
    await dispatch(editCohort({ editedCohort: { ...cohort, favorite: !cohort.favorite } }))
    if (sort.sortBy === 'modified_at' && sort.sortDirection === 'desc') {
      setPage(1)
      onFetchCohorts(1)
    } else {
      onFetchCohorts()
    }
  }

  const handleChangeInput = (event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    setSearchInput(event.target.value)
  }

  const handleClearInput = async () => {
    setSearchInput('')
  }

  const onKeyDown = async (e: React.KeyboardEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
    }
  }

  const handleRequestSort = (event: React.MouseEvent<unknown>, property: any) => {
    const isAsc: boolean = sort.sortBy === property && sort.sortDirection === 'asc'
    const _sortDirection = isAsc ? 'desc' : 'asc'

    setSort({ sortBy: property, sortDirection: _sortDirection })
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
        navigate({ pathname: location.pathname })
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
      <Grid item container justifyContent="space-between" alignItems="center">
        <Typography variant="button">
          {displayDigit(cohortState.count ?? 0)} cohorte{cohortState.count > 1 ? 's' : ''}
        </Typography>
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
            <IconButton type="submit" aria-label="search" onClick={() => onFetchCohorts()}>
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
            researchData={cohortState.cohortsList}
            onDeleteCohort={onDeleteCohort}
            onSetCohortFavorite={onSetCohortFavorite}
            onClickRow={onClickRow}
            sortBy={sort.sortBy}
            sortDirection={sort.sortDirection}
            onRequestSort={handleRequestSort}
            onUpdateCohorts={onEditCohort}
          />

          <Pagination
            className={classes.pagination}
            count={Math.ceil((cohortState.count ?? 0) / rowsPerPage)}
            shape="circular"
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
