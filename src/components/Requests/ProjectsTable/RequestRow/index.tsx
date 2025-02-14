import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import moment from 'moment'

import { Checkbox, Collapse, IconButton, Link, Table, TableBody, TableRow, Tooltip } from '@mui/material'
import { TableCellWrapper } from 'components/ui/TableCell/styles'

import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp'
import EditIcon from '@mui/icons-material/Edit'
import ShareIcon from '@mui/icons-material/Share'

import VersionRow from '../VersionRow'

import { RequestType, Cohort } from 'types'

import { useAppDispatch, useAppSelector } from 'state'
import { setSelectedRequest, setSelectedRequestShare } from 'state/request'
import useStyles from '../styles'

type RequestRowProps = {
  row: RequestType
  cohortsList: Cohort[]
  selectedRequests: RequestType[]
  onSelectedRow: (selectedRequests: RequestType[]) => void
  isSearch?: boolean
}
const RequestRow: React.FC<RequestRowProps> = ({ row, cohortsList, selectedRequests, onSelectedRow, isSearch }) => {
  const [open, setOpen] = React.useState(false)
  const { classes } = useStyles()
  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  const maintenanceIsActive = useAppSelector((state) => state?.me?.maintenance?.active ?? false)

  const onEditRequest = (requestId: string) => {
    dispatch(setSelectedRequest({ uuid: requestId, name: '' }))
  }

  const onShareRequest = (requestId: string) => {
    dispatch(setSelectedRequestShare({ uuid: requestId, name: '' }))
  }

  useEffect(() => {
    if (isSearch) {
      const hasCohorts = cohortsList.some(({ request }) => request?.uuid === row.uuid)
      setOpen(hasCohorts)
    } else {
      setOpen(false)
    }
  }, [isSearch, cohortsList, row.uuid])

  const rowIsSelected = selectedRequests.find((selectedRequest) => selectedRequest.uuid === row.uuid)

  return (
    <Table>
      <TableBody>
        <TableRow style={{ background: '#FAF9F9' }}>
          <TableCellWrapper align="left" style={{ width: 62 }}>
            <Checkbox
              size="small"
              checked={!!rowIsSelected}
              onChange={() => {
                if (rowIsSelected) {
                  onSelectedRow(selectedRequests.filter((selectedRequest) => selectedRequest.uuid !== row.uuid))
                } else {
                  onSelectedRow([...selectedRequests, row])
                }
              }}
              color="secondary"
            />
          </TableCellWrapper>
          <TableCellWrapper align="left" style={{ width: 62 }}>
            <IconButton aria-label="expand row" size="small" onClick={() => setOpen(!open)}>
              {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
            </IconButton>
          </TableCellWrapper>
          <TableCellWrapper align="left" className={classes.tdName}>
            {row?.shared_by ? (
              <Link onClick={() => navigate(`/cohort/new/${row.uuid}`)} underline="hover" style={{ cursor: 'pointer' }}>
                {`${row.name} - Envoyée par : ${row?.shared_by}`}
              </Link>
            ) : (
              <Link onClick={() => navigate(`/cohort/new/${row.uuid}`)} underline="hover" style={{ cursor: 'pointer' }}>
                {row.name}
              </Link>
            )}

            <Tooltip title="Modifier la requête">
              <IconButton
                className={classes.editButton}
                size="small"
                onClick={() => onEditRequest(row.uuid)}
                disabled={maintenanceIsActive}
              >
                <EditIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Partager la requête">
              <IconButton
                className={classes.editButton}
                size="small"
                onClick={() => onShareRequest(row.uuid)}
                disabled={maintenanceIsActive}
              >
                <ShareIcon />
              </IconButton>
            </Tooltip>
          </TableCellWrapper>

          <TableCellWrapper className={classes.dateCell}>
            {moment(row.updated_at).format('DD/MM/YYYY [à] HH:mm')}
          </TableCellWrapper>
        </TableRow>

        <TableRow>
          <TableCellWrapper align="left" style={{ padding: 0, borderBottomWidth: open ? 1 : 0 }} colSpan={5}>
            <Collapse in={open} timeout="auto" unmountOnExit style={{ width: '100%' }}>
              <VersionRow requestId={row.uuid} cohortsList={cohortsList} />
            </Collapse>
          </TableCellWrapper>
        </TableRow>
      </TableBody>
    </Table>
  )
}

export default RequestRow
