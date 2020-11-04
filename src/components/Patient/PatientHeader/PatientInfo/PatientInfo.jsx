import React from 'react'
import useStyles from './styles'
import Grid from '@material-ui/core/Grid'
import PropTypes from 'prop-types'
import Typography from '@material-ui/core/Typography'

import { ReactComponent as FemaleIcon } from '../../../../assets/icones/venus.svg'
import { ReactComponent as MaleIcon } from '../../../../assets/icones/mars.svg'
import { ReactComponent as UnknownIcon } from '../../../../assets/icones/autre-inconnu.svg'

const GenderIcon = ({ gender }) => {
  const classes = useStyles()

  switch (gender) {
    case 'female':
      return <FemaleIcon className={classes.genderIcon} />
    case 'male':
      return <MaleIcon className={classes.genderIcon} />
    default:
      return <UnknownIcon className={classes.genderIcon} />
  }
}

GenderIcon.propTypes = {
  gender: PropTypes.string.isRequired
}

const PatientInfo = (props) => {
  const classes = useStyles()

  return (
    <Grid direction="column" className={classes.root} container={true}>
      <Grid
        container
        item
        justify="center"
        alignItems="center"
        className={classes.whiteCircle}
      >
        <GenderIcon gender={props.gender} />
      </Grid>
      <Typography variant="body1">{props.age}</Typography>
      {!props.deidentified && (
        <Typography variant="body1">IPP : {props.ipp}</Typography>
      )}
    </Grid>
  )
}

PatientInfo.propTypes = {
  age: PropTypes.string.isRequired,
  gender: PropTypes.string.isRequired,
  ipp: PropTypes.string.isRequired,
  deidentified: PropTypes.bool
}

export default PatientInfo
