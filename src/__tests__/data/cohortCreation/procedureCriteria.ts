import {
  CcamDataType,
  form
} from 'components/CreationCohort/DiagramView/components/LogicalOperator/components/CriteriaRightPanel/forms/CCAMForm'
import { Comparators } from 'types/requestCriterias'
import { System } from 'types/scope'

export const defaultProcedureCriteria: CcamDataType = {
  id: 1,
  ...form().initialData,
  source: null
}

export const completeProcedureCriteria: CcamDataType = {
  ...defaultProcedureCriteria,
  occurrence: { value: 1, comparator: Comparators.GREATER },
  startOccurrence: { start: '2024-09-06', end: '2024-09-06' },
  encounterStartDate: { start: '2024-09-05', end: '2024-09-05' },
  encounterEndDate: { start: '2024-09-06', end: '2024-09-07', includeNull: true },
  encounterStatus: ['entered-in-error'],
  code: [
    {
      id: '000126',
      label: "000126 - Explorations Électrophysiologiques De L'oeil",
      system: 'https://www.atih.sante.fr/plateformes-de-transmiss…ls/logiciels-espace-de-telechargement/id_lot/3550',
      above_levels_ids: '*',
      inferior_levels_ids: ''
    },

    {
      id: '000127',
      label: "000127 - Échographie De L'oeil",
      system: 'https://www.atih.sante.fr/plateformes-de-transmiss…ls/logiciels-espace-de-telechargement/id_lot/3550',
      above_levels_ids: '*',
      inferior_levels_ids: ''
    }
  ],
  source: 'ORBIS',
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
