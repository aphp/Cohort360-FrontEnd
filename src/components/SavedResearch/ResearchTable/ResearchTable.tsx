import React, { useState } from 'react'
import { useHistory } from 'react-router-dom'

import {
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogTitle,
  Grid,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableSortLabel,
  TableRow,
  Typography
} from '@material-ui/core'

import DeleteOutlineIcon from '@material-ui/icons/DeleteOutline'

import { ReactComponent as Star } from '../../../assets/icones/star.svg'
import { ReactComponent as StarFull } from '../../../assets/icones/star full.svg'

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
  const [dialogOpen, setOpenDialog] = useState(false)
  const [selectedCohort, setSelectedCohort] = useState<string | undefined>()

  const history = useHistory()

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
                  <TableCell className={classes.tableHeadCell} align="center">
                    Type
                  </TableCell>
                  <TableCell className={classes.tableHeadCell} align="center">
                    Statut
                  </TableCell>
                  <TableCell align="center" className={classes.tableHeadCell}>
                    Nombre de patients
                  </TableCell>
                  <TableCell
                    align="center"
                    className={classes.tableHeadCell}
                    sortDirection={sortBy === 'date' ? sortDirection : false}
                  >
                    {sortDirection ? (
                      <TableSortLabel
                        active={sortBy === 'date'}
                        direction={sortBy === 'date' ? sortDirection : 'asc'}
                        onClick={createSortHandler('date')}
                      >
                        Date de création
                      </TableSortLabel>
                    ) : (
                      'Date de création'
                    )}
                  </TableCell>
                  <TableCell
                    align="center"
                    className={classes.tableHeadCell}
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

                  {!simplified && (
                    <TableCell align="center" className={classes.tableHeadCell}>
                      Supprimer
                    </TableCell>
                  )}
                </TableRow>
              </TableHead>
              <TableBody>
                {researchData?.map((row: FormattedCohort) => (
                  <TableRow
                    className={!row.fhir_group_id ? classes.notAllow : classes.pointerHover}
                    hover
                    key={row.researchId}
                    onClick={
                      !row.fhir_group_id
                        ? () => null
                        : onClickRow
                        ? () => onClickRow(row)
                        : () => history.push(`/cohort/${row.fhir_group_id}`)
                    }
                  >
                    <TableCell>{row.name}</TableCell>
                    <TableCell className={classes.status} align="center">
                      {row.status}
                    </TableCell>
                    <TableCell align="center">
                      {row.fhir_group_id ? (
                        <Chip label="Terminé" style={{ backgroundColor: '#28a745', color: 'white' }} />
                      ) : row.jobStatus === 'pending' ? (
                        <Chip label="En attente" style={{ backgroundColor: '#ffc107', color: 'black' }} />
                      ) : (
                        <Chip label="Erreur" style={{ backgroundColor: '#dc3545', color: 'black' }} />
                      )}
                    </TableCell>
                    <TableCell align="center">{displayDigit(row.nPatients ?? 0)}</TableCell>
                    <TableCell align="center">
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
                      <IconButton
                        onClick={(event) => {
                          event.stopPropagation()
                          onSetCohortFavorite(row.researchId)
                        }}
                      >
                        <FavStar favorite={row.favorite} />
                      </IconButton>
                    </TableCell>

                    {!simplified && (
                      <TableCell align="center">
                        <IconButton
                          onClick={(event) => {
                            event.stopPropagation()
                            handleClickOpenDialog()
                            setSelectedCohort(row.researchId)
                          }}
                        >
                          <DeleteOutlineIcon />
                        </IconButton>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )
      }
    </>
  )
}

export default ResearchTable
