import React from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import { Box, Checkbox, CircularProgress, IconButton, TableRow, Tooltip, Typography } from '@mui/material'
import ActionMenu from './ActionMenu'
import ArrowRightAltIcon from '@mui/icons-material/ArrowRightAlt'
import Button from 'components/ui/Button'
import ResearchesTable from './Table'
import { TableCellWrapper } from 'components/ui/TableCell/styles'

import DeleteIcon from 'assets/icones/delete.svg?react'
import DriveFileMoveIcon from '@mui/icons-material/DriveFileMove'
import EditIcon from '@mui/icons-material/Edit'
import ShareIcon from '@mui/icons-material/Share'

import { Column, RequestType } from 'types'
import { Order, OrderBy } from 'types/searchCriterias'
import { getCohortTotal, getRequestName } from 'utils/explorationUtils'
import { formatDate } from 'utils/formatDate'
import { isChecked } from 'utils/filters'

type RequestsTableContentProps = {
  requestsList: RequestType[]
  multiSelectMode: boolean
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
  onClickDelete: (request: RequestType) => void
  onClickMove: (request: RequestType) => void
  onSelectAll: () => void
  disabled: boolean
  noPagination?: boolean
}

const RequestsTableContent: React.FC<RequestsTableContentProps> = ({
  requestsList,
  multiSelectMode,
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
  onClickDelete,
  onClickMove,
  onSelectAll,
  disabled,
  noPagination
}) => {
  const navigate = useNavigate()
  const { projectId } = useParams()

  const columns: Column[] = [
    ...(multiSelectMode
      ? [
          {
            label: (
              <Checkbox
                checked={selectedRequests.length === requestsList.length}
                indeterminate={selectedRequests.length > 0 && selectedRequests.length < requestsList.length}
                onClick={onSelectAll}
              />
            )
          }
        ]
      : []),
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
            onClick={() => (multiSelectMode ? onSelectRequest(request) : navigate(`/cohort/new/${request.uuid}`))}
            style={{ cursor: 'pointer' }}
          >
            {multiSelectMode && (
              <TableCellWrapper sx={{ width: multiSelectMode ? 50 : 0 }}>
                <Checkbox
                  checked={isChecked(request, selectedRequests)}
                  onClick={(event) => {
                    event.stopPropagation()
                    onSelectRequest(request)
                  }}
                />
              </TableCellWrapper>
            )}
            <TableCellWrapper align="left" headCell>
              {getRequestName(request)}
            </TableCellWrapper>
            <TableCellWrapper>
              {!multiSelectMode && (
                <Box display={'flex'} flexWrap={'nowrap'}>
                  <Tooltip title="Partager la requête">
                    <IconButton
                      style={{ color: '#000' }}
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
                  <ActionMenu
                    actions={[
                      {
                        key: 'edit',
                        icon: <EditIcon />,
                        label: 'Éditer',
                        onclick: () => onClickEdit(request)
                      },
                      {
                        key: 'move',
                        icon: <DriveFileMoveIcon />,
                        label: 'Déplacer',
                        onclick: () => onClickMove(request)
                      },
                      {
                        key: 'delete',
                        icon: <DeleteIcon />,
                        label: 'Supprimer',
                        onclick: () => onClickDelete(request)
                      }
                    ]}
                  />
                </Box>
              )}
            </TableCellWrapper>
            {!projectId && <TableCellWrapper>{request.parent_folder?.name}</TableCellWrapper>}
            <TableCellWrapper>{formatDate(request.updated_at, true)}</TableCellWrapper>
            <TableCellWrapper>
              <Button
                clearVariant
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
