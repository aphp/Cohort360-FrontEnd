import { EncounterParamsKeys, Comparators, CriteriaType, ResourceType } from 'types/requestCriterias'
import {
  CommonCriteriaData,
  CriteriaForm,
  NewDurationRangeType,
  WithEncounterDateDataType,
  WithEncounterStatusDataType,
  WithOccurenceCriteriaDataType
} from '../CriteriaForm/types'
import { SourceType } from 'types/scope'
import { getConfig } from 'config'
import { hasSearchParam } from 'services/aphp/serviceFhirConfig'

export type EncounterDataType = CommonCriteriaData &
  WithOccurenceCriteriaDataType &
  WithEncounterDateDataType &
  WithEncounterStatusDataType & {
    type: CriteriaType.ENCOUNTER
    age: NewDurationRangeType | null
    duration: NewDurationRangeType | null
    admissionMode: string[] | null
    entryMode: string[] | null
    exitMode: string[] | null
    priseEnChargeType: string[] | null
    typeDeSejour: string[] | null
    reason: string[] | null
    destination: string[] | null
    provenance: string[] | null
    admission: string[] | null
  }

export const form: () => CriteriaForm<EncounterDataType> = () => ({
  label: 'de prise en charge',
  title: 'Prise en charge',
  initialData: {
    type: CriteriaType.ENCOUNTER,
    title: 'Critère de prise en charge',
    isInclusive: true,
    occurrence: { value: 1, comparator: Comparators.GREATER_OR_EQUAL },
    encounterService: null,
    startOccurrence: null,
    encounterStartDate: null,
    encounterEndDate: null,
    encounterStatus: [],
    age: null,
    duration: null,
    admissionMode: null,
    entryMode: null,
    exitMode: null,
    priseEnChargeType: null,
    typeDeSejour: null,
    reason: null,
    destination: null,
    provenance: null,
    admission: null
  },
  infoAlert: [
    'Tous les éléments des champs multiples sont liés par une contrainte OU',
    "Le critère de prise en charge se base sur tous les séjours et passages. Les consultations étant des prises en charge non clôturées, elles n'ont pas de date de fin. Indiquer une durée ou une date de fin de prise en charge exclue ainsi les consultations."
  ],
  buildInfo: {
    type: { [ResourceType.ENCOUNTER]: CriteriaType.ENCOUNTER },
    defaultFilter: getConfig().core.fhir.filterActive ? 'subject.active=true' : ''
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
          sourceType: SourceType.CIM10, // TODO add a new source type for encounter
          buildInfo: {
            fhirKey: EncounterParamsKeys.SERVICE_PROVIDER
          }
        },
        {
          valueKey: 'age',
          type: 'durationRange',
          extraLabel: () => 'Âge au début de la prise en charge',
          extraInfo: "La valeur par défaut sera prise en compte si le sélecteur d'âge n'a pas été modifié.",
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          displayCondition: (data, context) => {
            return hasSearchParam(ResourceType.ENCOUNTER, EncounterParamsKeys.MIN_BIRTHDATE_DAY)
          },
          buildInfo: {
            fhirKey: {
              main: EncounterParamsKeys.MIN_BIRTHDATE_DAY,
              deid: EncounterParamsKeys.MIN_BIRTHDATE_MONTH
            },
            chipDisplayMethodExtraArgs: [{ type: 'string', value: 'Âge : ' }]
          }
        },
        {
          valueKey: 'duration',
          type: 'durationRange',
          extraLabel: () => 'Durée de la prise en charge',
          unit: 'Durée',
          includeDays: true,
          buildInfo: {
            fhirKey: EncounterParamsKeys.DURATION,
            chipDisplayMethodExtraArgs: [{ type: 'string', value: 'Prise en charge : ' }]
          }
        },
        {
          valueKey: 'encounterStartDate',
          type: 'calendarRange',
          label: 'Début de prise en charge',
          extraLabel: () => 'Date de prise en charge',
          labelAltStyle: true,
          withOptionIncludeNull: true,
          errorType: 'INCOHERENT_VALUE_ERROR',
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          displayCondition: (data, context) => {
            return hasSearchParam(ResourceType.ENCOUNTER, EncounterParamsKeys.START_DATE)
          },
          buildInfo: {
            fhirKey: EncounterParamsKeys.START_DATE,
            chipDisplayMethodExtraArgs: [{ type: 'string', value: 'Date de début de prise en charge' }]
          }
        },
        {
          valueKey: 'encounterEndDate',
          type: 'calendarRange',
          label: 'Fin de prise en charge',
          info: 'Ne concerne pas les consultations.',
          labelAltStyle: true,
          withOptionIncludeNull: true,
          errorType: 'INCOHERENT_VALUE_ERROR',
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          displayCondition: (data, context) => {
            return hasSearchParam(ResourceType.ENCOUNTER, EncounterParamsKeys.END_DATE)
          },
          buildInfo: {
            fhirKey: EncounterParamsKeys.END_DATE,
            chipDisplayMethodExtraArgs: [{ type: 'string', value: 'Date de fin de prise en charge' }]
          }
        }
      ]
    },
    {
      title: 'Général',
      defaulCollapsed: true,
      items: [
        {
          valueKey: 'priseEnChargeType',
          type: 'autocomplete',
          label: 'Type de prise en charge',
          valueSetId: getConfig().core.valueSets.encounterVisitType.url,
          noOptionsText: 'Veuillez entrer un type de prise en charge',
          buildInfo: {
            fhirKey: EncounterParamsKeys.PRISENCHARGETYPE
          }
        },
        {
          valueKey: 'typeDeSejour',
          type: 'autocomplete',
          label: 'Type séjour',
          valueSetId: getConfig().core.valueSets.encounterSejourType.url,
          noOptionsText: 'Veuillez entrer un type de séjour',
          buildInfo: {
            fhirKey: EncounterParamsKeys.TYPEDESEJOUR
          }
        },
        {
          valueKey: 'encounterStatus',
          type: 'autocomplete',
          label: 'Statut de la visite',
          valueSetId: getConfig().core.valueSets.encounterStatus.url,
          noOptionsText: 'Veuillez entrer un statut de visite',
          buildInfo: {
            fhirKey: EncounterParamsKeys.STATUS,
            chipDisplayMethodExtraArgs: [{ type: 'string', value: 'Statut de la visite :' }]
          }
        }
      ]
    },
    {
      title: 'Admission',
      defaulCollapsed: true,
      items: [
        {
          valueKey: 'admissionMode',
          type: 'autocomplete',
          label: 'Motif Admission',
          valueSetId: getConfig().core.valueSets.encounterAdmissionMode.url,
          noOptionsText: "Veuillez entrer un motif d'admission",
          buildInfo: {
            fhirKey: EncounterParamsKeys.ADMISSIONMODE
          }
        },
        {
          valueKey: 'admission',
          type: 'autocomplete',
          label: 'Type Admission',
          valueSetId: getConfig().core.valueSets.encounterAdmission.url,
          noOptionsText: "Veuillez entrer un type d'admission",
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          displayCondition: (data, context) => {
            return hasSearchParam(ResourceType.ENCOUNTER, EncounterParamsKeys.ADMISSION)
          },
          buildInfo: {
            fhirKey: EncounterParamsKeys.ADMISSION
          }
        }
      ]
    },
    {
      title: 'Entrée / Sortie',
      defaulCollapsed: true,
      items: [
        {
          valueKey: 'entryMode',
          type: 'autocomplete',
          label: 'Mode entrée',
          valueSetId: getConfig().core.valueSets.encounterEntryMode.url,
          noOptionsText: "Veuillez entrer un mode d'entrée",
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          displayCondition: (data, context) => {
            return hasSearchParam(ResourceType.ENCOUNTER, EncounterParamsKeys.ENTRYMODE)
          },
          buildInfo: {
            fhirKey: EncounterParamsKeys.ENTRYMODE
          }
        },
        {
          valueKey: 'exitMode',
          type: 'autocomplete',
          label: 'Mode sortie',
          valueSetId: getConfig().core.valueSets.encounterExitMode.url,
          noOptionsText: 'Veuillez entrer un mode de sortie',
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          displayCondition: (data, context) => {
            return hasSearchParam(ResourceType.ENCOUNTER, EncounterParamsKeys.EXITMODE)
          },
          buildInfo: {
            fhirKey: EncounterParamsKeys.EXITMODE
          }
        },
        {
          valueKey: 'reason',
          type: 'autocomplete',
          label: 'Type sortie',
          valueSetId: getConfig().core.valueSets.encounterExitType.url,
          noOptionsText: 'Veuillez entrer un type de sortie',
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          displayCondition: (data, context) => {
            return hasSearchParam(ResourceType.ENCOUNTER, EncounterParamsKeys.REASON)
          },
          buildInfo: {
            fhirKey: EncounterParamsKeys.REASON
          }
        }
      ]
    },
    {
      title: 'Destination / Provenance',
      defaulCollapsed: true,
      items: [
        {
          valueKey: 'destination',
          type: 'autocomplete',
          label: 'Destination',
          valueSetId: getConfig().core.valueSets.encounterDestination.url,
          noOptionsText: 'Veuillez entrer une destination',
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          displayCondition: (data, context) => {
            return hasSearchParam(ResourceType.ENCOUNTER, EncounterParamsKeys.DESTINATION)
          },
          buildInfo: {
            fhirKey: EncounterParamsKeys.DESTINATION
          }
        },
        {
          valueKey: 'provenance',
          type: 'autocomplete',
          label: 'Provenance',
          valueSetId: getConfig().core.valueSets.encounterProvenance.url,
          noOptionsText: 'Veuillez entrer une provenance',
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          displayCondition: (data, context) => {
            return hasSearchParam(ResourceType.ENCOUNTER, EncounterParamsKeys.PROVENANCE)
          },
          buildInfo: {
            fhirKey: EncounterParamsKeys.PROVENANCE
          }
        }
      ]
    }
  ]
})
