import React from 'react'
import { Grid, Typography } from '@mui/material'
import { Line } from 'types/table'

type LinesProps = {
  value: Line[]
}

const Lines = ({ value }: LinesProps) => {
  return (
    <>
      {value.map((row, index) => (
        <Grid
          container
          key={index}
          alignItems={'center'}
          style={{
            padding: '4px 16px',
            background: index % 2 === 0 ? '#f6fafe' : 'transparent'
          }}
        >
          <Grid container item xs={6}>
            <Typography variant="h6">{row.name}</Typography>
          </Grid>
          <Grid container item xs={6}>
            <Typography>{row.value}</Typography>
          </Grid>
        </Grid>
      ))}
    </>
  )
}

export default Lines
