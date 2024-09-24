import {
  ObservationDataType,
  form
} from 'components/CreationCohort/DiagramView/components/LogicalOperator/components/CriteriaRightPanel/forms/BiologyForm'
import { Comparators } from 'types/requestCriterias'

export const defaultObservationCriteria: ObservationDataType = {
  id: 1,
  ...form().initialData
}

export const completeObservationCriteria: ObservationDataType = {
  ...defaultObservationCriteria,
  occurrence: { value: 1, comparator: Comparators.GREATER },
  startOccurrence: { start: '2024-09-03', end: '2024-09-04' },
  encounterStartDate: { start: '2024-09-04', end: '2024-09-07', includeNull: true },
  encounterEndDate: { start: '2024-09-02', end: '2024-09-06' },
  encounterStatus: [{ id: 'cancelled', label: 'Cancelled', system: 'http://hl7.org/fhir/CodeSystem/encounter-status' }],
  code: [
    {
      id: 'I3356',
      label: 'I3356 - Erythrocytes Foetaux /érythrocytes Adultes_sang_cytochimie_hf/10000 Ha',
      system: 'https://terminology.eds.aphp.fr/aphp-itm-anabio',
      isLeaf: true
    }
  ],
  searchByValue: { value: 3, comparator: Comparators.EQUAL },
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
