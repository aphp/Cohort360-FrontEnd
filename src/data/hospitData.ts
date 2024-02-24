import { QuestionnaireResponseItemAnswer } from 'fhir/r4'

export const hospitForm: { [key: string]: { id: string; type: keyof QuestionnaireResponseItemAnswer } } = {
  hospitReason: {
    id: 'F_MATER_004051',
    type: 'valueString'
  },
  inUteroTransfer: {
    id: 'F_MATER_007001',
    type: 'valueCoding'
  },
  pregnancyMonitoring: {
    id: 'F_MATER_004062',
    type: 'valueBoolean'
  },
  vme: {
    id: 'F_MATER_007005',
    type: 'valueCoding'
  },
  maturationCorticotherapie: {
    id: 'F_MATER_007006',
    type: 'valueCoding'
  },
  chirurgicalGesture: {
    id: 'F_MATER_004623',
    type: 'valueCoding'
  },
  childbirth: {
    id: 'F_MATER_007025',
    type: 'valueCoding'
  },
  childbirthPlace: {
    id: 'F_MATER_004801',
    type: 'valueBoolean'
  },
  childbirthMode: {
    id: 'F_MATER_004830',
    type: 'valueCoding'
  },
  maturationReason: {
    id: 'F_MATER_004351',
    type: 'valueCoding'
  },
  maturationModality: {
    id: 'F_MATER_004833',
    type: 'valueCoding'
  },
  imgIndication: {
    id: 'F_MATER_004359',
    type: 'valueCoding'
  },
  laborOrCesareanEntry: {
    id: 'F_MATER_004842',
    type: 'valueCoding'
  },
  pathologyDuringLabor: {
    id: 'F_MATER_004859',
    type: 'valueCoding'
  },
  obstetricalGestureDuringLabor: {
    id: 'F_MATER_004864',
    type: 'valueCoding'
  },
  analgesieType: {
    id: 'F_MATER_004901',
    type: 'valueCoding'
  },
  birthDeliveryStartDate: {
    id: 'F_MATER_004961	',
    type: 'valueDateTime'
  },
  birthDeliveryEndDate: {
    id: 'F_MATER_004961	',
    type: 'valueDateTime'
  },
  birthDeliveryWeeks: {
    id: 'F_MATER_004962',
    type: 'valueInteger'
  },
  birthDeliveryDays: {
    id: 'F_MATER_004963',
    type: 'valueInteger'
  },
  birthDeliveryWay: {
    id: 'F_MATER_004980',
    type: 'valueCoding'
  },
  instrumentType: {
    id: 'F_MATER_004984',
    type: 'valueCoding'
  },
  cSectionModality: {
    id: 'F_MATER_004990',
    type: 'valueCoding'
  },
  presentationAtDelivery: {
    id: 'F_MATER_004999',
    type: 'valueCoding'
  },
  birthMensurationsGrams: {
    id: 'F_MATER_005033',
    type: 'valueInteger'
  },
  birthMensurationsPercentil: {
    id: 'F_MATER_005034	',
    type: 'valueInteger'
  },
  apgar1: {
    id: 'F_MATER_005051',
    type: 'valueInteger'
  },
  apgar3: {
    id: 'F_MATER_005052',
    type: 'valueInteger'
  },
  apgar5: {
    id: 'F_MATER_005053',
    type: 'valueInteger'
  },
  apgar10: {
    id: 'F_MATER_005054',
    type: 'valueInteger'
  },
  arterialPhCord: {
    id: 'F_MATER_005060',
    type: 'valueDecimal'
  },
  arterialCordLactates: {
    id: 'F_MATER_005061',
    type: 'valueDecimal'
  },
  postpartumHemorrhage: {
    id: 'F_MATER_007031',
    type: 'valueCoding'
  },
  conditionPerineum: {
    id: 'F_MATER_005151',
    type: 'valueCoding'
  },
  exitPlaceType: {
    id: 'F_MATER_005301',
    type: 'valueCoding'
  },
  feedingType: {
    id: 'F_MATER_005507',
    type: 'valueCoding'
  },
  complication: {
    id: 'F_MATER_007022',
    type: 'valueCoding'
  },
  exitFeedingMode: {
    id: 'F_MATER_005834',
    type: 'valueCoding'
  },
  exitDiagnostic: {
    id: 'F_MATER_005903',
    type: 'valueCoding'
  }
}

