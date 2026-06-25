import { Comparators, CriteriaType, QuestionnaireResponseParamsKeys, ResourceType } from 'types/requestCriterias'
import {
  CommonCriteriaData,
  CriteriaForm,
  NewDurationRangeType,
  NumberAndComparatorDataType,
  WithEncounterStatusDataType,
  WithOccurenceCriteriaDataType
} from '../CriteriaForm/types'
import { FormNames } from 'types/searchCriterias'
import { SourceType } from 'types/scope'
import { getConfig } from 'config'
import { configValueSetFallback, getFormItemValueSetMeta } from './questionnaireFormMeta'
import { HOSPIT_LINK_IDS } from 'constants/maternityLinkIds'

export type HospitDataType = CommonCriteriaData &
  WithOccurenceCriteriaDataType &
  WithEncounterStatusDataType & {
    type: CriteriaType.HOSPIT
    hospitReason: string
    inUteroTransfer: string[] | null
    pregnancyMonitoring: string[] | null
    vme: string[] | null
    maturationCorticotherapie: string[] | null
    chirurgicalGesture: string[] | null
    childbirth: string[] | null
    hospitalChildBirthPlace: string[] | null
    otherHospitalChildBirthPlace: string[] | null
    homeChildBirthPlace: string[] | null
    childbirthMode: string[] | null
    maturationReason: string[] | null
    maturationModality: string[] | null
    imgIndication: string[] | null
    laborOrCesareanEntry: string[] | null
    pathologyDuringLabor: string[] | null
    obstetricalGestureDuringLabor: string[] | null
    analgesieType: string[] | null
    birthDeliveryDate: NewDurationRangeType | null
    birthDeliveryWeeks: NumberAndComparatorDataType | null
    birthDeliveryDays: NumberAndComparatorDataType | null
    birthDeliveryWay: string[] | null
    instrumentType: string[] | null
    cSectionModality: string[] | null
    presentationAtDelivery: string[] | null
    birthMensurationsGrams: NumberAndComparatorDataType | null
    birthMensurationsPercentil: NumberAndComparatorDataType | null
    apgar1: NumberAndComparatorDataType | null
    apgar3: NumberAndComparatorDataType | null
    apgar5: NumberAndComparatorDataType | null
    apgar10: NumberAndComparatorDataType | null
    arterialPhCord: NumberAndComparatorDataType | null
    arterialCordLactates: NumberAndComparatorDataType | null
    birthStatus: string[] | null
    postpartumHemorrhage: string[] | null
    conditionPerineum: string[] | null
    exitPlaceType: string[] | null
    feedingType: string[] | null
    complication: string[] | null
    exitFeedingMode: string[] | null
    exitDiagnostic: string[] | null
  }

