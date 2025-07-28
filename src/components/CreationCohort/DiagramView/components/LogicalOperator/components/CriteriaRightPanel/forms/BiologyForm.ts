import { ObservationParamsKeys, Comparators, CriteriaType, ResourceType } from 'types/requestCriterias'
import {
  CommonCriteriaData,
  CriteriaForm,
  NumberAndComparatorDataType,
  WithEncounterDateDataType,
  WithEncounterStatusDataType,
  WithOccurenceCriteriaDataType
} from '../CriteriaForm/types'
import { SourceType } from 'types/scope'
import { getConfig } from 'config'
import { BiologyStatus } from 'types'
import { getValueSetsFromSystems } from 'utils/valueSets'
import { FhirItem } from 'types/valueSet'
import { Hierarchy } from 'types/hierarchy'

export type ObservationDataType = CommonCriteriaData &
  WithOccurenceCriteriaDataType &
  WithEncounterDateDataType &
  WithEncounterStatusDataType & {
    type: CriteriaType.OBSERVATION
    code: Hierarchy<FhirItem & { isLeaf?: boolean }>[] | null
    searchByValue: NumberAndComparatorDataType | null
    enableSearchByValue: boolean
  }

export const form: () => CriteriaForm<ObservationDataType> = () => ({
  label: 'de biologie',
  title: 'Biologie',
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
    searchByValue: null,
    enableSearchByValue: false
  },
  infoAlert: ['Tous les éléments des champs multiples sont liés par une contrainte OU'],
  warningAlert: [
    "Les mesures de biologies correspondent aux codes dont l'utilisation à l'AP-HP est supérieure à 3 analyses biologiques. De plus, les résultats concernent uniquement les analyses quantitatives enregistrées sur GLIMS, qui ont été validées et mises à jour depuis mars 2020."
  ],
  buildInfo: {
    type: { [ResourceType.OBSERVATION]: CriteriaType.OBSERVATION },
    defaultFilter: `subject.active=true&${ObservationParamsKeys.VALIDATED_STATUS}=${BiologyStatus.VALIDATED}`
  },
  itemSections: [
    {
      items: [
        {
          valueKey: 'occurrence',
          type: 'numberAndComparator',
          label: "Nombre d'occurrences",
          withHierarchyInfo: true,
          buildInfo: {
            chipDisplayMethodExtraArgs: [{ type: 'string', value: "Nombre d'occurrences" }]
          }
        },
        {
          valueKey: 'code',
          type: 'codeSearch',
          label: 'Sélectionner les codes',
          checkIsLeaf: true,
          valueSetsInfo: getValueSetsFromSystems([
            getConfig().features.observation.valueSets.biologyHierarchyAnabio.url,
            getConfig().features.observation.valueSets.biologyHierarchyLoinc.url
          ]),
          noOptionsText: 'Veuillez entrer un code de biologie',
          buildInfo: {
            fhirKey: ObservationParamsKeys.CODE,
            buildMethodExtraArgs: [
              { type: 'string', value: getConfig().features.observation.valueSets.biologyHierarchyAnabio.url },
              { type: 'boolean', value: true }
            ]
          }
        },
        {
          valueKey: 'enableSearchByValue',
          label: 'Activer la recherche par valeur',
          info: 'Pour pouvoir rechercher par valeur, vous devez sélectionner un seul et unique analyte (élement le plus fin de la hiérarchie).',
          type: 'boolean',
          displayCondition: (data) => {
            const typedData = data as ObservationDataType
            return typedData.code?.length === 1 && !!typedData.code[0].isLeaf
          },
          resetCondition: (data) => {
            const typedData = data as ObservationDataType
            return typedData.code?.length !== 1 || !typedData.code[0].isLeaf
          },
          buildInfo: {
            fhirKey: ObservationParamsKeys.VALUE,
            buildMethod: 'noop',
            chipDisplayMethod: 'noop',
            unbuildMethod: 'unbuildBooleanFromDataNonNullStatus'
          }
        },
        {
          valueKey: 'searchByValue',
          type: 'numberAndComparator',
          allowBetween: true,
          withHierarchyInfo: false,
          floatValues: true,
          displayCondition: (data) => {
            return !!data.enableSearchByValue
          },
          resetCondition: (data) => {
            const typedData = data as ObservationDataType
            return typedData.code?.length !== 1 || !typedData.code[0].isLeaf
          },
          buildInfo: {
            fhirKey: ObservationParamsKeys.VALUE,
            ignoreIf: (data) => {
              const typedData = data as ObservationDataType
              return typedData.code?.length !== 1 || !typedData.code[0].isLeaf || !data.enableSearchByValue
            },
            buildMethodExtraArgs: [{ type: 'string', value: 'le0,ge0' }],
            chipDisplayMethodExtraArgs: [{ type: 'string', value: 'Valeur' }],
            unbuildIgnoreValues: ['le0,ge0']
          }
        },
        {
          valueKey: 'encounterStatus',
          type: 'autocomplete',
          label: 'Statut de la visite associée',
          extraLabel: () => 'Statut de la visite',
          valueSetId: getConfig().core.valueSets.encounterStatus.url,
          noOptionsText: 'Veuillez entrer un statut de visite associée',
          buildInfo: {
            fhirKey: ObservationParamsKeys.ENCOUNTER_STATUS,
            chipDisplayMethodExtraArgs: [{ type: 'string', value: 'Statut de la visite associée :' }]
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
          extraInfo: 'Ne concerne pas les consultations.',
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
