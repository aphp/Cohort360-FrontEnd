import React, { useCallback, useContext, useMemo } from 'react'
import { AppConfig } from 'config'
import { useNavigate, useParams } from 'react-router-dom'

import CenteredCircularProgress from 'components/ui/CenteredCircularProgress'
import { ChipStatus } from 'components/ui/StatusChip'
import DataTable from 'components/ui/Table'
import { Pagination } from 'components/ui/Pagination'
import { StickyContainer } from 'components/ui/Pagination/styles'
import UpdateIcon from '@mui/icons-material/Update'

import { Cohort, JobStatus } from 'types'
import { OrderBy } from 'types/searchCriterias'
import { mapCohortsToTable } from 'mappers/cohorts'
import { redirectToSamples } from 'utils/explorationUtils'
import { BaseCohortCallbacks } from 'types/cohorts'

export const mapCohortStatus = (status?: JobStatus, jobFailMessage?: string) => {
  if (jobFailMessage) {
    return { label: 'Erreur', status: ChipStatus.ERROR, tooltip: jobFailMessage }
  }

  switch (status) {
    case JobStatus.FINISHED:
      return { label: 'Terminé', status: ChipStatus.FINISHED }
    case JobStatus.PENDING:
    case JobStatus.NEW:
      return { label: 'En cours', status: ChipStatus.IN_PROGRESS }
    case JobStatus.LONG_PENDING:
      return {
        label: 'En cours',
        status: ChipStatus.IN_PROGRESS,
        icon: UpdateIcon,
        tooltip:
          "Cohorte volumineuse : sa création est plus complexe et nécessite d'être placée dans une file d'attente. Un mail vous sera envoyé quand celle-ci sera disponible."
      }
    default:
      return { label: 'Erreur', status: ChipStatus.ERROR }
  }
}

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
      <DataTable value={table} orderBy={order} onSort={(newOrder) => onChangeOrderBy(newOrder)} />
      {!simplified && (
        <StickyContainer>
          <Pagination currentPage={page} count={Math.ceil((total ?? 0) / rowsPerPage)} onPageChange={setPage} />
        </StickyContainer>
      )}
    </>
  )
}

export default CohortsTableContent