export const form: () => CriteriaForm<HospitDataType> = () => {
  const meta = (linkId: string, fallbackKey: Parameters<typeof configValueSetFallback>[0]) =>
    getFormItemValueSetMeta(FormNames.HOSPIT, linkId, configValueSetFallback(fallbackKey))

  const metas = {
    hospitReason: meta(HOSPIT_LINK_IDS.hospitReason, 'hospitReason'),
    inUteroTransfer: meta(HOSPIT_LINK_IDS.inUteroTransfer, 'booleanOpenChoiceFields'),
    pregnancyMonitoring: meta(HOSPIT_LINK_IDS.pregnancyMonitoring, 'booleanOpenChoiceFields'),
    vme: meta(HOSPIT_LINK_IDS.vme, 'vme'),
    maturationCorticotherapie: meta(HOSPIT_LINK_IDS.maturationCorticotherapie, 'booleanOpenChoiceFields'),
    chirurgicalGesture: meta(HOSPIT_LINK_IDS.chirurgicalGesture, 'chirurgicalGesture'),
    childbirth: meta(HOSPIT_LINK_IDS.childbirth, 'booleanOpenChoiceFields'),
    hospitalChildBirthPlace: meta(HOSPIT_LINK_IDS.hospitalChildBirthPlace, 'booleanOpenChoiceFields'),
    otherHospitalChildBirthPlace: meta(HOSPIT_LINK_IDS.otherHospitalChildBirthPlace, 'booleanFields'),
    homeChildBirthPlace: meta(HOSPIT_LINK_IDS.homeChildBirthPlace, 'booleanFields'),
    childbirthMode: meta(HOSPIT_LINK_IDS.childbirthMode, 'childBirthMode'),
    maturationReason: meta(HOSPIT_LINK_IDS.maturationReason, 'maturationReason'),
    maturationModality: meta(HOSPIT_LINK_IDS.maturationModality, 'maturationModality'),
    imgIndication: meta(HOSPIT_LINK_IDS.imgIndication, 'imgIndication'),
    laborOrCesareanEntry: meta(HOSPIT_LINK_IDS.laborOrCesareanEntry, 'laborOrCesareanEntry'),
    pathologyDuringLabor: meta(HOSPIT_LINK_IDS.pathologyDuringLabor, 'pathologyDuringLabor'),
    obstetricalGestureDuringLabor: meta(HOSPIT_LINK_IDS.obstetricalGestureDuringLabor, 'obstetricalGestureDuringLabor'),
    analgesieType: meta(HOSPIT_LINK_IDS.analgesieType, 'analgesieType'),
    birthDeliveryWay: meta(HOSPIT_LINK_IDS.birthDeliveryWay, 'birthDeliveryWay'),
    instrumentType: meta(HOSPIT_LINK_IDS.instrumentType, 'instrumentType'),
    cSectionModality: meta(HOSPIT_LINK_IDS.cSectionModality, 'cSectionModality'),
    presentationAtDelivery: meta(HOSPIT_LINK_IDS.presentationAtDelivery, 'presentationAtDelivery'),
    birthStatus: meta(HOSPIT_LINK_IDS.birthStatus, 'birthStatus'),
    postpartumHemorrhage: meta(HOSPIT_LINK_IDS.postpartumHemorrhage, 'booleanOpenChoiceFields'),
    conditionPerineum: meta(HOSPIT_LINK_IDS.conditionPerineum, 'conditionPerineum'),
    exitPlaceType: meta(HOSPIT_LINK_IDS.exitPlaceType, 'exitPlaceType'),
    feedingType: meta(HOSPIT_LINK_IDS.feedingType, 'feedingType'),
    complication: meta(HOSPIT_LINK_IDS.complication, 'booleanFields'),
    exitFeedingMode: meta(HOSPIT_LINK_IDS.exitFeedingMode, 'exitFeedingMode'),
    exitDiagnostic: meta(HOSPIT_LINK_IDS.exitDiagnostic, 'exitDiagnostic')
  }

  return {
    label: "de Fiche d'hospitalisation",
    title: "Fiche d'hospitalisation",
    initialData: {
      title: "Critère de Fiche d'hospitalisation",
      type: CriteriaType.HOSPIT,
      isInclusive: true,
      occurrence: {
        value: 1,
        comparator: Comparators.GREATER_OR_EQUAL
      },
      encounterService: null,
      encounterStatus: [],
      startOccurrence: null,
      hospitReason: '',
      inUteroTransfer: null,
      pregnancyMonitoring: null,
      vme: null,
      maturationCorticotherapie: null,
      chirurgicalGesture: null,
      childbirth: null,
      hospitalChildBirthPlace: null,
      otherHospitalChildBirthPlace: null,
      homeChildBirthPlace: null,
      childbirthMode: null,
      maturationReason: null,
      maturationModality: null,
      imgIndication: null,
      laborOrCesareanEntry: null,
      pathologyDuringLabor: null,
      obstetricalGestureDuringLabor: null,
      analgesieType: null,
      birthDeliveryDate: null,
      birthDeliveryWeeks: null,
      birthDeliveryDays: null,
      birthDeliveryWay: null,
      instrumentType: null,
      cSectionModality: null,
      presentationAtDelivery: null,
      birthMensurationsGrams: null,
      birthMensurationsPercentil: null,
      apgar1: null,
      apgar3: null,
      apgar5: null,
      apgar10: null,
      arterialPhCord: null,
      arterialCordLactates: null,
      birthStatus: null,
      postpartumHemorrhage: null,
      conditionPerineum: null,
      exitPlaceType: null,
      feedingType: null,
      complication: null,
      exitFeedingMode: null,
      exitDiagnostic: null
    },
    infoAlert: ['Tous les éléments des champs multiples sont liés par une contrainte OU'],
    buildInfo: {
      type: { [ResourceType.QUESTIONNAIRE_RESPONSE]: CriteriaType.HOSPIT },
      defaultFilter:
        (getConfig().core.fhir.filterActive ? 'subject.active=true&' : '') +
        `questionnaire.name=${FormNames.HOSPIT}&status=in-progress,completed`,
      subType: FormNames.HOSPIT
    },
    itemSections: [
      {
        items: [
          {
            valueKey: 'occurrence',
            type: 'numberAndComparator',
            label: "Nombre d'occurrences",
            buildInfo: {
              chipDisplayMethodExtraArgs: [{ type: 'string', value: "Nombre d'occurrences" }]
            }
          },
          {
            valueKey: 'encounterService',
            type: 'executiveUnit',
            label: 'Unité exécutrice',
            sourceType: SourceType.MATERNITY,
            buildInfo: {
              fhirKey: QuestionnaireResponseParamsKeys.EXECUTIVE_UNITS
            }
          },
          {
            valueKey: 'encounterStatus',
            type: 'autocomplete',
            label: 'Statut de la visite associée',
            valueSetId: getConfig().core.valueSets.encounterStatus.url,
            noOptionsText: 'Veuillez entrer un statut de visite associée',
            buildInfo: {
              fhirKey: QuestionnaireResponseParamsKeys.ENCOUNTER_STATUS,
              chipDisplayMethodExtraArgs: [{ type: 'string', value: 'Statut de la visite associée :' }]
            }
          }
        ]
      },
      {
        title: 'ADMISSION',
        defaulCollapsed: true,
        items: [
          {
            valueKey: 'hospitReason',
            type: 'autocomplete',
            label: "Motif(s) d'hospitalisation",
            noOptionsText: "Veuillez entrer un motif d'hospitalisation",
            valueSetId: metas.hospitReason.valueSetId,
            valueSetData: metas.hospitReason.valueSetData,
            buildInfo: {
              fhirKey: {
                id: HOSPIT_LINK_IDS.hospitReason,
                type: 'valueCoding'
              },
              chipDisplayMethodExtraArgs: [{ type: 'string', value: "Motif(s) d'hospitalisation : " }]
            }
          },
          {
            valueKey: 'inUteroTransfer',
            type: 'autocomplete',
            label: 'Transfert in utero',
            noOptionsText: 'Veuillez entrer "oui" ou "non"',
            valueSetId: metas.inUteroTransfer.valueSetId,
            valueSetData: metas.inUteroTransfer.valueSetData,
            buildInfo: {
              fhirKey: {
                id: HOSPIT_LINK_IDS.inUteroTransfer,
                type: 'valueCoding'
              },
              chipDisplayMethodExtraArgs: [{ type: 'string', value: 'Transfert in utero :' }]
            }
          },
          {
            valueKey: 'pregnancyMonitoring',
            type: 'autocomplete',
            label: 'Grossesse peu ou pas suivie',
            noOptionsText: 'Veuillez entrer "oui" ou "non"',
            valueSetId: metas.pregnancyMonitoring.valueSetId,
            valueSetData: metas.pregnancyMonitoring.valueSetData,
            buildInfo: {
              fhirKey: {
                id: HOSPIT_LINK_IDS.pregnancyMonitoring,
                type: 'valueBoolean'
              },
              chipDisplayMethodExtraArgs: [{ type: 'string', value: 'Grossesse peu ou pas suivie :' }]
            }
          },
          {
            valueKey: 'vme',
            type: 'autocomplete',
            label: 'VME',
            noOptionsText: 'Veuillez entrer des valeurs de VME',
            valueSetId: metas.vme.valueSetId,
            valueSetData: metas.vme.valueSetData,
            buildInfo: {
              fhirKey: {
                id: HOSPIT_LINK_IDS.vme,
                type: 'valueCoding'
              },
              chipDisplayMethodExtraArgs: [{ type: 'string', value: 'VME :' }]
            }
          },
          {
            valueKey: 'maturationCorticotherapie',
            type: 'autocomplete',
            label: 'Corticothérapie pour maturation fœtale faite',
            noOptionsText: 'Veuillez entrer "oui" ou "non"',
            valueSetId: metas.maturationCorticotherapie.valueSetId,
            valueSetData: metas.maturationCorticotherapie.valueSetData,
            buildInfo: {
              fhirKey: {
                id: HOSPIT_LINK_IDS.maturationCorticotherapie,
                type: 'valueCoding'
              },
              chipDisplayMethodExtraArgs: [{ type: 'string', value: 'Corticothérapie pour maturation foetale faite :' }]
            }
          },
          {
            valueKey: 'chirurgicalGesture',
            type: 'autocomplete',
            label: 'Type de geste ou de chirurgie',
            noOptionsText: 'Veuillez entrer un type de geste ou de chirurgie',
            valueSetId: metas.chirurgicalGesture.valueSetId,
            valueSetData: metas.chirurgicalGesture.valueSetData,
            buildInfo: {
              fhirKey: {
                id: HOSPIT_LINK_IDS.chirurgicalGesture,
                type: 'valueCoding'
              },
              chipDisplayMethodExtraArgs: [{ type: 'string', value: 'Type de geste ou de chirurgie :' }]
            }
          }
        ]
      },
      {
        title: 'SYNTHESE',
        defaulCollapsed: true,
        items: [
          {
            valueKey: 'childbirth',
            type: 'autocomplete',
            label: 'Accouchement',
            noOptionsText: 'Veuillez entrer "oui" ou "non"',
            valueSetId: metas.childbirth.valueSetId,
            valueSetData: metas.childbirth.valueSetData,
            buildInfo: {
              fhirKey: {
                id: HOSPIT_LINK_IDS.childbirth,
                type: 'valueCoding'
              },
              chipDisplayMethodExtraArgs: [{ type: 'string', value: 'Accouchement :' }]
            }
          },
          {
            valueKey: 'hospitalChildBirthPlace',
            type: 'autocomplete',
            label: "Accouchement à la maternité de l'hospitalisation",
            noOptionsText: 'Veuillez entrer "oui" ou "non"',
            valueSetId: metas.hospitalChildBirthPlace.valueSetId,
            valueSetData: metas.hospitalChildBirthPlace.valueSetData,
            buildInfo: {
              fhirKey: {
                id: HOSPIT_LINK_IDS.hospitalChildBirthPlace,
                type: 'valueBoolean'
              },
              chipDisplayMethodExtraArgs: [
                { type: 'string', value: "Accouchement à la maternité de l'hospitalisation :" }
              ]
            }
          },
          {
            valueKey: 'otherHospitalChildBirthPlace',
            type: 'autocomplete',
            label: 'Accouchement dans un autre hôpital',
            noOptionsText: 'Veuillez entrer "oui" ou "non"',
            valueSetId: metas.otherHospitalChildBirthPlace.valueSetId,
            valueSetData: metas.otherHospitalChildBirthPlace.valueSetData,
            buildInfo: {
              fhirKey: {
                id: HOSPIT_LINK_IDS.otherHospitalChildBirthPlace,
                type: 'valueBoolean'
              },
              chipDisplayMethodExtraArgs: [{ type: 'string', value: 'Accouchement dans un autre hôpital :' }]
            }
          },
          {
            valueKey: 'homeChildBirthPlace',
            type: 'autocomplete',
            label: 'Accouchement à domicile',
            noOptionsText: 'Veuillez entrer "oui" ou "non"',
            valueSetId: metas.homeChildBirthPlace.valueSetId,
            valueSetData: metas.homeChildBirthPlace.valueSetData,
            buildInfo: {
              fhirKey: {
                id: HOSPIT_LINK_IDS.homeChildBirthPlace,
                type: 'valueBoolean'
              },
              chipDisplayMethodExtraArgs: [{ type: 'string', value: 'Accouchement à domicile :' }]
            }
          },
          {
            valueKey: 'childbirthMode',
            type: 'autocomplete',
            label: 'Mode de mise en travail',
            noOptionsText: 'Veuillez entrer un mode de mise en travail',
            valueSetId: metas.childbirthMode.valueSetId,
            valueSetData: metas.childbirthMode.valueSetData,
            buildInfo: {
              fhirKey: {
                id: HOSPIT_LINK_IDS.childbirthMode,
                type: 'valueCoding'
              },
              chipDisplayMethodExtraArgs: [{ type: 'string', value: 'Mode de mise en travail :' }]
            }
          },
          {
            valueKey: 'maturationReason',
            type: 'autocomplete',
            label: 'Motif(s) de maturation / déclenchement',
            noOptionsText: 'Veuillez entrer un motif de maturation / déclenchement',
            valueSetId: metas.maturationReason.valueSetId,
            valueSetData: metas.maturationReason.valueSetData,
            buildInfo: {
              fhirKey: {
                id: HOSPIT_LINK_IDS.maturationReason,
                type: 'valueCoding'
              },
              chipDisplayMethodExtraArgs: [{ type: 'string', value: 'Motif(s) de maturation / déclenchement :' }]
            }
          },
          {
            valueKey: 'maturationModality',
            type: 'autocomplete',
            label: 'Modalités de maturation cervicale initiale',
            noOptionsText: 'Veuillez entrer une modalité de maturation cervicale initiale',
            valueSetId: metas.maturationModality.valueSetId,
            valueSetData: metas.maturationModality.valueSetData,
            buildInfo: {
              fhirKey: {
                id: HOSPIT_LINK_IDS.maturationModality,
                type: 'valueCoding'
              },
              chipDisplayMethodExtraArgs: [{ type: 'string', value: 'Modalités de maturation cervicale initiale :' }]
            }
          },
          {
            valueKey: 'imgIndication',
            type: 'autocomplete',
            label: "Indication de l'IMG",
            noOptionsText: "Veuillez entrer une indication de l'IMG",
            valueSetId: metas.imgIndication.valueSetId,
            valueSetData: metas.imgIndication.valueSetData,
            buildInfo: {
              fhirKey: {
                id: HOSPIT_LINK_IDS.imgIndication,
                type: 'valueCoding'
              },
              chipDisplayMethodExtraArgs: [{ type: 'string', value: "Indication de l'IMG :" }]
            }
          },
          {
            valueKey: 'laborOrCesareanEntry',
            type: 'autocomplete',
            label: "Présentation à l'entrée en travail ou en début de césarienne - données jusqu'au 09/11/2023",
            noOptionsText: "Veuillez entrer une présentation à l'entrée en travail ou en début de césarienne",
            valueSetId: metas.laborOrCesareanEntry.valueSetId,
            valueSetData: metas.laborOrCesareanEntry.valueSetData,
            buildInfo: {
              fhirKey: {
                id: HOSPIT_LINK_IDS.laborOrCesareanEntry,
                type: 'valueCoding'
              },
              chipDisplayMethodExtraArgs: [
                { type: 'string', value: "Présentation à l'entrée en travail ou en début de césarienne :" }
              ]
            }
          },
          {
            valueKey: 'pathologyDuringLabor',
            type: 'autocomplete',
            label: 'Pathologie pendant le travail',
            noOptionsText: 'Veuillez entrer une pathologie pendant le travail',
            valueSetId: metas.pathologyDuringLabor.valueSetId,
            valueSetData: metas.pathologyDuringLabor.valueSetData,
            buildInfo: {
              fhirKey: {
                id: HOSPIT_LINK_IDS.pathologyDuringLabor,
                type: 'valueCoding'
              },
              chipDisplayMethodExtraArgs: [{ type: 'string', value: 'Pathologie pendant le travail :' }]
            }
          },
          {
            valueKey: 'obstetricalGestureDuringLabor',
            type: 'autocomplete',
            label: 'Geste ou manoeuvre obstétricale pendant le travail',
            noOptionsText: 'Veuillez entrer un geste ou manoeuvre obstétricale pendant le travail',
            valueSetId: metas.obstetricalGestureDuringLabor.valueSetId,
            valueSetData: metas.obstetricalGestureDuringLabor.valueSetData,
            buildInfo: {
              fhirKey: {
                id: HOSPIT_LINK_IDS.obstetricalGestureDuringLabor,
                type: 'valueCoding'
              },
              chipDisplayMethodExtraArgs: [
                { type: 'string', value: 'Geste ou manoeuvre obstétricale pendant le travail :' }
              ]
            }
          }
        ]
      },
      {
        title: 'ANALGESIE / ANESTHESIE',
        defaulCollapsed: true,
        items: [
          {
            valueKey: 'analgesieType',
            type: 'autocomplete',
            label: 'Analgésie / Anesthésie - Type',
            noOptionsText: "Veuillez entrer un type d'Analgésie / Anesthésie - Type",
            valueSetId: metas.analgesieType.valueSetId,
            valueSetData: metas.analgesieType.valueSetData,
            buildInfo: {
              fhirKey: {
                id: HOSPIT_LINK_IDS.analgesieType,
                type: 'valueCoding'
              },
              chipDisplayMethodExtraArgs: [{ type: 'string', value: 'ANALGESIE / ANESTHESIE - type :' }]
            }
          }
        ]
      },
      {
        title: 'ACCOUCHEMENT ET NAISSANCE',
        defaulCollapsed: true,
        items: [
          {
            valueKey: 'birthDeliveryDate',
            type: 'calendarRange',
            extraLabel: () => "Date/heure de l'accouchement",
            errorType: 'INCOHERENT_AGE_ERROR',
            buildInfo: {
              fhirKey: {
                id: 'F_MATER_004961',
                type: 'valueDateTime'
              },
              chipDisplayMethodExtraArgs: [{ type: 'string', value: "Date/heure de l'accouchement :" }]
            }
          },
          {
            valueKey: 'birthDeliveryWeeks',
            type: 'numberAndComparator',
            label: 'Accouchement - Terme - Semaines',
            buildInfo: {
              fhirKey: {
                id: 'F_MATER_004962',
                type: 'valueInteger'
              },
              chipDisplayMethodExtraArgs: [{ type: 'string', value: 'Nombre de semaines (Accouchement - Terme)' }]
            }
          },
          {
            valueKey: 'birthDeliveryDays',
            type: 'numberAndComparator',
            label: 'Accouchement - Terme - Jours',
            buildInfo: {
              fhirKey: {
                id: 'F_MATER_004963',
                type: 'valueInteger'
              },
              chipDisplayMethodExtraArgs: [{ type: 'string', value: 'Nombre de jours (Accouchement - Terme)' }]
            }
          },
          {
            valueKey: 'birthDeliveryWay',
            type: 'autocomplete',
            label: 'Voie d’accouchement',
            noOptionsText: 'Veuillez entrer une voie d’accouchement',
            valueSetId: metas.birthDeliveryWay.valueSetId,
            valueSetData: metas.birthDeliveryWay.valueSetData,
            buildInfo: {
              fhirKey: {
                id: HOSPIT_LINK_IDS.birthDeliveryWay,
                type: 'valueCoding'
              },
              chipDisplayMethodExtraArgs: [{ type: 'string', value: 'Voie d’accouchement :' }]
            }
          },
          {
            valueKey: 'instrumentType',
            type: 'autocomplete',
            label: "Type d'instrument",
            noOptionsText: "Veuillez entrer un type d'instrument",
            valueSetId: metas.instrumentType.valueSetId,
            valueSetData: metas.instrumentType.valueSetData,
            buildInfo: {
              fhirKey: {
                id: HOSPIT_LINK_IDS.instrumentType,
                type: 'valueCoding'
              },
              chipDisplayMethodExtraArgs: [{ type: 'string', value: "Type d'instrument :" }]
            }
          },
          {
            valueKey: 'cSectionModality',
            type: 'autocomplete',
            label: 'Modalités de la césarienne',
            noOptionsText: 'Veuillez entrer une modalité de la césarienne',
            valueSetId: metas.cSectionModality.valueSetId,
            valueSetData: metas.cSectionModality.valueSetData,
            buildInfo: {
              fhirKey: {
                id: HOSPIT_LINK_IDS.cSectionModality,
                type: 'valueCoding'
              },
              chipDisplayMethodExtraArgs: [{ type: 'string', value: 'Modalités de la césarienne :' }]
            }
          },
          {
            valueKey: 'presentationAtDelivery',
            type: 'autocomplete',
            label: "Présentation à l'accouchement",
            noOptionsText: "Veuillez entrer une présentation à l'accouchement",
            valueSetId: metas.presentationAtDelivery.valueSetId,
            valueSetData: metas.presentationAtDelivery.valueSetData,
            buildInfo: {
              fhirKey: {
                id: HOSPIT_LINK_IDS.presentationAtDelivery,
                type: 'valueCoding'
              },
              chipDisplayMethodExtraArgs: [{ type: 'string', value: "Présentation à l'accouchement :" }]
            }
          },
          {
            valueKey: 'birthMensurationsGrams',
            type: 'numberAndComparator',
            label: 'Mensurations naissance - Poids (g)',
            buildInfo: {
              fhirKey: {
                id: 'F_MATER_005033',
                type: 'valueInteger'
              },
              chipDisplayMethodExtraArgs: [{ type: 'string', value: 'Mensurations naissance - Poids (g) :' }]
            }
          },
          {
            valueKey: 'birthMensurationsPercentil',
            type: 'numberAndComparator',
            floatValues: true,
            label: 'Mensurations naissance - Poids (percentile)',
            buildInfo: {
              fhirKey: {
                id: 'F_MATER_005034',
                type: 'valueDecimal'
              },
              chipDisplayMethodExtraArgs: [{ type: 'string', value: 'Mensurations naissance - Poids (percentile) :' }]
            }
          },
          {
            valueKey: 'apgar1',
            type: 'numberAndComparator',
            label: 'Score Apgar - 1 min',
            buildInfo: {
              fhirKey: {
                id: 'F_MATER_005051',
                type: 'valueInteger'
              },
              chipDisplayMethodExtraArgs: [{ type: 'string', value: 'Score Apgar - 1 min :' }]
            }
          },
          {
            valueKey: 'apgar3',
            type: 'numberAndComparator',
            label: 'Score Apgar - 3 min',
            buildInfo: {
              fhirKey: {
                id: 'F_MATER_005052',
                type: 'valueInteger'
              },
              chipDisplayMethodExtraArgs: [{ type: 'string', value: 'Score Apgar - 3 min :' }]
            }
          },
          {
            valueKey: 'apgar5',
            type: 'numberAndComparator',
            label: 'Score Apgar - 5 min',
            buildInfo: {
              fhirKey: {
                id: 'F_MATER_005053',
                type: 'valueInteger'
              },
              chipDisplayMethodExtraArgs: [{ type: 'string', value: 'Score Apgar - 5 min :' }]
            }
          },
          {
            valueKey: 'apgar10',
            type: 'numberAndComparator',
            label: 'Score Apgar - 10 min',
            buildInfo: {
              fhirKey: {
                id: 'F_MATER_005054',
                type: 'valueInteger'
              },
              chipDisplayMethodExtraArgs: [{ type: 'string', value: 'Score Apgar - 10 min :' }]
            }
          },
          {
            valueKey: 'arterialPhCord',
            type: 'numberAndComparator',
            floatValues: true,
            label: 'pH artériel au cordon',
            buildInfo: {
              fhirKey: {
                id: 'F_MATER_005060',
                type: 'valueDecimal'
              },
              chipDisplayMethodExtraArgs: [{ type: 'string', value: 'pH artériel au cordon :' }]
            }
          },
          {
            valueKey: 'arterialCordLactates',
            type: 'numberAndComparator',
            floatValues: true,
            label: 'Lactate artériel au cordon (mmol/L)',
            buildInfo: {
              fhirKey: {
                id: 'F_MATER_005061',
                type: 'valueDecimal'
              },
              chipDisplayMethodExtraArgs: [{ type: 'string', value: 'Lactate artériel au cordon (mmol/L) :' }]
            }
          },
          {
            valueKey: 'birthStatus',
            type: 'autocomplete',
            label: 'Statut vital à la naissance',
            noOptionsText: 'Veuillez entrer un statut vital à la naissance',
            valueSetId: metas.birthStatus.valueSetId,
            valueSetData: metas.birthStatus.valueSetData,
            buildInfo: {
              fhirKey: {
                id: HOSPIT_LINK_IDS.birthStatus,
                type: 'valueCoding'
              },
              chipDisplayMethodExtraArgs: [{ type: 'string', value: 'Statut vital à la naissance :' }]
            }
          },
          {
            valueKey: 'postpartumHemorrhage',
            type: 'autocomplete',
            label: 'Hémorragie du post-partum',
            noOptionsText: 'Veuillez entrer "oui" ou "non"',
            valueSetId: metas.postpartumHemorrhage.valueSetId,
            valueSetData: metas.postpartumHemorrhage.valueSetData,
            buildInfo: {
              fhirKey: {
                id: HOSPIT_LINK_IDS.postpartumHemorrhage,
                type: 'valueCoding'
              },
              chipDisplayMethodExtraArgs: [{ type: 'string', value: 'Hémorragie du post-partum :' }]
            }
          },
          {
            valueKey: 'conditionPerineum',
            type: 'autocomplete',
            label: 'État du périnée',
            noOptionsText: 'Veuillez entrer un état du périnée',
            valueSetId: metas.conditionPerineum.valueSetId,
            valueSetData: metas.conditionPerineum.valueSetData,
            buildInfo: {
              fhirKey: {
                id: HOSPIT_LINK_IDS.conditionPerineum,
                type: 'valueCoding'
              },
              chipDisplayMethodExtraArgs: [{ type: 'string', value: 'État du périnée :' }]
            }
          },
          {
            valueKey: 'exitPlaceType',
            type: 'autocomplete',
            label: 'Type de lieu de sortie',
            noOptionsText: 'Veuillez entrer un type de lieu de sortie',
            valueSetId: metas.exitPlaceType.valueSetId,
            valueSetData: metas.exitPlaceType.valueSetData,
            buildInfo: {
              fhirKey: {
                id: HOSPIT_LINK_IDS.exitPlaceType,
                type: 'valueCoding'
              },
              chipDisplayMethodExtraArgs: [{ type: 'string', value: 'Type de lieu de sortie :' }]
            }
          }
        ]
      },
      {
        title: 'SUITES DE COUCHES',
        defaulCollapsed: true,
        items: [
          {
            valueKey: 'feedingType',
            type: 'autocomplete',
            label: "Type d'allaitement",
            noOptionsText: "Veuillez entrer un type d'allaitement",
            valueSetId: metas.feedingType.valueSetId,
            valueSetData: metas.feedingType.valueSetData,
            buildInfo: {
              fhirKey: {
                id: HOSPIT_LINK_IDS.feedingType,
                type: 'valueCoding'
              },
              chipDisplayMethodExtraArgs: [{ type: 'string', value: "Type d'allaitement :" }]
            }
          },
          {
            valueKey: 'complication',
            type: 'autocomplete',
            label: 'Aucune complication',
            noOptionsText: 'Veuillez entrer "oui" ou "non"',
            valueSetId: metas.complication.valueSetId,
            valueSetData: metas.complication.valueSetData,
            buildInfo: {
              fhirKey: {
                id: HOSPIT_LINK_IDS.complication,
                type: 'valueBoolean'
              },
              chipDisplayMethodExtraArgs: [{ type: 'string', value: 'Aucune complication :' }]
            }
          }
        ]
      },
      {
        title: 'SORTIE',
        defaulCollapsed: true,
        items: [
          {
            valueKey: 'exitFeedingMode',
            type: 'autocomplete',
            label: "Mode d'allaitement à la sortie",
            noOptionsText: "Veuillez entrer un mode d'allaitement à la sortie",
            valueSetId: metas.exitFeedingMode.valueSetId,
            valueSetData: metas.exitFeedingMode.valueSetData,
            buildInfo: {
              fhirKey: {
                id: HOSPIT_LINK_IDS.exitFeedingMode,
                type: 'valueCoding'
              },
              chipDisplayMethodExtraArgs: [{ type: 'string', value: "Mode d'allaitement à la sortie :" }]
            }
          },
          {
            valueKey: 'exitDiagnostic',
            type: 'autocomplete',
            label: 'Diagnostic de sortie',
            noOptionsText: 'Veuillez entrer un diagnostic de sortie',
            valueSetId: metas.exitDiagnostic.valueSetId,
            valueSetData: metas.exitDiagnostic.valueSetData,
            buildInfo: {
              fhirKey: {
                id: HOSPIT_LINK_IDS.exitDiagnostic,
                type: 'valueCoding'
              },
              chipDisplayMethodExtraArgs: [{ type: 'string', value: 'Diagnostic de sortie :' }]
            }
          }
        ]
      }
    ]
  }
}
