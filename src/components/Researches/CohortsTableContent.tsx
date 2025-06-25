import React, { useContext, useMemo } from 'react'
import { AppConfig } from 'config'
import { useNavigate, useParams } from 'react-router-dom'

import CenteredCircularProgress from 'components/ui/CenteredCircularProgress'
import { ChipStatus } from 'components/ui/StatusChip'
import UpdateIcon from '@mui/icons-material/Update'

import { Cohort, JobStatus } from 'types'
import { OrderBy } from 'types/searchCriterias'
import DataTable from 'components/ui/Table'
import { mapCohortsToTable } from 'mappers/cohorts'
import { StickyContainer } from 'components/ui/Pagination/styles'
import { Pagination } from 'components/ui/Pagination'

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

type CohortCallbacks = {
  onClickRow: (cohort: Cohort) => void
  onClickFav: (cohort: Cohort) => void
  onClickExport: (cohort: Cohort) => void
  onClickEdit: (cohort: Cohort) => void
  onClickCreateSample: (cohort: Cohort) => void
  onSelectCohort: (cohort: Cohort) => void
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
  cohortsCallbacks: CohortCallbacks
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
  const { onClickCreateSample, onClickRow, onClickFav, onClickExport, onClickEdit, onSelectCohort } = cohortsCallbacks

  const table = useMemo(
    () => mapCohortsToTable(cohortsList, simplified, appConfig, requestId, disabled),
    [cohortsList, simplified, appConfig, requestId, disabled]
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
