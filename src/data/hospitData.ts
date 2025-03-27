import { QuestionnaireResponseItemAnswer } from 'fhir/r4'

export const hospitForm: { [key: string]: { id: string; type: keyof QuestionnaireResponseItemAnswer } } = {
  hospitReason: {
    id: 'F_MATER_004052',
    type: 'valueCoding'
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
  chirurgicalGestureDate: {
    id: 'F_MATER_004621',
    type: 'valueDate'
  },
  ageDuringChirurgicalGesture: {
    id: 'F_MATER_004622',
    type: 'valueString'
  },
  childbirth: {
    id: 'F_MATER_007025',
    type: 'valueCoding'
  },
  hospitalChildBirthPlace: {
    id: 'F_MATER_004801',
    type: 'valueBoolean'
  },
  otherHospitalChildBirthPlace: {
    id: 'F_MATER_004803',
    type: 'valueBoolean'
  },
  homeChildBirthPlace: {
    id: 'F_MATER_004805',
    type: 'valueBoolean'
  },
  childbirthMode: {
    id: 'F_MATER_004830',
    type: 'valueCoding'
  },
  maturationReason: {
    id: 'F_MATER_004831',
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
    id: 'F_MATER_004961',
    type: 'valueDateTime'
  },
  birthDeliveryEndDate: {
    id: 'F_MATER_004961',
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
    id: 'F_MATER_005034',
    type: 'valueDecimal'
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
  birthStatus: {
    id: 'F_MATER_007030',
    type: 'valueCoding'
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
    id: 'F_MATER_005556',
    type: 'valueBoolean'
  },
  exitFeedingMode: {
    id: 'F_MATER_005834',
    type: 'valueCoding'
  },
  exitDiagnostic: {
    id: 'F_MATER_005903',
    type: 'valueCoding'
  },
  foetusPresentation: {
    id: 'F_MATER_004212',
    type: 'valueString'
  },
  gender: {
    id: 'F_MATER_005032',
    type: 'valueCoding'
  },
  bloodLossEstimation: {
    id: 'F_MATER_005249',
    type: 'valueInteger'
  }
}
