import React from 'react'

import { CohortPatient, IPatientDetails } from 'types'

import Grid from '@mui/material/Grid'

import PatientTitle from './PatientTitle/PatientTitle'
import PatientInfo from './PatientInfo/PatientInfo'

import { getAge } from 'utils/age'

import useStyles from './styles'
import { GenderStatus } from 'types/searchCriterias'

type PatientHeaderProps = {
  patient?: IPatientDetails
  deidentifiedBoolean: boolean
}

const PatientHeader: React.FC<PatientHeaderProps> = ({
  patient = { resourceType: 'Patient' },
  deidentifiedBoolean
}) => {
  const { classes } = useStyles()

  const age = getAge(patient as CohortPatient)
  const firstName = deidentifiedBoolean ? 'Prénom' : patient.name?.[0].given?.[0]
  const lastName = deidentifiedBoolean
    ? 'Nom'
    : patient.name
        ?.map((e) => {
          if (e.use === 'official') {
            return e.family ?? 'Non renseigné'
          }
          if (e.use === 'maiden') {
            return `(${patient.gender === 'female' ? 'née' : 'né'} : ${e.family})` ?? 'Non renseigné'
          }
        })
        .join(' ') ?? 'Non renseigné'

  const ipp = deidentifiedBoolean
    ? `IPP chiffré: ${patient.id ?? '-'}`
    : `IPP: ${
        patient.identifier?.find((item) => item.type?.coding?.[0].code === 'IPP')?.value ??
        patient.identifier?.[0].value
      }`

  return (
    <Grid container justifyContent="center" alignItems="center" className={classes.root}>
      <Grid container item xs={11} justifyContent="center" alignItems="center">
        <Grid container item xs={9}>
          <PatientTitle firstName={firstName} lastName={lastName} />
        </Grid>
        <Grid container item justifyContent="flex-end" xs={3}>
          <PatientInfo age={age} ipp={ipp} gender={patient.gender as GenderStatus} />
        </Grid>
      </Grid>
    </Grid>
  )
}

export default PatientHeader
