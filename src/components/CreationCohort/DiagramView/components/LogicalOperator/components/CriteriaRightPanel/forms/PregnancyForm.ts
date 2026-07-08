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
import { configValueSetFallback, getFormItemTitle, getFormItemValueSetMeta } from './questionnaireFormMeta'
import { PREGNANCY_LINK_IDS } from 'constants/maternityLinkIds'

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

export const form: () => CriteriaForm<PregnancyDataType> = () => {
  const pregnancyModeMeta = getFormItemValueSetMeta(
    FormNames.PREGNANCY,
    PREGNANCY_LINK_IDS.pregnancyMode,
    configValueSetFallback('pregnancyMode')
  )
  const maternalRisksMeta = getFormItemValueSetMeta(
    FormNames.PREGNANCY,
    PREGNANCY_LINK_IDS.maternalRisks,
    configValueSetFallback('maternalRisks')
  )
  const risksRelatedToObstetricHistoryMeta = getFormItemValueSetMeta(
    FormNames.PREGNANCY,
    PREGNANCY_LINK_IDS.risksRelatedToObstetricHistory,
    configValueSetFallback('risksRelatedToObstetricHistory')
  )
  const ultrasoundMonitoringMeta = getFormItemValueSetMeta(
    FormNames.PREGNANCY,
    PREGNANCY_LINK_IDS.ultrasoundMonitoring,
    configValueSetFallback('ultrasoundMonitoring')
  )
  const corticotherapieMeta = getFormItemValueSetMeta(
    FormNames.PREGNANCY,
    PREGNANCY_LINK_IDS.corticotherapie,
    configValueSetFallback('booleanFields')
  )
  const risksOrComplicationsOfPregnancyMeta = getFormItemValueSetMeta(
    FormNames.PREGNANCY,
    PREGNANCY_LINK_IDS.risksOrComplicationsOfPregnancy,
    configValueSetFallback('risksOrComplicationsOfPregnancy')
  )
  const prenatalDiagnosisMeta = getFormItemValueSetMeta(
    FormNames.PREGNANCY,
    PREGNANCY_LINK_IDS.prenatalDiagnosis,
    configValueSetFallback('booleanFields')
  )

  return {
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
                id: PREGNANCY_LINK_IDS.pregnancyStartDate,
                type: 'valueDate'
              },
              chipDisplayMethodExtraArgs: [{ type: 'string', value: 'Date de début de grossesse : ' }]
            }
          },
          {
            valueKey: 'pregnancyMode',
            type: 'autocomplete',
            label: getFormItemTitle(
              FormNames.PREGNANCY,
              PREGNANCY_LINK_IDS.pregnancyMode,
              "Mode d'obtention de la grossesse"
            ),
            valueSetId: pregnancyModeMeta.valueSetId,
            valueSetData: pregnancyModeMeta.valueSetData,
            noOptionsText: "Veuillez entrer un mode d'obtention de la grossesse",
            buildInfo: {
              fhirKey: {
                id: PREGNANCY_LINK_IDS.pregnancyMode,
                type: 'valueCoding'
              },
              chipDisplayMethodExtraArgs: [{ type: 'string', value: 'Mode de grossesse : ' }]
            }
          },
          {
            valueKey: 'foetus',
            type: 'numberAndComparator',
            label: getFormItemTitle(FormNames.PREGNANCY, PREGNANCY_LINK_IDS.foetus, 'Nombre de fœtus'),
            buildInfo: {
              fhirKey: {
                id: PREGNANCY_LINK_IDS.foetus,
                type: 'valueInteger'
              },
              chipDisplayMethodExtraArgs: [{ type: 'string', value: 'Nombre de fœtus' }]
            }
          },
          {
            valueKey: 'parity',
            type: 'numberAndComparator',
            label: getFormItemTitle(FormNames.PREGNANCY, PREGNANCY_LINK_IDS.parity, 'Parité'),
            buildInfo: {
              fhirKey: {
                id: PREGNANCY_LINK_IDS.parity,
                type: 'valueInteger'
              },
              chipDisplayMethodExtraArgs: [{ type: 'string', value: 'Parité' }]
            }
          },
          {
            valueKey: 'maternalRisks',
            type: 'autocomplete',
            extraLabel: () => 'Risques',
            label: getFormItemTitle(
              FormNames.PREGNANCY,
              PREGNANCY_LINK_IDS.maternalRisks,
              'Risques liés aux antécédents maternels'
            ),
            valueSetId: maternalRisksMeta.valueSetId,
            valueSetData: maternalRisksMeta.valueSetData,
            noOptionsText: 'Veuillez entrer un risque lié aux antécédents maternels',
            buildInfo: {
              fhirKey: {
                id: PREGNANCY_LINK_IDS.maternalRisks,
                type: 'valueCoding'
              },
              chipDisplayMethodExtraArgs: [{ type: 'string', value: 'Risques maternels :' }]
            }
          },
          {
            valueKey: 'maternalRisksPrecision',
            type: 'textWithCheck',
            label: getFormItemTitle(
              FormNames.PREGNANCY,
              PREGNANCY_LINK_IDS.maternalRisksPrecision,
              'Risques liés aux antécédents maternels - Précision autre'
            ),
            placeholder: 'Risques liés aux antécédents maternels - Précision autre',
            errorType: 'SEARCHINPUT_ERROR',
            buildInfo: {
              fhirKey: {
                id: PREGNANCY_LINK_IDS.maternalRisksPrecision,
                type: 'valueString'
              },
              chipDisplayMethodExtraArgs: [{ type: 'string', value: 'Précision sur les risques maternels :' }]
            }
          },
          {
            valueKey: 'risksRelatedToObstetricHistory',
            type: 'autocomplete',
            label: getFormItemTitle(
              FormNames.PREGNANCY,
              PREGNANCY_LINK_IDS.risksRelatedToObstetricHistory,
              'Risques liés aux antécédents obstétricaux'
            ),
            valueSetId: risksRelatedToObstetricHistoryMeta.valueSetId,
            valueSetData: risksRelatedToObstetricHistoryMeta.valueSetData,
            noOptionsText: 'Veuillez entrer un risque lié aux antécédents obstétricaux',
            buildInfo: {
              fhirKey: {
                id: PREGNANCY_LINK_IDS.risksRelatedToObstetricHistory,
                type: 'valueCoding'
              },
              chipDisplayMethodExtraArgs: [{ type: 'string', value: 'Risques liés aux antécédents obstétricaux :' }]
            }
          },
          {
            valueKey: 'risksRelatedToObstetricHistoryPrecision',
            type: 'textWithCheck',
            label: getFormItemTitle(
              FormNames.PREGNANCY,
              PREGNANCY_LINK_IDS.risksRelatedToObstetricHistoryPrecision,
              'Risques liés aux antécédents obstétricaux - précision autre'
            ),
            placeholder: 'Risques liés aux antécédents obstétricaux - Précision autre',
            errorType: 'SEARCHINPUT_ERROR',
            buildInfo: {
              fhirKey: {
                id: PREGNANCY_LINK_IDS.risksRelatedToObstetricHistoryPrecision,
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
            label: getFormItemTitle(
              FormNames.PREGNANCY,
              PREGNANCY_LINK_IDS.ultrasoundMonitoring,
              'Suivi échographique'
            ),
            extraLabel: () => 'Suivi échographique',
            valueSetId: ultrasoundMonitoringMeta.valueSetId,
            valueSetData: ultrasoundMonitoringMeta.valueSetData,
            noOptionsText: 'Veuillez entrer une valeur de suivi échographique',
            buildInfo: {
              fhirKey: {
                id: PREGNANCY_LINK_IDS.ultrasoundMonitoring,
                type: 'valueCoding'
              },
              chipDisplayMethodExtraArgs: [{ type: 'string', value: 'Suivi échographique :' }]
            }
          },
          {
            valueKey: 'corticotherapie',
            type: 'autocomplete',
            label: getFormItemTitle(
              FormNames.PREGNANCY,
              PREGNANCY_LINK_IDS.corticotherapie,
              'Corticothérapie pour maturation pulmonaire fœtale'
            ),
            extraLabel: () => 'Corticothéraphie pour maturation pulmonaire fœtale',
            valueSetId: corticotherapieMeta.valueSetId,
            valueSetData: corticotherapieMeta.valueSetData,
            noOptionsText: 'Veuillez entrer "oui" ou "non"',
            buildInfo: {
              fhirKey: {
                id: PREGNANCY_LINK_IDS.corticotherapie,
                type: 'valueBoolean'
              },
              chipDisplayMethodExtraArgs: [{ type: 'string', value: 'Corticothérapie :' }]
            }
          },
          {
            valueKey: 'risksOrComplicationsOfPregnancy',
            type: 'autocomplete',
            extraLabel: () => 'Risques',
            label: getFormItemTitle(
              FormNames.PREGNANCY,
              PREGNANCY_LINK_IDS.risksOrComplicationsOfPregnancy,
              'Risques ou complications de la grossesse'
            ),
            valueSetId: risksOrComplicationsOfPregnancyMeta.valueSetId,
            valueSetData: risksOrComplicationsOfPregnancyMeta.valueSetData,
            noOptionsText: 'Veuillez entrer un risque ou complication de la grossesse',
            buildInfo: {
              fhirKey: {
                id: PREGNANCY_LINK_IDS.risksOrComplicationsOfPregnancy,
                type: 'valueCoding'
              },
              chipDisplayMethodExtraArgs: [{ type: 'string', value: 'Risques ou complications de la grossesse :' }]
            }
          },
          {
            valueKey: 'risksOrComplicationsOfPregnancyPrecision',
            type: 'textWithCheck',
            label: getFormItemTitle(
              FormNames.PREGNANCY,
              PREGNANCY_LINK_IDS.risksOrComplicationsOfPregnancyPrecision,
              'Risques ou complications de la grossesse - Précision autre'
            ),
            placeholder: 'Risques ou complications de la grossesse - Précision autre',
            errorType: 'SEARCHINPUT_ERROR',
            buildInfo: {
              fhirKey: {
                id: PREGNANCY_LINK_IDS.risksOrComplicationsOfPregnancyPrecision,
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
            label: getFormItemTitle(
              FormNames.PREGNANCY,
              PREGNANCY_LINK_IDS.prenatalDiagnosis,
              'Grossesse suivie au diagnostic prénatal'
            ),
            extraLabel: () => 'Grossesse suivie au diagnostic prénatal',
            valueSetId: prenatalDiagnosisMeta.valueSetId,
            valueSetData: prenatalDiagnosisMeta.valueSetData,
            noOptionsText: 'Veuillez entrer "oui" ou "non"',
            buildInfo: {
              fhirKey: {
                id: PREGNANCY_LINK_IDS.prenatalDiagnosis,
                type: 'valueBoolean'
              }
            },
            chipDisplayMethodExtraArgs: [{ type: 'string', value: 'Diagnostic prénatal :' }]
          }
        ]
      }
    ]
  }
}
