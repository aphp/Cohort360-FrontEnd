import { ResourceType } from 'types/requestCriterias'
import { Filters, MedicationFilters, PMSIFilters, PatientsFilters, SearchCriterias } from 'types/searchCriterias'
import { removeKeys } from './map'

export const narrowSearchCriterias = (
  deidentified: boolean,
  searchCriterias: SearchCriterias<Filters>,
  type: ResourceType
): SearchCriterias<Filters> => {
  const mappedOthers = (searchCriterias: SearchCriterias<Filters>, deidentified: boolean): SearchCriterias<Filters> => {
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
    default:
      return searchCriterias
  }
}
