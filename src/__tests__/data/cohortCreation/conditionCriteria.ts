import {
  Cim10DataType,
  form
} from 'components/CreationCohort/DiagramView/components/LogicalOperator/components/CriteriaRightPanel/forms/Cim10Form'
import { Comparators } from 'types/requestCriterias'
import { System } from 'types/scope'

export const defaultConditionCriteria: Cim10DataType = {
  id: 1,
  ...form().initialData,
  source: null
}

export const completeConditionCriteria: Cim10DataType = {
  ...defaultConditionCriteria,
  occurrence: { value: 1, comparator: Comparators.GREATER },
  startOccurrence: { start: null, end: null },
  encounterStartDate: { start: '2024-09-05', end: '2024-09-05', includeNull: true },
  encounterEndDate: { start: '2024-09-06', end: '2024-09-07' },
  encounterStatus: ['finished'],
  code: [
    {
      id: 'I841',
      label: 'I841 - *** Su14 *** Hémorroïdes Internes Avec Autres Complications',
      system: 'https://smt.esante.gouv.fr/terminologie-cim-10/',
      above_levels_ids: '*',
      inferior_levels_ids: ''
    },
    {
      id: 'I842',
      label: 'I842 - *** Su15 *** Hémorroïdes Internes Sans Autres Complications',
      system: 'https://smt.esante.gouv.fr/terminologie-cim-10/',
      above_levels_ids: '*',
      inferior_levels_ids: ''
    }
  ],
  source: 'AREM',
  diagnosticType: ['fp', 'f'],
  encounterService: [
    {
      label: 'GH RCP',
      above_levels_ids: '8312002244',
      cohort_id: '6935',
      cohort_size: '23',
      full_path: 'APHP-ASSISTANCE PUBLIQUE AP-HP/H01-GH RCP',
      id: '8312016825',
      inferior_levels_ids: '8312016826',
      name: 'GH RCP',
      parent_id: '8312002244',
      source_value: 'H01',
      status: undefined,
      subItems: undefined,
      type: 'Groupe hospitalier (GH)',
      system: System.ScopeTree
    }
  ]
}
