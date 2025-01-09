import { Cim10DataType, Comparators, CriteriaType } from 'types/requestCriterias'
import { System } from 'types/scope'

export const defaultConditionCriteria: Cim10DataType = {
  id: 1,
  type: CriteriaType.CONDITION,
  isInclusive: true,
  title: 'Condition',
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
  diagnosticType: null,
  label: undefined
}

export const completeConditionCriteria: Cim10DataType = {
  ...defaultConditionCriteria,
  occurrence: 1,
  occurrenceComparator: Comparators.GREATER,
  startOccurrence: [null, null],
  encounterStartDate: ['2024-09-05', '2024-09-05'],
  includeEncounterStartDateNull: true,
  encounterEndDate: ['2024-09-06', '2024-09-07'],
  includeEncounterEndDateNull: false,
  encounterStatus: [{ id: 'finished', label: 'Finished', system: 'http://hl7.org/fhir/CodeSystem/encounter-status' }],
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
  diagnosticType: [
    {
      id: 'fp',
      label: 'fp - Finalité Principale De Prise En Charge',
      system: 'https://terminology.eds.aphp.fr/aphp-orbis-condition-status'
    },
    {
      id: 'f',
      label: 'f - Finalité De Prise En Charge',
      system: 'https://terminology.eds.aphp.fr/aphp-orbis-condition-status'
    }
  ],
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
