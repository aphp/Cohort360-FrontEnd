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
import { ReactComponent as Star } from 'assets/icones/star.svg'
import { ReactComponent as StarFull } from 'assets/icones/star full.svg'

import ExportModal from 'components/Cohort/ExportModal/ExportModal'

import { setFavoriteCohortThunk } from 'state/userCohorts'
import { setSelectedCohort } from 'state/cohort'

import { CohortType } from 'types'

import displayDigit from 'utils/displayDigit'

import useStyles from '../styles'

const VersionRow: React.FC<{ requestId: string; cohortsList: CohortType[] }> = ({ requestId, cohortsList }) => {
  const classes = useStyles()
  const dispatch = useDispatch()
  const [selectedExportableCohort, setSelectedExportableCohort] = React.useState<null | string>(null)

  const cohorts: CohortType[] =
    cohortsList
      .filter(({ request }) => request === requestId)
      .sort((a, b) => +moment(a.created_at).format('x') - +moment(b.created_at).format('x')) || []

  const _handleEditCohort = (cohortId: string) => {
    dispatch<any>(setSelectedCohort(cohortId))
  }

  // You can make an export if you got 1 cohort with: EXPORT_DATA_NOMINATIVE = true && READ_DATA_NOMINATIVE = true
  const canMakeExport = cohorts.some((cohort) =>
    cohort.extension && cohort.extension.length > 0
      ? cohort.extension.find(
          (extension) => extension.url === 'EXPORT_DATA_NOMINATIVE' && extension.valueString === 'true'
        ) &&
        cohort.extension.find(
          (extension) => extension.url === 'READ_DATA_NOMINATIVE' && extension.valueString === 'true'
        )
      : false
  )

  const onSetCohortFavorite = async (cohortId: string) => {
    await dispatch<any>(setFavoriteCohortThunk({ cohortId }))
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
            <Hidden mdDown>
              <TableCell align="center" style={{ width: 175 }}>
                Date
              </TableCell>
            </Hidden>
            {canMakeExport && (
              <TableCell align="center" style={{ width: 66 }}>
                Exporter
              </TableCell>
            )}
          </TableRow>
        </TableHead>
        <TableBody>
          {cohorts && cohorts.length > 0 ? (
            cohorts.map((historyRow) => {
              if (!historyRow) return <></>

              const canExportThisCohort =
                canMakeExport && historyRow.extension
                  ? historyRow.extension.some(
                      (extension) => extension.url === 'EXPORT_DATA_NOMINATIVE' && extension.valueString === 'true'
                    ) &&
                    historyRow.extension.some(
                      (extension) => extension.url === 'READ_DATA_NOMINATIVE' && extension.valueString === 'true'
                    )
                  : false

              return (
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
                    <IconButton onClick={() => onSetCohortFavorite(historyRow.uuid)}>
                      <FavStar favorite={historyRow.favorite} />
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
                    <TableCell align="center">
                      {moment(historyRow.modified_at).format('DD/MM/YYYY [à] HH:mm')}
                    </TableCell>
                  </Hidden>
                  {canMakeExport && (
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
                  )}
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
        cohortId={selectedExportableCohort ? +selectedExportableCohort : 0}
        open={!!selectedExportableCohort}
        handleClose={() => setSelectedExportableCohort(null)}
      />
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
