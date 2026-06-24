/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'

import CriteriaForm from './index'
import { Provider } from 'react-redux'
import { store } from 'state/store'
import { Comparators, ConditionParamsKeys, CriteriaType, ResourceType } from 'types/requestCriterias'
import { getConfig } from 'config'
import { SourceType } from 'types/scope'
import { fn } from '@storybook/test'

const meta = {
  title: 'CriteriaForm',
  component: CriteriaForm<any>,
  decorators: [
    (Story) => (
      <Provider store={store}>
        <Story />
      </Provider>
    )
  ],
  tags: ['autodocs']
} satisfies Meta<typeof CriteriaForm>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    goBack: fn(),
    updateData: fn(),
    label: 'Diagnostic',
    initialData: {
      type: CriteriaType.CONDITION,
      title: 'Critère de diagnostic',
      isInclusive: true,
      occurrence: { value: 1, comparator: Comparators.GREATER_OR_EQUAL },
      encounterService: null,
      startOccurrence: null,
      encounterStartDate: null,
      encounterEndDate: null,
      encounterStatus: [],
      code: null,
      source: 'AREM',
      diagnosticType: null
    },
    errorMessages: {
      INCOHERENT_VALUE_ERROR: 'La valeur minimale ne peut pas être supérieure à la valeur maximale.',
      INVALID_VALUE_ERROR: 'Veuillez entrer un nombre valide.',
      MISSING_VALUE_ERROR: 'Veuillez entrer 2 valeurs avec ce comparateur.',
      ADVANCED_INPUTS_ERROR: 'Erreur dans les options avancées.',
      NO_ERROR: ''
    },
    buildInfo: {
      criteriaType: CriteriaType.CONDITION,
      resourceType: ResourceType.CONDITION,
      defaultFilter: 'subject.active=true'
    },
    itemSections: [
      {
        items: [
          {
            valueKey: 'occurrence' as any,
            type: 'numberAndComparator',
            label: "Nombre d'occurrences",
            withHierarchyInfo: true,
            buildInfo: {
              chipDisplayMethodExtraArgs: [{ type: 'string', value: "Nombre d'occurrences" }]
            }
          },
          {
            valueKey: 'source' as any,
            type: 'radioChoice',
            label: 'Source',
            choices: [
              { id: 'AREM', label: 'AREM' },
              { id: 'ORBIS', label: 'ORBIS' }
            ],
            buildInfo: {
              fhirKey: ConditionParamsKeys.SOURCE,
              chipDisplayMethodExtraArgs: [{ type: 'string', value: 'Source: ' }]
            }
          },
          {
            type: 'info',
            content:
              "Les données AREM sont disponibles pour la période du 07/12/2009 jusqu'à la dernière période validée pour l'année courante dans le Datalake et la base centrale de l'EDS, à savoir avec un décalage d’environ 1-2 mois. Contrairement à la source ORBIS, les données provenant d'AREM sont décalées. Ce décalage d’environ 2 mois est lié au temps de traitement pour la phase de codification et de vérification par l'équipe DIM (Département d'Information Médicale).",
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
            valueKey: 'code' as any,
            type: 'codeSearch',
            valueSetIds: [getConfig().features.condition.valueSets.conditionHierarchy.url],
            noOptionsText: 'Veuillez entrer un code ou un diagnostic CIM10',
            label: 'Code CIM10',
            buildInfo: {
              fhirKey: ConditionParamsKeys.CODE,
              buildMethodExtraArgs: [
                { type: 'string', value: getConfig().features.condition.valueSets.conditionHierarchy.url }
              ]
            }
          },
          {
            valueKey: 'diagnosticType' as any,
            type: 'autocomplete',
            label: 'Type de diagnostic',
            valueSetId: getConfig().features.condition.valueSets.conditionStatus.url,
            noOptionsText: 'Veuillez entrer un type de diagnostic',
            buildInfo: {
              fhirKey: ConditionParamsKeys.DIAGNOSTIC_TYPES
            }
          },
          {
            valueKey: 'encounterStatus' as any,
            type: 'autocomplete',
            label: 'Statut de la visite associée',
            valueSetId: getConfig().core.valueSets.encounterStatus.url,
            noOptionsText: 'Veuillez entrer un statut de visite associée',
            buildInfo: {
              fhirKey: ConditionParamsKeys.ENCOUNTER_STATUS,
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
            sourceType: SourceType.CIM10,
            buildInfo: {
              fhirKey: ConditionParamsKeys.EXECUTIVE_UNITS
            }
          },
          {
            valueKey: 'encounterStartDate' as any,
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
            valueKey: 'encounterEndDate' as any,
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
            valueKey: 'startOccurrence' as any,
            type: 'calendarRange',
            errorType: 'ADVANCED_INPUTS_ERROR',
            extraLabel: () => 'Date du diagnostic CIM10',
            buildInfo: {
              fhirKey: ConditionParamsKeys.DATE,
              chipDisplayMethodExtraArgs: [{ type: 'string', value: 'Date du diagnostic CIM10' }]
            }
          }
        ]
      }
    ]
  } as any
}
