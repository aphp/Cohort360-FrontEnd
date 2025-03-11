import React from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import { Box, Checkbox, TableRow, Typography } from '@mui/material'
import ArrowRightAltIcon from '@mui/icons-material/ArrowRightAlt'
import Button from 'components/ui/Button'
import CenteredCircularProgress from 'components/ui/CenteredCircularProgress'
import IconButtonWithTooltip from '../ui/IconButtonWithTooltip'
import ResearchesTable from './ResearchesTable'
import { TableCellWrapper } from './ResearchesTable/styles'

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

  const columns: Column[] = [
    ...(!simplified
      ? [
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
          }
        ]
      : []),
    { label: 'nom de la requête', align: 'left', code: !simplified ? Order.NAME : undefined },
    { label: '', align: 'left' },
    ...(!projectId ? [{ label: 'projet', code: !simplified ? Order.PARENT_FOLDER : undefined }] : []),
    { label: 'date de modification', code: !simplified ? Order.UPDATED : undefined },
    { label: 'nb de cohortes' }
  ]

  return loading ? (
    <CenteredCircularProgress />
  ) : (
    <ResearchesTable
      columns={columns}
      page={page}
      setPage={setPage}
      total={total}
      order={order}
      setOrder={(newOrder) => onChangeOrderBy(newOrder)}
      noPagination={simplified}
    >
      {requestsList.map((request) => {
        const cohortTotal = getCohortTotal(request.query_snapshots)

        return (
          <TableRow
            key={request.uuid}
            onClick={() => navigate(`/cohort/new/${request.uuid}`)}
            sx={{ cursor: 'pointer', '&:hover': { backgroundColor: '#f8f9fa' } }}
          >
            {!simplified && (
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
            )}
            <TableCellWrapper align="left" accentcell>
              {getRequestName(request)}
            </TableCellWrapper>
            <TableCellWrapper>
              <Box display={'flex'} flexWrap={'nowrap'}>
                <IconButtonWithTooltip
                  title="Partager la requête"
                  icon={<ShareIcon />}
                  onClick={() => onShareRequest(request)}
                  disabled={disabled}
                />
                <IconButtonWithTooltip
                  title="Éditer la requête"
                  icon={<EditIcon />}
                  onClick={() => onClickEdit(request)}
                  disabled={disabled}
                />
              </Box>
            </TableCellWrapper>
            {!projectId && <TableCellWrapper>{request.parent_folder?.name}</TableCellWrapper>}
            <TableCellWrapper>{formatDate(request.updated_at)}</TableCellWrapper>
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
