import React from 'react'
import { useHistory } from 'react-router-dom'

import Button from '@material-ui/core/Button'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogContentText from '@material-ui/core/DialogContentText'
import DialogTitle from '@material-ui/core/DialogTitle'

import { useAppSelector } from 'state'
import { MeState } from 'state/me'

type ModalRightErrorProps = {
  open: boolean
  handleClose: () => void
}
const ModalRightError: React.FC<ModalRightErrorProps> = ({ open, handleClose }) => {
  const { meState } = useAppSelector<{ meState: MeState }>((state) => ({ meState: state.me }))
  const maintenanceIsActive = meState?.maintenance?.active

  const history = useHistory()

  const _handleReturnHome = () => {
    history.push(`/home`)
  }

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle id="alert-dialog-title">{'Un problème est survenu'}</DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-description">
          Vous tentez d'accéder à une requête dont la population source ne fait pas partie de votre périmètre d'accès.
          Veuillez choisir une nouvelle population source.
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button color="secondary" onClick={_handleReturnHome}>
          Annuler
        </Button>
        <Button onClick={handleClose} disabled={maintenanceIsActive}>
          Choisir population source
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default ModalRightError
