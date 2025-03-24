import React, { useContext } from 'react'
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
  TableHead,
  TableRow,
  Tooltip,
  Typography
} from '@mui/material'
import { TableCellWrapper } from 'components/ui/TableCell/styles'

import UpdateIcon from '@mui/icons-material/Update'

import EditIcon from '@mui/icons-material/Edit'
import ExportIcon from '@mui/icons-material/GetApp'
import Star from 'assets/icones/star.svg?react'
import StarFull from 'assets/icones/star full.svg?react'

import ExportModal from 'components/Dashboard/ExportModal/ExportModal'

import { useAppDispatch } from 'state'
import { editCohort, setSelectedCohort } from 'state/cohort'

import { Cohort, CohortJobStatus } from 'types'

import { format } from 'utils/numbers'

import useStyles from '../styles'
import { AppConfig } from 'config'

const VersionRow: React.FC<{ requestId: string; cohortsList: Cohort[] }> = ({ requestId, cohortsList }) => {
  const { classes } = useStyles()
  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  const appConfig = useContext(AppConfig)
  const [selectedExportableCohort, setSelectedExportableCohort] = React.useState<Cohort | null>(null)

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
            <TableCellWrapper align="left">Nom</TableCellWrapper>
            <TableCellWrapper>Favoris</TableCellWrapper>
            <TableCellWrapper style={{ width: 125 }}>Statut</TableCellWrapper>
            <TableCellWrapper style={{ width: 125 }}>Version</TableCellWrapper>
            <TableCellWrapper style={{ width: 125 }}>Nombre de patients</TableCellWrapper>
            <Hidden lgDown>
              <TableCellWrapper style={{ width: 175 }}>Date</TableCellWrapper>
            </Hidden>

            <TableCellWrapper style={{ width: 66 }}>Exporter</TableCellWrapper>
          </TableRow>
        </TableHead>
        <TableBody>
          {cohorts && cohorts.length > 0 ? (
            cohorts.map((cohort) => {
              if (!cohort) return <></>

              const isError =
                !cohort.group_id ||
                cohort.request_job_status === CohortJobStatus.PENDING ||
                cohort.request_job_status === CohortJobStatus.NEW ||
                !!cohort.request_job_fail_msg

              const canExportThisCohort =
                !!appConfig.features.export.enabled && !isError ? cohort.rights?.export_csv_nomi : false

              return (
                <TableRow key={cohort.uuid}>
                  <TableCellWrapper align="left" className={classes.tdName}>
                    {cohort.group_id ? (
                      <Link
                        onClick={() => {
                          const searchParams = new URLSearchParams()
                          if (cohort.group_id) {
                            searchParams.set('groupId', cohort.group_id)
                          }
                          navigate(`/cohort?${searchParams.toString()}`)
                        }}
                        underline="hover"
                      >
                        {cohort.name}
                      </Link>
                    ) : (
                      <Typography component="span" className={classes.notAllowed}>
                        {cohort.name}
                      </Typography>
                    )}
                    <IconButton className={classes.editButton} size="small" onClick={() => _handleEditCohort(cohort)}>
                      <EditIcon />
                    </IconButton>
                  </TableCellWrapper>
                  <TableCellWrapper>
                    <IconButton onClick={() => onSetCohortFavorite(cohort)}>
                      <FavStar favorite={cohort.favorite} />
                    </IconButton>
                  </TableCellWrapper>
                  <TableCellWrapper>
                    {cohort.request_job_status === CohortJobStatus.FINISHED ? (
                      <Chip label="Terminé" style={{ backgroundColor: '#28a745', color: 'white' }} />
                    ) : cohort.request_job_status === CohortJobStatus.PENDING ||
                      cohort.request_job_status === CohortJobStatus.NEW ? (
                      <Chip label="En cours" style={{ backgroundColor: '#ffc107', color: 'black' }} />
                    ) : cohort.request_job_status === CohortJobStatus.LONG_PENDING ? (
                      <Tooltip title="Cohorte volumineuse: sa création est plus complexe et nécessite d'être placée dans une file d'attente. Un mail vous sera envoyé quand celle-ci sera disponible.">
                        <Chip
                          label="En cours"
                          size="small"
                          style={{ backgroundColor: '#ffc107', color: 'black' }}
                          icon={<UpdateIcon />}
                        />
                      </Tooltip>
                    ) : cohort.request_job_fail_msg ? (
                      <Tooltip title={cohort.request_job_fail_msg}>
                        <Chip label="Erreur" style={{ backgroundColor: '#dc3545', color: 'black' }} />
                      </Tooltip>
                    ) : (
                      <Chip label="Erreur" style={{ backgroundColor: '#dc3545', color: 'black' }} />
                    )}
                  </TableCellWrapper>
                  <TableCellWrapper>
                    <Link
                      className={classes.versionLabel}
                      onClick={() => navigate(`/cohort/new/${requestId}/${cohort.request_query_snapshot}`)}
                    >
                      {cohort.request_query_snapshot?.split('-')[0]}
                    </Link>
                  </TableCellWrapper>
                  <TableCellWrapper>{format(cohort.result_size)}</TableCellWrapper>
                  <Hidden lgDown>
                    <TableCellWrapper>{moment(cohort.modified_at).format('DD/MM/YYYY [à] HH:mm')}</TableCellWrapper>
                  </Hidden>

                  <TableCellWrapper>
                    <IconButton
                      disabled={!canExportThisCohort}
                      onClick={canExportThisCohort ? () => setSelectedExportableCohort(cohort ?? '') : () => null}
                    >
                      <ExportIcon />
                    </IconButton>
                  </TableCellWrapper>
                </TableRow>
              )
            })
          ) : (
            <TableRow>
              <TableCellWrapper colSpan={6}>
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
              </TableCellWrapper>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {!!appConfig.features.export.enabled && (
        <ExportModal
          cohortId={selectedExportableCohort?.uuid ?? ''}
          fhirGroupId={selectedExportableCohort?.group_id ?? ''}
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
