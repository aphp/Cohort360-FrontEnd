import React from 'react'
import { useAppDispatch, useAppSelector } from 'state'
import { hideDialog } from 'state/warningDialog'
import { Button, Dialog, DialogActions, DialogContent, Grid, Typography } from '@mui/material'
import WarningIcon from '@mui/icons-material/Warning'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import CancelIcon from '@mui/icons-material/Cancel'

import useStyles from './styles'

const WarningDialog = () => {
  const dispatch = useAppDispatch()
  const { classes } = useStyles()
  const { isOpen, message, onConfirm, status } = useAppSelector((state) => state.warningDialog)

  const handleClose = () => {
    dispatch(hideDialog())
  }

  return (
    <Dialog open={isOpen} onClose={handleClose}>
      <DialogContent style={{ paddingBottom: 0 }}>
        <Grid container alignItems={'center'}>
          <Grid item xs={2}>
            {status === 'success' && <CheckCircleOutlineIcon style={{ fontSize: 52 }} htmlColor="#BDEA88" />}
            {status === 'error' && <CancelIcon style={{ fontSize: 52 }} htmlColor="#FC5656" />}
            {status === 'warning' && <WarningIcon className={classes.warningIcon} />}
          </Grid>
          <Grid item xs={10}>
            <Typography>{message}</Typography>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={() => {
            if (onConfirm) {
              ;(onConfirm as () => void)()
            }
            handleClose()
          }}
        >
          OK
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default WarningDialog
