import React from 'react'

import Grid from '@material-ui/core/Grid'

import PatientTitle from './PatientTitle/PatientTitle'
import PatientDiagnosis from './PatientDiagnosis/PatientDiagnosis'
import PatientInfo from './PatientInfo/PatientInfo'

import { getAge } from '../../../utils/age'
import { CohortPatient } from 'types'

import useStyles from './styles'

type PatientHeaderProps = {
  patient: CohortPatient
  deidentified: boolean
}

const PatientHeader: React.FC<PatientHeaderProps> = ({ patient, deidentified }) => {
  const classes = useStyles()
  const age = getAge(patient)
  const firstName = deidentified ? 'Prénom' : patient.name?.[0].given?.[0]
  const lastName = deidentified ? 'Nom' : patient.name?.map((e) => e.family).join(' ')
  // TODO aphp: review diagnosis function and type in diagnosis
  const diagnosis = patient.mainDiagnosis
    ? patient.mainDiagnosis.slice(0, 3).map((diag) => diag.code?.coding?.[0].display)
    : undefined
  const ipp = deidentified
    ? `ID Technique: ${patient.id}`
    : `IPP: ${
        patient.identifier?.find((item) => item.type?.coding?.[0].code === 'IPP')?.value ??
        patient.identifier?.[0].value
      }`

  return (
    <Grid container direction="row" justify="center" alignItems="center" className={classes.root}>
      <Grid container item xs={11} justify="center" alignItems="center">
        <Grid container item xs={9}>
          <PatientTitle firstName={firstName} lastName={lastName} />
          {diagnosis && <PatientDiagnosis diagnosis={diagnosis} />}
        </Grid>
        <Grid container item justify="flex-end" xs={3}>
          <PatientInfo age={age} ipp={ipp} gender={patient.gender} />
        </Grid>
      </Grid>
    </Grid>
  )
}

export default PatientHeader
