import React from 'react'

import Button from '@material-ui/core/Button'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogContentText from '@material-ui/core/DialogContentText'
import DialogTitle from '@material-ui/core/DialogTitle'

type ModalRightErrorProps = {
  open: boolean
  handleClose: () => void
}
const ModalRightError: React.FC<ModalRightErrorProps> = ({ open, handleClose }) => {
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
          Vous tentez d'accéder a une requête dont la population source ne fait plus partie de votre périmètre, veuillez
          choisir de nouveau votre population source
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Choisir population source</Button>
      </DialogActions>
    </Dialog>
  )
}

export default ModalRightError
