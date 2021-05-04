import React from 'react'
import moment from 'moment'

import { Box, Link, Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@material-ui/core'

import displayDigit from 'utils/displayDigit'

import useStyles from '../styles'

const VersionRow: React.FC<{ requestId: string }> = ({ requestId }) => {
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
              <TableCell>
                <Link href={`/cohort/${historyRow.uuid}`}>{historyRow.name}</Link>
              </TableCell>
              <TableCell align="center">
                <Link className={classes.versionLabel} href={`/cohort/new/${requestId}/${historyRow.version}`}>
                  {historyRow.version}
                </Link>
              </TableCell>
              <TableCell align="center">{displayDigit(historyRow.result_size)}</TableCell>
              <TableCell align="center">{moment(historyRow.created_at).fromNow()}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  )
}

export default VersionRow
