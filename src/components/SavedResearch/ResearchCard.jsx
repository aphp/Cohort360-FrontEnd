import React, { useState, useEffect } from 'react'

import Pagination from '@material-ui/lab/Pagination'
import Grid from '@material-ui/core/Grid'
import InputBase from '@material-ui/core/InputBase'
import IconButton from '@material-ui/core/IconButton'
import CircularProgress from '@material-ui/core/CircularProgress'

import { ReactComponent as SearchIcon } from '../../assets/icones/search.svg'

import ResearchTable from './ResearchTable/ResearchTable'

import useStyles from './style'

import { fetchCohorts, setFavorite } from '../../services/savedResearches'

const Research = ({ simplified, onClickRow, filteredIds }) => {
  const classes = useStyles()
  const [page, setPage] = useState(1)
  const [researches, setResearches] = useState([])
  const [loadingStatus, setLoadingStatus] = useState(true)
  const [total, setTotal] = useState(0)
  const [searchInput, setSearchInput] = useState('')

  const researchLines = 20 // Number of desired lines in the document array

  useEffect(() => {
    fetchCohorts()
      .then(({ formattedCohort, total }) => {
        setResearches(formattedCohort)
        setTotal(total)
      })
      .then(() => {
        setLoadingStatus(false)
      })
  }, [])

  const onDeleteCohort = async (cohortId) => {
    setResearches(researches.filter((r) => r.researchId !== cohortId))
  }

  const onSetCohortFavorite = async (cohortId, favStatus) => {
    setFavorite(cohortId, favStatus)
      .then(() => fetchCohorts())
      .then(({ formattedCohort, total }) => {
        setResearches(formattedCohort)
        setTotal(total)
      })
  }

  const handleChangeInput = (event) => {
    setSearchInput(event.target.value)
  }

  const onSearchCohort = async () => {
    handleChangePage(1)
  }

  const onKeyDown = async (e) => {
    if (e.keyCode === 13) {
      e.preventDefault()
      onSearchCohort()
    }
  }

  const handleChangePage = (event, value) => {
    setPage(value || 1)
    setLoadingStatus(true)
    fetchCohorts(searchInput, value || 1)
      .then(({ formattedCohort, total }) => {
        setResearches(formattedCohort)
        setTotal(total)
      })
      .catch((error) => console.log(error))
      .then(() => {
        setLoadingStatus(false)
      })
  }

  return (
    <Grid container justify="flex-end" className={classes.documentTable}>
      <div className={classes.tableButtons}>
        <Grid
          item
          container
          xs={10}
          alignItems="center"
          className={classes.searchBar}
        >
          <InputBase
            placeholder="Rechercher"
            className={classes.input}
            value={searchInput}
            onChange={handleChangeInput}
            onKeyDown={onKeyDown}
          />
          <IconButton
            type="submit"
            aria-label="search"
            onClick={onSearchCohort}
          >
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
          researchLines={researchLines}
          researchData={researches}
          onDeleteCohort={onDeleteCohort}
          onSetCohortFavorite={onSetCohortFavorite}
          onClickRow={onClickRow}
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
