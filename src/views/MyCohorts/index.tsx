import React, { useContext, useEffect, useMemo, useRef, useState } from 'react'
import { useAppDispatch, useAppSelector } from 'state'

import { Chip, CircularProgress, CssBaseline, Grid, Typography } from '@mui/material'

import useStyles from './styles'
import { FilterList } from '@mui/icons-material'
import CohortStatusFilter from 'components/Filters/CohortStatusFilter'
import CohortsTypesFilter from 'components/Filters/CohortsTypeFilter'
import DatesRangeFilter from 'components/Filters/DatesRangeFilter'
import PatientsNbFilter from 'components/Filters/PatientsNbFilter'
import DisplayDigits from 'components/ui/Display/DisplayDigits'
import { BlockWrapper } from 'components/ui/Layout'
import Searchbar from 'components/ui/Searchbar'
import SearchInput from 'components/ui/Searchbar/SearchInput'
import { LoadingStatus, WebSocketJobName, WebSocketJobStatus, WebSocketMessage } from 'types'
import { CohortsType } from 'types/cohorts'
import { FilterKeys, OrderBy } from 'types/searchCriterias'
import { selectFiltersAsArray } from 'utils/filters'
import { CanceledError } from 'axios'
import useSearchCriterias, { initCohortsSearchCriterias } from 'reducers/searchCriteriasReducer'
import { fetchCohorts } from 'state/cohort'
import { cancelPendingRequest } from 'utils/abortController'
import Modal from 'components/ui/Modal'
import Button from 'components/ui/Button'
import ResearchTable from 'components/CohortsTable'
import { WebSocketContext } from 'components/WebSocket/WebSocketProvider'
import servicesCohorts from 'services/aphp/serviceCohorts'
import { Pagination } from 'components/ui/Pagination'
import { useSearchParams } from 'react-router-dom'
import { checkIfPageAvailable } from 'utils/paginationUtils'

const statusOptions = [
  {
    display: 'Terminé',
    code: 'finished'
  },
  {
    display: 'En attente',
    code: 'pending,started'
  },
  {
    display: 'Erreur',
    code: 'failed'
  }
]

type MyCohortsProps = {
  favoriteUrl?: boolean
}

