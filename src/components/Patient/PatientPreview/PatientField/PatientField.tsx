import React from 'react'

import { Grid, Typography } from '@material-ui/core'

import useStyles from './styles'
import classNames from 'classnames'

type PatientFieldProps = {
  fieldName: string
  fieldValue?: string | number
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
        <Typography>{fieldValue ?? 'unknown'}</Typography>
      </Grid>
    </Grid>
  )
}

export default PatientField
