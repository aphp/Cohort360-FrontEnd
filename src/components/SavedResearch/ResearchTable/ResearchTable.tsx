import React, { useState } from 'react'
import { useHistory } from 'react-router-dom'
import { useDispatch } from 'react-redux'

import {
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogTitle,
  Grid,
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
  Hidden
} from '@material-ui/core'

import DeleteOutlineIcon from '@material-ui/icons/DeleteOutline'
import InfoIcon from '@material-ui/icons/Info'

import { ReactComponent as Star } from 'assets/icones/star.svg'
import { ReactComponent as StarFull } from 'assets/icones/star full.svg'
import EditIcon from '@material-ui/icons/Edit'
import ExportIcon from '@material-ui/icons/GetApp'
import MoreVertIcon from '@material-ui/icons/MoreVert'

import ModalEditCohort from 'components/MyProjects/Modals/ModalEditCohort/ModalEditCohort'
import ExportModal from 'components/Cohort/ExportModal/ExportModal'

import { useAppSelector } from 'state'
import { CohortState, setSelectedCohort as setSelectedCohortState } from 'state/cohort'

import { Cohort } from 'types'

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

type ResearchTableProps = {
  simplified?: boolean
  onClickRow?: Function
  researchData?: Cohort[]
  onSetCohortFavorite: (cohort: Cohort) => void
  onDeleteCohort: Function
  sortBy?: string
  sortDirection?: 'asc' | 'desc'
  onRequestSort?: any
}
const ResearchTable: React.FC<ResearchTableProps> = ({
  simplified,
  onClickRow,
  researchData,
  onSetCohortFavorite,
  onDeleteCohort,
  sortBy,
  sortDirection,
  onRequestSort
}) => {
  const classes = useStyles()
  const dispatch = useDispatch()
  const history = useHistory()

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

  const _onClickRow = (row: any) => {
    return !row.fhir_group_id ? null : onClickRow ? onClickRow(row) : history.push(`/cohort/${row.fhir_group_id}`)
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

  // You can make an export if you got 1 cohort with: EXPORT_DATA_NOMINATIVE = true && READ_DATA_NOMINATIVE = true
  const canMakeExport = researchData
    ? ODD_EXPORT &&
      researchData.some((cohort) =>
        cohort.extension && cohort.extension.length > 0
          ? cohort.extension.find(
              (extension) => extension.url === 'EXPORT_DATA_NOMINATIVE' && extension.valueString === 'true'
            ) &&
            cohort.extension.find(
              (extension) => extension.url === 'READ_DATA_NOMINATIVE' && extension.valueString === 'true'
            )
          : false
      )
    : false

  return (
    <>
      {
        //@ts-ignore
        !researchData?.length > 0 ? (
          <Grid container justify="center">
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
                  <TableCell
                    className={classes.tableHeadCell}
                    align="center"
                    sortDirection={sortBy === 'type' ? sortDirection : false}
                  >
                    {sortDirection ? (
                      <TableSortLabel
                        active={sortBy === 'type'}
                        direction={sortBy === 'type' ? sortDirection : 'asc'}
                        onClick={createSortHandler('type')}
                      >
                        Type
                      </TableSortLabel>
                    ) : (
                      'Type'
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
                    <Tooltip title="Cet interval correspond à une estimation du nombre de patients correspondant aux critères de votre requête avec comme population source tous les hopitaux de l'APHP">
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
                  const canExportThisCohort =
                    canMakeExport && row.extension
                      ? row.extension.some(
                          (extension) => extension.url === 'EXPORT_DATA_NOMINATIVE' && extension.valueString === 'true'
                        ) &&
                        row.extension.some(
                          (extension) => extension.url === 'READ_DATA_NOMINATIVE' && extension.valueString === 'true'
                        )
                      : false

                  return (
                    <TableRow
                      className={!row.fhir_group_id ? classes.notAllow : classes.pointerHover}
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
                        >
                          <FavStar favorite={row.favorite} />
                        </IconButton>
                      </TableCell>
                      <TableCell onClick={() => _onClickRow(row)} className={classes.status} align="center">
                        {row.type === 'MY_COHORTS' ? 'Cohort360' : 'Cohort I2B2'}
                      </TableCell>
                      <TableCell onClick={() => _onClickRow(row)} align="center">
                        {row.fhir_group_id ? (
                          <Chip label="Terminé" style={{ backgroundColor: '#28a745', color: 'white' }} />
                        ) : row.request_job_status === 'pending' || row.request_job_status === 'started' ? (
                          <Chip label="En cours" style={{ backgroundColor: '#ffc107', color: 'black' }} />
                        ) : row.request_job_fail_msg ? (
                          <Tooltip title={row.request_job_fail_msg}>
                            <Chip label="Erreur" style={{ backgroundColor: '#dc3545', color: 'black' }} />
                          </Tooltip>
                        ) : (
                          <Chip label="Erreur" style={{ backgroundColor: '#dc3545', color: 'black' }} />
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
                        <Hidden mdDown>
                          <Grid
                            container
                            direction="row"
                            alignItems="center"
                            justify="center"
                            style={{ width: 'max-content', margin: 'auto' }}
                          >
                            {canExportThisCohort && (
                              <Grid item>
                                <IconButton
                                  size="small"
                                  onClick={(event) => {
                                    event.stopPropagation()
                                    setSelectedExportableCohort(row.fhir_group_id ? +row.fhir_group_id : undefined)
                                  }}
                                >
                                  <ExportIcon />
                                </IconButton>
                              </Grid>
                            )}

                            <Grid item>
                              <IconButton
                                size="small"
                                onClick={(event) => {
                                  event.stopPropagation()
                                  dispatch(setSelectedCohortState(row?.uuid ?? null))
                                }}
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
                              >
                                <DeleteOutlineIcon />
                              </IconButton>
                            </Grid>
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
                            {canExportThisCohort && (
                              <MenuItem
                                className={classes.menuItem}
                                onClick={(event) => {
                                  event.stopPropagation()
                                  setSelectedExportableCohort(row.fhir_group_id ? +row.fhir_group_id : undefined)
                                  setAnchorEl(null)
                                }}
                              >
                                <ExportIcon /> Exporter
                              </MenuItem>
                            )}
                            <MenuItem
                              className={classes.menuItem}
                              onClick={(event) => {
                                event.stopPropagation()
                                dispatch(setSelectedCohortState(row.uuid ?? null))
                                setAnchorEl(null)
                              }}
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
          <DialogTitle id="alert-dialog-slide-title">Etes-vous sûr de vouloir supprimer la cohorte ?</DialogTitle>
          <DialogActions>
            <Button onClick={handleCloseDialog} color="primary">
              Non
            </Button>
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

      <ModalEditCohort
        open={selectedCohortState !== null}
        onClose={() => dispatch<any>(setSelectedCohortState(null))}
      />

      {ODD_EXPORT && (
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
