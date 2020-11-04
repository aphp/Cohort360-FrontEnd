import React from 'react'
import { useHistory } from 'react-router-dom'

import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableContainer from '@material-ui/core/TableContainer'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'
import Paper from '@material-ui/core/Paper'
import Button from '@material-ui/core/Button'
import IconButton from '@material-ui/core/IconButton'

import PropTypes from 'prop-types'
import DeleteOutlineIcon from '@material-ui/icons/DeleteOutline'

import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogTitle from '@material-ui/core/DialogTitle'

import { ReactComponent as Star } from '../../../assets/icones/star.svg'
import { ReactComponent as StarFull } from '../../../assets/icones/star full.svg'

import { onRemoveCohort } from '../../../services/savedResearches'

import useStyles from './style'
import { Typography } from '@material-ui/core'

const FavStar = (props) => {
  const favorite = props.favorite
  if (favorite) {
    return <StarFull height="15px" fill="#ED6D91" />
  }
  return <Star height="15px" fill="#ED6D91" />
}

const ResearchTable = (props) => {
  const classes = useStyles()
  const [dialogOpen, setOpenDialog] = React.useState(false)
  const [selectedCohort, setSelectedCohort] = React.useState()

  const history = useHistory()

  const removeCohort = () => {
    onRemoveCohort(selectedCohort)
    props.onDeleteCohort(selectedCohort)
  }

  const handleSetFavorite = (researchId, favoriteStatus) => {
    props.onSetCohortFavorite(researchId, favoriteStatus)
  }

  const handleClickOpenDialog = () => {
    setOpenDialog(true)
  }

  const handleCloseDialog = () => {
    setOpenDialog(false)
  }

  return (
    <>
      {!props.simplified && (
        <Dialog
          open={dialogOpen}
          onClose={handleCloseDialog}
          aria-labelledby="alert-dialog-slide-title"
          aria-describedby="alert-dialog-slide-description"
        >
          <DialogTitle id="alert-dialog-slide-title">
            Etes-vous sûr de vouloir supprimer la cohorte ?
          </DialogTitle>
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
      {props.researchData.length === 0 ? (
        <Typography align="center" variant="h5">
          Aucune cohorte à afficher
        </Typography>
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

                {!props.simplified && (
                  <TableCell align="center" className={classes.tableHeadCell}>
                    Supprimer
                  </TableCell>
                )}
              </TableRow>
            </TableHead>
            <TableBody>
              {props.researchData.map(
                (row) =>
                  row && (
                    <TableRow
                      className={classes.pointerHover}
                      hover
                      key={row.researchId}
                      onClick={
                        props.onClickRow
                          ? () => props.onClickRow(row)
                          : () => history.push(`/cohort/${row.fhir_groups_ids}`)
                      }
                    >
                      <TableCell>{row.titre}</TableCell>
                      <TableCell className={classes.status} align="center">
                        {row.statut}
                      </TableCell>
                      <TableCell align="center">{row.perimetre}</TableCell>
                      <TableCell align="center">{row.nPatients}</TableCell>
                      <TableCell align="center">
                        {new Date(row.date).toLocaleDateString('fr-FR')}{' '}
                        {new Date(row.date).toLocaleTimeString('fr-FR', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </TableCell>
                      <TableCell align="center">
                        <IconButton
                          onClick={(event) => {
                            event.stopPropagation()
                            handleSetFavorite(row.researchId, row.favorite)
                          }}
                        >
                          <FavStar favorite={row.favorite} />
                        </IconButton>
                      </TableCell>

                      {!props.simplified && (
                        <TableCell align="center">
                          <IconButton
                            onClick={(event) => {
                              event.stopPropagation()
                              handleClickOpenDialog(row.researchId)
                              setSelectedCohort(row.researchId)
                            }}
                          >
                            <DeleteOutlineIcon />
                          </IconButton>
                        </TableCell>
                      )}
                    </TableRow>
                  )
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </>
  )
}

ResearchTable.propTypes = {
  simplified: PropTypes.bool,
  onClickRow: PropTypes.func,
  researchData: PropTypes.array.isRequired,
  researchLines: PropTypes.number.isRequired,
  onSetCohortFavorite: PropTypes.func,
  onDeleteCohort: PropTypes.func
}

export default ResearchTable
