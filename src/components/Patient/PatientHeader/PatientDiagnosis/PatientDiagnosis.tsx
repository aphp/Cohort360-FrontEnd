import React from 'react'
import Chip from '@material-ui/core/Chip'
import useStyles from './styles'

type PatientDiagnosisType = {
  diagnosis?: (string | undefined)[]
}
const PatientDiagnosis: React.FC<PatientDiagnosisType> = ({ diagnosis }) => {
  const classes = useStyles()

  return (
    <ul className={classes.root}>
      {diagnosis &&
        diagnosis.map((diag) => {
          return (
            <li key={diag} className={classes.item}>
              <Chip className={classes.diagnosticChip} label={diag} />
            </li>
          )
        })}
    </ul>
  )
}

export default PatientDiagnosis
