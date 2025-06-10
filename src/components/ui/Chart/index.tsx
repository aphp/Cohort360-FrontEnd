import React, { PropsWithChildren } from 'react'

import { CircularProgress, Grid, Paper, Typography } from '@mui/material'

type ChartProps = {
  isLoading: boolean
  title?: string
}
const Chart = ({ children, title, isLoading }: PropsWithChildren<ChartProps>) => {
  return (
    // <Paper>
    <Grid
      container
      padding="8px"
      direction="column"
      height="300px"
      style={{ borderRadius: 12, border: '2px solid #90B6DE' }}
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
    // </Paper>
  )
}

export default Chart
