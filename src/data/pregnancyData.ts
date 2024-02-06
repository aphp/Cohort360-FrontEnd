import { QuestionnaireResponseItemAnswer } from 'fhir/r4'

export const pregnancyForm: {
  [key: string]: {
    id: string
    type: keyof QuestionnaireResponseItemAnswer
  }
} = {
  startDate: {
    id: 'F_MATER_001010',
    type: 'valueDate'
  },
  endDate: {
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
  risksObstetricHistory: {
    id: 'F_MATER_001363',
    type: 'valueCoding'
  },
  risksObstetricHistoryPrecision: {
    id: 'F_MATER_001364',
    type: 'valueString'
  },
  risksComplicationPregnancy: {
    id: 'F_MATER_001631',
    type: 'valueCoding'
  },
  risksComplicationPregnancyPrecision: {
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
    id: 'F_MATER_001550',
    type: 'valueCoding'
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
