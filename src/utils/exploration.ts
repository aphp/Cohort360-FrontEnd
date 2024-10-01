import { ResourceType } from 'types/requestCriterias'
import { Filters, PMSIFilters, PatientsFilters, SearchCriterias } from 'types/searchCriterias'
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

  switch (type) {
    case ResourceType.PATIENT:
      return mappedPatients(searchCriterias as SearchCriterias<PatientsFilters>, deidentified)
    case ResourceType.CONDITION:
    case ResourceType.CLAIM:
    case ResourceType.PROCEDURE:
    case ResourceType.QUESTIONNAIRE_RESPONSE:
      return mappedPmsi(searchCriterias as SearchCriterias<PMSIFilters>, deidentified)
    default:
      return searchCriterias
  }
}
