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

export type PregnancyDataType = CommonCriteriaData &
  WithOccurenceCriteriaDataType &
  WithEncounterStatusDataType & {
    type: CriteriaType.PREGNANCY
    pregnancyDate: NewDurationRangeType | null
    pregnancyMode: string[] | null
    foetus: NumberAndComparatorDataType
    parity: NumberAndComparatorDataType
    maternalRisks: string[] | null
    maternalRisksPrecision: string
    risksRelatedToObstetricHistory: string[] | null
    risksRelatedToObstetricHistoryPrecision: string
    risksOrComplicationsOfPregnancy: string[] | null
    risksOrComplicationsOfPregnancyPrecision: string
    corticotherapie: string[] | null
    prenatalDiagnosis: string[] | null
    ultrasoundMonitoring: string[] | null
  }

export const form: () => CriteriaForm<PregnancyDataType> = () => ({
  label: 'de Fiche de grossesse',
  title: 'Fiche de grossesse',
  initialData: {
    type: CriteriaType.PREGNANCY,
    title: 'Critère de Fiche de Grossesse',
    isInclusive: true,
    occurrence: { value: 1, comparator: Comparators.GREATER_OR_EQUAL },
    encounterService: null,
    startOccurrence: null,
    encounterStatus: [],
    pregnancyDate: null,
    pregnancyMode: null,
    foetus: { value: 0, comparator: Comparators.GREATER_OR_EQUAL },
    parity: { value: 0, comparator: Comparators.GREATER_OR_EQUAL },
    maternalRisks: null,
    maternalRisksPrecision: '',
    risksRelatedToObstetricHistory: null,
    risksRelatedToObstetricHistoryPrecision: '',
    risksOrComplicationsOfPregnancy: null,
    risksOrComplicationsOfPregnancyPrecision: '',
    corticotherapie: null,
    prenatalDiagnosis: null,
    ultrasoundMonitoring: null
  },
  infoAlert: ['Tous les éléments des champs multiples sont liés par une contrainte OU'],
  buildInfo: {
    type: { [ResourceType.QUESTIONNAIRE_RESPONSE]: CriteriaType.PREGNANCY },
    defaultFilter:
      (getConfig().core.fhir.filterActive ? 'subject.active=true&' : '') +
      `questionnaire.name=${FormNames.PREGNANCY}&status=in-progress,completed`,
    subType: FormNames.PREGNANCY
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
          label: 'Service de rencontre',
          sourceType: SourceType.MATERNITY,
          buildInfo: {
            fhirKey: {
              id: QuestionnaireResponseParamsKeys.EXECUTIVE_UNITS,
              type: 'valueCoding'
            }
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
      title: 'Renseignements sur la grossesse',
      items: [
        {
          valueKey: 'pregnancyDate',
          type: 'calendarRange',
          extraLabel: () => 'Date de début de grossesse',
          errorType: 'INCOHERENT_VALUE_ERROR',
          buildInfo: {
            fhirKey: {
              id: 'F_MATER_001010',
              type: 'valueDate'
            },
            chipDisplayMethodExtraArgs: [{ type: 'string', value: 'Date de début de grossesse : ' }]
          }
        },
        {
          valueKey: 'pregnancyMode',
          type: 'autocomplete',
          label: "Mode d'obtention de la grossesse",
          valueSetId: getConfig().features.questionnaires.valueSets.pregnancyMode.url,
          noOptionsText: "Veuillez entrer un mode d'obtention de la grossesse",
          buildInfo: {
            fhirKey: {
              id: 'F_MATER_001014',
              type: 'valueCoding'
            },
            chipDisplayMethodExtraArgs: [{ type: 'string', value: 'Mode de grossesse : ' }]
          }
        },
        {
          valueKey: 'foetus',
          type: 'numberAndComparator',
          label: 'Nombre de fœtus',
          buildInfo: {
            fhirKey: {
              id: 'F_MATER_001017',
              type: 'valueInteger'
            },
            chipDisplayMethodExtraArgs: [{ type: 'string', value: 'Nombre de fœtus' }]
          }
        },
        {
          valueKey: 'parity',
          type: 'numberAndComparator',
          label: 'Parité',
          buildInfo: {
            fhirKey: {
              id: 'F_MATER_001192',
              type: 'valueInteger'
            },
            chipDisplayMethodExtraArgs: [{ type: 'string', value: 'Parité' }]
          }
        },
        {
          valueKey: 'maternalRisks',
          type: 'autocomplete',
          extraLabel: () => 'Risques',
          label: 'Risques liés aux antécédents maternels',
          valueSetId: getConfig().features.questionnaires.valueSets.maternalRisks.url,
          noOptionsText: 'Veuillez entrer un risque lié aux antécédents maternels',
          buildInfo: {
            fhirKey: {
              id: 'F_MATER_001361',
              type: 'valueCoding'
            },
            chipDisplayMethodExtraArgs: [{ type: 'string', value: 'Risques maternels :' }]
          }
        },
        {
          valueKey: 'maternalRisksPrecision',
          type: 'textWithCheck',
          label: 'Risques liés aux antécédents maternels - Précision autre',
          placeholder: 'Risques liés aux antécédents maternels - Précision autre',
          errorType: 'SEARCHINPUT_ERROR',
          buildInfo: {
            fhirKey: {
              id: 'F_MATER_001362',
              type: 'valueString'
            },
            chipDisplayMethodExtraArgs: [{ type: 'string', value: 'Précision sur les risques maternels :' }]
          }
        },
        {
          valueKey: 'risksRelatedToObstetricHistory',
          type: 'autocomplete',
          label: 'Risques liés aux antécédents obstétricaux',
          valueSetId: getConfig().features.questionnaires.valueSets.risksRelatedToObstetricHistory.url,
          noOptionsText: 'Veuillez entrer un risque lié aux antécédents obstétricaux',
          buildInfo: {
            fhirKey: {
              id: 'F_MATER_001363',
              type: 'valueCoding'
            },
            chipDisplayMethodExtraArgs: [{ type: 'string', value: 'Risques liés aux antécédents obstétricaux :' }]
          }
        },
        {
          valueKey: 'risksRelatedToObstetricHistoryPrecision',
          type: 'textWithCheck',
          label: 'Risques liés aux antécédents obstétricaux - précision autre',
          placeholder: 'Risques liés aux antécédents obstétricaux - Précision autre',
          errorType: 'SEARCHINPUT_ERROR',
          buildInfo: {
            fhirKey: {
              id: 'F_MATER_001364',
              type: 'valueString'
            },
            chipDisplayMethodExtraArgs: [
              { type: 'string', value: 'Précision sur les risques liés aux antécédents obstétricaux :' }
            ]
          }
        }
      ]
    },
    {
      title: 'Suivi de grossesse',
      items: [
        {
          valueKey: 'ultrasoundMonitoring',
          type: 'autocomplete',
          label: 'Suivi échographique',
          extraLabel: () => 'Suivi échographique',
          valueSetId: getConfig().features.questionnaires.valueSets.booleanFields.url,
          valueSetData: getConfig().features.questionnaires.valueSets.booleanFields.data,
          noOptionsText: 'Veuillez entrer "oui" ou "non"',
          buildInfo: {
            fhirKey: {
              id: 'F_MATER_001552',
              type: 'valueBoolean'
            },
            chipDisplayMethodExtraArgs: [{ type: 'string', value: 'Suivi échographique :' }]
          }
        },
        {
          valueKey: 'corticotherapie',
          type: 'autocomplete',
          label: 'Corticothérapie pour maturation pulmonaire fœtale',
          extraLabel: () => 'Corticothéraphie pour maturation pulmonaire fœtale',
          valueSetId: getConfig().features.questionnaires.valueSets.booleanFields.url,
          valueSetData: getConfig().features.questionnaires.valueSets.booleanFields.data,
          noOptionsText: 'Veuillez entrer "oui" ou "non"',
          buildInfo: {
            fhirKey: {
              id: 'F_MATER_001597',
              type: 'valueBoolean'
            },
            chipDisplayMethodExtraArgs: [{ type: 'string', value: 'Corticothérapie :' }]
          }
        },
        {
          valueKey: 'risksOrComplicationsOfPregnancy',
          type: 'autocomplete',
          extraLabel: () => 'Risques',
          label: 'Risques ou complications de la grossesse',
          valueSetId: getConfig().features.questionnaires.valueSets.risksOrComplicationsOfPregnancy.url,
          noOptionsText: 'Veuillez entrer un risque ou complication de la grossesse',
          buildInfo: {
            fhirKey: {
              id: 'F_MATER_001631',
              type: 'valueCoding'
            },
            chipDisplayMethodExtraArgs: [{ type: 'string', value: 'Risques ou complications de la grossesse :' }]
          }
        },
        {
          valueKey: 'risksOrComplicationsOfPregnancyPrecision',
          type: 'textWithCheck',
          label: 'Risques ou complications de la grossesse - Précision autre',
          placeholder: 'Risques ou complications de la grossesse - Précision autre',
          errorType: 'SEARCHINPUT_ERROR',
          buildInfo: {
            fhirKey: {
              id: 'F_MATER_001632',
              type: 'valueString'
            },
            chipDisplayMethodExtraArgs: [
              { type: 'string', value: 'Précision sur les risques ou complications de la grossesse :' }
            ]
          }
        },
        {
          valueKey: 'prenatalDiagnosis',
          type: 'autocomplete',
          label: 'Grossesse suivie au diagnostic prénatal',
          extraLabel: () => 'Grossesse suivie au diagnostic prénatal',
          valueSetId: getConfig().features.questionnaires.valueSets.booleanFields.url,
          valueSetData: getConfig().features.questionnaires.valueSets.booleanFields.data,
          noOptionsText: 'Veuillez entrer "oui" ou "non"',
          buildInfo: {
            fhirKey: {
              id: 'F_MATER_001661',
              type: 'valueBoolean'
            }
          },
          chipDisplayMethodExtraArgs: [{ type: 'string', value: 'Diagnostic prénatal :' }]
        }
      ]
    }
  ]
})
