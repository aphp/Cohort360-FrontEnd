import React from 'react'
import moment from 'moment'

import { Collapse, IconButton, Link, Table, TableBody, TableCell, TableRow } from '@material-ui/core'

import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown'
import KeyboardArrowUpIcon from '@material-ui/icons/KeyboardArrowUp'
import EditIcon from '@material-ui/icons/Edit'

import VersionRow from '../VersionRow/VersionRow'

import { RequestType } from 'services/myProjects'

import useStyles from '../styles'

type RequestRowProps = {
  row: RequestType
  onEditRequest: (selectedRequestId: string | null) => void
}
const RequestRow: React.FC<RequestRowProps> = ({ row, onEditRequest }) => {
  const [open, setOpen] = React.useState(false)
  const classes = useStyles()

  return (
    <Table>
      <TableBody>
        <TableRow>
          <TableCell style={{ width: 62 }} />
          <TableCell style={{ width: 62 }}>
            <IconButton aria-label="expand row" size="small" onClick={() => setOpen(!open)}>
              {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
            </IconButton>
          </TableCell>
          <TableCell className={classes.tdName}>
            <Link href={`/cohort/new/${row.uuid}`}>{row.name}</Link>
            <IconButton className={classes.editButon} size="small" onClick={() => onEditRequest(row.uuid)}>
              <EditIcon />
            </IconButton>
          </TableCell>
          <TableCell className={classes.dateCell} align="center">
            {moment(row.created_at).format('DD/MM/YYYY [à] HH:mm')}
          </TableCell>
        </TableRow>

        <TableRow>
          <TableCell style={{ padding: 0, borderBottomWidth: open ? 1 : 0 }} colSpan={4}>
            <Collapse in={open} timeout="auto" unmountOnExit style={{ width: '100%' }}>
              <VersionRow requestId={row.uuid} />
            </Collapse>
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  )
}

export default RequestRow
