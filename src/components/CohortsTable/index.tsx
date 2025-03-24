import React, { useContext, useState } from 'react'
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
  Typography,
  CircularProgress
} from '@mui/material'

import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import InfoIcon from '@mui/icons-material/Info'

import Star from 'assets/icones/star.svg?react'
import StarFull from 'assets/icones/star full.svg?react'
import EditIcon from '@mui/icons-material/Edit'
import ExportIcon from '@mui/icons-material/GetApp'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import UpdateIcon from '@mui/icons-material/Update'

import ModalEditCohort from 'components/Requests/Modals/ModalEditCohort/ModalEditCohort'
import ExportModal from 'components/Dashboard/ExportModal/ExportModal'

import { useAppSelector, useAppDispatch } from 'state'
import { deleteCohort, editCohort, setSelectedCohort as setSelectedCohortState } from 'state/cohort'

import { Cohort, CohortJobStatus } from 'types'

import { format } from 'utils/numbers'

import useStyles from './styles'
import { Direction, Order, OrderBy } from 'types/searchCriterias'
import { AppConfig } from 'config'

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
  data: Cohort[]
  orderBy?: Order
  orderDirection?: Direction
  loading: boolean
  onChangeOrder?: (order: OrderBy) => void
  onUpdate: () => void
}
const ResearchTable: React.FC<ResearchTableProps> = ({
  data,
  orderBy,
  orderDirection,
  loading,
  onChangeOrder,
  onUpdate
}) => {
  const { classes } = useStyles()
  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  const appConfig = useContext(AppConfig)
  const [dialogOpen, setOpenDialog] = useState(false)
  const [selectedCohort, setSelectedCohort] = useState<Cohort | undefined>()
  const [selectedExportableCohort, setSelectedExportableCohort] = useState<Cohort | undefined>()
  const [anchorEl, setAnchorEl] = React.useState(null)
  const openMenuItem = Boolean(anchorEl)

  const selectedCohortState = useAppSelector((state) => state.cohort.selectedCohort)
  const meState = useAppSelector((state) => state.me)
  const maintenanceIsActive = meState?.maintenance?.active

  const onClickRow = (row: Cohort) => {
    if (
      row.request_job_status === CohortJobStatus.PENDING ||
      row.request_job_status === CohortJobStatus.LONG_PENDING ||
      row.request_job_status === CohortJobStatus.FAILED
    )
      return

    const searchParams = new URLSearchParams()
    if (row.group_id) {
      searchParams.set('groupId', row.group_id)
    }
    navigate(`/cohort?${searchParams.toString()}`)
  }

  const goToExportPage = (row: Cohort) => {
    const searchParams = new URLSearchParams()
    if (row.group_id) {
      searchParams.set('groupId', row.group_id)
    }
    navigate(`/exports/new?${searchParams.toString()}`)
  }

  const handleClickOpenDialog = () => {
    setOpenDialog(true)
  }

  const handleCloseDialog = () => {
    setOpenDialog(false)
  }

  const onEditCohort = () => {
    onUpdate()
  }

  const onDeleteCohort = async (cohort: Cohort) => {
    await dispatch(deleteCohort({ deletedCohort: cohort }))
    onUpdate()
  }

  const onSetCohortFavorite = async (cohort: Cohort) => {
    await dispatch(editCohort({ editedCohort: { ...cohort, favorite: !cohort.favorite } }))
    onUpdate()
  }

  return (
    <>
      {loading && (
        <Grid container justifyContent="center">
          <CircularProgress />
        </Grid>
      )}
      {!loading && data.length < 1 && (
        <Grid container justifyContent="center" style={{ marginTop: 10 }}>
          <Typography variant="button"> Aucune cohorte à afficher </Typography>
        </Grid>
      )}
      {!loading && data.length > 0 && (
        <TableContainer component={Paper}>
          <Table className={classes.table} aria-label="simple table">
            <TableHead>
              <TableRow className={classes.tableHead}>
                <TableCell
                  className={classes.tableHeadCell}
                  sortDirection={orderBy === Order.NAME ? orderDirection : false}
                >
                  {orderDirection ? (
                    <TableSortLabel
                      active={orderBy === Order.NAME}
                      direction={orderDirection}
                      onClick={() => {
                        if (onChangeOrder)
                          onChangeOrder({
                            orderBy: Order.NAME,
                            orderDirection: orderDirection === Direction.ASC ? Direction.DESC : Direction.ASC
                          })
                      }}
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
                  sortDirection={orderBy === Order.FAVORITE ? orderDirection : false}
                >
                  {orderDirection ? (
                    <TableSortLabel
                      active={orderBy === Order.FAVORITE}
                      direction={orderDirection}
                      onClick={() => {
                        if (onChangeOrder)
                          onChangeOrder({
                            orderBy: Order.FAVORITE,
                            orderDirection: orderDirection === Direction.ASC ? Direction.DESC : Direction.ASC
                          })
                      }}
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
                  sortDirection={orderBy === Order.RESULT_SIZE ? orderDirection : false}
                >
                  {orderDirection ? (
                    <TableSortLabel
                      active={orderBy === Order.RESULT_SIZE}
                      direction={orderDirection}
                      onClick={() => {
                        if (onChangeOrder)
                          onChangeOrder({
                            orderBy: Order.RESULT_SIZE,
                            orderDirection: orderDirection === Direction.ASC ? Direction.DESC : Direction.ASC
                          })
                      }}
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
                  sortDirection={orderBy === Order.MODIFIED ? orderDirection : false}
                >
                  {orderDirection ? (
                    <TableSortLabel
                      active={orderBy === Order.MODIFIED}
                      direction={orderDirection}
                      onClick={() => {
                        if (onChangeOrder)
                          onChangeOrder({
                            orderBy: Order.MODIFIED,
                            orderDirection: orderDirection === Direction.ASC ? Direction.DESC : Direction.ASC
                          })
                      }}
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
              {data?.map((row: Cohort) => {
                const canExportThisCohort = !!appConfig.features.export.enabled ? row?.rights?.export_csv_nomi : false

                return (
                  <TableRow
                    className={
                      row.request_job_status === CohortJobStatus.FINISHED ? classes.pointerHover : classes.notAllow
                    }
                    hover
                    key={row.uuid}
                  >
                    <TableCell onClick={() => onClickRow(row)}>{row.name}</TableCell>
                    <TableCell align="center">
                      <IconButton
                        onClick={(event) => {
                          event.stopPropagation()
                          onSetCohortFavorite(row)
                        }}
                        disabled={maintenanceIsActive || !row.uuid}
                      >
                        {maintenanceIsActive ? (
                          <DisabledFavStar favorite={row.favorite} />
                        ) : (
                          <FavStar favorite={row.favorite} />
                        )}
                      </IconButton>
                    </TableCell>
                    <TableCell onClick={() => onClickRow(row)} align="center">
                      {row.request_job_status === CohortJobStatus.FINISHED ? (
                        <Chip label="Terminé" size="small" style={{ backgroundColor: '#28a745', color: 'white' }} />
                      ) : row.request_job_status === CohortJobStatus.PENDING ||
                        row.request_job_status === CohortJobStatus.NEW ? (
                        <Chip label="En cours" size="small" style={{ backgroundColor: '#ffc107', color: 'black' }} />
                      ) : row.request_job_status === CohortJobStatus.LONG_PENDING ? (
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
                    <TableCell onClick={() => onClickRow(row)} align="center">
                      {format(row.result_size)}
                    </TableCell>
                    <TableCell onClick={() => onClickRow(row)} align="center">
                      {row.dated_measure_global
                        ? row.dated_measure_global?.measure_min === null ||
                          row.dated_measure_global?.measure_max === null
                          ? '-'
                          : `${format(row.dated_measure_global?.measure_min)} - ${format(
                              row.dated_measure_global?.measure_max
                            )}`
                        : '-'}
                    </TableCell>
                    <TableCell onClick={() => onClickRow(row)} align="center">
                      {row.modified_at ? (
                        <>
                          {new Date(row.modified_at).toLocaleDateString('fr-FR')} {'à'}{' '}
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
                            <Tooltip
                              title={
                                !row.exportable
                                  ? 'Cette cohorte ne peut pas être exportée car elle dépasse le seuil de nombre de patients maximum autorisé.'
                                  : !canExportThisCohort && row.request_job_status === CohortJobStatus.FINISHED
                                  ? "Vous n'avez pas les droits suffisants pour exporter cette cohorte."
                                  : row.request_job_status === CohortJobStatus.FAILED
                                  ? 'Cette cohorte ne peut pas être exportée car elle a échoué lors de sa création'
                                  : row.request_job_status === CohortJobStatus.PENDING
                                  ? 'Cette cohorte ne peut pas être exportée car elle est en cours de création'
                                  : ''
                              }
                            >
                              <div>
                                <IconButton
                                  size="small"
                                  onClick={(event) => {
                                    event.stopPropagation()
                                    goToExportPage(row)
                                    // setSelectedExportableCohort(row ?? undefined)
                                  }}
                                  disabled={
                                    !canExportThisCohort ||
                                    !row.exportable ||
                                    maintenanceIsActive ||
                                    row.request_job_status === CohortJobStatus.LONG_PENDING ||
                                    row.request_job_status === CohortJobStatus.FAILED ||
                                    row.request_job_status === CohortJobStatus.PENDING
                                  }
                                >
                                  <ExportIcon />
                                </IconButton>
                              </div>
                            </Tooltip>
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
                                goToExportPage(row)
                                // setSelectedExportableCohort(row ?? undefined)
                                // setAnchorEl(null)
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
                                    setSelectedExportableCohort(row ?? undefined)
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
      )}

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
              // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
              onDeleteCohort(selectedCohort!)
            }}
            color="secondary"
          >
            Oui
          </Button>
        </DialogActions>
      </Dialog>

      <ModalEditCohort open={selectedCohortState !== null} onClose={onEditCohort} />

      {!!appConfig.features.export.enabled && (
        <ExportModal
          cohortId={selectedExportableCohort?.uuid ?? ''}
          open={!!selectedExportableCohort}
          handleClose={() => setSelectedExportableCohort(undefined)}
          fhirGroupId={selectedExportableCohort?.group_id ?? ''}
        />
      )}
    </>
  )
}

export default ResearchTable
