import React from 'react'
import { Dialog, DialogContent, DialogActions, Button, Typography } from '@mui/material'
import WarningIcon from '@mui/icons-material/Warning'

import useStyles from './styles'

type ConfirmationDialogProps = {
  open: boolean
  onCancel: () => void
  onClose: () => void
  onConfirm: () => void
  message: string
}

const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({ open, onCancel, onClose, onConfirm, message }) => {
  const { classes } = useStyles()

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogContent className={classes.dialogContent}>
        <WarningIcon className={classes.warningIcon} />
        <Typography>{message}</Typography>
      </DialogContent>
      <DialogActions>
        <Button sx={{ color: '#ED6D91' }} onClick={onCancel}>
          Annuler
        </Button>
        <Button onClick={onConfirm}>Confirmer</Button>
      </DialogActions>
    </Dialog>
  )
}

export default ConfirmationDialog
