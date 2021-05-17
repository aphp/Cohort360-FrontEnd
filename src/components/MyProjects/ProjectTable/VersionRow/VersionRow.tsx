import React from 'react'
import moment from 'moment'

import { Box, Link, Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@material-ui/core'

import { useAppSelector } from 'state'
import { CohortState } from 'state/cohort'

import { CohortType } from 'services/myProjects'

import displayDigit from 'utils/displayDigit'

import useStyles from '../styles'

const VersionRow: React.FC<{ requestId: string }> = ({ requestId }) => {
  const classes = useStyles()
  const { cohortState } = useAppSelector<{
    cohortState: CohortState
  }>((state) => ({
    cohortState: state.cohort || {}
  }))

  const { cohortsList = [] } = cohortState

  const cohorts: CohortType[] = cohortsList.filter(({ request_id }) => request_id === requestId) || []

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
          {cohorts && cohorts.length > 0 ? (
            cohorts.map((historyRow) => (
              <TableRow key={historyRow.uuid}>
                <TableCell>
                  <Link href={`/cohort/${historyRow.uuid}`}>{historyRow.name}</Link>
                </TableCell>
                <TableCell align="center">
                  <Link
                    className={classes.versionLabel}
                    href={`/cohort/new/${requestId}/${historyRow.request_query_snapshot_id}`}
                  >
                    {historyRow.request_query_snapshot_id?.split('-')[0]}
                  </Link>
                </TableCell>
                <TableCell align="center">{displayDigit(historyRow.result_size ?? 0)}</TableCell>
                <TableCell align="center">{moment(historyRow.created_at).fromNow()}</TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={4}>
                <Typography className={classes.emptyRequestRow}>
                  Aucune version n'est liée à cette requête
                  <br />
                  Veuillez vous rendre sur la page de création en{' '}
                  <Link style={{ display: 'contents', fontWeight: 900 }} href={`/cohort/new/${requestId}`}>
                    cliquant ici
                  </Link>{' '}
                  et appuyer sur le bouton "Créer la cohorte"
                </Typography>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </Box>
  )
}

export default VersionRow
