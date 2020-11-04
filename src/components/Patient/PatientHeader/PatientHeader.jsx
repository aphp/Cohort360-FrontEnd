import React from 'react'
import useStyles from './styles'
import Grid from '@material-ui/core/Grid'
import PatientTitle from './PatientTitle/PatientTitle'
import PatientDiagnosis from './PatientDiagnosis/PatientDiagnosis'
import PatientInfo from './PatientInfo/PatientInfo'
import PropTypes from 'prop-types'
import { getAgeAphp } from '../../../utils/age.js'

const PatientHeader = ({ patient, deidentified }) => {
  const classes = useStyles()
  const age = getAgeAphp(
    patient.extension.find((item) => item.url.includes('Age'))
  )
  const firstName = deidentified ? 'Prénom' : patient.name[0].given[0]
  const lastName = deidentified
    ? 'Nom'
    : patient.name.map((e) => e.family).join(' ')
  const diagnosis = patient.mainDiagnosis
    ? patient.mainDiagnosis
        .slice(0, 3)
        .map((diag) => diag.code.coding[0].display)
    : null
  const ipp = deidentified
    ? ''
    : patient.identifier.find((item) => item.type.coding[0].code === 'IPP')
        .value

  return (
    <Grid
      container
      direction="row"
      justify="center"
      alignItems="center"
      className={classes.root}
    >
      <Grid container item xs={11} justify="center" alignItems="center">
        <Grid container item xs={9}>
          <PatientTitle firstName={firstName} lastName={lastName} />
          {diagnosis && <PatientDiagnosis diagnosis={diagnosis} />}
        </Grid>
        <Grid container item justify="flex-end" xs={3}>
          <PatientInfo
            age={age}
            ipp={ipp}
            gender={patient.gender}
            deidentified={deidentified}
          />
        </Grid>
      </Grid>
    </Grid>
  )
}

PatientHeader.propTypes = {
  patient: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.array,
    gender: PropTypes.string.isRequired,
    extension: PropTypes.array,
    mainDiagnosis: PropTypes.array,
    identifier: PropTypes.array
  }).isRequired,
  deidentified: PropTypes.bool
}

export default PatientHeader
