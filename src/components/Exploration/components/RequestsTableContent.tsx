import React from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import { Box, Checkbox, CircularProgress, IconButton, TableRow, Tooltip, Typography } from '@mui/material'
import ArrowRightAltIcon from '@mui/icons-material/ArrowRightAlt'
import Button from 'components/ui/Button'
import ResearchesTable from './Table'
import { TableCellWrapper } from './Table/styles'

import EditIcon from '@mui/icons-material/Edit'
import ShareIcon from '@mui/icons-material/Share'

import { Column, RequestType } from 'types'
import { Order, OrderBy } from 'types/searchCriterias'
import { getCohortTotal, getRequestName } from 'utils/explorationUtils'
import { formatDate } from 'utils/formatDate'
import { isChecked } from 'utils/filters'

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
  noPagination?: boolean
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
  noPagination
}) => {
  const navigate = useNavigate()
  const { projectId } = useParams()

  const columns: Column[] = [
    {
      label: (
        <Checkbox
          size="small"
          checked={selectedRequests.length === requestsList.length}
          indeterminate={selectedRequests.length > 0 && selectedRequests.length < requestsList.length}
          onClick={onSelectAll}
          sx={{ padding: 0 }}
        />
      )
    },
    { label: 'nom de la requête', align: 'left', code: Order.NAME },
    { label: '', align: 'left' },
    ...(!projectId ? [{ label: 'projet' }] : []),
    { label: 'date de modification', code: Order.UPDATED },
    { label: 'nb de cohortes' }
  ]

  return loading ? (
    <Box display="flex" width={'100%'} justifyContent={'center'}>
      <CircularProgress size={50} />
    </Box>
  ) : (
    <ResearchesTable
      columns={columns}
      page={page}
      setPage={setPage}
      total={total}
      order={order}
      setOrder={(newOrder) => onChangeOrderBy(newOrder)}
      noPagination={noPagination}
    >
      {requestsList.map((request) => {
        const cohortTotal = getCohortTotal(request.query_snapshots)

        return (
          <TableRow
            key={request.uuid}
            onClick={() => navigate(`/cohort/new/${request.uuid}`)}
            style={{ cursor: 'pointer' }}
          >
            <TableCellWrapper>
              <Checkbox
                size="small"
                checked={isChecked(request, selectedRequests)}
                onClick={(event) => {
                  event.stopPropagation()
                  onSelectRequest(request)
                }}
                sx={{ padding: 0 }}
              />
            </TableCellWrapper>
            <TableCellWrapper align="left" accentCell>
              {getRequestName(request)}
            </TableCellWrapper>
            <TableCellWrapper>
              <Box display={'flex'} flexWrap={'nowrap'}>
                <Tooltip title="Partager la requête">
                  <IconButton
                    style={{ color: '#2b2b2b' }}
                    size="small"
                    onClick={(event) => {
                      event.stopPropagation()
                      onShareRequest(request)
                    }}
                    disabled={disabled}
                  >
                    <ShareIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Éditer la requête">
                  <IconButton
                    style={{ color: '#2b2b2b' }}
                    size="small"
                    onClick={(event) => {
                      event.stopPropagation()
                      onClickEdit(request)
                    }}
                    disabled={disabled}
                  >
                    <EditIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            </TableCellWrapper>
            {!projectId && <TableCellWrapper>{request.parent_folder?.name}</TableCellWrapper>}
            <TableCellWrapper>{formatDate(request.updated_at, true)}</TableCellWrapper>
            <TableCellWrapper>
              <Button
                customVariant="clear"
                disabled={cohortTotal < 1}
                endIcon={<ArrowRightAltIcon />}
                onClick={(event) => {
                  event.stopPropagation()
                  navigate(
                    projectId
                      ? `/researches/projects/${projectId}/${request.uuid}${location.search}`
                      : `/researches/requests/${request.uuid}${location.search}`
                  )
                }}
              >
                <Typography variant="button" noWrap fontSize={'12px'}>
                  {cohortTotal} cohorte{cohortTotal > 1 && 's'}
                </Typography>
              </Button>
            </TableCellWrapper>
          </TableRow>
        )
      })}
    </ResearchesTable>
  )
}

export default RequestsTableContent
