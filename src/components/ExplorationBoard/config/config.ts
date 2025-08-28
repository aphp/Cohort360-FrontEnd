import { DisplayOptions, ExplorationConfig, Patient } from 'types/exploration'
import { ResourceType } from 'types/requestCriterias'
import {
  BiologyFilters,
  DocumentsFilters,
  ImagingFilters,
  MaternityFormFilters,
  MedicationFilters,
  PatientsFilters,
  PMSIFilters
} from 'types/searchCriterias'
import { patientsConfig } from './patient'
import { documentsConfig } from './documents'
import { biologyConfig } from './biology'
import { formsConfig } from './forms'
import { imagingConfig } from './imaging'
import { claimConfig, conditionConfig, procedureConfig } from './pmsi'
import { medicationAdministrationConfig, medicationRequestConfig } from './medication'

type ResourceFilterMap = {
  [ResourceType.PATIENT]: PatientsFilters
  [ResourceType.OBSERVATION]: BiologyFilters
  [ResourceType.CONDITION]: PMSIFilters
  [ResourceType.CLAIM]: PMSIFilters
  [ResourceType.DOCUMENTS]: DocumentsFilters
  [ResourceType.IMAGING]: ImagingFilters
  [ResourceType.PROCEDURE]: PMSIFilters
  [ResourceType.MEDICATION_ADMINISTRATION]: MedicationFilters
  [ResourceType.MEDICATION_REQUEST]: MedicationFilters
  [ResourceType.QUESTIONNAIRE_RESPONSE]: MaternityFormFilters
}

export type ExplorationResourceType = keyof ResourceFilterMap

export type ExplorationConfigFor<T extends keyof ResourceFilterMap> = ExplorationConfig<ResourceFilterMap[T]>

export const buildExplorationConfig = (deidentified: boolean, patient: Patient | null, groupId: string[]) => {
  const configMap = {
    [ResourceType.PATIENT]: patientsConfig,
    [ResourceType.OBSERVATION]: biologyConfig,
    [ResourceType.CONDITION]: conditionConfig,
    [ResourceType.CLAIM]: claimConfig,
    [ResourceType.DOCUMENTS]: documentsConfig,
    [ResourceType.IMAGING]: imagingConfig,
    [ResourceType.PROCEDURE]: procedureConfig,
    [ResourceType.MEDICATION_ADMINISTRATION]: medicationAdministrationConfig,
    [ResourceType.MEDICATION_REQUEST]: medicationRequestConfig,
    [ResourceType.QUESTIONNAIRE_RESPONSE]: formsConfig
  } as const

  return {
    get: <T extends ExplorationResourceType>(
      type: T,
      displayOptions?: DisplayOptions,
      search?: string
    ): ExplorationConfigFor<T> | null => {
      const configFn = configMap[type as keyof typeof configMap]
      return (configFn?.(deidentified, patient, groupId, displayOptions, search) as ExplorationConfigFor<T>) ?? null
    }
  }
}
