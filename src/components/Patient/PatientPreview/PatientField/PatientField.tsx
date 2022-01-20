import React from 'react'

import { Grid, Typography } from '@material-ui/core'
import Skeleton from '@material-ui/lab/Skeleton'

import useStyles from './styles'
import classNames from 'classnames'

type PatientFieldProps = {
  fieldName: string
  fieldValue?: string | number | string[]
}
const PatientField: React.FC<PatientFieldProps> = ({ fieldName, fieldValue }) => {
  const classes = useStyles()

  return (
    <Grid container>
      <Grid
        item
        container
        xs={3}
        lg={2}
        alignItems="center"
        className={classNames(classes.gridItem, classes.fieldName)}
      >
        <Typography variant="h6">{fieldName}</Typography>
      </Grid>
      <Grid item container xs={9} lg={10} alignItems="center" className={classes.gridItem}>
        {typeof fieldValue === 'string' || typeof fieldValue === 'number' ? (
          fieldValue === 'loading' ? (
            <Skeleton height={20} width={200} />
          ) : (
            <Typography>{fieldValue}</Typography>
          )
        ) : (
          fieldValue?.map((value: string) => <Typography key={value}>{value}</Typography>)
        )}
      </Grid>
    </Grid>
  )
}

export default PatientField
