import WarningIcon from '@mui/icons-material/Warning'
import { Alert } from '@mui/material'
import React from 'react'

import useStyles from '../../styles'
import { useUserAccesses } from '../environment/useUserAccesses'

const ExportDeniedAlert = () => {
  const { classes } = useStyles()
  const { loading, hasError, canExportCsvXlsx } = useUserAccesses()

  if (loading || hasError || canExportCsvXlsx) return null

  return (
    <Alert icon={<WarningIcon fontSize="inherit" />} severity="error" className={classes.deniedAlert}>
      Votre habilitation ne vous permet pas d’accéder à cette fonctionnalité
    </Alert>
  )
}

export default ExportDeniedAlert
