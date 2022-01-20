import React from 'react'
import { useDispatch } from 'react-redux'

import Button from '@material-ui/core/Button'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogContentText from '@material-ui/core/DialogContentText'
import DialogTitle from '@material-ui/core/DialogTitle'
import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'

import { RequestType } from 'types'

import { deleteRequests } from 'state/request'

import useStyles from './styles'

interface IModalMoveRequestProps {
  open: boolean
  onClose: (onConfirm?: boolean) => void
  selectedRequests: RequestType[]
}

const ModalMoveRequest: React.FunctionComponent<IModalMoveRequestProps> = ({ open, onClose, selectedRequests }) => {
  const classes = useStyles()
  const dispatch = useDispatch()

  const _onConfirm = async () => {
    await dispatch(deleteRequests({ deletedRequests: selectedRequests }))

    onClose(true)
  }

  return (
    <Dialog
      open={open}
      onClose={() => onClose()}
      aria-labelledby="move-request-title"
      aria-describedby="move-request-description"
      fullWidth
      maxWidth="sm"
    >
      <DialogTitle id="move-request-title" className={classes.title}>
        {selectedRequests.length === 1 ? 'Supprimer une requête' : 'Supprimer des requêtes'}
      </DialogTitle>
      <DialogContent>
        <DialogContentText id="move-request-description">
          <Grid container direction="column" className={classes.inputContainer}>
            <Typography variant="h3">
              Êtes-vous sur de vouloir supprimer ce{selectedRequests.length === 1 ? 'tte' : 's'} requête
              {selectedRequests.length === 1 ? '' : 's'} ? L'ensemble des cohortes liés à{' '}
              {selectedRequests.length === 1 ? 'cette' : 'ces'} requête{selectedRequests.length === 1 ? '' : 's'} vont{' '}
              également être supprimé
            </Typography>
          </Grid>
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => onClose()}>Annuler</Button>
        <Button className={classes.deleteButton} onClick={_onConfirm}>
          Supprimer
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default ModalMoveRequest
