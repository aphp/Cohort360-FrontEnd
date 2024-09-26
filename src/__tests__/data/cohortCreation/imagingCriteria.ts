import { ImagingDataType, Comparators, CriteriaType } from 'types/requestCriterias'
import { DocumentAttachmentMethod } from 'types/searchCriterias'

export const defaultImagingCriteria: ImagingDataType = {
  id: 1,
  type: CriteriaType.IMAGING,
  isInclusive: true,
  title: 'Imaging',
  occurrence: null,
  occurrenceComparator: null,
  startOccurrence: [null, null],
  endOccurrence: [null, null],
  encounterStartDate: [null, null],
  includeEncounterStartDateNull: false,
  encounterEndDate: [null, null],
  includeEncounterEndDateNull: false,
  encounterStatus: [],
  studyStartDate: null,
  studyEndDate: null,
  studyModalities: [],
  studyDescription: '',
  studyProcedure: '',
  numberOfSeries: 1,
  seriesComparator: Comparators.EQUAL,
  numberOfIns: 1,
  instancesComparator: Comparators.EQUAL,
  withDocument: DocumentAttachmentMethod.NONE,
  daysOfDelay: null,
  studyUid: '',
  seriesStartDate: null,
  seriesEndDate: null,
  seriesDescription: '',
  seriesProtocol: '',
  seriesModalities: [],
  seriesUid: '',
  encounterService: []
}

export const completeImagingCriteria: ImagingDataType = {
  ...defaultImagingCriteria,
  occurrence: 1,
  occurrenceComparator: Comparators.GREATER,
  startOccurrence: ['2024-09-03', '2024-09-04'],
  encounterStartDate: ['2024-09-04', '2024-09-07'],
  includeEncounterStartDateNull: true,
  encounterEndDate: ['2024-09-02', '2024-09-06'],
  includeEncounterEndDateNull: false,
  encounterStatus: [{ id: 'cancelled', label: 'Cancelled', system: 'http://hl7.org/fhir/CodeSystem/encounter-status' }]
}
