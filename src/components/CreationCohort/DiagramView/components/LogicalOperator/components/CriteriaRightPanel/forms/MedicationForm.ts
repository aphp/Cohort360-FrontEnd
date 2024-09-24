import {
  AdministrationParamsKeys,
  PrescriptionParamsKeys,
  Comparators,
  CriteriaType,
  ResourceType
} from 'types/requestCriterias'
import {
  CommonCriteriaData,
  CriteriaForm,
  NewDurationRangeType,
  WithEncounterDateDataType,
  WithEncounterStatusDataType,
  WithOccurenceCriteriaDataType
} from '../CriteriaForm/types'
import { LabelObject } from 'types/searchCriterias'
import { SourceType } from 'types/scope'
import { getConfig } from 'config'

export type MedicationDataType = CommonCriteriaData &
  WithOccurenceCriteriaDataType &
  WithEncounterDateDataType &
  WithEncounterStatusDataType & {
    code: LabelObject[] | null
    administration: LabelObject[] | null
    type: CriteriaType.MEDICATION_REQUEST | CriteriaType.MEDICATION_ADMINISTRATION
    prescriptionType: LabelObject[] | null
    endOccurrence: NewDurationRangeType | null
  }

export const form: () => CriteriaForm<MedicationDataType> = () => ({
  label: 'Médicaments',
  initialData: {
    type: CriteriaType.MEDICATION_REQUEST,
    title: 'Critère de médicament',
    isInclusive: true,
    occurrence: { value: 1, comparator: Comparators.GREATER_OR_EQUAL },
    encounterService: null,
    startOccurrence: null,
    encounterStartDate: null,
    encounterEndDate: null,
    encounterStatus: [],
    code: null,
    administration: null,
    prescriptionType: null,
    endOccurrence: null
  },
  errorMessages: {
    INCOHERENT_VALUE_ERROR: 'La valeur minimale ne peut pas être supérieure à la valeur maximale.',
    INVALID_VALUE_ERROR: 'Veuillez entrer un nombre valide.',
    MISSING_VALUE_ERROR: 'Veuillez entrer 2 valeurs avec ce comparateur.',
    ADVANCED_INPUTS_ERROR: 'Erreur dans les options avancées.',
    NO_ERROR: ''
  },
  buildInfo: {
    criteriaType: [CriteriaType.MEDICATION_ADMINISTRATION, CriteriaType.MEDICATION_REQUEST],
    resourceType: [ResourceType.MEDICATION_ADMINISTRATION, ResourceType.MEDICATION_REQUEST],
    defaultFilter: 'subject.active=true'
  },
  itemSections: [
    {
      items: [
        {
          valueKey: 'occurrence',
          type: 'numberAndComparator',
          label: 'Occurrence',
          buildInfo: {
            chipDisplayMethodExtraArgs: [{ type: 'reference', value: "Nombre d'occurences" }]
          }
        },
        {
          valueKey: 'type',
          type: 'radioChoice',
          label: 'Type de médication',
          choices: [
            { id: CriteriaType.MEDICATION_REQUEST, label: 'Prescription' },
            { id: CriteriaType.MEDICATION_ADMINISTRATION, label: 'Administration' }
          ],
          buildInfo: {
            chipDisplayMethod: 'altArgs',
            chipDisplayMethodExtraArgs: [
              { type: 'method', value: 'raw' },
              { type: 'reference', value: 'type' },
              { type: 'string', value: CriteriaType.MEDICATION_REQUEST },
              { type: 'string', value: 'Prescription' },
              { type: 'string', value: 'Administration' }
            ]
          }
        },
        {
          valueKey: 'code',
          type: 'codeSearch',
          label: 'Code(s) sélectionné(s)',
          noOptionsText: 'Veuillez entrer un code de médicament',
          valueSetIds: [
            getConfig().features.medication.valueSets.medicationAtc.url,
            getConfig().features.medication.valueSets.medicationUcd.url
          ],
          buildInfo: {
            fhirKey: PrescriptionParamsKeys.CODE,
            buildMethodExtraArgs: [
              { type: 'string', value: getConfig().features.medication.valueSets.medicationAtc.url },
              { type: 'boolean', value: true }
            ]
          }
        },
        {
          valueKey: 'prescriptionType',
          type: 'autocomplete',
          label: 'Type de prescription',
          valueSetId: getConfig().features.medication.valueSets.medicationPrescriptionTypes.url,
          noOptionsText: 'Veuillez entrer un type de prescription',
          displayCondition: (data) => data.type === CriteriaType.MEDICATION_REQUEST,
          buildInfo: {
            fhirKey: PrescriptionParamsKeys.PRESCRIPTION_TYPES,
            buildMethodExtraArgs: [
              { type: 'method', value: 'buildLabelObject' },
              { type: 'reference', value: 'type' },
              { type: 'string', value: ResourceType.MEDICATION_ADMINISTRATION }
            ],
            buildMethod: 'skipIf'
          }
        },
        {
          valueKey: 'administration',
          type: 'autocomplete',
          label: "Voie d'administration",
          valueSetId: getConfig().features.medication.valueSets.medicationAdministrations.url,
          noOptionsText: "Veuillez entrer une voie d'administration",
          buildInfo: {
            fhirKey: {
              main: PrescriptionParamsKeys.PRESCRIPTION_ROUTES,
              alt: AdministrationParamsKeys.ADMINISTRATION_ROUTES,
              value1: { type: 'reference', value: 'type' },
              value2: { type: 'string', value: ResourceType.MEDICATION_REQUEST }
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
            fhirKey: {
              main: PrescriptionParamsKeys.ENCOUNTER_STATUS,
              alt: AdministrationParamsKeys.ENCOUNTER_STATUS,
              value1: { type: 'reference', value: 'type' },
              value2: { type: 'string', value: ResourceType.MEDICATION_REQUEST }
            },
            chipDisplayMethodExtraArgs: [{ type: 'string', value: 'Statut de la visite associée' }]
          }
        }
      ]
    },
    {
      title: 'Options avancées',
      defaulCollapsed: true,
      items: [
        {
          valueKey: 'encounterService',
          label: 'Unité exécutrice',
          type: 'executiveUnit',
          sourceType: SourceType.MEDICATION,
          buildInfo: {
            fhirKey: {
              main: PrescriptionParamsKeys.EXECUTIVE_UNITS,
              alt: AdministrationParamsKeys.EXECUTIVE_UNITS,
              value1: { type: 'reference', value: 'type' },
              value2: { type: 'string', value: ResourceType.MEDICATION_REQUEST }
            }
          }
        },
        {
          valueKey: 'encounterStartDate',
          type: 'calendarRange',
          errorType: 'ADVANCED_INPUTS_ERROR',
          label: 'Début de prise en charge',
          labelAltStyle: true,
          extraLabel: () => 'Prise en charge',
          withOptionIncludeNull: true,
          buildInfo: {
            fhirKey: {
              main: 'encounter.period-start',
              alt: 'context.period-start',
              value1: { type: 'reference', value: 'type' },
              value2: { type: 'string', value: ResourceType.MEDICATION_REQUEST }
            },
            chipDisplayMethodExtraArgs: [{ type: 'string', value: 'Date de début de prise en charge' }]
          }
        },
        {
          valueKey: 'encounterEndDate',
          type: 'calendarRange',
          label: 'Fin de prise en charge',
          labelAltStyle: true,
          errorType: 'ADVANCED_INPUTS_ERROR',
          withOptionIncludeNull: true,
          buildInfo: {
            fhirKey: {
              main: 'encounter.period-end',
              alt: 'context.period-end',
              value1: { type: 'reference', value: 'type' },
              value2: { type: 'string', value: ResourceType.MEDICATION_REQUEST }
            },
            chipDisplayMethodExtraArgs: [{ type: 'string', value: 'Date de fin de prise en charge' }]
          }
        },
        {
          valueKey: 'startOccurrence',
          type: 'calendarRange',
          errorType: 'ADVANCED_INPUTS_ERROR',
          extraLabel: () => 'Date de classement en GHM',
          buildInfo: {
            fhirKey: {
              main: PrescriptionParamsKeys.DATE,
              alt: AdministrationParamsKeys.DATE,
              value1: { type: 'reference', value: 'type' },
              value2: { type: 'string', value: ResourceType.MEDICATION_REQUEST }
            },
            chipDisplayMethod: 'altArgs',
            chipDisplayMethodExtraArgs: [
              { type: 'method', value: 'calendarRange' },
              { type: 'reference', value: 'type' },
              { type: 'string', value: ResourceType.MEDICATION_REQUEST },
              { type: 'string', value: 'Date de début de prescription' },
              { type: 'string', value: "Date de début d'administration" }
            ]
          }
        },
        {
          valueKey: 'endOccurrence',
          type: 'calendarRange',
          errorType: 'ADVANCED_INPUTS_ERROR',
          extraLabel: () => 'Date de classement en GHM',
          displayCondition: (data) => data.type === CriteriaType.MEDICATION_REQUEST,
          buildInfo: {
            fhirKey: PrescriptionParamsKeys.END_DATE,
            chipDisplayMethodExtraArgs: [{ type: 'string', value: 'Date de fin de prescription' }]
          }
        }
      ]
    }
  ]
})
