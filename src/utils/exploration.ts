import { ResourceType } from 'types/requestCriterias'
import {
  BiologyFilters,
  DocumentsFilters,
  Filters,
  ImagingFilters,
  MaternityFormFilters,
  MedicationFilters,
  PMSIFilters,
  PatientsFilters,
  SearchCriterias
} from 'types/searchCriterias'
import { removeKeys } from './map'
import { MedicationRequest, MedicationAdministration } from 'fhir/r4'
import {
  CohortResults,
  CohortPMSI,
  CohortQuestionnaireResponse,
  CohortImaging,
  CohortObservation,
  CohortMedication,
  CohortComposition
} from 'types'
import { PatientsResponse } from 'types/patient'
import { Data } from 'components/ExplorationBoard/useData'

export const narrowSearchCriterias = (
  deidentified: boolean,
  searchCriterias: SearchCriterias<Filters>,
  type: ResourceType
): SearchCriterias<Filters> => {
  const mappedOthers = (
    searchCriterias: SearchCriterias<
      PMSIFilters | ImagingFilters | BiologyFilters | MaternityFormFilters | DocumentsFilters
    >,
    deidentified: boolean
  ): SearchCriterias<Filters> => {
    const filters = deidentified ? removeKeys(searchCriterias.filters, ['ipp', 'nda']) : searchCriterias.filters
    const criterias = removeKeys(searchCriterias, ['searchBy'])
    return { ...criterias, filters }
  }

  const mappedPatients = (
    searchCriterias: SearchCriterias<PatientsFilters>,
    deidentified: boolean
  ): SearchCriterias<PatientsFilters> => {
    return deidentified ? removeKeys(searchCriterias, ['searchInput', 'searchBy']) : searchCriterias
  }

  const mappedDocs = (
    searchCriterias: SearchCriterias<DocumentsFilters>,
    deidentified: boolean
  ): SearchCriterias<DocumentsFilters> => {
    return deidentified
      ? { ...searchCriterias, filters: removeKeys(searchCriterias.filters, ['ipp', 'nda']) }
      : searchCriterias
  }

  switch (type) {
    case ResourceType.PATIENT:
      return mappedPatients(searchCriterias as SearchCriterias<PatientsFilters>, deidentified)
    case ResourceType.CONDITION:
    case ResourceType.CLAIM:
    case ResourceType.PROCEDURE:
      return mappedOthers(searchCriterias as SearchCriterias<PMSIFilters>, deidentified)
    case ResourceType.MEDICATION_ADMINISTRATION: {
      const narrowed = mappedOthers(searchCriterias as SearchCriterias<MedicationFilters>, deidentified)
      narrowed.filters = removeKeys(narrowed.filters, ['prescriptionTypes'])
      return narrowed
    }
    case ResourceType.MEDICATION_REQUEST: {
      const narrowed = mappedOthers(searchCriterias as SearchCriterias<MedicationFilters>, deidentified)
      narrowed.filters = removeKeys(narrowed.filters, ['administrationRoutes'])
      return narrowed
    }
    case ResourceType.IMAGING:
      return mappedOthers(searchCriterias as SearchCriterias<ImagingFilters>, deidentified)
    case ResourceType.OBSERVATION:
      return mappedOthers(searchCriterias as SearchCriterias<BiologyFilters>, deidentified)
    case ResourceType.QUESTIONNAIRE_RESPONSE:
      return removeKeys(searchCriterias, ['searchInput', 'searchBy'])
    case ResourceType.DOCUMENTS:
      return mappedDocs(searchCriterias as SearchCriterias<DocumentsFilters>, deidentified)
    default:
      return searchCriterias
  }
}

export const isPatientsResponse = (data: Data): data is PatientsResponse => {
  return 'originalPatients' in data
}

export const isOtherResourcesResponse = (data: Data): data is CohortResults<any> => {
  return 'list' in data
}

export const isPmsiCohort = (data: CohortResults<any>): data is CohortResults<CohortPMSI> => {
  const type = data.list[0].resourceType
  return type === ResourceType.CONDITION || type === ResourceType.PROCEDURE || type === ResourceType.CLAIM
}

export const isQuestionnaireCohort = (data: CohortResults<any>): data is CohortResults<CohortQuestionnaireResponse> => {
  const type = data.list[0].resourceType
  return type === ResourceType.QUESTIONNAIRE_RESPONSE
}

export const isImagingCohort = (data: CohortResults<any>): data is CohortResults<CohortImaging> => {
  const type = data.list[0].resourceType
  return type === ResourceType.IMAGING
}

export const isBiologyCohort = (data: CohortResults<any>): data is CohortResults<CohortObservation> => {
  const type = data.list[0].resourceType
  return type === ResourceType.OBSERVATION
}

export const isMedicationCohort = (
  data: CohortResults<any>
): data is CohortResults<CohortMedication<MedicationRequest | MedicationAdministration>> => {
  const type = data.list[0].resourceType
  return type === ResourceType.MEDICATION_ADMINISTRATION || type === ResourceType.MEDICATION_REQUEST
}

export const isDocumentsCohort = (data: CohortResults<any>): data is CohortResults<CohortComposition> => {
  const type = data.list[0].resourceType
  return type === ResourceType.DOCUMENTS
}
