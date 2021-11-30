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

import { ReactComponent as Star } from 'assets/icones/star.svg'
import { ReactComponent as StarFull } from 'assets/icones/star full.svg'
import EditIcon from '@material-ui/icons/Edit'
import ExportIcon from '@material-ui/icons/GetApp'
import MoreVertIcon from '@material-ui/icons/MoreVert'

import ModalEditCohort from 'components/MyProjects/Modals/ModalEditCohort/ModalEditCohort'
import ExportModal from 'components/Cohort/ExportModal/ExportModal'

import { useAppSelector } from 'state'
import { CohortState, setSelectedCohort as setSelectedCohortState } from 'state/cohort'

import { FormattedCohort } from 'types'

import displayDigit from 'utils/displayDigit'

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
  researchData?: FormattedCohort[]
  onSetCohortFavorite: (cohortId: string) => void
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
  const [selectedCohort, setSelectedCohort] = useState<string | undefined>()
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
                  </TableCell>
                  <TableCell
                    align="center"
                    className={classes.tableHeadCell}
                    sortDirection={sortBy === 'fhir_datetime' ? sortDirection : false}
                  >
                    {sortDirection ? (
                      <TableSortLabel
                        active={sortBy === 'fhir_datetime'}
                        direction={sortBy === 'fhir_datetime' ? sortDirection : 'asc'}
                        onClick={createSortHandler('fhir_datetime')}
                      >
                        Date de création
                      </TableSortLabel>
                    ) : (
                      'Date de création'
                    )}
                  </TableCell>
                  <TableCell align="center" className={classes.tableHeadCell}>
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {researchData?.map((row: FormattedCohort) => (
                  <TableRow
                    className={!row.fhir_group_id ? classes.notAllow : classes.pointerHover}
                    hover
                    key={row.researchId}
                  >
                    <TableCell onClick={() => _onClickRow(row)}>{row.name}</TableCell>
                    <TableCell align="center">
                      <IconButton
                        onClick={(event) => {
                          event.stopPropagation()
                          onSetCohortFavorite(row.researchId)
                        }}
                      >
                        <FavStar favorite={row.favorite} />
                      </IconButton>
                    </TableCell>
                    <TableCell onClick={() => _onClickRow(row)} className={classes.status} align="center">
                      {row.status}
                    </TableCell>
                    <TableCell onClick={() => _onClickRow(row)} align="center">
                      {row.fhir_group_id ? (
                        <Chip label="Terminé" style={{ backgroundColor: '#28a745', color: 'white' }} />
                      ) : row.jobStatus === 'pending' || row.jobStatus === 'started' ? (
                        <Chip label="En cours" style={{ backgroundColor: '#ffc107', color: 'black' }} />
                      ) : row.jobFailMsg ? (
                        <Tooltip title={row.jobFailMsg}>
                          <Chip label="Erreur" style={{ backgroundColor: '#dc3545', color: 'black' }} />
                        </Tooltip>
                      ) : (
                        <Chip label="Erreur" style={{ backgroundColor: '#dc3545', color: 'black' }} />
                      )}
                    </TableCell>
                    <TableCell onClick={() => _onClickRow(row)} align="center">
                      {displayDigit(row.nPatients ?? 0)}
                    </TableCell>
                    <TableCell onClick={() => _onClickRow(row)} align="center">
                      {row.nGlobal ?? '-'}
                    </TableCell>
                    <TableCell onClick={() => _onClickRow(row)} align="center">
                      {row.date && (
                        <>
                          {new Date(row.date).toLocaleDateString('fr-FR')}{' '}
                          {new Date(row.date).toLocaleTimeString('fr-FR', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </>
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
                          {row.canMakeExport && (
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
                                dispatch(setSelectedCohortState(row.researchId))
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
                                setSelectedCohort(row.researchId)
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
                            setSelectedCohort(row.researchId)
                          }}
                        >
                          <MoreVertIcon />
                        </IconButton>
                        <Menu
                          anchorEl={anchorEl}
                          open={openMenuItem && row.researchId === selectedCohort}
                          onClose={() => setAnchorEl(null)}
                        >
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
                          <MenuItem
                            className={classes.menuItem}
                            onClick={(event) => {
                              event.stopPropagation()
                              dispatch(setSelectedCohortState(row.researchId))
                              setAnchorEl(null)
                            }}
                          >
                            <EditIcon /> Modifier
                          </MenuItem>
                          <MenuItem
                            className={classes.menuItem}
                            onClick={(event) => {
                              event.stopPropagation()
                              setSelectedCohort(row.researchId)
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
                ))}
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

      <ExportModal
        cohortId={selectedExportableCohort ? selectedExportableCohort : 0}
        open={!!selectedExportableCohort}
        handleClose={() => setSelectedExportableCohort(undefined)}
      />
    </>
  )
}

export default ResearchTable
