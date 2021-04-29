import React from 'react'
import moment from 'moment'

import {
  Box,
  Collapse,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography
} from '@material-ui/core'

import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown'
import KeyboardArrowUpIcon from '@material-ui/icons/KeyboardArrowUp'
import EditIcon from '@material-ui/icons/Edit'

import { RequestType } from 'services/myProjects'

import displayDigit from 'utils/displayDigit'

import useStyles from '../styles'

type RequestRowProps = {
  row: RequestType
}
const RequestRow: React.FC<RequestRowProps> = ({ row }) => {
  const [open, setOpen] = React.useState(false)
  const classes = useStyles()

  const cohorts = [
    {
      uuid: '1',
      name: 'Cohort 1',
      version: '92c7ea',
      result_size: Math.floor(Math.random() * 100000) + 1,
      created_at: new Date().toString()
    },
    {
      uuid: '2',
      name: 'Cohort 2',
      version: 'e718df',
      result_size: Math.floor(Math.random() * 100000) + 1,
      created_at: new Date().toString()
    },
    {
      uuid: '3',
      name: 'Cohort 3',
      version: 'a37cd4',
      result_size: Math.floor(Math.random() * 100000) + 1,
      created_at: new Date().toString()
    }
  ]

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
            {row.name}
            <IconButton className={classes.editButon} size="small">
              <EditIcon />
            </IconButton>
          </TableCell>
          <TableCell className={classes.dateCell} align="center">
            {moment(row.created_at).fromNow()}
          </TableCell>
        </TableRow>

        <TableRow>
          <TableCell style={{ padding: 0, borderBottomWidth: open ? 1 : 0 }} colSpan={4}>
            <Collapse in={open} timeout="auto" unmountOnExit style={{ width: '100%' }}>
              <Box className={classes.versionContainer}>
                <Typography variant="h6" gutterBottom component="div">
                  Versions
                </Typography>
                <Table size="small" aria-label="versions">
                  <TableHead>
                    <TableRow>
                      <TableCell>Nom</TableCell>
                      <TableCell align="center">Version</TableCell>
                      <TableCell align="center">Nombre de patient</TableCell>
                      <TableCell align="center">Date</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {cohorts.map((historyRow) => (
                      <TableRow key={historyRow.uuid}>
                        <TableCell>{historyRow.name}</TableCell>
                        <TableCell align="center">
                          <Typography className={classes.versionLabel}>{historyRow.version}</Typography>
                        </TableCell>
                        <TableCell align="center">{displayDigit(historyRow.result_size)}</TableCell>
                        <TableCell align="center">{moment(historyRow.created_at).fromNow()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Box>
            </Collapse>
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  )
}

export default RequestRow
