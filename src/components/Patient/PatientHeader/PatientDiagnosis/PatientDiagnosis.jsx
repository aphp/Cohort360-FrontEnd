import React from 'react'
import Chip from '@material-ui/core/Chip'
import useStyles from './styles'
import PropTypes from 'prop-types'

const PatientDiagnosis = ({ diagnosis }) => {
  const classes = useStyles()

  return (
    <ul className={classes.root}>
      {diagnosis.map((diag) => {
        return (
          <li key={diag} className={classes.item}>
            <Chip className={classes.diagnosticChip} label={diag} />
          </li>
        )
      })}
    </ul>
  )
}

PatientDiagnosis.propTypes = {
  diagnosis: PropTypes.array
}

export default PatientDiagnosis
