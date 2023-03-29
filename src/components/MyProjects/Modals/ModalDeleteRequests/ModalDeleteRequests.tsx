import React from 'react'

import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogTitle from '@mui/material/DialogTitle'
import Typography from '@mui/material/Typography'

import { RequestType } from 'types'

import { useAppDispatch } from 'state'
import { deleteRequests } from 'state/request'

import useStyles from './styles'

interface IModalMoveRequestProps {
  open: boolean
  onClose: (onConfirm?: boolean) => void
  selectedRequests: RequestType[]
}

const ModalMoveRequest: React.FunctionComponent<IModalMoveRequestProps> = ({ open, onClose, selectedRequests }) => {
  const classes = useStyles()
  const dispatch = useAppDispatch()

  const _onConfirm = async () => {
    await dispatch<any>(deleteRequests({ deletedRequests: selectedRequests }))

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
      <DialogTitle id="move-request-title">
        {selectedRequests.length === 1 ? 'Supprimer une requête' : 'Supprimer des requêtes'}
      </DialogTitle>
      <DialogContent>
        <DialogContentText id="move-request-description">
          <Typography variant="h3">
            Êtes-vous sûr(e) de vouloir supprimer ce{selectedRequests.length === 1 ? 'tte' : 's'} requête
            {selectedRequests.length === 1 ? '' : 's'} ? L'ensemble des cohortes lié à{' '}
            {selectedRequests.length === 1 ? 'cette' : 'ces'} requête{selectedRequests.length === 1 ? '' : 's'} va{' '}
            également être supprimé.
          </Typography>
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
