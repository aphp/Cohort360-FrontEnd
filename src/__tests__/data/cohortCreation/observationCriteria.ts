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
  code: [
    {
      id: 'I3356',
      label: 'I3356 - Erythrocytes Foetaux /érythrocytes Adultes_sang_cytochimie_hf/10000 Ha',
      system: 'https://terminology.eds.aphp.fr/aphp-itm-anabio',
      above_levels_ids: '*',
      inferior_levels_ids: '',
      isLeaf: true
    }
  ],
  enableSearchByValue: true,
  searchByValue: { value: 3, comparator: Comparators.EQUAL }
}
