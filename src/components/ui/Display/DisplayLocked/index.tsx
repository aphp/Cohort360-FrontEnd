import React from 'react'

import { Grid, Typography } from '@mui/material'
import { LockIconWrapper } from './styles'

type DisplayLockedProps = {
  label?: string
}

const DisplayLocked = ({ label = ' Fonctionnalité désactivée en mode pseudonymisé.' }: DisplayLockedProps) => {
  return (
    <Grid padding="0px 15px">
      <Grid container>
        <LockIconWrapper />
        <Typography variant="h6" align="center">
          {label}
        </Typography>
      </Grid>
    </Grid>
  )
}

export default DisplayLocked
