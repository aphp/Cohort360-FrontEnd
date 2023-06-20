import React from 'react'
import { useNavigate } from 'react-router-dom'
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
} from '@mui/material'

import EditIcon from '@mui/icons-material/Edit'
import ExportIcon from '@mui/icons-material/GetApp'
import { ReactComponent as Star } from 'assets/icones/star.svg'
import { ReactComponent as StarFull } from 'assets/icones/star full.svg'

import ExportModal from 'components/Dashboard/ExportModal/ExportModal'

import { useAppDispatch } from 'state'
import { editCohort, setSelectedCohort } from 'state/cohort'

import { Cohort } from 'types'

import displayDigit from 'utils/displayDigit'

import useStyles from '../styles'
import { JobStatus } from 'utils/constants'
import { ODD_EXPORT } from '../../../../constants'

const VersionRow: React.FC<{ requestId: string; cohortsList: Cohort[] }> = ({ requestId, cohortsList }) => {
  const { classes } = useStyles()
  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  const [selectedExportableCohort, setSelectedExportableCohort] = React.useState<null | string>(null)

  const cohorts: Cohort[] =
    cohortsList
      .filter(({ request }) => request === requestId)
      .sort((a, b) => +moment(a.created_at).format('x') - +moment(b.created_at).format('x')) || []

  const _handleEditCohort = (cohort: Cohort) => {
    dispatch(setSelectedCohort(cohort ?? null))
  }

  const onSetCohortFavorite = async (cohort: Cohort) => {
    await dispatch(editCohort({ editedCohort: { ...cohort, favorite: !cohort.favorite } }))
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
            <TableCell align="center">Favoris</TableCell>
            <TableCell align="center" style={{ width: 125 }}>
              Statut
            </TableCell>
            <TableCell align="center" style={{ width: 125 }}>
              Version
            </TableCell>
            <TableCell align="center" style={{ width: 125 }}>
              Nombre de patients
            </TableCell>
            <Hidden lgDown>
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
            cohorts.map((historyRow) => {
              if (!historyRow) return <></>

              const isError =
                !historyRow.fhir_group_id ||
                historyRow.request_job_status === JobStatus.pending ||
                historyRow.request_job_status === JobStatus.new ||
                !!historyRow.request_job_fail_msg

              const canExportThisCohort = !!ODD_EXPORT && !isError ? historyRow.rights?.export_csv_nomi : false

              return (
                <TableRow key={historyRow.uuid}>
                  <TableCell className={classes.tdName}>
                    {historyRow.fhir_group_id ? (
                      <Link onClick={() => navigate(`/cohort/${historyRow.fhir_group_id}`)} underline="hover">
                        {historyRow.name}
                      </Link>
                    ) : (
                      <Typography component="span" className={classes.notAllowed}>
                        {historyRow.name}
                      </Typography>
                    )}
                    <IconButton
                      className={classes.editButton}
                      size="small"
                      onClick={() => _handleEditCohort(historyRow)}
                    >
                      <EditIcon />
                    </IconButton>
                  </TableCell>
                  <TableCell align="center">
                    <IconButton onClick={() => onSetCohortFavorite(historyRow)}>
                      <FavStar favorite={historyRow.favorite} />
                    </IconButton>
                  </TableCell>
                  <TableCell align="center">
                    {historyRow.fhir_group_id ? (
                      <Chip label="Terminé" style={{ backgroundColor: '#28a745', color: 'white' }} />
                    ) : historyRow.request_job_status === JobStatus.pending ||
                      historyRow.request_job_status === JobStatus.new ? (
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
                      onClick={() => navigate(`/cohort/new/${requestId}/${historyRow.request_query_snapshot}`)}
                    >
                      {historyRow.request_query_snapshot?.split('-')[0]}
                    </Link>
                  </TableCell>
                  <TableCell align="center">{displayDigit(historyRow.result_size)}</TableCell>
                  <Hidden lgDown>
                    <TableCell align="center">
                      {moment(historyRow.modified_at).format('DD/MM/YYYY [à] HH:mm')}
                    </TableCell>
                  </Hidden>

                  <TableCell align="center">
                    <IconButton
                      disabled={!canExportThisCohort}
                      onClick={
                        canExportThisCohort
                          ? () => setSelectedExportableCohort(historyRow.fhir_group_id ?? '')
                          : () => null
                      }
                    >
                      <ExportIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              )
            })
          ) : (
            <TableRow>
              <TableCell colSpan={6}>
                <Typography className={classes.emptyRequestRow}>
                  Aucune cohorte n'est liée à cette requête
                  <br />
                  Veuillez vous rendre sur la page de création en{' '}
                  <Link
                    style={{ display: 'contents', fontWeight: 900, cursor: 'pointer' }}
                    onClick={() => navigate(`/cohort/new/${requestId}`)}
                  >
                    cliquant ici
                  </Link>{' '}
                  et appuyer sur le bouton "Créer la cohorte"
                </Typography>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {!!ODD_EXPORT && (
        <ExportModal
          cohortId={selectedExportableCohort ? +selectedExportableCohort : 0}
          open={!!selectedExportableCohort}
          handleClose={() => setSelectedExportableCohort(null)}
        />
      )}
    </Box>
  )
}

type FavStarProps = {
  favorite?: boolean
}
const FavStar: React.FC<FavStarProps> = ({ favorite }) => {
  if (favorite) {
    return <StarFull height="15px" fill="#ED6D91" />
  }
  return <Star height="15px" fill="#ED6D91" />
}

export default VersionRow
