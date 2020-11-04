import IconButton from '@material-ui/core/IconButton'
import React from 'react'
import { useSelector } from 'react-redux'
import { useHistory } from 'react-router-dom'
import useStyles from './styles'
import PropTypes from 'prop-types'
import Typography from '@material-ui/core/Typography'
import Grid from '@material-ui/core/Grid'

import ArrowBackIcon from '@material-ui/icons/ArrowBack'

const PatientTitle = (props) => {
  const classes = useStyles()
  const history = useHistory()

  const cohort = useSelector((state) => state.exploredCohort)

  const goBacktoCohort = () => {
    const path = Array.isArray(cohort.cohort)
      ? `/perimetres?${cohort.cohort.map((e) => e.id).join()}`
      : cohort.cohort.id
      ? `/cohort/${cohort.cohort.id}`
      : '/mes_patients'

    history.push(path)
  }

  return (
    <Grid container alignItems="center" className={classes.root}>
      <IconButton onClick={() => goBacktoCohort()}>
        <ArrowBackIcon className={classes.iconButtons} />
      </IconButton>
      <Typography variant="h2" color="primary" className={classes.patientName}>
        {props.firstName} {props.lastName}
      </Typography>
    </Grid>
  )
}

PatientTitle.propTypes = {
  firstName: PropTypes.string.isRequired,
  lastName: PropTypes.string.isRequired
}

export default PatientTitle
