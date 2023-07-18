import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import {
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  Hidden,
  IconButton,
  Paper,
  Menu,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableSortLabel,
  TableRow,
  Tooltip,
  Typography
} from '@mui/material'

import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import InfoIcon from '@mui/icons-material/Info'

import { ReactComponent as Star } from 'assets/icones/star.svg'
import { ReactComponent as StarFull } from 'assets/icones/star full.svg'
import EditIcon from '@mui/icons-material/Edit'
import ExportIcon from '@mui/icons-material/GetApp'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import UpdateIcon from '@mui/icons-material/Update'

import ModalEditCohort from 'components/MyProjects/Modals/ModalEditCohort/ModalEditCohort'
import ExportModal from 'components/Dashboard/ExportModal/ExportModal'

import { useAppSelector, useAppDispatch } from 'state'
import { CohortState, setSelectedCohort as setSelectedCohortState } from 'state/cohort'

import { MeState } from 'state/me'

import { Cohort, CohortJobStatus } from 'types'

import displayDigit from 'utils/displayDigit'

import { ODD_EXPORT } from '../../../constants'

import useStyles from './styles'

type FavStarProps = {
  favorite?: boolean
}
const FavStar: React.FC<FavStarProps> = ({ favorite }) => {
  if (favorite) {
    return <StarFull height="15px" fill="#ED6D91" />
  }
  return <Star height="15px" fill="#ED6D91" />
}

const DisabledFavStar: React.FC<FavStarProps> = ({ favorite }) => {
  if (favorite) {
    return <StarFull height="15px" fill="#CBCFCF" />
  }
  return <Star height="15px" fill="#CBCFCF" />
}

