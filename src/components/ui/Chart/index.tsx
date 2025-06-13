import React, { PropsWithChildren } from 'react'

import { CircularProgress, Grid, Typography } from '@mui/material'

type ChartProps = {
  isLoading: boolean
  title?: string
}
const Chart = ({ children, title, isLoading }: PropsWithChildren<ChartProps>) => {
  return (
    <Grid
      container
      padding="8px"
      direction="column"
      height="300px"
      style={{ borderRadius: 12, border: '1px solid #D1E2F4' }}
    >
      {title && (
        <Grid container item borderBottom="2px inset #E6F1FD" paddingBottom="10px">
          <Typography variant="h3" color="primary">
            {title}
          </Typography>
        </Grid>
      )}
      <Grid container item justifyContent="center" alignItems="center" style={{ flexGrow: 1 }}>
        {isLoading && <CircularProgress />}
        {!isLoading && <>{children}</>}
      </Grid>
    </Grid>
  )
}

export default Chart
