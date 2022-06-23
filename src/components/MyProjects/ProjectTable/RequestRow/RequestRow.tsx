import React, { useEffect } from 'react'
import moment from 'moment'

import { Checkbox, Collapse, IconButton, Link, Table, TableBody, TableCell, TableRow, Tooltip } from '@mui/material'

import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp'
import EditIcon from '@mui/icons-material/Edit'
import ShareIcon from '@mui/icons-material/Share'

import VersionRow from '../VersionRow/VersionRow'

import { RequestType, Cohort } from 'types'

import { useAppDispatch, useAppSelector } from 'state'
import { setSelectedRequest, setSelectedRequestShare } from 'state/request'
import { MeState } from 'state/me'
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
  const classes = useStyles()
  const dispatch = useAppDispatch()

  const { meState } = useAppSelector<{
    meState: MeState
  }>((state) => ({
    meState: state.me
  }))
  const maintenanceIsActive = meState?.maintenance?.active

  const onEditRequest = (requestId: string) => {
    dispatch<any>(setSelectedRequest({ uuid: requestId, name: '' }))
  }

  const onShareRequest = (requestId: string) => {
    dispatch<any>(setSelectedRequestShare({ uuid: requestId, name: '' }))
  }

  useEffect(() => {
    if (isSearch) {
      const hasCohorts = cohortsList.some(({ request }) => request === row.uuid)
      setOpen(hasCohorts)
    } else {
      setOpen(open)
    }
  }, [isSearch, cohortsList])

  const rowIsSelected = selectedRequests.find((selectedRequest) => selectedRequest.uuid === row.uuid)

  return (
    <Table>
      <TableBody>
        <TableRow style={{ background: '#FAF9F9' }}>
          <TableCell style={{ width: 62 }}>
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
            />
          </TableCell>
          <TableCell style={{ width: 62 }}>
            <IconButton aria-label="expand row" size="small" onClick={() => setOpen(!open)}>
              {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
            </IconButton>
          </TableCell>
          <TableCell className={classes.tdName}>
            {row?.shared_by?.displayed_name ? (
              <Link href={`/cohort/new/${row.uuid}`}>{`${row.name} - Envoyée par : ${
                row?.shared_by?.firstname
              } ${row?.shared_by?.lastname?.toUpperCase()}`}</Link>
            ) : (
              <Link href={`/cohort/new/${row.uuid}`}>{row.name}</Link>
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
          </TableCell>

          <TableCell className={classes.dateCell} align="center">
            {moment(row.modified_at).format('DD/MM/YYYY [à] HH:mm')}
          </TableCell>
        </TableRow>

        <TableRow>
          <TableCell style={{ padding: 0, borderBottomWidth: open ? 1 : 0 }} colSpan={5}>
            <Collapse in={open} timeout="auto" unmountOnExit style={{ width: '100%' }}>
              <VersionRow requestId={row.uuid} cohortsList={cohortsList} />
            </Collapse>
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  )
}

export default RequestRow
