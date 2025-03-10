import React from 'react'

import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from '@mui/material'

const ConfirmDeletion: React.FC<{
  open: boolean
  onSubmit: () => void
  onClose: () => void
  title: string
  message: string
}> = ({ open, onSubmit, onClose, title, message }) => {
  return (
    <Dialog fullWidth open={open} onClose={onClose}>
      <DialogTitle>{title}</DialogTitle>

      <DialogContent style={{ paddingBottom: 4 }}>
        <Typography>{message}</Typography>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Annuler</Button>
        <Button onClick={onSubmit} style={{ color: '#dc3545' }}>
          Supprimer
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default ConfirmDeletion
