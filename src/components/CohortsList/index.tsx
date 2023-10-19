import React, { useState, useEffect, useMemo, useRef } from 'react'

import { Chip, CircularProgress, Grid, Pagination } from '@mui/material'

import { ReactComponent as FilterList } from 'assets/icones/filter.svg'

import ResearchTable from './ResearchTable'

import useStyles from './styles'
import { Cohort, LoadingStatus } from 'types'

import { useAppSelector, useAppDispatch } from 'state'
import { deleteCohort, editCohort, fetchCohorts } from 'state/cohort'
import { FilterKeys, OrderBy } from 'types/searchCriterias'
import Modal from 'components/ui/Modal'
import { CanceledError } from 'axios'
import DatesRangeFilter from 'components/Filters/DatesRangeFilter/DatesRangeFilter'
import DisplayDigits from 'components/ui/Display/DisplayDigits'
import { BlockWrapper } from 'components/ui/Layout'
import Searchbar from 'components/ui/Searchbar'
import SearchInput from 'components/ui/Searchbar/SearchInput'
import useSearchCriterias, { initCohortsSearchCriterias } from 'reducers/searchCriteriasReducer'
import { _cancelPendingRequest } from 'utils/abortController'
import { selectFiltersAsArray } from 'utils/filters'
import Button from 'components/ui/Button'
import { CohortsType } from 'types/cohorts'

type CohortsListProps = {
  preview?: boolean
  favoriteUrl?: boolean
  limit?: number
}
const CohortsList = ({ preview = false, limit = 20, favoriteUrl = false }: CohortsListProps) => {
  const { classes } = useStyles()

  const dispatch = useAppDispatch()

  const cohortState = useAppSelector((state) => state.cohort)

  const [toggleModal, setToggleModal] = useState(false)
  const [page, setPage] = useState(1)
  const [loadingStatus, setLoadingStatus] = useState(LoadingStatus.FETCHING)

  const [
    {
      orderBy,
      searchInput,
      filters,
      filters: { status, startDate, endDate, minPatients, maxPatients, favorite }
    },
    { changeOrderBy, changeSearchInput, addFilters, removeFilter }
  ] = useSearchCriterias(initCohortsSearchCriterias)

  const filtersAsArray = useMemo(() => {
    return selectFiltersAsArray({ status, startDate, endDate, minPatients, maxPatients, favorite })
  }, [status, startDate, endDate, minPatients, maxPatients, favorite])

  const controllerRef = useRef<AbortController>(new AbortController())

  const onFetchCohorts = async () => {
    try {
      setLoadingStatus(LoadingStatus.FETCHING)
      await dispatch(
        fetchCohorts({
          options: {
            limit: limit,
            page: page,
            searchCriterias: { filters, orderBy, searchInput }
          },
          signal: controllerRef.current?.signal
        })
      )
      setLoadingStatus(LoadingStatus.SUCCESS)
    } catch (error) {
      if (error instanceof CanceledError) {
        setLoadingStatus(LoadingStatus.FETCHING)
      }
    }
  }

  useEffect(() => {
    addFilters({ ...filters, favorite: favoriteUrl ? CohortsType.FAVORITE : CohortsType.ALL })
  }, [favoriteUrl])

  useEffect(() => {
    setLoadingStatus(LoadingStatus.IDDLE)
    setPage(1)
  }, [status, startDate, endDate, minPatients, maxPatients, searchInput, orderBy, favorite])

  useEffect(() => {
    setLoadingStatus(LoadingStatus.IDDLE)
  }, [page])

  useEffect(() => {
    if (loadingStatus === LoadingStatus.IDDLE) {
      controllerRef.current = _cancelPendingRequest(controllerRef.current)
      onFetchCohorts()
    }
  }, [loadingStatus])

  const onEditCohort = () => {
    setLoadingStatus(LoadingStatus.IDDLE)
  }

  const onDeleteCohort = async (cohort: Cohort) => {
    await dispatch(deleteCohort({ deletedCohort: cohort }))
    setLoadingStatus(LoadingStatus.IDDLE)
  }

  const onSetCohortFavorite = async (cohort: Cohort) => {
    await dispatch(editCohort({ editedCohort: { ...cohort, favorite: !cohort.favorite } }))
    setLoadingStatus(LoadingStatus.IDDLE)
  }
  console.log('cohortState', cohortState)

  return (
    <>
      {!preview && (
        <BlockWrapper
          container
          justifyContent="space-between"
          alignItems="center"
          item
          xs={12}
          margin={'0px 0px 50px 0px'}
        >
          <Grid item xs={12} md={4}>
            {(loadingStatus === LoadingStatus.FETCHING || loadingStatus === LoadingStatus.IDDLE) && (
              <CircularProgress />
            )}
            {loadingStatus !== LoadingStatus.FETCHING && loadingStatus !== LoadingStatus.IDDLE && (
              <DisplayDigits nb={cohortState.count} label={`cohorte${cohortState.count > 1 ? 's' : ''}`} />
            )}
          </Grid>
          <Grid item xs={12} md={7}>
            <Searchbar>
              <SearchInput
                value={searchInput}
                placeholder={'Rechercher dans les cohortes'}
                onchange={(newValue) => changeSearchInput(newValue)}
              />
              <Button
                width={'150px'}
                icon={<FilterList height="15px" fill="#FFF" />}
                onClick={() => setToggleModal(true)}
              >
                Filtrer
              </Button>
            </Searchbar>
          </Grid>

          <Modal
            title="Filtrer par :"
            width={'600px'}
            open={toggleModal}
            onClose={() => setToggleModal(false)}
            onSubmit={(newFilters) => addFilters({ ...filters, ...newFilters })}
          >
            <DatesRangeFilter values={[startDate, endDate]} names={[FilterKeys.START_DATE, FilterKeys.END_DATE]} />
          </Modal>
        </BlockWrapper>
      )}

      {!preview && filtersAsArray?.length > 0 && (
        <Grid item xs={12} margin={'0px 0px 10px 0px'}>
          {filtersAsArray.map((filter, index) => (
            <Chip key={index} label={filter.label} onDelete={() => removeFilter(filter.category, filter.value)} />
          ))}
        </Grid>
      )}

      {loadingStatus === LoadingStatus.IDDLE || loadingStatus === LoadingStatus.FETCHING ? (
        <Grid container justifyContent="center">
          <CircularProgress />
        </Grid>
      ) : (
        <Grid container justifyContent="flex-end">
          <ResearchTable
            data={favorite === CohortsType.FAVORITE ? cohortState.favoriteCohortsList : cohortState.cohortsList}
            onDelete={onDeleteCohort}
            onSetFavorite={onSetCohortFavorite}
            orderBy={orderBy.orderBy}
            orderDirection={orderBy.orderDirection}
            onChangeOrder={(orderBy: OrderBy) => changeOrderBy(orderBy)}
            onEdit={onEditCohort}
          />

          {!preview && cohortState.cohortsList.length > 0 && (
            <Pagination
              className={classes.pagination}
              count={Math.ceil((cohortState.count ?? 0) / limit)}
              shape="circular"
              onChange={(event, page: number) => setPage && setPage(page)}
              page={page}
            />
          )}
        </Grid>
      )}

      {/*<CohortsFilter open={open} onClose={() => setOpen(false)} filters={filters} onChangeFilters={setFilters} />*/}
    </>
  )
}

export default CohortsList
