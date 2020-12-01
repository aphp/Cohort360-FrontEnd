import React from 'react'
import { CONTEXT } from '../../../constants'

import { Grid, Paper } from '@material-ui/core'
import { Alert } from '@material-ui/lab'

import PatientField from './PatientField/PatientField'

import { getAge } from '../../../utils/age'
import { CohortPatient } from 'types'

import useStyles from './styles'

type PatientPreviewProps = {
  patient?: CohortPatient
  deidentified: boolean
}
const PatientPreview: React.FC<PatientPreviewProps> = ({ patient, deidentified }) => {
  const classes = useStyles()

  if (!patient) {
    return (
      <Alert severity="error" className={classes.alert}>
        Les données ne sont pas encore disponibles, veuillez réessayer ultérieurement.
      </Alert>
    )
  }

  const lastEncounterStart = patient.lastEncounter?.period?.start
  const lastEncounterEnd = patient.lastEncounter?.period?.end

  const birthDate = patient.birthDate ? new Date(patient.birthDate).toLocaleDateString('fr-FR') : ''

  const age = getAge(patient)

  const mainDiagnosis = patient.mainDiagnosis
    ? patient.mainDiagnosis
        .slice(0, 3)
        .map((diag) => diag.code?.coding?.[0].display)
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
    ? patient.lastProcedure?.code?.coding?.[0].code && patient.lastProcedure?.code?.coding?.[0].display
    : '-'
  const lastGhm = patient.lastGhm ? patient.lastGhm?.diagnosis?.[0].packageCode?.coding?.[0].display : '-'

  return (
    <Grid container direction="column" alignItems="center">
      <Grid component={Paper} container item sm={11} className={classes.patientTable}>
        <Grid container>
          <PatientField
            fieldName={deidentified ? 'Âge' : 'Date de naissance'}
            fieldValue={deidentified ? age : `${birthDate} (${age})`}
          />
          {CONTEXT === 'arkhn' && (
            <>
              <PatientField fieldName="Situation sociale" fieldValue={patient.maritalStatus?.coding?.[0].code} />
              <PatientField fieldName="Adresse" fieldValue={patient.address?.[0].city} />
            </>
          )}
          {mainDiagnosis && <PatientField fieldName="Diagnostics principaux" fieldValue={mainDiagnosis} />}
          <PatientField fieldName="Dernière prise en charge" fieldValue={lastEncounter} />
          <PatientField fieldName="Durée de prise en charge" fieldValue={lastEncounterDuration} />
          <PatientField fieldName="Dernier acte" fieldValue={lastProcedure} />
          <PatientField fieldName="Dernier GHM" fieldValue={lastGhm} />
          {patient.labResults && (
            <PatientField
              fieldName="Derniers résultats de laboratoire"
              fieldValue={`${patient.lastLabResults?.code?.coding?.[0].display} ${
                patient.lastLabResults?.effectiveDateTime
                  ? `le ${new Date(patient.lastLabResults?.effectiveDateTime).toLocaleDateString('fr-FR')}`
                  : ''
              }
              ${
                patient.lastLabResults?.interpretation
                  ? `(${patient.lastLabResults?.interpretation?.[0].coding?.[0].code})`
                  : ''
              }`}
            />
          )}
          {patient.inclusion && (
            <PatientField
              fieldName="Inclusion du patient dans un essai clinique"
              fieldValue={patient.inclusion ? 'Oui' : 'Non'}
            />
          )}
        </Grid>
      </Grid>
    </Grid>
  )
}

export default PatientPreview
