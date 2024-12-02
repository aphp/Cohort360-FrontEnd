import { Comparators, CriteriaType, DocumentsParamsKeys, ResourceType } from 'types/requestCriterias'
import {
  CommonCriteriaData,
  CriteriaForm,
  WithEncounterDateDataType,
  WithEncounterStatusDataType,
  WithOccurenceCriteriaDataType
} from '../CriteriaForm/types'
import { DocumentStatuses, FilterByDocumentStatus, LabelObject, SearchByTypes } from 'types/searchCriterias'
import { getConfig } from 'config'
import docTypes from 'assets/docTypes.json'
import { SourceType } from 'types/scope'

export type DocumentDataType = CommonCriteriaData &
  WithOccurenceCriteriaDataType &
  WithEncounterDateDataType &
  WithEncounterStatusDataType & {
    type: CriteriaType.DOCUMENTS
    search: string
    searchBy: string // SearchByTypes.TEXT | SearchByTypes.DESCRIPTION
    docType: LabelObject[] | null
    docStatuses: LabelObject[] | null
  }

export const form: () => CriteriaForm<DocumentDataType> = () => ({
  label: 'Documents médicaux',
  initialData: {
    type: CriteriaType.DOCUMENTS,
    title: 'Critère de document',
    isInclusive: true,
    occurrence: { value: 1, comparator: Comparators.GREATER_OR_EQUAL },
    encounterService: null,
    startOccurrence: null,
    encounterStartDate: null,
    encounterEndDate: null,
    encounterStatus: [],
    search: '',
    searchBy: 'TEXT', // Default to SearchByTypes.TEXT
    docType: null,
    docStatuses: null
  },
  infoAlert: ['Tous les éléments des champs multiples sont liés par une contrainte OU'],
  errorMessages: {
    INCOHERENT_VALUE_ERROR: 'La valeur minimale ne peut pas être supérieure à la valeur maximale.',
    INVALID_VALUE_ERROR: 'Veuillez entrer un nombre valide.',
    MISSING_VALUE_ERROR: 'Veuillez entrer 2 valeurs avec ce comparateur.',
    ADVANCED_INPUTS_ERROR: 'Erreur dans les options avancées.',
    NO_ERROR: ''
  },
  buildInfo: {
    criteriaType: CriteriaType.DOCUMENTS,
    resourceType: ResourceType.DOCUMENTS,
    defaultFilter: 'type:not=doc-impor&contenttype=text/plain&subject.active=true'
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
          valueKey: 'searchBy',
          type: 'radioChoice',
          label: 'Rechercher dans :',
          choices: [
            { id: 'TEXT', label: 'Corps du document' },
            { id: 'DESCRIPTION', label: 'Titre du document' }
          ]
        },
        // {
        //   valueKey: 'searchBy',
        //   type: 'autocomplete',
        //   label: 'Rechercher dans :',
        //   valueSetId: 'docSearchBy',
        //   singleChoice: true,
        //   valueSetData: [
        //     { id: SearchByTypes.TEXT, label: 'Corps du document' },
        //     { id: SearchByTypes.DESCRIPTION, label: 'Titre du document' }
        //   ],
        //   noOptionsText: 'Veuillez sélectionner le type de recherche désiré'
        //   // buildInfo: {
        //   //   // fhirKey: SearchByTypes.TEXT
        //   // }
        // },
        {
          valueKey: 'search',
          type: 'textWithCheck',
          label: 'Rechercher dans les documents',
          placeholder: 'Rechercher dans les documents',
          errorType: 'error',
          buildInfo: {
            fhirKey: {
              main: SearchByTypes.TEXT,
              alt: SearchByTypes.DESCRIPTION,
              value1: { type: 'string', value: SearchByTypes.TEXT },
              value2: { type: 'reference', value: 'searchBy' }
            },
            chipDisplayMethod: 'getSearchDocumentLabel',
            chipDisplayMethodExtraArgs: [{ type: 'reference', value: 'searchBy' }]
          }
        },
        {
          valueKey: 'docType',
          type: 'autocomplete',
          label: 'Types de documents',
          valueSetId: 'docTypesValueSetId',
          valueSetData: docTypes.docTypes.map((docType) => ({
            id: docType.code,
            label: docType.label,
            type: docType.type
          })),
          noOptionsText: 'Veuillez entrer un type de document',
          groupBy: 'type',
          buildInfo: {
            fhirKey: DocumentsParamsKeys.DOC_TYPES,
            chipDisplayMethod: 'getDocumentTypesLabel'
          }
        },
        {
          valueKey: 'docStatuses',
          type: 'autocomplete',
          label: 'Statut de documents',
          valueSetId: 'docStatusesValueSetId',
          valueSetData: [
            {
              id: DocumentStatuses.FINAL,
              label: FilterByDocumentStatus.VALIDATED
            },
            {
              id: DocumentStatuses.PRELIMINARY,
              label: FilterByDocumentStatus.NOT_VALIDATED
            }
          ],
          noOptionsText: 'Veuillez entrer un statut de document',
          buildInfo: {
            fhirKey: DocumentsParamsKeys.DOC_STATUSES,
            buildMethodExtraArgs: [
              { type: 'string', value: getConfig().core.codeSystems.docStatus },
              { type: 'boolean', value: true }
            ],
            chipDisplayMethodExtraArgs: [{ type: 'string', value: 'Statut de documents : ' }]
          }
        },
        {
          valueKey: 'encounterStatus',
          type: 'autocomplete',
          label: 'Statut de la visite associée',
          valueSetId: getConfig().core.valueSets.encounterStatus.url,
          noOptionsText: 'Veuillez entrer un statut de visite associée',
          buildInfo: {
            fhirKey: DocumentsParamsKeys.ENCOUNTER_STATUS,
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
          sourceType: SourceType.DOCUMENT,
          buildInfo: {
            fhirKey: DocumentsParamsKeys.EXECUTIVE_UNITS
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
          extraLabel: () => 'Date de création du document',
          buildInfo: {
            fhirKey: DocumentsParamsKeys.DATE,
            chipDisplayMethodExtraArgs: [{ type: 'string', value: 'Date de création du document' }]
          }
        }
      ]
    }
  ]
})
