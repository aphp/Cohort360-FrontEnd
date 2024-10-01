import { ResourceType } from 'types/requestCriterias'
import { Filters, ImagingFilters, PMSIFilters, PatientsFilters, SearchCriterias } from 'types/searchCriterias'
import { removeKeys } from './map'

export const narrowSearchCriterias = (
  deidentified: boolean,
  searchCriterias: SearchCriterias<Filters>,
  type: ResourceType
): SearchCriterias<Filters> => {
  const mappedOthers = (
    searchCriterias: SearchCriterias<PMSIFilters | ImagingFilters>,
    deidentified: boolean
  ): SearchCriterias<PMSIFilters | ImagingFilters> => {
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
      return mappedOthers(searchCriterias as SearchCriterias<PMSIFilters>, deidentified)
    case ResourceType.IMAGING:
      return mappedOthers(searchCriterias as SearchCriterias<ImagingFilters>, deidentified)
    default:
      return searchCriterias
  }
}
