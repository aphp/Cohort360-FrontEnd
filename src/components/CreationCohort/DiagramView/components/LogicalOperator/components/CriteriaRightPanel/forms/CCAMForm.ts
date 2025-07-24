import { ProcedureParamsKeys, Comparators, CriteriaType, ResourceType } from 'types/requestCriterias'
import {
  CommonCriteriaData,
  CriteriaForm,
  WithEncounterDateDataType,
  WithEncounterStatusDataType,
  WithOccurenceCriteriaDataType
} from '../CriteriaForm/types'
import { SourceType } from 'types/scope'
import { getConfig } from 'config'
import { getValueSetsFromSystems } from 'utils/valueSets'
import { Hierarchy } from 'types/hierarchy'
import { FhirItem } from 'types/valueSet'

export type CcamDataType = CommonCriteriaData &
  WithOccurenceCriteriaDataType &
  WithEncounterDateDataType &
  WithEncounterStatusDataType & {
    type: CriteriaType.PROCEDURE
    code: Hierarchy<FhirItem>[] | null
    source: string | null
  }

export const form: () => CriteriaForm<CcamDataType> = () => ({
  label: "d'acte CCAM",
  title: 'Actes CCAM',
  initialData: {
    type: CriteriaType.PROCEDURE,
    title: "Critères d'actes CCAM",
    isInclusive: true,
    occurrence: { value: 1, comparator: Comparators.GREATER_OR_EQUAL },
    encounterService: null,
    startOccurrence: null,
    encounterAgeRange: { start: null, end: null },
    encounterStartDate: null,
    encounterEndDate: null,
    encounterStatus: [],
    code: null,
    source: 'AREM'
  },
  infoAlert: ['Tous les éléments des champs multiples sont liés par une contrainte OU'],
  buildInfo: {
    type: { [ResourceType.PROCEDURE]: CriteriaType.PROCEDURE },
    defaultFilter: getConfig().core.fhir.filterActive ? 'subject.active=true' : ''
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
          valueKey: 'source',
          type: 'radioChoice',
          label: 'Source',
          choices: [
            { id: 'AREM', label: 'AREM' },
            { id: 'ORBIS', label: 'ORBIS' }
          ],
          buildInfo: {
            fhirKey: ProcedureParamsKeys.SOURCE,
            chipDisplayMethodExtraArgs: [{ type: 'string', value: 'Source: ' }]
          }
        },
        {
          type: 'info',
          content: 'Les données AREM sont disponibles uniquement pour la période du 07/12/2009 au 30/11/2024',
          contentType: 'warning'
        },
        {
          type: 'info',
          content:
            'Seuls les diagnostics rattachés à une visite Orbis (avec un Dossier Administratif - NDA) sont actuellement disponibles.',
          contentType: 'warning'
        },
        {
          type: 'info',
          content:
            "Les données PMSI d'ORBIS sont codées au quotidien par les médecins. Les données PMSI AREM sont validées, remontées aux tutelles et disponibles dans le SNDS.",
          contentType: 'info'
        },
        {
          valueKey: 'code',
          type: 'codeSearch',
          label: "Sélectionner les codes d'actes CCAM",
          valueSetsInfo: getValueSetsFromSystems([getConfig().features.procedure.valueSets.procedureHierarchy.url]),
          noOptionsText: 'Veuillez entrer un code ou un acte CCAM',
          buildInfo: {
            fhirKey: ProcedureParamsKeys.CODE,
            buildMethodExtraArgs: [
              { type: 'string', value: getConfig().features.procedure.valueSets.procedureHierarchy.url }
            ],
            chipDisplayMethodExtraArgs: [
              { type: 'string', value: '' },
              { type: 'boolean', value: true }
            ]
          }
        },
        {
          valueKey: 'encounterStatus',
          type: 'autocomplete',
          label: 'Statut de la visite associée',
          valueSetId: getConfig().core.valueSets.encounterStatus.url,
          noOptionsText: 'Veuillez entrer un statut de visite associée',
          buildInfo: {
            fhirKey: ProcedureParamsKeys.ENCOUNTER_STATUS,
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
          valueKey: 'encounterAgeRange',
          label: 'Âge au début de la prise en charge',
          type: 'durationRange',
          buildInfo: {
            chipDisplayMethodExtraArgs: [{ type: 'string', value: 'Âge :' }]
          }
        },
        {
          valueKey: 'encounterService',
          label: 'Unité exécutrice',
          type: 'executiveUnit',
          sourceType: SourceType.CCAM,
          buildInfo: {
            fhirKey: ProcedureParamsKeys.EXECUTIVE_UNITS
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
          extraLabel: () => "Date de l'acte CCAM",
          buildInfo: {
            fhirKey: ProcedureParamsKeys.DATE,
            chipDisplayMethodExtraArgs: [{ type: 'string', value: "Date de l'acte CCAM" }]
          }
        }
      ]
    }
  ]
})