const MyCohorts = ({ favoriteUrl = false }: MyCohortsProps) => {
  const [searchParams, setSearchParams] = useSearchParams()
  const getPageParam = searchParams.get('page')

  const { classes, cx } = useStyles()
  const openDrawer = useAppSelector((state) => state.drawer)
  const cohortState = useAppSelector((state) => state.cohort)

  const dispatch = useAppDispatch()

  const webSocketContext = useContext(WebSocketContext)

  const [cohortList, setCohortList] = useState(cohortState.cohortsList)
  const [toggleModal, setToggleModal] = useState(false)
  const [page, setPage] = useState(getPageParam ? parseInt(getPageParam, 10) : 1)
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
  const isFirstRender = useRef(true)

  const onFetchCohorts = async () => {
    try {
      setLoadingStatus(LoadingStatus.FETCHING)
      const response = await dispatch(
        fetchCohorts({
          options: {
            page: page,
            searchCriterias: { filters, orderBy, searchInput }
          },
          signal: controllerRef.current?.signal
        })
      )
      if (response) {
        checkIfPageAvailable(cohortState.count, page, setPage)
      }
      setLoadingStatus(LoadingStatus.SUCCESS)
    } catch (error) {
      if (error instanceof CanceledError) {
        setLoadingStatus(LoadingStatus.FETCHING)
      }
    }
  }

  useEffect(() => {
    setCohortList(cohortState.cohortsList)
  }, [cohortState.cohortsList])

  useEffect(() => {
    const listener = async (message: WebSocketMessage) => {
      if (message.job_name === WebSocketJobName.CREATE && message.status === WebSocketJobStatus.finished) {
        const websocketUpdatedCohorts = cohortList.map((cohort) => {
          const temp = Object.assign({}, cohort)
          if (temp.uuid === message.uuid) {
            if (temp.dated_measure_global) {
              temp.dated_measure_global = {
                ...temp.dated_measure_global,
                measure_min: message.extra_info?.global ? message.extra_info.global.measure_min : null,
                measure_max: message.extra_info?.global ? message.extra_info.global.measure_max : null
              }
            }
            temp.request_job_status = message.status
            temp.group_id = message.extra_info?.group_id
          }
          return temp
        })
        const newCohortList = await servicesCohorts.fetchCohortsRights(websocketUpdatedCohorts)
        setCohortList(newCohortList)
      }
    }
    webSocketContext?.addListener(listener)
    return () => webSocketContext?.removeListener(listener)
  }, [cohortList, webSocketContext])

  useEffect(() => {
    addFilters({ ...filters, favorite: favoriteUrl ? CohortsType.FAVORITE : CohortsType.ALL })
  }, [favoriteUrl])

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
    } else {
      setLoadingStatus(LoadingStatus.IDDLE)
      setPage(1)
    }
  }, [status, startDate, endDate, minPatients, maxPatients, searchInput, orderBy, favorite])

  useEffect(() => {
    setLoadingStatus(LoadingStatus.IDDLE)
    setSearchParams({ page: page.toString() })
  }, [page])

  useEffect(() => {
    if (loadingStatus === LoadingStatus.IDDLE) {
      controllerRef.current = cancelPendingRequest(controllerRef.current)
      onFetchCohorts()
    }
  }, [loadingStatus])

  return (
    <Grid
      container
      direction="column"
      className={cx(classes.appBar, {
        [classes.appBarShift]: openDrawer
      })}
    >
      <Grid container justifyContent="center" alignItems="center">
        <CssBaseline />
        <Grid container item xs={11}>
          <Grid item xs={12} margin="60px 0">
            <Typography
              id="cohortSaved-title"
              variant="h1"
              color="primary"
              padding="20px 0"
              borderBottom="1px solid #D0D7D8"
            >
              Mes cohortes
            </Typography>
          </Grid>

          <BlockWrapper
            container
            justifyContent="space-between"
            alignItems="center"
            item
            xs={12}
            margin={'0px 0px 10px 0px'}
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
              <CohortStatusFilter value={status} name={FilterKeys.STATUS} allStatus={statusOptions} />
              <CohortsTypesFilter value={favorite} name={FilterKeys.FAVORITE} />
              <PatientsNbFilter
                values={[minPatients, maxPatients]}
                names={[FilterKeys.MIN_PATIENTS, FilterKeys.MAX_PATIENTS]}
              />
              <DatesRangeFilter values={[startDate, endDate]} names={[FilterKeys.START_DATE, FilterKeys.END_DATE]} />
            </Modal>
          </BlockWrapper>

          {filtersAsArray?.length > 0 && (
            <Grid item xs={12} margin={'0px 0px 10px 0px'}>
              {filtersAsArray.map((filter, index) => (
                <Chip key={index} label={filter.label} onDelete={() => removeFilter(filter.category, filter.value)} />
              ))}
            </Grid>
          )}

          <Grid container justifyContent="flex-end">
            <ResearchTable
              loading={loadingStatus !== LoadingStatus.SUCCESS}
              data={favorite === CohortsType.ALL ? cohortList : cohortState.favoriteCohortsList}
              orderBy={orderBy.orderBy}
              orderDirection={orderBy.orderDirection}
              onChangeOrder={(orderBy: OrderBy) => changeOrderBy(orderBy)}
              onUpdate={() => setLoadingStatus(LoadingStatus.IDDLE)}
            />

            {loadingStatus === LoadingStatus.SUCCESS && cohortList.length > 0 && (
              <Pagination
                currentPage={page}
                count={Math.ceil((cohortState.count ?? 0) / 20)}
                onPageChange={(newPage) => setPage && setPage(newPage)}
              />
            )}
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  )
}

export default MyCohorts
