import { QuestionnaireResponseItemAnswer } from 'fhir/r4'

export const pregnancyForm: {
  [key: string]: {
    id: string
    type: keyof QuestionnaireResponseItemAnswer
  }
} = {
  pregnancyStartDate: {
    id: 'F_MATER_001010',
    type: 'valueDate'
  },
  pregnancyEndDate: {
    id: 'F_MATER_001010',
    type: 'valueDate'
  },
  pregnancyMode: {
    id: 'F_MATER_001014',
    type: 'valueCoding'
  },
  foetus: {
    id: 'F_MATER_001017',
    type: 'valueInteger'
  },
  parity: {
    id: 'F_MATER_001192',
    type: 'valueInteger'
  },
  maternalRisks: {
    id: 'F_MATER_001361',
    type: 'valueCoding'
  },
  maternalRisksPrecision: {
    id: 'F_MATER_001362',
    type: 'valueString'
  },
  risksRelatedToObstetricHistory: {
    id: 'F_MATER_001363',
    type: 'valueCoding'
  },
  risksRelatedToObstetricHistoryPrecision: {
    id: 'F_MATER_001364',
    type: 'valueString'
  },
  risksOrComplicationsOfPregnancy: {
    id: 'F_MATER_001631',
    type: 'valueCoding'
  },
  risksOrComplicationsOfPregnancyPrecision: {
    id: 'F_MATER_001632',
    type: 'valueString'
  },
  corticotherapie: {
    id: 'F_MATER_001597',
    type: 'valueBoolean'
  },
  prenatalDiagnosis: {
    id: 'F_MATER_001661',
    type: 'valueBoolean'
  },
  ultrasoundMonitoring: {
    id: 'F_MATER_001552',
    type: 'valueBoolean'
  },
  pregnancyType: {
    id: 'F_MATER_001024',
    type: 'valueString'
  },
  twinPregnancyType: {
    id: 'F_MATER_001025',
    type: 'valueCoding'
  },
  reasonsOfPrenatalDiagnosticMonitoring: {
    id: 'F_MATER_001662',
    type: 'valueString'
  }
}
