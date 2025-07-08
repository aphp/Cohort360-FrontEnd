import React, { useCallback, useContext, useMemo } from 'react'
import { AppConfig } from 'config'
import { useNavigate, useParams } from 'react-router-dom'

import CenteredCircularProgress from 'components/ui/CenteredCircularProgress'
import DataTable from 'components/ui/Table'
import { StickyPagination } from 'components/ui/Pagination'

import { Cohort } from 'types'
import { OrderBy } from 'types/searchCriterias'
import { mapCohortsToTable } from 'mappers/cohorts'
import { redirectToSamples } from 'utils/explorationUtils'
import { BaseCohortCallbacks } from 'types/cohorts'

type CohortsTableContentProps = {
  cohortsList: Cohort[]
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
  simplified?: boolean
}

const CohortsTableContent: React.FC<CohortsTableContentProps> = ({
  cohortsList,
  page,
  setPage,
  total,
  loading,
  order,
  onChangeOrderBy,
  disabled,
  selectedCohorts,
  onSelectAll,
  cohortsCallbacks,
  simplified = false
}) => {
  const appConfig = useContext(AppConfig)
  const navigate = useNavigate()
  const { projectId, requestId } = useParams()

  const onClickCohortVersion = useCallback(
    (cohort: Cohort) => {
      navigate(`/cohort/new/${cohort.request?.uuid}/${cohort.request_query_snapshot}`)
    },
    [navigate]
  )

  const onClickSamples = useCallback(
    (cohort: Cohort) => {
      navigate(redirectToSamples(cohort.uuid as string, requestId, projectId))
    },
    [navigate, requestId, projectId]
  )

  const _cohortsCallbacks = useMemo(
    () => ({
      ...cohortsCallbacks,
      onClickCohortVersion,
      onClickSamples,
      onSelectAll
    }),
    [cohortsCallbacks, onClickCohortVersion, onClickSamples, onSelectAll]
  )

  const table = useMemo(
    () =>
      mapCohortsToTable(cohortsList, simplified, appConfig, _cohortsCallbacks, selectedCohorts, requestId, disabled),
    [cohortsList, simplified, appConfig, _cohortsCallbacks, selectedCohorts, requestId, disabled]
  )

  const rowsPerPage = simplified ? 5 : 20

  return loading ? (
    <CenteredCircularProgress />
  ) : (
    <>
      <DataTable
        value={table}
        orderBy={order}
        onSort={(newOrder) => onChangeOrderBy(newOrder)}
        noMarginBottom={simplified}
      />
      {!simplified && (
        <StickyPagination currentPage={page} count={Math.ceil((total ?? 0) / rowsPerPage)} onPageChange={setPage} />
      )}
    </>
  )
}

export default CohortsTableContent
