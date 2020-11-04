import React from 'react'
import useStyles from './styles'
import Paper from '@material-ui/core/Paper'
import PatientField from './PatientField/PatientField'
import Grid from '@material-ui/core/Grid'
import PropTypes from 'prop-types'
import { getAgeAphp } from '../../../utils/age.js'

const PatientPreview = ({ patient, deidentified }) => {
  const classes = useStyles()

  if (patient.resource_type === 'OperationOutcome') {
    return <div>Patient not found</div>
  }

  const birthDate = deidentified ? '' : patient.birthDate
  const age = getAgeAphp(
    patient.extension.find((item) => item.url.includes('Age'))
  )

  const mainDiagnosis = patient.mainDiagnosis
    ? patient.mainDiagnosis
        .slice(0, 3)
        .map((diag) => diag.code.coding[0].display)
        .join(', ')
    : 'Pas de diagnostic principal'

  const lastEncounter = patient.lastEncounter
    ? `${patient.lastEncounter.serviceProvider.display} : le ${new Date(
        patient.lastEncounter.period.start
      ).toLocaleDateString('fr-FR')}`
    : '-'
  const lastEncounterDuration = patient.lastEncounter
    ? `${Math.floor(
        (new Date(patient.lastEncounter.period.end) -
          new Date(patient.lastEncounter.period.start)) /
          (1000 * 60 * 60 * 24)
      )} jours`
    : '-'
  const lastProcedure = patient.lastProcedure
    ? patient.lastProcedure.code.coding[0].code &&
      patient.lastProcedure.code.coding[0].display
    : '-'
  const lastGhm = patient.lastGhm
    ? patient.lastGhm.diagnosis[0].packageCode.coding[0].display
    : '-'

  return (
    <Grid container direction="column" alignItems="center">
      <Grid
        component={Paper}
        container
        item
        sm={11}
        className={classes.commentsContainer}
      >
        <Grid container>
          <PatientField
            fieldName={deidentified ? 'Âge' : 'Date de naissance'}
            fieldValue={
              deidentified
                ? age
                : `${new Date(birthDate).toLocaleDateString('fr-FR')} (${age})`
            }
          />
          {mainDiagnosis && (
            <PatientField
              fieldName="Diagnostics principaux"
              fieldValue={mainDiagnosis}
            />
          )}
          <PatientField
            fieldName="Dernière prise en charge"
            fieldValue={lastEncounter}
          />
          <PatientField
            fieldName="Durée de prise en charge"
            fieldValue={lastEncounterDuration}
          />
          <PatientField fieldName="Dernier acte" fieldValue={lastProcedure} />
          <PatientField fieldName="Dernier GHM" fieldValue={lastGhm} />
        </Grid>
      </Grid>
    </Grid>
  )
}

PatientPreview.propTypes = {
  patient: PropTypes.shape({
    resource_type: PropTypes.string,
    birthDate: PropTypes.string,
    maritalStatus: PropTypes.object,
    address: PropTypes.array,
    phone: PropTypes.string,
    extension: PropTypes.array,
    mainDiagnosis: PropTypes.array,
    associatedDiagnosis: PropTypes.array,
    lastEncounter: PropTypes.object,
    lastProcedure: PropTypes.object,
    lastLabResults: PropTypes.object,
    lastGhm: PropTypes.object,
    inclusion: PropTypes.bool,
    comments: PropTypes.string,
    telecom: PropTypes.array,
    labResults: PropTypes.array
  }),
  deidentified: PropTypes.bool
}

export default PatientPreview
