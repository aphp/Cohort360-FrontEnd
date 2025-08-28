import React from 'react'
import { Grid, Paper } from '@mui/material'
import PatientField from './PatientField/PatientField'
import { getAge } from 'utils/age'
import { CohortPatient } from 'types'
import useStyles from './styles'
import { getLastDiagnosisLabels } from 'mappers/pmsi'
import { getConfig } from 'config'
import { Patient } from 'types/exploration'

type PatientPreviewProps = {
  patient: Patient
}
const PatientPreview: React.FC<PatientPreviewProps> = ({ patient }) => {
  const { classes } = useStyles()
  const appConfig = getConfig()
  const { infos, deidentified } = patient

  const lastEncounterStart = infos.lastEncounter?.period?.start
  const lastEncounterEnd = infos.lastEncounter?.period?.end
  const birthDate = infos.birthDate ? new Date(infos.birthDate).toLocaleDateString('fr-FR') : ''
  const age = getAge({
    ...infos,
    lastGhm: infos.lastGhm,
    lastProcedure: infos.lastProcedure,
    mainDiagnosis: infos.mainDiagnosis
  } as CohortPatient)
  const mainDiagnosis = getLastDiagnosisLabels(infos.mainDiagnosis)
  const lastEncounter =
    infos.lastEncounter && lastEncounterStart
      ? `${infos.lastEncounter?.serviceProvider?.display ?? 'Lieu inconnu'} : le ${new Date(
          lastEncounterStart
        ).toLocaleDateString('fr-FR')}`
      : '-'
  const lastEncounterDuration =
    infos.lastEncounter && lastEncounterStart && lastEncounterEnd
      ? `${Math.floor(
          (new Date(lastEncounterEnd).getTime() - new Date(lastEncounterStart).getTime()) / (1000 * 60 * 60 * 24)
        )} jours`
      : '-'
  const lastProcedure =
    infos.lastProcedure?.code?.coding?.find((code) => !appConfig.core.fhir.selectedCodeOnly || code.userSelected)
      ?.display ?? '-'
  const lastGhm = infos.lastGhm?.diagnosis?.[0].packageCode?.coding?.[0].display ?? '-'

  return (
    <Grid container sx={{ flexDirection: 'column', alignItems: 'center' }} mt={2} height={'fit-content'}>
      <Grid component={Paper} container className={classes.patientTable}>
        <Grid container>
          <PatientField
            fieldName={deidentified ? 'Âge' : 'Date de naissance'}
            fieldValue={deidentified ? age : `${birthDate} (${age})`}
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
