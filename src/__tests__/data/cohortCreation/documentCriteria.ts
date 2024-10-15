import {
  DocumentDataType,
  form
} from 'components/CreationCohort/DiagramView/components/LogicalOperator/components/CriteriaRightPanel/forms/DocumentsForm'
import { Comparators } from 'types/requestCriterias'
import { DocumentStatuses, FilterByDocumentStatus, SearchByTypes } from 'types/searchCriterias'

export const defaultDocumentCriteria: DocumentDataType = {
  id: 1,
  ...form().initialData
}

export const completeDocumentCriteria: DocumentDataType = {
  ...defaultDocumentCriteria,
  occurrence: { value: 1, comparator: Comparators.GREATER },
  startOccurrence: { start: '2024-09-02', end: '2024-09-04' },
  encounterStartDate: { start: '2024-09-05', end: '2024-09-05', includeNull: true },
  encounterEndDate: { start: '2024-09-06', end: '2024-09-07', includeNull: true },
  encounterStatus: [{ id: 'cancelled', label: 'Cancelled', system: 'http://hl7.org/fhir/CodeSystem/encounter-status' }],
  docStatuses: [
    {
      id: DocumentStatuses.FINAL,
      label: FilterByDocumentStatus.VALIDATED
    },
    {
      id: DocumentStatuses.PRELIMINARY,
      label: FilterByDocumentStatus.NOT_VALIDATED
    }
  ],
  docType: [
    { type: 'Comptes Rendus Hospitalisation', label: 'CR de Jour', id: 'crh-j' },
    { type: 'Comptes Rendus Hospitalisation', label: 'CRH Chirurgie', id: 'crh-chir' }
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
