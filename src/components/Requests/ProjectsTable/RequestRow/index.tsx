import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import moment from 'moment'

import { Checkbox, Collapse, IconButton, Link, Table, TableBody, TableRow, Typography } from '@mui/material'
import { TableCellWrapper } from 'components/ui/TableCell/styles'

import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp'

import VersionRow from '../VersionRow'

import { RequestType, Cohort, ResponseStatus } from 'types'

import { useAppDispatch, useAppSelector } from 'state'
import { setSelectedRequest, setSelectedRequestShare } from 'state/request'
import useStyles from '../styles'
import RequestActions from 'components/Requests/RequestActions'

enum Dialog {
  EDIT,
  DELETE,
  SHARE
}

type RequestRowProps = {
  row: RequestType
  /*cohortsList: Cohort[]*/
  /*selectedRequests: RequestType[]*/
  /*onSelectedRow: (selectedRequests: RequestType[]) => void*/
  isSearch?: boolean
}
const RequestRow = ({ row, /*cohortsList, selectedRequests, onSelectedRow,*/ isSearch }: RequestRowProps) => {
  const [open, setOpen] = React.useState(false)
  const [openModal, setOpenModal] = useState<Dialog | null>(null)
  const [shareStatus, setShareStatus] = useState<ResponseStatus>(ResponseStatus.IDDLE)
  const { classes } = useStyles()
  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  const maintenanceIsActive = useAppSelector((state) => state?.me?.maintenance?.active ?? false)

  /*useEffect(() => {
    if (isSearch) {
      const hasCohorts = cohortsList.some(({ request }) => request === row.uuid)
      setOpen(hasCohorts)
    } else {
      setOpen(open)
    }
  }, [isSearch, cohortsList])*/

  /*const rowIsSelected = selectedRequests.find((selectedRequest) => selectedRequest.uuid === row.uuid)*/

  return (
    <>
      <TableRow style={{ display: 'flex', width: '100%', background: '#FAF9F9' }}>
        <TableCellWrapper align="left" style={{ width: 70, height: '70px' }}>
          <Checkbox
            size="small"
            /* checked={!!rowIsSelected}
              onChange={() => {
                if (rowIsSelected) {
                  onSelectedRow(selectedRequests.filter((selectedRequest) => selectedRequest.uuid !== row.uuid))
                } else {
                  onSelectedRow([...selectedRequests, row])
                }
              }}*/
            color="info"
          />
        </TableCellWrapper>
        <TableCellWrapper align="left" style={{ width: 70, height: '70px' }}>
          <IconButton aria-label="expand row" size="small" onClick={() => setOpen(!open)}>
            {open ? (
              <KeyboardArrowUpIcon style={{ color: '#153D8A' }} />
            ) : (
              <KeyboardArrowDownIcon style={{ color: '#153D8A' }} />
            )}
          </IconButton>
        </TableCellWrapper>
        <TableCellWrapper align="left" style={{ width: 120, height: '70px' }}>
          <Typography>{moment(row.modified_at).format('DD/MM/YYYY HH:mm')}</Typography>
        </TableCellWrapper>
        <TableCellWrapper align="left" style={{ width: 'calc(100% - 70px - 70px - 120px - 160px)', height: '70px' }}>
          <Link
            onClick={() => navigate(`/cohort/new/${row.uuid}`)}
            underline="hover"
            style={{ cursor: 'pointer', color: '#153D8A' }}
          >
            <Typography fontWeight={700}>
              {`${row.name} ${
                row?.shared_by?.display_name
                  ? '- Envoyée par : ' + row?.shared_by?.firstname + ' ' + row?.shared_by?.lastname?.toUpperCase()
                  : ''
              } `}
            </Typography>
          </Link>
        </TableCellWrapper>

        <TableCellWrapper
          align="left"
          style={{ height: '70px', textAlign: 'left', display: 'flex', alignItems: 'center' }}
        >
          <RequestActions request={row} disabled={maintenanceIsActive} onUpdate={() => {}} />
        </TableCellWrapper>
      </TableRow>

      <TableRow>
        <TableCellWrapper align="left" style={{ padding: 0, borderBottomWidth: open ? 1 : 0 }} colSpan={5}>
          <Collapse in={open} timeout="auto" unmountOnExit style={{ width: '100%' }}>
            {/*<VersionRow requestId={row.uuid} cohortsList={cohortsList} />*/}
          </Collapse>
        </TableCellWrapper>
      </TableRow>
    </>
  )
}

export default RequestRow
