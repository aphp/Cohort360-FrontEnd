import React, { useState, useEffect } from 'react'

import { CircularProgress, Grid, IconButton, InputBase } from '@material-ui/core'
import Pagination from '@material-ui/lab/Pagination'

import { ReactComponent as SearchIcon } from '../../assets/icones/search.svg'

import ResearchTable from './ResearchTable/ResearchTable'
import { fetchCohorts, setFavorite } from '../../services/savedResearches'

import useStyles from './styles'
import { FormattedCohort } from 'types'

type ResearchProps = {
  simplified?: boolean
  onClickRow?: Function
  filteredIds?: string[]
}
const Research: React.FC<ResearchProps> = ({ simplified, onClickRow, filteredIds }) => {
  const classes = useStyles()
  const [page, setPage] = useState(1)
  const [researches, setResearches] = useState<FormattedCohort[] | undefined>()
  const [loadingStatus, setLoadingStatus] = useState(true)
  const [total, setTotal] = useState(0)
  const [searchInput, setSearchInput] = useState('')

  const researchLines = 20 // Number of desired lines in the document array

  useEffect(() => {
    fetchCohorts()
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
  }, []) // eslint-disable-line

  const onDeleteCohort = async (cohortId: string) => {
    setResearches(researches?.filter((r) => r.researchId !== cohortId))
  }

  const onSetCohortFavorite = async (cohortId: string, favStatus: boolean) => {
    setFavorite(cohortId, favStatus)
      .then(() => fetchCohorts())
      .then((cohortsResp) => {
        setResearches(cohortsResp?.results ?? undefined)
        setTotal(cohortsResp?.count ?? 0)
      })
  }

  const handleChangePage = (event?: React.ChangeEvent<unknown>, value = 1) => {
    setPage(value)
    setLoadingStatus(true)
    fetchCohorts(searchInput, value || 1)
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

  const onKeyDown = async (e: React.KeyboardEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    if (e.keyCode === 13) {
      e.preventDefault()
      onSearchCohort()
    }
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
