import React from 'react'

import { Grid, Paper } from '@mui/material'

import PatientField from './PatientField/PatientField'

import { getAge } from 'utils/age'
import { CohortPatient, IPatientDetails } from 'types'

import useStyles from './styles'

type PatientPreviewProps = {
  patient?: IPatientDetails
  deidentifiedBoolean: boolean
}
const PatientPreview: React.FC<PatientPreviewProps> = ({ patient, deidentifiedBoolean }) => {
  const { classes } = useStyles()

  if (!patient) return <></>

  const lastEncounterStart = patient.lastEncounter?.period?.start
  const lastEncounterEnd = patient.lastEncounter?.period?.end

  const birthDate = patient.birthDate ? new Date(patient.birthDate).toLocaleDateString('fr-FR') : ''

  const age = getAge({
    ...patient,
    lastGhm: patient.lastGhm !== 'loading' ? patient.lastGhm : undefined,
    lastProcedure: patient.lastProcedure !== 'loading' ? patient.lastProcedure : undefined,
    mainDiagnosis: patient.mainDiagnosis !== 'loading' ? patient.mainDiagnosis : undefined
  } as CohortPatient)

  const mainDiagnosis = patient.mainDiagnosis
    ? patient.mainDiagnosis === 'loading'
      ? 'loading'
      : patient.mainDiagnosis
          .slice(0, 3)
          .map((diag: any) => diag.code?.coding?.[0].display)
          .join(', ')
    : 'Pas de diagnostic principal'

  const lastEncounter =
    patient.lastEncounter && lastEncounterStart
      ? `${patient.lastEncounter?.serviceProvider?.display ?? 'Lieu inconnu'} : le ${new Date(
          lastEncounterStart
        ).toLocaleDateString('fr-FR')}`
      : '-'
  const lastEncounterDuration =
    patient.lastEncounter && lastEncounterStart && lastEncounterEnd
      ? `${Math.floor(
          (new Date(lastEncounterEnd).getTime() - new Date(lastEncounterStart).getTime()) / (1000 * 60 * 60 * 24)
        )} jours`
      : '-'

  const lastProcedure = patient.lastProcedure
    ? patient.lastProcedure === 'loading'
      ? 'loading'
      : patient.lastProcedure?.code?.coding?.[0].code && patient.lastProcedure?.code?.coding?.[0].display
    : '-'
  const lastGhm = patient.lastGhm
    ? patient.lastGhm === 'loading'
      ? 'loading'
      : patient.lastGhm?.diagnosis?.[0].packageCode?.coding?.[0].display
    : '-'

  return (
    <Grid container direction="column" alignItems="center">
      <Grid component={Paper} container item sm={11} className={classes.patientTable}>
        <Grid container>
          <PatientField
            fieldName={deidentifiedBoolean ? 'Âge' : 'Date de naissance'}
            fieldValue={deidentifiedBoolean ? age : `${birthDate} (${age})`}
          />
          <PatientField fieldName="Trois derniers diagnostics principaux" fieldValue={mainDiagnosis} />
          <PatientField fieldName="Dernière prise en charge" fieldValue={lastEncounter} />
          <PatientField fieldName="Durée de prise en charge" fieldValue={lastEncounterDuration} />
          <PatientField fieldName="Dernier acte" fieldValue={lastProcedure} />
          <PatientField fieldName="Dernier GHM" fieldValue={lastGhm} />
        </Grid>
      </Grid>
    </Grid>
  )
}

export default PatientPreview
