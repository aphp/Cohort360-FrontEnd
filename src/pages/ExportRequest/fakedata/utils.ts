import { ResourceType } from 'types/requestCriterias'

export const getFHIRResource = (tableName: string) => {
  switch (tableName) {
    case 'person':
      return ResourceType.PATIENT
    case 'visit_occurrence':
      return ResourceType.ENCOUNTER
    case 'condition_occurrence':
      return ResourceType.CONDITION
    case 'procedure_occurrence':
      return ResourceType.PROCEDURE
    case 'cost':
      return ResourceType.CLAIM
    case 'note':
      return ResourceType.DOCUMENTS
    case 'drug_exposure_prescription':
      return ResourceType.MEDICATION_REQUEST
    case 'drug_exposure_administration':
      return ResourceType.MEDICATION_ADMINISTRATION
    case 'measurement':
      return ResourceType.OBSERVATION
    case 'imaging_study':
    case 'imaging_series':
      return ResourceType.IMAGING
    case 'questionnaireresponse':
      return ResourceType.QUESTIONNAIRE_RESPONSE
    default:
      return ResourceType.UNKNOWN
  }
}

export const getExportTableLabel = (resourceType: ResourceType) => {
  switch (resourceType) {
    case ResourceType.PATIENT:
      return 'Patient'
    case ResourceType.ENCOUNTER:
      return 'Prise en charge'
    case ResourceType.CONDITION:
      return 'Fait - PMSI - Diagnostics'
    case ResourceType.PROCEDURE:
      return 'Fait - PMSI - Actes'
    case ResourceType.CLAIM:
      return 'Fait - PMSI - GHM'
    case ResourceType.DOCUMENTS:
      return 'Fait - Documents cliniques'
    case ResourceType.MEDICATION_REQUEST:
      return 'Fait - Médicaments - Prescription'
    case ResourceType.MEDICATION_ADMINISTRATION:
      return 'Fait - Médicaments - Administration'
    case ResourceType.OBSERVATION:
      return 'Fait - Biologie'
    case ResourceType.IMAGING:
      return 'imaging_study - imaging_series'
    case ResourceType.QUESTIONNAIRE_RESPONSE:
      return 'questionnaireresponse'
    default:
      return 'unknown'
  }
}
