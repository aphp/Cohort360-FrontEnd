import React from 'react'

import { CircularProgress, Grid } from '@mui/material'

type CenteredCircularProgressProps = {
  size?: number
}

//TODO: replace everywhere with this component

const CenteredCircularProgress: React.FC<CenteredCircularProgressProps> = ({ size = 50 }) => {
  return (
    <Grid container justifyContent="center" size={12}>
      <CircularProgress size={size} />
    </Grid>
  )
}

export default CenteredCircularProgress
