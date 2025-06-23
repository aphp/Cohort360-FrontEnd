import React, { useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import CenteredCircularProgress from 'components/ui/CenteredCircularProgress'
import DataTable from 'components/ui/Table'
import { Pagination } from 'components/ui/Pagination'
import { StickyContainer } from 'components/ui/Pagination/styles'

import { RequestType } from 'types'
import { OrderBy } from 'types/searchCriterias'
import { mapRequestsToTable } from 'mappers/requests'

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

  const table = useMemo(
    () => mapRequestsToTable(requestsList, simplified, projectId, disabled),
    [requestsList, simplified, projectId, disabled]
  )

  return loading ? (
    <CenteredCircularProgress />
  ) : (
    <>
      <DataTable value={table} orderBy={order} onSort={(newOrder) => onChangeOrderBy(newOrder)} />
      <StickyContainer>
        <Pagination color="#5BC5F2" count={total} currentPage={page} onPageChange={setPage} centered={true} />
      </StickyContainer>
    </>
  )
}

export default RequestsTableContent
