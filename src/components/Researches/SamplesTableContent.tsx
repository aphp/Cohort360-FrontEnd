import React, { useContext, useMemo } from 'react'
import { AppConfig } from 'config'
import { useNavigate, useParams } from 'react-router-dom'

import CenteredCircularProgress from 'components/ui/CenteredCircularProgress'

import { Cohort } from 'types'
import { OrderBy } from 'types/searchCriterias'
import { mapSamplesToTable } from 'mappers/samples'
import DataTable from 'components/ui/Table'
import { StickyContainer } from 'components/ui/Pagination/styles'
import { Pagination } from 'components/ui/Pagination'

type CohortCallbacks = {
  onClickRow: (cohort: Cohort) => void
  onClickFav: (cohort: Cohort) => void
  onClickExport: (cohort: Cohort) => void
  onClickEdit: (cohort: Cohort) => void
  onClickCreateSample: (cohort: Cohort) => void
  onSelectCohort: (cohort: Cohort) => void
}

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
  cohortsCallbacks: CohortCallbacks
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
  const { onClickRow, onClickFav, onClickExport, onClickEdit, onSelectCohort } = cohortsCallbacks

  const table = useMemo(
    () => mapSamplesToTable(list, appConfig, cohortId, disabled),
    [list, appConfig, cohortId, disabled]
  )

  const rowsPerPage = 20

  return loading ? (
    <CenteredCircularProgress />
  ) : (
    <>
      <DataTable value={table} orderBy={order} onSort={(newOrder) => onChangeOrderBy(newOrder)} />
      <StickyContainer>
        <Pagination count={Math.ceil((total ?? 0) / rowsPerPage)} currentPage={page} onPageChange={setPage} />
      </StickyContainer>
    </>
  )
}

export default SamplesTableContent
