import { ObservationDataType, Comparators, CriteriaType } from 'types/requestCriterias'
import { System } from 'types/scope'

export const defaultObservationCriteria: ObservationDataType = {
  id: 1,
  type: CriteriaType.OBSERVATION,
  isInclusive: true,
  title: 'Observation',
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
  searchByValue: [null, null],
  valueComparator: Comparators.EQUAL,
  encounterService: []
}

export const completeObservationCriteria: ObservationDataType = {
  ...defaultObservationCriteria,
  occurrence: 1,
  occurrenceComparator: Comparators.GREATER,
  startOccurrence: ['2024-09-03', '2024-09-04'],
  encounterStartDate: ['2024-09-04', '2024-09-07'],
  includeEncounterStartDateNull: true,
  encounterEndDate: ['2024-09-02', '2024-09-06'],
  includeEncounterEndDateNull: false,
  encounterStatus: [{ id: 'cancelled', label: 'Cancelled', system: 'http://hl7.org/fhir/CodeSystem/encounter-status' }],
  code: [
    {
      id: 'I3356',
      label: 'I3356 - Erythrocytes Foetaux /érythrocytes Adultes_sang_cytochimie_hf/10000 Ha',
      system: 'https://terminology.eds.aphp.fr/aphp-itm-anabio',
      above_levels_ids: '*',
      inferior_levels_ids: ''
    }
  ],
  searchByValue: [3, null],
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
