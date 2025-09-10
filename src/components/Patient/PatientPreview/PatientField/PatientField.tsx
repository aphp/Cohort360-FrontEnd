import React from 'react'

import { Grid, Skeleton, Typography } from '@mui/material'

import useStyles from './styles'

type PatientFieldProps = {
  fieldName: string
  fieldValue?: string | number | string[]
}
const PatientField: React.FC<PatientFieldProps> = ({ fieldName, fieldValue }) => {
  const { classes, cx } = useStyles()

  return (
    <Grid container size={12}>
      <Grid
        container
        size={{ xs: 3, lg: 2 }}
        sx={{ alignItems: 'center' }}
        className={cx(classes.gridItem, classes.fieldName)}
      >
        <Typography variant="h6">{fieldName}</Typography>
      </Grid>
      <Grid container size={{ xs: 9, lg: 10 }} sx={{ alignItems: 'center' }} className={classes.gridItem}>
        {typeof fieldValue === 'string' || typeof fieldValue === 'number' ? (
          fieldValue === 'loading' ? (
            <Skeleton height={20} width={200} />
          ) : (
            <Typography>{fieldValue}</Typography>
          )
        ) : (
          fieldValue?.map((value: string, index: number) => <Typography key={index}>{value}</Typography>)
        )}
      </Grid>
    </Grid>
  )
}

export default PatientField
