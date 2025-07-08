import React, { useCallback, useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import CenteredCircularProgress from 'components/ui/CenteredCircularProgress'
import DataTable from 'components/ui/Table'
import { StickyPagination } from 'components/ui/Pagination'

import { RequestType } from 'types'
import { OrderBy } from 'types/searchCriterias'
import { mapRequestsToTable } from 'mappers/requests'
import { cleanSearchParams } from 'utils/explorationUtils'

type RequestsTableContentProps = {
  requestsList: RequestType[]
  selectedRequests: RequestType[]
  total: number
  page: number
  setPage: (newPage: number) => void
  loading: boolean
  order: OrderBy
  onChangeOrderBy: (newOrderBy: OrderBy) => void
  onSelectRequest: (request: RequestType) => void
  onShareRequest: (request: RequestType) => void
  onClickEdit: (request: RequestType) => void
  onSelectAll: () => void
  disabled: boolean
  simplified?: boolean
}

const RequestsTableContent: React.FC<RequestsTableContentProps> = ({
  requestsList,
  selectedRequests,
  total,
  page,
  setPage,
  loading,
  order,
  onChangeOrderBy,
  onSelectRequest,
  onShareRequest,
  onClickEdit,
  onSelectAll,
  disabled,
  simplified = false
}) => {
  const navigate = useNavigate()
  const { projectId } = useParams()

  const onClickRow = useCallback(
    (request: RequestType) => {
      navigate(`/cohort/new/${request.uuid}`)
    },
    [navigate]
  )

  const onClickCohorts = useCallback(
    (request: RequestType) => {
      const cleanedSearchParams = cleanSearchParams(new URLSearchParams(location.search)).toString()
      const cleanedSearch = cleanedSearchParams ? `?${cleanedSearchParams}` : ''
      navigate(
        projectId
          ? `/researches/projects/${projectId}/${request.uuid}${cleanedSearch}`
          : `/researches/requests/${request.uuid}${cleanedSearch}`
      )
    },
    [navigate, projectId]
  )

  const callbacks = useMemo(
    () => ({
      onSelectRequest,
      onShareRequest,
      onClickEdit,
      onSelectAll,
      onClickCohorts,
      onClickRow
    }),
    [onSelectRequest, onShareRequest, onClickEdit, onSelectAll, onClickCohorts, onClickRow]
  )

  const table = useMemo(
    () => mapRequestsToTable(requestsList, simplified, callbacks, selectedRequests, projectId, disabled),
    [requestsList, simplified, callbacks, selectedRequests, projectId, disabled]
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
        <StickyPagination count={Math.ceil((total ?? 0) / rowsPerPage)} currentPage={page} onPageChange={setPage} />
      )}
    </>
  )
}

export default RequestsTableContent
