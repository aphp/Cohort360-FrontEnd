import { CcamDataType, Comparators, CriteriaType } from 'types/requestCriterias'
import { System } from 'types/scope'

export const defaultProcedureCriteria: CcamDataType = {
  id: 1,
  type: CriteriaType.PROCEDURE,
  isInclusive: true,
  title: 'Procedure',
  occurrence: null,
  occurrenceComparator: null,
  startOccurrence: [null, null],
  endOccurrence: [null, null],
  encounterStartDate: [null, null],
  includeEncounterStartDateNull: false,
  encounterEndDate: [null, null],
  includeEncounterEndDateNull: false,
  encounterStatus: [],
  code: [],
  source: null,
  label: undefined,
  encounterService: undefined
}

export const completeProcedureCriteria: CcamDataType = {
  ...defaultProcedureCriteria,
  occurrence: 1,
  occurrenceComparator: Comparators.GREATER,
  startOccurrence: ['2024-09-06', '2024-09-06'],
  encounterStartDate: ['2024-09-05', '2024-09-05'],
  includeEncounterStartDateNull: false,
  encounterEndDate: ['2024-09-06', '2024-09-07'],
  includeEncounterEndDateNull: true,
  encounterStatus: [
    { id: 'entered-in-error', label: 'Entered In Error', system: 'http://hl7.org/fhir/CodeSystem/encounter-status' }
  ],
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
