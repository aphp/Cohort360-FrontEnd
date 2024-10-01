import React from 'react'

import { Grid, Typography } from '@mui/material'
import { LockIconWrapper } from './styles'

const DisplayLocked = () => {
  return (
    <Grid padding="0px 15px">
      <Grid container>
        <LockIconWrapper />
        <Typography variant="h6" align="center">
          Fonctionnalité désactivée en mode pseudonymisé.
        </Typography>
      </Grid>
    </Grid>
  )
}

export default DisplayLocked
