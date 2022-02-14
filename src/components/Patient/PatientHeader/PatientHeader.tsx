import React from 'react'

import { CohortPatient, IPatientDetails } from 'types'

import Grid from '@material-ui/core/Grid'

import PatientTitle from './PatientTitle/PatientTitle'
// import PatientDiagnosis from './PatientDiagnosis/PatientDiagnosis'
import PatientInfo from './PatientInfo/PatientInfo'

import { getAge } from 'utils/age'

import useStyles from './styles'

type PatientHeaderProps = {
  patient?: IPatientDetails
  deidentifiedBoolean: boolean
}

const PatientHeader: React.FC<PatientHeaderProps> = ({
  patient = { resourceType: 'Patient' },
  deidentifiedBoolean
}) => {
  const classes = useStyles()

  const age = getAge(patient as CohortPatient)
  const firstName = deidentifiedBoolean ? 'Prénom' : patient.name?.[0].given?.[0]
  const lastName = deidentifiedBoolean ? 'Nom' : patient.name?.map((e) => e.family).join(' ')

  const ipp = deidentifiedBoolean
    ? `IPP chiffré: ${patient.id ?? '-'}`
    : `IPP: ${
        patient.identifier?.find((item: any) => item.type?.coding?.[0].code === 'IPP')?.value ??
        patient.identifier?.[0].value
      }`

  return (
    <Grid container direction="row" justifyContent="center" alignItems="center" className={classes.root}>
      <Grid container item xs={11} justifyContent="center" alignItems="center">
        <Grid container item xs={9}>
          <PatientTitle firstName={firstName} lastName={lastName} />
        </Grid>
        <Grid container item justifyContent="flex-end" xs={3}>
          <PatientInfo age={age} ipp={ipp} gender={patient.gender} />
        </Grid>
      </Grid>
    </Grid>
  )
}

export default PatientHeader
