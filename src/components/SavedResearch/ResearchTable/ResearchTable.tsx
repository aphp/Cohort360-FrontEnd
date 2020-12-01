import React, { useState } from 'react'
import { useHistory } from 'react-router-dom'

import {
  Button,
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
  TableRow,
  Typography
} from '@material-ui/core'

import DeleteOutlineIcon from '@material-ui/icons/DeleteOutline'

import { ReactComponent as Star } from '../../../assets/icones/star.svg'
import { ReactComponent as StarFull } from '../../../assets/icones/star full.svg'

import { onRemoveCohort } from '../../../services/savedResearches'
import { FormattedCohort } from 'types'

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
  onSetCohortFavorite: Function
  onDeleteCohort: Function
}
const ResearchTable: React.FC<ResearchTableProps> = ({
  simplified,
  onClickRow,
  researchData,
  onSetCohortFavorite,
  onDeleteCohort
}) => {
  const classes = useStyles()
  const [dialogOpen, setOpenDialog] = useState(false)
  const [selectedCohort, setSelectedCohort] = useState<string | undefined>()

  const history = useHistory()

  const removeCohort = () => {
    onRemoveCohort(selectedCohort)
    onDeleteCohort(selectedCohort)
  }

  const handleSetFavorite = (researchId: string, favoriteStatus: boolean) => {
    onSetCohortFavorite(researchId, favoriteStatus)
  }

  const handleClickOpenDialog = () => {
    setOpenDialog(true)
  }

  const handleCloseDialog = () => {
    setOpenDialog(false)
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
                  <TableCell className={classes.tableHeadCell}>Titre</TableCell>
                  <TableCell className={classes.tableHeadCell} align="center">
                    Statut
                  </TableCell>
                  <TableCell className={classes.tableHeadCell} align="center">
                    Périmètre
                  </TableCell>
                  <TableCell align="center" className={classes.tableHeadCell}>
                    Nombre de patients
                  </TableCell>
                  <TableCell align="center" className={classes.tableHeadCell}>
                    Date de création
                  </TableCell>
                  <TableCell align="center" className={classes.tableHeadCell}>
                    Favoris
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
                    className={classes.pointerHover}
                    hover
                    key={row.researchId}
                    onClick={onClickRow ? () => onClickRow(row) : () => history.push(`/cohort/${row.fhir_groups_ids}`)}
                  >
                    <TableCell>{row.name}</TableCell>
                    <TableCell className={classes.status} align="center">
                      {row.status}
                    </TableCell>
                    <TableCell align="center">{row.perimeter}</TableCell>
                    <TableCell align="center">{row.nPatients}</TableCell>
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
                          // @ts-ignore
                          handleSetFavorite(row.researchId, row.favorite)
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
