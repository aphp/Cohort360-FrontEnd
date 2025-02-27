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
import { MedicationRequest, MedicationAdministration, QuestionnaireResponse, ImagingStudy, Observation, DocumentReference } from 'fhir/r4'
import {
  ExplorationResults,
  CohortPMSI,
  CohortQuestionnaireResponse,
  CohortImaging,
  CohortObservation,
  CohortMedication,
  CohortComposition
} from 'types'
import { PatientsResponse } from 'types/patient'
import { Data } from 'components/ExplorationBoard/useData'

export const getAlertMessages = (type: string, deidentified: boolean) => {
  if (type === ResourceType.IMAGING)
    return [
      "Seuls les examens présents dans le PACS Philips et rattachés à un Dossier Administratif (NDA) sont actuellement disponibles. Le flux alimentant les métadonnées associées aux séries et aux examens est suspendu depuis le 01/02/2023 suite à la migration du PACS AP-HP. Aucun examen produit après cette date n'est disponible via Cohort360."
    ]
  if (type === ResourceType.OBSERVATION)
    return [
      "Les mesures de biologie sont pour l'instant restreintes aux 3870 codes ANABIO correspondants aux analyses les plus utilisées au niveau national et à l'AP-HP. De plus, les résultats concernent uniquement les analyses quantitatives enregistrées sur GLIMS, qui ont été validées et mises à jour depuis mars 2020."
    ]
  if (type === ResourceType.CONDITION || type === ResourceType.PROCEDURE)
    return [
      'Attention : Les données AREM sont disponibles uniquement pour la période du 07/12/2009 au 31/07/2024. Seuls les diagnostics rattachés à une visite Orbis (avec un Dossier Administratif - NDA) sont actuellement disponibles.'
    ]
  if (type === ResourceType.DOCUMENTS) {
    if (deidentified)
      return [
        'Attention : Les données identifiantes des patients sont remplacées par des informations fictives dans les résultats de la recherche et dans les documents prévisualisés.'
      ]
    return [
      "Attention : La recherche textuelle est pseudonymisée (les données identifiantes des patients sont remplacées par des informations fictives). Vous retrouverez les données personnelles de votre patient en cliquant sur l'aperçu."
    ]
  }
}

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
      return mappedOthers(searchCriterias as SearchCriterias<PMSIFilters>, deidentified)
    case ResourceType.PROCEDURE: {
      const narrowed = mappedOthers(searchCriterias as SearchCriterias<PMSIFilters>, deidentified)
      narrowed.filters = removeKeys(narrowed.filters, ['diagnosticTypes'])
      return narrowed
    }
    case ResourceType.CLAIM: {
      const narrowed = mappedOthers(searchCriterias as SearchCriterias<PMSIFilters>, deidentified)
      narrowed.filters = removeKeys(narrowed.filters, ['source', 'diagnosticTypes'])
      return narrowed
    }
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

export const isOtherResourcesResponse = (data: Data): data is ExplorationResults<any> => {
  return 'list' in data
}

export const isPmsi = (data: ExplorationResults<any>): data is ExplorationResults<CohortPMSI> => {
  const type = data.list[0].resourceType
  return type === ResourceType.CONDITION || type === ResourceType.PROCEDURE || type === ResourceType.CLAIM
}

export const isQuestionnaire = (
  data: ExplorationResults<any>
): data is ExplorationResults<QuestionnaireResponse> => {
  const type = data.list[0].resourceType
  return type === ResourceType.QUESTIONNAIRE_RESPONSE
}

export const isImaging = (data: ExplorationResults<any>): data is ExplorationResults<ImagingStudy> => {
  const type = data.list[0].resourceType
  return type === ResourceType.IMAGING
}

export const isBiology = (data: ExplorationResults<any>): data is ExplorationResults<Observation> => {
  const type = data.list[0].resourceType
  return type === ResourceType.OBSERVATION
}

export const isMedication = (
  data: ExplorationResults<any>
): data is ExplorationResults<CohortMedication<MedicationRequest | MedicationAdministration>> => {
  const type = data.list[0].resourceType
  return type === ResourceType.MEDICATION_ADMINISTRATION || type === ResourceType.MEDICATION_REQUEST
}

export const isDocuments = (data: ExplorationResults<any>): data is ExplorationResults<DocumentReference> => {
  const type = data.list[0].resourceType
  return type === ResourceType.DOCUMENTS
}
