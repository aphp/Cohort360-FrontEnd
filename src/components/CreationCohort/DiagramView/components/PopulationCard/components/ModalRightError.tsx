import React from 'react'
import { useNavigate } from 'react-router-dom'

import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogTitle from '@mui/material/DialogTitle'

import { useAppSelector } from 'state'
import { MeState } from 'state/me'

type ModalRightErrorProps = {
  open: boolean
  handleClose: () => void
}
const ModalRightError: React.FC<ModalRightErrorProps> = ({ open, handleClose }) => {
  const { meState } = useAppSelector<{ meState: MeState }>((state) => ({ meState: state.me }))
  const maintenanceIsActive = meState?.maintenance?.active

  const navigate = useNavigate()

  const _handleReturnHome = () => {
    navigate(`/home`)
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