// export const hospitForm: { [key: string]: { id: string; type: keyof QuestionnaireResponseItemAnswer } } = {
//   hospitReason: {
//     id: 'F_MATER_004051',
//     type: 'valueString'
//   },
//   hospitInUteroTransfer: {
//     id: 'F_MATER_007001',
//     type: 'valueCoding'
//   },
//   hospitMaturationCorticotherapie: {
//     id: 'F_MATER_007006',
//     type: 'valueCoding'
//   },
//   hospitChirurgicalGestureDate: {
//     id: 'F_MATER_004621',
//     type: 'valueDate'
//   },
//   hospitChirurgicalAge: {
//     id: 'F_MATER_004622',
//     type: 'valueString'
//   },
//   hospitChirurgicalType: {
//     id: 'F_MATER_004623',
//     type: 'valueCoding'
//   },
//   hospitChildbirth: {
//     id: 'F_MATER_007025',
//     type: 'valueCoding'
//   },
//   hospitChildbirthPlace: {
//     id: 'F_MATER_004805',
//     type: 'valueBoolean'
//   },
//   hospitLaborMode: {
//     id: 'F_MATER_004830',
//     type: 'valueCoding'
//   },
//   hospitMaturationReason: {
//     id: 'F_MATER_004831',
//     type: 'valueCoding'
//   },
//   hospitMaturationModality: {
//     id: 'F_MATER_004833',
//     type: 'valueCoding'
//   },
//   hospitFoetusPresentation: {
//     id: 'F_MATER_004212',
//     type: 'valueString'
//   },
//   hospitLaborOrCesareanPresentation: {
//     id: 'F_MATER_004842',
//     type: 'valueCoding'
//   },
//   hospitAnalgesiaAnesthesiaType: {
//     id: 'F_MATER_004901',
//     type: 'valueCoding'
//   },
//   hospitChildbirthDate: {
//     id: 'F_MATER_004961',
//     type: 'valueDateTime'
//   },
//   hospitChildbirthWeeks: {
//     id: 'F_MATER_004962',
//     type: 'valueInteger'
//   },
//   hospitChildbirthDays: {
//     id: 'F_MATER_004963',
//     type: 'valueInteger'
//   },
//   hospitLaborWay: {
//     id: 'F_MATER_004980',
//     type: 'valueCoding'
//   },
//   hospitCesareanModality: {
//     id: 'F_MATER_004990',
//     type: 'valueCoding'
//   },
//   hospitIdentityGender: {
//     id: 'F_MATER_005032',
//     type: 'valueCoding'
//   },
//   hospitBirthWeightGrams: {
//     id: 'F_MATER_005033',
//     type: 'valueInteger'
//   },
//   hospitBirthWeightPercentile: {
//     id: 'F_MATER_005034',
//     type: 'valueInteger'
//   },
//   hospitBornAlive: {
//     id: 'F_MATER_007030',
//     type: 'valueCoding'
//   },
//   hospitPostPartumBleeding: {
//     id: 'F_MATER_007031',
//     type: 'valueCoding'
//   },
//   hospitPerineumState: {
//     id: 'F_MATER_005151',
//     type: 'valueCoding'
//   },
//   hospitBloodLossEstimation: {
//     id: 'F_MATER_005249',
//     type: 'valueInteger'
//   },
//   hospitExitMode: {
//     id: 'F_MATER_005301',
//     type: 'valueCoding'
//   },
//   hospitFeedingType: {
//     id: 'F_MATER_005507',
//     type: 'valueCoding'
//   }
// }
