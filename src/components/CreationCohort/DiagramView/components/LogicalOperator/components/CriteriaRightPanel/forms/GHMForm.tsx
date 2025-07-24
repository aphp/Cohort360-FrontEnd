import React from 'react'
import { ClaimParamsKeys, Comparators, CriteriaType, ResourceType } from 'types/requestCriterias'
import {
  CommonCriteriaData,
  CriteriaForm,
  WithEncounterDateDataType,
  WithEncounterStatusDataType,
  WithOccurenceCriteriaDataType
} from '../CriteriaForm/types'
import { Link } from '@mui/material'
import { SourceType } from 'types/scope'
import { getConfig } from 'config'
import { getValueSetsFromSystems } from 'utils/valueSets'
import { Hierarchy } from 'types/hierarchy'
import { FhirItem } from 'types/valueSet'

export type GhmDataType = CommonCriteriaData &
  WithOccurenceCriteriaDataType &
  WithEncounterDateDataType &
  WithEncounterStatusDataType & {
    type: CriteriaType.CLAIM
    code: Hierarchy<FhirItem>[] | null
  }

export const form: () => CriteriaForm<GhmDataType> = () => ({
  label: 'de GHM',
  title: 'GHM',
  initialData: {
    title: 'Critères GHM',
    type: CriteriaType.CLAIM,
    isInclusive: true,
    occurrence: {
      value: 1,
      comparator: Comparators.GREATER_OR_EQUAL
    },
    encounterService: null,
    encounterStatus: [],
    startOccurrence: null,
    encounterAgeRange: { start: null, end: null },
    encounterStartDate: null,
    encounterEndDate: null,
    code: []
  },
  infoAlert: ['Tous les éléments des champs multiples sont liés par une contrainte OU'],
  warningAlert: [
    <div key="1">
      Données actuellement disponibles : PMSI ORBIS. Pour plus d'informations sur les prochaines intégrations de
      données, veuillez vous référer au tableau trimestriel de disponibilité des données disponible{' '}
      <Link
        href="https://eds.aphp.fr/sites/default/files/2023-01/EDS_Disponibilite_donnees_site_EDS_202212.pdf"
        target="_blank"
        rel="noopener"
      >
        ici
      </Link>
    </div>
  ],
  buildInfo: {
    type: { [ResourceType.CLAIM]: CriteriaType.CLAIM },
    defaultFilter: getConfig().core.fhir.filterActive ? 'patient.active=true' : ''
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
          valueSetsInfo: getValueSetsFromSystems([getConfig().features.claim.valueSets.claimHierarchy.url]),
          noOptionsText: 'Aucun GHM trouvé',
          label: 'Sélectionner les codes GHM',
          buildInfo: {
            fhirKey: ClaimParamsKeys.CODE,
            buildMethodExtraArgs: [{ type: 'string', value: getConfig().features.claim.valueSets.claimHierarchy.url }],
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
          noOptionsText: 'Aucun statut trouvé',
          buildInfo: {
            fhirKey: ClaimParamsKeys.ENCOUNTER_STATUS,
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
          sourceType: SourceType.GHM,
          buildInfo: {
            fhirKey: ClaimParamsKeys.EXECUTIVE_UNITS
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
          extraLabel: () => 'Date du classement en GHM',
          buildInfo: {
            fhirKey: ClaimParamsKeys.DATE,
            chipDisplayMethodExtraArgs: [{ type: 'string', value: 'Date de classement en GHM' }]
          }
        }
      ]
    }
  ]
})
