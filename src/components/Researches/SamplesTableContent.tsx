import React, { useCallback, useContext, useMemo } from 'react'
import { AppConfig } from 'config'
import { useNavigate, useParams } from 'react-router-dom'

import CenteredCircularProgress from 'components/ui/CenteredCircularProgress'
import DataTable from 'components/ui/Table'
import { StickyPagination } from 'components/ui/Pagination'

import { Cohort } from 'types'
import { OrderBy } from 'types/searchCriterias'
import { mapSamplesToTable } from 'mappers/samples'
import { BaseCohortCallbacks } from 'types/cohorts'

type SamplesTableContentProps = {
  list: Cohort[]
  selectedCohorts: Cohort[]
  page: number
  setPage: (page: number) => void
  total: number
  loading: boolean
  order: OrderBy
  disabled: boolean
  onChangeOrderBy: (newOrder: OrderBy) => void
  onSelectAll: () => void
  cohortsCallbacks: BaseCohortCallbacks
}

const SamplesTableContent: React.FC<SamplesTableContentProps> = ({
  list,
  page,
  setPage,
  total,
  loading,
  order,
  onChangeOrderBy,
  disabled,
  selectedCohorts,
  onSelectAll,
  cohortsCallbacks
}) => {
  const appConfig = useContext(AppConfig)
  const navigate = useNavigate()
  const { cohortId } = useParams()

  const onClickCohortVersion = useCallback(
    (cohort: Cohort) => {
      navigate(`/cohort/new/${cohort.request?.uuid}/${cohort.request_query_snapshot}`)
    },
    [navigate]
  )

  const _cohortsCallbacks = useMemo(
    () => ({
      ...cohortsCallbacks,
      onClickCohortVersion,
      onSelectAll
    }),
    [cohortsCallbacks, onClickCohortVersion, onSelectAll]
  )

  const table = useMemo(
    () => mapSamplesToTable(list, appConfig, _cohortsCallbacks, selectedCohorts, cohortId, disabled),
    [list, appConfig, _cohortsCallbacks, selectedCohorts, cohortId, disabled]
  )

  const rowsPerPage = 20

  return loading ? (
    <CenteredCircularProgress />
  ) : (
    <>
      <DataTable value={table} orderBy={order} onSort={(newOrder) => onChangeOrderBy(newOrder)} />
      <StickyPagination count={Math.ceil((total ?? 0) / rowsPerPage)} currentPage={page} onPageChange={setPage} />
    </>
  )
}

export default SamplesTableContent
