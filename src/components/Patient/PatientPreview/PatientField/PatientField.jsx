import React from 'react'
import useStyles from './styles'
import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'
import PropTypes from 'prop-types'
import classNames from 'classnames'

const PatientField = (props) => {
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
        <Typography variant="h6">{props.fieldName}</Typography>
      </Grid>
      <Grid
        item
        container
        xs={9}
        lg={10}
        alignItems="center"
        className={classes.gridItem}
      >
        <Typography>{props.fieldValue || 'unknown'}</Typography>
      </Grid>
    </Grid>
  )
}

PatientField.propTypes = {
  fieldName: PropTypes.string.isRequired,
  fieldValue: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
    PropTypes.shape({}),
    PropTypes.array
  ])
}

export default PatientField
