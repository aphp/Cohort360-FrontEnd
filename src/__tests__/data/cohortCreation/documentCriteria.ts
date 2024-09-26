import { Comparators, CriteriaType, DocumentDataType } from 'types/requestCriterias'
import { SearchByTypes } from 'types/searchCriterias'

export const defaultDocumentCriteria: DocumentDataType = {
  id: 1,
  type: CriteriaType.DOCUMENTS,
  isInclusive: true,
  title: 'Document',
  occurrence: null,
  occurrenceComparator: null,
  startOccurrence: [null, null],
  endOccurrence: [null, null],
  encounterStartDate: [null, null],
  includeEncounterStartDateNull: false,
  encounterEndDate: [null, null],
  includeEncounterEndDateNull: false,
  encounterStatus: [],
  docStatuses: [],
  error: undefined,
  docType: null,
  search: '',
  searchBy: SearchByTypes.TEXT,
  encounterService: undefined
}

export const completeDocumentCriteria: DocumentDataType = {
  ...defaultDocumentCriteria,
  occurrence: 1,
  occurrenceComparator: Comparators.GREATER,
  startOccurrence: ['2024-09-02', '2024-09-04'],
  encounterStartDate: ['2024-09-05', '2024-09-05'],
  includeEncounterStartDateNull: true,
  encounterEndDate: ['2024-09-06', '2024-09-07'],
  includeEncounterEndDateNull: true,
  encounterStatus: [{ id: 'cancelled', label: 'Cancelled', system: 'http://hl7.org/fhir/CodeSystem/encounter-status' }],
  docStatuses: ['Validé', 'Non validé'],
  docType: [
    { type: 'Comptes Rendus Hospitalisation', label: 'CR de Jour', code: 'crh-j' },
    { type: 'Comptes Rendus Hospitalisation', label: 'CRH Chirurgie', code: 'crh-chir' }
  ],
  search: 'cancer',
  searchBy: SearchByTypes.TEXT,
  encounterService: [
    {
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
      type: 'Groupe hospitalier (GH)'
    }
  ]
}
