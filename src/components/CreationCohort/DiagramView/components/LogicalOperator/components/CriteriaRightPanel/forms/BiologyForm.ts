import { ObservationParamsKeys, Comparators, CriteriaType, ResourceType } from 'types/requestCriterias'
import {
  CommonCriteriaData,
  CriteriaForm,
  NumberAndComparatorDataType,
  WithEncounterDateDataType,
  WithEncounterStatusDataType,
  WithOccurenceCriteriaDataType
} from '../CriteriaForm/types'
import { LabelObject } from 'types/searchCriterias'
import { SourceType } from 'types/scope'
import { getConfig } from 'config'
import { BiologyStatus } from 'types'

export type ObservationDataType = CommonCriteriaData &
  WithOccurenceCriteriaDataType &
  WithEncounterDateDataType &
  WithEncounterStatusDataType & {
    type: CriteriaType.OBSERVATION
    code: LabelObject[] | null
    searchByValue: NumberAndComparatorDataType | null
  }

export const form: () => CriteriaForm<ObservationDataType> = () => ({
  label: 'Biologie',
  initialData: {
    id: undefined,
    type: CriteriaType.OBSERVATION,
    title: 'Critères de biologie',
    isInclusive: true,
    occurrence: { value: 1, comparator: Comparators.GREATER_OR_EQUAL },
    encounterService: null,
    startOccurrence: null,
    endOccurrence: null,
    encounterStartDate: null,
    encounterEndDate: null,
    encounterStatus: [],
    code: null,
    searchByValue: null
  },
  infoAlert: ['Tous les éléments des champs multiples sont liés par une contrainte OU'],
  warningAlert: [
    "Les mesures de biologie sont pour l'instant restreintes aux 3870 codes ANABIO correspondants aux analyses les plus utilisées au niveau national et à l'AP-HP. De plus, les résultats concernent uniquement les analyses quantitatives enregistrées sur GLIMS, qui ont été validées et mises à jour depuis mars 2020."
  ],
  errorMessages: {
    INCOHERENT_VALUE_ERROR: 'La valeur minimale ne peut pas être supérieure à la valeur maximale.',
    INVALID_VALUE_ERROR: 'Veuillez entrer un nombre valide.',
    MISSING_VALUE_ERROR: 'Veuillez entrer 2 valeurs avec ce comparateur.',
    ADVANCED_INPUTS_ERROR: 'Erreur dans les options avancées.',
    NO_ERROR: ''
  },
  buildInfo: {
    criteriaType: CriteriaType.OBSERVATION,
    resourceType: ResourceType.OBSERVATION,
    defaultFilter: `subject.active=true&${ObservationParamsKeys.VALIDATED_STATUS}=${BiologyStatus.VALIDATED}`
  },
  itemSections: [
    {
      items: [
        {
          valueKey: 'occurrence',
          type: 'numberAndComparator',
          label: "Nombre d'occurrences",
          buildInfo: {
            chipDisplayMethodExtraArgs: [{ type: 'string', value: "Nombre d'occurences" }]
          }
        },
        {
          valueKey: 'code',
          type: 'codeSearch',
          label: 'Codes de biologie',
          checkIsLeaf: true,
          valueSetIds: [
            getConfig().features.observation.valueSets.biologyHierarchyAnabio.url,
            getConfig().features.observation.valueSets.biologyHierarchyLoinc.url
          ],
          noOptionsText: 'Veuillez entrer un code de biologie',
          buildInfo: {
            fhirKey: ObservationParamsKeys.ANABIO_LOINC,
            buildMethodExtraArgs: [
              { type: 'string', value: getConfig().features.observation.valueSets.biologyHierarchyAnabio.url }
            ]
          }
        },
        {
          valueKey: 'searchByValue',
          type: 'numberAndComparator',
          label: 'Recherche par valeur',
          allowBetween: true,
          withHierarchyInfo: false,
          disableCondition: (data) => {
            const typedData = data as ObservationDataType
            return typedData.code?.length !== 1 || !typedData.code[0].isLeaf
          },
          buildInfo: {
            fhirKey: ObservationParamsKeys.VALUE,
            buildMethodExtraArgs: [{ type: 'string', value: 'le0,ge0' }],
            chipDisplayMethodExtraArgs: [{ type: 'string', value: 'Valeur' }]
          }
        },
        {
          valueKey: 'encounterStatus',
          type: 'autocomplete',
          label: 'Statut de la visite associée',
          valueSetId: getConfig().core.valueSets.encounterStatus.url,
          noOptionsText: 'Veuillez entrer un statut de visite associée',
          buildInfo: {
            fhirKey: ObservationParamsKeys.ENCOUNTER_STATUS,
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
          sourceType: SourceType.BIOLOGY,
          buildInfo: {
            fhirKey: ObservationParamsKeys.EXECUTIVE_UNITS
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
            fhirKey: 'encounter.period-start',
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
            fhirKey: 'encounter.period-end',
            chipDisplayMethodExtraArgs: [{ type: 'string', value: 'Date de fin de prise en charge' }]
          }
        },
        {
          valueKey: 'startOccurrence',
          type: 'calendarRange',
          errorType: 'ADVANCED_INPUTS_ERROR',
          extraLabel: () => "Date de l'examen",
          buildInfo: {
            fhirKey: ObservationParamsKeys.DATE,
            chipDisplayMethodExtraArgs: [{ type: 'string', value: "Date de l'examen" }]
          }
        }
      ]
    }
  ]
})
