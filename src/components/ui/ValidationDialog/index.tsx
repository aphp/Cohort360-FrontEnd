import React, { useContext } from 'react'
import { Dialog, DialogContent, DialogActions, Button, Typography, CircularProgress, Grid } from '@mui/material'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import WarningIcon from '@mui/icons-material/Warning'

import { LoadingStatus } from 'types'
import useStyles from './styles'
import { AppConfig } from 'config'

type ValidationDialogProps = {
  open: boolean
  onClose: () => void
  message: string
  loading: LoadingStatus
  error: boolean
}

const ValidationDialog: React.FC<ValidationDialogProps> = ({ open, onClose, message, loading, error }) => {
  const { classes } = useStyles()
  const appConfig = useContext(AppConfig)

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogContent className={classes.dialogContent}>
        {loading === LoadingStatus.FETCHING && (
          <Grid container direction="column" alignItems="center" style={{ width: 200 }}>
            <CircularProgress />
            <Typography style={{ marginTop: 16 }}>Envoi en cours ...</Typography>
          </Grid>
        )}
        {loading === LoadingStatus.IDDLE && error && (
          <>
            <WarningIcon htmlColor="#FF9800" style={{ fontSize: 52 }} />
            <Typography className={classes.typographyMargin}>
              Erreur lors de votre demande. Veuillez réessayer ultérieurement ou{' '}
              <a href={`mailto:${appConfig.system.mailSupport}`}>contacter le support</a> pour plus d'informations.
            </Typography>
          </>
        )}
        {loading === LoadingStatus.SUCCESS && !error && (
          <>
            <CheckCircleOutlineIcon htmlColor="#BDEA88" style={{ fontSize: 52 }} />
            <Typography className={classes.typographyMargin}>{message}</Typography>
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button disabled={loading === LoadingStatus.FETCHING} onClick={onClose}>
          Fermer
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default ValidationDialog
