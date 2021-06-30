import React from 'react'
import { useDispatch } from 'react-redux'
import moment from 'moment'

import {
  Box,
  Chip,
  Hidden,
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
import ExportIcon from '@material-ui/icons/GetApp'

import ExportModal from 'components/Cohort/ExportModal/ExportModal'

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

  const [selectedExportableCohort, setSelectedExportableCohort] = React.useState<null | string>(null)

  const cohorts: CohortType[] =
    cohortsList
      .filter(({ request }) => request === requestId)
      .sort((a, b) => +moment(a.created_at).format('x') - +moment(b.created_at).format('x')) || []

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
            <TableCell align="center" style={{ width: 125 }}>
              Status
            </TableCell>
            <TableCell align="center" style={{ width: 125 }}>
              Version
            </TableCell>
            <TableCell align="center" style={{ width: 125 }}>
              Nombre de patients
            </TableCell>
            <Hidden mdDown>
              <TableCell align="center" style={{ width: 175 }}>
                Date
              </TableCell>
            </Hidden>
            <TableCell align="center" style={{ width: 66 }}>
              Exporter
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
                <Hidden mdDown>
                  <TableCell align="center">{moment(historyRow.created_at).format('DD/MM/YYYY [à] HH:mm')}</TableCell>
                </Hidden>
                <TableCell align="center">
                  <IconButton onClick={() => setSelectedExportableCohort(historyRow.fhir_group_id ?? '')}>
                    <ExportIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={6}>
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

      <ExportModal
        cohortId={selectedExportableCohort ?? ''}
        open={!!selectedExportableCohort}
        handleClose={() => setSelectedExportableCohort(null)}
      />
    </Box>
  )
}

export default VersionRow
