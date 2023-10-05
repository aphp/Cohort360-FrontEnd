import { Grid } from '@mui/material'
import { ChipWrapper } from 'components/ui/Chips/styles'
import React from 'react'
import { SelectedCriteriaType } from 'types'
import { MedicationType, RequestCriteriasKeys, RequestCriteriasTypes } from 'types/requestCriterias'
import { getDurationRangeLabel } from 'utils/age'
import {
  getBiologyValuesLabel,
  getBirthdates,
  getDeathDates,
  getDocumentTypesLabel,
  getEncounterDatesLabel,
  getExecutiveUnitsLabel,
  getIppListLabel,
  getLabelFromObject,
  getMedicationTypeLabel,
  getNbOccurencesLabel,
  getOccurenceDatesLabel,
  getSearchDocumentLabel,
  getVitalStatusLabel
} from 'utils/requestCriterias'

type CriteriasProps = {
  value: any //SelectedCriteriaType
}

const Criterias = ({ value }: CriteriasProps) => {
  console.log('currentCriterion', value)
  return (
    <>
      {value.genders && value[RequestCriteriasKeys.GENDERS]?.length > 0 && (
        <Grid item xs={12}>
          <ChipWrapper label={getLabelFromObject(value.genders)} />
        </Grid>
      )}
      {value.vitalStatus && value[RequestCriteriasKeys.VITAL_STATUS] && (
        <Grid item xs={12}>
          <ChipWrapper label={getVitalStatusLabel(value.vitalStatus)} />
        </Grid>
      )}
      {value.age && value[RequestCriteriasKeys.AGE] && <ChipWrapper label={getDurationRangeLabel(value.age)} />}
      {/* à revoir, la méthode n'est pas compatibe avec le composant à changer*/}
      {value.duration && <ChipWrapper label={getDurationRangeLabel(value.duration)} />}
      {value.birthdates &&
        (value[RequestCriteriasKeys.BIRTHDATES][0] !== null || value[RequestCriteriasKeys.BIRTHDATES][1] !== null) && (
          <Grid item xs={12}>
            <ChipWrapper label={getBirthdates(value.birthdates)} />
          </Grid>
        )}
      {value.deathDates &&
        (value[RequestCriteriasKeys.DEATH_DATES][0] !== null ||
          value[RequestCriteriasKeys.DEATH_DATES][1] !== null) && (
          <Grid item xs={12}>
            <ChipWrapper label={getDeathDates(value.deathDates)} />
          </Grid>
        )}
      {value.priseEnChargeType && <ChipWrapper label={getLabelFromObject(value.priseEnChargeType)} />}
      {value.typeDeSejour && <ChipWrapper label={getLabelFromObject(value.typeDeSejour)} />}
      {value.fileStatus && <ChipWrapper label={getLabelFromObject(value.fileStatus)} />}
      {value.admissionMode && <ChipWrapper label={getLabelFromObject(value.admissionMode)} />}
      {value.admission && <ChipWrapper label={getLabelFromObject(value.admission)} />}
      {value.entryMode && <ChipWrapper label={getLabelFromObject(value.entryMode)} />}
      {value.exitMode && <ChipWrapper label={getLabelFromObject(value.exitMode)} />}
      {value.reason && <ChipWrapper label={getLabelFromObject(value.reason)} />}
      {value.destination && <ChipWrapper label={getLabelFromObject(value.destination)} />}
      {value.provenance && <ChipWrapper label={getLabelFromObject(value.provenance)} />}
      {value.type === RequestCriteriasTypes.Documents && value.search && (
        <Grid item xs={12}>
          <ChipWrapper label={getSearchDocumentLabel(value.search, value.searchBy)} />
        </Grid>
      )}
      {value.type === RequestCriteriasTypes.IPPList && value.search && (
        <Grid item xs={12}>
          <ChipWrapper label={getIppListLabel(value.search)} />
        </Grid>
      )}
      {value.docType?.length > 0 && (
        <Grid item xs={12}>
          <ChipWrapper label={getDocumentTypesLabel(value.docType)} />
        </Grid>
      )}

      {(value.type === RequestCriteriasTypes.Administration || value.type === RequestCriteriasTypes.Request) && (
        <Grid item xs={12}>
          <ChipWrapper label={getMedicationTypeLabel(value.type)} />
        </Grid>
      )}
      {value.code?.length > 0 && (
        <Grid item xs={12}>
          <ChipWrapper label={getLabelFromObject(value.code)} />
        </Grid>
      )}
      {value.diagnosticType?.length > 0 && (
        <Grid item xs={12}>
          <ChipWrapper label={getLabelFromObject(value.diagnosticType)} />
        </Grid>
      )}
      {value.prescriptionType?.length > 0 && (
        <Grid item xs={12}>
          <ChipWrapper label={getLabelFromObject(value.prescriptionType)} />
        </Grid>
      )}
      {value.valueComparator && (!isNaN(value.valueMin) || !isNaN(value.valueMax)) && (
        <Grid item xs={12}>
          <ChipWrapper label={getBiologyValuesLabel(value.valueComparator, value.valueMin, value.valueMax)} />
        </Grid>
      )}
      {value.administration?.length > 0 && (
        <Grid item xs={12}>
          <ChipWrapper label={getLabelFromObject(value.administration)} />
        </Grid>
      )}
      {(value.encounterStartDate || value.encounterEndDate) && (
        <Grid item xs={12}>
          <ChipWrapper label={getEncounterDatesLabel([value.encounterStartDate, value.encounterEndDate])} />
        </Grid>
      )}
      {value.occurrence && value.occurrenceComparator && (
        <Grid item xs={12}>
          <ChipWrapper label={getNbOccurencesLabel(value.occurrence, value.occurrenceComparator)} />
        </Grid>
      )}
      {(value.startOccurrence || value.endOccurrence) && (
        <Grid item xs={12}>
          <ChipWrapper label={getOccurenceDatesLabel([value.startOccurrence, value.endOccurrence])} />
        </Grid>
      )}
      {value.encounterService?.length > 0 && (
        <Grid item xs={12}>
          <ChipWrapper label={getExecutiveUnitsLabel(value.encounterService)} />
        </Grid>
      )}
    </>
  )
}

export default Criterias
