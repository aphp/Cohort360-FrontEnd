/**
 * Source de vérité unique des `linkId` FHIR des champs des formulaires de maternité
 * (Fiche d'hospitalisation et Fiche de grossesse).
 *
 * Ces identifiants étaient auparavant dupliqués dans plusieurs fichiers (affichage timeline,
 * tableau d'exploration, formulaires du requêteur), avec un risque de dérive. Ils sont désormais
 * centralisés ici et consommés partout via `HOSPIT_LINK_IDS` / `PREGNANCY_LINK_IDS`.
 *
 * Remarque : toutes les clés ne sont pas utilisées par tous les écrans — l'affichage et le
 * requêteur n'exposent pas exactement les mêmes champs. C'est volontaire.
 */

/** linkId des champs de la Fiche d'hospitalisation. */
export const HOSPIT_LINK_IDS = {
  hospitReason: 'F_MATER_004052',
  inUteroTransfer: 'F_MATER_007001',
  pregnancyMonitoring: 'F_MATER_004062',
  vme: 'F_MATER_007005',
  maturationCorticotherapie: 'F_MATER_007006',
  chirurgicalGestureDate: 'F_MATER_004621',
  chirurgicalGesture: 'F_MATER_004623',
  childbirth: 'F_MATER_007025',
  hospitalChildBirthPlace: 'F_MATER_004801',
  otherHospitalChildBirthPlace: 'F_MATER_004803',
  homeChildBirthPlace: 'F_MATER_004805',
  childbirthMode: 'F_MATER_004830',
  maturationReason: 'F_MATER_004831',
  maturationModality: 'F_MATER_004833',
  imgIndication: 'F_MATER_004359',
  foetusPresentation: 'F_MATER_004212',
  laborOrCesareanEntry: 'F_MATER_004842',
  pathologyDuringLabor: 'F_MATER_004859',
  obstetricalGestureDuringLabor: 'F_MATER_004864',
  analgesieType: 'F_MATER_004901',
  birthDeliveryStartDate: 'F_MATER_004961',
  birthDeliveryWeeks: 'F_MATER_004962',
  birthDeliveryDays: 'F_MATER_004963',
  birthDeliveryWay: 'F_MATER_004980',
  instrumentType: 'F_MATER_004984',
  cSectionModality: 'F_MATER_004990',
  presentationAtDelivery: 'F_MATER_004999',
  gender: 'F_MATER_005032',
  birthMensurationsGrams: 'F_MATER_005033',
  birthMensurationsPercentil: 'F_MATER_005034',
  birthStatus: 'F_MATER_007030',
  postpartumHemorrhage: 'F_MATER_007031',
  conditionPerineum: 'F_MATER_005151',
  bloodLossEstimation: 'F_MATER_005249',
  exitPlaceType: 'F_MATER_005301',
  feedingType: 'F_MATER_005507',
  complication: 'F_MATER_005556',
  exitFeedingMode: 'F_MATER_005834',
  exitDiagnostic: 'F_MATER_005903'
} as const

/** linkId des champs de la Fiche de grossesse. */
export const PREGNANCY_LINK_IDS = {
  pregnancyStartDate: 'F_MATER_001010',
  pregnancyMode: 'F_MATER_001014',
  foetus: 'F_MATER_001017',
  pregnancyType: 'F_MATER_001024',
  twinPregnancyType: 'F_MATER_001025',
  parity: 'F_MATER_001192',
  maternalRisks: 'F_MATER_001361',
  risksRelatedToObstetricHistory: 'F_MATER_001363',
  ultrasoundMonitoring: 'F_MATER_003026',
  corticotherapie: 'F_MATER_001597',
  risksOrComplicationsOfPregnancy: 'F_MATER_001631',
  prenatalDiagnosis: 'F_MATER_001661',
  reasonsOfPrenatalDiagnosticMonitoring: 'F_MATER_001662'
} as const
