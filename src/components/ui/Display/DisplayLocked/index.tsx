import React from 'react'

import { Grid, Typography } from '@mui/material'
import { LockIconWrapper } from './styles'

type DisplayLockedProps = {
  label?: string
}

const DisplayLocked = ({ label = 'Fonctionnalité désactivée en mode pseudonymisé.' }: DisplayLockedProps) => {
  return (
    <Grid container justifyContent={'center'}>
      <LockIconWrapper />
      <Typography variant="h6" align="center">
        {label}
      </Typography>
    </Grid>
  )
}

export default DisplayLocked
