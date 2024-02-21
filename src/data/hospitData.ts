import { QuestionnaireResponseItemAnswer } from 'fhir/r4'

export const hospitForm: { [key: string]: { id: string; type: keyof QuestionnaireResponseItemAnswer } } = {
  hospitReason: {
    id: 'F_MATER_004051',
    type: 'valueString'
  },
  hospitInUteroTransfer: {
    id: 'F_MATER_007001'
    // type: 'value'
  },
  hospitMaturationCorticotherapie: {
    id: 'F_MATER_007006'
    // type: ''
  },
  hospitChirurgicalGestureDate: {
    id: 'F_MATER_004621',
    type: 'valueDate'
  },
  hospitChirurgicalAge: {
    id: 'F_MATER_004622',
    type: 'valueString'
  },
  hospitChirurgicalType: {
    id: 'F_MATER_004623',
    type: 'valueCoding'
  },
  hospitChildbirth: {
    id: 'F_MATER_007025',
    type: 'valueCoding'
  },
  hospitChildbirthPlace: {
    id: 'F_MATER_004805',
    type: 'valueBoolean'
  },
  hospitLaborMode: {
    id: 'F_MATER_004830',
    type: 'valueCoding'
  },
  hospitMaturationReason: {
    id: 'F_MATER_004831',
    type: 'valueCoding'
  },
  hospitMaturationModality: {
    id: 'F_MATER_004833',
    type: 'valueCoding'
  },
  hospitFoetusPresentation: {
    id: 'F_MATER_004212',
    type: 'valueString'
  },
  hospitLaborOrCesareanPresentation: {
    id: 'F_MATER_004842',
    type: 'valueCoding'
  },
  hospitAnalgesiaAnesthesiaType: {
    id: 'F_MATER_004901',
    type: 'valueCoding'
  },
  hospitChildbirthDate: {
    id: 'F_MATER_004961',
    type: 'valueDateTime'
  },
  hospitChildbirthWeeks: {
    id: 'F_MATER_004962',
    type: 'valueInteger'
  },
  hospitChildbirthDays: {
    id: 'F_MATER_004963',
    type: 'valueInteger'
  },
  hospitLaborWay: {
    id: 'F_MATER_004980',
    type: 'valueCoding'
  },
  hospitCesareanModality: {
    id: 'F_MATER_004990',
    type: 'valueCoding'
  },
  hospitIdentityGender: {
    id: 'F_MATER_005032',
    type: 'valueCoding'
  },
  hospitBirthWeightGrams: {
    id: 'F_MATER_005033',
    type: 'valueInteger'
  },
  hospitBirthWeightPercentile: {
    id: 'F_MATER_005034',
    type: 'valueInteger'
  },
  hospitBornAlive: {
    id: 'F_MATER_007030',
    type: 'valueCoding'
  },
  hospitPostPartumBleeding: {
    id: 'F_MATER_007031',
    type: 'valueCoding'
  },
  hospitPerineumState: {
    id: 'F_MATER_005151',
    type: 'valueCoding'
  },
  hospitBloodLossEstimation: {
    id: 'F_MATER_005249',
    type: 'valueInteger'
  },
  hospitExitMode: {
    id: 'F_MATER_005301',
    type: 'valueCoding'
  },
  hospitFeedingType: {
    id: 'F_MATER_005507',
    type: 'valueCoding'
  }
}
