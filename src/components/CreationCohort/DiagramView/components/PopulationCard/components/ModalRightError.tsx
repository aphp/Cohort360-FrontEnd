import React from 'react'
import { useNavigate } from 'react-router-dom'

import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogTitle from '@mui/material/DialogTitle'

import { useAppSelector } from 'state'

type ModalRightErrorProps = {
  open: boolean
  handleClose: () => void
}
const ModalRightError: React.FC<ModalRightErrorProps> = ({ open, handleClose }) => {
  const maintenanceIsActive = useAppSelector((state) => state.me?.maintenance?.active ?? false)

  const navigate = useNavigate()

  const _handleReturnHome = () => {
    if (window.history.length > 1) {
      navigate(-1)
    } else {
      navigate('/home')
    }
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
