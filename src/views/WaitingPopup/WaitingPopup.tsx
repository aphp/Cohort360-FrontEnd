import React from 'react'

import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  Typography
} from '@mui/material'

import useStyles from './styles'

interface WaitingPopupProps {
  open: boolean
  onCancel: () => void
}
const WaitingPopup: React.FC<WaitingPopupProps> = ({ open, onCancel }) => {
  const { classes } = useStyles()

  return (
    <Dialog
      open={open}
      fullWidth={true}
      maxWidth={'sm'}
      aria-describedby="alert-dialog-description"
      classes={{ paper: classes.waitingDialog }}
    >
      <DialogContent>
        <DialogContentText id="alert-dialog-description">
          <Box className={classes.waitingProgress}>
            <Typography variant="h2" color="primary">
              Téléchargement en cours...
            </Typography>
            <CircularProgress />
          </Box>
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel} variant="contained">
          Annuler
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default WaitingPopup
