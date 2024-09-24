import {
  ImagingDataType,
  form
} from 'components/CreationCohort/DiagramView/components/LogicalOperator/components/CriteriaRightPanel/forms/ImagingForm'
import { Comparators } from 'types/requestCriterias'

export const defaultImagingCriteria: ImagingDataType = {
  id: 1,
  ...form().initialData,
  numberOfIns: { value: 1, comparator: Comparators.EQUAL }
}

export const completeImagingCriteria: ImagingDataType = {
  ...defaultImagingCriteria,
  occurrence: { value: 1, comparator: Comparators.GREATER },
  encounterStartDate: { start: '2024-09-04', end: '2024-09-07', includeNull: true },
  encounterEndDate: { start: '2024-09-02', end: '2024-09-06' },
  encounterStatus: [{ id: 'cancelled', label: 'Cancelled', system: 'http://hl7.org/fhir/CodeSystem/encounter-status' }]
}