type ResearchTableProps = {
  simplified?: boolean
  onClickRow?: Function
  researchData?: Cohort[]
  onSetCohortFavorite: (cohort: Cohort) => void
  onDeleteCohort: Function
  sortBy?: string
  sortDirection?: 'asc' | 'desc'
  onRequestSort?: any
  onUpdateCohorts: () => void
}
const ResearchTable: React.FC<ResearchTableProps> = ({
  simplified,
  onClickRow,
  researchData,
  onSetCohortFavorite,
  onDeleteCohort,
  sortBy,
  sortDirection,
  onRequestSort,
  onUpdateCohorts
}) => {
  const { classes } = useStyles()
  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  const [dialogOpen, setOpenDialog] = useState(false)
  const [selectedCohort, setSelectedCohort] = useState<Cohort | undefined>()
  const [selectedExportableCohort, setSelectedExportableCohort] = useState<number | undefined>()
  const [anchorEl, setAnchorEl] = React.useState(null)
  const openMenuItem = Boolean(anchorEl)

  const { cohortState } = useAppSelector<{
    cohortState: CohortState
  }>((state) => ({
    cohortState: state.cohort
  }))
  const selectedCohortState = cohortState.selectedCohort

  const { meState } = useAppSelector<{
    meState: MeState
  }>((state) => ({
    meState: state.me
  }))

  const maintenanceIsActive = meState?.maintenance?.active

  const _onClickRow = (row: any) => {
    return row.request_job_status === CohortJobStatus._pending ||
      row.request_job_status === CohortJobStatus._long_pending ||
      row.request_job_status === CohortJobStatus._failed
      ? null
      : onClickRow
      ? onClickRow(row)
      : navigate(`/cohort/${row.fhir_group_id}`)
  }

  const removeCohort = () => {
    onDeleteCohort(selectedCohort)
  }

  const handleClickOpenDialog = () => {
    setOpenDialog(true)
  }

  const handleCloseDialog = () => {
    setOpenDialog(false)
  }

  const createSortHandler = (property: any) => (event: React.MouseEvent<unknown>) => {
    onRequestSort(event, property)
  }

  const editCohort = async () => {
    await dispatch(setSelectedCohortState(null))

    onUpdateCohorts()
  }

  return (
    <>
      {
        //@ts-ignore
        !researchData?.length > 0 ? (
          <Grid container justifyContent="center">
            <Typography variant="button"> Aucune cohorte à afficher </Typography>
          </Grid>
        ) : (
          <TableContainer component={Paper}>
            <Table className={classes.table} aria-label="simple table">
              <TableHead>
                <TableRow className={classes.tableHead}>
                  <TableCell
                    className={classes.tableHeadCell}
                    sortDirection={sortBy === 'name' ? sortDirection : false}
                  >
                    {sortDirection ? (
                      <TableSortLabel
                        active={sortBy === 'name'}
                        direction={sortBy === 'name' ? sortDirection : 'asc'}
                        onClick={createSortHandler('name')}
                      >
                        Titre
                      </TableSortLabel>
                    ) : (
                      'Titre'
                    )}
                  </TableCell>
                  <TableCell
                    className={classes.tableHeadCell}
                    align="center"
                    sortDirection={sortBy === 'favorite' ? sortDirection : false}
                  >
                    {sortDirection ? (
                      <TableSortLabel
                        active={sortBy === 'favorite'}
                        direction={sortBy === 'favorite' ? sortDirection : 'asc'}
                        onClick={createSortHandler('favorite')}
                      >
                        Favoris
                      </TableSortLabel>
                    ) : (
                      'Favoris'
                    )}
                  </TableCell>
                  <TableCell className={classes.tableHeadCell} align="center">
                    Statut
                  </TableCell>
                  <TableCell
                    align="center"
                    className={classes.tableHeadCell}
                    sortDirection={sortBy === 'result_size' ? sortDirection : false}
                  >
                    {sortDirection ? (
                      <TableSortLabel
                        active={sortBy === 'result_size'}
                        direction={sortBy === 'result_size' ? sortDirection : 'asc'}
                        onClick={createSortHandler('result_size')}
                      >
                        Nombre de patients
                      </TableSortLabel>
                    ) : (
                      'Nombre de patients'
                    )}
                  </TableCell>
                  <TableCell className={classes.tableHeadCell} align="center">
                    Estimation du nombre de patients APHP
                    <Tooltip title="Cet intervalle correspond à une estimation du nombre de patients correspondant aux critères de votre requête avec comme population source tous les hôpitaux de l'APHP.">
                      <IconButton size="small" className={classes.infoButton}>
                        <InfoIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                  <TableCell
                    align="center"
                    className={classes.tableHeadCell}
                    sortDirection={sortBy === 'modified_at' ? sortDirection : false}
                  >
                    {sortDirection ? (
                      <TableSortLabel
                        active={sortBy === 'modified_at'}
                        direction={sortBy === 'modified_at' ? sortDirection : 'asc'}
                        onClick={createSortHandler('modified_at')}
                      >
                        Date de modification
                      </TableSortLabel>
                    ) : (
                      'Date de modification'
                    )}
                  </TableCell>
                  <TableCell align="center" className={classes.tableHeadCell}>
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {researchData?.map((row: Cohort) => {
                  const canExportThisCohort = !!ODD_EXPORT ? row?.rights?.export_csv_nomi : false
                  return (
                    <TableRow
                      className={
                        row.request_job_status === CohortJobStatus._pending ||
                        row.request_job_status === CohortJobStatus._long_pending ||
                        row.request_job_status === CohortJobStatus._failed
                          ? classes.notAllow
                          : classes.pointerHover
                      }
                      hover
                      key={row.uuid}
                    >
                      <TableCell onClick={() => _onClickRow(row)}>{row.name}</TableCell>
                      <TableCell align="center">
                        <IconButton
                          onClick={(event) => {
                            event.stopPropagation()
                            onSetCohortFavorite(row)
                          }}
                          disabled={maintenanceIsActive || !row.fhir_group_id}
                        >
                          {maintenanceIsActive ? (
                            <DisabledFavStar favorite={row.favorite} />
                          ) : (
                            <FavStar favorite={row.favorite} />
                          )}
                        </IconButton>
                      </TableCell>
                      <TableCell onClick={() => _onClickRow(row)} align="center">
                        {row.request_job_status === CohortJobStatus._finished ? (
                          <Chip label="Terminé" size="small" style={{ backgroundColor: '#28a745', color: 'white' }} />
                        ) : row.request_job_status === CohortJobStatus._pending ||
                          row.request_job_status === CohortJobStatus._new ? (
                          <Chip label="En cours" size="small" style={{ backgroundColor: '#ffc107', color: 'black' }} />
                        ) : row.request_job_status === CohortJobStatus._long_pending ? (
                          <Tooltip title="Cohorte volumineuse: sa création est plus complexe et nécessite d'être placée dans une file d'attente. Un mail vous sera envoyé quand celle-ci sera disponible.">
                            <Chip
                              label="En cours"
                              size="small"
                              style={{ backgroundColor: '#ffc107', color: 'black' }}
                              icon={<UpdateIcon />}
                            />
                          </Tooltip>
                        ) : row.request_job_fail_msg ? (
                          <Tooltip title={row.request_job_fail_msg}>
                            <Chip label="Erreur" size="small" style={{ backgroundColor: '#dc3545', color: 'black' }} />
                          </Tooltip>
                        ) : (
                          <Chip label="Erreur" size="small" style={{ backgroundColor: '#dc3545', color: 'black' }} />
                        )}
                      </TableCell>
                      <TableCell onClick={() => _onClickRow(row)} align="center">
                        {displayDigit(row.result_size ?? 0)}
                      </TableCell>
                      <TableCell onClick={() => _onClickRow(row)} align="center">
                        {row.dated_measure_global
                          ? `${displayDigit(row.dated_measure_global.measure_min) ?? 'X'} - ${
                              displayDigit(row.dated_measure_global.measure_max) ?? 'X'
                            }`
                          : '-'}
                      </TableCell>
                      <TableCell onClick={() => _onClickRow(row)} align="center">
                        {row.modified_at ? (
                          <>
                            {new Date(row.modified_at).toLocaleDateString('fr-FR')}{' '}
                            {new Date(row.modified_at).toLocaleTimeString('fr-FR', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </>
                        ) : (
                          '-'
                        )}
                      </TableCell>
                      <TableCell align="center">
                        <Hidden lgDown>
                          <Grid
                            container
                            direction="row"
                            alignItems="center"
                            justifyContent="center"
                            style={{ width: 'max-content', margin: 'auto' }}
                          >
                            <Grid item>
                              <>
                                {console.log(row.exportable)}
                                <Tooltip
                                  title={
                                    !row.exportable
                                      ? 'Cette cohorte ne peut pas être exportée car elle dépasse le seuil de nombre de patients maximum autorisé.'
                                      : !canExportThisCohort && row.request_job_status === CohortJobStatus._finished
                                      ? "Vous n'avez pas les droits suffisant pour exporter cette cohorte."
                                      : row.request_job_status === CohortJobStatus._failed
                                      ? 'Cette cohorte ne peut pas être exportée car elle a échouée lors de sa création'
                                      : row.request_job_status === CohortJobStatus._pending
                                      ? 'Cette cohorte ne peut pas être exportée car elle est en cours de création'
                                      : ''
                                  }
                                >
                                  <div>
                                    <IconButton
                                      size="small"
                                      onClick={(event) => {
                                        event.stopPropagation()
                                        setSelectedExportableCohort(row.fhir_group_id ? +row.fhir_group_id : undefined)
                                      }}
                                      disabled={
                                        !canExportThisCohort ||
                                        !row.exportable ||
                                        maintenanceIsActive ||
                                        row.request_job_status === CohortJobStatus._long_pending ||
                                        row.request_job_status === CohortJobStatus._failed ||
                                        row.request_job_status === CohortJobStatus._pending
                                      }
                                    >
                                      <ExportIcon />
                                    </IconButton>
                                  </div>
                                </Tooltip>
                              </>
                            </Grid>

                            <>
                              <Grid item>
                                <IconButton
                                  size="small"
                                  onClick={(event) => {
                                    event.stopPropagation()
                                    dispatch(setSelectedCohortState(row ?? null))
                                  }}
                                  disabled={maintenanceIsActive}
                                >
                                  <EditIcon />
                                </IconButton>
                              </Grid>

                              <Grid item>
                                <IconButton
                                  size="small"
                                  onClick={(event) => {
                                    event.stopPropagation()
                                    handleClickOpenDialog()
                                    setSelectedCohort(row)
                                  }}
                                  disabled={maintenanceIsActive}
                                >
                                  <DeleteOutlineIcon />
                                </IconButton>
                              </Grid>
                            </>
                          </Grid>
                        </Hidden>
                        <Hidden lgUp>
                          <IconButton
                            aria-label="more"
                            id="long-button"
                            aria-controls="long-menu"
                            aria-expanded={openMenuItem ? 'true' : undefined}
                            aria-haspopup="true"
                            onClick={(event) => {
                              event.stopPropagation()
                              // @ts-ignore
                              setAnchorEl(event.currentTarget)
                              setSelectedCohort(row)
                            }}
                          >
                            <MoreVertIcon />
                          </IconButton>
                          <Menu
                            anchorEl={anchorEl}
                            open={openMenuItem && row.uuid === selectedCohort?.uuid}
                            onClose={() => setAnchorEl(null)}
                          >
                            {canExportThisCohort && row.exportable && (
                              <MenuItem
                                className={classes.menuItem}
                                onClick={(event) => {
                                  event.stopPropagation()
                                  setSelectedExportableCohort(row.fhir_group_id ? +row.fhir_group_id : undefined)
                                  setAnchorEl(null)
                                }}
                                disabled={maintenanceIsActive}
                              >
                                <ExportIcon /> Exporter
                              </MenuItem>
                            )}
                            {canExportThisCohort && !row.exportable && (
                              <Tooltip title="Cette cohorte ne peut pas être exportée car elle dépasse le seuil de nombre de patients maximum autorisé.">
                                <span>
                                  <MenuItem
                                    className={classes.menuItem}
                                    onClick={(event) => {
                                      event.stopPropagation()
                                      setSelectedExportableCohort(row.fhir_group_id ? +row.fhir_group_id : undefined)
                                      setAnchorEl(null)
                                    }}
                                    disabled={maintenanceIsActive || !row.exportable}
                                  >
                                    <>
                                      <ExportIcon /> Exporter
                                    </>
                                  </MenuItem>
                                </span>
                              </Tooltip>
                            )}
                            <MenuItem
                              className={classes.menuItem}
                              onClick={(event) => {
                                event.stopPropagation()
                                dispatch(setSelectedCohortState(row ?? null))
                                setAnchorEl(null)
                              }}
                              disabled={maintenanceIsActive}
                            >
                              <EditIcon /> Modifier
                            </MenuItem>
                            <MenuItem
                              className={classes.menuItem}
                              onClick={(event) => {
                                event.stopPropagation()
                                setSelectedCohort(row)
                                handleClickOpenDialog()
                                setAnchorEl(null)
                              }}
                              disabled={maintenanceIsActive}
                            >
                              <DeleteOutlineIcon /> Supprimer
                            </MenuItem>
                          </Menu>
                        </Hidden>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )
      }

      {!simplified && (
        <Dialog
          open={dialogOpen}
          onClose={handleCloseDialog}
          aria-labelledby="alert-dialog-slide-title"
          aria-describedby="alert-dialog-slide-description"
        >
          <DialogTitle id="alert-dialog-slide-title">Supprimer une cohorte</DialogTitle>

          <DialogContent>Êtes-vous sûr(e) de vouloir supprimer la cohorte ?</DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Non</Button>
            <Button
              onClick={() => {
                handleCloseDialog()
                removeCohort()
              }}
              color="secondary"
            >
              Oui
            </Button>
          </DialogActions>
        </Dialog>
      )}

      <ModalEditCohort open={selectedCohortState !== null} onClose={editCohort} />

      {!!ODD_EXPORT && (
        <ExportModal
          cohortId={selectedExportableCohort ? selectedExportableCohort : 0}
          open={!!selectedExportableCohort}
          handleClose={() => setSelectedExportableCohort(undefined)}
        />
      )}
    </>
  )
}

export default ResearchTable
