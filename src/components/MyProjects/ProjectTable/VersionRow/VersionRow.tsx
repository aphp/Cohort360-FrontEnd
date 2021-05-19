import React from 'react'
import { useDispatch } from 'react-redux'
import moment from 'moment'

import {
  Box,
  Chip,
  IconButton,
  Link,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tooltip,
  Typography
} from '@material-ui/core'

import EditIcon from '@material-ui/icons/Edit'

import { useAppSelector } from 'state'
import { CohortState, setSelectedCohort } from 'state/cohort'

import { CohortType } from 'services/myProjects'

import displayDigit from 'utils/displayDigit'

import useStyles from '../styles'

const VersionRow: React.FC<{ requestId: string }> = ({ requestId }) => {
  const classes = useStyles()
  const dispatch = useDispatch()
  const { cohortState } = useAppSelector<{
    cohortState: CohortState
  }>((state) => ({
    cohortState: state.cohort || {}
  }))

  const { cohortsList = [] } = cohortState

  const cohorts: CohortType[] = cohortsList.filter(({ request }) => request === requestId) || []

  const _handleEditCohort = (cohortId: string) => {
    dispatch<any>(setSelectedCohort(cohortId))
  }
  return (
    <Box className={classes.versionContainer}>
      <Typography variant="h6" gutterBottom component="div">
        Cohortes
      </Typography>
      <Table size="small" aria-label="versions">
        <TableHead>
          <TableRow>
            <TableCell>Nom</TableCell>
            <TableCell align="center" style={{ width: 150 }}>
              Status
            </TableCell>
            <TableCell align="center" style={{ width: 150 }}>
              Version
            </TableCell>
            <TableCell align="center" style={{ width: 150 }}>
              Nombre de patients
            </TableCell>
            <TableCell align="center" style={{ width: 150 }}>
              Date
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {cohorts && cohorts.length > 0 ? (
            cohorts.map((historyRow) => (
              <TableRow key={historyRow.uuid}>
                <TableCell className={classes.tdName}>
                  {historyRow.fhir_group_id ? (
                    <Link href={`/cohort/${historyRow.fhir_group_id}`}>{historyRow.name}</Link>
                  ) : (
                    <Typography component="span" className={classes.notAllowed}>
                      {historyRow.name}
                    </Typography>
                  )}
                  <IconButton
                    className={classes.editButon}
                    size="small"
                    onClick={() => _handleEditCohort(historyRow.uuid)}
                  >
                    <EditIcon />
                  </IconButton>
                </TableCell>
                <TableCell align="center">
                  {historyRow.fhir_group_id ? (
                    <Chip label="Terminé" style={{ backgroundColor: '#28a745', color: 'white' }} />
                  ) : historyRow.request_job_status === 'pending' || historyRow.request_job_status === 'started' ? (
                    <Chip label="En cours" style={{ backgroundColor: '#ffc107', color: 'black' }} />
                  ) : historyRow.request_job_fail_msg ? (
                    <Tooltip title={historyRow.request_job_fail_msg}>
                      <Chip label="Erreur" style={{ backgroundColor: '#dc3545', color: 'black' }} />
                    </Tooltip>
                  ) : (
                    <Chip label="Erreur" style={{ backgroundColor: '#dc3545', color: 'black' }} />
                  )}
                </TableCell>
                <TableCell align="center">
                  <Link
                    className={classes.versionLabel}
                    href={`/cohort/new/${requestId}/${historyRow.request_query_snapshot}`}
                  >
                    {historyRow.request_query_snapshot?.split('-')[0]}
                  </Link>
                </TableCell>
                <TableCell align="center">{displayDigit(historyRow.result_size ?? 0)}</TableCell>
                <TableCell align="center">{moment(historyRow.created_at).fromNow()}</TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={5}>
                <Typography className={classes.emptyRequestRow}>
                  Aucune cohorte n'est liée à cette requête
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
