import React from 'react'
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

import { ODD_EXPORT } from '../../../../constants'

import useStyles from '../styles'

const VersionRow: React.FC<{ requestId: string; cohortsList: Cohort[] }> = ({ requestId, cohortsList }) => {
  const classes = useStyles()
  const dispatch = useAppDispatch()
  const [selectedExportableCohort, setSelectedExportableCohort] = React.useState<null | string>(null)

  const cohorts: Cohort[] =
    cohortsList
      .filter(({ request }) => request === requestId)
      .sort((a, b) => +moment(a.created_at).format('x') - +moment(b.created_at).format('x')) || []

  const _handleEditCohort = (cohort: Cohort) => {
    dispatch(setSelectedCohort(cohort ?? null))
  }

  // You can make an export if you got 1 cohort with: EXPORT_ACCESS = 'DATA_NOMINATIVE'
  const canMakeExport =
    ODD_EXPORT &&
    cohorts.some((cohort) =>
      cohort.extension && cohort.extension.length > 0
        ? cohort.extension.some(
            (extension) => extension.url === 'EXPORT_ACCESS' && extension.valueString === 'DATA_NOMINATIVE'
          ) &&
          cohort.extension.some(
            (extension) => extension.url === 'READ_ACCESS' && extension.valueString === 'DATA_NOMINATIVE'
          )
        : false
    )

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

              const isError =
                !historyRow.fhir_group_id ||
                historyRow.request_job_status === 'pending' ||
                historyRow.request_job_status === 'started' ||
                !!historyRow.request_job_fail_msg

              const canExportThisCohort =
                canMakeExport && !isError && historyRow.extension
                  ? historyRow.extension.some(
                      (extension) => extension.url === 'EXPORT_ACCESS' && extension.valueString === 'DATA_NOMINATIVE'
                    )
                  : false

              return (
                <TableRow key={historyRow.uuid}>
                  <TableCell className={classes.tdName}>
                    {historyRow.fhir_group_id ? (
                      <Link href={`/cohort/${historyRow.fhir_group_id}`} underline="hover">
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
                  <Hidden lgDown>
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
