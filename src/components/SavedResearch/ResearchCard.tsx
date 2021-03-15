import React, { useState, useEffect } from 'react'

import { CircularProgress, Grid, IconButton, InputAdornment, InputBase } from '@material-ui/core'
import Pagination from '@material-ui/lab/Pagination'

import ClearIcon from '@material-ui/icons/Clear'
import { ReactComponent as SearchIcon } from '../../assets/icones/search.svg'

import ResearchTable from './ResearchTable/ResearchTable'
import { fetchCohorts } from '../../services/savedResearches'

import useStyles from './styles'
import { FormattedCohort } from 'types'

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
  const [sortBy, setSortBy] = useState('date')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')

  const researchLines = 20 // Number of desired lines in the document array

  useEffect(() => {
    onFetchCohorts(sortBy, sortDirection)
  }, []) // eslint-disable-line

  const onFetchCohorts = (sortBy = 'given', sortDirection = 'asc', input = searchInput) => {
    setLoadingStatus(true)
    setPage(1)
    setSortBy(sortBy)
    setSortDirection(sortDirection as 'asc' | 'desc')
    fetchCohorts(sortBy, sortDirection, input)
      .then((cohortsResp) => {
        if (filteredIds) {
          setResearches(
            cohortsResp ? cohortsResp?.results?.filter((r) => !filteredIds.includes(r.researchId)) : undefined
          )
        } else {
          setResearches(cohortsResp?.results ?? undefined)
        }
        setTotal(cohortsResp?.count ?? 0)
      })
      .then(() => {
        setLoadingStatus(false)
      })
  }

  const onDeleteCohort = async (cohortId: string) => {
    setResearches(researches?.filter((r) => r.researchId !== cohortId))
    dispatch(deleteUserCohortThunk({ cohortId }))
  }

  const onSetCohortFavorite = async (cohortId: string) => {
    dispatch(setFavoriteCohortThunk({ cohortId })).then(() =>
      fetchCohorts(sortBy, sortDirection).then((cohortsResp) => {
        setResearches(cohortsResp?.results ?? undefined)
        setTotal(cohortsResp?.count ?? 0)
      })
    )
  }

  const handleChangePage = (event?: React.ChangeEvent<unknown>, value = 1) => {
    setPage(value)
    setLoadingStatus(true)
    fetchCohorts(sortBy, sortDirection, searchInput, value || 1)
      .then((cohortsResp) => {
        setResearches(cohortsResp?.results ?? undefined)
        setTotal(cohortsResp?.count ?? 0)
      })
      .catch((error) => console.log(error))
      .then(() => {
        setLoadingStatus(false)
      })
  }

  const handleChangeInput = (event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    setSearchInput(event.target.value)
  }

  const onSearchCohort = async () => {
    handleChangePage()
  }

  const handleClearInput = () => {
    setSearchInput('')
    setLoadingStatus(true)
    fetchCohorts(sortBy, sortDirection)
      .then((cohortsResp) => {
        if (filteredIds) {
          setResearches(
            cohortsResp ? cohortsResp?.results?.filter((r) => !filteredIds.includes(r.researchId)) : undefined
          )
        } else {
          setResearches(cohortsResp?.results ?? undefined)
        }
        setTotal(cohortsResp?.count ?? 0)
      })
      .then(() => {
        setLoadingStatus(false)
      })
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

  return (
    <Grid container justify="flex-end" className={classes.documentTable}>
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
                <IconButton onClick={handleClearInput}>{searchInput && <ClearIcon />}</IconButton>
              </InputAdornment>
            }
          />
          <IconButton type="submit" aria-label="search" onClick={onSearchCohort}>
            <SearchIcon fill="#ED6D91" height="15px" />
          </IconButton>
        </Grid>
      </div>
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
    </Grid>
  )
}

export default Research
