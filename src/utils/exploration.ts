import { ResourceType } from 'types/requestCriterias'
import { DocumentsFilters, Filters, PMSIFilters, PatientsFilters, SearchCriterias } from 'types/searchCriterias'
import { removeKeys } from './map'

export const narrowSearchCriterias = (
  deidentified: boolean,
  searchCriterias: SearchCriterias<Filters>,
  type: ResourceType
): SearchCriterias<Filters> => {
  const mappedPmsi = (
    searchCriterias: SearchCriterias<PMSIFilters>,
    deidentified: boolean
  ): SearchCriterias<PMSIFilters> => {
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
      return mappedPmsi(searchCriterias as SearchCriterias<PMSIFilters>, deidentified)
    case ResourceType.DOCUMENTS:
      return mappedDocs(searchCriterias as SearchCriterias<DocumentsFilters>, deidentified)
    default:
      return searchCriterias
  }
}
